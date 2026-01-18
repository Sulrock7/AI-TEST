
import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X, Plus } from 'lucide-react';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  isLoading: boolean;
  theme?: 'dark' | 'light';
}

const FileUpload: React.FC<FileUploadProps> = ({ files, onFilesChange, isLoading, theme = 'dark' }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'dark';

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => 
      file.type === 'application/pdf' || file.type.startsWith('image/')
    );
    if (validFiles.length !== newFiles.length) {
      alert("يرجى رفع ملفات PDF أو صور فقط.");
    }
    onFilesChange([...files, ...validFiles]);
  };

  const removeFile = (indexToRemove: number) => {
    onFilesChange(files.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-6 md:mb-8">
      <div 
        className={`relative border-2 border-dashed rounded-[20px] md:rounded-3xl p-6 md:p-10 transition-all duration-300 ease-in-out text-center cursor-pointer mb-6
          ${dragActive ? (isDark ? 'border-emerald-500 bg-emerald-500/10' : 'border-emerald-500 bg-emerald-50') : (isDark ? 'border-white/10 bg-[#0a1118]/50 hover:border-emerald-500/50' : 'border-gray-200 bg-white hover:border-emerald-300')}
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,image/*"
          multiple
          onChange={handleChange}
          disabled={isLoading}
        />

        <div className="flex flex-col items-center gap-4 md:gap-6">
          <div className={`p-4 md:p-5 rounded-full ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-50'}`}>
            <UploadCloud className={`w-8 h-8 md:w-10 md:h-10 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          </div>
          <div>
            <p className={`text-lg md:text-xl font-bold ${isDark ? 'text-white' : 'text-emerald-900'}`}>اسحب وأفلت الملفات هنا</p>
            <p className={`text-xs md:text-sm mt-2 max-w-xs mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>مخططات معمارية، رخصة بناء، أو نظام البناء (PDF أو صور)</p>
          </div>
          <button 
            type="button"
            className={`px-5 py-2 md:px-6 md:py-2.5 rounded-xl transition shadow-md font-bold text-xs md:text-sm ${isDark ? 'bg-white text-emerald-950 hover:bg-gray-100' : 'bg-emerald-700 text-white hover:bg-emerald-800'}`}
          >
            تصفح جهازك
          </button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className={`text-xs md:text-sm font-black px-1 uppercase tracking-widest ${isDark ? 'text-emerald-400/60' : 'text-emerald-800'}`}>الملفات المرفقة ({files.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {files.map((file, index) => (
              <div key={index} className={`flex items-center justify-between p-3 md:p-4 rounded-2xl border shadow-sm transition-colors ${isDark ? 'bg-[#1a2734] border-white/5 text-white' : 'bg-white border-gray-100 text-gray-800'}`}>
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 md:p-2.5 rounded-xl ${file.type === 'application/pdf' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    <FileText className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs md:text-sm font-bold truncate dir-ltr text-right">{file.name}</span>
                    <span className="text-[9px] md:text-[10px] opacity-50">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                  className="p-1.5 md:p-2 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-lg transition"
                  disabled={isLoading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button 
              onClick={() => inputRef.current?.click()}
              className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-2xl p-3 md:p-4 transition-all ${isDark ? 'border-white/10 text-gray-400 hover:border-emerald-500/40 hover:text-emerald-400' : 'border-gray-200 text-gray-400 hover:border-emerald-300 hover:text-emerald-600'}`}
              disabled={isLoading}
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs md:text-sm font-bold">إضافة ملف آخر</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
