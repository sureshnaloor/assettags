'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrText, setQrText] = useState('SMART-ASSET-DEMO');
  const [assetCounter, setAssetCounter] = useState(0);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
  }>>([]);
  const animationFrameRef = useRef<number>();

  // Asset counter animation
  useEffect(() => {
    const targetCount = 10000;
    const duration = 2000;
    const steps = 60;
    const increment = targetCount / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newCount = Math.min(Math.floor(increment * currentStep), targetCount);
      setAssetCounter(newCount);
      
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  // Network canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();

    // Initialize particles
    particlesRef.current = [];
    for (let i = 0; i < 50; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 3 + 1
      });
    }

    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(45, 212, 191, 0.6)';
        ctx.fill();

        // Draw connections
        particlesRef.current.forEach((otherParticle, j) => {
          if (i !== j) {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.strokeStyle = `rgba(45, 212, 191, ${0.3 * (1 - distance / 100)})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        });
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const categories = [
    {
      title: 'IT Assets',
      count: '2,500+ Assets',
      image: '/images/office-interior.jpg',
      alt: 'IT Assets',
      subtypes: ['Laptops', 'Desktops', 'Printers', 'Network Devices', 'Mobile Devices', 'Servers']
    },
    {
      title: 'Vehicles',
      count: '800+ Assets',
      image: '/images/construction-equipment.jpg',
      alt: 'Vehicles',
      subtypes: ['Cars', 'Trucks', 'Vans', 'Motorcycles', 'Specialized Vehicles']
    },
    {
      title: 'Land & Building',
      count: '150+ Properties',
      image: '/images/hero-building.jpg',
      alt: 'Land & Building',
      subtypes: ['Office Buildings', 'Warehouses', 'Residential Properties', 'Parking Lots']
    },
    {
      title: 'Measuring Instruments',
      count: '1,200+ Instruments',
      image: '/images/medical-equipment.jpg',
      alt: 'Measuring Instruments',
      subtypes: ['Calipers', 'Scales', 'Thermometers', 'Pressure Gauges', 'Flow Meters']
    },
    {
      title: 'Camp Equipment',
      count: '950+ Appliances',
      image: '/images/restaurant-kitchen.jpg',
      alt: 'Camp Equipment',
      subtypes: ['Tents', 'Camp Stoves', 'Refrigerators', 'Air Conditioners', 'Mixers', 'Cooktops']
    }
  ];

  const features = [
    {
      icon: '📍',
      title: 'Real-time Location Tracking',
      description: 'Track asset locations with GPS precision, indoor positioning, and geofencing capabilities. Know exactly where every asset is at all times.'
    },
    {
      icon: '🔧',
      title: 'Maintenance Scheduling',
      description: 'Automated maintenance scheduling with calendar integration, work order management, and vendor coordination. Never miss critical maintenance again.'
    },
    {
      icon: '👥',
      title: 'Custodian Management',
      description: 'Assign and track asset custodians with role-based permissions, transfer workflows, and responsibility chains. Clear accountability for every asset.'
    },
    {
      icon: '📊',
      title: 'Analytics & Reporting',
      description: 'Comprehensive analytics with customizable dashboards, utilization reports, cost analysis, and compliance tracking. Data-driven asset optimization.'
    },
    {
      icon: '🔒',
      title: 'Security & Compliance',
      description: 'Enterprise-grade security with audit trails, compliance monitoring, and regulatory reporting. Meet all industry standards with confidence.'
    },
    {
      icon: '📱',
      title: 'Mobile Integration',
      description: 'Full mobile support with QR scanning, offline capabilities, and field data collection. Manage assets anywhere, anytime.'
    }
  ];

  const testimonials = [
    {
      text: "SmartAsset has revolutionized our asset management. We've reduced asset search time by 80% and improved maintenance compliance to 99.9%. The QR code system is brilliant.",
      author: 'Sarah Johnson',
      role: 'Facilities Director, TechCorp Industries'
    },
    {
      text: "Managing 5,000+ IT assets across 12 locations was a nightmare. SmartAsset made it effortless. The real-time tracking and automated maintenance alerts are game-changers.",
      author: 'Mike Chen',
      role: 'IT Director, Global Enterprises'
    },
    {
      text: "The ROI was immediate. We saved $2M in the first year through better asset utilization and preventive maintenance. SmartAsset pays for itself many times over.",
      author: 'Lisa Rodriguez',
      role: 'Operations Manager, Manufacturing Plus'
    }
  ];

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Smooth scrolling for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const href = target.getAttribute('href');
        if (href) {
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-[rgba(26,35,50,0.95)] backdrop-blur-lg z-50 py-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="#" className="text-2xl font-bold text-white">
            SmartAsset
          </Link>
          <ul className="hidden md:flex gap-8 list-none">
            <li><a href="#home" className="text-slate-300 hover:text-teal-400 transition-colors font-medium">Home</a></li>
            <li><a href="#features" className="text-slate-300 hover:text-teal-400 transition-colors font-medium">Features</a></li>
            <li><a href="#demo" className="text-slate-300 hover:text-teal-400 transition-colors font-medium">Demo</a></li>
            <li><a href="#about" className="text-slate-300 hover:text-teal-400 transition-colors font-medium">About</a></li>
            <li><Link href="/dashboard" className="text-slate-300 hover:text-teal-400 transition-colors font-medium">Dashboard</Link></li>
          </ul>
          <button className="md:hidden text-white text-2xl">☰</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#2d3748] to-[#1a2332]">
        <div 
          className="absolute inset-0 opacity-30 z-10"
          style={{
            backgroundImage: "url('/images/hero-building.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 z-20"
        />
        
        <div className="relative z-30 pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6 bg-gradient-to-r from-white to-teal-400 bg-clip-text text-transparent">
              SmartAsset Management
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl">
              Transform your asset management with QR-powered intelligence. Track, manage, and optimize over 10,000 assets across your enterprise with unprecedented efficiency and visibility.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center hover:bg-white/15 hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl font-bold text-teal-400 mb-2">{assetCounter.toLocaleString()}</div>
                <div className="text-slate-300 text-sm uppercase tracking-wider">Assets Managed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center hover:bg-white/15 hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl font-bold text-teal-400 mb-2">99.9%</div>
                <div className="text-slate-300 text-sm uppercase tracking-wider">Tracking Accuracy</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center hover:bg-white/15 hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl font-bold text-teal-400 mb-2">75%</div>
                <div className="text-slate-300 text-sm uppercase tracking-wider">Time Saved</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center hover:bg-white/15 hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl font-bold text-teal-400 mb-2">24/7</div>
                <div className="text-slate-300 text-sm uppercase tracking-wider">Real-time Monitoring</div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center mt-12">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center justify-center px-8 py-3 rounded-xl font-semibold text-white bg-teal-400 hover:bg-teal-500 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
              >
                Explore Dashboard
              </Link>
              <a 
                href="#demo" 
                className="inline-flex items-center justify-center px-8 py-3 rounded-xl font-semibold text-teal-400 border-2 border-teal-400 hover:bg-teal-400 hover:text-white hover:-translate-y-0.5 transition-all duration-300"
              >
                Try QR Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Asset Categories Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a2332] text-center mb-4">
            Comprehensive Asset Categories
          </h2>
          <p className="text-lg text-slate-600 text-center max-w-2xl mx-auto mb-12">
            Manage every type of asset across your organization with specialized tracking and management features tailored to each category's unique requirements.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <div 
                key={index}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-400 cursor-pointer group"
              >
                <div className="relative w-full h-48 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.alt}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-400"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-semibold text-[#1a2332] mb-2">{category.title}</h3>
                  <p className="text-teal-400 font-medium text-sm mb-4">{category.count}</p>
                  <div className="flex flex-wrap gap-2">
                    {category.subtypes.map((subtype, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1 rounded-full text-xs bg-slate-100 text-slate-600 group-hover:bg-teal-400 group-hover:text-white transition-colors duration-200"
                      >
                        {subtype}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QR Code Demo Section */}
      <section id="demo" className="py-24 bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-[#1a2332] mb-6">
                Instant Asset Access with QR Codes
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Every asset gets a unique QR code that provides instant access to its complete information profile. Simply scan with any smartphone to view location, custodian, maintenance history, and more.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Our advanced QR system supports batch generation, custom branding, and integrates seamlessly with your existing workflows.
              </p>
              <Link 
                href="/dashboard" 
                className="inline-flex items-center justify-center px-8 py-3 rounded-xl font-semibold text-white bg-teal-400 hover:bg-teal-500 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
              >
                Try QR Generator
              </Link>
            </div>
            
            <div className="bg-white rounded-3xl p-12 shadow-xl text-center">
              <h3 className="text-2xl font-semibold text-[#1a2332] mb-8">Live QR Code Demo</h3>
              <div className="flex justify-center mb-6">
                <div className="w-48 h-48 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center">
                  <QRCodeSVG value={qrText} size={160} />
                </div>
              </div>
              <p className="text-slate-600 text-sm mb-6">QR Code for: {qrText}</p>
              
              <div className="flex gap-4">
                <input
                  type="text"
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  placeholder="Enter asset ID or text..."
                  className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 transition-colors"
                />
                <button
                  onClick={() => setQrText(qrText || 'SMART-ASSET-DEMO')}
                  className="px-8 py-3 rounded-xl font-semibold text-white bg-teal-400 hover:bg-teal-500 transition-colors"
                >
                  Generate QR
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a2332] text-center mb-4">
            Powerful Asset Management Features
          </h2>
          <p className="text-lg text-slate-600 text-center max-w-2xl mx-auto mb-12">
            Comprehensive tools designed for enterprise-scale asset management with intuitive workflows and advanced automation capabilities.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-50 rounded-3xl p-10 text-center border-2 border-transparent hover:bg-white hover:border-teal-400 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#1a2332] mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="about" className="py-24 bg-gradient-to-br from-[#1a2332] to-[#2d3748] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
            Trusted by Industry Leaders
          </h2>
          
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-12 text-center min-h-[300px] flex flex-col justify-center">
              <p className="text-lg md:text-xl leading-relaxed mb-8 italic">
                "{testimonials[currentTestimonial].text}"
              </p>
              <div className="text-teal-400 font-semibold text-lg">
                {testimonials[currentTestimonial].author}
              </div>
              <div className="text-slate-300 text-sm mt-2">
                {testimonials[currentTestimonial].role}
              </div>
            </div>
            
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial ? 'bg-teal-400 w-8' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-teal-400 to-teal-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to Transform Your Asset Management?
          </h2>
          <p className="text-xl mb-12 opacity-90 max-w-2xl mx-auto">
            Join thousands of organizations already using SmartAsset to optimize their asset operations
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl font-semibold text-teal-400 bg-white hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
            >
              Start Free Trial
            </Link>
            <a 
              href="#demo" 
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl font-semibold text-white border-2 border-white hover:bg-white hover:text-teal-400 hover:-translate-y-0.5 transition-all duration-300"
            >
              Schedule Demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a2332] text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <a href="#features" className="text-teal-400 hover:text-teal-300 transition-colors">Features</a>
            <a href="#demo" className="text-teal-400 hover:text-teal-300 transition-colors">Demo</a>
            <Link href="/dashboard" className="text-teal-400 hover:text-teal-300 transition-colors">Dashboard</Link>
            <a href="#about" className="text-teal-400 hover:text-teal-300 transition-colors">About</a>
          </div>
          <p className="mb-2">&copy; 2024 SmartAsset Management Platform. All rights reserved.</p>
          <p>Enterprise asset management solutions for the modern organization.</p>
        </div>
      </footer>
    </div>
  );
}

