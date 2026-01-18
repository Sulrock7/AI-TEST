
import React from 'react';

const SmartAuditorLogo: React.FC<{ className?: string, isDark?: boolean }> = ({ className = "w-10 h-10", isDark = true }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="20" width="70" height="60" rx="8" stroke={isDark ? "#10b981" : "#059669"} strokeWidth="4" />
        <path d="M30 40H70" stroke={isDark ? "#10b981" : "#059669"} strokeWidth="3" strokeLinecap="round" />
        <path d="M30 50H55" stroke={isDark ? "#10b981" : "#059669"} strokeWidth="3" strokeLinecap="round" />
        <path d="M30 60H65" stroke={isDark ? "#10b981" : "#059669"} strokeWidth="3" strokeLinecap="round" />
        <circle cx="75" cy="75" r="15" fill={isDark ? "#10b981" : "#059669"} />
        <path d="M68 75L73 80L82 71" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

export default SmartAuditorLogo;
