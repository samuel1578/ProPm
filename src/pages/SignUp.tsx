import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import logo from '../assets/logo-light.png';
import { useAuth } from '../context/AuthContext';

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const redirectTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const { signUp: register, user, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (redirectTimerRef.current) window.clearTimeout(redirectTimerRef.current);
    };
  }, [user, navigate]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    toastTimerRef.current = timer;
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = (message: string, variant: 'success' | 'error') => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast({ message, variant });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match!', 'error');
      return;
    }
    setLoading(true);
    try {
      const user = await register(formData.email, formData.password, formData.name);
      const fullName = user?.name?.trim() || formData.name.trim();
      const firstName = fullName ? fullName.split(' ')[0] : '';
      showToast(`Welcome${firstName ? `, ${firstName}` : ''}! Redirecting...`, 'success');
      if (redirectTimerRef.current) window.clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = window.setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);
    } catch (err: any) {
      showToast(err?.message || 'Sign up failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleSignIn = () => {
    signInWithGoogle().catch((err: any) => {
      showToast(err?.message || 'Google sign-in failed', 'error');
    });
  };

  return (
    <>
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-opacity ${toast.variant === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}
        >
          {toast.message}
        </div>
      )}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-[#09122d] dark:to-[#040815] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-[#0f1e45] rounded-lg shadow-xl p-8 border border-transparent dark:border-white/10 transition-colors">
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center justify-center space-x-2 mb-4">
                <img src={logo} alt="ProPM" className="site-logo w-auto object-contain" />
              </Link>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Your Account</h2>
              <p className="text-gray-600 dark:text-gray-300">Start your PM learning journey today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-white/20 bg-white dark:bg-transparent text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-white/20 bg-white dark:bg-transparent text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-white/20 bg-white dark:bg-transparent text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="••••••••"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Must be at least 8 characters</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-white/20 bg-white dark:bg-transparent text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-700 dark:text-gray-300">
                    I agree to the{' '}
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-700">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-700">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 hover:shadow-xl'}`}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-[#0f1e45] text-gray-500 dark:text-gray-300">Or sign up with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  aria-label="Continue with Google"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white/20 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="h-5 w-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M533.5 278.4c0-17.4-1.6-34-4.6-50.2H272v95.1h147.8c-6.4 34.9-25 64.5-53.7 84.3v70.1h86.8c50.8-46.8 82.6-115.8 82.6-199.3z" fill="#4285F4" />
                    <path d="M272 544.3c72.6 0 133.6-23.9 178.1-64.9l-86.8-70.1c-24.1 16.3-55 26-91.3 26-70.3 0-129.9-47.4-151.3-111.2H32.6v69.8C77.1 486.2 169.6 544.3 272 544.3z" fill="#34A853" />
                    <path d="M120.7 329.1c-10.9-32.8-10.9-68.3 0-101.1V158.2H32.6c-41.6 83.5-41.6 182.8 0 266.3l88.1-95.4z" fill="#FBBC04" />
                    <path d="M272 109.6c39.5 0 75 13.6 103 40.5l77.4-77.4C405.2 24.5 345.6 0 272 0 169.6 0 77.1 58.1 32.6 158.2l88.1 69.8C142.1 157 201.7 109.6 272 109.6z" fill="#EA4335" />
                  </svg>
                  <span>Google</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
