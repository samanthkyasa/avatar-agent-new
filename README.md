This is the complete setup of avatar agent with mongo db connection and implementing with RAG. Before executing the website folder we need to have this node modules which is from livekit and the command is:
npm i
npm install @livekit/components-react @livekit/components-styles livekit-client --save
and in the website folder we need to add the .env file in that we need to mention the livekit URL.

commands to setup frontend
>>cd website
>>npm run dev

commands to setup backend
>>cd backend
>>python server.py

commands to setup avatar
>>cd backend
>>python agent.py dev

create a virtual env in the backend and install the requirements.txt, here are the requirements for the .env
LIVEKIT_URL=your_api_key
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_key
OPENAI_API_KEY=your_api_key
TAVUS_API_KEY=your_api_key
TAVUS_PERSONA_ID=your_api_key
TAVUS_REPLICA_ID=your_api_key
MONGO_URI=mongodb_url
MONGO_DB_NAME=db_name
MONGO_COLLECTION=collection_name
PINECONE_API_KEY=your_api_key
PINECONE_INDEX_NAME=your_api_key
PINECONE_ENV=your_api_key
GROQ_API_KEY=your_api_key

for .env present in the website
LIVEKIT_URL=your_api_key

