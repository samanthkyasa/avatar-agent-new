import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import LiveKitWidget from "@/components/ai_avatar/LiveKitWidget";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Wifi, 
  Car, 
  Utensils, 
  Waves, 
  Dumbbell,
  Crown,
  Calendar,
  Users,
  Star,
  ArrowRight,
  ChefHat,
  Coffee,
  MessageCircle
} from "lucide-react";

// Import images
import heroImage from "@/assets/hero-hotel.jpg";
import suiteImage from "@/assets/suite-room.jpg";
import diningImage from "@/assets/dining-restaurant.jpg";
import meetingImage from "@/assets/meeting-room.jpg";
import spaImage from "@/assets/spa-amenities.jpg";
import loungeImage from "@/assets/lounge-area.jpg";

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tekisho.ai
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {[
                { id: "home", label: "Home" },
                { id: "solutions", label: "AI Solutions" },
                { id: "services", label: "Services" },
                { id: "about", label: "About" },
                { id: "technology", label: "Technology" },
                { id: "contact", label: "Contact" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm font-medium transition-colors hover:text-accent ${
                    activeSection === item.id ? "text-accent" : "text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <Button variant="luxury" size="sm" onClick={() => navigate('/booking')}>Book Now</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        
        <div className={`relative z-10 text-center text-white px-6 max-w-4xl mx-auto ${
          isVisible ? "animate-fade-in" : "opacity-0"
        }`}>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Transforming Business with 
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Innovation
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Empowering enterprises with cutting-edge artificial intelligence solutions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" onClick={() => scrollToSection("solutions")}>
              Explore Solutions <ArrowRight className="ml-2" />
            </Button>
            <Button variant="luxury" size="xl">
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* AI Solutions */}
      <section id="solutions" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">AI Solutions</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our comprehensive suite of AI-powered solutions designed for modern enterprises
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "AI-Powered Analytics",
                price: "Enterprise",
                image: suiteImage,
                features: ["Real-time Insights", "Predictive Analytics", "Custom Dashboards", "Advanced Reporting"]
              },
              {
                title: "Intelligent Automation",
                price: "Professional",
                image: loungeImage,
                features: ["Process Optimization", "Workflow Automation", "Smart Integration", "Efficiency Boost"]
              },
              {
                title: "AI Concierge Platform",
                price: "Premium",
                image: suiteImage,
                features: ["24/7 AI Assistant", "Natural Language Processing", "Multi-channel Support", "Personalized Experience"]
              }
            ].map((solution, index) => (
              <Card key={index} className="overflow-hidden shadow-luxury hover:shadow-hover transition-all duration-300 animate-scale-in group">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={solution.image} 
                    alt={solution.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {solution.price}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-3">{solution.title}</h3>
                  <ul className="space-y-2 mb-6">
                    {solution.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-muted-foreground">
                        <Star className="h-4 w-4 text-blue-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button variant="elegant" className="w-full" onClick={() => navigate('/booking')}>
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive AI services designed to transform your business operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-in-left">
              {[
                { icon: MessageCircle, title: "AI Consulting", desc: "Strategic AI implementation and digital transformation guidance", link: null },
                { icon: Dumbbell, title: "Machine Learning", desc: "Custom ML models and algorithms for your specific needs", link: null },
                { icon: Wifi, title: "Cloud Integration", desc: "Seamless cloud-based AI solutions and infrastructure", link: null },
                { icon: Car, title: "Data Analytics", desc: "Advanced data processing and business intelligence services", link: null }
              ].map((service, index) => (
                <div 
                  key={index} 
                  className={`flex items-start space-x-4 ${service.link ? 'cursor-pointer hover:bg-muted/50 p-4 rounded-lg transition-colors' : 'p-4'}`}
                  onClick={() => service.link && navigate(service.link)}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <service.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                    <p className="text-muted-foreground">{service.desc}</p>
                    {service.link && (
                      <p className="text-sm text-primary mt-2 hover:underline">Learn more →</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="animate-scale-in">
              <img 
                src={spaImage} 
                alt="AI Services"
                className="w-full h-96 object-cover rounded-lg shadow-luxury"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Technology */}
      <section id="technology" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Cutting-Edge Technology</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Leveraging the latest AI technologies to deliver exceptional results
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <Card className="overflow-hidden shadow-luxury animate-scale-in">
              <div className="relative h-64">
                <img 
                  src={diningImage} 
                  alt="AI Technology Platform"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <MessageCircle className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="text-2xl font-bold">AI Platform</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Advanced AI platform with machine learning capabilities and real-time processing
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Available 24/7</span>
                  <Button variant="luxury" size="sm">Explore Platform</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden shadow-luxury animate-scale-in">
              <div className="relative h-64">
                <img 
                  src={loungeImage} 
                  alt="AI Development Tools"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <Coffee className="h-5 w-5 text-purple-500 mr-2" />
                  <h3 className="text-2xl font-bold">AI Development</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Comprehensive development tools and APIs for building intelligent applications
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Developer Ready</span>
                  <Button variant="elegant" size="sm">View Documentation</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">About Tekisho.ai</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Leading the future of artificial intelligence with innovative solutions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "AI Innovation Lab",
                capacity: "50+ Researchers",
                image: meetingImage,
                features: ["Advanced AI Research", "Machine Learning Labs", "Innovation Center"]
              },
              {
                title: "Enterprise Solutions",
                capacity: "Global Reach",
                image: meetingImage,
                features: ["Custom AI Solutions", "Enterprise Integration", "24/7 Support"]
              },
              {
                title: "Future Technology",
                capacity: "Next-Gen AI",
                image: loungeImage,
                features: ["Quantum Computing", "Neural Networks", "Advanced Analytics"]
              }
            ].map((feature, index) => (
              <Card key={index} className="overflow-hidden shadow-luxury hover:shadow-hover transition-all duration-300 animate-scale-in">
                <div className="relative h-48">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <div className="flex items-center text-blue-500">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="text-sm">{feature.capacity}</span>
                    </div>
                  </div>
                  <ul className="space-y-1 mb-6 text-sm text-muted-foreground">
                    {feature.features.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                  <Button variant="elegant" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ready to transform your business with AI? Let's get started
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8 animate-slide-in-left">
              <div>
                <h3 className="text-2xl font-bold mb-6">Get in Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-muted-foreground">123 AI Innovation Drive, Tech District</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-muted-foreground">+1 (555) AI-TEKISHO</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">hello@tekisho.ai</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Card className="shadow-luxury animate-scale-in">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
                <form className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input placeholder="First Name" />
                    <Input placeholder="Last Name" />
                  </div>
                  <Input placeholder="Email Address" type="email" />
                  <Input placeholder="Phone Number" type="tel" />
                  <Textarea placeholder="How can we assist you?" rows={4} />
                  <Button variant="luxury" size="lg" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Tekisho.ai
              </h3>
              <p className="text-primary-foreground/80">
                Transforming businesses with cutting-edge artificial intelligence solutions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><a href="#solutions" className="hover:text-accent transition-colors">AI Solutions</a></li>
                <li><a href="#services" className="hover:text-accent transition-colors">Services</a></li>
                <li><a href="#technology" className="hover:text-accent transition-colors">Technology</a></li>
                <li><a href="#about" className="hover:text-accent transition-colors">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">AI Services</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>Machine Learning</li>
                <li>Data Analytics</li>
                <li>AI Consulting</li>
                <li>Cloud Integration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-primary-foreground/80">
                <p>123 AI Innovation Drive</p>
                <p>+1 (555) AI-TEKISHO</p>
                <p>hello@tekisho.ai</p>
              </div>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
            <p>&copy; 2024 Tekisho.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating AI Concierge Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          variant="luxury" 
          size="lg"
          className="rounded-full shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          onClick={() => setShowSupport(true)}
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">Talk to AI Assistant</span>
        </Button>
      </div>
      {/* LiveKit Widget */}
      {showSupport && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-6 pointer-events-none">
          <div className="pointer-events-auto">
            <LiveKitWidget setShowSupport={setShowSupport} />
          </div>
        </div>
      )}

    </div>
  );
};

export default Index;