import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  active: 'bg-[#E8F5E9] text-[#2E7D32]',
  inactive: 'bg-gray-100 text-gray-500',
  suspended: 'bg-red-50 text-red-600',
}

const EMPTY_FORM = {
  first_name: '', last_name: '', email: '', password: '',
  phone: '', gender: 'M', department: '', date_joined_cooperative: '',
  address: '', next_of_kin_name: '', next_of_kin_phone: '',
}

export default function Members() {
  const [members, setMembers] = useState([])
  const [count, setCount] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const fetchMembers = async (q = '') => {
    setLoading(true)
    try {
      const { data } = await api.get(`/members/?search=${q}`)
      setMembers(data.results || [])
      setCount(data.count || 0)
    } catch { toast.error('Failed to load members') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchMembers() }, [])

  const handleSearch = (e) => {
    setSearch(e.target.value)
    fetchMembers(e.target.value)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/members/', form)
      toast.success('Member registered successfully')
      setShowModal(false)
      setForm(EMPTY_FORM)
      fetchMembers()
    } catch (err) {
      const msg = err.response?.data
      toast.error(typeof msg === 'string' ? msg : 'Registration failed')
    } finally { setSubmitting(false) }
  }

  const toggleStatus = async (id) => {
    try {
      await api.patch(`/members/${id}/toggle_status/`)
      fetchMembers(search)
      toast.success('Status updated')
    } catch { toast.error('Failed to update status') }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h2 className="text-2xl font-bold text-[#1A2B1A]">Members</h2>
          <p className="text-sm text-[#5A7A5A] mt-0.5">{count} total registered members</p>
        </div>
        <button
          id="add-member-btn"
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#2E7D32] text-white text-sm font-medium rounded-lg hover:bg-[#1B5E20] transition-colors"
        >
          Register Member
        </button>
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          id="member-search"
          placeholder="Search by name, ID, email or phone..."
          value={search}
          onChange={handleSearch}
          className="w-full max-w-sm px-4 py-2.5 text-sm border border-[#E0E8E0] rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E0E8E0] overflow-hidden">
        {loading ? (
          <div className="p-8 text-sm text-[#5A7A5A] text-center">Loading members...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAF8] text-[#5A7A5A] text-xs uppercase tracking-wide">
                {['Member ID', 'Name', 'Email', 'Phone', 'Department', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E8E0]">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-[#5A7A5A]">No members found.</td>
                </tr>
              ) : members.map((m) => (
                <tr key={m.id} className="hover:bg-[#F8FAF8] transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-[#2E7D32] font-semibold">{m.member_id}</td>
                  <td className="px-5 py-3 font-medium text-[#1A2B1A]">{m.full_name}</td>
                  <td className="px-5 py-3 text-[#5A7A5A]">{m.email}</td>
                  <td className="px-5 py-3 text-[#5A7A5A]">{m.phone}</td>
                  <td className="px-5 py-3 text-[#5A7A5A]">{m.department || '-'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[m.status]}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleStatus(m.id)}
                      className="text-xs text-[#5A7A5A] hover:text-[#2E7D32] underline"
                    >
                      {m.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-[#1A2B1A]">Register New Member</h3>
              <button onClick={() => setShowModal(false)} className="text-[#5A7A5A] hover:text-[#1A2B1A]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              {[
                { name: 'first_name', label: 'First Name', type: 'text' },
                { name: 'last_name', label: 'Last Name', type: 'text' },
                { name: 'email', label: 'Email Address', type: 'email' },
                { name: 'password', label: 'Password', type: 'password' },
                { name: 'phone', label: 'Phone Number', type: 'text' },
                { name: 'department', label: 'Department', type: 'text' },
                { name: 'date_joined_cooperative', label: 'Date Joined', type: 'date' },
              ].map(({ name, label, type }) => (
                <div key={name}>
                  <label className="block text-xs font-medium text-[#1A2B1A] mb-1">{label}</label>
                  <input
                    type={type}
                    required={['first_name','last_name','email','password','phone','date_joined_cooperative'].includes(name)}
                    value={form[name]}
                    onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#E0E8E0] rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-[#1A2B1A] mb-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E0E8E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#1A2B1A] mb-1">Address</label>
                <textarea
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E0E8E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] resize-none"
                />
              </div>
              <div className="col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-[#5A7A5A] border border-[#E0E8E0] rounded-lg hover:bg-[#F8FAF8]">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2 text-sm bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] disabled:opacity-60">
                  {submitting ? 'Registering...' : 'Register Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
