import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link
              href="/"
              className="font-[family-name:var(--font-display)] text-2xl font-bold text-white tracking-tight"
            >
              obieo
            </Link>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed max-w-sm">
              SEO, AEO, and website optimization for home service businesses.
              From someone who actually runs one.
            </p>
            <div className="mt-6 flex flex-col gap-2 text-sm">
              <a
                href="mailto:hunter@obieo.com"
                className="text-slate-400 hover:text-terracotta-400 transition-colors"
              >
                hunter@obieo.com
              </a>
              <a
                href="tel:5551234567"
                className="text-slate-400 hover:text-terracotta-400 transition-colors"
              >
                (555) 123-4567
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/services"
                  className="text-sm text-slate-400 hover:text-terracotta-400 transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-slate-400 hover:text-terracotta-400 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-slate-400 hover:text-terracotta-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Services</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/services#sprint"
                  className="text-sm text-slate-400 hover:text-terracotta-400 transition-colors"
                >
                  Fix & Foundation Sprint
                </Link>
              </li>
              <li>
                <Link
                  href="/services#retainer"
                  className="text-sm text-slate-400 hover:text-terracotta-400 transition-colors"
                >
                  Ongoing Growth Retainer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Obieo. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">
            Built with care for home service businesses.
          </p>
        </div>
      </div>
    </footer>
  );
}

