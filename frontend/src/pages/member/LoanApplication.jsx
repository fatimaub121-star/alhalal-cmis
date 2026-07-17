import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function LoanApplication() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ member: '', amount_requested: '', purpose: '', repayment_months: 6 })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    api.get('/members/me/')
      .then(({ data }) => {
        setProfile(data)
        setForm(f => ({ ...f, member: data.id }))
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/loans/', form)
      setSuccess(true)
      toast.success('Loan application submitted successfully')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit application')
    } finally { setSubmitting(false) }
  }

  if (success) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E8F5E9] mb-4">
          <svg className="w-8 h-8 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#1A2B1A] mb-2">Application Submitted</h2>
        <p className="text-[#5A7A5A] text-sm max-w-sm mx-auto">
          Your loan application has been submitted and is pending review by the cooperative administration.
          You will be notified once a decision is made.
        </p>
        <button onClick={() => setSuccess(false)}
          className="mt-6 px-5 py-2 text-sm bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20]">
          Apply Again
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-[#1A2B1A]">Apply for Loan</h2>
        <p className="text-sm text-[#5A7A5A] mt-0.5">
          Submit an interest-free loan application to the cooperative
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#E0E8E0] p-6 max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#1A2B1A] mb-1">Member</label>
            <input type="text" disabled value={profile ? `${profile.member_id} — ${profile.full_name}` : 'Loading...'}
              className="w-full px-3 py-2 text-sm border border-[#E0E8E0] rounded-lg bg-[#F8FAF8] text-[#5A7A5A]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#1A2B1A] mb-1">Loan Amount Requested (NGN)</label>
            <input type="number" required min={1000}
              id="loan-amount"
              value={form.amount_requested}
              onChange={(e) => setForm({ ...form, amount_requested: e.target.value })}
              placeholder="e.g. 50000"
              className="w-full px-3 py-2 text-sm border border-[#E0E8E0] rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-[#2E7D32]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#1A2B1A] mb-1">Purpose of Loan</label>
            <textarea required rows={3}
              id="loan-purpose"
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              placeholder="Describe the purpose of this loan request..."
              className="w-full px-3 py-2 text-sm border border-[#E0E8E0] rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-[#2E7D32] resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#1A2B1A] mb-1">
              Preferred Repayment Period (months)
            </label>
            <select
              id="loan-repayment-months"
              value={form.repayment_months}
              onChange={(e) => setForm({ ...form, repayment_months: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-[#E0E8E0] rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            >
              {[3, 6, 9, 12, 18, 24].map(m => (
                <option key={m} value={m}>{m} months</option>
              ))}
            </select>
          </div>
          <div className="pt-1">
            <button type="submit" disabled={submitting || !profile}
              id="submit-loan-btn"
              className="w-full py-2.5 bg-[#2E7D32] text-white text-sm font-medium rounded-lg
                         hover:bg-[#1B5E20] disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
