import React from 'react';
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
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {mode === 'view' ? 'View Block' : mode === 'edit' ? 'Edit Block' : 'New Question'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          {mode === 'view' && block && <BlockDetailView block={block} />}
          {mode === 'edit' && block && <BlockEditForm block={block} onUpdate={onUpdate} onClose={onClose} />}
          {mode === 'continue' && <BlockContinueForm parentBlock={block} onSubmit={onSubmit} />}
        </div>
      </div>
    </div>
  );
}