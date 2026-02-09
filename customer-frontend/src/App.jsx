import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { MenuProvider } from './contexts/MenuContext'
import TableSetupPage from './pages/TableSetupPage'
import MenuPage from './pages/MenuPage'
import CartPage from './pages/CartPage'
import OrderConfirmPage from './pages/OrderConfirmPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import OrderHistoryPage from './pages/OrderHistoryPage'

function ProtectedRoute({ children }) {
  const { auth } = useAuth()
  if (!auth) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <MenuProvider>
            <Routes>
              <Route path="/" element={<TableSetupPage />} />
              <Route path="/menu" element={<ProtectedRoute><MenuPage /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
              <Route path="/confirm" element={<ProtectedRoute><OrderConfirmPage /></ProtectedRoute>} />
              <Route path="/success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
            </Routes>
          </MenuProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
