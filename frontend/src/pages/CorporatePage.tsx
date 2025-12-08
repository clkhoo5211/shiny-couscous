import React from 'react';
import { NewHeader } from '@/components/NewHeader';
import { NewFooter } from '@/components/NewFooter';
import { NewHero } from '@/components/NewHero';
import { NewServiceCard } from '@/components/NewServiceCard';

export function CorporatePage() {
  // Image URLs from Unsplash - EXACT same as Generate Marketing Site Project
  const heroImage = 'https://images.unsplash.com/photo-1718350811967-7f0d37693a48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=2400';
  const financialImage = 'https://images.unsplash.com/photo-1765062166529-10ac56e26936?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200';
  const technologyImage = 'https://images.unsplash.com/photo-1559445368-b8a993676d7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200';
  const lifestyleImage = 'https://images.unsplash.com/photo-1610879485443-c472257793d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200';

  return (
    <>
      <NewHeader transparent={true} />
      <main>
        <NewHero imageUrl={heroImage} />

        {/* Intro Section */}
        <section className="py-24 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="max-w-[900px] mx-auto text-center">
              <h2 className="mb-6">Explore how to establish your business</h2>
              <p className="text-[#6B7280] text-xl">
                MIFC offers a comprehensive ecosystem for financial and non-financial businesses, 
                cutting-edge technology companies, and lifestyle ventures. Discover the opportunities 
                that await in the world&apos;s most inspiring financial centre.
              </p>
            </div>
          </div>
        </section>

        {/* Financial Businesses Section */}
        <section id="businesses" className="py-24 bg-gray-50">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="mb-12 text-center">Financial Businesses</h2>
            <NewServiceCard
              title="Banking & Investment Services"
              description="Establish your financial institution in a progressive regulatory environment. MIFC provides a robust framework for banking, asset management, and investment services with international standards and local expertise."
              imageUrl={financialImage}
              layout="horizontal"
              className="mb-8"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <NewServiceCard
                title="Asset Management"
                description="Build and manage investment portfolios with access to global markets and sophisticated infrastructure."
                imageUrl="https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
                layout="vertical"
              />
              <NewServiceCard
                title="Insurance Services"
                description="Develop innovative insurance solutions in a forward-thinking regulatory environment."
                imageUrl="https://images.unsplash.com/photo-1554224155-6726b3ff858f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
                layout="vertical"
              />
              <NewServiceCard
                title="Private Banking"
                description="Offer exclusive private banking services to high-net-worth individuals and families."
                imageUrl="https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
                layout="vertical"
              />
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section id="technology" className="py-24 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="mb-12 text-center">Blockchain & AI Technologies</h2>
            <NewServiceCard
              title="Next-Generation Financial Technology"
              description="Pioneer the future of finance with blockchain, artificial intelligence, and digital assets. MIFC embraces innovation and provides the regulatory clarity needed for cutting-edge financial technology companies."
              imageUrl={technologyImage}
              layout="horizontal"
              className="mb-8"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <NewServiceCard
                title="Digital Assets & Crypto"
                description="Launch cryptocurrency exchanges, digital wallet services, and tokenization platforms with regulatory support."
                imageUrl="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
                layout="vertical"
              />
              <NewServiceCard
                title="AI-Powered Finance"
                description="Develop artificial intelligence solutions for trading, risk management, and customer service automation."
                imageUrl="https://images.unsplash.com/photo-1677442136019-21780ecad995?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
                layout="vertical"
              />
            </div>
          </div>
        </section>

        {/* Lifestyle Section */}
        <section id="lifestyle" className="py-24 bg-gray-50">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="mb-12 text-center">Lifestyle & Wellbeing</h2>
            <NewServiceCard
              title="Luxury Living & Wellness"
              description="Experience unparalleled lifestyle amenities in paradise. MIFC offers more than business opportunities—it provides a world-class living environment with luxury accommodations, wellness facilities, and cultural experiences."
              imageUrl={lifestyleImage}
              layout="horizontal"
              className="mb-8"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <NewServiceCard
                title="Premium Residences"
                description="Access exclusive residential properties designed for professionals and their families."
                imageUrl="https://images.unsplash.com/photo-1613490493576-7fde63acd811?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
                layout="vertical"
              />
              <NewServiceCard
                title="Wellness & Recreation"
                description="Enjoy world-class wellness centers, spa facilities, and recreational activities."
                imageUrl="https://images.unsplash.com/photo-1540555700478-4be289fbecef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
                layout="vertical"
              />
              <NewServiceCard
                title="Cultural Experiences"
                description="Immerse yourself in the rich culture and natural beauty of the Maldives."
                imageUrl="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
                layout="vertical"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="about" className="py-24 bg-[#66D8CC] text-white">
          <div className="max-w-[1200px] mx-auto px-6 text-center">
            <h2 className="mb-6 text-white">Ready to establish your presence in MIFC?</h2>
            <p className="text-xl mb-8 max-w-[700px] mx-auto opacity-90">
              Join the world&apos;s most forward-thinking financial centre and be part of shaping the future of finance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center justify-center px-8 py-4 bg-[#C99A6B] text-white hover:bg-[#B88A5B] transition-all duration-300">
                Contact us today
              </button>
              <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-[#66D8CC] transition-all duration-300">
                Download brochure
              </button>
            </div>
          </div>
        </section>
      </main>
      <NewFooter />
    </>
  );
}
