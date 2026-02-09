import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom'
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

const NAV_SECTIONS = [
  {
    title: '운영',
    items: [
      { to: '/dashboard', label: '대시보드', icon: '📋' },
      { to: '/tables', label: '테이블', icon: '🪑' },
      { to: '/menus', label: '메뉴 관리', icon: '🍽️' },
    ],
  },
  {
    title: '분석',
    items: [
      { to: '/settlement', label: '정산', icon: '💳' },
      { to: '/kpi', label: 'KPI', icon: '📈' },
      { to: '/analytics', label: '메뉴 분석', icon: '🎯' },
    ],
  },
]

function Sidebar() {
  const { auth, logout } = useAdminAuth()
  if (!auth) return null

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-slate-900 text-white flex flex-col z-50">
      {/* 로고 */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-lg">🏪</div>
          <div>
            <div className="text-sm font-bold leading-none">Table Order</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{auth.storeId}</div>
          </div>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {NAV_SECTIONS.map(section => (
          <div key={section.title}>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">{section.title}</div>
            <div className="space-y-0.5">
              {section.items.map(item => (
                <NavLink key={item.to} to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`
                  }>
                  <span className="text-base w-5 text-center">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* 하단 */}
      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-white/5 transition">
          <span className="text-base w-5 text-center">🚪</span>
          로그아웃
        </button>
      </div>
    </aside>
  )
}

function ProtectedRoute({ children }) {
  const { auth } = useAdminAuth()
  if (!auth) return <Navigate to="/" replace />
  return children
}

function AppLayout({ children }) {
  const { auth } = useAdminAuth()
  if (!auth) return children
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-60">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <OrderProvider>
          <AppLayout>
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
          </AppLayout>
        </OrderProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  )
}
