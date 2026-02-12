//===src/app/BlockBoard/BlockCard.tsx

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Block } from '@/lib/types';
import BlockActionMenu from './BlockActionMenu';

interface BlockCardProps {
  block: Block;
  isActive: boolean;
  onClick: (id: string) => void;
  onView: (block: Block) => void;
  onEdit: (block: Block) => void;
  onContinue: (block: Block) => void;
  onPositionUpdate: (blockId: string, position: { x: number; y: number }) => void;
  onRegenerate?: (blockId: string) => void;
}

export default function BlockCard({ 
  block, isActive, onClick, onView, onEdit, onContinue, onPositionUpdate, onRegenerate
}: BlockCardProps) {

  const isInitialBlock = block.head === null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={(e, info) => {
        onPositionUpdate(block.id, {
          x: block.position.x + info.offset.x,
          y: block.position.y + info.offset.y
        });
      }}
      onTap={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('button')) return;

        // Dirty 블록 클릭 시 재생성 트리거
        if (block.isDirty && onRegenerate) {
          onRegenerate(block.id);
        } else {
          onClick(block.id);
        }
      }}
      initial={false}
      animate={{
        x: block.position.x,
        y: block.position.y,
        scale: isActive ? 1.02 : 1,
      }}
      className={`block-card absolute flex flex-col bg-white rounded-xl p-4 cursor-pointer select-none touch-none
        ${isInitialBlock ? 'border-4 border-blue-600 shadow-xl' : 'border-2 border-gray-200'}
        ${isActive && !isInitialBlock ? 'border-blue-500 shadow-lg' : ''}
        ${!isActive && !isInitialBlock ? 'hover:shadow-md' : ''}
        ${isActive ? 'z-20' : 'z-10'}
      `}
      style={{
        width: 'calc(min(300px, 85vw))',
        //width: '300px',
        //height: '200px',
      }}
    >
      {/* Dirty Overlay */}
      {block.isDirty && (
        <div className="absolute inset-0 bg-orange-500/10 backdrop-blur-[2px] rounded-lg border-2 border-orange-500 z-30 flex items-center justify-center">
          <div className="bg-white/95 px-4 py-3 rounded-lg shadow-lg text-center">
            <AlertTriangle className="mx-auto mb-2 text-orange-600" size={24} />
            <div className="text-sm font-semibold text-orange-800">Modified!</div>
            <div className="text-xs text-orange-600 mt-1">Click to Reload</div>
          </div>
        </div>
      )}

      {/* Initial Block Badge */}
      {isInitialBlock && (
        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
          First Tile
        </div>
      )}
      
      <div className="flex-grow overflow-hidden">
        {/* Head - Parent Context */}
        {block.head && (
          <div className="mb-2 p-1 bg-blue-50 rounded border-l-4 border-blue-500">
            <div className="text-[10px] font-semibold text-blue-600">↑ Parent</div>
            <div className="text-xs text-blue-700 line-clamp-1">{block.head}</div>
          </div>
        )}

        {/* Body - Question */}
        <div className="mb-1">
          <div className="text-xs text-gray-500">Question</div>
          <div className="font-medium text-gray-800 text-sm line-clamp-2">
            {block.body.question}
          </div>
        </div>

        {/* Body - Answer */}
        <div className="">
          <div className="text-xs text-gray-500">Answer</div>
          <div className="text-sm text-gray-600 font-light line-clamp-2">
            {block.body.answer}
          </div>
        </div>
      </div>
      
      {/* Tail - Summary for Children */}
      {block.tail && (
        <div className="mt-auto pt-2 p-1 bg-gray-50 rounded border-l-4 border-gray-400 flex-shrink-0">
          <div className="text-[10px] font-semibold text-gray-600">↓ Summary</div>
          <div className="text-xs text-gray-600 line-clamp-1">{block.tail}</div>
        </div>
      )}

      {/* Version Badge */}
      {block.version > 1 && (
        <div className="mt-1 text-xs text-orange-500 flex items-center gap-1 flex-shrink-0">
          🔄 Auto-updated (v{block.version})
        </div>
      )}
      
      {isActive && !block.isDirty && (
        <BlockActionMenu 
          onView={() => onView(block)} 
          onEdit={() => onEdit(block)} 
          onContinue={() => onContinue(block)} 
        />
      )}
    </motion.div>
  );
}
