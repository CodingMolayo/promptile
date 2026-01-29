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
          <div className="text-sm text-gray-700">{parentBlock.question}</div>
        </div>
      )}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {parentBlock ? 'Continue with new question' : 'Your Question'}
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
          rows={4}
          placeholder="Enter your question..."
          autoFocus
        />
      </div>
      <div className="flex justify-end">
        <button 
          onClick={() => { if (question.trim()) onSubmit(question); }}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Generate Answer
        </button>
      </div>
    </div>
  );
}