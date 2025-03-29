import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  PiggyBank, 
  BarChart, 
  Calculator, 
  Settings, 
  LogOut,
  ChevronDown,
  ChevronRight,
  Home,
  TrendingUp,
  Wallet,
  Landmark
} from 'lucide-react';

export function Sidebar() {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['calculators']);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isSubmenuActive = (paths: string[]) => {
    return paths.some(path => location.pathname.startsWith(path));
  };
  
  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => 
      prev.includes(menu) 
        ? prev.filter(item => item !== menu)
        : [...prev, menu]
    );
  };
  
  const mainNavItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: <LayoutDashboard className="h-5 w-5" /> 
    },
    { 
      name: 'Transactions', 
      path: '/transactions', 
      icon: <CreditCard className="h-5 w-5" /> 
    },
    { 
      name: 'Savings', 
      path: '/savings', 
      icon: <PiggyBank className="h-5 w-5" /> 
    },
    { 
      name: 'Analytics', 
      path: '/analytics', 
      icon: <BarChart className="h-5 w-5" /> 
    },
  ];

  const calculatorItems = [
    {
      name: 'Mortgage Calculator',
      path: '/calculators/mortgage',
      icon: <Home className="h-4 w-4" />
    },
    {
      name: 'Mortgage Overpayment',
      path: '/calculators/mortgage-overpayment',
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      name: 'Pension Calculator',
      path: '/calculators/pension',
      icon: <Wallet className="h-4 w-4" />
    },
    {
      name: 'Salary Calculator',
      path: '/calculators/salary',
      icon: <Landmark className="h-4 w-4" />
    }
  ];

  const isCalculatorsExpanded = expandedMenus.includes('calculators');
  const isCalculatorsActive = isSubmenuActive(['/calculators']);

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-indigo-600">Finance Tracker</h2>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {/* Main navigation items */}
        {mainNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-3 py-2 rounded-md transition-colors ${
              isActive(item.path)
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {item.icon}
            <span className="ml-3">{item.name}</span>
          </Link>
        ))}

        {/* Calculators with submenu */}
        <div className="space-y-1">
          <button
            onClick={() => toggleMenu('calculators')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
              isCalculatorsActive
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center">
              <Calculator className="h-5 w-5" />
              <span className="ml-3">Calculators</span>
            </div>
            {isCalculatorsExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          
          {/* Calculator submenu */}
          {isCalculatorsExpanded && (
            <div className="pl-9 space-y-1 mt-1">
              {calculatorItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-1.5 text-sm rounded-md transition-colors ${
                    isActive(item.path)
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <Link
          to="/settings"
          className={`flex items-center px-3 py-2 rounded-md transition-colors ${
            isActive('/settings')
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Settings className="h-5 w-5" />
          <span className="ml-3">Settings</span>
        </Link>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <Link
          to="/"
          className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="ml-3">Logout</span>
        </Link>
      </div>
    </aside>
  );
}
