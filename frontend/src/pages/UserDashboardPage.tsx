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
    "relative overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300",
    "border border-gray-100 group hover:border-gray-200",
    bgColor
  )}>
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={cn(
          "flex items-center justify-center w-14 h-14 rounded-full transition-transform duration-300 group-hover:scale-110",
          iconBg
        )}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 to-primary/40 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
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
    className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-primary/30 overflow-hidden"
  >
    <div className="p-6">
      <div className="flex items-start space-x-4">
        <div className={cn(
          "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110",
          iconBg
        )}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className="flex-shrink-0 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary to-primary-dark transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
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
    className="group block px-6 py-4 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
  >
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">
              {submission.submissionId.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
              {submission.submissionId}
            </p>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              Form ID: {submission.formId}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <span
          className={cn(
            'px-3 py-1.5 inline-flex text-xs font-semibold rounded-full whitespace-nowrap',
            getStatusColor(submission.status)
          )}
        >
          {submission.status.replace('-', ' ').toUpperCase()}
        </span>
        <span className="hidden md:inline text-sm text-gray-500 min-w-[100px] text-right">
          {submission.submittedAt
            ? new Date(submission.submittedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })
            : 'Not submitted'}
        </span>
        <div className="text-gray-400 group-hover:text-primary transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 -m-6 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Welcome Back! 👋
              </h1>
              <p className="text-base text-gray-600">
                Here's an overview of your application submissions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/forms"
                className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <span className="mr-2">+</span>
                New Application
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon="📊"
            label="Total Submissions"
            value={statistics.totalSubmissions}
            bgColor="bg-white"
            iconBg="bg-blue-50"
          />
          <StatCard
            icon="⏳"
            label="Pending Review"
            value={statistics.pendingSubmissions}
            bgColor="bg-white"
            iconBg="bg-yellow-50"
          />
          <StatCard
            icon="✅"
            label="Approved"
            value={statistics.approvedSubmissions}
            bgColor="bg-white"
            iconBg="bg-green-50"
          />
          <StatCard
            icon="❌"
            label="Rejected"
            value={statistics.rejectedSubmissions}
            bgColor="bg-white"
            iconBg="bg-red-50"
          />
        </div>

        {/* Quick Actions Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickActionCard
              to="/forms"
              icon="📝"
              title="Start New Application"
              description="Submit a new form application"
              iconBg="bg-primary/10"
            />
            <QuickActionCard
              to="/submissions"
              icon="📋"
              title="View All Submissions"
              description="See all your submissions and their status"
              iconBg="bg-blue-50"
            />
            {forms && forms.length > 0 && (
              <QuickActionCard
                to={`/forms/${forms[0].formId}`}
                icon="⚡"
                title="Quick Start"
                description={forms[0].name || 'Start most recent form'}
                iconBg="bg-green-50"
              />
            )}
          </div>
        </div>

        {/* Recent Submissions Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Submissions</h2>
            {recentSubmissions.length > 0 && (
              <Link
                to="/submissions"
                className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1 transition-colors"
              >
                View all
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {submissionsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-600">Loading submissions...</p>
              </div>
            ) : recentSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">📄</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No submissions yet</h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  You haven't submitted any applications yet. Start your first application to get started.
                </p>
                <Link
                  to="/forms"
                  className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <span className="mr-2">+</span>
                  Start Your First Application
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
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

