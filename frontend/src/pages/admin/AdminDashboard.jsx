import { useEffect, useState } from 'react'
import api from '../../services/api'

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-xl border border-[#E0E8E0] p-5">
      <p className="text-xs font-medium text-[#5A7A5A] uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-[#1A2B1A] mt-1">{value}</p>
      {sub && <p className="text-sm text-[#5A7A5A] mt-0.5">{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/members/?page_size=1'),
      api.get('/savings/summary/'),
      api.get('/loans/?status=pending&page_size=1'),
      api.get('/transactions/?page_size=5'),
    ]).then(([members, savings, loans, txns]) => {
      setStats({
        members: members.data.count || 0,
        savings: savings.data.total_savings || 0,
        pendingLoans: loans.data.count || 0,
      })
      setTransactions(txns.data.results || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="p-8">
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-[#1A2B1A]">Dashboard</h2>
        <p className="text-sm text-[#5A7A5A] mt-0.5">
          Al-Halal Cooperative Multipurpose Society — Overview
        </p>
      </div>

      {loading ? (
        <div className="text-[#5A7A5A] text-sm">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="Total Members" value={stats?.members ?? 0} sub="Registered cooperative members" />
            <StatCard label="Total Savings" value={formatCurrency(stats?.savings ?? 0)} sub="Cumulative contributions" />
            <StatCard label="Pending Loans" value={stats?.pendingLoans ?? 0} sub="Awaiting approval" />
          </div>

          <div className="bg-white rounded-xl border border-[#E0E8E0] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E0E8E0]">
              <h3 className="text-base font-semibold text-[#1A2B1A]">Recent Transactions</h3>
            </div>
            {transactions.length === 0 ? (
              <div className="px-6 py-8 text-sm text-[#5A7A5A] text-center">No transactions recorded yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F8FAF8] text-[#5A7A5A] text-xs uppercase tracking-wide">
                    <th className="px-6 py-3 text-left font-medium">Member</th>
                    <th className="px-6 py-3 text-left font-medium">Type</th>
                    <th className="px-6 py-3 text-right font-medium">Amount</th>
                    <th className="px-6 py-3 text-left font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E8E0]">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#F8FAF8] transition-colors">
                      <td className="px-6 py-3 text-[#1A2B1A] font-medium">{tx.member_name}</td>
                      <td className="px-6 py-3 text-[#5A7A5A]">{tx.transaction_type.replace('_', ' ')}</td>
                      <td className="px-6 py-3 text-right font-medium text-[#2E7D32]">{formatCurrency(tx.amount)}</td>
                      <td className="px-6 py-3 text-[#5A7A5A]">{tx.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
