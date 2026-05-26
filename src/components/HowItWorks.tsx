"use client"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const steps = [
  {
    number: "01",
    title: "Describe Your Business",
    desc: "Enter your business name and a short description of what you sell. Takes 30 seconds.",
    detail: "QuickBiz AI understands your brand context and builds copy that represents you authentically.",
  },
  {
    number: "02",
    title: "Choose Tone & Audience",
    desc: "Pick who you're speaking to and how you want to sound — from luxury to hype.",
    detail: "4 tones × 7 audience types = 28 unique content voices. All perfectly calibrated.",
  },
  {
    number: "03",
    title: "Copy & Use Anywhere",
    desc: "Your marketing content is ready. Copy it to Instagram, email, WhatsApp, or your website.",
    detail: "One click copy. No formatting needed. Just paste and post.",
  },
]

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="how-it-works" className="relative py-32 px-6 overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/4 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-amber mb-5">
            <span className="text-xs font-semibold text-amber-400 tracking-widest uppercase">Simple Process</span>
          </div>
          <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-5">
            Ready in <span className="text-gradient-amber">3 Steps</span>
          </h2>
          <p className="text-white/50 text-lg max-w-md mx-auto font-light">
            No learning curve. No complex setup. Just results.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-12 left-1/2 -translate-x-1/2 w-[2px] h-[calc(100%-96px)] bg-gradient-to-b from-amber-500/30 via-amber-500/10 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: i * 0.15, ease: "easeOut" }}
                className="relative"
              >
                {/* Horizontal connector (mobile) */}
                {i < steps.length - 1 && (
                  <div className="lg:hidden absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 w-px h-8 bg-gradient-to-b from-amber-500/30 to-transparent" />
                )}

                <div className="p-8 rounded-2xl glass border border-white/6 hover:border-amber-500/20 transition-all duration-300 h-full">
                  {/* Number badge */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                        <span className="font-display font-black text-amber-400 text-sm">{step.number}</span>
                      </div>
                      <div className="absolute inset-0 rounded-xl glow-amber opacity-50" />
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-amber-500/20 to-transparent" />
                  </div>

                  <h3 className="font-display font-bold text-xl text-white mb-3">{step.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-4 font-light">{step.desc}</p>
                  <p className="text-white/30 text-xs leading-relaxed border-t border-white/5 pt-4">{step.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Demo block */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-16 p-8 rounded-2xl glass-amber border border-amber-500/15 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="text-xs font-semibold text-amber-400/60 tracking-widest uppercase mb-2">Example Output</div>
              <h4 className="font-display font-bold text-white text-lg mb-2">Afrobakes Lagos — Luxury Tone — Business Owners</h4>
              <p className="text-white/60 text-sm leading-relaxed font-light italic">
                "Where tradition meets indulgence. Every Afrobakes creation is handcrafted with premium
                ingredients, delivering an experience as rich as our heritage. Elevate your occasions with
                confections that speak power and taste like legacy."
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                ✓ Generated in 3.2s
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
