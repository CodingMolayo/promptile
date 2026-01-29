'use client';

import React from 'react';
import { motion } from 'framer-motion'; // 라이브러리 임포트
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
      // 드래그 설정: 터치/마우스 모두 자동 지원
      drag
      dragMomentum={false}
      onDragEnd={(e, info) => {
        // 드래그가 끝났을 때 위치 업데이트 (현재 위치 + 이동 거리)
        onPositionUpdate(block.id, {
          x: block.position.x + info.offset.x,
          y: block.position.y + info.offset.y
        });
      }}
      // 클릭 감지 (드래그와 클릭 구분)
      onTap={() => onClick(block.id)}
      
      // 초기 위치 및 스타일
      initial={false}
      animate={{
        x: block.position.x,
        y: block.position.y,
        scale: isActive ? 1.02 : 1,
      }}
      
      className={`absolute bg-white border rounded-lg p-4 cursor-move select-none touch-none ${
        isActive ? 'border-blue-500 shadow-lg z-20' : 'border-gray-200 hover:shadow-md z-10'
      }`}
      
      // 반응형 가로 너비 설정
      style={{
        width: 'calc(min(280px, 80vw))', // PC는 280px, 모바일은 화면의 80% (30%는 너무 작을 수 있어 80%를 추천하지만, 원하시면 30vw로 수정 가능합니다)
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
        <div className="mt-2 pt-2 border-t border-gray-100">
          <BlockActionMenu 
            onView={() => onView(block)} 
            onEdit={() => onEdit(block)} 
            onContinue={() => onContinue(block)} 
          />
        </div>
      )}
    </motion.div>
  );
}