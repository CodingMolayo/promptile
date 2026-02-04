//===src/app/BlockBoard/BlockActionMenu.tsx

import React from 'react';
import { Eye, Edit, ArrowRight } from 'lucide-react';

interface BlockActionMenuProps {
  onView: () => void;
  onEdit: () => void;
  onContinue: () => void;
}

export default function BlockActionMenu({ onView, onEdit, onContinue }: BlockActionMenuProps) {
  return (
    <div 
      className="flex gap-2 pt-3 border-t border-gray-100"
      // Prevent tap events from bubbling up to the parent BlockCard's onTap handler
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        onClick={onView}
        className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-xs"
      >
        <Eye size={14} /> 더 보기
      </button>
      <button
        onClick={onEdit}
        className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-xs"
      >
        <Edit size={14} /> 수정
      </button>
      <button
        onClick={onContinue}
        className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors text-xs"
      >
        <ArrowRight size={14} /> 이어가기
      </button>
    </div>
  );
}