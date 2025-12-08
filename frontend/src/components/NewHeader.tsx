import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import mifcHeaderLogo from '@/assets/mifc-header-logo.png';

interface NewHeaderProps {
  transparent?: boolean;
}

export function NewHeader({ transparent = false }: NewHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerClass = transparent && !isScrolled
    ? 'bg-transparent'
    : 'bg-white shadow-sm';

  const textClass = transparent && !isScrolled
    ? 'text-white'
    : 'text-[#111111]';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerClass}`}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="transition-opacity duration-300">
            <img 
              src={mifcHeaderLogo}
              alt="MIFC Logo" 
              className="h-12" 
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-12">
            <a href="#home" className={`uppercase tracking-[0.08em] text-sm hover:text-[#C99A6B] transition-colors ${textClass}`}>
              Home
            </a>
            <a href="#businesses" className={`uppercase tracking-[0.08em] text-sm hover:text-[#C99A6B] transition-colors ${textClass}`}>
              Businesses
            </a>
            <a href="#technology" className={`uppercase tracking-[0.08em] text-sm hover:text-[#C99A6B] transition-colors ${textClass}`}>
              Technology
            </a>
            <a href="#lifestyle" className={`uppercase tracking-[0.08em] text-sm hover:text-[#C99A6B] transition-colors ${textClass}`}>
              Lifestyle
            </a>
            <a href="#about" className={`uppercase tracking-[0.08em] text-sm hover:text-[#C99A6B] transition-colors ${textClass}`}>
              About
            </a>
            <button className={`flex items-center gap-1 uppercase tracking-[0.08em] text-sm hover:text-[#C99A6B] transition-colors ${textClass}`}>
              EN
              <ChevronDown className="w-4 h-4" />
            </button>
            {/* E-Submission Button */}
            <Link
              to="/login"
              className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all uppercase tracking-[0.08em] text-sm shadow-lg hover:shadow-xl ${transparent && !isScrolled ? '' : ''}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              E-Submission
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden ${textClass}`}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t">
          <nav className="max-w-[1200px] mx-auto px-6 py-6 flex flex-col gap-4">
            <a href="#home" className="uppercase tracking-[0.08em] text-sm text-[#111111] hover:text-[#C99A6B]" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </a>
            <a href="#businesses" className="uppercase tracking-[0.08em] text-sm text-[#111111] hover:text-[#C99A6B]" onClick={() => setIsMobileMenuOpen(false)}>
              Businesses
            </a>
            <a href="#technology" className="uppercase tracking-[0.08em] text-sm text-[#111111] hover:text-[#C99A6B]" onClick={() => setIsMobileMenuOpen(false)}>
              Technology
            </a>
            <a href="#lifestyle" className="uppercase tracking-[0.08em] text-sm text-[#111111] hover:text-[#C99A6B]" onClick={() => setIsMobileMenuOpen(false)}>
              Lifestyle
            </a>
            <a href="#about" className="uppercase tracking-[0.08em] text-sm text-[#111111] hover:text-[#C99A6B]" onClick={() => setIsMobileMenuOpen(false)}>
              About
            </a>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all uppercase tracking-[0.08em] text-sm mt-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              E-Submission
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
