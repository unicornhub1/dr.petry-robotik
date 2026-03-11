'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, User } from 'lucide-react'
import { Container, Badge, SplitText } from '@/components/ui'

const blogPosts = [
  {
    id: 1,
    slug: 'messroboter-mr1-vorstellung',
    title: 'Der MR-1: Unser autonomer Messroboter im Detail',
    excerpt: 'Lernen Sie den MR-1 kennen - unseren autonomen Messroboter für professionelle Beleuchtungsmessungen. Erfahren Sie alles über Technik, Einsatzgebiete und Vorteile.',
    category: 'Produkt',
    date: '15. Januar 2025',
    readTime: '8 min',
    author: 'Petry Robotik',
    image: '/Bilder/iloveimg-compressed/Gemini_Generated_Image_zhdezazhdezazhde.png',
  },
]

const categories = ['Alle', 'Produkt', 'Technologie', 'Normen']

export default function BlogPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-12">
        <Container size="wide">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge variant="gradient" className="mb-4">
              Blog
            </Badge>
            <SplitText
              text="Neuigkeiten & Insights"
              tag="h1"
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              splitType="words"
              delay={0.08}
            />
            <p className="text-lg text-[var(--theme-textSecondary)]">
              Aktuelle Artikel zu Lichtmessung, Normen, Technologie und Praxisbeispiele
              aus der Welt der autonomen Messtechnik.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Categories */}
      <section className="py-8">
        <Container size="wide">
          <motion.div
            className="flex flex-wrap gap-2 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {categories.map((cat, i) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  i === 0
                    ? 'text-white'
                    : 'bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-textSecondary)] hover:border-[var(--accent-primary)]/30'
                }`}
                style={i === 0 ? {
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                } : undefined}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Blog Posts */}
      <section className="py-12">
        <Container size="wide">
          <div className="grid md:grid-cols-2 gap-6">
            {blogPosts.map((post, index) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="group relative p-[1px] rounded-2xl overflow-hidden h-full cursor-pointer"
                  style={{ isolation: 'isolate' }}
                >
                  {/* Gradient Border on Hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent-primary) 0%, transparent 50%, var(--accent-secondary) 100%)',
                    }}
                  />

                  <div className="relative z-10 bg-[var(--theme-surface)] rounded-2xl overflow-hidden h-full">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium text-white"
                          style={{
                            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                          }}
                        >
                          {post.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-[var(--theme-textSecondary)] mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {post.readTime}
                        </span>
                      </div>

                      <h2 className="text-xl font-semibold text-[var(--theme-text)] mb-3 group-hover:text-[var(--accent-primary)] transition-colors">
                        {post.title}
                      </h2>

                      <p className="text-[var(--theme-textSecondary)] mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white text-xs font-semibold">
                            {post.author.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm text-[var(--theme-textSecondary)]">{post.author}</span>
                        </div>

                        <span className="flex items-center gap-1 text-[var(--accent-primary)] text-sm font-medium group-hover:gap-2 transition-all">
                          Lesen <ArrowRight size={16} />
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.article>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <button className="px-6 py-3 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] hover:border-[var(--accent-primary)]/30 transition-colors">
              Weitere Artikel laden
            </button>
          </motion.div>
        </Container>
      </section>

      {/* Newsletter */}
      <section className="py-20">
        <Container size="wide">
          <motion.div
            className="relative p-[1px] rounded-3xl overflow-hidden max-w-3xl mx-auto"
            style={{ isolation: 'isolate' }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div
              className="bento-glow-beam-slow absolute top-[-50%] left-[-50%] w-[200%] h-[200%] z-0 opacity-100"
              style={{
                background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 320deg, var(--accent-primary) 340deg, transparent 360deg)`,
              }}
            />
            <div className="relative z-10 bg-[var(--theme-background)] rounded-3xl p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[var(--theme-text)]">
                Newsletter abonnieren
              </h2>
              <p className="text-[var(--theme-textSecondary)] mb-6">
                Erhalten Sie die neuesten Artikel und Updates direkt in Ihr Postfach.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="ihre@email.de"
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] outline-none focus:border-[var(--accent-primary)] transition-colors"
                />
                <button
                  className="px-6 py-3 rounded-xl text-white font-medium shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                  }}
                >
                  Abonnieren
                </button>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>
    </>
  )
}
