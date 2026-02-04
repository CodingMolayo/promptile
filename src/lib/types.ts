//===src/lib/types.ts

export interface Block {
  id: string;
  sessionId: string;
  
  // 🔗 Head-Body-Tail 구조
  head: string | null;           // parent의 tail (null = initial block)
  body: {
    question: string;
    answer: string;
  };
  tail: string;                  // 이 블록의 요약 (child의 head)
  
  // Blockchain 추적
  parentBlockId?: string;
  lastParentTail?: string;       // 생성 시점의 parent tail
  
  // Dirty 상태 관리
  isDirty: boolean;              // parent 수정으로 outdated?
  needsRegeneration: boolean;    // 재생성 필요?
  version: number;               // 재생성 횟수
  
  // 메타데이터
  position: { x: number; y: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  title: string;
  createdAt: Date;
}

export type ModalMode = 'view' | 'edit' | 'continue' | null;