import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext'
import { OrderProvider } from './contexts/OrderContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import TableDetailPage from './pages/TableDetailPage'
import TableManagementPage from './pages/TableManagementPage'
import MenuManagementPage from './pages/MenuManagementPage'

function NavBar() {
  const { auth, logout } = useAdminAuth()
  if (!auth) return null
  return (
    <nav className="bg-white shadow-sm px-6 py-3 flex justify-between items-center sticky top-0 z-50">
      <span className="font-bold text-gray-800 text-lg">🏪 {auth.storeId}</span>
      <div className="flex items-center gap-2">
        <Link to="/dashboard" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition">대시보드</Link>
        <Link to="/tables" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition">테이블</Link>
        <Link to="/menus" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition">메뉴</Link>
        <button onClick={logout}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition">
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
          </Routes>
        </OrderProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  )
}
