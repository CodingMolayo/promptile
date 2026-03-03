//===src/lib/storage.ts

import { Block, Session } from './types';

const SESSIONS_KEY = 'block_llm_sessions';
const BLOCKS_KEY = 'block_llm_blocks';
const STORAGE_VERSION_KEY = 'block_llm_storage_version';
const CURRENT_VERSION = '2.0'; // Head-Body-Tail 구조 버전

/**
 * 레거시 Block 타입 (마이그레이션용)
 */
interface LegacyBlock {
  id: string;
  sessionId: string;
  question: string;
  answer: string;
  parentBlockId?: string;
  createdAt: Date | string;
  position: { x: number; y: number };
}

/**
 * 레거시 블록을 새 구조로 마이그레이션
 */
function migrateBlock(legacy: LegacyBlock): Block {
  // Tail 생성 (답변의 첫 줄을 요약으로 사용)
  const answerLines = legacy.answer.split('\n').filter(line => line.trim());
  const tail = answerLines[0]?.replace('[요약]', '').trim() || legacy.answer.slice(0, 100);

  return {
    id: legacy.id,
    sessionId: legacy.sessionId,
    
    // Head-Body-Tail 구조로 변환
    head: null, // 마이그레이션 후 parent tail로 채워짐
    body: {
      question: legacy.question,
      answer: legacy.answer
    },
    tail,
    
    parentBlockId: legacy.parentBlockId,
    lastParentTail: undefined,
    
    // 새 필드 기본값
    isDirty: false,
    needsRegeneration: false,
    version: 1,
    
    // 날짜 처리
    createdAt: typeof legacy.createdAt === 'string' 
      ? new Date(legacy.createdAt) 
      : legacy.createdAt,
    updatedAt: typeof legacy.createdAt === 'string' 
      ? new Date(legacy.createdAt) 
      : legacy.createdAt,
    
    position: legacy.position
  };
}

/**
 * 마이그레이션된 블록들의 Head 필드를 parent의 tail로 채우기
 */
function fillHeadsFromParents(blocks: Block[]): Block[] {
  return blocks.map(block => {
    if (block.parentBlockId) {
      const parent = blocks.find(b => b.id === block.parentBlockId);
      if (parent && !block.head) {
        return { ...block, head: parent.tail };
      }
    }
    return block;
  });
}

export const storage = {
  // ========================================
  // Sessions
  // ========================================
  saveSessions: (sessions: Session[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    }
  },
  
  loadSessions: (): Session[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(SESSIONS_KEY);
    if (!data) return [];
    
    try {
      return JSON.parse(data).map((s: { createdAt: string | number | Date }) => ({ 
        ...s, 
        createdAt: new Date(s.createdAt) 
      }));
    } catch (error) {
      console.error('Failed to load sessions:', error);
      return [];
    }
  },

  // ========================================
  // Blocks with Migration
  // ========================================
  saveBlocks: (blocks: Block[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks));
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
    }
  },
  
  loadBlocks: (): Block[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(BLOCKS_KEY);
    const version = localStorage.getItem(STORAGE_VERSION_KEY);
    
    if (!data) return [];
    
    try {
      const parsed = JSON.parse(data);
      
      // 버전 체크: 마이그레이션 필요?
      if (version !== CURRENT_VERSION) {
        console.log('🔄 Migrating blocks to new structure...');
        
        // 레거시 블록인지 확인 (question 필드 직접 존재)
        const needsMigration = parsed.some((b: Block | LegacyBlock) => 
          'question' in b && !('body' in b)
        );
        
        if (needsMigration) {
          let migratedBlocks = parsed.map((b: Block | LegacyBlock) => {
            // 이미 새 구조면 그대로, 아니면 마이그레이션
            if ('body' in b) {
              return {
                ...b,
                createdAt: new Date(b.createdAt),
                updatedAt: b.updatedAt ? new Date(b.updatedAt) : new Date(b.createdAt)
              };
            } else {
              return migrateBlock(b as LegacyBlock);
            }
          });
          
          // Head 필드 채우기
          migratedBlocks = fillHeadsFromParents(migratedBlocks);
          
          // 마이그레이션된 데이터 저장
          storage.saveBlocks(migratedBlocks);
          
          console.log('✅ Migration complete!');
          return migratedBlocks;
        }
      }
      
      // 정상적인 로드 (날짜만 변환)
      return parsed.map((b: Block) => ({
        ...b,
        createdAt: new Date(b.createdAt),
        updatedAt: b.updatedAt ? new Date(b.updatedAt) : new Date(b.createdAt),
        // 기본값 보장
        isDirty: b.isDirty ?? false,
        needsRegeneration: b.needsRegeneration ?? false,
        version: b.version ?? 1,
        head: b.head ?? null
      }));
      
    } catch (error) {
      console.error('Failed to load blocks:', error);
      return [];
    }
  },

  // ========================================
  // Utility: Clear All Data
  // ========================================
  clearAll: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSIONS_KEY);
      localStorage.removeItem(BLOCKS_KEY);
      localStorage.removeItem(STORAGE_VERSION_KEY);
      console.log('🗑️ All data cleared');
    }
  },

  // ========================================
  // Utility: Export/Import (백업용)
  // ========================================
  exportData: () => {
    if (typeof window === 'undefined') return null;
    return {
      version: CURRENT_VERSION,
      sessions: storage.loadSessions(),
      blocks: storage.loadBlocks(),
      exportedAt: new Date().toISOString()
    };
  },

  importData: (data: { sessions: Session[], blocks: Block[] }) => {
    if (typeof window === 'undefined') return false;
    try {
      storage.saveSessions(data.sessions);
      storage.saveBlocks(data.blocks);
      console.log('✅ Data imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
};