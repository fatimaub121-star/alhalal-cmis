import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  pending: 'bg-yellow-50 text-yellow-700',
  approved: 'bg-[#E8F5E9] text-[#2E7D32]',
  rejected: 'bg-red-50 text-red-600',
  disbursed: 'bg-blue-50 text-blue-700',
  repaying: 'bg-purple-50 text-purple-700',
  completed: 'bg-gray-100 text-gray-600',
}

export default function Loans() {
  const [loans, setLoans] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [action, setAction] = useState(null) // 'approve' | 'reject' | 'repay'
  const [actionForm, setActionForm] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const fetchLoans = async (status = '') => {
    setLoading(true)
    try {
      const { data } = await api.get(`/loans/${status ? `?status=${status}` : ''}`)
      setLoans(data.results || [])
    } catch { toast.error('Failed to load loans') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchLoans(statusFilter) }, [statusFilter])

  const openAction = (loan, act) => {
    setSelected(loan)
    setAction(act)
    setActionForm(act === 'approve'
      ? { amount_approved: loan.amount_requested, repayment_months: loan.repayment_months, admin_notes: '' }
      : act === 'repay' ? { amount: '', date_paid: '', notes: '' }
      : { admin_notes: '' })
  }

  const handleAction = async () => {
    setSubmitting(true)
    try {
      if (action === 'approve') await api.patch(`/loans/${selected.id}/approve/`, actionForm)
      else if (action === 'reject') await api.patch(`/loans/${selected.id}/reject/`, actionForm)
      else if (action === 'repay') await api.post(`/loans/${selected.id}/record_repayment/`, actionForm)
      toast.success('Action completed')
      setSelected(null); setAction(null)
      fetchLoans(statusFilter)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Action failed')
    } finally { setSubmitting(false) }
  }

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n || 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h2 className="text-2xl font-bold text-[#1A2B1A]">Loans</h2>
          <p className="text-sm text-[#5A7A5A] mt-0.5">Loan applications and repayment tracking</p>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-[#E0E8E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]">
          <option value="">All Status</option>
          {['pending','approved','rejected','disbursed','repaying','completed'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-[#E0E8E0] overflow-x-auto">
        {loading ? (
          <div className="p-8 text-sm text-[#5A7A5A] text-center">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAF8] text-[#5A7A5A] text-xs uppercase tracking-wide">
                {['Loan No.', 'Member', 'Amount', 'Status', 'Applied On', 'Balance', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E8E0]">
              {loans.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-[#5A7A5A]">No loans found.</td></tr>
              ) : loans.map((ln) => (
                <tr key={ln.id} className="hover:bg-[#F8FAF8] transition-colors">
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-[#2E7D32]">{ln.loan_number}</td>
                  <td className="px-5 py-3 text-[#1A2B1A]">{ln.member_name}</td>
                  <td className="px-5 py-3 font-medium">{formatCurrency(ln.amount_approved || ln.amount_requested)}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[ln.status]}`}>
                      {ln.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#5A7A5A]">{ln.applied_on}</td>
                  <td className="px-5 py-3 font-medium text-[#C62828]">{formatCurrency(ln.balance_outstanding)}</td>
                  <td className="px-5 py-3 flex gap-2">
                    {ln.status === 'pending' && (
                      <>
                        <button onClick={() => openAction(ln, 'approve')}
                          className="text-xs px-2.5 py-1 bg-[#E8F5E9] text-[#2E7D32] rounded-md hover:bg-[#C8E6C9] font-medium">
                          Approve
                        </button>
                        <button onClick={() => openAction(ln, 'reject')}
                          className="text-xs px-2.5 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 font-medium">
                          Reject
                        </button>
                      </>
                    )}
                    {['approved','disbursed','repaying'].includes(ln.status) && (
                      <button onClick={() => openAction(ln, 'repay')}
                        className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 font-medium">
                        Record Repayment
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Action Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[#1A2B1A] mb-4">
              {action === 'approve' ? 'Approve Loan' : action === 'reject' ? 'Reject Loan' : 'Record Repayment'}
            </h3>
            <p className="text-sm text-[#5A7A5A] mb-4">{selected.loan_number} — {selected.member_name}</p>
            <div className="space-y-3">
              {action === 'approve' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[#1A2B1A] mb-1">Approved Amount (NGN)</label>
                    <input type="number" value={actionForm.amount_approved}
                      onChange={(e) => setActionForm({ ...actionForm, amount_approved: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#E0E8E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1A2B1A] mb-1">Repayment Months</label>
                    <input type="number" value={actionForm.repayment_months}
                      onChange={(e) => setActionForm({ ...actionForm, repayment_months: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#E0E8E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]" />
                  </div>
                </>
              )}
              {action === 'repay' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[#1A2B1A] mb-1">Repayment Amount (NGN)</label>
                    <input type="number" value={actionForm.amount}
                      onChange={(e) => setActionForm({ ...actionForm, amount: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#E0E8E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1A2B1A] mb-1">Date Paid</label>
                    <input type="date" value={actionForm.date_paid}
                      onChange={(e) => setActionForm({ ...actionForm, date_paid: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#E0E8E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]" />
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs font-medium text-[#1A2B1A] mb-1">Notes</label>
                <textarea rows={2} value={actionForm.admin_notes || actionForm.notes || ''}
                  onChange={(e) => setActionForm({ ...actionForm,
                    ...(action === 'repay' ? { notes: e.target.value } : { admin_notes: e.target.value }) })}
                  className="w-full px-3 py-2 text-sm border border-[#E0E8E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => { setSelected(null); setAction(null) }}
                className="px-4 py-2 text-sm text-[#5A7A5A] border border-[#E0E8E0] rounded-lg hover:bg-[#F8FAF8]">
                Cancel
              </button>
              <button onClick={handleAction} disabled={submitting}
                className="px-5 py-2 text-sm bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] disabled:opacity-60">
                {submitting ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
