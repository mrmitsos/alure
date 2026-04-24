"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mountain, Waves, ArrowRight, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data, data.token);
      router.back();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message ||
          "Invalid credentials. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    /* We use flex-col and min-h-screen to ensure the footer stays at the bottom 
       without overlapping the content on small screens */
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center p-6 selection:bg-amber-100">
      {/* Spacer to push content toward center but leave room at top */}
      <div className="flex-grow flex flex-col items-center justify-center w-full max-w-[400px] py-12">
        {/* Editorial Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Link href="/" className="flex flex-col items-center gap-4 group">
            <div className="flex items-center gap-4 text-slate-900">
              <Mountain size={20} strokeWidth={1.2} />
              <div className="h-4 w-[1px] bg-slate-300" />
              <Waves size={20} strokeWidth={1.2} />
            </div>
            <span className="font-serif text-2xl tracking-[0.2em] uppercase italic text-slate-900">
              Alure
            </span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif italic text-slate-900 mb-3">
              Client Access
            </h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
              Secure Member Portal
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-[10px] text-red-500 mb-6 font-bold tracking-widest uppercase"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 ml-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent border-b border-slate-200 py-3 px-1 text-slate-900 focus:outline-none focus:border-slate-900 transition-colors placeholder:text-slate-300 font-light"
                placeholder="resident@alure.com"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-end">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 ml-1">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[9px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent border-b border-slate-200 py-3 px-1 text-slate-900 focus:outline-none focus:border-slate-900 transition-colors placeholder:text-slate-300 font-light"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 relative group overflow-hidden bg-slate-900 text-white text-[10px] uppercase tracking-[0.3em] font-bold py-5 rounded-sm transition-all hover:bg-slate-800 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  Sign In{" "}
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-[11px] text-slate-400 font-light tracking-wide">
              New to Alure?{" "}
              <Link
                href="/auth/register"
                className="text-slate-900 font-bold hover:italic transition-all ml-1 underline underline-offset-4 decoration-slate-200"
              >
                Request Access
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Natural Footer: No longer fixed, will sit at the bottom of the content flow */}
      <footer className="w-full py-8 text-center mt-auto">
        <p className="text-[9px] uppercase tracking-[0.4em] text-slate-300">
          Alure Luxury Collections &copy; 2026
        </p>
      </footer>
    </div>
  );
}
