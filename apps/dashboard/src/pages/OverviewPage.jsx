import { useEffect, useState } from 'react'
import { Building2, CalendarCheck, Users, Clock, TrendingUp, DollarSign } from 'lucide-react'
import api from '../lib/axios'

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
    <div className="flex items-center justify-between mb-4">
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
    <p className="text-3xl font-bold text-slate-800">{value ?? '—'}</p>
    {subtitle && <p className="text-slate-400 text-xs mt-1">{subtitle}</p>}
  </div>
)

export default function OverviewPage() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/analytics/overview')
        setStats(data)
      } catch (err) {
        setError('Failed to load stats')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return (
    <div className="p-8 flex items-center justify-center h-full">
      <div className="text-slate-400">Loading...</div>
    </div>
  )

  if (error) return (
    <div className="p-8">
      <div className="bg-red-50 text-red-500 p-4 rounded-lg">{error}</div>
    </div>
  )

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
        <p className="text-slate-400 text-sm mt-1">
          Welcome back! Here's what's happening.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Properties"
          value={stats?.totalProperties}
          icon={Building2}
          color="bg-blue-500"
          subtitle="Active listings"
        />
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings}
          icon={CalendarCheck}
          color="bg-green-500"
          subtitle="All time"
        />
        <StatCard
          title="Total Guests"
          value={stats?.totalGuests}
          icon={Users}
          color="bg-purple-500"
          subtitle="Registered users"
        />
        <StatCard
          title="Pending Bookings"
          value={stats?.pendingBookings}
          icon={Clock}
          color="bg-amber-500"
          subtitle="Awaiting confirmation"
        />
        <StatCard
          title="Total Revenue"
          value={`€${stats?.revenue?.totalRevenue?.toFixed(2) ?? '0.00'}`}
          icon={DollarSign}
          color="bg-emerald-500"
          subtitle="Gross revenue"
        />
        <StatCard
          title="Platform Fee Earned"
          value={`€${stats?.revenue?.totalPlatformFee?.toFixed(2) ?? '0.00'}`}
          icon={TrendingUp}
          color="bg-slate-500"
          subtitle="Your earnings"
        />
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-slate-800 font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {stats?.pendingBookings > 0 ? (
            <p className="text-slate-500 text-sm">
              You have <span className="text-amber-500 font-semibold">
                {stats.pendingBookings} pending booking{stats.pendingBookings > 1 ? 's' : ''}
              </span> waiting for confirmation.
            </p>
          ) : (
            <p className="text-slate-400 text-sm">No pending activity.</p>
          )}
        </div>
      </div>

    </div>
  )
}