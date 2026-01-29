import React from 'react';
import { Block } from '@/lib/types';
import { MessageSquarePlus, X } from 'lucide-react'; // 아이콘 추가

interface BlockDetailViewProps {
  block: Block;
  onClose: () => void;
  onContinue?: (block: Block) => void; // Continue 함수 추가
}

export default function BlockDetailView({ block, onClose, onContinue }: BlockDetailViewProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold text-gray-900">Block Details</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Question</label>
          <p className="mt-2 text-gray-800 leading-relaxed font-medium">{block.question}</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-green-600 uppercase tracking-wider">Answer</label>
          <div className="mt-2 text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-100">
            {block.answer}
          </div>
        </div>
      </div>

      {/* 하단 버튼 영역 */}
      <div className="mt-8 flex gap-3">
        {onContinue && (
          <button
            onClick={() => onContinue(block)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <MessageSquarePlus size={18} />
            이 질문 이어나가기
          </button>
        )}
        <button
          onClick={onClose}
          className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          닫기
        </button>
      </div>
    </div>
  );
}