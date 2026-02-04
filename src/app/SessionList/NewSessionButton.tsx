//===src/app/SessionList/NewSessionButton.tsx

import React from 'react';
import { Plus } from 'lucide-react';

export default function NewSessionButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Plus size={20} />
      New Session
    </button>
  );
}