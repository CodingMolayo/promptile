//===src/lib/blockTreeUtils.ts

import { Block } from './types';

/**
 * 특정 블록의 모든 자손 블록들을 찾습니다 (재귀)
 */
export function getAllDescendants(blockId: string, blocks: Block[]): Block[] {
  const children = blocks.filter(b => b.parentBlockId === blockId);
  const descendants: Block[] = [...children];
  
  children.forEach(child => {
    descendants.push(...getAllDescendants(child.id, blocks));
  });
  
  return descendants;
}

/**
 * 특정 블록의 자손 개수를 반환합니다
 */
export function getDescendantsCount(blockId: string, blocks: Block[]): number {
  return getAllDescendants(blockId, blocks).length;
}

/**
 * childId가 ancestorId의 자손인지 확인합니다
 */
export function isDescendantOf(childId: string, ancestorId: string, blocks: Block[]): boolean {
  const child = blocks.find(b => b.id === childId);
  if (!child || !child.parentBlockId) return false;
  if (child.parentBlockId === ancestorId) return true;
  return isDescendantOf(child.parentBlockId, ancestorId, blocks);
}

/**
 * 특정 블록 이하의 모든 서브트리를 dirty로 표시합니다
 */
export function markSubtreeAsDirty(blockId: string, blocks: Block[], newParentTail: string): Block[] {
  return blocks.map(block => {
    if (isDescendantOf(block.id, blockId, blocks)) {
      return {
        ...block,
        isDirty: true,
        needsRegeneration: true,
        lastParentTail: block.head || undefined
      };
    }
    // 직접 자녀는 head도 업데이트
    if (block.parentBlockId === blockId) {
      return {
        ...block,
        head: newParentTail,
        isDirty: true,
        needsRegeneration: true,
        lastParentTail: block.head || undefined
      };
    }
    return block;
  });
}