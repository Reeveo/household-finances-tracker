import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CreditCard,
  TrendingUp,
  Home,
  FileText,
  Clock,
  Settings,
  LogOut,
  Menu,
  PoundSterling,
  X
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type SidebarProps = {
  className?: string;
};

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Close sidebar when navigating to a new route on mobile
  useEffect(() => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  }, [location, isMobile]);
  
  // Close sidebar when pressing escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const navItems = [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          icon: <LayoutDashboard className="w-5 h-5 mr-3" />,
          href: "/",
        },
        {
          title: "Income & Expenses",
          icon: <CreditCard className="w-5 h-5 mr-3" />,
          href: "/income-expenses",
        },
        {
          title: "Savings & Investments",
          icon: <TrendingUp className="w-5 h-5 mr-3" />,
          href: "/savings-investments",
        },
      ],
    },
    {
      title: "Calculators",
      items: [
        {
          title: "Salary Calculator",
          icon: <PoundSterling className="w-5 h-5 mr-3" />,
          href: "/salary-calculator",
        },
        {
          title: "Mortgage Calculator",
          icon: <Home className="w-5 h-5 mr-3" />,
          href: "/mortgage-calculator",
        },
        {
          title: "Mortgage Overpayment",
          icon: <FileText className="w-5 h-5 mr-3" />,
          href: "/mortgage-overpayment",
        },
        {
          title: "Pension Calculator",
          icon: <Clock className="w-5 h-5 mr-3" />,
          href: "/pension-calculator",
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          title: "Settings",
          icon: <Settings className="w-5 h-5 mr-3" />,
          href: "/settings",
        },
        {
          title: "Logout",
          icon: <LogOut className="w-5 h-5 mr-3" />,
          href: "#",
          onClick: () => logoutMutation.mutate(),
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile navbar/header - fixed at top */}
      <div className="lg:hidden flex items-center justify-between p-3 bg-primary text-primary-foreground fixed top-0 left-0 right-0 z-20 shadow-md">
        <div className="flex items-center space-x-2">
          <PoundSterling className="w-5 h-5" />
          <span className="font-semibold text-base">Finance Tracker</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-md hover:bg-primary-foreground/10"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Spacer for mobile to prevent content from being hidden under navbar */}
      <div className="h-12 lg:hidden"></div>

      {/* Sidebar */}
      <aside 
        className={cn(
          "w-64 lg:w-56 h-[calc(100vh-48px)] lg:h-screen bg-primary text-primary-foreground flex-shrink-0 fixed lg:sticky top-12 lg:top-0 z-30 transition-all duration-300 transform overflow-hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        {/* Desktop logo */}
        <div className="p-3 hidden lg:flex items-center border-b border-primary-foreground/10">
          <PoundSterling className="w-5 h-5 mr-2" />
          <span className="font-bold text-base">Finance Tracker</span>
        </div>
        
        <nav className="h-full overflow-y-auto pb-20">
          <ul className="p-2 w-full">
            {navItems.map((section, idx) => (
              <li key={idx} className="mb-3">
                <div className="px-3 py-1.5 text-xs uppercase text-primary-foreground/60 font-semibold tracking-wider">
                  {section.title}
                </div>
                <ul>
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="mb-1">
                      {item.onClick ? (
                        <button
                          onClick={item.onClick}
                          className={cn(
                            "flex items-center px-3 py-1.5 w-full text-left text-sm text-primary-foreground hover:bg-white/10 rounded-md",
                            location === item.href && "bg-white/10 font-medium"
                          )}
                        >
                          {item.icon}
                          {item.title}
                        </button>
                      ) : (
                        <Link 
                          href={item.href}
                          className={cn(
                            "flex items-center px-3 py-1.5 text-sm text-primary-foreground hover:bg-white/10 rounded-md",
                            location === item.href && "bg-white/10 font-medium"
                          )}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.icon}
                          {item.title}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Overlay when mobile menu is open */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
