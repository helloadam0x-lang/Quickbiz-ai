"use client"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const testimonials = [
  {
    name: "Amara Osei",
    role: "Founder, GoldCoast Threads",
    location: "Accra, Ghana",
    avatar: "AO",
    color: "amber",
    quote:
      "QuickBiz AI changed how I market my fashion brand. In 10 minutes I had Instagram captions, a WhatsApp promo, and an email blast — all sounding exactly like me. My engagement doubled in the first week.",
    stars: 5,
  },
  {
    name: "Fatima Al-Hassan",
    role: "CEO, Spice Routes Catering",
    location: "Lagos, Nigeria",
    avatar: "FA",
    color: "cyan",
    quote:
      "I used to spend hours writing copy that still didn't feel right. Now I generate five variations in seconds and pick the best one. My bookings went up 40% in the first month — I'm not going back.",
    stars: 5,
  },
  {
    name: "Kofi Mensah-Bonsu",
    role: "Marketing Lead, TechNairobi",
    location: "Nairobi, Kenya",
    avatar: "KM",
    color: "orange",
    quote:
      "The audience targeting is incredible. When I switch between 'Business Owners' and 'Young Professionals', the copy is completely different and both hit perfectly. This is built for us.",
    stars: 5,
  },
]

const colorMap: Record<string, { avatar: string; border: string }> = {
  amber: { avatar: "bg-amber-500/20 text-amber-400 border-amber-500/30", border: "hover:border-amber-500/25" },
  cyan:  { avatar: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",    border: "hover:border-cyan-500/25"  },
  orange:{ avatar: "bg-orange-500/20 text-orange-400 border-orange-500/30", border: "hover:border-orange-500/25" },
}

export default function Testimonials() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="testimonials" className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 kente-pattern opacity-30" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-amber mb-5">
            <span className="text-xs font-semibold text-amber-400 tracking-widest uppercase">Loved by Founders</span>
          </div>
          <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-5">
            Real Businesses.<br />
            <span className="text-gradient-amber">Real Results.</span>
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12, ease: "easeOut" }}
              className={`relative p-8 rounded-2xl glass border border-white/6 transition-all duration-300 flex flex-col ${colorMap[t.color].border}`}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <span key={j} className="text-amber-400 text-sm">★</span>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-white/65 text-sm leading-relaxed font-light flex-1 mb-8">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-white/5 pt-6">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold border ${colorMap[t.color].avatar} flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <div className="font-display font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-white/40 text-xs font-light">{t.role}</div>
                  <div className="text-white/25 text-xs font-light">{t.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social proof bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 py-8 rounded-2xl glass border border-white/6"
        >
          {[
            { value: "4.9/5", label: "Average rating" },
            { value: "10,000+", label: "Active users" },
            { value: "98%", label: "Would recommend" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-display font-black text-3xl text-gradient-amber">{s.value}</div>
              <div className="text-white/40 text-sm mt-0.5 font-light">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
