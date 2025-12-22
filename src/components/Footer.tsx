import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import lightLogo from '../assets/logo-light.png';
import darkLogo from '../assets/logo-dark.png';

export default function Footer() {
  const { darkMode } = useTheme();
  const logo = darkMode ? darkLogo : lightLogo;

  return (
    <footer className="bg-white dark:bg-[#080A12] text-gray-900 dark:text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <img src={logo} alt="ProPM" className="h-10 md:h-16 w-auto" />
            </Link>
            <p className="text-sm mb-4">
              Learn Project Management by doing real projects. Practical training for students and young professionals.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@propm.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+233 20 000 0000</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Accra, Ghana</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/contact" className="hover:text-blue-500 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-500 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-500 transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-blue-500 transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-[#11162a] mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} ProPM. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
