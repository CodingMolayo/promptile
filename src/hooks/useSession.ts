//===src/hooks/useSession.ts

import { useState, useEffect } from 'react';
import { Session, Block } from '@/lib/types';
import { storage } from '@/lib/storage';

export function useSession() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // ========================================
  // 기존 코드 (전혀 수정 안 함)
  // ========================================
  useEffect(() => {
    const saved = storage.loadSessions();
    if (saved.length > 0) {
      setSessions(saved);
      setCurrentSessionId(saved[0].id);
    } else {
      const defaultSession = { 
        id: '1', 
        title: '첫번째 캔버스', 
        createdAt: new Date() 
      };
      setSessions([defaultSession]);
      setCurrentSessionId('1');
      storage.saveSessions([defaultSession]);
    }
  }, []);

  const CANVAS_ADJECTIVES = [
    // 창의성
    '기발한', '신선한', '창의적인', '독창적인', '영감 넘치는',
    // 빛/색상
    '반짝이는', '빛나는', '선명한', '화사한', '영롱한',
    // 에너지
    '활기찬', '생동감 있는', '경쾌한', '유쾌한', '열정적인',
    // 평온
    '고요한', '평온한', '차분한', '편안한', '여유로운',
    // 추상
    '자유로운', '무한한', '열린', '넓은', '깊은'
  ];
  
  const getRandomCanvasTitle = () => {
    const adjective = CANVAS_ADJECTIVES[Math.floor(Math.random() * CANVAS_ADJECTIVES.length)];
    return `${adjective} 캔버스`;
  };
  
  // 사용
  const createSession = () => {  
    const newSession = { 
      id: Date.now().toString(), 
      title: getRandomCanvasTitle(), // 🆕
      createdAt: new Date() 
    };
  
    const updated = [newSession, ...sessions];
    setSessions(updated);
    setCurrentSessionId(newSession.id);
    storage.saveSessions(updated);
    return newSession.id;
  };

  const updateSessionTitle = (id: string, newTitle: string) => {
    const updated = sessions.map(s => s.id === id ? { ...s, title: newTitle } : s);
    setSessions(updated);
    storage.saveSessions(updated);
  };

  const deleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    storage.saveSessions(updated);
    
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
        storage.saveSessions([newSession]);
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
      storage.saveSessions(updated);
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
    storage.saveSessions(updated);
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