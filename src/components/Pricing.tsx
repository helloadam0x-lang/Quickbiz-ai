"use client"
import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"

const plans = [
  {
    name: "Starter",
    badge: null,
    price: { monthly: 0, yearly: 0 },
    desc: "Perfect for trying it out and small businesses getting started.",
    features: [
      "5 generations per day",
      "4 tone options",
      "7 audience types",
      "Copy to clipboard",
      "Basic email support",
    ],
    cta: "Get Started Free",
    ctaStyle: "glass hover:bg-white/8 border border-white/10 text-white",
    featured: false,
  },
  {
    name: "Pro",
    badge: "Most Popular",
    price: { monthly: 19, yearly: 15 },
    desc: "Unlimited copy for growing businesses serious about their brand.",
    features: [
      "Unlimited generations",
      "All 4 tone options",
      "All 7 audience types",
      "Generation history",
      "Priority support",
      "Bulk export (CSV)",
      "Custom brand voice",
    ],
    cta: "Start Pro Trial",
    ctaStyle: "bg-amber-500 hover:bg-amber-400 text-black glow-amber",
    featured: true,
  },
  {
    name: "Enterprise",
    badge: null,
    price: { monthly: 79, yearly: 65 },
    desc: "For agencies and teams managing multiple brands at scale.",
    features: [
      "Everything in Pro",
      "10 brand workspaces",
      "Team collaboration",
      "API access",
      "White-label output",
      "Dedicated account manager",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    ctaStyle: "glass hover:bg-white/8 border border-white/10 text-white",
    featured: false,
  },
]

export default function Pricing() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const [yearly, setYearly] = useState(false)

  return (
    <section id="pricing" className="relative py-32 px-6 overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      <div className="max-w-6xl mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-amber mb-5">
            <span className="text-xs font-semibold text-amber-400 tracking-widest uppercase">Pricing</span>
          </div>
          <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-5">
            Simple, Transparent<br />
            <span className="text-gradient-amber">No Surprises</span>
          </h2>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 mt-6 p-1 rounded-full glass border border-white/8">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                !yearly ? "bg-amber-500 text-black" : "text-white/50 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                yearly ? "bg-amber-500 text-black" : "text-white/50 hover:text-white"
              }`}
            >
              Yearly
              <span className={`text-xs px-2 py-0.5 rounded-full transition-colors ${yearly ? "bg-black/20" : "bg-amber-500/20 text-amber-400"}`}>
                −20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
              className={`relative rounded-2xl p-8 border transition-all duration-300 ${
                plan.featured
                  ? "glass-amber border-amber-500/30 glow-amber md:-mt-4 md:pb-12"
                  : "glass border-white/8 hover:border-white/15"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500 text-black text-xs font-black tracking-wide uppercase whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-display font-bold text-xl text-white mb-1">{plan.name}</h3>
                <p className="text-white/40 text-sm font-light leading-relaxed">{plan.desc}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-end gap-1">
                  <span className="font-display font-black text-5xl text-white">
                    {plan.price.monthly === 0 ? "Free" : `$${yearly ? plan.price.yearly : plan.price.monthly}`}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className="text-white/30 text-sm pb-2 font-light">/mo</span>
                  )}
                </div>
                {yearly && plan.price.monthly > 0 && (
                  <div className="text-xs text-amber-400/70 mt-1">Billed annually</div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      plan.featured ? "bg-amber-500/20 text-amber-400" : "bg-white/8 text-white/60"
                    }`}>
                      ✓
                    </span>
                    <span className="text-white/60 font-light">{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className={`block w-full py-3.5 rounded-full text-center text-sm font-semibold transition-all duration-200 ${plan.ctaStyle}`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>

        {/* Fine print */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="text-center text-white/25 text-xs mt-10 font-light"
        >
          No credit card required for Starter · Cancel Pro anytime · All prices in USD
        </motion.p>
      </div>
    </section>
  )
}
