
import React, { ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/utils/auth";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import NotificationButton from "./NotificationButton";
import { Button } from "@/components/ui/button";
import { User, Bus, Calendar, LogOut, Menu, X, Home, LogIn } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    toast({
      title: "تم تسجيل الخروج بنجاح",
    });
    navigate("/");
  };

  const navItems = [
    {
      path: "/dashboard",
      label: "الرئيسية",
      icon: <Home className="h-5 w-5" />,
    },
    { path: "/trips", label: "رحلاتي", icon: <Bus className="h-5 w-5" /> },
    { path: "/profile", label: "حسابي", icon: <User className="h-5 w-5" /> },
  ];

  const isCurrentPath = (path: string) => location.pathname === path;

  // Bottom navigation for all users
  const bottomNavigation = () => {
    if (isAuthenticated) {
      // Bottom navigation for authenticated users
      return (
        <div className="fixed bottom-0 right-0 left-0 bg-card border-t shadow-lg py-2 px-4 z-10">
          <div className="flex justify-around items-center w-full">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className="flex flex-col items-center"
              >
                <div className={`${isCurrentPath(item.path) ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.icon}
                </div>
                <span className={`text-xs mt-1 ${isCurrentPath(item.path) ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      );
    } else {
      // Bottom navigation for guests
      return (
        <div className="fixed bottom-0 right-0 left-0 bg-card border-t shadow-lg py-2 px-4 z-10">
          <div className="flex justify-around items-center w-full">
            <Link to="/" className="flex flex-col items-center">
              <Home className={`h-6 w-6 ${location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-xs mt-1 ${location.pathname === '/' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                الرئيسية
              </span>
            </Link>
            <Link to="/login" className="flex flex-col items-center">
              <LogIn className={`h-6 w-6 ${location.pathname === '/login' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-xs mt-1 ${location.pathname === '/login' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                تسجيل الدخول
              </span>
            </Link>
            <Link to="/book" className="flex flex-col items-center">
              <Bus className={`h-6 w-6 ${location.pathname === '/book' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-xs mt-1 ${location.pathname === '/book' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                حجز رحلة
              </span>
            </Link>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background rtl">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Logo />

          <div className="flex items-center gap-3">
            {/* Notification Button */}
            {isAuthenticated && <NotificationButton />}
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Logout Button (for authenticated users) */}
            {isAuthenticated && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                aria-label="تسجيل الخروج"
              >
                <LogOut className="h-5 w-5 text-muted-foreground" />
              </Button>
            )}

            {/* Only show buttons for non-mobile or non-authenticated */}
            {!isMobile && !isAuthenticated && (
              <div className="flex items-center space-x-3 space-x-reverse">
                <Button 
                  variant="outline" 
                  className="text-primary border-primary hover:bg-primary/10"
                  onClick={() => navigate('/login')}
                >
                  تسجيل الدخول
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => navigate('/book')}
                >
                  حجز رحلة
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t py-6 mb-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p className="mt-6 text-center text-sm sm:mt-0">
            العلامة التجارية وجميع الحقوق محفوظة © {format(new Date(), "yyyy")}{" "}
            | <span>تصميم وبرمجة</span>
            <a
              href="https://wa.me/+201017732845"
              target="_blank"
              className="text-primary font-bold hover:text-primary/80"
            >{` السيد غبيش `}</a>
          </p>
        </div>
      </footer>

      {/* Bottom Navigation for All Users */}
      {bottomNavigation()}
    </div>
  );
};

export default Layout;
