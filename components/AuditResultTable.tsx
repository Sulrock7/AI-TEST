
import React, { useRef, useState, useMemo } from 'react';
import { CheckCircle, XCircle, HelpCircle, MapPin, Building, Ruler, FileCheck, Car, Paintbrush, Cog, Table, Download, Loader2, Copy, Check, FileText } from 'lucide-react';
import { AuditReport, AuditItem, AuditCategory } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import SmartAuditorLogo from './SmartAuditorLogo';

interface AuditResultTableProps {
  report: AuditReport;
  theme?: 'dark' | 'light';
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'مطابق') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] md:text-xs font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 whitespace-nowrap">
        <CheckCircle className="w-3 h-3" /> مطابق
      </span>
    );
  }
  if (status === 'مخالف') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] md:text-xs font-black bg-red-500/10 text-red-600 border border-red-500/20 whitespace-nowrap">
        <XCircle className="w-3 h-3" /> مخالف
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] md:text-xs font-black bg-gray-500/10 text-gray-600 border border-gray-500/20 whitespace-nowrap">
      <HelpCircle className="w-3 h-3" /> غير موضح
    </span>
  );
};

const CategoryHeader: React.FC<{ category: string, isDark: boolean }> = ({ category, isDark }) => {
  let Icon = FileCheck;
  let colorClass = isDark ? "text-emerald-400 bg-emerald-500/10" : "text-[#1a3a34] bg-[#f0f5f4]";

  if (category === 'الاشتراطات التنظيمية') Icon = Building;
  else if (category === 'مواقف السيارات') Icon = Car;
  else if (category === 'الاشتراطات الفنية') Icon = Cog;
  else if (category === 'الهوية المعمارية') Icon = Paintbrush;

  return (
    <tr className={isDark ? "bg-[#0a1118]" : "bg-white"}>
      <td colSpan={5} className="p-0">
        <div className={`flex items-center gap-3 px-4 md:px-8 py-4 font-black text-sm md:text-base ${colorClass}`}>
          <Icon className="w-5 h-5" />
          {category}
        </div>
      </td>
    </tr>
  );
};

