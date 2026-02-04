//===src/app/BlockModal/BlockContinueForm.tsx

import React, { useState } from 'react';
import { Block } from '@/lib/types';

interface BlockContinueFormProps {
  parentBlock: Block | null;
  onSubmit: (question: string) => void;
}

export default function BlockContinueForm({ parentBlock, onSubmit }: BlockContinueFormProps) {
  const [question, setQuestion] = useState('');

  return (
    <div>
      {parentBlock && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs text-blue-600 font-semibold mb-1">Parent Question</div>
          {/* ✅ 수정: parentBlock.question → parentBlock.body.question */}
          <div className="text-sm text-gray-700">{parentBlock.body.question}</div>
          
          {/* 🆕 추가: Parent의 Tail도 표시 (컨텍스트 확인용) */}
          {parentBlock.tail && (
            <>
              <div className="text-xs text-blue-600 font-semibold mt-2 mb-1">Parent Summary</div>
              <div className="text-xs text-blue-700 italic">{parentBlock.tail}</div>
            </>
          )}
        </div>
      )}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {parentBlock ? 'Continue with new question' : 'Your Question'}
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          placeholder="Enter your question..."
          autoFocus
        />
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => { if (question.trim()) { onSubmit(question); setQuestion(''); } }}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Generate Answer
        </button>
      </div>
    </div>
  );
}