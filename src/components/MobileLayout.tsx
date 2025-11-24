import React from 'react';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children, className = "" }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className={`w-full max-w-md bg-white min-h-screen shadow-xl relative flex flex-col ${className}`}>
        {children}
      </div>
    </div>
  );
};