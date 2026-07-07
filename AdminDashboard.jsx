import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Heart, Users, HeartHandshake as Handshake, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProgramCard from '@/components/ProgramCard';
import TestimonialCard from '@/components/TestimonialCard';
import AnimatedCounter from '@/components/AnimatedCounter';
import apiServerClient from '@/lib/apiServerClient';

const HomePage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const response = await apiServerClient.fetch('/newsletter-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Successfully subscribed!');
        setEmail('');
      } else {
        toast.info(data.message);
      }
    } catch (error) {
      toast.error('Failed to subscribe.');
    } finally {
      setLoading(false);
    }
  };

  const programs = [
    {
      title: 'Community Education',
      description: 'Providing accessible education programs that empower community members with knowledge and skills.',
      image: 'https://images.unsplash.com/photo-1653737430029-30b1cfcf0d72',
      metrics: '2,847 students enrolled'
    },
    {
      title: 'Economic Empowerment',
      description: 'Supporting income-generating activities and entrepreneurship training to build financial independence.',
      image: 'https://images.unsplash.com/photo-1559185590-3927b8fa38de',
      metrics: '1,234 businesses supported'
    },
    {
      title: 'Financial Literacy',
      description: 'Teaching essential money management skills, savings strategies, and financial planning.',
      image: 'https://images.unsplash.com/photo-1559526324-593bc073d938',
      metrics: '3,456 participants trained'
    },
    {
      title: 'Environmental Conservation',
      description: 'Protecting natural resources through community-led conservation efforts and sustainable land management.',
      image: 'https://images.unsplash.com/photo-1698691962607-934adb8e7de1',
      metrics: '15,000 trees planted'
    },
    {
      title: 'Climate Change Adaptation',
      description: 'Building resilience against climate impacts through adaptive agriculture and water conservation.',
      image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce',
      metrics: '47 communities trained'
    },
    {
      title: 'Youth Development',
      description: 'Investing in young people through mentorship, skills training, and leadership development programs.',
      image: 'https://images.unsplash.com/photo-1517486638152-b7660c99e85c',
      metrics: '892 youth mentored'
    },
    {
      title: 'Women & Girls Empowerment',
      description: 'Advancing gender equality through education, economic opportunities, and advocacy.',
      image: 'https://images.unsplash.com/photo-1559185590-3927b8fa38de',
      metrics: '1,567 women empowered'
    },
    {
      title: 'Sustainable Agriculture',
      description: 'Promoting farming practices that increase yields while protecting the environment.',
      image: 'https://images.unsplash.com/photo-1681834913206-cea9d3ec04d6',
      metrics: '2,134 farmers trained'
    }
  ];

  const testimonials = [
    {
      quote: 'The financial literacy program changed my life. I now run a successful small business and support my family with confidence.',
      author: 'Amina Hassan',
      role: 'Small Business Owner',
      community: 'Dar es Salaam, Tanzania'
    },
    {
      quote: 'Through the youth development program, I discovered my leadership potential and now mentor other young people in my community.',
      author: 'David Ochieng',
      role: 'Youth Leader',
      community: 'Arusha, Tanzania'
    },
    {
      quote: 'The sustainable agriculture training helped our community increase crop yields while protecting our environment for future generations.',
      author: 'Grace Wanjiru',
      role: 'Farmer',
      community: 'Moshi, Tanzania'
    }
  ];

  return (
    <>
      <Helmet>
        <title>ICEEE TRUST - Empowering Communities</title>
        <meta name="description" content="Building resilient communities through financial literacy, environmental conservation, youth empowerment, women's empowerment, and sustainable development initiatives." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow">
          {/* Hero Section */}
          <section className="relative min-h-[90dvh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <img 
                src="https://images.unsplash.com/photo-1619472222144-4b9ea5d222c6"
                alt="Community gathering"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-3xl"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6" style={{ letterSpacing: '-0.02em', textWrap: 'balance' }}>
                  Empowering Communities Through Education, Economic Development, and Sustainable Solutions
                </h1>
                <p className="text-lg md:text-xl leading-relaxed mb-10 text-white/90 max-w-2xl">
                  Building resilient communities through financial literacy, environmental conservation, youth empowerment, women's empowerment, and sustainable development initiatives.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/donate">
                    <Button size="lg" className="gap-2 w-full sm:w-auto h-14 px-8 text-lg shadow-lg">
                      <Heart className="w-5 h-5" />
                      Donate Now
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto h-14 px-8 text-lg bg-white/10 backdrop-blur text-white border-white/30 hover:bg-white/20">
                      <Handshake className="w-5 h-5" />
                      Partner With Us
                    </Button>
                  </Link>
                  <Link to="/grant-maker-portal">
                    <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto h-14 px-8 text-lg bg-white/10 backdrop-blur text-white border-white/30 hover:bg-white/20">
                      Apply for Partnership
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Impact Stats */}
          <section className="py-16 bg-primary text-primary-foreground">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-primary-foreground/20">
                <div className="text-center px-4">
                  <div className="text-4xl md:text-5xl font-bold mb-2 tabular-nums">
                    <AnimatedCounter value={50000} suffix="+" />
                  </div>
                  <p className="text-primary-foreground/80 font-medium">Beneficiaries Reached</p>
                </div>
                <div className="text-center px-4">
                  <div className="text-4xl md:text-5xl font-bold mb-2 tabular-nums">
                    <AnimatedCounter value={150} suffix="+" />
                  </div>
                  <p className="text-primary-foreground/80 font-medium">Projects Completed</p>
                </div>
                <div className="text-center px-4">
                  <div className="text-4xl md:text-5xl font-bold mb-2 tabular-nums">
                    <AnimatedCounter value={15} suffix="+" />
                  </div>
                  <p className="text-primary-foreground/80 font-medium">Regions Served</p>
                </div>
                <div className="text-center px-4">
                  <div className="text-4xl md:text-5xl font-bold mb-2 tabular-nums">
                    <AnimatedCounter value={200} suffix="+" />
                  </div>
                  <p className="text-primary-foreground/80 font-medium">Environmental Initiatives</p>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Programs */}
          <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ textWrap: 'balance' }}>
                  Our Programs
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Comprehensive initiatives addressing community needs and fostering sustainable growth.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {programs.map((program, index) => (
                  <ProgramCard key={index} {...program} index={index} />
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-24 bg-muted">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ textWrap: 'balance' }}>
                  Stories of Impact
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Hear directly from the individuals and communities we serve.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <TestimonialCard key={index} {...testimonial} />
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-secondary"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay"></div>
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-secondary-foreground">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight" style={{ textWrap: 'balance' }}>
                Join us in transforming lives and creating sustainable opportunities for communities across Tanzania.
              </h2>
              <p className="text-xl mb-10 text-secondary-foreground/90">
                Your donation and partnership can make a lasting impact.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/donate">
                  <Button size="lg" variant="default" className="gap-2 h-14 px-8 text-lg bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
                    <Heart className="w-5 h-5" />
                    Donate Now
                  </Button>
                </Link>
                <Link to="/volunteer">
                  <Button size="lg" variant="outline" className="gap-2 h-14 px-8 text-lg bg-transparent border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10 w-full sm:w-auto">
                    <Users className="w-5 h-5" />
                    Become a Volunteer
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Newsletter Section */}
          <section className="py-20 bg-background border-t border-border">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Subscribe to our newsletter to receive the latest news, impact stories, and opportunities to get involved.
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input 
                  type="email" 
                  placeholder="Enter your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base"
                />
                <Button type="submit" className="h-12 px-8" disabled={loading}>
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </form>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default HomePage;