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
        <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <div className="text-xs text-primary/80 font-semibold mb-1">Parent Question</div>
          <div className="text-sm text-foreground/90">{parentBlock.body.question}</div>
          
          {parentBlock.tail && (
            <>
              <div className="text-xs text-primary/80 font-semibold mt-2 mb-1">Parent Summary</div>
              <div className="text-xs text-primary/90 italic">{parentBlock.tail}</div>
            </>
          )}
        </div>
      )}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-foreground/80 mb-2">
          {parentBlock ? 'Continue with new question' : 'Your Question'}
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-3 bg-background text-foreground placeholder:text-gray-500 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          rows={4}
          placeholder="Enter your question..."
          autoFocus
        />
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => { if (question.trim()) { onSubmit(question); setQuestion(''); } }}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Generate Answer
        </button>
      </div>
    </div>
  );
}
