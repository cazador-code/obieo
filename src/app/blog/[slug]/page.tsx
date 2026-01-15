import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { PortableText, PortableTextBlock } from '@portabletext/react'
import { Section, Container } from '@/components/ui'
import { FadeInSection } from '@/components/animations'
import { sanityFetch, urlFor } from '@/sanity/client'
import { blogPostBySlugQuery, blogPostsQuery } from '@/sanity/queries'

interface BlogPost {
  _id: string
  title: string
  slug: { current: string }
  metaTitle: string
  metaDescription: string
  excerpt: string
  featuredImage: unknown
  body: PortableTextBlock[]
  publishedAt: string
  primaryKeyword: string
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await sanityFetch<{ slug: { current: string } }[]>({
    query: blogPostsQuery,
  })
  return posts.map((post) => ({ slug: post.slug.current }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await sanityFetch<BlogPost | null>({
    query: blogPostBySlugQuery,
    params: { slug },
    defaultValue: null,
  })

  if (!post) return { title: 'Post Not Found | Obieo' }

  return {
    title: post.metaTitle || `${post.title} | Obieo Blog`,
    description: post.metaDescription || post.excerpt,
  }
}

// Custom PortableText components for blog styling
const portableTextComponents = {
  types: {
    image: ({ value }: { value: { alt?: string; caption?: string } & unknown }) => (
      <figure className="my-8">
        <div className="relative aspect-video rounded-xl overflow-hidden">
          <Image
            src={urlFor(value).width(1200).url()}
            alt={value.alt || ''}
            fill
            className="object-cover"
          />
        </div>
        {value.caption && (
          <figcaption className="text-center text-sm text-[var(--text-muted)] mt-2">
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
  },
  marks: {
    link: ({ children, value }: { children: React.ReactNode; value?: { href?: string } }) => {
      const href = value?.href || '#'
      const isExternal = href.startsWith('http')
      return (
        <a
          href={href}
          className="text-[var(--accent)] hover:underline"
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </a>
      )
    },
  },
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await sanityFetch<BlogPost | null>({
    query: blogPostBySlugQuery,
    params: { slug },
    tags: ['blogPost'],
    defaultValue: null,
  })

  if (!post) notFound()

  return (
    <>
      {/* Hero */}
      <Section size="lg" className="pt-32">
        <Container size="md">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>
          <FadeInSection>
            {post.publishedAt && (
              <time className="text-sm text-[var(--text-muted)] mb-4 block">
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-xl text-[var(--text-secondary)]">
                {post.excerpt}
              </p>
            )}
          </FadeInSection>
        </Container>
      </Section>

      {/* Featured Image */}
      {post.featuredImage && (
        <Section size="sm" className="py-0">
          <Container>
            <div className="relative aspect-video rounded-2xl overflow-hidden">
              <Image
                src={urlFor(post.featuredImage).width(1400).url()}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </Container>
        </Section>
      )}

      {/* Body */}
      {post.body && post.body.length > 0 && (
        <Section>
          <Container size="md">
            <FadeInSection>
              <div className="prose prose-lg max-w-none text-[var(--text-secondary)] prose-p:text-[var(--text-secondary)] prose-headings:text-[var(--text-primary)] prose-headings:font-[family-name:var(--font-display)] prose-strong:text-[var(--text-primary)] prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline prose-ul:text-[var(--text-secondary)] prose-ol:text-[var(--text-secondary)] prose-li:text-[var(--text-secondary)]">
                <PortableText value={post.body} components={portableTextComponents} />
              </div>
            </FadeInSection>
          </Container>
        </Section>
      )}

      {/* CTA */}
      <Section variant="alternate">
        <Container size="md">
          <FadeInSection>
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
                Ready to grow your home service business?
              </h2>
              <p className="text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
                Book a free strategy call to discuss how SEO can help you generate more leads.
              </p>
              <Link
                href="/call"
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors"
              >
                Book a Free Call
              </Link>
            </div>
          </FadeInSection>
        </Container>
      </Section>
    </>
  )
}
