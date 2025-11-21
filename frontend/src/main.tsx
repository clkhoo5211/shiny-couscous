import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './components/ui/ToastProvider'
import { ConfirmDialogProvider } from './components/ui/ConfirmDialog'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

// Get base path from Vite (automatically set from vite.config.ts base option)
// For GitHub Pages: '/shiny-couscous/'
// For local dev: '/'
// BASE_URL is automatically set by Vite based on the 'base' config option
const basename = import.meta.env.BASE_URL || '/'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter basename={basename}>
      <ToastProvider>
        <ConfirmDialogProvider>
          <App />
        </ConfirmDialogProvider>
      </ToastProvider>
    </BrowserRouter>
  </QueryClientProvider>,
)

