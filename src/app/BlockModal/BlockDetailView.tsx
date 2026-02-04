//===src/app/BlockModal/BlockDetailView.tsx

import React from 'react';
import { Block } from '@/lib/types';
import { MessageSquarePlus, X, ArrowUp, ArrowDown } from 'lucide-react';

interface BlockDetailViewProps {
  block: Block;
  onClose: () => void;
  onContinue?: (block: Block) => void;
}

export default function BlockDetailView({ block, onClose, onContinue }: BlockDetailViewProps) {
  const isInitialBlock = block.head === null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Block Details</h2>
          {isInitialBlock && (
            <span className="inline-block mt-1 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
              Initial Block
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Head - Parent Context */}
        {block.head && (
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUp size={16} className="text-blue-600" />
              <label className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                Head (Parent Context)
              </label>
            </div>
            <p className="text-sm text-blue-800 leading-relaxed">{block.head}</p>
          </div>
        )}

        {/* Body - Question */}
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Question
          </label>
          <p className="mt-2 text-gray-800 leading-relaxed font-medium">
            {block.body.question}
          </p>
        </div>

        {/* Body - Answer */}
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Answer
          </label>
          <div className="mt-2 text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-100">
            {block.body.answer}
          </div>
        </div>

        {/* Tail - Summary */}
        {block.tail && (
          <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDown size={16} className="text-gray-600" />
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tail (Summary for Next Tile)
              </label>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{block.tail}</p>
          </div>
        )}

        {/* Version Info */}
        {block.version > 1 && (
          <div className="text-xs text-orange-600 bg-orange-50 p-3 rounded-lg">
            🔄 이 타일은 {block.version}번째 버전입니다.
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-3">
        {onContinue && (
          <button
            onClick={() => onContinue(block)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <MessageSquarePlus size={18} />
            질문 확장하기
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