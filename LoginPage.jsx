import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProgramCard from '@/components/ProgramCard';
import { useLanguage } from '@/contexts/LanguageContext';

const ProgramsPage = () => {
  const { t } = useLanguage();

  const programs = [
    {
      title: t.programs.communityEducation.title,
      description: t.programs.communityEducation.description,
      image: 'https://images.unsplash.com/photo-1653737430029-30b1cfcf0d72',
      metrics: '2,847 students enrolled across 12 communities'
    },
    {
      title: t.programs.economicEmpowerment.title,
      description: t.programs.economicEmpowerment.description,
      image: 'https://images.unsplash.com/photo-1559185590-3927b8fa38de',
      metrics: '1,234 businesses supported with training and microloans'
    },
    {
      title: t.programs.financialLiteracy.title,
      description: t.programs.financialLiteracy.description,
      image: 'https://images.unsplash.com/photo-1559526324-593bc073d938',
      metrics: '3,456 participants trained in money management'
    },
    {
      title: t.programs.environmentalConservation.title,
      description: t.programs.environmentalConservation.description,
      image: 'https://images.unsplash.com/photo-1698691962607-934adb8e7de1',
      metrics: '15,000 trees planted, 8 watersheds protected'
    },
    {
      title: t.programs.climateChangeAdaptation.title,
      description: t.programs.climateChangeAdaptation.description,
      image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce',
      metrics: '47 communities trained in climate-resilient practices'
    },
    {
      title: t.programs.youthDevelopment.title,
      description: t.programs.youthDevelopment.description,
      image: 'https://images.unsplash.com/photo-1517486638152-b7660c99e85c',
      metrics: '892 youth mentored through leadership programs'
    },
    {
      title: t.programs.womenEmpowerment.title,
      description: t.programs.womenEmpowerment.description,
      image: 'https://images.unsplash.com/photo-1559185590-3927b8fa38de',
      metrics: '1,567 women empowered through education and economic support'
    },
    {
      title: t.programs.sustainableAgriculture.title,
      description: t.programs.sustainableAgriculture.description,
      image: 'https://images.unsplash.com/photo-1681834913206-cea9d3ec04d6',
      metrics: '2,134 farmers trained in sustainable farming methods'
    }
  ];

  return (
    <>
      <Helmet>
        <title>{`${t.programs.title} - ICEEE TRUST`}</title>
        <meta name="description" content={t.programs.subtitle} />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow">
          <section className="py-20 bg-gradient-to-b from-muted to-background">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ letterSpacing: '-0.02em', textWrap: 'balance' }}>
                {t.programs.title}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {t.programs.subtitle}
              </p>
            </div>
          </section>

          <section className="py-16 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {programs.map((program, index) => (
                  <ProgramCard key={index} {...program} index={index} />
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProgramsPage;