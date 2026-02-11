//===src/app/BlockBoard/BlockBoard.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Plus, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Block } from '@/lib/types';
import BlockCard from './BlockCard';
import EmptyBoardState from './EmptyBoardState';

function ConnectionLines({ blocks, scale }: { blocks: Block[], scale: number }) {
  const lines = blocks.filter(block => block.parentBlockId).map(block => {
    const parent = blocks.find(b => b.id === block.parentBlockId);
    if (!parent) return null;
    
    const startX = parent.position.x + 150;
    const startY = parent.position.y + 100;
    const endX = block.position.x + 150;
    const endY = block.position.y + 100;
    const midX = (startX + endX) / 2;

    const strokeColor = block.isDirty ? '#f97316' : '#3b82f6';
    const strokeDasharray = block.isDirty ? '4,4' : '8,4';

    return (
      <path
        key={`line-${parent.id}-${block.id}`}
        d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
        stroke={strokeColor}
        strokeWidth={3 / scale} // 줌에 따라 선 두께 조정
        fill="none"
        strokeDasharray={strokeDasharray}
        opacity={block.isDirty ? 0.4 : 0.6}
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
  onRegenerateBlock?: (blockId: string) => void;
}

export default function BlockBoard(props: BlockBoardProps) {
  const [scale, setScale] = useState(1.0); // 초기 스케일 100%
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const MIN_SCALE = 0.25; // 25%까지 축소
  const MAX_SCALE = 2.0;  // 200%까지 확대
  const SCALE_STEP = 0.1; // 10% 단위 조절

  // ========================================
  // 줌 함수들
  // ========================================
  const zoomIn = () => {
    setScale(prev => Math.min(prev + SCALE_STEP, MAX_SCALE));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - SCALE_STEP, MIN_SCALE));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  // ========================================
  // PC: Ctrl + 마우스 휠
  // ========================================
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Ctrl 키 (Windows) 또는 Cmd 키 (Mac) 눌렀을 때만
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        
        const delta = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
        setScale(prev => {
          const newScale = prev + delta;
          return Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
        });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // ========================================
  // 모바일: 핀치 줌
  // ========================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let initialDistance = 0;
    let initialScale = 1.0;

    const getDistance = (touch1: Touch, touch2: Touch) => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        initialDistance = getDistance(e.touches[0], e.touches[1]);
        initialScale = scale;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scaleChange = currentDistance / initialDistance;
        const newScale = initialScale * scaleChange;
        
        setScale(Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale)));
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [scale]);

  if (props.blocks.length === 0) return <EmptyBoardState onCreateBlock={props.onCreateBlock} />;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-auto bg-gray-50"
    >
      {/* Canvas with Transform */}
      <div 
        ref={canvasRef}
        className="relative origin-top-left transition-transform duration-200 ease-out"
        style={{ 
          minWidth: '2000px', 
          minHeight: '2000px',
          transform: `scale(${scale})`,
          transformOrigin: '0 0'
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

      {/* Zoom Controls - 우측 하단 */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-30">
        {/* 줌 인 버튼 */}
        <button
          onClick={zoomIn}
          disabled={scale >= MAX_SCALE}
          className="w-12 h-12 bg-white border-2 border-gray-300 rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Zoom In (Ctrl + Scroll Up)"
        >
          <ZoomIn size={20} className="text-gray-700" />
        </button>

        {/* 스케일 표시 */}
        <div className="w-12 h-12 bg-white border-2 border-gray-300 rounded-lg shadow-lg flex items-center justify-center">
          <span className="text-xs font-bold text-gray-700">
            {Math.round(scale * 100)}%
          </span>
        </div>

        {/* 줌 아웃 버튼 */}
        <button
          onClick={zoomOut}
          disabled={scale <= MIN_SCALE}
          className="w-12 h-12 bg-white border-2 border-gray-300 rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Zoom Out (Ctrl + Scroll Down)"
        >
          <ZoomOut size={20} className="text-gray-700" />
        </button>

        {/* 리셋 버튼 */}
        <button
          onClick={resetZoom}
          className="w-12 h-12 bg-white border-2 border-gray-300 rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="Reset Zoom (100%)"
        >
          <Maximize2 size={20} className="text-gray-700" />
        </button>

        {/* Create Block 버튼 - 줌 컨트롤 아래 */}
        <div className="mt-4">
          <button 
            onClick={props.onCreateBlock} 
            className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
            title="Create New Block"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* 줌 가이드 (처음 사용자용 - 선택사항) */}
      {scale === 1.0 && props.blocks.length > 0 && (
        <div className="fixed bottom-24 left-6 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 shadow-md z-20 max-w-xs">
          <div className="font-semibold mb-1">💡 Zoom Tip</div>
          <div className="text-xs">
            <span className="hidden md:inline">Ctrl + 마우스 휠</span>
            <span className="md:hidden">두 손가락 핀치</span>
            로 확대/축소 가능
          </div>
        </div>
      )}
    </div>
  );
}