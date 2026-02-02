
import { MessageSquare } from 'lucide-react';

export default function EmptyBoardState({ onCreateBlock }: { onCreateBlock: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center h-full">
      <div className="text-center">
        <MessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Blocks Yet</h2>
        <p className="text-gray-500 mb-6">Start by creating your first block</p>
        <button
          onClick={onCreateBlock}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tile your first Prompt
        </button>
      </div>
    </div>
  );
}