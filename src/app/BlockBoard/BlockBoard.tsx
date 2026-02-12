//===src/app/BlockBoard/BlockBoard.tsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react';
import { Block } from '@/lib/types';
import BlockCard from './BlockCard';
import EmptyBoardState from './EmptyBoardState';

// === 연결선 컴포넌트 ===
function ConnectionLines({ blocks, scale }: { blocks: Block[], scale: number }) {
  const lines = blocks.filter(block => block.parentBlockId).map(block => {
    const parent = blocks.find(b => b.id === block.parentBlockId);
    if (!parent) return null;
    
    // 블록의 중심점 (BlockCard 크기: 300x200)
    const startX = parent.position.x + 150;
    const startY = parent.position.y + 100;

    const endX = block.position.x + 150;
    const endY = block.position.y + 100;
    const midX = (startX + endX) / 2;

    return (
      <path
        key={`line-${parent.id}-${block.id}`}
        d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
        stroke={block.isDirty ? '#f97316' : '#3b82f6'}
        strokeWidth={3 / scale} 
        fill="none"
        strokeDasharray={block.isDirty ? '4,4' : '8,4'}
        opacity={block.isDirty ? 0.4 : 0.6}
      />
    );
  });
  
  return (
    <svg 
      className="absolute top-0 left-0 pointer-events-none" 
      style={{ width: '1px', height: '1px', overflow: 'visible', zIndex: 0 }}
    >
      {lines}
    </svg>
  );
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
  onRegenerateBlock?: (blockId: string) => void;
}

export default function BlockBoard(props: BlockBoardProps) {
  const [scale, setScale] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  
  const touchStartDistRef = useRef<number>(0);
  const touchStartScaleRef = useRef<number>(1.0);

  const MIN_SCALE = 0.25;
  const MAX_SCALE = 2.0;
  const SCALE_STEP = 0.1;

  const getInitialBlock = useCallback(() => {
    if (props.blocks.length === 0) return null;
    return props.blocks.find(b => !b.parentBlockId) || props.blocks[0];
  }, [props.blocks]);

  const centerToBlock = useCallback((block: Block | null, targetScale: number = 1.0) => {
    if (!block || !containerRef.current) return;
    const container = containerRef.current;
    
    const blockCenterX = block.position.x + 150; // BlockCard width/2
    const blockCenterY = block.position.y + 100; // BlockCard height/2

    const newPanX = (container.clientWidth / 2) - (blockCenterX * targetScale);
    const newPanY = (container.clientHeight / 2) - (blockCenterY * targetScale);

    setPan({ x: newPanX, y: newPanY });
    setScale(targetScale);
  }, []);

  const zoomIn = () => setScale(prev => Math.min(prev + SCALE_STEP, MAX_SCALE));
  const zoomOut = () => setScale(prev => Math.max(prev - SCALE_STEP, MIN_SCALE));
  
  const resetZoom = () => {
    const rootBlock = getInitialBlock();
    if (rootBlock) {
      centerToBlock(rootBlock, 1.0);
    } else {
      setPan({ x: 0, y: 0 });
      setScale(1.0);
    }
  };

  useEffect(() => {
    if (props.blocks.length > 0 && pan.x === 0 && pan.y === 0) {
       setTimeout(() => resetZoom(), 50); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
        setScale(prev => Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev + delta)));
      }
    };
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('.block-card')) return;

    setIsPanning(true);
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    e.preventDefault();
    setPan({
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.block-card')) return;

    if (e.touches.length === 1) {
      setIsPanning(true);
      panStartRef.current = { 
        x: e.touches[0].clientX - pan.x, 
        y: e.touches[0].clientY - pan.y 
      };
    } else if (e.touches.length === 2) {
      setIsPanning(false);
      touchStartDistRef.current = getDistance(e.touches[0], e.touches[1]);
      touchStartScaleRef.current = scale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.block-card')) return;

    if (isPanning && e.touches.length === 1) {
      const x = e.touches[0].clientX - panStartRef.current.x;
      const y = e.touches[0].clientY - panStartRef.current.y;
      setPan({ x, y });
    } else if (e.touches.length === 2) {
      const currentDist = getDistance(e.touches[0], e.touches[1]);
      const scaleChange = currentDist / touchStartDistRef.current;
      const newScale = touchStartScaleRef.current * scaleChange;
      setScale(Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale)));
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  if (props.blocks.length === 0) return <EmptyBoardState onCreateBlock={props.onCreateBlock} />;

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full bg-gray-50 overflow-hidden select-none touch-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
            backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
            backgroundSize: `${20 * scale}px ${20 * scale}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
        }}
      />

      <div 
        className="absolute top-0 left-0 origin-top-left will-change-transform"
        style={{ 
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
        }}
      >
        <ConnectionLines blocks={props.blocks} scale={scale} />
        
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
            onRegenerate={props.onRegenerateBlock}
          />
        ))}
      </div>

      <div className="fixed top-6 right-6 flex flex-col items-end gap-2 z-50">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-lg p-1 shadow-sm border border-gray-200">
            <button onClick={zoomIn} className="p-2 hover:bg-gray-100 rounded-md text-gray-700">
              <ZoomIn size={20} />
            </button>
            <span className="w-12 text-center text-sm font-medium text-gray-700">
                {Math.round(scale * 100)}%
            </span>
            <button onClick={zoomOut} className="p-2 hover:bg-gray-100 rounded-md text-gray-700">
              <ZoomOut size={20} />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            <button onClick={resetZoom} className="p-2 hover:bg-blue-50 text-blue-600 rounded-md" title="Center View">
              <Maximize2 size={20} />
            </button>
        </div>
      </div>
      
      <div className="fixed bottom-6 right-6 z-50">
        <button 
        onClick={props.onCreateBlock} 
        className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-transform active:scale-95"
        >
        <Plus size={24} />
        </button>
      </div>

      {scale === 1.0 && props.blocks.length > 0 && (
        <div className="fixed bottom-6 left-6 bg-white/90 backdrop-blur border border-gray-200 rounded-lg p-3 text-sm text-gray-600 shadow-sm z-40 pointer-events-none">
          <div className="flex items-center gap-2">
            <Move size={14} />
            <span>Drag empty space to pan</span>
          </div>
        </div>
      )}
    </div>
  );
}
