
export type AuditCategory = 
  | 'الاشتراطات التنظيمية' 
  | 'مواقف السيارات' 
  | 'الاشتراطات الفنية' 
  | 'الهوية المعمارية'
  | 'أخرى';

export interface AuditItem {
  category: AuditCategory;
  element: string;
  planValue: string;
  requiredValue: string;
  status: 'مطابق' | 'مخالف' | 'غير موضح بالمخطط';
  reference: string;
}

export interface AuditReport {
  id?: string;        // New: Unique ID for history
  timestamp?: number; // New: Date for history
  projectType: string;
  location: string;
  area: string;
  items: AuditItem[];
  summary: string;
  finalVerdict: 'مطابق' | 'غير مطابق';
  auditorOpinion: string;
  officialLetter: string;
}
