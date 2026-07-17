import { useEffect, useState } from 'react'
import api from '../../services/api'

function InfoCard({ label, value, color = 'text-[#1A2B1A]' }) {
  return (
    <div className="bg-white rounded-xl border border-[#E0E8E0] p-5">
      <p className="text-xs font-medium text-[#5A7A5A] uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  )
}

export default function MemberDashboard() {
  const [profile, setProfile] = useState(null)
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/members/me/'),
      api.get('/loans/'),
    ]).then(([p, l]) => {
      setProfile(p.data)
      setLoans(l.data.results || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n || 0)

  const activeLoan = loans.find(l => ['approved','disbursed','repaying'].includes(l.status))

  if (loading) return <div className="text-sm text-[#5A7A5A]">Loading your account...</div>

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-[#1A2B1A]">Welcome, {profile?.full_name}</h2>
        <p className="text-sm text-[#5A7A5A] mt-0.5">Member ID: {profile?.member_id}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <InfoCard label="Total Savings" value={formatCurrency(profile?.total_savings)} color="text-[#2E7D32]" />
        <InfoCard label="Share Holdings" value={`${profile?.total_shares || 0} shares`} />
        <InfoCard
          label="Active Loan Balance"
          value={activeLoan ? formatCurrency(activeLoan.balance_outstanding) : 'No active loan'}
          color={activeLoan ? 'text-[#C62828]' : 'text-[#5A7A5A]'}
        />
      </div>

      {/* Profile Summary */}
      <div className="bg-white rounded-xl border border-[#E0E8E0] p-6">
        <h3 className="text-base font-semibold text-[#1A2B1A] mb-4">Account Information</h3>
        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
          {[
            ['Email', profile?.email],
            ['Phone', profile?.phone],
            ['Gender', profile?.gender === 'M' ? 'Male' : 'Female'],
            ['Department', profile?.department || '-'],
            ['Date Joined', profile?.date_joined_cooperative],
            ['Status', profile?.status],
          ].map(([k, v]) => (
            <div key={k}>
              <span className="text-[#5A7A5A]">{k}: </span>
              <span className="text-[#1A2B1A] font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
