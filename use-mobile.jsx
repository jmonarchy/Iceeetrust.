import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, DollarSign, MapPin, Leaf, Heart, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnimatedCounter from '@/components/AnimatedCounter';
import { useLanguage } from '@/contexts/LanguageContext';

const ImpactDashboardPage = () => {
  const { t } = useLanguage();

  const metrics = [
    {
      icon: Users,
      value: 50000,
      suffix: '+',
      label: t.dashboard.beneficiaries,
      color: 'text-blue-600'
    },
    {
      icon: Briefcase,
      value: 150,
      suffix: '+',
      label: t.dashboard.projects,
      color: 'text-green-600'
    },
    {
      icon: DollarSign,
      value: 2500000,
      prefix: '$',
      suffix: '+',
      label: t.dashboard.fundsRaised,
      color: 'text-orange-600'
    },
    {
      icon: MapPin,
      value: 15,
      suffix: '+',
      label: t.dashboard.regions,
      color: 'text-purple-600'
    },
    {
      icon: Leaf,
      value: 200,
      suffix: '+',
      label: t.dashboard.environmental,
      color: 'text-emerald-600'
    }
  ];

  return (
    <>
      <Helmet>
        <title>{`${t.dashboard.title} - ICEEE TRUST`}</title>
        <meta name="description" content={t.dashboard.subtitle} />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow">
          <section className="py-20 bg-gradient-to-b from-muted to-background">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ letterSpacing: '-0.02em', textWrap: 'balance' }}>
                  {t.dashboard.title}
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {t.dashboard.subtitle}
                </p>
              </motion.div>
            </div>
          </section>

          <section className="py-16 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {metrics.map((metric, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-8">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-14 h-14 rounded-xl bg-muted flex items-center justify-center ${metric.color}`}>
                            <metric.icon className="w-7 h-7" />
                          </div>
                        </div>
                        <div className="text-4xl font-bold mb-2 tabular-nums">
                          <AnimatedCounter 
                            value={metric.value} 
                            prefix={metric.prefix || ''} 
                            suffix={metric.suffix || ''} 
                          />
                        </div>
                        <p className="text-muted-foreground font-medium">{metric.label}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-20 bg-muted">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ textWrap: 'balance' }}>
                  {t.dashboard.ctaTitle}
                </h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  {t.dashboard.ctaText}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/donate">
                    <Button size="lg" className="gap-2 w-full sm:w-auto">
                      <Heart className="w-5 h-5" />
                      {t.dashboard.ctaDonate}
                    </Button>
                  </Link>
                  <Link to="/volunteer">
                    <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                      <UserPlus className="w-5 h-5" />
                      {t.dashboard.ctaVolunteer}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ImpactDashboardPage;