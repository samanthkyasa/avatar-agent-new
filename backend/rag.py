import os
import json
import logging
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
from tqdm import tqdm
from openai import OpenAI
from pymongo import MongoClient

# ========== CONFIG ==========
load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

INDEX_NAME = "tekisho-rag-openai-v1"  # New index for OpenAI embeddings
EMBED_MODEL = "text-embedding-3-small"  # Best OpenAI embedding model
EMBED_DIM = 1536  # Full dimensionality for text-embedding-3-small
DOCS_DIR = "Rag_docs"

# Chunking parameters
MAX_CHUNK_LENGTH = 400
CHUNK_OVERLAP = 50

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TekishoRAG")

# ========== INITIALIZE ==========
logger.info("Initializing Pinecone and OpenAI clients...")

pc = Pinecone(api_key=PINECONE_API_KEY)
if INDEX_NAME not in pc.list_indexes().names():
    logger.info(f"Creating index '{INDEX_NAME}' in Pinecone...")
    pc.create_index(
        name=INDEX_NAME,
        dimension=EMBED_DIM,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )

index = pc.Index(INDEX_NAME)
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# ========== HELPER FUNCTIONS ==========

def chunk_text(text: str, max_length: int = MAX_CHUNK_LENGTH, overlap: int = CHUNK_OVERLAP):
    """Split text into chunks based on character count."""
    max_chars = max_length * 4
    overlap_chars = overlap * 4
    
    if len(text) <= max_chars:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + max_chars
        
        if end < len(text):
            last_period = text.rfind('.', start, end)
            last_newline = text.rfind('\n', start, end)
            last_break = max(last_period, last_newline)
            
            if last_break > start + (max_chars // 2):
                end = last_break + 1
            else:
                last_space = text.rfind(' ', start, end)
                if last_space > start:
                    end = last_space
        
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        
        start = end - overlap_chars if end < len(text) else end
    
    return chunks


def get_openai_embedding(text: str):
    """Get embeddings from OpenAI API."""
    try:
        # OpenAI's embedding API is simpler - no need for input_type parameter
        response = openai_client.embeddings.create(
            input=text,
            model=EMBED_MODEL,
            encoding_format="float"
        )
        
        emb = response.data[0].embedding
        
        # Verify embedding dimension
        if len(emb) != EMBED_DIM:
            logger.warning(f"Expected {EMBED_DIM} dimensions, got {len(emb)}")
            emb = (emb + [0.0] * EMBED_DIM)[:EMBED_DIM]
        
        # Safety check for zero vectors
        if all(v == 0.0 for v in emb):
            raise Exception("Received zero vector from OpenAI")
        
        return emb
    
    except Exception as e:
        logger.error(f"OpenAI embedding failed: {str(e)}")
        return None


def load_and_upsert_documents():
    """Load JSON files, chunk them, and upsert to Pinecone."""
    if not os.path.exists(DOCS_DIR):
        logger.warning(f"Documents folder '{DOCS_DIR}' not found.")
        return

    all_chunks = []
    
    for file in os.listdir(DOCS_DIR):
        if file.endswith(".json"):
            path = os.path.join(DOCS_DIR, file)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = json.load(f)
                    doc_text = json.dumps(content, ensure_ascii=False)
                    
                    chunks = chunk_text(doc_text)
                    logger.info(f"Split {file} into {len(chunks)} chunks")
                    
                    # Determine document type for better routing
                    doc_type = "services" if "services" in file.lower() else "use_cases"
                    
                    for i, chunk in enumerate(chunks):
                        all_chunks.append({
                            "text": chunk,
                            "source": file,
                            "doc_type": doc_type,
                            "chunk_id": i,
                            "total_chunks": len(chunks)
                        })
                        
            except Exception as e:
                logger.warning(f"Failed to load {file}: {e}")

    if not all_chunks:
        logger.warning("No valid documents found.")
        return

    logger.info(f"Total chunks to embed: {len(all_chunks)}")
    
    vectors = []
    for idx, chunk_data in enumerate(tqdm(all_chunks, desc="Embedding chunks")):
        emb = get_openai_embedding(chunk_data["text"])
        if emb is None:
            continue
            
        vectors.append({
            "id": f"chunk-{idx}",
            "values": emb,
            "metadata": {
                "source": chunk_data["source"],
                "doc_type": chunk_data["doc_type"],
                "chunk_id": chunk_data["chunk_id"],
                "total_chunks": chunk_data["total_chunks"],
                "text": chunk_data["text"][:1000]  # Store more text for context
            }
        })

    if vectors:
        try:
            logger.info(f"Upserting {len(vectors)} chunks...")
            batch_size = 100
            for i in range(0, len(vectors), batch_size):
                batch = vectors[i:i + batch_size]
                index.upsert(vectors=batch)
            logger.info("Upsert completed successfully.")
        except Exception as e:
            logger.error(f"Upsert failed: {e}")


def query_rag(query: str, top_k: int = 15, doc_type_filter: str = None):
    """Query RAG index and retrieve top-k chunks with optional filtering."""
    emb = get_openai_embedding(query)
    if emb is None:
        return []

    try:
        # Build filter if doc_type specified
        filter_dict = {"doc_type": {"$eq": doc_type_filter}} if doc_type_filter else None
        
        results = index.query(
            vector=emb, 
            top_k=top_k, 
            include_metadata=True,
            filter=filter_dict
        )
        hits = results.get("matches", [])
        
        return [{
            "source": hit["metadata"]["source"],
            "doc_type": hit["metadata"]["doc_type"],
            "chunk_id": hit["metadata"]["chunk_id"],
            "score": hit["score"],
            "text": hit["metadata"].get("text", "")
        } for hit in hits]
    except Exception as e:
        logger.error(f"Query failed: {e}")
        return []


def generate_conversational_response(query: str, context: str, response_type: str = "general"):
    """Generate natural conversational response using OpenAI."""
    
    if response_type == "services":
        system_prompt = """You are a knowledgeable AI assistant for Tekisho Infotech, an AI/ML solutions company.

Your role: Provide comprehensive, conversational responses about Tekisho's services and capabilities.

Guidelines:
- Be warm, professional, and enthusiastic
- When listing services, mention ALL relevant services found in the context
- Highlight key capabilities, technologies, and benefits
- Use specific examples and details from the context
- Keep responses conversational but informative (3-5 sentences)
- Sound natural for a voice avatar speaking to a potential client
- Never say "I don't know" - always provide helpful information from context or speak generally about AI/ML capabilities"""

    elif response_type == "use_cases":
        system_prompt = """You are a business-focused AI assistant for Tekisho Infotech.

Your role: Present use cases with REAL METRICS and business impact in a natural, conversational way.

CRITICAL: When discussing use cases, you MUST include:
- Specific ROI percentages (e.g., "180-260% ROI")
- Cost savings percentages (e.g., "25-35% cost reduction")
- Productivity improvements (e.g., "50-70% productivity boost")
- Implementation timelines (e.g., "6-8 weeks")
- Revenue impacts when mentioned

Guidelines:
- Sound like a knowledgeable sales consultant, not a robot
- Use natural transitions: "Let me tell you about...", "Here's what we've achieved..."
- Present metrics naturally: "Our clients typically see around 180 to 260 percent ROI within just 6 to 8 weeks"
- Connect solutions to business pain points
- End with a soft call-to-action when appropriate
- Never say "according to the context" - speak as if you know this firsthand"""

    else:  # general
        system_prompt = """You are a helpful AI assistant for Tekisho Infotech.

Your role: Provide accurate, conversational responses about Tekisho's capabilities.

Guidelines:
- Be warm, professional, and helpful
- Speak naturally as if having a conversation
- Use information from context when available
- If context is limited, speak generally about AI/ML solutions and capabilities
- Never say "I don't have information" - always be helpful
- Keep responses concise but informative (2-4 sentences)
- Sound natural for a voice avatar"""

    user_prompt = f"""Question: {query}

Context from Tekisho's documentation:
{context}

Provide a natural, conversational response suitable for a voice avatar. Be specific with numbers and metrics when they're in the context."""

    try:
        completion = openai_client.chat.completions.create(
            model="gpt-4o-mini",  # Best balance of quality and cost
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=600,
            top_p=0.9
        )
        
        return completion.choices[0].message.content
        
    except Exception as e:
        logger.error(f"OpenAI LLM generation failed: {e}")
        return "I'd be happy to discuss Tekisho's AI solutions with you. Could you tell me more about what specific challenges you're facing?"


def get_tekisho_solutions(challenge: str, industry: str = None) -> str:
    """
    Main function called by agent to get solutions for client challenges.
    Intelligently routes to services or use cases based on query.
    """
    logger.info(f"Getting solutions for challenge: {challenge}, industry: {industry}")
    
    # Enhance query with industry context
    enhanced_query = f"{challenge} in {industry} industry" if industry else challenge
    
    # Determine query intent (services vs use cases)
    query_lower = enhanced_query.lower()
    is_use_case_query = any(word in query_lower for word in 
                            ["roi", "cost saving", "case study", "example", "productivity", 
                             "revenue", "impact", "results", "implementation"])
    
    # Retrieve relevant chunks with smart filtering
    if is_use_case_query:
        # Prioritize use cases but also get some services
        use_case_chunks = query_rag(enhanced_query, top_k=10, doc_type_filter="use_cases")
        service_chunks = query_rag(enhanced_query, top_k=5, doc_type_filter="services")
        all_chunks = use_case_chunks + service_chunks
        response_type = "use_cases"
    else:
        # Prioritize services but also get some use cases
        service_chunks = query_rag(enhanced_query, top_k=10, doc_type_filter="services")
        use_case_chunks = query_rag(enhanced_query, top_k=5, doc_type_filter="use_cases")
        all_chunks = service_chunks + use_case_chunks
        response_type = "services"
    
    if not all_chunks:
        # Fallback: General query without filtering
        all_chunks = query_rag(enhanced_query, top_k=15)
        response_type = "general"
    
    # Build context from chunks
    context = "\n\n".join([f"[{chunk['doc_type'].upper()}] {chunk['text']}" 
                          for chunk in all_chunks[:15]])  # Limit to top 15
    
    if not context.strip():
        # No relevant info found - provide general helpful response
        return ("I'd love to help you with that challenge. While I don't have specific details right now, "
                "Tekisho specializes in custom AI and automation solutions that can significantly reduce costs "
                "and improve efficiency. Would you like me to connect you with one of our solution architects "
                "who can discuss your specific needs in detail?")
    
    # Generate conversational response
    response = generate_conversational_response(enhanced_query, context, response_type)
    return response


def get_personalized_greeting(name: str, company: str, mongo_uri: str) -> str:
    """
    Generate personalized greeting using company research from MongoDB + RAG.
    """
    logger.info(f"Generating greeting for {name} from {company}")
    
    # Check MongoDB for existing research
    company_context = ""
    try:
        client = MongoClient(mongo_uri)
        db = client[os.getenv("MONGO_DB_NAME", "tekisho_db")]
        collection = db[os.getenv("MONGO_COLLECTION", "clients")]
        
        company_doc = collection.find_one({"company": company})
        if company_doc:
            if company_doc.get("company_summary"):
                company_context = f"Company Summary: {company_doc['company_summary']}"
            elif company_doc.get("research_about_company"):
                company_context = f"Research: {company_doc['research_about_company']}"
    except Exception as e:
        logger.error(f"MongoDB query failed: {e}")
    
    # Search for relevant industry solutions
    industry_query = f"{company} industry solutions challenges"
    relevant_chunks = query_rag(industry_query, top_k=5)
    
    rag_context = "\n".join([chunk['text'][:200] for chunk in relevant_chunks[:3]]) if relevant_chunks else ""
    
    # Generate personalized greeting
    system_prompt = """You are a warm, professional AI greeter for Tekisho Infotech.

Create a personalized, conversational greeting that:
- Warmly welcomes the person by name
- Shows awareness of their company (if context available)
- Briefly mentions how Tekisho can help (based on industry context if available)
- Asks an open-ended question to understand their needs
- Sounds natural and friendly, not scripted
- Keep it SHORT (2-3 sentences max)"""

    user_prompt = f"""Generate a greeting for:
Name: {name}
Company: {company}

Company Context: {company_context if company_context else 'No prior research available'}

Industry Insights: {rag_context if rag_context else 'General AI/ML capabilities'}

Create a warm, natural greeting."""

    try:
        completion = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.8,
            max_tokens=200
        )
        
        return completion.choices[0].message.content
        
    except Exception as e:
        logger.error(f"Greeting generation failed: {e}")
        return (f"Hi {name}! Great to connect with you from {company}. "
                f"I'm here to learn about your business challenges and show you how "
                f"Tekisho's AI solutions can help. What brings you here today?")


# ========== MAIN INGESTION ==========
if __name__ == "__main__":
    logger.info("Starting RAG ingestion with OpenAI embeddings...")
    load_and_upsert_documents()
    logger.info("RAG setup complete.")
    
    # Interactive testing
    print("\n" + "="*70)
    print("TEKISHO RAG - Conversational Assistant (OpenAI Powered)")
    print("="*70)
    print("Commands: 'services' (test services), 'usecase' (test use case), 'quit'")
    
    while True:
        print("\n" + "-"*70)
        test_query = input("\n🤖 Ask about Tekisho: ").strip()
        
        if test_query.lower() in ['quit', 'exit', 'q']:
            print("Goodbye! 👋")
            break
        
        if test_query.lower() == 'services':
            test_query = "What services does Tekisho offer?"
        elif test_query.lower() == 'usecase':
            test_query = "Tell me about invoice processing use case with ROI"
            
        if not test_query:
            continue
        
        print("\n🔍 Searching knowledge base...")
        response = get_tekisho_solutions(test_query)
        
        print("\n📢 AVATAR RESPONSE:")
        print("-"*70)
        print(response)
        print("-"*70)