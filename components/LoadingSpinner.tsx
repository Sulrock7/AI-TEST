
import React from 'react';

interface LoadingSpinnerProps {
  theme?: 'dark' | 'light';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-24 h-24 mb-8">
        <div className={`absolute inset-0 border-4 rounded-full ${isDark ? 'border-white/5' : 'border-emerald-100'}`}></div>
        <div className={`absolute inset-0 border-4 rounded-full border-t-transparent animate-spin ${isDark ? 'border-emerald-500' : 'border-emerald-600'}`}></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl animate-pulse">🧠</span>
        </div>
      </div>
      <h3 className={`text-2xl font-black mb-3 ${isDark ? 'text-white' : 'text-emerald-900'}`}>جاري التفكير والتحليل العميق...</h3>
      <p className={`text-center max-w-md animate-pulse font-medium text-sm leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
        يقوم المهندس الشامل الآن بمطابقة المخططات مع الدليل الموحد لاشتراطات رخص البناء في الرياض بدقة متناهية عبر معالجة الصور والنصوص.
        <br/><span className="text-xs text-emerald-500 mt-3 block font-black uppercase tracking-widest">(العملية تتطلب دقة هندسية عالية)</span>
      </p>
    </div>
  );
};

export default LoadingSpinner;
