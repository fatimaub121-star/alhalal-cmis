import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome, ${user.full_name}`)
      navigate(user.role === 'admin' ? '/admin' : '/member')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2E7D32] mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1A2B1A]">Al-Halal CMIS</h1>
          <p className="text-[#5A7A5A] text-sm mt-1">Cooperative Management Information System</p>
          <p className="text-[#5A7A5A] text-xs mt-0.5">Federal University of Technology, Minna</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E0E8E0] p-8">
          <h2 className="text-lg font-semibold text-[#1A2B1A] mb-6">Sign in to your account</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1A2B1A] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                id="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-[#E0E8E0] text-sm text-[#1A2B1A]
                           focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent
                           placeholder:text-[#A8BCA8] transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A2B1A] mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                id="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
                className="w-full px-4 py-2.5 rounded-lg border border-[#E0E8E0] text-sm text-[#1A2B1A]
                           focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent
                           placeholder:text-[#A8BCA8] transition-shadow"
              />
            </div>
            <button
              type="submit"
              id="login-btn"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-sm font-medium
                         rounded-lg transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <span className="text-xs text-[#5A7A5A]">New member? </span>
            <Link to="/register" className="text-xs font-semibold text-[#2E7D32] hover:text-[#1B5E20]">
              Register here
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-[#5A7A5A] mt-6">
          Al-Halal Cooperative Multipurpose Society — ACMS Portal
        </p>
      </div>
    </div>
  )
}
