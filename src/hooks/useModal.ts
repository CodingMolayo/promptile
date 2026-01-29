import { useState } from 'react';
import { Block, ModalMode } from '@/lib/types';

export function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>(null);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);

  const openModal = (mode: ModalMode, block: Block | null = null) => {
    setMode(mode);
    setSelectedBlock(block);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setMode(null);
    setSelectedBlock(null);
  };

  return { isOpen, mode, selectedBlock, openModal, closeModal };
}