import React from 'react';
import { Plus } from 'lucide-react'; // NewSessionButton에서 사용하던 아이콘 임포트
import { Session } from '@/lib/types';
import SessionItem from './SessionItem';

interface SessionListProps {
  sessions: Session[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onUpdateTitle: (id: string, title: string) => void;
  onDeleteSession: (id: string) => void;
}

export default function SessionList({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewSession,
  onUpdateTitle,
  onDeleteSession
}: SessionListProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0">
      
      {/* 1. 서비스 이름 영역 (기존 버튼 위치) */}
      <div className="p-5 pb-2 flex justify-end">
        <h1 className="text-2xl font-bold text-blue-600 tracking-tight">
          Promptile
        </h1>
      </div>

      {/* 2. New Session 버튼 영역 (한 칸 아래로 이동 및 통합) */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Make new Tiles</span>
        </button>
      </div>

      {/* 3. 세션 리스트 영역 */}
      <div className="flex-1 overflow-y-auto">
        {sessions.map(session => (
          <SessionItem
            key={session.id}
            session={session}
            isActive={session.id === currentSessionId}
            onSelect={onSelectSession}
            onUpdateTitle={onUpdateTitle}
            onDelete={onDeleteSession}
          />
        ))}
      </div>
      
      {/* Version Info */}
      <div className="mt-auto p-4 text-center text-xs text-gray-500">
        v0.2.1 Add Keywords
      </div>
    </div>
  );
}