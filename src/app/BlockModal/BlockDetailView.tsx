import React from 'react';
import { Block } from '@/lib/types';

export default function BlockDetailView({ block }: { block: Block }) {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-2">Question</h3>
        <p className="text-lg text-gray-800">{block.question}</p>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-2">Answer</h3>
        <div className="text-gray-700 whitespace-pre-wrap">{block.answer}</div>
      </div>
    </div>
  );
}