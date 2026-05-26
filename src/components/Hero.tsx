"use client"
import { motion } from "framer-motion"
import { MeshGradient } from "@paper-design/shaders-react"

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
}

const stats = [
  { value: "10k+", label: "Businesses" },
  { value: "500k+", label: "Copies Generated" },
  { value: "4.9★", label: "Rating" },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24 pb-16 px-6">
      {/* Shader background */}
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-40"
        colors={["#080808", "#92400e", "#f59e0b", "#164e63", "#080808"]}
        speed={0.15}
      />

      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_30%,#080808_100%)]" />

      {/* Kente geometric accent top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      {/* Floating ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        className="relative z-10 max-w-5xl mx-auto text-center"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-amber text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-300/90">Now serving 10,000+ African businesses</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="font-display font-black leading-[1.0] tracking-tight mb-6"
        >
          <span className="block text-5xl sm:text-7xl lg:text-8xl text-white">
            Marketing Copy
          </span>
          <span className="block text-5xl sm:text-7xl lg:text-8xl text-gradient-amber mt-1">
            That Converts.
          </span>
          <span className="block text-3xl sm:text-4xl lg:text-5xl font-light text-white/40 mt-3 tracking-wide">
            In Under 5 Seconds.
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          variants={fadeUp}
          className="text-lg sm:text-xl text-white/55 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
        >
          AI-powered content generation tuned for African markets. Choose your tone, pick your
          audience, and get social posts, ads, emails, and more — instantly.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <motion.a
            href="#"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-4 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-base glow-amber transition-all duration-200 w-full sm:w-auto text-center"
          >
            Start Free — No Card Needed
          </motion.a>
          <motion.a
            href="#how-it-works"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-8 py-4 rounded-full glass hover:bg-white/6 text-white/80 hover:text-white font-medium text-base transition-all duration-200 w-full sm:w-auto justify-center"
          >
            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 ml-0.5">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            See How It Works
          </motion.a>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12"
        >
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-display font-black text-2xl sm:text-3xl text-gradient-amber">{s.value}</div>
              <div className="text-sm text-white/40 font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080808] to-transparent" />

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-0.5 h-8 bg-gradient-to-b from-amber-500/40 to-transparent rounded-full"
        />
      </motion.div>
    </section>
  )
}
