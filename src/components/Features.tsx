"use client"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

const features = [
  {
    icon: "✦",
    color: "amber",
    title: "Tone Matching",
    desc: "Luxury, professional, hype, or friendly — your copy sounds exactly like your brand, every single time.",
  },
  {
    icon: "⚡",
    color: "cyan",
    title: "Instant Generation",
    desc: "Stop staring at a blank screen. Compelling copy appears in under 5 seconds. Refine it in one click.",
  },
  {
    icon: "🎯",
    color: "orange",
    title: "Audience Targeting",
    desc: "Young professionals, mothers, students — speak directly to the people most likely to buy from you.",
  },
  {
    icon: "📱",
    color: "amber",
    title: "Multi-Platform Ready",
    desc: "One input, multiple outputs. Social posts, email campaigns, ad copy, WhatsApp blasts — all formatted.",
  },
  {
    icon: "🌍",
    color: "cyan",
    title: "African Market Focus",
    desc: "Language and cultural nuance tuned for Nigerian, Kenyan, Ghanaian, and pan-African audiences.",
  },
  {
    icon: "🔄",
    color: "orange",
    title: "Unlimited Revisions",
    desc: "Not quite right? Regenerate with a different tone or tweak the prompt until it's exactly what you need.",
  },
]

const colorMap: Record<string, string> = {
  amber: "border-amber-500/20 hover:border-amber-500/40",
  cyan: "border-cyan-500/20 hover:border-cyan-500/40",
  orange: "border-orange-500/20 hover:border-orange-500/40",
}

const glowMap: Record<string, string> = {
  amber: "text-amber-400 bg-amber-500/10",
  cyan: "text-cyan-400 bg-cyan-500/10",
  orange: "text-orange-400 bg-orange-500/10",
}

export default function Features() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="features" className="relative py-32 px-6">
      <div className="absolute inset-0 kente-pattern opacity-50" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
          ref={ref}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-amber mb-5">
            <span className="text-xs font-semibold text-amber-400 tracking-widest uppercase">Everything You Need</span>
          </div>
          <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-5">
            Built for Businesses<br />
            <span className="text-gradient-amber">That Mean Business</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto font-light leading-relaxed">
            Every feature is designed to help you create faster, connect deeper, and sell smarter.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
              className={`group relative p-7 rounded-2xl glass border transition-all duration-300 cursor-default ${colorMap[f.color]}`}
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl text-xl mb-5 ${glowMap[f.color]}`}>
                {f.icon}
              </div>

              <h3 className="font-display font-bold text-xl text-white mb-3">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed font-light">{f.desc}</p>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-white/[0.02] to-transparent" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
