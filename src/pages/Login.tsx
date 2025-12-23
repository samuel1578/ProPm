import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import lightLogo from '../assets/logo-light.png';
import darkLogo from '../assets/logo-dark.png';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { darkMode } = useTheme();
  const logo = darkMode ? darkLogo : lightLogo;
  const { signIn: authenticate, user, initializing, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const redirectTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!initializing && user) {
      navigate('/', { replace: true });
    }
  }, [user, initializing, navigate]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => setToast(null), 3000);
    toastTimerRef.current = timer;
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authenticate(formData.email, formData.password);
      setToast({ message: 'Sign-in successful! Redirecting…', variant: 'success' });
      redirectTimerRef.current = window.setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);
    } catch (err: any) {
      const message = err?.message || 'Login failed';
      setToast({ message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleSignIn = () => {
    signInWithGoogle().catch((err: any) => {
      const message = err?.message || 'Google sign-in failed';
      setToast({ message, variant: 'error' });
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-white dark:from-[#0d2244] dark:via-[#071330] dark:to-[#050b1a] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-[#080B13] border border-gray-100 dark:border-[#080B13] rounded-lg shadow-xl shadow-blue-500/10 p-8">
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center justify-center space-x-2 mb-4">
                <img src={logo} alt="ProPM" className="site-logo w-auto object-contain" />
              </Link>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h2>
              <p className="text-gray-600 dark:text-gray-300">Sign in to access your courses</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white dark:bg-[#071330] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
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
                    <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white dark:bg-[#071330] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/40 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 hover:shadow-blue-500/60'}`}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200 transition-colors">
                  Sign up
                </Link>
              </p>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-[#080B13] text-gray-500 dark:text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <button
                  type="button"
                  aria-label="Continue with Google"
                  onClick={handleGoogleSignIn}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#0d1f3b] transition-colors flex items-center justify-center gap-2"
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
            <Link to="/" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300 transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
