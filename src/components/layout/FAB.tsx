import React from 'react';
import { Plus } from '@phosphor-icons/react';

interface FABProps {
  onClick: () => void;
  label?: string;
}

export default function FAB({ onClick, label = 'Thêm hồ sơ' }: FABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary-hover transition-all duration-200 hover:scale-105 cursor-pointer font-medium text-body-sm"
      aria-label={label}
    >
      <Plus size={20} weight="regular" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}