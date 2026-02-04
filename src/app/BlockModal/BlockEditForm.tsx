//===src/app/BlockModal/BlockEditForm.tsx

import React, { useState } from 'react';
import { Block } from '@/lib/types';

interface BlockEditFormProps {
  block: Block;
  onUpdate: (blockId: string, question: string) => void;
  onClose: () => void;
}

export default function BlockEditForm({ block, onUpdate, onClose }: BlockEditFormProps) {
  // ✅ 수정: block.question → block.body.question
  const [question, setQuestion] = useState(block.body.question);

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Edit Question</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          placeholder="Enter your question..."
        />
      </div>
      <div className="flex gap-3 justify-end">
        <button 
          onClick={onClose} 
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={() => { if (question.trim()) onUpdate(block.id, question); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Update
        </button>
      </div>
    </div>
  );
}