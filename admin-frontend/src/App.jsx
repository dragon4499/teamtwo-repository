import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext'
import { OrderProvider } from './contexts/OrderContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import TableDetailPage from './pages/TableDetailPage'
import TableManagementPage from './pages/TableManagementPage'
import MenuManagementPage from './pages/MenuManagementPage'
import SettlementPage from './pages/SettlementPage'
import KpiPage from './pages/KpiPage'
import MenuAnalyticsPage from './pages/MenuAnalyticsPage'

const NAV_ITEMS = [
  { to: '/dashboard', label: '대시보드', icon: '📋' },
  { to: '/tables', label: '테이블', icon: '🪑' },
  { to: '/menus', label: '메뉴', icon: '🍽️' },
  { to: '/settlement', label: '정산', icon: '💳' },
  { to: '/kpi', label: 'KPI', icon: '📈' },
  { to: '/analytics', label: '분석', icon: '🎯' },
]

function NavBar() {
  const { auth, logout } = useAdminAuth()
  const location = useLocation()
  if (!auth) return null
  return (
    <nav className="bg-white shadow-sm px-6 py-3 flex justify-between items-center sticky top-0 z-50">
      <span className="font-bold text-gray-800 text-lg">🏪 {auth.storeId}</span>
      <div className="flex items-center gap-1">
        {NAV_ITEMS.map(item => (
          <Link key={item.to} to={item.to}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}>
            {item.icon} {item.label}
          </Link>
        ))}
        <button onClick={logout}
          className="ml-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition">
          로그아웃
        </button>
      </div>
    </nav>
  )
}

function ProtectedRoute({ children }) {
  const { auth } = useAdminAuth()
  if (!auth) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <OrderProvider>
          <NavBar />
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/tables/:tableNum" element={<ProtectedRoute><TableDetailPage /></ProtectedRoute>} />
            <Route path="/tables" element={<ProtectedRoute><TableManagementPage /></ProtectedRoute>} />
            <Route path="/menus" element={<ProtectedRoute><MenuManagementPage /></ProtectedRoute>} />
            <Route path="/settlement" element={<ProtectedRoute><SettlementPage /></ProtectedRoute>} />
            <Route path="/kpi" element={<ProtectedRoute><KpiPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><MenuAnalyticsPage /></ProtectedRoute>} />
          </Routes>
        </OrderProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  )
}
