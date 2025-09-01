import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import AdminPanel from './components/AdminPanel';
import ChatHistory from './components/ChatHistory';
import ChatInput from './components/ChatInput';
import LoginForm from './components/LoginForm';
import { Message, KnowledgeBase } from './types';
import { TextProcessor } from './utils/textProcessor';
import { useAuth } from './contexts/AuthContext';

// Sample data for demonstration
const SAMPLE_DATA = `Company Name: TechNova Solutions Pvt. Ltd.
Founded: 2016
Headquarters: Bengaluru, India
CEO: Arjun Mehra
Employees: 350+
Revenue (2024): $75 Million

About the Company:
TechNova Solutions Pvt. Ltd. is a fast-growing IT services and product development company
specializing in cloud computing, artificial intelligence, and enterprise software solutions.
The company serves clients in over 12 countries, including the United States, United Kingdom,
Germany, and Australia.

Mission:
To empower businesses with innovative technology solutions that enhance efficiency, security,
and scalability.

Vision:
To become a global leader in next-generation IT services and digital transformation.

Core Values:
1. Innovation
2. Integrity
3. Customer-Centricity
4. Collaboration
5. Sustainability

Key Services:
- Cloud Infrastructure Management
- AI-Powered Business Analytics
- Custom Enterprise Software Development
- Cybersecurity Consulting
- Mobile & Web App Development
- IT Outsourcing and Managed Services

Products:
1. NovaCRM – A cloud-based CRM platform tailored for SMEs.
2. InsightAI – An AI-powered analytics engine for predictive insights.
3. SecureEdge – A cybersecurity suite for enterprises.
4. EduNova – An e-learning management system for universities and colleges.

Major Clients:
- GlobalMart Retail (USA)
- Medilife Healthcare (UK)
- AutoTech Manufacturing (Germany)
- EduWorld International (Australia)

Recent Achievements:
- Awarded "Best Cloud Service Provider" at the Indian Tech Awards 2023.
- Expanded operations with a new R&D center in Pune, India.
- Partnered with Microsoft Azure and AWS for advanced cloud services.
- Launched NovaCSR initiative to support rural education and digital literacy.

Departments:
1. Research & Development (R&D)
2. Software Engineering
3. Cloud Operations
4. AI & Data Science
5. Cybersecurity
6. Sales & Marketing
7. Human Resources
8. Finance & Legal

Contact Information:
Bengaluru, Karnataka - 560066
Email: contact@technovasolutions.com`;

function App() {
  const { user, isLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [textProcessor] = useState(() => new TextProcessor());
  const [answerMode, setAnswerMode] = useState<'short' | 'detailed'>('short');

  // Load knowledge base from localStorage
  useEffect(() => {
    const savedKnowledgeBase = localStorage.getItem('globalKnowledgeBase');
    if (savedKnowledgeBase) {
      try {
        const parsedKB = JSON.parse(savedKnowledgeBase);
        const kb: KnowledgeBase = {
          ...parsedKB,
          uploadDate: new Date(parsedKB.uploadDate)
        };
        setKnowledgeBase(kb);
      } catch (error) {
        console.error('Error loading knowledge base:', error);
        // Load sample data if no saved knowledge base
        loadSampleData();
      }
    } else {
      // Load sample data if no saved knowledge base
      loadSampleData();
    }
  }, [textProcessor]);

  // Load welcome message when user logs in
  useEffect(() => {
    if (user && knowledgeBase) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: user.role === 'admin' 
          ? `Welcome Admin! 🛡️\n\nYou can now choose your answer style. Select "Short" for quick facts or "Detailed" for more comprehensive information.\n\nCurrent knowledge base: "${knowledgeBase.filename}"`
          : `Welcome! 🎉\n\nYou can now get answers in two styles:\n• **Short**: For quick, direct answers.\n• **Detailed**: For more in-depth information.\n\nSelect your preferred style below the chat box. I'm ready to answer your questions based on "${knowledgeBase.filename}"!`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [user, knowledgeBase]);

  const loadSampleData = useCallback(() => {
    const sampleKnowledgeBase: KnowledgeBase = {
      filename: 'TechNova_Solutions_Info.txt',
      content: SAMPLE_DATA,
      uploadDate: new Date(),
      chunks: textProcessor.processText(SAMPLE_DATA)
    };
    setKnowledgeBase(sampleKnowledgeBase);
    localStorage.setItem('globalKnowledgeBase', JSON.stringify(sampleKnowledgeBase));
  }, [textProcessor]);

  const handleFileUpload = useCallback((newKnowledgeBase: KnowledgeBase) => {
    const chunks = textProcessor.processText(newKnowledgeBase.content);
    const updatedKnowledgeBase = {
      ...newKnowledgeBase,
      chunks
    };
    setKnowledgeBase(updatedKnowledgeBase);
    
    // Save to localStorage for all users
    localStorage.setItem('globalKnowledgeBase', JSON.stringify(updatedKnowledgeBase));
    
    // Clear existing messages and add confirmation
    const confirmMessage: Message = {
      id: Date.now().toString(),
      content: `Knowledge base updated successfully! ✅\n\nFile: "${newKnowledgeBase.filename}"\nProcessed into ${chunks.length} searchable chunks.\n\nThis knowledge base is now available to all users.`,
      isUser: false,
      timestamp: new Date()
    };
    setMessages([confirmMessage]);
  }, [textProcessor]);

  const handleRemoveFile = useCallback(() => {
    setKnowledgeBase(null);
    setMessages([]);
    localStorage.removeItem('globalKnowledgeBase');
  }, []);

  const handleSendMessage = useCallback((content: string) => {
    if (!knowledgeBase) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Process the query and generate response
    setTimeout(() => {
      const relevantChunks = textProcessor.searchChunks(content, knowledgeBase.chunks);
      const response = textProcessor.generateResponse(content, relevantChunks, answerMode);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    }, 500);
  }, [knowledgeBase, textProcessor, answerMode]);

  const handleClearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const handleExportChat = useCallback(() => {
    const chatText = messages
      .map(msg => `[${msg.timestamp.toLocaleString()}] ${msg.isUser ? 'You' : 'AI'}: ${msg.content}`)
      .join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [messages]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-zinc-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex flex-col transition-colors duration-300">
      <Header 
        messages={messages}
        onClearChat={handleClearChat}
        onExportChat={handleExportChat}
      />
      
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <div className="p-6">
          {user.role === 'admin' && (
            <AdminPanel
              onFileUpload={handleFileUpload}
              knowledgeBase={knowledgeBase}
              onRemoveFile={handleRemoveFile}
            />
          )}
          
          {user.role === 'user' && knowledgeBase && (
            <div className="bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 mb-6 transition-colors duration-300">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">Knowledge Base Active</span>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Current file: <strong>{knowledgeBase.filename}</strong> • Select answer style below
              </p>
            </div>
          )}
        </div>
        
        <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 mx-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-6 transition-colors duration-300">
          <ChatHistory messages={messages} />
          <ChatInput 
            onSendMessage={handleSendMessage}
            disabled={!knowledgeBase}
            answerMode={answerMode}
            onAnswerModeChange={setAnswerMode}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
