import { useState, useEffect } from 'react';
import { Block } from '@/lib/types';
import { storage } from '@/lib/storage';
import { generateAnswer } from '@/lib/gemini'; // [변경] 실제 API 함수 임포트

export function useBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([]);

  // 1. 초기 로드
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBlocks(storage.loadBlocks());
  }, []);

  // 2. 자동 저장
  useEffect(() => {
    if (blocks.length > 0) storage.saveBlocks(blocks);
  }, [blocks]);

  const addBlock = (block: Block) => setBlocks(prev => [...prev, block]);

  const updateBlockAnswer = (blockId: string, answer: string) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, answer } : b));
  };

  const updateBlockQuestion = (blockId: string, question: string) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, question } : b));
  };

  const updateBlockPosition = (blockId: string, position: { x: number; y: number }) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, position } : b));
  };

  const clearBlocks = () => setBlocks([]); // (선택사항: 필요한 경우 유지)

  // [핵심 로직] AI 답변 생성
  const createBlockWithAI = async (
    sessionId: string, 
    question: string, 
    position: { x: number, y: number }, 
    parentBlockId?: string
  ) => {
    // 1. 빈 블록 먼저 생성 (로딩 표시)
    const newBlock: Block = {
      id: Date.now().toString(),
      sessionId,
      question,
      answer: '답변을 생성하고 있습니다...\n(잠시만 기다려주세요)',
      parentBlockId,
      createdAt: new Date(),
      position
    };
    
    addBlock(newBlock);
    
    // 2. 실제 API 호출
    const answer = await generateAnswer(question);
    
    // 3. 받아온 답변으로 블록 업데이트
    updateBlockAnswer(newBlock.id, answer);
  };

  return { 
    blocks, 
    addBlock, 
    updateBlockQuestion, 
    updateBlockPosition, 
    updateBlockAnswer,
    clearBlocks, 
    createBlockWithAI 
  };
}