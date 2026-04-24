'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

export default function BookingSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => router.push('/'), 10000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
        </motion.div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Booking Confirmed! 🎉
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          Your payment was successful. You`ll receive a confirmation email shortly.
        </p>
        <p className="text-slate-300 text-xs">
          Redirecting to home in 5 seconds...
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 text-blue-600 text-sm hover:underline"
        >
          Go home now
        </button>
      </motion.div>
    </div>
  )
}