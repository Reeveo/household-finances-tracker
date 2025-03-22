import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState } from "react";
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
  PoundSterling
} from "lucide-react";

type SidebarProps = {
  className?: string;
};

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* Mobile navbar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-primary text-primary-foreground">
        <div className="flex items-center space-x-2">
          <PoundSterling className="w-6 h-6" />
          <span className="font-semibold text-lg">Personal Finance Tracker</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md hover:bg-primary-foreground/10"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={cn(
          "w-64 h-screen bg-primary text-primary-foreground flex-shrink-0 fixed lg:sticky top-0 z-10 transition-all duration-300 transform",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        <div className="p-4 flex items-center">
          <PoundSterling className="w-6 h-6 mr-2" />
          <span className="font-bold text-lg">Finance Tracker</span>
        </div>
        
        <nav className="mt-4 h-[calc(100vh-64px)] overflow-y-auto">
          <ul className="p-2 w-full">
            {navItems.map((section, idx) => (
              <li key={idx} className="mb-4">
                <div className="px-4 py-2 text-xs uppercase text-primary-foreground/60 font-semibold tracking-wider">
                  {section.title}
                </div>
                <ul>
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      {item.onClick ? (
                        <button
                          onClick={item.onClick}
                          className={cn(
                            "flex items-center px-4 py-2 w-full text-left text-primary-foreground hover:bg-white/10 rounded-md",
                            location === item.href && "bg-white/10"
                          )}
                        >
                          {item.icon}
                          {item.title}
                        </button>
                      ) : (
                        <Link 
                          href={item.href}
                          className={cn(
                            "flex items-center px-4 py-2 text-primary-foreground hover:bg-white/10 rounded-md",
                            location === item.href && "bg-white/10"
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
          className="fixed inset-0 bg-black/50 z-[5] lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
