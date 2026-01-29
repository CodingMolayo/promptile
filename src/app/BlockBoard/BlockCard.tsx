import React, { useState, useEffect, useRef } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const dragStartTime = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragStartTime.current = Date.now();
    setIsDragging(true);
    setDragStart({ x: e.clientX - block.position.x, y: e.clientY - block.position.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    onPositionUpdate(block.id, { x: Math.max(0, e.clientX - dragStart.x), y: Math.max(0, e.clientY - dragStart.y) });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (Date.now() - dragStartTime.current < 200) onClick(block.id);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const truncateText = (text: string, len: number) => text.length > len ? text.slice(0, len) + '...' : text;

  return (
    <div
      className={`absolute bg-white border rounded-lg p-4 cursor-move transition-shadow select-none ${
        isActive ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:shadow-md'
      } ${isDragging ? 'shadow-2xl opacity-90 scale-105' : ''}`}
      style={{
        left: `${block.position.x}px`,
        top: `${block.position.y}px`,
        width: '280px',
        zIndex: isDragging ? 100 : isActive ? 10 : 5
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1">Question</div>
        <div className="font-medium text-gray-800 text-sm">{truncateText(block.question, 80)}</div>
      </div>
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1">Answer</div>
        <div className="text-sm text-gray-600">{truncateText(block.answer, 100)}</div>
      </div>
      {isActive && <BlockActionMenu onView={() => onView(block)} onEdit={() => onEdit(block)} onContinue={() => onContinue(block)} />}
    </div>
  );
}