/**
 * Author Bio Component
 * E-E-A-T signals for expertise and trust
 * Displays author credentials and photo
 */

import Image from 'next/image'

interface AuthorBioProps {
  industryName: string
}

export function AuthorBio({ industryName }: AuthorBioProps) {
  return (
    <section id="author" className="mb-12">
      <div className="bg-gray-50 rounded-lg p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Author Image */}
          <div className="flex-shrink-0">
            <Image
              src="/images/hunter-headshot.jpg"
              alt="Hunter Lapeyre - Obieo Founder"
              width={120}
              height={120}
              className="rounded-full"
            />
          </div>

          {/* Author Info */}
          <div>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1">
              Written By
            </p>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Hunter Lapeyre</h3>
            <p className="text-gray-600 mb-4">
              Founder & SEO Strategist at Obieo
            </p>

            <p className="text-gray-700 mb-4">
              Hunter spent 5 years running a roofing company before transitioning to digital
              marketing. He has helped 50+ home service businesses improve their search visibility
              and understands the unique challenges {industryName.toLowerCase()} companies face
              in standing out online. His hands-on experience in the trades gives him a practical
              perspective that pure marketers often lack.
            </p>

            {/* Credentials */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                Former Contractor
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                50+ Clients Served
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm">
                SEO/GEO Specialist
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://www.linkedin.com/in/hunterlapeyre"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
