'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const features = [
    {
      id: 1,
      title: "MME Management",
      description: "Comprehensive tracking and management of Measuring and Monitoring Equipment with calibration schedules and maintenance records.",
      icon: "📊",
      link: "/mme"
    },
    {
      id: 2,
      title: "Fixed Assets",
      description: "Complete lifecycle management of fixed assets with depreciation tracking, location management, and audit trails.",
      icon: "🏢",
      link: "/fixedasset"
    },
    {
      id: 3,
      title: "Smart Reports",
      description: "Generate detailed reports for calibrations, equipment status, project allocations, and user assignments.",
      icon: "📈",
      link: "/reports"
    },
    {
      id: 4,
      title: "QR Code Integration",
      description: "Instant asset identification and information access through QR code scanning technology.",
      icon: "📱",
      link: "/asset"
    }
  ];

  const stats = [
    { number: "10K+", label: "Assets Tracked" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" },
    { number: "50+", label: "Companies" }
  ];

  return (    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative w-96 h-24">
                <Image
                  src="/images/smarttags.jpg"
                  alt="SmartTags Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Asset Management
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Made Simple
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Streamline your asset tracking with our comprehensive MME and Fixed Assets management system. 
              Get real-time insights, automated workflows, and complete control over your valuable resources.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/dashboard" 
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link 
                href="/auth/signin" 
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out border border-slate-200 dark:border-slate-700"
              >
                Sign In
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {stat.number}
                </div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Everything you need to manage your assets efficiently and effectively
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Link 
                key={feature.id}
                href={feature.link}
                className="group"
                onMouseEnter={() => setHoveredCard(feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className={`
                  relative h-full p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg 
                  transform transition-all duration-500 ease-out
                  ${hoveredCard === feature.id 
                    ? 'shadow-2xl -translate-y-4 rotate-1' 
                    : 'hover:shadow-xl hover:-translate-y-2'
                  }
                  border border-slate-200 dark:border-slate-700
                `}>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-blue-600 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="mt-6 flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                      Learn More
                      <span className="ml-2">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Asset Management?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Join thousands of companies that trust SmartTags for their asset management needs. 
            Start your free trial today and see the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register" 
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out"
            >
              <span className="relative z-10">Start Free Trial</span>
              <div className="absolute inset-0 bg-gray-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link 
              href="/dashboard" 
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white hover:text-blue-600 transform hover:-translate-y-1 transition-all duration-300 ease-out"
            >
              View Demo
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-10">
                <Image
                  src="/images/smarttags.jpg"
                  alt="SmartTags Logo"
                  fill
                  className="object-contain brightness-0 invert"
                />
              </div>
            </div>
            <p className="text-slate-400">
              © 2024 SmartTags. All rights reserved. Asset and Equipment Tagging Solutions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}