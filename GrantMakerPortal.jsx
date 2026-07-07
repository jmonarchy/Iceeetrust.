import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import pb from '@/lib/pocketbaseClient';

const NewsEventsPage = () => {
  const [articles, setArticles] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesRes, eventsRes] = await Promise.all([
          pb.collection('news_articles').getList(1, 20, { sort: '-published_date', $autoCancel: false }),
          pb.collection('events').getList(1, 20, { sort: 'event_date', filter: `event_date >= "${new Date().toISOString().split('T')[0]}"`, $autoCancel: false })
        ]);
        setArticles(articlesRes.items);
        setEvents(eventsRes.items);
      } catch (error) {
        console.error('Error fetching news/events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderArticleCard = (article) => {
    const imageUrl = article.featured_image 
      ? pb.files.getUrl(article, article.featured_image)
      : 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c';

    return (
      <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-all flex flex-col h-full">
        <div className="h-48 overflow-hidden relative">
          <img src={imageUrl} alt={article.title} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
            {article.category}
          </div>
        </div>
        <CardContent className="p-6 flex-grow flex flex-col">
          <p className="text-sm text-muted-foreground mb-2">
            {new Date(article.published_date || article.created).toLocaleDateString()} • By {article.author || 'ICEEE TRUST'}
          </p>
          <h3 className="text-xl font-bold mb-3 line-clamp-2">{article.title}</h3>
          <p className="text-muted-foreground mb-4 line-clamp-3 flex-grow">{article.excerpt || article.content.substring(0, 150) + '...'}</p>
          <Button variant="link" className="p-0 h-auto justify-start text-primary mt-auto">
            Read More <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Helmet>
        <title>News & Events - ICEEE TRUST</title>
        <meta name="description" content="Stay updated with the latest news, stories, and upcoming events from ICEEE TRUST." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow bg-muted/20">
          <section className="bg-primary text-primary-foreground py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">News & Events</h1>
              <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
                Discover our latest updates, community stories, and join us at upcoming events.
              </p>
            </div>
          </section>

          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Tabs defaultValue="all" className="w-full">
                <div className="flex justify-center mb-12">
                  <TabsList className="grid grid-cols-3 w-full max-w-md">
                    <TabsTrigger value="all">All News</TabsTrigger>
                    <TabsTrigger value="stories">Community Stories</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="all" className="mt-0">
                  {loading ? (
                    <div className="text-center py-12">Loading news...</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {articles.map(renderArticleCard)}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="stories" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.filter(a => a.category === 'Community Story').map(renderArticleCard)}
                    {articles.filter(a => a.category === 'Community Story').length === 0 && (
                      <p className="col-span-full text-center text-muted-foreground py-12">No community stories found.</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="events" className="mt-0">
                  {loading ? (
                    <div className="text-center py-12">Loading events...</div>
                  ) : events.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-xl border">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Upcoming Events</h3>
                      <p className="text-muted-foreground">Check back later for new events and activities.</p>
                    </div>
                  ) : (
                    <div className="space-y-6 max-w-4xl mx-auto">
                      {events.map(event => (
                        <Card key={event.id} className="overflow-hidden flex flex-col md:flex-row">
                          {event.event_image && (
                            <div className="md:w-1/3 h-48 md:h-auto">
                              <img 
                                src={pb.files.getUrl(event, event.event_image)} 
                                alt={event.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <CardContent className="p-6 flex-grow flex flex-col justify-center">
                            <div className="flex items-center gap-4 text-sm text-primary font-semibold mb-3">
                              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(event.event_date).toLocaleDateString()}</span>
                              {event.event_time && <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {event.event_time}</span>}
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                            <p className="text-muted-foreground mb-4">{event.description}</p>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-auto">
                              {event.location && (
                                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="w-4 h-4" /> {event.location}
                                </span>
                              )}
                              {event.registration_link && (
                                <Button asChild>
                                  <a href={event.registration_link} target="_blank" rel="noopener noreferrer">Register Now</a>
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default NewsEventsPage;