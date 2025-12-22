import { ReactNode, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  useEffect(() => {
    // Enforce new default logo sizes and clear any overrides saved by the LogoSizer
    try {
      localStorage.removeItem('--logo-mobile-size');
      localStorage.removeItem('--logo-desktop-size');
      localStorage.removeItem('logo-sizer-hidden');
    } catch { }
    const root = document.documentElement;
    root.style.setProperty('--logo-mobile-size', '56px');
    root.style.setProperty('--logo-desktop-size', '74px');
  }, []);

  return (
    <div className="flex flex-col min-h-screen transition-colors duration-200 bg-white text-gray-900 dark:bg-[#071330] dark:text-gray-100">
      <Header />
      <main className="flex-grow pt-16 lg:pt-20">{children}</main>
      <Footer />
    </div>
  );
}
