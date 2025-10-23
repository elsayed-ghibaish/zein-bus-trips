
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";

type Theme = "dark" | "light" | "system";

const ThemeToggle = () => {
  const [theme, setTheme] = useLocalStorage<Theme>("theme", "system");
  const [mounted, setMounted] = useState(false);

  // طريقة العرض الأولية تستخدم إعدادات النظام
  useEffect(() => {
    setMounted(true);
    const root = window.document.documentElement;
    
    // إزالة الأوضاع السابقة
    root.classList.remove("light", "dark");

    // تطبيق الوضع المناسب
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  // التبديل بين الوضعين
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      if (prevTheme === "light") return "dark";
      if (prevTheme === "dark") return "system";
      return "light";
    });
  };

  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-full"
      aria-label="تبديل المظهر"
    >
      {theme === "light" && <Sun className="h-5 w-5" />}
      {theme === "dark" && <Moon className="h-5 w-5" />}
      {theme === "system" && 
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? 
          <Moon className="h-5 w-5" /> : 
          <Sun className="h-5 w-5" />
        )
      }
    </Button>
  );
};

export default ThemeToggle;
