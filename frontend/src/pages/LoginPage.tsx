import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '@/api/client'
import { cn } from '@/lib/utils'
import mifcLogo from '@/assets/mifc-logo.png'

export function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await apiClient.login(
        formData.email,
        formData.password,
        'user'
      )

      const { token, user, role } = response

      // Clear any admin session first
      if (localStorage.getItem('userRole') === 'admin') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('userRole')
      }

      // Store token (already set by apiClient.login)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('userRole', role)
      
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      }

      // Redirect to dashboard or home
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <div className="relative min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        {/* Back to Home - Positioned absolutely */}
        <div className="absolute top-6 left-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="max-w-md w-full">
          {/* Main Login Card */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            {/* Card Header */}
            <div className="px-8 pt-10 pb-6 border-b border-slate-100">
              <div className="flex justify-center mb-6">
                <img 
                  src={mifcLogo}
                  alt="MIFC Logo" 
                  className="h-16 w-auto object-contain"
                />
              </div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-2">
                Sign In
              </h1>
              <p className="text-sm text-slate-600">
                Maldives FSA E-Submission Portal
              </p>
            </div>

            {/* Form */}
            <form className="px-8 py-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              )}
              
              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input appearance-none relative block w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 rounded-md transition-all bg-white"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input appearance-none relative block w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 rounded-md transition-all bg-white"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-slate-700 focus:ring-slate-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                      'btn btn-primary w-full flex justify-center items-center gap-2 py-2.5 text-sm font-medium transition-all',
                      loading && 'opacity-60 cursor-not-allowed'
                    )}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>

              {/* Demo Credentials */}
              <div className="pt-4 border-t border-slate-200">
                <div className="p-3 bg-slate-50 rounded-md">
                  <p className="!text-xs font-medium text-slate-700 mb-2">Demo Account</p>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="!text-xs"><span className="font-medium">Email:</span> user@example.com</p>
                    <p className="!text-xs"><span className="font-medium">Password:</span> user123</p>
                  </div>
                </div>
              </div>
            </form>


          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-slate-900 hover:text-slate-700 transition-colors underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

