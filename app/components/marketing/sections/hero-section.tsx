'use client';

import Link from 'next/link';
import { Play, BarChart3, Zap, Shield, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FadeUp } from '../fade-up';
import { heroStats } from '../marketing-data';

const statIcons = [BarChart3, Zap, Shield, Building2];

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-hero-gradient grid-pattern">
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] max-w-4xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <FadeUp>
          <span className="mb-6 inline-block rounded-full border border-accent-teal px-4 py-1.5 text-caption uppercase tracking-[0.05em] text-accent-teal">
            Asset Intelligence Platform
          </span>
        </FadeUp>
        <FadeUp delay={0.1}>
          <h1 className="text-hero mb-6">
            Every Asset. One Scan. Total Control.
          </h1>
        </FadeUp>
        <FadeUp delay={0.2}>
          <p className="mx-auto mb-10 max-w-[640px] text-body-ds">
            Streamline your asset tracking with our comprehensive MME and Fixed Assets
            management system. Get real-time insights, automated workflows, and complete
            control over your valuable resources.
          </p>
        </FadeUp>
        <FadeUp delay={0.3}>
          <div className="mb-12 flex flex-wrap justify-center gap-4">
            <Button variant="cta" size="lg" asChild>
              <Link href="/auth/register">Get Started Free</Link>
            </Button>
            <Button variant="cta-secondary" size="lg" asChild>
              <Link href="/contact" className="flex items-center gap-2">
                <Play className="size-4" />
                Watch Demo
              </Link>
            </Button>
          </div>
        </FadeUp>
        <FadeUp delay={0.4}>
          <div className="grid w-full max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
            {heroStats.map((stat, i) => {
              const Icon = statIcons[i];
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i }}
                  className="glass-card p-4 text-center"
                >
                  <Icon className="mx-auto mb-2 size-6 text-accent-teal" />
                  <div className="text-2xl font-extrabold text-text-primary md:text-3xl">
                    {stat.display}
                  </div>
                  <div className="text-caption uppercase tracking-wider text-text-muted">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
