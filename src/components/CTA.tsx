"use client"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { MeshGradient } from "@paper-design/shaders-react"

export default function CTA() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section className="relative py-32 px-6 overflow-hidden" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Shader bg */}
          <MeshGradient
            className="absolute inset-0 w-full h-full opacity-70"
            colors={["#92400e", "#f59e0b", "#0891b2", "#080808", "#f97316"]}
            speed={0.25}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-black/60" />

          {/* Top line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

          {/* Content */}
          <div className="relative z-10 px-8 py-20 md:px-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 border border-amber-500/30 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-300/90 text-sm font-medium">Free forever. No card required.</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-6"
            >
              Your Next Customer Is<br />
              <span className="text-gradient-amber">One Prompt Away.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="text-white/60 text-lg max-w-xl mx-auto mb-10 font-light leading-relaxed"
            >
              Join 10,000+ African businesses using QuickBiz AI to write marketing copy that
              actually converts. Start free in 60 seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.a
                href="#"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-4 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-base glow-amber transition-all duration-200 w-full sm:w-auto text-center"
              >
                Start Generating Free
              </motion.a>
              <motion.a
                href="#pricing"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-base transition-all duration-200 w-full sm:w-auto text-center"
              >
                View Pricing
              </motion.a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
