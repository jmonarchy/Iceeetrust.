import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Eye, Target, Users, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import FileGallery from '@/components/FileGallery';

const AboutPage = () => {
  const { t } = useLanguage();

  const values = [
    {
      icon: Users,
      title: t.about.communityCentered,
      description: t.about.communityCenteredDesc
    },
    {
      icon: Eye,
      title: t.about.transparent,
      description: t.about.transparentDesc
    },
    {
      icon: Target,
      title: t.about.sustainable,
      description: t.about.sustainableDesc
    },
    {
      icon: Heart,
      title: t.about.inclusive,
      description: t.about.inclusiveDesc
    }
  ];

  const teamMembers = [
    {
      name: 'Juhudi Steve Mdonya',
      role: 'Secretary',
      imageFilename: null
    },
    {
      name: 'Susanne Donalt Ndibalema',
      role: 'Treasurer',
      imageFilename: null
    },
    {
      name: 'Josephat Chaula',
      role: 'Chairman',
      imageFilename: 'Josephat Chaula.jpeg'
    }
  ];

  return (
    <>
      <Helmet>
        <title>{`${t.about.title} - ICEEE TRUST`}</title>
        <meta name="description" content={t.about.subtitle} />
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
                <h1
                  className="text-4xl md:text-5xl font-bold mb-6"
                  style={{ letterSpacing: '-0.02em', textWrap: 'balance' }}
                >
                  {t.about.title}
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {t.about.subtitle}
                </p>
              </motion.div>
            </div>
          </section>

          <section className="py-16 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-3xl font-bold mb-4">
                    {t.about.historyTitle}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t.about.historyText}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c"
                    alt="Community gathering"
                    className="rounded-2xl shadow-lg w-full h-auto"
                  />
                </motion.div>
              </div>
            </div>
          </section>

          <section className="py-16 bg-muted">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="order-2 md:order-1"
                >
                  <img
                    src="https://images.unsplash.com/photo-1559027615-cd4628902d4a"
                    alt="Vision for the future"
                    className="rounded-2xl shadow-lg w-full h-auto"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="order-1 md:order-2"
                >
                  <h2 className="text-3xl font-bold mb-4">
                    {t.about.visionTitle}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {t.about.visionText}
                  </p>
                  <h3 className="text-2xl font-semibold mb-3">
                    {t.about.missionTitle}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t.about.missionText}
                  </p>
                </motion.div>
              </div>
            </div>
          </section>

          <section className="py-20 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2
                  className="text-3xl md:text-4xl font-bold mb-4"
                  style={{ textWrap: 'balance' }}
                >
                  {t.about.valuesTitle}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {values.map((value, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1
                    }}
                  >
                    <Card className="h-full text-center">
                      <CardContent className="p-6">
                        <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <value.icon className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-3">
                          {value.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {value.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-20 bg-muted">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2
                  className="text-3xl md:text-4xl font-bold mb-4"
                  style={{ textWrap: 'balance' }}
                >
                  {t.about.teamTitle}
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  {t.about.teamSubtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1
                    }}
                  >
                    <Card className="overflow-hidden">
                      <div className="aspect-square overflow-hidden bg-muted flex items-center justify-center">
                        {member.imageFilename ? (
                          <FileGallery
                            filename={member.imageFilename}
                            alt={member.name}
                            className="w-full h-full object-cover"
                            fallback={
                              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                <Users className="w-16 h-16 text-primary/40" />
                              </div>
                            }
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <Users className="w-16 h-16 text-primary/40" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 text-center">
                        <h3 className="font-semibold mb-1">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {member.role}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-20 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Award className="w-8 h-8 text-primary" />
                  <h2
                    className="text-3xl md:text-4xl font-bold"
                    style={{ textWrap: 'balance' }}
                  >
                    Certifications & Registration
                  </h2>
                </div>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  ICEEET is officially registered and certified by the relevant authorities in Tanzania
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Card className="overflow-hidden h-full">
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary" />
                        TRA Certificate
                      </h3>
                    </div>
                    <CardContent className="p-6">
                      <div className="rounded-lg overflow-hidden shadow-md border border-border mx-auto" style={{ width: '50%' }}>
                        <FileGallery
                          filename="TRA_Certificate.png"
                          alt="Tanzania Revenue Authority TRA Certificate of Registration"
                          className="w-full h-auto"
                          fallback={
                            <div className="w-full py-16 bg-muted flex flex-col items-center justify-center text-muted-foreground">
                              <Award className="w-12 h-12 mb-2 opacity-50" />
                              <span>Certificate preview unavailable</span>
                            </div>
                          }
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-4">
                        Tanzania Revenue Authority Certificate of Registration
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <Card className="overflow-hidden h-full">
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary" />
                        NGO Certificate
                      </h3>
                    </div>
                    <CardContent className="p-6">
                      <div className="rounded-lg overflow-hidden shadow-md border border-border mx-auto" style={{ width: '50%' }}>
                        <FileGallery
                          filename="NGO_Certificate.png"
                          alt="NGO Certificate of Registration"
                          className="w-full h-auto"
                          fallback={
                            <div className="w-full py-16 bg-muted flex flex-col items-center justify-center text-muted-foreground">
                              <Award className="w-12 h-12 mb-2 opacity-50" />
                              <span>Certificate preview unavailable</span>
                            </div>
                          }
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-4">
                        NGO Certificate of Registration for INTEGRATED COMMUNITY EDUCATION AND ECONOMIC EMPOWERMENT TRUST
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AboutPage;