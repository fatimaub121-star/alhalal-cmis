import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/member', label: 'My Dashboard', end: true },
  { to: '/member/transactions', label: 'Transaction History' },
  { to: '/member/loan-apply', label: 'Apply for Loan' },
  { to: '/member/statement', label: 'Account Statement' },
]

export default function MemberLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Signed out')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#F8FAF8]">
      {/* Top Nav */}
      <header className="bg-white border-b border-[#E0E8E0] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-bold text-[#2E7D32] text-base">Al-Halal CMIS</span>
            <nav className="hidden sm:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'text-[#5A7A5A] hover:bg-[#F8FAF8]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#5A7A5A] hidden sm:block">{user?.full_name}</span>
            <button
              onClick={handleLogout}
              id="member-logout-btn"
              className="text-sm text-[#5A7A5A] hover:text-[#1A2B1A] transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
