import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import pb from '@/lib/pocketbaseClient';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    email: '',
    phone: '',
    country: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await pb.collection('contact_submissions').create({
        name: formData.name,
        email: formData.email,
        subject: `Contact from ${formData.name} (${formData.organization || 'Individual'})`,
        message: `Phone: ${formData.phone}\nCountry: ${formData.country}\n\nMessage:\n${formData.message}`
      }, { $autoCancel: false });
      
      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', organization: '', email: '', phone: '', country: '', message: '' });
    } catch (error) {
      console.error('Contact error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - ICEEE TRUST</title>
        <meta name="description" content="Get in touch with ICEEE TRUST. We'd love to hear from you." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow">
          <section className="bg-primary text-primary-foreground py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
              <p className="text-xl text-primary-foreground/80">
                Have questions about our programs, partnerships, or how to get involved? We're here to help.
              </p>
            </div>
          </section>

          <section className="py-16 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* Contact Info */}
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Office Address</h3>
                          <p className="text-muted-foreground mt-1">
                            Kijitonyama Mpakani B Street Kinondoni,<br />
                            Dar es Salaam, Tanzania
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Phone className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Phone</h3>
                          <p className="text-muted-foreground mt-1">
                            <a href="tel:+255717798351" className="hover:text-primary transition-colors">+255 717 798 351</a>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Mail className="w-6 h-6 text-primary" />
                        </div>
                        <div className="space-y-3 w-full">
                          <h3 className="font-semibold text-lg">Email Addresses</h3>
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm font-medium">General Inquiries</p>
                            <a href="mailto:info@iceeetrust.org" className="text-primary hover:underline text-sm">info@iceeetrust.org</a>
                          </div>
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm font-medium">Executive Director</p>
                            <a href="mailto:jchaula@iceeetrust.org" className="text-primary hover:underline text-sm">jchaula@iceeetrust.org</a>
                          </div>
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm font-medium">Programs & Partnerships</p>
                            <a href="mailto:suziedon@iceeetrust.org" className="text-primary hover:underline text-sm">suziedon@iceeetrust.org</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                  <Card className="shadow-lg border-0 bg-card">
                    <CardContent className="p-8">
                      <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input id="name" required value={formData.name} onChange={handleChange} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="organization">Organization</Label>
                            <Input id="organization" value={formData.organization} onChange={handleChange} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input id="email" type="email" required value={formData.email} onChange={handleChange} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input id="phone" type="tel" required value={formData.phone} onChange={handleChange} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="country">Country</Label>
                            <Input id="country" value={formData.country} onChange={handleChange} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="message">Message *</Label>
                            <Textarea id="message" rows={5} required value={formData.message} onChange={handleChange} />
                          </div>
                        </div>
                        <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
                          {loading ? 'Sending...' : 'Send Message'}
                          {!loading && <Send className="w-4 h-4" />}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* Map Section */}
          <section className="h-[400px] w-full bg-muted relative">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.084563582174!2d39.2455!3d-6.7595!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x185c4c4c4c4c4c4c%3A0x4c4c4c4c4c4c4c4c!2sKijitonyama%2C%20Dar%20es%20Salaam%2C%20Tanzania!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              title="ICEEE TRUST Office Location"
              className="absolute inset-0"
            ></iframe>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ContactPage;