//===src/app/BlockModal/BlockModal.tsx

'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Block, ModalMode } from '@/lib/types';
import BlockDetailView from './BlockDetailView';
import BlockEditForm from './BlockEditForm';
import BlockContinueForm from './BlockContinueForm';

interface BlockModalProps {
  mode: ModalMode;
  block: Block | null;
  onClose: () => void;
  onSubmit: (question: string) => void;
  onUpdate: (blockId: string, question: string) => void;
}

export default function BlockModal({ mode, block, onClose, onSubmit, onUpdate }: BlockModalProps) {
  // 상세 보기 도중 '이어가기'를 눌렀을 때 모달 내부 상태를 전환하기 위한 로컬 상태
  const [currentMode, setCurrentMode] = useState<ModalMode>(mode);

  // '이 질문 이어나가기' 클릭 시 호출될 함수
  const handleContinue = () => {
    setCurrentMode('continue');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800">
            {currentMode === 'view' ? 'Block Details' : currentMode === 'edit' ? 'Edit Question' : 'Continue Reasoning'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-0 overflow-y-auto flex-1">
          {currentMode === 'view' && block && (
            <BlockDetailView 
              block={block} 
              onClose={onClose} 
              onContinue={handleContinue} // 상세 뷰에서 '이어가기'를 누르면 모드를 바꿈
            />
          )}
          
          {currentMode === 'edit' && block && (
            <div className="p-6">
              <BlockEditForm block={block} onUpdate={onUpdate} onClose={onClose} />
            </div>
          )}
          
          {currentMode === 'continue' && (
            <div className="p-6">
              <BlockContinueForm parentBlock={block} onSubmit={onSubmit} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}