// Printable Report Component (Hidden from view, used for PDF generation)
const PrintableReport = React.forwardRef<HTMLDivElement, { report: AuditReport, groupedItems: Record<string, AuditItem[]> }>(({ report, groupedItems }, ref) => {
  const categoriesOrder: AuditCategory[] = ['الاشتراطات التنظيمية', 'مواقف السيارات', 'الاشتراطات الفنية', 'الهوية المعمارية', 'أخرى'];
  
  return (
    <div ref={ref} className="bg-white text-black p-8 font-[family-name:var(--font-noto)]" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
       {/* Header */}
       <div className="flex justify-between items-center border-b-2 border-emerald-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
             <SmartAuditorLogo isDark={false} className="w-12 h-12" />
             <div>
                <h1 className="text-xl font-black text-emerald-900">تقرير تدقيق رخصة بناء</h1>
                <p className="text-xs font-bold text-gray-500">الدليل الموحد لاشتراطات البناء - الرياض</p>
             </div>
          </div>
          <div className="text-left text-xs text-gray-500">
             <p>تاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
             <p>رقم التقرير: {report.id?.substring(0,8) || '---'}</p>
          </div>
       </div>

       {/* Summary Info */}
       <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-sm">
          <div className="grid grid-cols-2 gap-4">
             <div><span className="font-bold text-gray-500">نوع المشروع:</span> <span className="font-black">{report.projectType}</span></div>
             <div><span className="font-bold text-gray-500">النتيجة النهائية:</span> 
                <span className={`font-black px-2 py-0.5 rounded text-xs mx-2 ${report.finalVerdict === 'مطابق' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{report.finalVerdict}</span>
             </div>
             <div><span className="font-bold text-gray-500">الموقع:</span> <span className="font-bold">{report.location}</span></div>
             <div><span className="font-bold text-gray-500">المساحة:</span> <span className="font-bold">{report.area}</span></div>
          </div>
       </div>

       {/* Compact Table */}
       <div className="mb-6">
          <h3 className="font-black text-sm mb-2 text-emerald-900 border-b pb-1">جدول المطابقة الفنية</h3>
          <table className="w-full text-xs text-right border-collapse border border-gray-300">
            <thead className="bg-emerald-50 text-emerald-900">
              <tr>
                <th className="border border-gray-300 px-2 py-1.5 w-[30%]">العنصر</th>
                <th className="border border-gray-300 px-2 py-1.5 w-[20%]">بالمخطط</th>
                <th className="border border-gray-300 px-2 py-1.5 w-[20%]">المطلوب</th>
                <th className="border border-gray-300 px-2 py-1.5 w-[15%]">النتيجة</th>
              </tr>
            </thead>
            <tbody>
              {categoriesOrder.map(category => {
                 const items = groupedItems[category];
                 if (!items || items.length === 0) return null;
                 return (
                   <React.Fragment key={category}>
                     <tr className="bg-gray-100">
                       <td colSpan={4} className="border border-gray-300 px-2 py-1 font-bold text-gray-700">{category}</td>
                     </tr>
                     {items.map((item, idx) => (
                       <tr key={idx} className={item.status === 'مخالف' ? 'bg-red-50' : ''}>
                         <td className="border border-gray-300 px-2 py-1">{item.element}</td>
                         <td className="border border-gray-300 px-2 py-1 text-gray-600 dir-ltr text-right">{item.planValue}</td>
                         <td className="border border-gray-300 px-2 py-1 text-gray-600 dir-ltr text-right">{item.requiredValue}</td>
                         <td className="border border-gray-300 px-2 py-1 font-bold text-center">
                            {item.status === 'مطابق' && <span className="text-emerald-700">✔ مطابق</span>}
                            {item.status === 'مخالف' && <span className="text-red-700">✘ مخالف</span>}
                            {item.status !== 'مطابق' && item.status !== 'مخالف' && <span className="text-gray-500">-</span>}
                         </td>
                       </tr>
                     ))}
                   </React.Fragment>
                 )
              })}
            </tbody>
          </table>
       </div>

       {/* Notes */}
       <div className="border border-gray-200 rounded-xl p-4 bg-white text-xs leading-relaxed">
          <h3 className="font-black text-sm mb-2 text-red-800 border-b pb-1">الملاحظات والتعديلات المطلوبة</h3>
          <div className="whitespace-pre-wrap">{report.officialLetter}</div>
       </div>

       {/* Footer */}
       <div className="mt-8 pt-4 border-t text-center text-[10px] text-gray-400">
          تم إنشاء هذا التقرير آلياً بواسطة نظام "المهندس الشامل" - الدليل الموحد للرياض
       </div>
    </div>
  )
});

const AuditResultTable: React.FC<AuditResultTableProps> = ({ report, theme = 'dark' }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Use a separate ref for the print version
  const printRef = useRef<HTMLDivElement>(null);
  
  const isDark = theme === 'dark';
  
  const handleCopyNotes = () => {
    navigator.clipboard.writeText(report.officialLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const groupedItems = useMemo(() => {
    const groups: Record<string, AuditItem[]> = {
      'الاشتراطات التنظيمية': [],
      'مواقف السيارات': [],
      'الاشتراطات الفنية': [],
      'الهوية المعمارية': [],
      'أخرى': []
    };
    report.items.forEach(item => {
      if (groups[item.category]) groups[item.category].push(item);
      else groups['أخرى'].push(item);
    });
    return groups;
  }, [report.items]);
  
  const categoriesOrder: AuditCategory[] = ['الاشتراطات التنظيمية', 'مواقف السيارات', 'الاشتراطات الفنية', 'الهوية المعمارية', 'أخرى'];

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    setIsGeneratingPdf(true);
    try {
      // Temporarily reveal the print div to capture it with fixed positioning off-screen
      // This ensures it is part of the layout but not visible, avoiding display:none issues with html2canvas
      const element = printRef.current;
      
      element.style.display = 'block';
      element.style.position = 'fixed';
      element.style.left = '-10000px';
      element.style.top = '0px';
      element.style.zIndex = '-1000';
      
      // Wait for layout reflow
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const canvas = await html2canvas(element, {
        scale: 2, // High quality
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        windowWidth: 2480, // Force reasonable width
      });
      
      // Hide again
      element.style.display = 'none';

      // Use JPEG to avoid "Incomplete or corrupt PNG file" error in jsPDF with large canvases
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      
      if (imgData === 'data:,') {
          throw new Error("Could not generate image from report.");
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate ratio to fit width
      const ratio = imgWidth / pdfWidth;
      const imgHeightInPdf = imgHeight / ratio;

      let heightLeft = imgHeightInPdf;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInPdf);
      heightLeft -= pdfHeight;

      // If content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeightInPdf;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInPdf);
        heightLeft -= pdfHeight;
      }

      pdf.save(`تقرير-المهندس-الشامل-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("حدث خطأ أثناء تصدير ملف PDF. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsGeneratingPdf(false);
      // Clean up styles
      if (printRef.current) {
         printRef.current.style.display = 'none';
      }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Hidden Print Template */}
      <div style={{ display: 'none' }}>
        <PrintableReport ref={printRef} report={report} groupedItems={groupedItems} />
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 px-2 gap-4">
        <h2 className={`text-xl md:text-2xl font-black ${isDark ? 'text-white' : 'text-[#1a3a34]'}`}>تقرير التدقيق</h2>
        <button
          onClick={handleExportPDF}
          disabled={isGeneratingPdf}
          className={`flex items-center justify-center w-full md:w-auto gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg hover:-translate-y-1 active:scale-95 ${
            isDark 
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-gray-700' 
              : 'bg-[#1a3a34] hover:bg-[#234d45] text-white disabled:bg-gray-300'
          }`}
        >
          {isGeneratingPdf ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          {isGeneratingPdf ? 'جاري إنشاء PDF...' : 'تحميل التقرير (A4)'}
        </button>
      </div>

      {/* Screen Display Area (Interactive UI) */}
      <div className={`p-4 md:p-8 rounded-[30px] md:rounded-[40px] ${isDark ? 'bg-[#050b10]' : 'bg-[#f8fafc]'}`}>
        
        {/* Header */}
        <div className="mb-8 text-center border-b border-gray-500/20 pb-6">
           <h1 className={`text-2xl md:text-3xl font-black mb-2 ${isDark ? 'text-white' : 'text-[#1a3a34]'}`}>المهندس الشامل</h1>
           <p className={`text-sm font-bold ${isDark ? 'text-emerald-500' : 'text-emerald-700'}`}>تقرير تدقيق آلي وفق الدليل الموحد</p>
        </div>

        {/* 1. Summary Card */}
        <div className={`rounded-[30px] md:rounded-[40px] shadow-lg border p-6 md:p-10 mb-8 transition-colors ${isDark ? 'bg-[#131d27] border-white/5 text-white' : 'bg-white border-[#eef2f1] text-[#1a3a34]'}`}>
          <h2 className="text-xl md:text-2xl font-black mb-8 border-b border-emerald-500/10 pb-4">بيانات المشروع</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#f0f5f4] text-[#1a3a34]'}`}><Building className="w-6 h-6" /></div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>نوع المبنى</p>
                <p className="font-black text-lg">{report.projectType || 'غير محدد'}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-[#f0f5f4] text-blue-700'}`}><MapPin className="w-6 h-6" /></div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>الموقع</p>
                <p className="font-black text-lg">{report.location || 'غير محدد'}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl ${isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-[#f0f5f4] text-purple-700'}`}><Ruler className="w-6 h-6" /></div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>المساحة</p>
                <p className="font-black text-lg">{report.area || 'غير محدد'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Detailed Table */}
        <div className={`rounded-[30px] md:rounded-[40px] shadow-lg border overflow-hidden mb-8 transition-colors ${isDark ? 'bg-[#131d27] border-white/5' : 'bg-white border-[#eef2f1]'}`}>
          <div className={`px-6 py-6 flex items-center gap-4 border-b ${isDark ? 'bg-white/5 border-white/5' : 'bg-[#f8faf9] border-[#eef2f1]'}`}>
              <Table className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-[#1a3a34]'}`} />
              <h3 className={`font-black text-xl ${isDark ? 'text-white' : 'text-[#1a3a34]'}`}>نتائج التدقيق التفصيلية</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[800px]">
              <thead>
                <tr className={`text-[11px] font-black uppercase tracking-widest border-b ${isDark ? 'bg-[#0a1118] text-gray-500 border-white/5' : 'bg-[#f4f7f6] text-gray-500 border-[#eef2f1]'}`}>
                  <th className="px-6 py-4 w-1/4">العنصر / المعيار</th>
                  <th className="px-6 py-4 w-1/5">الموجود في المخطط</th>
                  <th className="px-6 py-4 w-1/5">المطلوب نظاماً</th>
                  <th className="px-6 py-4 w-1/6">النتيجة</th>
                  <th className="px-6 py-4 w-1/6">المرجع</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-[#eef2f1]'}`}>
                {categoriesOrder.map(category => {
                  const items = groupedItems[category];
                  if (items.length === 0) return null;
                  return (
                    <React.Fragment key={category}>
                      <CategoryHeader category={category} isDark={isDark} />
                      {items.map((item, index) => (
                        <tr key={`${category}-${index}`} className={`transition-colors ${isDark ? 'hover:bg-white/5 text-gray-200' : 'hover:bg-[#f8faf9] text-[#2d4a43]'}`}>
                          <td className="px-6 py-4 text-sm font-black">{item.element}</td>
                          <td className="px-6 py-4 text-sm font-mono dir-ltr text-right opacity-80">{item.planValue}</td>
                          <td className="px-6 py-4 text-sm font-mono dir-ltr text-right opacity-80">{item.requiredValue}</td>
                          <td className="px-6 py-4">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="px-6 py-4 text-[10px] opacity-50 font-black">{item.reference}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Actionable Notes Box */}
        <div className={`rounded-[30px] md:rounded-[40px] shadow-lg border overflow-hidden transition-colors ${isDark ? 'bg-[#131d27] border-white/5' : 'bg-white border-[#eef2f1]'}`}>
           <div className={`px-6 py-5 flex justify-between items-center border-b ${isDark ? 'bg-white/5 border-white/5' : 'bg-orange-50 border-orange-100'}`}>
              <div className="flex items-center gap-3">
                 <FileText className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                 <h3 className={`font-black text-lg ${isDark ? 'text-white' : 'text-[#1a3a34]'}`}>الملاحظات والتعديلات المطلوبة</h3>
              </div>
              <button 
                onClick={handleCopyNotes}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${isDark ? 'border-white/10 hover:bg-white/10 text-gray-300' : 'bg-white border-orange-200 hover:bg-orange-100 text-gray-700'}`}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'تم النسخ' : 'نسخ النص'}
              </button>
           </div>
           
           <div className={`p-8 font-bold text-base leading-loose whitespace-pre-wrap ${isDark ? 'text-gray-300 bg-[#0a1118]/30' : 'text-gray-800 bg-orange-50/20'}`}>
              {report.officialLetter || 'لا توجد ملاحظات جوهرية، المخطط يحقق الحد الأدنى من الاشتراطات.'}
           </div>
        </div>

      </div>
    </div>
  );
};

export default AuditResultTable;
