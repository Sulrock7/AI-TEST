
import React from 'react';
import { UserCircle, History, Sun, Moon, Menu } from 'lucide-react';
import SmartAuditorLogo from './SmartAuditorLogo';

interface HeaderProps {
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  onHistoryClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, onThemeToggle, onHistoryClick }) => {
  const isDark = theme === 'dark';

  return (
    <header className="fixed top-6 left-0 right-0 z-50 px-4 md:px-0 pointer-events-none">
      <div className={`pointer-events-auto container mx-auto max-w-6xl backdrop-blur-xl rounded-2xl md:rounded-full border shadow-2xl transition-all duration-500
        ${isDark 
          ? 'bg-[#0f172a]/70 border-white/10 shadow-emerald-900/20' 
          : 'bg-white/70 border-white/40 shadow-gray-200/50'
        }`}>
        
        <div className="px-4 py-3 md:px-8 md:py-3 flex flex-row justify-between items-center">
          
          {/* Right Side: Logo & Brand */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative group">
              <div className={`absolute inset-0 rounded-full blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-500 ${isDark ? 'bg-emerald-500' : 'bg-emerald-300'}`}></div>
              <SmartAuditorLogo className="relative w-10 h-10 md:w-12 md:h-12 z-10" isDark={isDark} />
            </div>
            <div className="flex flex-col items-start">
              <span className={`text-[10px] font-black tracking-[0.2em] uppercase leading-none mb-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>نظام</span>
              <h1 className={`text-lg md:text-xl font-black leading-none tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>المهندس الشامل</h1>
            </div>
          </div>

          {/* Left Side: Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            
            <button
               onClick={onHistoryClick}
               className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all transform hover:scale-105 active:scale-95 border ${isDark ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200'}`}
            >
              <History className="w-3.5 h-3.5" />
              <span>السجل</span>
            </button>

            <div className={`h-6 w-px mx-1 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>

            <button 
              onClick={onThemeToggle}
              className={`p-2 rounded-full transition-all transform hover:rotate-12 ${isDark ? 'text-yellow-400 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button 
              className={`p-1 rounded-full border-2 transition-all ${isDark ? 'border-white/10 text-gray-300 hover:border-emerald-500 hover:text-white' : 'border-slate-200 text-slate-500 hover:border-emerald-500 hover:text-slate-800'}`}
            >
              <UserCircle className="w-8 h-8" />
            </button>
          </div>

        </div>
      </div>
      
      {/* Mobile Disclaimer (Inside header flow for better UX) */}
      <div className="flex justify-center mt-2 pointer-events-none">
         <p className={`text-[9px] font-bold backdrop-blur-sm px-3 py-1 rounded-full border shadow-sm ${isDark ? 'bg-black/30 text-emerald-400 border-emerald-500/20' : 'bg-white/40 text-emerald-800 border-emerald-800/10'}`}>
           إعداد وتطوير م. سلطان عبيد الشمري
         </p>
      </div>
    </header>
  );
};

export default Header;
