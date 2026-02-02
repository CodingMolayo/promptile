import React from 'react';
import { Plus } from 'lucide-react';
import { Block } from '@/lib/types';
import BlockCard from './BlockCard';
import EmptyBoardState from './EmptyBoardState';

function ConnectionLines({ blocks }: { blocks: Block[] }) {
  const lines = blocks.filter(block => block.parentBlockId).map(block => {
    const parent = blocks.find(b => b.id === block.parentBlockId);
    if (!parent) return null;
    const startX = parent.position.x + 140;
    const startY = parent.position.y + 100;
    const endX = block.position.x + 140;
    const endY = block.position.y + 100;
    const midX = (startX + endX) / 2;

    return (
      <path
        key={`line-${parent.id}-${block.id}`}
        d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
        stroke="#3b82f6" strokeWidth="3" fill="none" strokeDasharray="8,4" opacity="0.6"
      />
    );
  });
  
  const maxX = Math.max(...blocks.map(b => b.position.x), 0) + 500;
  const maxY = Math.max(...blocks.map(b => b.position.y), 0) + 500;

  return <svg className="absolute top-0 left-0 pointer-events-none" style={{ width: maxX, height: maxY, zIndex: 1 }}>{lines}</svg>;
}

interface BlockBoardProps {
  blocks: Block[];
  activeBlockId: string | null;
  onBlockClick: (id: string) => void;
  onViewBlock: (block: Block) => void;
  onEditBlock: (block: Block) => void;
  onContinueBlock: (block: Block) => void;
  onCreateBlock: () => void;
  onBlockPositionUpdate: (blockId: string, position: { x: number; y: number }) => void;
}

export default function BlockBoard(props: BlockBoardProps) {
  if (props.blocks.length === 0) return <EmptyBoardState onCreateBlock={props.onCreateBlock} />;

  return (
    <div className="relative w-full h-full overflow-auto bg-gray-50">
      <div className="relative" style={{ minWidth: '2000px', minHeight: '2000px' }}>
        <ConnectionLines blocks={props.blocks} />
        {props.blocks.map(block => (
          <BlockCard
            key={block.id}
            block={block}
            isActive={block.id === props.activeBlockId}
            onClick={props.onBlockClick}
            onView={props.onViewBlock}
            onEdit={props.onEditBlock}
            onContinue={props.onContinueBlock}
            onPositionUpdate={props.onBlockPositionUpdate}
          />
        ))}
        <button onClick={props.onCreateBlock} className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-20">
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
}