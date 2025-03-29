import { Link } from 'react-router-dom';
import { Sidebar } from '../components/layout/sidebar';
import { Home, TrendingUp, Wallet, Landmark } from 'lucide-react';

export default function CalculatorsPage() {
  const calculators = [
    {
      title: 'Mortgage Calculator',
      description: 'Calculate monthly mortgage payments, interest costs, and amortization schedules',
      icon: <Home className="h-10 w-10 text-indigo-500" />,
      path: '/calculators/mortgage'
    },
    {
      title: 'Mortgage Overpayment',
      description: 'See how overpayments can reduce your mortgage term and save on interest',
      icon: <TrendingUp className="h-10 w-10 text-green-500" />,
      path: '/calculators/mortgage-overpayment'
    },
    {
      title: 'Pension Calculator',
      description: 'Estimate your retirement savings and expected pension value',
      icon: <Wallet className="h-10 w-10 text-blue-500" />,
      path: '/calculators/pension'
    },
    {
      title: 'Salary Calculator',
      description: 'Calculate take-home pay after tax and other deductions',
      icon: <Landmark className="h-10 w-10 text-yellow-500" />,
      path: '/calculators/salary'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Financial Calculators</h1>
            <p className="mt-2 text-lg text-gray-600">
              Tools to help you make informed financial decisions
            </p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {calculators.map((calculator) => (
              <Link 
                key={calculator.path}
                to={calculator.path}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all p-6 flex space-x-4"
              >
                <div className="flex-shrink-0">
                  {calculator.icon}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{calculator.title}</h2>
                  <p className="mt-2 text-gray-600">{calculator.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 