'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { XCircle } from 'lucide-react'

export default function BookingCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center"
      >
        <XCircle size={64} className="text-red-400 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Booking Cancelled
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          Your booking was cancelled. No payment was taken.
        </p>
        <button
          onClick={() => router.back()}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          Go Back
        </button>
      </motion.div>
    </div>
  )
}