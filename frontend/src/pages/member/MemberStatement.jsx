import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function MemberStatement() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/members/me/').then(({ data }) => setProfile(data)).catch(() => {})
  }, [])

  const downloadStatement = async () => {
    if (!profile) return
    setLoading(true)
    try {
      const response = await api.get(`/reports/statement/${profile.id}/`, { responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `statement_${profile.member_id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Statement downloaded')
    } catch { toast.error('Failed to generate statement') }
    finally { setLoading(false) }
  }

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-[#1A2B1A]">Account Statement</h2>
        <p className="text-sm text-[#5A7A5A] mt-0.5">Download your full account statement as a PDF</p>
      </div>

      <div className="bg-white rounded-xl border border-[#E0E8E0] p-6 max-w-md">
        <p className="text-sm text-[#5A7A5A] mb-4">
          Your account statement includes your savings history, loan records, share holdings,
          and account summary — formatted as a PDF document.
        </p>
        {profile && (
          <div className="bg-[#F8FAF8] rounded-lg p-4 mb-4 text-sm space-y-1">
            <p><span className="text-[#5A7A5A]">Member ID:</span> <span className="font-medium">{profile.member_id}</span></p>
            <p><span className="text-[#5A7A5A]">Name:</span> <span className="font-medium">{profile.full_name}</span></p>
          </div>
        )}
        <button
          id="download-my-statement-btn"
          onClick={downloadStatement}
          disabled={loading || !profile}
          className="w-full py-2.5 bg-[#2E7D32] text-white text-sm font-medium rounded-lg
                     hover:bg-[#1B5E20] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Generating PDF...' : 'Download My Statement (PDF)'}
        </button>
      </div>
    </div>
  )
}
