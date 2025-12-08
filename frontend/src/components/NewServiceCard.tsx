import React from 'react';
import { ArrowRight } from 'lucide-react';

interface NewServiceCardProps {
  title: string;
  description: string;
  imageUrl: string;
  layout?: 'horizontal' | 'vertical';
  className?: string;
}

export function NewServiceCard({ 
  title, 
  description, 
  imageUrl, 
  layout = 'horizontal',
  className = '' 
}: NewServiceCardProps) {
  if (layout === 'vertical') {
    return (
      <div className={`group cursor-pointer ${className}`}>
        <div className="relative overflow-hidden rounded-sm mb-4 h-64">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        </div>
        <h3 className="mb-3">{title}</h3>
        <p className="text-[#6B7280] mb-4 line-clamp-3">{description}</p>
        <div className="flex items-center gap-2 text-[#66D8CC] group-hover:gap-4 transition-all">
          <span className="text-sm uppercase tracking-wider">Learn more</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className={`group cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl rounded-sm overflow-hidden ${className}`}>
      <div className="flex flex-col md:flex-row h-full">
        {/* Image */}
        <div className="relative md:w-1/2 h-64 md:h-auto overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        </div>

        {/* Content */}
        <div className="md:w-1/2 p-8 lg:p-12 bg-white flex flex-col justify-center">
          <h3 className="mb-4">{title}</h3>
          <p className="text-[#6B7280] mb-6">{description}</p>
          <div className="flex items-center gap-2 text-[#66D8CC] group-hover:gap-4 transition-all">
            <span className="text-sm uppercase tracking-wider">Learn more</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
