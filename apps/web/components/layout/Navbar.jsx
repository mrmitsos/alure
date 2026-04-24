"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mountain,
  Waves,
  LogOut,
  X,
  AlignRight,
  ArrowRight,
} from "lucide-react";
import useAuthStore from "@/store/authStore";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.push("/");
  };

  const navLinks = [
    { name: "SkiAlure", href: "/skiAlure", icon: <Mountain size={16} /> },
    { name: "SeaAlure", href: "/seaAlure", icon: <Waves size={16} /> },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FDFCFB]/80 backdrop-blur-md border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo: Editorial Style with Balanced Spacing */}
            <Link href="/" className="group flex items-center gap-4">
              <div className="flex items-center gap-3 opacity-80 group-hover:opacity-100 transition-all duration-500">
                {/* Ski Icon */}
                <Mountain
                  size={18}
                  strokeWidth={1.5}
                  className="text-slate-900 group-hover:text-amber-600 transition-colors"
                />

                {/* Subtle Vertical Divider */}
                <div className="h-3 w-[1px] bg-slate-300" />

                {/* Sea Icon */}
                <Waves
                  size={18}
                  strokeWidth={1.5}
                  className="text-slate-900 group-hover:text-cyan-600 transition-colors"
                />
              </div>

              {/* Brand Name */}
              <span className="font-serif text-xl tracking-[0.15em] uppercase italic text-slate-900">
                Alure
              </span>
            </Link>

            {/* Desktop Nav: Stacked Layout */}
            <div className="hidden md:flex items-center gap-10">
              {/* The Navigation + Phone Stack */}
              <div className="flex flex-col items-end gap-1">
                {/* Top Row: Links */}
                <div className="flex items-center gap-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 hover:text-black transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>

                {/* Bottom Row: Phone */}
                <a
                  href="tel:+302100000000"
                  className="text-[9px] uppercase tracking-[0.2em] font-medium text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2"
                >
                  <span className="italic font-serif lowercase tracking-normal text-[11px] opacity-60">
                    concierge
                  </span>
                  +30 210 000 0000
                </a>
              </div>

              {/* Vertical Divider */}
              <div className="h-8 w-[1px] bg-slate-200" />

              {/* Auth Section */}
              {mounted &&
                (user ? (
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 italic">
                      {user.name}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-slate-500 hover:text-red-600 transition-colors"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className="text-[10px] uppercase tracking-[0.2em] font-bold px-6 py-3 border border-black hover:bg-black hover:text-white transition-all"
                  >
                    Client Access
                  </Link>
                ))}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden p-2 text-slate-900"
            >
              <AlignRight size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Full Screen Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
            className="fixed inset-0 z-[60] bg-[#FDFCFB] flex flex-col p-8 md:hidden"
          >
            {/* --- Top Header within Menu --- */}
            <div className="flex justify-between items-center mb-12">
              <span className="font-serif italic text-xl tracking-widest">
                Alure
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 hover:rotate-90 transition-transform duration-300"
              >
                <X size={32} strokeWidth={1.2} />
              </button>
            </div>

            {/* --- Main Navigation Links --- */}
            <div className="flex flex-col justify-center flex-1 space-y-10 pl-4">
              <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold">
                Explore Collections
              </p>

              <div className="space-y-6">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="text-5xl font-serif italic text-slate-900 block hover:pl-4 transition-all duration-500 group"
                    >
                      {link.name}
                      <span className="inline-block ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight
                          size={32}
                          strokeWidth={1}
                          className="inline"
                        />
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* --- Auth/Client Section --- */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="pt-10 border-t border-slate-200"
              >
                {user ? (
                  <div className="space-y-6">
                    <Link
                      href="/profile"
                      className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Hi, {user.name}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-red-500 text-[10px] uppercase tracking-[0.3em] font-bold border-b border-red-200 pb-1"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={() => setMenuOpen(false)}
                    className="text-2xl font-serif italic text-slate-900 hover:text-slate-500 transition-colors"
                  >
                    Client Access Portal
                  </Link>
                )}
              </motion.div>
            </div>

            {/* --- Bottom Contact & Footer Section --- */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-auto pl-4 space-y-6"
            >
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">
                  Direct Concierge
                </p>
                <a
                  href="tel:+302100000000"
                  className="text-2xl font-serif italic text-slate-900 block"
                >
                  +30 210 000 0000
                </a>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                <p className="text-[9px] uppercase tracking-[0.4em] text-slate-300">
                  &copy; 2026 Alure Collections
                </p>
                <div className="flex gap-4 opacity-40">
                  <Mountain size={14} />
                  <Waves size={14} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
