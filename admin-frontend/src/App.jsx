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
    <nav className="nav">
      <span style={{ fontWeight: 700 }}>🏪 {auth.storeId}</span>
      <div>
        <Link to="/dashboard" className="btn-secondary" style={{ textDecoration: 'none' }}>대시보드</Link>
        <Link to="/tables" className="btn-secondary" style={{ textDecoration: 'none' }}>테이블</Link>
        <Link to="/menus" className="btn-secondary" style={{ textDecoration: 'none' }}>메뉴</Link>
        <button className="btn-danger" onClick={logout} style={{ fontSize: 13 }}>로그아웃</button>
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
