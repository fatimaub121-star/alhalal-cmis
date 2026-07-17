import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

import Login from './pages/Login'
import Register from './pages/Register'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import Members from './pages/admin/Members'
import Savings from './pages/admin/Savings'
import Loans from './pages/admin/Loans'
import Shares from './pages/admin/Shares'
import Reports from './pages/admin/Reports'
import MemberLayout from './pages/member/MemberLayout'
import MemberDashboard from './pages/member/MemberDashboard'
import Transactions from './pages/member/Transactions'
import LoanApplication from './pages/member/LoanApplication'
import MemberStatement from './pages/member/MemberStatement'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/member'} replace />
  }
  return children
}

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' },
          success: { iconTheme: { primary: '#2E7D32', secondary: 'white' } },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="members" element={<Members />} />
            <Route path="savings" element={<Savings />} />
            <Route path="loans" element={<Loans />} />
            <Route path="shares" element={<Shares />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Member Routes */}
          <Route path="/member" element={
            <ProtectedRoute role="member"><MemberLayout /></ProtectedRoute>
          }>
            <Route index element={<MemberDashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="loan-apply" element={<LoanApplication />} />
            <Route path="statement" element={<MemberStatement />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
