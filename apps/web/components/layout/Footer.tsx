import Link from 'next/link'
import { Mountain, Waves } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#1A1A1A] text-white">

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-16">

          {/* Brand */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <Mountain className="text-amber-400" size={18} />
              <span className="font-serif text-xl">Ski</span>
              <Waves className="text-cyan-400" size={18} />
              <span className="font-serif text-xl">Sea</span>
              <span className="text-white/30 font-serif text-xl ml-1">Alure</span>
            </div>
            <p className="text-sm font-light text-white/40 leading-relaxed max-w-xs">
              A curated collection of exceptional properties across 
              Greece`s most breathtaking destinations. From alpine 
              retreats to Aegean escapes.
            </p>
            {/* Divider line */}
            <div className="w-8 h-px bg-amber-400" />
          </div>

          {/* Collections */}
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">
              Collections
            </h4>
            <ul className="space-y-3">
              {[
                { label: '🏔️ SkiAlure',         href: '/skiAlure'  },
                { label: '🏝️ SeaAlure',          href: '/seaAlure'  },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm font-light text-white/50 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">
              Account
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Sign In',       href: '/auth/login'    },
                { label: 'Create Account',href: '/auth/register' },
                { label: 'My Bookings',   href: '/profile'       },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm font-light text-white/50 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">
            © {currentYear} Alure. All rights reserved.
          </p>

          {/* Made with love */}
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">
            From a friend with{' '}
            <span className="text-red-400">♥</span>
          </p>
        </div>
      </div>

    </footer>
  )
}