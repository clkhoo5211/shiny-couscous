import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

// Scroll progress indicator
const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0)

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const progress = (window.scrollY / totalHeight) * 100
      setScrollProgress(progress)
    })
  }

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div 
        className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-300"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  )
}

// Back to top button
const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setIsVisible(window.scrollY > 300)
    })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
      }`}
    >
      <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  )
}

// Animated card wrapper
const AnimatedCard = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  return (
    <div 
      className="animate-fadeIn"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// Counter animation component
const StatCounter = ({ end, duration = 2000, suffix = '', prefix = '' }: { end: number, duration?: number, suffix?: string, prefix?: string }) => {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  if (typeof window !== 'undefined' && !hasAnimated) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setHasAnimated(true)
        const step = end / (duration / 16)
        let current = 0
        const timer = setInterval(() => {
          current += step
          if (current >= end) {
            setCount(end)
            clearInterval(timer)
          } else {
            setCount(Math.floor(current))
          }
        }, 16)
      }
    })

    const element = document.getElementById(`counter-${end}`)
    if (element) observer.observe(element)
  }

  return (
    <p id={`counter-${end}`} className="text-3xl font-black text-gray-900 mb-1">
      {prefix}{count}{suffix}
    </p>
  )
}

export function BankingPage() {
  return (
    <>
      <ScrollProgress />
      <BackToTop />
      <Header />
      <main className="pt-0 lg:pt-32">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <div className="text-center">
              <AnimatedCard>
                <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                  <svg className="w-5 h-5 mr-2 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-sm font-semibold">Banking Services</span>
                </div>
              </AnimatedCard>
              
              <AnimatedCard delay={100}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                  International Banking <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                    Excellence
                  </span>
                </h1>
              </AnimatedCard>

              <AnimatedCard delay={200}>
                <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                  MIFC is home to more than 50 international banks offering comprehensive wholesale commercial and investment banking solutions
                </p>
              </AnimatedCard>

              <AnimatedCard delay={300}>
                <div className="flex flex-wrap justify-center gap-4">
                  <a href="#services" className="group inline-flex items-center px-8 py-4 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105">
                    Explore Services
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                  <a href="#application" className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all">
                    Apply for License
                  </a>
                </div>
              </AnimatedCard>
            </div>
          </div>

          {/* Wave separator */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
            </svg>
          </div>
        </section>

        {/* Quick Stats Section */}
        <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <AnimatedCard delay={0}>
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-blue-100 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <StatCounter end={50} duration={2000} suffix="+" />
                  <p className="text-sm text-gray-600 font-semibold">Licensed Banks</p>
                </div>
              </AnimatedCard>

              <AnimatedCard delay={100}>
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-indigo-100 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <StatCounter end={100} duration={2000} suffix="%" />
                  <p className="text-sm text-gray-600 font-semibold">Asia Pacific Focus</p>
                </div>
              </AnimatedCard>

              <AnimatedCard delay={200}>
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-purple-100 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <p className="text-3xl font-black text-gray-900 mb-1">Dual</p>
                  <p className="text-sm text-gray-600 font-semibold">Financial System</p>
                </div>
              </AnimatedCard>

              <AnimatedCard delay={300}>
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-green-100 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-3xl font-black text-gray-900 mb-1">Digital</p>
                  <p className="text-sm text-gray-600 font-semibold">Banking Ready</p>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </section>

        {/* Banking Services Section */}
        <section id="services" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <AnimatedCard>
                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-4">
                  COMPREHENSIVE SOLUTIONS
                </span>
              </AnimatedCard>
              <AnimatedCard delay={100}>
                <h2 className="text-4xl font-black text-gray-900 mb-4">
                  Banking <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Services</span>
                </h2>
              </AnimatedCard>
              <AnimatedCard delay={200}>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Wide range of wholesale commercial and investment banking solutions
                </p>
              </AnimatedCard>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Service Card 1 */}
              <AnimatedCard delay={0}>
                <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full -mr-16 -mt-16 opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Project & Infrastructure Funding</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">Specialized financing solutions for large-scale infrastructure and development projects across the region</p>
                    <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                      Learn More
                      <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </AnimatedCard>

              {/* Service Card 2 */}
              <AnimatedCard delay={100}>
                <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full -mr-16 -mt-16 opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">Structured Borrowings</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">Tailored structured financing products designed to meet complex business requirements</p>
                    <div className="flex items-center text-indigo-600 font-semibold group-hover:gap-2 transition-all">
                      Learn More
                      <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </AnimatedCard>

              {/* Service Card 3 */}
              <AnimatedCard delay={200}>
                <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full -mr-16 -mt-16 opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">Trade & Export Financing</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">Comprehensive trade finance facilities supporting international business flows</p>
                    <div className="flex items-center text-purple-600 font-semibold group-hover:gap-2 transition-all">
                      Learn More
                      <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </AnimatedCard>

              {/* Service Card 4 */}
              <AnimatedCard delay={300}>
                <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full -mr-16 -mt-16 opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">Treasury Services</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">Advanced treasury management and foreign exchange solutions for corporate clients</p>
                    <div className="flex items-center text-green-600 font-semibold group-hover:gap-2 transition-all">
                      Learn More
                      <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </AnimatedCard>

              {/* Service Card 5 */}
              <AnimatedCard delay={400}>
                <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500 to-red-600 rounded-full -mr-16 -mt-16 opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">Financial Advisory</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">Expert financial advisory services for complex transactions and strategic initiatives</p>
                    <div className="flex items-center text-orange-600 font-semibold group-hover:gap-2 transition-all">
                      Learn More
                      <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </AnimatedCard>

              {/* Service Card 6 */}
              <AnimatedCard delay={500}>
                <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full -mr-16 -mt-16 opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-cyan-600 transition-colors">Digital Financial Services</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">Cutting-edge digital banking solutions including digital banking operations</p>
                    <div className="flex items-center text-cyan-600 font-semibold group-hover:gap-2 transition-all">
                      Learn More
                      <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </section>

        {/* Dual Financial System Section */}
        <section className="py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <AnimatedCard>
                <div>
                  <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold mb-4">
                    DUAL SYSTEM
                  </span>
                  <h2 className="text-4xl font-black text-gray-900 mb-6">
                    Conventional & <br />
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Islamic Finance
                    </span>
                  </h2>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    Similar to Malaysia, MIFC offers a dual financial system comprising both conventional banking and Islamic finance, providing comprehensive solutions for diverse client needs.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Conventional Banking</h4>
                        <p className="text-gray-600 text-sm">Full suite of international banking services</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Islamic Finance</h4>
                        <p className="text-gray-600 text-sm">Shariah-compliant banking solutions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard delay={200}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl transform rotate-3"></div>
                  <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <p className="font-bold text-gray-900">Conventional</p>
                        <p className="text-sm text-gray-600 mt-1">Traditional Banking</p>
                      </div>
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <p className="font-bold text-gray-900">Islamic</p>
                        <p className="text-sm text-gray-600 mt-1">Shariah-Compliant</p>
                      </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <p className="text-center text-sm text-gray-600">
                        <strong>Both systems</strong> offer comprehensive banking solutions tailored for international business
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </section>

        {/* Regional Hub Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-12 items-center p-8 lg:p-16">
                <AnimatedCard>
                  <div className="text-white">
                    <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-semibold">REGIONAL HUB</span>
                    </div>
                    <h2 className="text-4xl font-black mb-6">
                      Asia Pacific's Banking Gateway
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                      Majority of Maldives banks belong to international banking groups from the Asia Pacific region, operating as a strategic hub to tap into Asia's growing business flows and cross-border opportunities.
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-4xl font-black mb-2">Asia</p>
                        <p className="text-blue-200 text-sm">Primary Market Focus</p>
                      </div>
                      <div>
                        <p className="text-4xl font-black mb-2">Global</p>
                        <p className="text-blue-200 text-sm">Network Reach</p>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard delay={200}>
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl"></div>
                    <div className="relative p-8 space-y-6">
                      {['Cross-Border Trade', 'Investment Opportunities', 'Infrastructure Funding', 'Regional Connectivity'].map((item, index) => (
                        <div key={index} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="text-white font-bold">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </AnimatedCard>
              </div>
            </div>
          </div>
        </section>

        {/* Application Process Section */}
        <section id="application" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <AnimatedCard>
                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-4">
                  GET STARTED
                </span>
              </AnimatedCard>
              <AnimatedCard delay={100}>
                <h2 className="text-4xl font-black text-gray-900 mb-4">
                  Application <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Process</span>
                </h2>
              </AnimatedCard>
              <AnimatedCard delay={200}>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Streamlined licensing process for banking operations
                </p>
              </AnimatedCard>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  icon: (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ),
                  title: 'Application',
                  description: 'Submit application with required documents meeting minimum eligibility criteria',
                  link: 'View Forms',
                  href: 'login'
                },
                {
                  icon: (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ),
                  title: 'Fees & Charter',
                  description: 'Annual fees payable upon license grant and by January 15 each year',
                  link: 'View Fees',
                  href: '#fees'
                },
                {
                  icon: (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  title: 'Legislation',
                  description: 'Review relevant laws, regulations and guidelines governing banking operations',
                  link: 'View Legislation',
                  href: '#legislation'
                }
              ].map((step, index) => (
                <AnimatedCard key={index} delay={index * 100}>
                  <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{step.description}</p>
                    <a href={step.href} className="inline-flex items-center text-blue-600 font-bold hover:gap-2 transition-all">
                      {step.link}
                      <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </a>
                  </div>
                </AnimatedCard>
              ))}
            </div>

            <AnimatedCard delay={300}>
              <div className="bg-blue-600 rounded-2xl p-8 text-center text-white">
                <h3 className="text-2xl font-bold mb-3">Flexible Operations</h3>
                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                  A Maldives bank can operate as a branch or subsidiary and establish offices in other parts of Malaysia to facilitate business operations
                </p>
                <a href="#contact" className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-xl">
                  Contact Us for More Info
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </div>
            </AnimatedCard>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedCard>
              <h2 className="text-4xl font-black mb-6">Ready to Establish Your Banking Operations?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Join over 50 international banks operating in MIFC
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="#contact" className="inline-flex items-center px-8 py-4 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-xl">
                  Get in Touch
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <a href="#faq" className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all">
                  View FAQ
                </a>
              </div>
            </AnimatedCard>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
