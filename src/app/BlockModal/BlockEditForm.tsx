//===src/app/BlockModal/BlockEditForm.tsx

import React, { useState } from 'react';
import { Block } from '@/lib/types';

interface BlockEditFormProps {
  block: Block;
  onUpdate: (blockId: string, question: string) => void;
  onClose: () => void;
}

export default function BlockEditForm({ block, onUpdate, onClose }: BlockEditFormProps) {
  const [question, setQuestion] = useState(block.body.question);

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-semibold text-foreground/80 mb-2">Edit Question</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-3 bg-background text-foreground placeholder:text-gray-500 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          rows={4}
          placeholder="Enter your question..."
        />
      </div>
      <div className="flex gap-3 justify-end">
        <button 
          onClick={onClose} 
          className="px-4 py-2 border border-border rounded-lg hover:bg-background/50 transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={() => { if (question.trim()) onUpdate(block.id, question); }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Update
        </button>
      </div>
    </div>
  );
}
