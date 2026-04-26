import { motion } from 'framer-motion'
import { Mountain, Waves } from 'lucide-react'

export default function Loader() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-8">

      {/* Animated Logo */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Mountain className="text-amber-400" size={28} />
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
          className="w-8 h-px bg-slate-600"
        />

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        >
          <Waves className="text-cyan-400" size={28} />
        </motion.div>
      </div>

      {/* Brand name */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="flex items-center gap-1"
      >
        <span className="font-serif text-xl text-white">Ski</span>
        <span className="font-serif text-xl text-white">Sea</span>
        <span className="font-serif text-xl text-slate-500 ml-1">Alure</span>
      </motion.div>

      {/* Loading bar */}
      <div className="w-32 h-px bg-slate-700 overflow-hidden rounded-full">
        <motion.div
          className="h-full bg-slate-400"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

    </div>
  )
}