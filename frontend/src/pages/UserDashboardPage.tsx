import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { SubmissionResponse, FormResponse } from '@/types'
import { cn } from '@/lib/utils'

// Separate components for better organization
const StatCard = ({ 
  icon, 
  label, 
  value, 
  bgColor, 
  iconBg 
}: { 
  icon: string; 
  label: string; 
  value: number; 
  bgColor: string; 
  iconBg: string 
}) => (
  <div className={cn(
    "relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300",
    "border-2 border-white group hover:border-opacity-80 hover:-translate-y-1",
    bgColor
  )}>
    <div className="p-7">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">{label}</p>
          <p className="text-4xl font-black text-gray-900">{value}</p>
        </div>
        <div className={cn(
          "flex items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg",
          iconBg
        )}>
          <span className="text-3xl">{icon}</span>
        </div>
      </div>
    </div>
    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
  </div>
)

const QuickActionCard = ({ 
  to, 
  icon, 
  title, 
  description, 
  iconBg 
}: { 
  to: string; 
  icon: string; 
  title: string; 
  description: string; 
  iconBg: string 
}) => (
  <Link
    to={to}
    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-300 overflow-hidden hover:-translate-y-2"
  >
    <div className="p-7">
      <div className="flex items-start space-x-4">
        <div className={cn(
          "flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg text-white",
          iconBg
        )}>
          <span className="text-3xl">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
        <div className="flex-shrink-0 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all duration-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
    <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
  </Link>
)

const SubmissionRow = ({ 
  submission, 
  getStatusColor 
}: { 
  submission: SubmissionResponse; 
  getStatusColor: (status: string) => string 
}) => (
  <Link
    to={`/submissions/${submission.submissionId}`}
    className="group block px-7 py-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <span className="text-white font-black text-base">
              {submission.submissionId.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {submission.submissionId}
            </p>
            <p className="text-sm text-gray-500 truncate mt-1 font-medium">
              Form ID: {submission.formId}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-5">
        <span
          className={cn(
            'px-4 py-2 inline-flex text-xs font-bold rounded-xl whitespace-nowrap shadow-sm',
            getStatusColor(submission.status)
          )}
        >
          {submission.status.replace('-', ' ').toUpperCase()}
        </span>
        <span className="hidden md:inline text-sm text-gray-600 font-semibold min-w-[110px] text-right">
          {submission.submittedAt
            ? new Date(submission.submittedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })
            : 'Not submitted'}
        </span>
        <div className="text-gray-400 group-hover:text-blue-600 transition-all group-hover:translate-x-2 duration-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  </Link>
)

export function UserDashboardPage() {
  const [recentSubmissions, setRecentSubmissions] = useState<SubmissionResponse[]>([])
  const [statistics, setStatistics] = useState({
    totalSubmissions: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0,
    rejectedSubmissions: 0,
  })

  const { data: submissions, isLoading: submissionsLoading } = useQuery<SubmissionResponse[]>({
    queryKey: ['user-submissions'],
    queryFn: () => apiClient.getSubmissions(),
  })

  const { data: forms } = useQuery<FormResponse[]>({
    queryKey: ['forms'],
    queryFn: () => apiClient.getForms({ status: 'active' }),
  })

  useEffect(() => {
    if (submissions) {
      setRecentSubmissions(submissions.slice(0, 5))
      setStatistics({
        totalSubmissions: submissions.length,
        pendingSubmissions: submissions.filter((s) => s.status === 'reviewing' || s.status === 'under-review').length,
        approvedSubmissions: submissions.filter((s) => s.status === 'approved').length,
        rejectedSubmissions: submissions.filter((s) => s.status === 'rejected').length,
      })
    }
  }, [submissions])

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-200'
      case 'reviewing':
      case 'under-review':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'draft':
        return 'bg-gray-100 text-gray-800 border border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 -m-6 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section - Enhanced */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden p-8 lg:p-10">
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight">
                Welcome Back! 👋
              </h1>
              <p className="text-lg text-blue-100 font-medium">
                Here's an overview of your application submissions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/forms"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 border border-white/20"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Application
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Grid - Enhanced */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon="📊"
            label="Total Submissions"
            value={statistics.totalSubmissions}
            bgColor="bg-gradient-to-br from-blue-50 to-indigo-100"
            iconBg="bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
          />
          <StatCard
            icon="⏳"
            label="Pending Review"
            value={statistics.pendingSubmissions}
            bgColor="bg-gradient-to-br from-yellow-50 to-orange-100"
            iconBg="bg-gradient-to-br from-yellow-500 to-orange-600 text-white"
          />
          <StatCard
            icon="✅"
            label="Approved"
            value={statistics.approvedSubmissions}
            bgColor="bg-gradient-to-br from-green-50 to-emerald-100"
            iconBg="bg-gradient-to-br from-green-500 to-emerald-600 text-white"
          />
          <StatCard
            icon="❌"
            label="Rejected"
            value={statistics.rejectedSubmissions}
            bgColor="bg-gradient-to-br from-red-50 to-rose-100"
            iconBg="bg-gradient-to-br from-red-500 to-rose-600 text-white"
          />
        </div>

        {/* Quick Actions Section - Enhanced */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></span>
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <QuickActionCard
              to="/forms"
              icon="📝"
              title="Start New Application"
              description="Submit a new form application"
              iconBg="bg-gradient-to-br from-blue-500 to-indigo-600"
            />
            <QuickActionCard
              to="/submissions"
              icon="📋"
              title="View All Submissions"
              description="See all your submissions and their status"
              iconBg="bg-gradient-to-br from-purple-500 to-pink-600"
            />
            {forms && forms.length > 0 && (
              <QuickActionCard
                to={`/forms/${forms[0].formId}`}
                icon="⚡"
                title="Quick Start"
                description={forms[0].name || 'Start most recent form'}
                iconBg="bg-gradient-to-br from-green-500 to-emerald-600"
              />
            )}
          </div>
        </div>

        {/* Recent Submissions Section - Enhanced */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></span>
              Recent Submissions
            </h2>
            {recentSubmissions.length > 0 && (
              <Link
                to="/submissions"
                className="text-sm font-bold text-blue-600 hover:text-indigo-600 flex items-center gap-2 transition-all hover:gap-3 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-xl"
              >
                View all
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
            {submissionsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 px-6">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-6"></div>
                <p className="text-gray-700 font-semibold text-lg">Loading submissions...</p>
              </div>
            ) : recentSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-5xl">📄</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">No submissions yet</h3>
                <p className="text-gray-600 mb-8 max-w-md text-lg leading-relaxed">
                  You haven't submitted any applications yet. Start your first application to get started.
                </p>
                <Link
                  to="/forms"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Start Your First Application
                </Link>
              </div>
            ) : (
              <div className="divide-y-2 divide-gray-100">
                {recentSubmissions.map((submission) => (
                  <SubmissionRow
                    key={submission.id}
                    submission={submission}
                    getStatusColor={getStatusColor}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

