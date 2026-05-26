const links = {
  Product: ["Features", "Pricing", "Changelog", "Roadmap"],
  Resources: ["Docs", "Blog", "Tutorials", "API"],
  Company: ["About", "Careers", "Press", "Contact"],
  Legal: ["Privacy", "Terms", "Cookies", "Security"],
}

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 pt-20 pb-10 px-6">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                <span className="font-display font-black text-black text-sm">Q</span>
              </div>
              <span className="font-display font-bold text-white text-base">
                QuickBiz<span className="text-amber-400">AI</span>
              </span>
            </a>
            <p className="text-white/35 text-sm font-light leading-relaxed max-w-[180px]">
              Marketing copy for African businesses. Fast. On-brand. Effective.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {["tw", "ig", "li"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-8 h-8 rounded-full glass border border-white/8 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all duration-200 text-xs font-bold uppercase"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-display font-semibold text-white/80 text-sm mb-4 tracking-wide">{category}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-white/35 text-sm font-light hover:text-white/70 transition-colors duration-200">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
          <p className="text-white/25 text-xs font-light">
            © {new Date().getFullYear()} QuickBiz AI. Built for Africa, by Africa.
          </p>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full glass-amber">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/40 text-xs font-light">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
