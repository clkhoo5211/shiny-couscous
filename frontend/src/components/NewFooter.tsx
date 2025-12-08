import React, { useState } from 'react';
import { Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';

export function NewFooter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <footer className="bg-[#111111] text-white pt-16 pb-8">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* About */}
          <div>
            <h4 className="text-[#C99A6B] mb-4 uppercase tracking-wider text-sm">MIFC</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              The Maldives International Financial Centre is committed to delivering world-class financial services and innovation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#C99A6B] mb-4 uppercase tracking-wider text-sm">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#businesses" className="text-gray-400 text-sm hover:text-white transition-colors">Financial Businesses</a></li>
              <li><a href="#businesses" className="text-gray-400 text-sm hover:text-white transition-colors">Non-Financial Businesses</a></li>
              <li><a href="#technology" className="text-gray-400 text-sm hover:text-white transition-colors">Blockchain & AI</a></li>
              <li><a href="#lifestyle" className="text-gray-400 text-sm hover:text-white transition-colors">Lifestyle & Wellbeing</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-[#C99A6B] mb-4 uppercase tracking-wider text-sm">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">FAQs</a></li>
              <li><a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[#C99A6B] mb-4 uppercase tracking-wider text-sm">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-4">Stay updated with our latest news and opportunities.</p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#C99A6B] transition-colors"
                required
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-[#C99A6B] text-white hover:bg-[#B88A5B] transition-colors text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Maldives International Financial Centre. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-[#C99A6B] transition-colors" aria-label="Facebook">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-[#C99A6B] transition-colors" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-[#C99A6B] transition-colors" aria-label="YouTube">
              <Youtube className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-[#C99A6B] transition-colors" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
