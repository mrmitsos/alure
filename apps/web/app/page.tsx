"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Minus } from "lucide-react";

export default function HomePage() {
  const [hovered, setHovered] = useState<"ski" | "sea" | null>(null);
  const router = useRouter();

  return (
    <div className="bg-[#FDFCFB] min-h-screen text-[#1A1A1A] overflow-x-hidden">
      {/* ── Hero: The Dual Perspective ── */}
      <section className="relative h-screen flex flex-col md:flex-row p-4 md:p-6 gap-4">
        {/* Ski Side */}
        <motion.div
          onMouseEnter={() => setHovered("ski")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => router.push("/skiAlure")}
          className="relative flex-1 overflow-hidden group cursor-pointer"
        >
          <motion.div
            animate={{ scale: hovered === "ski" ? 1.05 : 1 }}
            transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1548777123-e216912df7d8?q=80&w=2070')] bg-cover bg-center"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-700" />
          <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
            <motion.div
              animate={{ y: hovered === "ski" ? -20 : 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] mb-4 opacity-80">
                <Minus size={16} /> The High Altitude
              </p>
              <h2 className="text-6xl md:text-8xl font-serif mb-6 leading-none">
                Ski
                <br />
                <span className="italic ml-8">Alure</span>
              </h2>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: hovered === "ski" ? 1 : 0 }}
                className="flex items-center gap-4 text-sm font-light tracking-wide"
              >
                Explore the Winter Collection <ArrowRight size={16} />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Sea Side */}
        <motion.div
          onMouseEnter={() => setHovered("sea")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => router.push("/seaAlure")}
          className="relative flex-1 overflow-hidden group cursor-pointer"
        >
          <motion.div
            animate={{ scale: hovered === "sea" ? 1.05 : 1 }}
            transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?q=80&w=2070')] bg-cover bg-center"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-700" />
          <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
            <motion.div
              animate={{ y: hovered === "sea" ? -20 : 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] mb-4 opacity-80">
                <Minus size={16} /> The Aegean Soul
              </p>
              <h2 className="text-6xl md:text-8xl font-serif mb-6 leading-none text-right md:text-left">
                Sea
                <br />
                <span className="italic ml-8">Alure</span>
              </h2>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: hovered === "sea" ? 1 : 0 }}
                className="flex items-center gap-4 text-sm font-light tracking-wide justify-end md:justify-start"
              >
                Explore the Summer Collection <ArrowRight size={16} />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Philosophy Section ── */}
      <section className="py-32 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-amber-600">
              The Philosophy
            </h3>
            <h2 className="text-4xl md:text-6xl font-serif leading-[1.1]">
              We believe in properties with a{" "}
              <span className="italic text-slate-400 underline decoration-1 underline-offset-8">
                distinct soul.
              </span>
            </h2>
            <p className="text-lg text-slate-600 font-light leading-relaxed max-w-md">
              Alure isn`t just a booking platform. It`s a curation of
              architectural masterpieces, hand-selected to provide an atmosphere
              of quiet luxury and profound comfort.
            </p>
          </motion.div>

          <div className="relative">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="aspect-[3/4] bg-slate-200 rounded-sm overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070"
                alt="Architecture"
                className="w-full h-full object-cover"
              />
            </motion.div>
            {/* Floating Badge */}
            <div className="absolute -bottom-10 -left-10 bg-[#1A1A1A] text-white p-12 hidden lg:block">
              <p className="text-2xl font-serif italic mb-2">Pure Excellence</p>
              <p className="text-[10px] uppercase tracking-widest opacity-60">
                — Condé Nast Traveler
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Alure — Glacier Cards ── */}
      <section className="py-32 px-8 bg-linear-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-blue-400 mb-6">
              The Standard
            </h3>
            <h2 className="text-4xl md:text-5xl font-serif leading-[1.1]">
              Why Choose Alure?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                number: "01",
                title: "Handpicked Properties",
                desc: "Every property is personally selected and verified for quality, comfort and architectural character.",
                accent: "from-slate-100 to-blue-50",
                border: "border-blue-100",
              },
              {
                number: "02",
                title: "Premium Experience",
                desc: "From mountain chalets to island villas — only the finest properties make it into our collection.",
                accent: "from-blue-50 to-cyan-50",
                border: "border-cyan-100",
              },
              {
                number: "03",
                title: "Secure Booking",
                desc: "Safe payments powered by Stripe. Book with complete confidence and full transparency every time.",
                accent: "from-cyan-50 to-slate-50",
                border: "border-slate-100",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className={`
                  relative overflow-hidden rounded-2xl border ${item.border}
                  bg-linear-to-b ${item.accent}
                  p-10 group hover:shadow-xl transition-shadow duration-500
                `}
              >
                {/* Large number watermark */}
                <span className="absolute -top-4 -right-2 text-[120px] font-serif font-bold text-black/5 leading-none select-none">
                  {item.number}
                </span>

                {/* Top accent line */}
                <div className="w-8 h-px bg-slate-400 mb-8" />

                <h4 className="text-xl font-serif mb-4 text-slate-800">
                  {item.title}
                </h4>
                <p className="text-sm text-slate-500 font-light leading-relaxed">
                  {item.desc}
                </p>

                {/* Bottom arrow on hover */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="mt-8 flex items-center gap-2 text-xs uppercase tracking-widest text-slate-400"
                >
                  Learn more <ArrowRight size={12} />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 px-8 bg-[#FDFCFB]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-amber-600">
              Begin Your Journey
            </h3>
            <h2 className="text-4xl md:text-6xl font-serif leading-[1.1]">
              Ready for your
              <br />
              <span className="italic text-slate-400">next adventure?</span>
            </h2>
            <p className="text-slate-500 font-light max-w-md mx-auto">
              Browse our collection of mountain and island properties across
              Greece`s most beautiful destinations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={() => router.push("/skiAlure")}
                className="flex items-center justify-center gap-3 bg-[#1A1A1A] text-white px-8 py-4 text-sm uppercase tracking-widest hover:bg-slate-800 transition-colors"
              >
                Explore SkiAlure <ArrowRight size={14} />
              </button>
              <button
                onClick={() => router.push("/seaAlure")}
                className="flex items-center justify-center gap-3 border border-[#1A1A1A] text-[#1A1A1A] px-8 py-4 text-sm uppercase tracking-widest hover:bg-slate-50 transition-colors"
              >
                Explore SeaAlure <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
