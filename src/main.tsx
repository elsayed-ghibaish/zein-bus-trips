
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// إضافة الكود اللازم للتحقق من إعدادات الظلام
const setInitialTheme = () => {
  // أولاً نتحقق مما إذا كان المستخدم قد اختار سابقًا وضعًا معينًا
  const storedTheme = localStorage.getItem('theme');
  const root = window.document.documentElement;
  
  if (storedTheme) {
    if (storedTheme === 'light') {
      root.classList.remove('dark');
    } else if (storedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      // إذا كان الإعداد هو "system"، فتحقق من تفضيلات النظام
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  } else {
    // إذا لم يتم تعيين أي تفضيل، استخدم إعدادات النظام
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark');
    }
  }
};

// قم بتطبيق الوضع المناسب قبل عرض التطبيق
setInitialTheme();

createRoot(document.getElementById("root")!).render(<App />);
