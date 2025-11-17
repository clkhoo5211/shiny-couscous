import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { FormListPage } from './pages/FormListPage'
import { FormPage } from './pages/FormPage'
import { SubmissionListPage } from './pages/SubmissionListPage'
import { SubmissionDetailPage } from './pages/SubmissionDetailPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminSubmissionsListPage } from './pages/admin/AdminSubmissionsListPage'
import { AdminSubmissionReviewPage } from './pages/admin/AdminSubmissionReviewPage'
import { AdminFormsPage } from './pages/admin/AdminFormsPage'
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage'
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage'
import { Layout } from './components/layout/Layout'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/forms" element={<FormListPage />} />
        <Route path="/forms/:formId" element={<FormPage />} />
        <Route path="/submissions" element={<SubmissionListPage />} />
        <Route path="/submissions/:submissionId" element={<SubmissionDetailPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/submissions" element={<AdminSubmissionsListPage />} />
        <Route path="/admin/submissions/:submissionId" element={<AdminSubmissionReviewPage />} />
        <Route path="/admin/forms" element={<AdminFormsPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
      </Routes>
    </Layout>
  )
}

export default App

