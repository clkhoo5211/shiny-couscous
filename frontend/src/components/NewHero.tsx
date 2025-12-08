import React from 'react';

interface NewHeroProps {
  imageUrl: string;
}

export function NewHero({ imageUrl }: NewHeroProps) {
  return (
    <section id="home" className="relative h-screen min-h-[700px] flex items-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
        role="img"
        aria-label="Luxurious waterfront promenade"
      >
        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(11,110,120,0.12) 0%, rgba(0,0,0,0.45) 100%)'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full">
        <div className="max-w-[800px]">
          <h1 className="text-white mb-6">
            Maldives International<br />Financial Centre
          </h1>
          <p className="text-white text-2xl mb-8 max-w-[600px]">
            Delivering the future of finance
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#businesses" className="inline-flex items-center justify-center px-8 py-4 bg-[#C99A6B] text-white hover:bg-[#B88A5B] transition-all duration-300 min-h-[44px] min-w-[44px]">
              Learn more about us
            </a>
            <a href="#explore" className="inline-flex items-center justify-center px-8 py-4 text-white hover:text-[#C99A6B] underline underline-offset-4 transition-all duration-300 min-h-[44px] min-w-[44px]">
              Explore opportunities
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
