import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Check, X } from 'lucide-react';
import logo from '../assets/logo-light.png';
import { useAuth } from '../context/AuthContext';

// Common weak passwords to block
const weakPasswords = [
  '123456', 'password', '123456789', 'qwerty', 'abc123', 'password123', 'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'iloveyou', 'princess', 'rockyou', '1234567', '12345678', 'sunshine', 'qwerty123', 'football', 'baseball', 'trustno1', 'jennifer', 'jordan', 'superman', 'michael', 'ninja', 'mustang', 'jessica', 'pepper', 'zaq1zaq1', 'qazwsx', 'test123', 'hello123', 'flower', 'shadow', 'master', 'dragon', 'passw0rd', '123qwe', '654321', 'qwertyuiop', '1q2w3e4r', 'google', 'facebook', 'linkedin', 'instagram', 'youtube', 'twitter', 'tiktok', 'snapchat'
];

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
  const { signUp: register, user } = useAuth();

  // Password strength checks
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    lowercase: false,
    number: false,
    notWeak: false,
  });

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

  // Update password checks in real-time
  useEffect(() => {
    const password = formData.password;
    setPasswordChecks({
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      notWeak: !weakPasswords.includes(password.toLowerCase()),
    });
  }, [formData.password]);

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
    // Check if all password requirements are met
    const allChecks = Object.values(passwordChecks).every(check => check);
    if (!allChecks) {
      showToast('Password does not meet requirements!', 'error');
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
                    placeholder="Your Full Name"
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
                {/* Password strength indicator */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-xs">
                    {passwordChecks.length ? <Check className="h-4 w-4 text-green-500 mr-2" /> : <X className="h-4 w-4 text-red-500 mr-2" />}
                    <span className={passwordChecks.length ? 'text-green-600' : 'text-red-600'}>At least 8 characters</span>
                  </div>
                  <div className="flex items-center text-xs">
                    {passwordChecks.lowercase ? <Check className="h-4 w-4 text-green-500 mr-2" /> : <X className="h-4 w-4 text-red-500 mr-2" />}
                    <span className={passwordChecks.lowercase ? 'text-green-600' : 'text-red-600'}>One lowercase letter</span>
                  </div>
                  <div className="flex items-center text-xs">
                    {passwordChecks.number ? <Check className="h-4 w-4 text-green-500 mr-2" /> : <X className="h-4 w-4 text-red-500 mr-2" />}
                    <span className={passwordChecks.number ? 'text-green-600' : 'text-red-600'}>One number</span>
                  </div>
                  <div className="flex items-center text-xs">
                    {passwordChecks.notWeak ? <Check className="h-4 w-4 text-green-500 mr-2" /> : <X className="h-4 w-4 text-red-500 mr-2" />}
                    <span className={passwordChecks.notWeak ? 'text-green-600' : 'text-red-600'}>Not a common weak password</span>
                  </div>
                </div>
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
