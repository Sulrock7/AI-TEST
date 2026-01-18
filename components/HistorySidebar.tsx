
import React from 'react';
import { X, Clock, FileText, Trash2, ArrowLeft } from 'lucide-react';
import { AuditReport } from '../types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: AuditReport[];
  onLoadReport: (report: AuditReport) => void;
  onDeleteReport: (id: string) => void;
  theme: 'dark' | 'light';
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onLoadReport, 
  onDeleteReport,
  theme 
}) => {
  const isDark = theme === 'dark';

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className={`fixed top-0 left-0 h-full w-full sm:w-[400px] z-[70] transform transition-transform duration-300 ease-out shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${isDark ? 'bg-[#0a1118] border-r border-white/10' : 'bg-white border-r border-gray-200'}`}>
        
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
          <h2 className={`text-xl font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#1a3a34]'}`}>
            <Clock className="w-6 h-6 text-emerald-500" />
            سجل التقارير السابقة
          </h2>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 p-6">
              <FileText className="w-16 h-16 mb-4 text-gray-400" />
              <p className={`font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>لا توجد تقارير محفوظة حتى الآن</p>
            </div>
          ) : (
            history.map((report) => (
              <div 
                key={report.id}
                className={`group relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer hover:scale-[1.02] ${isDark ? 'bg-[#131d27] border-white/5 hover:border-emerald-500/50' : 'bg-gray-50 border-gray-200 hover:border-emerald-300 hover:bg-white hover:shadow-lg'}`}
                onClick={() => onLoadReport(report)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-black px-2 py-1 rounded-md ${report.finalVerdict === 'مطابق' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {report.finalVerdict}
                  </span>
                  <span className={`text-[10px] font-mono opacity-60 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(report.timestamp || Date.now()).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                
                <h3 className={`font-bold text-lg mb-1 truncate ${isDark ? 'text-white' : 'text-[#1a3a34]'}`}>
                  {report.projectType || 'مشروع غير مسمى'}
                </h3>
                <p className={`text-xs truncate opacity-70 mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {report.location} - {report.area}
                </p>

                <div className="flex items-center justify-between mt-2 pt-3 border-t border-dashed border-gray-500/20">
                    <span className={`text-xs font-bold flex items-center gap-1 group-hover:text-emerald-500 transition-colors ${isDark ? 'text-emerald-400/70' : 'text-emerald-700/70'}`}>
                        عرض التفاصيل <ArrowLeft className="w-3 h-3" />
                    </span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if(report.id) onDeleteReport(report.id);
                        }}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                        title="حذف التقرير"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;
