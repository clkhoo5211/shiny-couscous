import { ReactNode, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import apiClient from '@/api/client'
import { isAdminRole, preloadAdminRoles, isAdminRoleSync, getRolePermissions } from '@/lib/role-utils'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const navRef = useRef<HTMLElement>(null)
  const activeLinkRef = useRef<HTMLAnchorElement>(null)
  
  // Get user info from localStorage
  const [user, setUser] = useState<{id: string; email: string; name: string} | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userPermissions, setUserPermissions] = useState<string[]>([])

  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin')

  // Load user info on mount and when location changes
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedRole = localStorage.getItem('userRole')
    const token = localStorage.getItem('token')
    
    // Separate admin and user sessions based on route
    if (isAdminRoute) {
      // On admin routes, check if role is an admin role dynamically
      if (storedUser && token && storedRole && storedRole !== 'user') {
        // Preload roles and check if it's an admin role
        preloadAdminRoles().then(() => {
          isAdminRole(storedRole).then((isAdmin) => {
            if (isAdmin) {
        try {
          setUser(JSON.parse(storedUser))
          setUserRole(storedRole)
          setIsAuthenticated(true)
                // Load permissions for this role
                getRolePermissions(storedRole).then(setUserPermissions)
        } catch (e) {
          console.error('Error parsing user data:', e)
          setUser(null)
          setUserRole(null)
          setIsAuthenticated(false)
                setUserPermissions([])
              }
            } else {
              // Not an admin role, clear session
              setUser(null)
              setUserRole(null)
              setIsAuthenticated(false)
              setUserPermissions([])
            }
          })
        })
        // For immediate check, use sync version (may be false if cache not loaded yet)
        if (isAdminRoleSync(storedRole)) {
          try {
            setUser(JSON.parse(storedUser))
            setUserRole(storedRole)
            setIsAuthenticated(true)
          } catch (e) {
            console.error('Error parsing user data:', e)
          }
        }
      } else {
        // Clear user session if not admin on admin route
        setUser(null)
        setUserRole(null)
        setIsAuthenticated(false)
      }
    } else {
      // On user routes, only show user session (not admin)
      if (storedUser && token && storedRole === 'user') {
        try {
          setUser(JSON.parse(storedUser))
          setUserRole(storedRole)
          setIsAuthenticated(true)
        } catch (e) {
          console.error('Error parsing user data:', e)
          setUser(null)
          setUserRole(null)
          setIsAuthenticated(false)
        }
      } else {
        // Clear admin session if on user route
        setUser(null)
        setUserRole(null)
        setIsAuthenticated(false)
      }
    }
  }, [location.pathname, isAdminRoute])

  // Handle logout
  const handleLogout = async () => {
    try {
      await apiClient.logout()
    } catch (e) {
      console.error('Logout error:', e)
    } finally {
      // Get role before clearing state
      const currentRole = userRole
      setUser(null)
      setUserRole(null)
      setIsAuthenticated(false)
      // Redirect to appropriate login page based on role (not just route)
      if ((currentRole && currentRole !== 'user') || isAdminRoute) {
        navigate('/admin/login')
      } else {
        navigate('/login')
      }
    }
  }

  // User navigation links (when authenticated)
  const userNavLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/forms', label: 'Forms' },
    { to: '/submissions', label: 'My Submissions' },
    { to: '/profile', label: 'Profile' },
  ]

  // Public navigation links (when not authenticated) - empty like homepage
  const publicNavLinks: { to: string; label: string }[] = []

  // Admin navigation links with required permissions
  const adminNavLinks = [
    { to: '/admin', label: 'Dashboard', permission: 'view_dashboard' },
    { to: '/admin/submissions', label: 'Submissions', permission: 'review_submissions' },
    { to: '/admin/forms', label: 'Forms', permission: 'manage_forms' },
    { to: '/admin/users', label: 'Users', permission: 'manage_users' },
    { to: '/admin/admins', label: 'Admins', permission: 'manage_admins' },
    { to: '/admin/roles', label: 'Roles', permission: 'manage_roles' },
    { to: '/admin/analytics', label: 'Analytics', permission: 'view_analytics' },
    { to: '/admin/settings', label: 'Settings', permission: 'manage_settings' },
  ]

  // Filter admin nav links based on user permissions
  // Show all links if:
  // 1. Not on admin route
  // 2. Permissions haven't loaded yet (empty array means still loading) - show all by default
  // 3. User is superAdmin (has all permissions) - check by role name OR by having manage_admins permission
  // 4. User ID contains "superadmin" (fallback check)
  const userFromStorage = user || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null)
  const isSuperAdmin = userRole === 'superAdmin' || 
                       userPermissions.includes('manage_admins') || 
                       (userFromStorage?.id?.toLowerCase().includes('superadmin'))
  const filteredAdminNavLinks = isAdminRoute && userPermissions.length > 0 && !isSuperAdmin
    ? adminNavLinks.filter(link => !link.permission || userPermissions.includes(link.permission))
    : adminNavLinks

  // Use appropriate navigation links based on route and authentication
  const navLinks = isAdminRoute 
    ? filteredAdminNavLinks 
    : isAuthenticated 
      ? userNavLinks 
      : publicNavLinks

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === path
    if (path === '/admin') return location.pathname === '/admin' // Exact match for /admin
    return location.pathname.startsWith(path)
  }

  // Center active menu item when clicked/selected
  useEffect(() => {
    if (activeLinkRef.current && navRef.current) {
      const nav = navRef.current
      const activeLink = activeLinkRef.current
      
      // Calculate scroll position to center the active link
      const navRect = nav.getBoundingClientRect()
      const linkRect = activeLink.getBoundingClientRect()
      const navWidth = navRect.width
      const linkWidth = linkRect.width
      const linkOffsetLeft = activeLink.offsetLeft
      
      // Center the link in the visible area
      const scrollLeft = linkOffsetLeft - (navWidth / 2) + (linkWidth / 2)
      
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        nav.scrollTo({
          left: Math.max(0, scrollLeft),
          behavior: 'smooth'
        })
      })
    }
  }, [location.pathname])
  
  // Handle click to ensure centering happens on click as well
  const handleLinkClick = (linkTo: string) => {
    // Small delay to allow React Router to update location
    setTimeout(() => {
      if (activeLinkRef.current && navRef.current) {
        const nav = navRef.current
        const activeLink = activeLinkRef.current
        
        const navRect = nav.getBoundingClientRect()
        const linkRect = activeLink.getBoundingClientRect()
        const navWidth = navRect.width
        const linkWidth = linkRect.width
        const linkOffsetLeft = activeLink.offsetLeft
        
        const scrollLeft = linkOffsetLeft - (navWidth / 2) + (linkWidth / 2)
        
        nav.scrollTo({
          left: Math.max(0, scrollLeft),
          behavior: 'smooth'
        })
      }
    }, 50)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Modern Navigation Bar */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 sm:py-4 min-h-[64px] sm:min-h-[72px]">
            {/* Logo Section */}
            <Link to="/dashboard" className="flex items-center space-x-3 flex-shrink-0 group">
              {/* Logo Image */}
              <div className="relative overflow-hidden rounded-xl flex-shrink-0 transition-transform group-hover:scale-105 duration-300">
                <img 
                  src="/logo_lfsa.png" 
                  alt="Labuan FSA" 
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </div>
            </Link>
            
            {/* Desktop Navigation - Hidden on mobile */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-2xl mx-8">
              <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1">
                {navLinks.map((link) => {
                  const active = isActive(link.to)
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={cn(
                        'relative px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 whitespace-nowrap',
                        active 
                          ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm'
                      )}
                    >
                      {link.label}
                      {active && (
                        <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </nav>

            {/* Mobile Navigation Toggle & User Section */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* User Profile & Actions */}
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  {/* User Info - Hidden on small screens */}
                  <div className="hidden lg:flex flex-col items-end">
                    <span className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                      {user.name || user.email.split('@')[0]}
                    </span>
                    <span className="text-xs text-gray-500">{userRole || 'User'}</span>
                  </div>
                  
                  {/* User Avatar with Gradient */}
                  <div className="relative group">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 cursor-pointer transition-transform hover:scale-110 duration-300">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                        <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Logout Button - Modern */}
                  <button
                    onClick={handleLogout}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-all duration-300"
                    title="Logout"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to={isAdminRoute ? '/admin/login' : '/login'}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Login</span>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => {
                  const nav = document.getElementById('mobile-nav')
                  if (nav) {
                    nav.classList.toggle('hidden')
                  }
                }}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div id="mobile-nav" className="hidden lg:hidden border-t border-gray-100 bg-white">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.to)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => {
                    const nav = document.getElementById('mobile-nav')
                    if (nav) nav.classList.add('hidden')
                  }}
                  className={cn(
                    'flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200',
                    active 
                      ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
            {isAuthenticated && user && (
              <button
                onClick={() => {
                  const nav = document.getElementById('mobile-nav')
                  if (nav) nav.classList.add('hidden')
                  handleLogout()
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 bg-red-50 rounded-lg transition-all duration-200 hover:bg-red-100 sm:hidden"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full flex justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </div>
      </main>

      {/* Modern Footer (single row on wider screens) */}
      <footer className="mt-auto bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <p className="text-sm text-gray-600">
              © 2025 Labuan Financial Services Authority. All rights reserved.
            </p>

            <div className="mt-3 sm:mt-0 flex gap-6">
              <a href="#" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">Terms of Service</a>
              <a href="#" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

