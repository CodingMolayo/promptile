//===src/hooks/useBlocks.ts

import { useState, useEffect } from 'react';
import { Block } from '@/lib/types';
import { storage } from '@/lib/storage';
import { getDescendantsCount, markSubtreeAsDirty } from '@/lib/blockTreeUtils';

export function useBlocks() {
  const [blocks, setBlocks] = useState<Block[]>(() => {
    if (typeof window !== 'undefined') {
      return storage.loadBlocks();
    }
    return [];
  });

  useEffect(() => {
    if (blocks.length > 0) storage.saveBlocks(blocks);
  }, [blocks]);

  const addBlock = (block: Block) => setBlocks(prev => [...prev, block]);

  const updateBlockPosition = (blockId: string, position: { x: number; y: number }) => {
    setBlocks(prev => prev.map(b => 
      b.id === blockId ? { ...b, position, updatedAt: new Date() } : b
    ));
  };

  const clearBlocks = () => setBlocks([]);

  // ========================================
  // 블록 생성 with AI
  // 🆕 sessionKeywords 파라미터 추가 (선택적)
  // ========================================
  const createBlockWithAI = async (
    sessionId: string, 
    question: string, 
    position: { x: number, y: number }, 
    parentBlockId?: string,
    sessionKeywords?: string[] // 🆕 추가 (기존 호출 코드는 그대로 작동)
  ) => {
    const parent = parentBlockId ? blocks.find(b => b.id === parentBlockId) : undefined;
    const parentTail = parent?.tail || null;


    // 1. 로딩 블록 생성
    const newBlock: Block = {
      id: Date.now().toString(),
      sessionId,
      head: parentTail,
      body: {
        question,
        answer: '답변을 생성하고 있습니다...\n(잠시만 기다려주세요)',
      },
      tail: '',
      parentBlockId,
      lastParentTail: parentTail || undefined,
      isDirty: false,
      needsRegeneration: false,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      position
    };
    
    addBlock(newBlock);
    
    // 2. API 호출
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question, 
          parentTail,
          mode: 'generate',
          sessionKeywords: sessionKeywords || [] // 🆕 전달
        })
      });

      const { answer, tail } = await response.json();
      
      // 3. 블록 업데이트
      setBlocks(prev => prev.map(b => 
        b.id === newBlock.id 
          ? { ...b, body: { question, answer }, tail, updatedAt: new Date() }
          : b
      ));
    } catch (error) {
      console.error('Failed to generate answer:', error);
      setBlocks(prev => prev.map(b => 
        b.id === newBlock.id 
          ? { ...b, body: { ...b.body, answer: '❌ 답변 생성 실패. 다시 시도해주세요.' } }
          : b
      ));
    }
  };

  // ========================================
  // 블록 수정 with Cascade Confirmation
  // 🆕 sessionKeywords 파라미터 추가
  // ========================================
  const updateBlockQuestion = async (
    blockId: string, 
    newQuestion: string,
    sessionKeywords?: string[] // 🆕 추가
  ) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const descendantsCount = getDescendantsCount(blockId, blocks);

    // 자녀가 있으면 확인
    if (descendantsCount > 0) {
      const confirmed = window.confirm(
        `이 블록을 수정하면 ${descendantsCount}개의 하위 블록들을 다시 불러와야 해요.\n계속하시겠습니까?`
      );
      if (!confirmed) return;
    }

    // 1. 현재 블록 재생성
    setBlocks(prev => prev.map(b => 
      b.id === blockId 
        ? { ...b, body: { ...b.body, answer: '재생성 중...' } }
        : b
    ));

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: newQuestion, 
          parentTail: block.head,
          mode: 'regenerate',
          sessionKeywords: sessionKeywords || [] // 🆕 전달
        })
      });

      const { answer, tail } = await response.json();
      
      // 2. 현재 블록 업데이트
      setBlocks(prev => prev.map(b => 
        b.id === blockId 
          ? { 
              ...b, 
              body: { question: newQuestion, answer },
              tail,
              version: b.version + 1,
              updatedAt: new Date()
            }
          : b
      ));

      // 3. 자녀들 dirty 처리
      if (descendantsCount > 0) {
        setBlocks(prev => markSubtreeAsDirty(blockId, prev, tail));
      }
    } catch (error) {
      console.error('Failed to update block:', error);
    }
  };

  // ========================================
  // Dirty 블록 재생성 (On-demand)
  // 🆕 sessionKeywords 파라미터 추가
  // ========================================
  const regenerateDirtyBlock = async (
    blockId: string,
    sessionKeywords?: string[] // 🆕 추가
  ) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || !block.needsRegeneration) return;

    const parent = blocks.find(b => b.id === block.parentBlockId);
    if (!parent) return;

    // 재생성 중 표시
    setBlocks(prev => prev.map(b => 
      b.id === blockId 
        ? { ...b, body: { ...b.body, answer: '재생성 중...' } }
        : b
    ));

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: block.body.question, 
          parentTail: parent.tail,
          mode: 'regenerate',
          sessionKeywords: sessionKeywords || [] // 🆕 전달
        })
      });

      const { answer, tail } = await response.json();
      
      setBlocks(prev => prev.map(b => 
        b.id === blockId 
          ? { 
              ...b, 
              head: parent.tail,
              body: { ...b.body, answer },
              tail,
              isDirty: false,
              needsRegeneration: false,
              version: b.version + 1,
              updatedAt: new Date()
            }
          : b
      ));

      // 이 블록의 자녀들도 dirty 처리 (tail이 변경되었으므로)
      const children = blocks.filter(b => b.parentBlockId === blockId);
      if (children.length > 0) {
        setBlocks(prev => markSubtreeAsDirty(blockId, prev, tail));
      }
    } catch (error) {
      console.error('Failed to regenerate block:', error);
    }
  };

  return { 
    blocks, 
    addBlock, 
    updateBlockQuestion, 
    updateBlockPosition, 
    clearBlocks, 
    createBlockWithAI,
    regenerateDirtyBlock
  };
}