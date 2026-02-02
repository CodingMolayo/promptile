import { Block, Session } from './types';

const SESSIONS_KEY = 'block_llm_sessions';
const BLOCKS_KEY = 'block_llm_blocks';

export const storage = {
  saveSessions: (sessions: Session[]) => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  },
  loadSessions: (): Session[] => {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data).map((s: { createdAt: string | number | Date; }) => ({ ...s, createdAt: new Date(s.createdAt) })) : [];
  },
  saveBlocks: (blocks: Block[]) => {
    localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks));
  },
  loadBlocks: (): Block[] => {
    const data = localStorage.getItem(BLOCKS_KEY);
    return data ? JSON.parse(data).map((b: { createdAt: string | number | Date; }) => ({ ...b, createdAt: new Date(b.createdAt) })) : [];
  }
};