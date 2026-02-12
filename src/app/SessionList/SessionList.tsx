//===src/app/SessionList/SessionList.tsx

import React from 'react';
import { Session } from '@/lib/types';
import SessionItem from './SessionItem';
import NewSessionButton from './NewSessionButton';

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
      <div className="p-4 border-b border-gray-200">
        <NewSessionButton onClick={onNewSession} />
      </div>
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
        v0.1.1 무한 캔버스
      </div>
    </div>
  );
}
