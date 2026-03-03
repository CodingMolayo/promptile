//===src/app/page.tsx

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
  // ========================================
  // Hooks
  // ========================================
  const { 
    sessions, 
    currentSessionId, 
    setCurrentSessionId, 
    createSession, 
    updateSessionTitle, 
    deleteSession,
    // 🆕 Keyword 함수 추가
    generateKeywords,
    updateKeywords,
    getCurrentSession
  } = useSession();
  
  const { 
    blocks, 
    createBlockWithAI, 
    updateBlockQuestion, 
    updateBlockPosition, 
    regenerateDirtyBlock 
  } = useBlocks();

  const { isOpen, mode, selectedBlock, openModal, closeModal } = useModal();
  
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ========================================
  // 현재 세션 & 블록
  // ========================================
  const currentSession = getCurrentSession();
  const currentBlocks = blocks.filter(b => b.sessionId === currentSessionId);

  // ========================================
  // 🆕 자동 키워드 생성 (5개 블록일 때)
  // ========================================
  useEffect(() => {
    if (
      currentSessionId &&
      currentBlocks.length === 5 && 
      !currentSession?.keywords
    ) {
      generateKeywords(currentSessionId, blocks);
    }
  }, [currentBlocks, currentSessionId, currentSession?.keywords, blocks, generateKeywords]);

  // ========================================
  // 반응형 사이드바
  // ========================================
  useEffect(() => {
    // 모든 화면에서 기본 닫힘 상태
  }, []);

  // ========================================
  // Handlers
  // ========================================
  const handleNewSession = () => {
    createSession();
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleSubmitQuestion = (question: string) => {
    if (!currentSessionId) return;

    // 위치 계산
    let position = { x: 20, y: 20 };
    
    if (selectedBlock) {
      position = { 
        x: selectedBlock.position.x + 350, 
        y: selectedBlock.position.y + 100 
      };
    } else {
      const gridIndex = currentBlocks.filter(b => !b.parentBlockId).length;
      position = { 
        x: (gridIndex % 3) * 320 + 20, 
        y: Math.floor(gridIndex / 3) * 280 + 20 
      };
    }

    // 🆕 keywords 전달
    createBlockWithAI(
      currentSessionId, 
      question, 
      position, 
      selectedBlock?.id,
      currentSession?.keywords || [] // keywords 전달
    );
    
    closeModal();
  };

  // 🆕 Keyword 핸들러
  const handleUpdateKeywords = (keywords: string[]) => {
    if (currentSessionId) {
      updateKeywords(currentSessionId, keywords);
    }
  };

  const handleRegenerateKeywords = () => {
    if (currentSessionId) {
      generateKeywords(currentSessionId, blocks);
    }
  };

  // 🆕 Edit 시 keywords 전달
  const handleUpdateBlock = (id: string, q: string) => {
    updateBlockQuestion(id, q, currentSession?.keywords || []);
    closeModal();
  };

  // 🆕 Regenerate 시 keywords 전달
  const handleRegenerateDirtyBlock = (blockId: string) => {
    regenerateDirtyBlock(blockId, currentSession?.keywords || []);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* 모바일 메뉴 버튼 */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-35 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <Menu size={24} />
      </button>

      {/* 모바일 배경 오버레이 
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-55" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}
      */}

      {/* 사이드바 (Session List) */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        transition-transform duration-300 
        fixed z-30 h-full shadow-xl
      `}>

        <SessionList
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          onUpdateTitle={updateSessionTitle}
          onDeleteSession={deleteSession}
        />
      </div>

      {/* 메인 영역 (Block Board) */}
      <div className="flex-1 overflow-hidden relative">
        <BlockBoard
          blocks={currentBlocks}
          activeBlockId={activeBlockId}
          onBlockClick={(id) => setActiveBlockId(activeBlockId === id ? null : id)}
          onViewBlock={(b) => openModal('view', b)}
          onEditBlock={(b) => openModal('edit', b)}
          onContinueBlock={(b) => openModal('continue', b)}
          onCreateBlock={() => openModal('continue', null)}
          onBlockPositionUpdate={updateBlockPosition}
          onRegenerateBlock={handleRegenerateDirtyBlock} // 🆕 수정
          
          /* 🆕 Keyword props 추가 */
          //keywords={currentSession?.keywords || []}
          sessionKeywords={currentSession?.keywords || []}
          isKeywordsManual={currentSession?.keywordsManual || false}
          onUpdateKeywords={handleUpdateKeywords}
          onRegenerateKeywords={handleRegenerateKeywords}
        />
      </div>

      {/* 모달 팝업 */}
      {isOpen && (
        <BlockModal
          mode={mode}
          block={selectedBlock}
          onClose={closeModal}
          onSubmit={handleSubmitQuestion}
          onUpdate={handleUpdateBlock} // 🆕 수정
        />
      )}
    </div>
  );
}