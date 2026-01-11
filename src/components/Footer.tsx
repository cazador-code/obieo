import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="text-xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)]"
            >
              Obieo
            </Link>
            <p className="mt-4 text-sm text-[var(--text-secondary)]">
              Websites that turn clicks into customers for home service businesses.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Work', href: '/work' },
                { name: 'Services', href: '/services' },
                { name: 'Industries', href: '/industries' },
                { name: 'About', href: '/about' },
                { name: 'Contact', href: '/contact' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
              Services
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/services#sprint"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                >
                  Fix & Foundation Sprint
                </Link>
              </li>
              <li>
                <Link
                  href="/services#retainer"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                >
                  Ongoing Growth Retainer
                </Link>
              </li>
              <li>
                <Link
                  href="/quiz"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                >
                  Free Website Score
                </Link>
              </li>
              <li>
                <Link
                  href="/roi-calculator"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                >
                  ROI Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:hunter@obieo.com"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                >
                  hunter@obieo.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+15551234567"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                >
                  (555) 123-4567
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Links */}
        <div className="mt-12 pt-8 border-t border-[var(--border)]">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6">
            {[
              { name: 'Terms & Conditions', href: '/terms-and-conditions' },
              { name: 'Privacy Policy', href: '/privacy-policy' },
              { name: 'Fulfillment Policy', href: '/fulfillment-policy' },
              { name: 'Disclaimer', href: '/disclaimer' },
              { name: 'AI Privacy Policy', href: '/ai-privacy-policy' },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <p className="text-sm text-[var(--text-muted)] text-center">
            &copy; {new Date().getFullYear()} Obieo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
