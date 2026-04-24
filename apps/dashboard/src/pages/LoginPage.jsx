import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import api from '../lib/axios'
import { Mountain, Waves } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const { login } = useAuthStore()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      login(data, data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Mountain className="text-amber-400" size={24} />
          <span className="text-white font-bold text-2xl">Ski</span>
          <Waves className="text-blue-400" size={24} />
          <span className="text-white font-bold text-2xl">Sea</span>
          <span className="text-slate-400 text-2xl ml-1">Alure</span>
        </div>

        <h2 className="text-white text-xl font-semibold text-center mb-6">
          Dashboard Login
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-400 text-sm mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 text-sm border border-slate-600 focus:outline-none focus:border-blue-500"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="text-slate-400 text-sm mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 text-sm border border-slate-600 focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}