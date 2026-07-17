import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const TYPE_LABELS = {
  savings_credit: 'Savings Credit',
  loan_debit: 'Loan Disbursement',
  loan_repayment: 'Loan Repayment',
  share_purchase: 'Share Purchase',
  other: 'Other',
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/transactions/')
      .then(({ data }) => setTransactions(data.results || []))
      .catch(() => toast.error('Failed to load transactions'))
      .finally(() => setLoading(false))
  }, [])

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n || 0)

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-[#1A2B1A]">Transaction History</h2>
        <p className="text-sm text-[#5A7A5A] mt-0.5">All your financial transactions</p>
      </div>

      <div className="bg-white rounded-xl border border-[#E0E8E0] overflow-hidden">
        {loading ? (
          <div className="p-8 text-sm text-[#5A7A5A] text-center">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAF8] text-[#5A7A5A] text-xs uppercase tracking-wide">
                {['Type', 'Amount', 'Description', 'Date'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E8E0]">
              {transactions.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-[#5A7A5A]">No transactions yet.</td></tr>
              ) : transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#F8FAF8] transition-colors">
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 bg-[#E8F5E9] text-[#2E7D32] rounded-full text-xs font-medium">
                      {TYPE_LABELS[tx.transaction_type] || tx.transaction_type}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-[#2E7D32]">{formatCurrency(tx.amount)}</td>
                  <td className="px-5 py-3 text-[#5A7A5A]">{tx.description}</td>
                  <td className="px-5 py-3 text-[#5A7A5A]">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
