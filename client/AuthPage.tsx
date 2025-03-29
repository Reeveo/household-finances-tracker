import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam === "register" ? "register" : "login");

  // Form state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ 
    username: '', 
    password: '', 
    name: '', 
    email: '' 
  });

  // Loading and error states
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');

  // Update tab when URL changes
  useEffect(() => {
    const currentParams = new URLSearchParams(location.search);
    const currentTab = currentParams.get('tab');
    setActiveTab(currentTab === "register" ? "register" : "login");
  }, [location.search]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/auth-page${tab === "register" ? "?tab=register" : ""}`);
  };

  // Handle login form changes
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle registration form changes
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle login submission
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoginLoading(true);
    setLoginError('');
    
    try {
      // For demo, just log the values and simulate success
      console.log('Login data:', loginForm);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful login
      alert(`Login successful! Welcome back, ${loginForm.username}`);
      navigate('/dashboard');
    } catch (error) {
      setLoginError('Login failed. Please check your credentials and try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Handle registration submission
  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsRegisterLoading(true);
    setRegisterError('');
    
    try {
      // For demo, just log the values and simulate success
      console.log('Registration data:', registerForm);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful registration
      alert(`Registration successful! Welcome, ${registerForm.username}`);
      navigate('/dashboard');
    } catch (error) {
      setRegisterError('Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-indigo-600 p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-white text-xl font-bold">Finance Tracker</h1>
            <Link to="/" className="text-indigo-200 hover:text-white">
              Home
            </Link>
          </div>
          <p className="text-indigo-100 mt-1">Manage your finances with ease</p>
        </div>
        
        <div className="p-6">
          <div className="flex border-b border-gray-200 mb-6">
            <button 
              className={`pb-2 w-1/2 text-center font-medium ${activeTab === 'login' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => handleTabChange('login')}
            >
              Login
            </button>
            <button 
              className={`pb-2 w-1/2 text-center font-medium ${activeTab === 'register' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => handleTabChange('register')}
            >
              Register
            </button>
          </div>
          
          {activeTab === 'login' ? (
            <div>
              <h2 className="text-lg font-semibold mb-4">Welcome back</h2>
              <form 
                onSubmit={handleLoginSubmit}
                className="space-y-4"
                data-testid="login-form"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input 
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md" 
                    type="text" 
                    name="username"
                    value={loginForm.username}
                    onChange={handleLoginChange}
                    placeholder="Enter your username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input 
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md" 
                    type="password" 
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <button 
                  className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                  type="submit"
                  disabled={isLoginLoading}
                >
                  {isLoginLoading ? 'Logging in...' : 'Login'}
                </button>
                {loginError && (
                  <p className="text-red-500 text-sm">{loginError}</p>
                )}
              </form>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold mb-4">Create an account</h2>
              <form 
                onSubmit={handleRegisterSubmit}
                className="space-y-4"
                data-testid="register-form"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input 
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md" 
                    type="text" 
                    name="name"
                    value={registerForm.name}
                    onChange={handleRegisterChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input 
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md" 
                    type="email" 
                    name="email"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input 
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md" 
                    type="text" 
                    name="username"
                    value={registerForm.username}
                    onChange={handleRegisterChange}
                    placeholder="Choose a username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input 
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md" 
                    type="password" 
                    name="password"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    placeholder="Choose a password"
                    required
                  />
                </div>
                <button 
                  className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                  type="submit"
                  disabled={isRegisterLoading}
                >
                  {isRegisterLoading ? 'Creating account...' : 'Register'}
                </button>
                {registerError && (
                  <p className="text-red-500 text-sm">{registerError}</p>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 