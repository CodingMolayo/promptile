//===src/hooks/useSession.ts

import { useState, useEffect } from 'react';
import { Session } from '@/lib/types';
import { storage } from '@/lib/storage';

export function useSession() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // 초기 로드
  useEffect(() => {
    const saved = storage.loadSessions();
    if (saved.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSessions(saved);
      setCurrentSessionId(saved[0].id);
    } else {
      const defaultSession = { id: '1', title: 'New Conversation', createdAt: new Date() };
       
      setSessions([defaultSession]);
      setCurrentSessionId('1');
      storage.saveSessions([defaultSession]);
    }
  }, []);

  // 세션 생성
  const createSession = () => {
    const newSession = { id: Date.now().toString(), title: `New Session`, createdAt: new Date() };
    const updated = [newSession, ...sessions]; // 새 세션을 맨 위로
    setSessions(updated);
    setCurrentSessionId(newSession.id);
    storage.saveSessions(updated);
    return newSession.id;
  };

  // 세션 제목 수정
  const updateSessionTitle = (id: string, newTitle: string) => {
    const updated = sessions.map(s => s.id === id ? { ...s, title: newTitle } : s);
    setSessions(updated);
    storage.saveSessions(updated);
  };

  // 세션 삭제 (New!)
  const deleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    storage.saveSessions(updated);

    // 만약 현재 보고 있던 세션을 삭제했다면?
    if (currentSessionId === id) {
      if (updated.length > 0) {
        setCurrentSessionId(updated[0].id); // 남은 것 중 첫 번째 선택
      } else {
        // 다 지워서 하나도 없으면 새거 하나 생성
        const newSession = { id: Date.now().toString(), title: 'New Conversation', createdAt: new Date() };
        setSessions([newSession]);
        setCurrentSessionId(newSession.id);
        storage.saveSessions([newSession]);
      }
    }
  };

  return { 
    sessions, 
    currentSessionId, 
    setCurrentSessionId, 
    createSession, 
    updateSessionTitle,
    deleteSession 
  };
}