'use client';

import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import SessionList from './SessionList/SessionList';
import BlockBoard from './BlockBoard/BlockBoard';
import BlockModal from './BlockModal/BlockModal';
import { useSession } from '@/hooks/useSession';
import { useBlocks } from '@/hooks/useBlocks';
import { useModal } from '@/hooks/useModal';

export default function BlockLLMChatApp() {
  // 1. Hook에서 삭제/수정 함수 가져오기
  const { 
    sessions, 
    currentSessionId, 
    setCurrentSessionId, 
    createSession, 
    updateSessionTitle, 
    deleteSession 
  } = useSession();
  
  // clearBlocks는 이제 사용하지 않으므로 제거합니다.
  const { 
    blocks, 
    updateBlockQuestion, 
    updateBlockPosition, 
    createBlockWithAI 
  } = useBlocks();
  
  const { isOpen, mode, selectedBlock, openModal, closeModal } = useModal();
  
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 반응형 사이드바 설정
  useEffect(() => {
    const checkMobile = () => setSidebarOpen(window.innerWidth >= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNewSession = () => {
    createSession();
    // 중요: 더 이상 clearBlocks()를 호출하지 않습니다. 
    // 모든 데이터는 유지되고, 아래 currentBlocks 필터링으로 화면을 제어합니다.
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleSubmitQuestion = (question: string) => {
    if (!currentSessionId) return;

    // 위치 계산 로직
    const currentSessionBlocks = blocks.filter(b => b.sessionId === currentSessionId);
    let position = { x: 20, y: 20 };
    
    if (selectedBlock) {
      position = { x: selectedBlock.position.x + 350, y: selectedBlock.position.y + 100 };
    } else {
      // 부모가 없는 최상위 블록 갯수 기준 배치
      const gridIndex = currentSessionBlocks.filter(b => !b.parentBlockId).length;
      position = { 
        x: (gridIndex % 3) * 320 + 20, 
        y: Math.floor(gridIndex / 3) * 280 + 20 
      };
    }

    createBlockWithAI(currentSessionId, question, position, selectedBlock?.id);
    closeModal();
  };

  // 핵심: 전체 블록 중에서 '현재 세션'에 해당하는 것만 필터링해서 Board에 전달
  const currentBlocks = blocks.filter(b => b.sessionId === currentSessionId);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* 모바일 메뉴 버튼 */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border"
      >
        <Menu size={24} />
      </button>

      {/* 모바일 배경 오버레이 */}
      {sidebarOpen && <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setSidebarOpen(false)} />}

      {/* 사이드바 (Session List) */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 fixed md:relative z-40 h-full shadow-xl md:shadow-none`}>
        <SessionList
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          onUpdateTitle={updateSessionTitle} // 전달
          onDeleteSession={deleteSession}   // 전달
        />
      </div>

      {/* 메인 영역 (Block Board) */}
      <div className="flex-1 overflow-hidden relative">
        <BlockBoard
          blocks={currentBlocks} // 필터링된 블록만 전달
          activeBlockId={activeBlockId}
          onBlockClick={(id) => setActiveBlockId(activeBlockId === id ? null : id)}
          onViewBlock={(b) => openModal('view', b)}
          onEditBlock={(b) => openModal('edit', b)}
          onContinueBlock={(b) => openModal('continue', b)}
          onCreateBlock={() => openModal('continue', null)}
          onBlockPositionUpdate={updateBlockPosition}
        />
      </div>

      {/* 모달 팝업 */}
      {isOpen && (
        <BlockModal
          mode={mode}
          block={selectedBlock}
          onClose={closeModal}
          onSubmit={handleSubmitQuestion}
          onUpdate={(id, q) => { updateBlockQuestion(id, q); closeModal(); }}
        />
      )}
    </div>
  );
}