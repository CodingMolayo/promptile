'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
}

export default function BlockCard({ 
  block, isActive, onClick, onView, onEdit, onContinue, onPositionUpdate 
}: BlockCardProps) {

  const truncateText = (text: string, len: number) => text.length > len ? text.slice(0, len) + '...' : text;

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
        onClick(block.id);
      }}
      initial={false}
      animate={{
        x: block.position.x,
        y: block.position.y,
        scale: isActive ? 1.02 : 1,
      }}
      className={`absolute bg-white border rounded-lg p-4 cursor-move select-none touch-none ${
        isActive ? 'border-blue-500 shadow-lg z-20' : 'border-gray-200 hover:shadow-md z-10'
      }`}
      style={{
        width: 'calc(min(280px, 80vw))', // Responsive width
        position: 'absolute',
        left: 0,
        top: 0
      }}
    >
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1">Question</div>
        <div className="font-medium text-gray-800 text-sm">{truncateText(block.question, 80)}</div>
      </div>
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1">Answer</div>
        <div className="text-sm text-gray-600 font-light line-clamp-3">
          {truncateText(block.answer, 120)}
        </div>
      </div>
      
      {isActive && (
        <BlockActionMenu 
          onView={() => onView(block)} 
          onEdit={() => onEdit(block)} 
          onContinue={() => onContinue(block)} 
        />
      )}
    </motion.div>
  );
}