//===src/app/SessionList/SessionItem.tsx

import React, { useState } from 'react';
import { MessageSquare, Edit2, Check, Trash2 } from 'lucide-react';
import { Session } from '@/lib/types';

interface SessionItemProps {
  session: Session;
  isActive: boolean;
  onSelect: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export default function SessionItem({ session, isActive, onSelect, onUpdateTitle, onDelete }: SessionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(session.title);

  const handleUpdate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateTitle(session.id, tempTitle);
    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this session?')) {
      onDelete(session.id);
    }
  };

  return (
    <div
      onClick={() => onSelect(session.id)}
      className={`group w-full p-4 text-left border-b border-gray-100 cursor-pointer transition-colors ${
        isActive ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-between h-8">
        <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
          <MessageSquare size={18} className={`flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
          
          {isEditing ? (
            <input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="border rounded px-1 text-sm w-full h-7"
              autoFocus
            />
          ) : (
            <span className={`font-medium truncate text-sm ${isActive ? 'text-blue-600' : 'text-gray-700'}`}>
              {session.title}
            </span>
          )}
        </div>
        
        {/* Hover시에만 보이거나 활성화된 상태일 때 보이는 액션 버튼들 */}
        <div className={`flex items-center gap-1 ${isActive || isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
          {isEditing ? (
            <button onClick={handleUpdate} className="p-1 hover:bg-blue-100 rounded text-blue-600">
              <Check size={14} />
            </button>
          ) : (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-blue-600"
              >
                <Edit2 size={14} />
              </button>
              <button 
                onClick={handleDelete}
                className="p-1 hover:bg-red-100 rounded text-gray-500 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}