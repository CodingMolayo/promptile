//===src/hooks/useSession.ts

import { useState, useEffect } from 'react';
import { Session, Block } from '@/lib/types';
import { storage } from '@/lib/storage';

const getInitialSessions = () => {
  const saved = storage.loadSessions();
  if (saved.length > 0) {
    return saved;
  }
  const defaultSession = {
    id: '1',
    title: 'New Conversation',
    createdAt: new Date(),
  };
  storage.saveSessions([defaultSession]);
  return [defaultSession];
};

export function useSession() {
  const [sessions, setSessions] = useState<Session[]>(getInitialSessions);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => sessions.length > 0 ? sessions[0].id : null);

  useEffect(() => {
    storage.saveSessions(sessions);
  }, [sessions]);

  const createSession = () => {
    const newSession = { 
      id: Date.now().toString(), 
      title: `New Session`, 
      createdAt: new Date() 
    };
    const updated = [newSession, ...sessions];
    setSessions(updated);
    setCurrentSessionId(newSession.id);
    return newSession.id;
  };

  const updateSessionTitle = (id: string, newTitle: string) => {
    const updated = sessions.map(s => s.id === id ? { ...s, title: newTitle } : s);
    setSessions(updated);
  };

  const deleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    
    if (currentSessionId === id) {
      if (updated.length > 0) {
        setCurrentSessionId(updated[0].id);
      } else {
        const newSession = { 
          id: Date.now().toString(), 
          title: 'New Conversation', 
          createdAt: new Date() 
        };
        setSessions([newSession]);
        setCurrentSessionId(newSession.id);
      }
    }
  };

  // ========================================
  // 🆕 Keyword 기능 (새로 추가만)
  // ========================================
  
  /**
   * 키워드 생성 (최근 5개 블록 분석)
   */
  const generateKeywords = async (sessionId: string, blocks: Block[]) => {
    const sessionBlocks = blocks.filter(b => b.sessionId === sessionId);
    
    // 최근 5개만 분석
    const recentBlocks = sessionBlocks.slice(-5);
    if (recentBlocks.length < 3) return; // 최소 3개 필요
    
    try {
      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: recentBlocks })
      });

      const { keywords } = await response.json();

      // Session 업데이트
      const updated = sessions.map(s =>
        s.id === sessionId
          ? {
              ...s,
              keywords,
              keywordsUpdatedAt: new Date(),
              keywordsManual: false
            }
          : s
      );
      setSessions(updated);
    } catch (error) {
      console.error('Failed to generate keywords:', error);
    }
  };

  /**
   * 키워드 수동 업데이트
   */
  const updateKeywords = (sessionId: string, keywords: string[]) => {
    const updated = sessions.map(s =>
      s.id === sessionId
        ? {
            ...s,
            keywords,
            keywordsUpdatedAt: new Date(),
            keywordsManual: true
          }
        : s
    );
    setSessions(updated);
  };

  /**
   * 현재 세션 가져오기 (헬퍼)
   */
  const getCurrentSession = () => {
    return sessions.find(s => s.id === currentSessionId) || null;
  };

  return { 
    sessions, 
    currentSessionId, 
    setCurrentSessionId, 
    createSession, 
    updateSessionTitle,
    deleteSession,
    
    // 🆕 Keyword 함수
    generateKeywords,
    updateKeywords,
    getCurrentSession
  };
}