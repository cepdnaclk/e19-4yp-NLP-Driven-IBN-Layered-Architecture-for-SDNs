import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Message, ChatSession, IntentMessage } from '../types/chat';

interface ChatContextType {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  createSession: () => void;
  switchSession: (sessionId: string) => void;
  addMessage: (role: Message['role'], content: string) => void;
  addIntentMessage: (content: string, intentData: IntentMessage['intentData']) => void;
  clearSession: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);

  const createSession = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: `New Chat ${sessions.length + 1}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setSessions((prevSessions) => [...prevSessions, newSession]);
    setCurrentSession(newSession);
  };

  const switchSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
    }
  };

  const addMessage = (role: Message['role'], content: string) => {
    if (!currentSession) return;

    const newMessage: Message = {
      id: uuidv4(),
      role,
      content,
      timestamp: new Date(),
    };

    setCurrentSession(prevSession => {
      if (!prevSession) return prevSession;
      
      const updatedSession = {
        ...prevSession,
        messages: [...prevSession.messages, newMessage],
        updatedAt: new Date(),
      };
      
      return updatedSession;
    });
    
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === currentSession.id ? {
          ...session,
          messages: [...session.messages, newMessage],
          updatedAt: new Date(),
        } : session
      )
    );
  };

  const addIntentMessage = (content: string, intentData: IntentMessage['intentData']) => {
    if (!currentSession) return;

    const newMessage: IntentMessage = {
      id: uuidv4(),
      role: 'intent',
      content,
      timestamp: new Date(),
      intentData,
    };

    setCurrentSession(prevSession => {
      if (!prevSession) return prevSession;
      
      const updatedSession = {
        ...prevSession,
        messages: [...prevSession.messages, newMessage],
        updatedAt: new Date(),
      };
      
      return updatedSession;
    });
    
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === currentSession.id ? {
          ...session,
          messages: [...session.messages, newMessage],
          updatedAt: new Date(),
        } : session
      )
    );
  };

  const clearSession = () => {
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      messages: [],
      updatedAt: new Date(),
    };

    setCurrentSession(updatedSession);
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === currentSession.id ? updatedSession : session
      )
    );
  };

  return (
    <ChatContext.Provider
      value={{
        currentSession,
        sessions,
        createSession,
        switchSession,
        addMessage,
        addIntentMessage,
        clearSession,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
