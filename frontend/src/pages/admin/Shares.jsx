import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function Shares() {
  const [shares, setShares] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ member: '', quantity: '', unit_value: '1000', date_allocated: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [s, m] = await Promise.all([api.get('/shares/'), api.get('/members/')])
      setShares(s.data.results || [])
      setMembers(m.data.results || [])
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/shares/', form)
      toast.success('Shares allocated')
      setShowModal(false)
      setForm({ member: '', quantity: '', unit_value: '1000', date_allocated: '', notes: '' })
      fetchAll()
    } catch { toast.error('Failed to allocate shares') }
    finally { setSubmitting(false) }
  }

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n || 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h2 className="text-2xl font-bold text-[#1A2B1A]">Shares</h2>
          <p className="text-sm text-[#5A7A5A] mt-0.5">Member share allocations and holdings</p>
        </div>
        <button id="add-shares-btn" onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#2E7D32] text-white text-sm font-medium rounded-lg hover:bg-[#1B5E20] transition-colors">
          Allocate Shares
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E0E8E0] overflow-hidden">
        {loading ? (
          <div className="p-8 text-sm text-[#5A7A5A] text-center">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAF8] text-[#5A7A5A] text-xs uppercase tracking-wide">
                {['Member ID', 'Name', 'Shares', 'Unit Value', 'Total Value', 'Date', 'Notes'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E8E0]">
              {shares.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-[#5A7A5A]">No share records found.</td></tr>
              ) : shares.map((s) => (
                <tr key={s.id} className="hover:bg-[#F8FAF8] transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-[#2E7D32] font-semibold">{s.member_id_str}</td>
                  <td className="px-5 py-3 font-medium text-[#1A2B1A]">{s.member_name}</td>
                  <td className="px-5 py-3 font-semibold">{s.quantity}</td>
                  <td className="px-5 py-3 text-[#5A7A5A]">{formatCurrency(s.unit_value)}</td>
                  <td className="px-5 py-3 font-semibold text-[#2E7D32]">{formatCurrency(s.total_value)}</td>
                  <td className="px-5 py-3 text-[#5A7A5A]">{s.date_allocated}</td>
                  <td className="px-5 py-3 text-[#5A7A5A]">{s.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-[#1A2B1A]">Allocate Shares</h3>
              <button onClick={() => setShowModal(false)} className="text-[#5A7A5A] hover:text-[#1A2B1A]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#1A2B1A] mb-1">Member</label>
                <select required value={form.member} onChange={(e) => setForm({ ...form, member: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E0E8E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]">
                  <option value="">Select member...</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.member_id} - {m.full_name}</option>)}
                </select>
              </div>
              {[
                { name: 'quantity', label: 'Number of Shares', type: 'number' },
                { name: 'unit_value', label: 'Unit Value (NGN)', type: 'number' },
                { name: 'date_allocated', label: 'Date Allocated', type: 'date' },
              ].map(({ name, label, type }) => (
                <div key={name}>
                  <label className="block text-xs font-medium text-[#1A2B1A] mb-1">{label}</label>
                  <input type={type} required value={form[name]}
                    onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#E0E8E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]" />
                </div>
              ))}
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-[#5A7A5A] border border-[#E0E8E0] rounded-lg hover:bg-[#F8FAF8]">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2 text-sm bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] disabled:opacity-60">
                  {submitting ? 'Allocating...' : 'Allocate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
