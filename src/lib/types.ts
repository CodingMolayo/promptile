export interface Block {
    id: string;
    sessionId: string;
    question: string;
    answer: string;
    parentBlockId?: string;
    createdAt: Date;
    position: { x: number; y: number };
  }
  
  export interface Session {
    id: string;
    title: string;
    createdAt: Date;
  }
  
  export type ModalMode = 'view' | 'edit' | 'continue' | null;