import { useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function Reports() {
  const [members, setMembers] = useState([])
  const [selectedMember, setSelectedMember] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [loadingMember, setLoadingMember] = useState(false)
  const [loadingAnnual, setLoadingAnnual] = useState(false)
  const [membersLoaded, setMembersLoaded] = useState(false)

  const loadMembers = async () => {
    if (membersLoaded) return
    try {
      const { data } = await api.get('/members/')
      setMembers(data.results || [])
      setMembersLoaded(true)
    } catch { toast.error('Could not load members') }
  }

  const downloadStatement = async () => {
    if (!selectedMember) { toast.error('Select a member'); return }
    setLoadingMember(true)
    try {
      const response = await api.get(`/reports/statement/${selectedMember}/`, { responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `statement_${selectedMember}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Statement downloaded')
    } catch { toast.error('Failed to generate statement') }
    finally { setLoadingMember(false) }
  }

  const downloadAnnual = async () => {
    setLoadingAnnual(true)
    try {
      const response = await api.get(`/reports/annual/?year=${year}`, { responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `annual_report_${year}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Annual report downloaded')
    } catch { toast.error('Failed to generate report') }
    finally { setLoadingAnnual(false) }
  }

  return (
    <div className="p-8">
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-[#1A2B1A]">Reports</h2>
        <p className="text-sm text-[#5A7A5A] mt-0.5">Generate and download PDF reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Member Account Statement */}
        <div className="bg-white rounded-xl border border-[#E0E8E0] p-6">
          <h3 className="text-base font-semibold text-[#1A2B1A] mb-1">Member Account Statement</h3>
          <p className="text-sm text-[#5A7A5A] mb-4">
            Download a full PDF statement for any member including savings, loans, and shares.
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#1A2B1A] mb-1">Select Member</label>
              <select
                id="report-member-select"
                onClick={loadMembers}
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#E0E8E0] rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              >
                <option value="">Select member...</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.member_id} — {m.full_name}</option>
                ))}
              </select>
            </div>
            <button
              id="download-statement-btn"
              onClick={downloadStatement}
              disabled={loadingMember || !selectedMember}
              className="w-full py-2.5 bg-[#2E7D32] text-white text-sm font-medium rounded-lg
                         hover:bg-[#1B5E20] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loadingMember ? 'Generating...' : 'Download Statement (PDF)'}
            </button>
          </div>
        </div>

        {/* Annual Financial Report */}
        <div className="bg-white rounded-xl border border-[#E0E8E0] p-6">
          <h3 className="text-base font-semibold text-[#1A2B1A] mb-1">Annual Financial Report</h3>
          <p className="text-sm text-[#5A7A5A] mb-4">
            Download the annual summary showing total savings, loans disbursed, and repayments.
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#1A2B1A] mb-1">Year</label>
              <input
                type="number"
                id="report-year-input"
                value={year}
                min={2000}
                max={2030}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#E0E8E0] rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>
            <button
              id="download-annual-btn"
              onClick={downloadAnnual}
              disabled={loadingAnnual}
              className="w-full py-2.5 bg-[#2E7D32] text-white text-sm font-medium rounded-lg
                         hover:bg-[#1B5E20] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loadingAnnual ? 'Generating...' : 'Download Annual Report (PDF)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
