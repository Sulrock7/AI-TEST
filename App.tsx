
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import AuditResultTable from './components/AuditResultTable';
import LoadingSpinner from './components/LoadingSpinner';
import ChatBot from './components/ChatBot';
import HistorySidebar from './components/HistorySidebar';
import { auditBuildingPlan } from './services/geminiService';
import { AuditReport } from './types';
import { Sparkles, ArrowLeft, Code, Building2 } from 'lucide-react';

const BUILDING_TYPES_DATA = [
  {
    category: "المباني السكنية",
    items: ["الفلل السكنية", "المباني السكنية مفردة الوحدات (تاون هاوس)", "مجمعات الفلل المغلقة (كمباوند)"]
  },
  {
    category: "العمائر",
    items: ["العمائر السكنية", "العمائر المكتبية", "العمائر التجارية", "عمائر الشقق المخدومة"]
  },
  {
    category: "المشاريع التجارية والخدمية",
    items: [
      "محطات الوقود فئة (ب)",
      "أكشاك طلبات السيارات",
      "المدارس (حضانة، ابتدائي، متوسط، ثانوي)",
      "قاعات المناسبات (قصور الأفراح)",
      "الاستراحات (الشاليهات)",
      "معارض السيارات",
      "مراكز بيع مواد البناء",
      "مراكز بيع أسطوانات الغاز",
      "المستودعات",
      "الورش",
      "الأسواق المركزية (هايبر ماركت)"
    ]
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'auditor'>('landing');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  
  const [history, setHistory] = useState<AuditReport[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('audit_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (newReport: AuditReport) => {
    const reportWithMeta = {
      ...newReport,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    const updatedHistory = [reportWithMeta, ...history].slice(0, 20);
    setHistory(updatedHistory);
    localStorage.setItem('audit_history', JSON.stringify(updatedHistory));
    return reportWithMeta;
  };

  const handleDeleteReport = (id: string) => {
    const updatedHistory = history.filter(h => h.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('audit_history', JSON.stringify(updatedHistory));
  };

  const handleLoadReport = (loadedReport: AuditReport) => {
    setReport(loadedReport);
    setView('auditor');
    setIsHistoryOpen(false);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const convertFileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve({ base64: base64Data, mimeType: file.type });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleStartAudit = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const processedFiles = await Promise.all(files.map(convertFileToBase64));
      const auditData = await auditBuildingPlan(processedFiles, selectedType);
      
      const savedReport = saveToHistory(auditData);
      setReport(savedReport);
      
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col font-[family-name:var(--font-noto)] transition-colors duration-700 ease-in-out overflow-x-hidden ${isDark ? 'bg-[#050b14] text-white' : 'bg-[#f0f4f8] text-slate-900'}`}>
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className={`absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse ${isDark ? 'bg-emerald-600' : 'bg-emerald-400'}`}></div>
         <div className={`absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse delay-1000 ${isDark ? 'bg-blue-600' : 'bg-blue-400'}`}></div>
         <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20`}></div>
         <div className={`absolute inset-0 ${isDark ? 'bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]' : 'bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)]'} bg-[size:24px_24px]`}></div>
      </div>

      <Header 
        theme={theme} 
        onThemeToggle={toggleTheme} 
        onHistoryClick={() => setIsHistoryOpen(true)} 
      />
      
      <HistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history}
        onLoadReport={handleLoadReport}
        onDeleteReport={handleDeleteReport}
        theme={theme}
      />

      {/* Main Content */}
      <div className={`relative z-10 transition-all duration-700 flex-grow flex flex-col ${view === 'landing' ? 'justify-center pt-32' : 'pt-32 pb-12'}`}>
        
        <main className="container mx-auto px-4 perspective-[1000px]">
          
          {view === 'landing' && (
            <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
              
              <div className={`mb-6 px-4 py-1.5 rounded-full border shadow-lg backdrop-blur-md transform hover:scale-105 transition-transform ${isDark ? 'bg-white/5 border-white/10 text-emerald-400' : 'bg-white/60 border-white/40 text-emerald-700'}`}>
                <span className="text-[10px] md:text-xs font-black tracking-widest uppercase flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  مستقبل التدقيق الهندسي في السعودية
                </span>
              </div>

              <div className="text-center mb-10 relative">
                <h1 className={`text-5xl md:text-8xl font-black tracking-tighter leading-tight mb-6 
                  ${isDark 
                    ? 'text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]' 
                    : 'text-transparent bg-clip-text bg-gradient-to-b from-slate-900 via-slate-800 to-slate-500 drop-shadow-xl'
                  }`}>
                  دقق مخططك <br className="hidden md:block" />
                  <span className={`bg-clip-text text-transparent bg-gradient-to-r ${isDark ? 'from-emerald-400 to-cyan-400' : 'from-emerald-600 to-teal-500'}`}>
                    بسرعة الضوء
                  </span>
                </h1>
                
                <p className={`text-lg md:text-2xl max-w-2xl mx-auto font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  نظام ذكاء اصطناعي متطور يفهم "الدليل الموحد لاشتراطات البناء" ويقوم بمطابقة مخططاتك مع الكود السعودي بدقة متناهية.
                </p>

                <div className="mt-8 flex justify-center gap-4">
                  <button 
                    onClick={() => setView('auditor')}
                    className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white shadow-xl transition-all hover:scale-110 active:scale-95 ${isDark ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                  >
                    <Sparkles className="w-5 h-5" />
                    ابدأ التدقيق الآن
                  </button>
                </div>
              </div>

            </div>
          )}

          {view === 'auditor' && (
            <div className="w-full max-w-4xl mx-auto animate-in zoom-in-95 duration-500">
               <button 
                onClick={() => setView('landing')}
                className={`mb-8 flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:pr-6 font-bold text-sm backdrop-blur-md border shadow-sm ${isDark ? 'bg-white/5 border-white/10 text-emerald-400 hover:bg-white/10' : 'bg-white/60 border-white/40 text-emerald-700 hover:bg-white'}`}
              >
                <ArrowLeft className="w-4 h-4 rotate-180" />
                العودة للرئيسية
              </button>

              {!report ? (
                <div className={`border p-6 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden transition-all ${isDark ? 'bg-[#131d27]/80 backdrop-blur-xl border-white/10' : 'bg-white/80 backdrop-blur-xl border-white/60'}`}>
                  <div className={`absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none`}></div>
                  
                  <div className="text-center mb-10 relative z-10">
                    <div className={`inline-flex items-center justify-center p-4 rounded-3xl mb-6 ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                      <Code className="w-8 h-8" />
                    </div>
                    <h2 className={`text-3xl md:text-5xl font-black mb-4 tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>أداة تدقيق المخططات</h2>
                    <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-base font-medium max-w-lg mx-auto`}>
                      ارفع ملفات PDF أو صور للمخططات وسنقوم بتحليلها.
                    </p>
                  </div>
                  
                  <FileUpload 
                    files={files} 
                    onFilesChange={setFiles} 
                    isLoading={loading} 
                    theme={theme}
                  />

                  {!loading && files.length > 0 && (
                    <div className="mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 relative z-10">
                      <div className={`rounded-3xl border p-6 md:p-8 transition-all ${isDark ? 'bg-[#1a2734]/50 border-white/5' : 'bg-slate-50/80 border-slate-200'}`}>
                        <div className="flex items-center gap-4 mb-6 text-emerald-600">
                          <Building2 className="w-6 h-6 md:w-8 md:h-8" />
                          <h3 className="text-lg md:text-xl font-black">نوع المبنى (اختياري)</h3>
                        </div>
                        <div className="relative">
                          <select 
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className={`w-full appearance-none border py-5 px-6 md:px-8 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold text-base md:text-lg ${isDark ? 'bg-[#0a1118] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}
                          >
                            <option value="">-- اتركه فارغاً للتعرف التلقائي --</option>
                            {BUILDING_TYPES_DATA.map((cat, idx) => (
                              <optgroup key={idx} label={cat.category} className="font-bold text-emerald-600">
                                {cat.items.map((item, i) => (
                                  <option key={i} value={item}>{item}</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={handleStartAudit}
                        className={`w-full group relative overflow-hidden flex items-center justify-center gap-4 font-black py-6 rounded-[2rem] shadow-xl transition-all transform hover:-translate-y-1 active:scale-[0.98]
                          ${isDark ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-emerald-700 text-white hover:bg-emerald-800'}`}
                      >
                        <Sparkles className="w-6 h-6 md:w-7 md:h-7 animate-pulse" />
                        <span className="text-lg md:text-2xl relative z-10">بدء التحليل الفني للمرفقات</span>
                      </button>
                    </div>
                  )}

                  {loading && <LoadingSpinner theme={theme} />}
                  {error && <div className="mt-4 text-center text-red-500 font-bold">{error}</div>}
                </div>
              ) : (
                <div className="animate-in fade-in duration-700">
                  <AuditResultTable report={report} theme={theme} />
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <ChatBot theme={theme} />
      
      <footer className={`relative z-10 pt-16 pb-8 border-t transition-colors ${isDark ? 'bg-[#050b14] border-white/5 text-slate-400' : 'bg-[#f0f4f8] border-slate-200 text-slate-500'}`}>
        <div className="container mx-auto px-6 text-center">
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-4">
              إخلاء مسؤولية: هذا النظام هو نسخة تجريبية (Beta)
            </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
