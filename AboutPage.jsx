import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ImpactStoryCard from '@/components/ImpactStoryCard';
import { useLanguage } from '@/contexts/LanguageContext';
import pb from '@/lib/pocketbaseClient';

const ImpactStoriesPage = () => {
  const { t } = useLanguage();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const records = await pb.collection('impact_stories').getFullList({
          sort: '-published_date',
          $autoCancel: false
        });
        setStories(records);
      } catch (error) {
        console.error('Error fetching impact stories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  return (
    <>
      <Helmet>
        <title>{`${t.impactStories.title} - ICEEE TRUST`}</title>
        <meta name="description" content={t.impactStories.subtitle} />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow">
          <section className="py-20 bg-gradient-to-b from-muted to-background">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ letterSpacing: '-0.02em', textWrap: 'balance' }}>
                {t.impactStories.title}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {t.impactStories.subtitle}
              </p>
            </div>
          </section>

          <section className="py-16 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{t.common.loading}</p>
                </div>
              ) : stories.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{t.impactStories.noStories}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {stories.map((story, index) => (
                    <ImpactStoryCard key={story.id} story={story} index={index} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ImpactStoriesPage;