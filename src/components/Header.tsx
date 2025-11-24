import React from 'react';

interface HeaderProps {
  title?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, leftAction, rightAction, className = "" }) => {
  return (
    <header className={`h-14 px-4 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-40 ${className}`}>
      <div className="flex items-center gap-2">
        {leftAction}
        {/* If there is no left action, we might want to keep the title left-aligned or centered depending on design. 
            Based on current usage, title follows leftAction immediately. */}
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      </div>
      {rightAction && <div>{rightAction}</div>}
    </header>
  );
};