import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { MenuProvider } from './contexts/MenuContext'
import { ToastProvider } from './components/Toast'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import LoadingSpinner from './components/LoadingSpinner'

const TableSetupPage = lazy(() => import('./pages/TableSetupPage'))
const MenuPage = lazy(() => import('./pages/MenuPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const OrderConfirmPage = lazy(() => import('./pages/OrderConfirmPage'))
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'))
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'))

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <MenuProvider>
              <ToastProvider>
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/setup" element={<TableSetupPage />} />
                    <Route element={<ProtectedRoute />}>
                      <Route element={<AppLayout />}>
                        <Route path="/" element={<MenuPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/order/confirm" element={<OrderConfirmPage />} />
                        <Route path="/order/success" element={<OrderSuccessPage />} />
                        <Route path="/orders" element={<OrderHistoryPage />} />
                      </Route>
                    </Route>
                  </Routes>
                </Suspense>
              </ToastProvider>
            </MenuProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
