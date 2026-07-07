import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, BookOpen, Sprout, HeartHandshake } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import apiServerClient from '@/lib/apiServerClient';

const VolunteerPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    skills: '',
    availability: '',
    interests: []
  });
  const [loading, setLoading] = useState(false);

  const programAreas = [
    'Community Education',
    'Economic Empowerment',
    'Financial Literacy',
    'Environmental Conservation',
    'Climate Change Adaptation',
    'Youth Development',
    'Women & Girls Empowerment',
    'Sustainable Agriculture'
  ];

  const handleInterestChange = (area, checked) => {
    setFormData(prev => {
      if (checked) {
        return { ...prev, interests: [...prev.interests, area] };
      } else {
        return { ...prev, interests: prev.interests.filter(i => i !== area) };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiServerClient.fetch('/volunteer-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Application submitted successfully! We will contact you soon.');
        setFormData({ name: '', email: '', phone: '', skills: '', availability: '', interests: [] });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Volunteer - ICEEE TRUST</title>
        <meta name="description" content="Join ICEEE TRUST as a volunteer and make a difference in communities across Tanzania." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow">
          <section className="bg-primary text-primary-foreground py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Volunteer With Us</h1>
              <p className="text-xl text-primary-foreground/80">
                Share your skills, time, and passion to help build resilient communities in Tanzania.
              </p>
            </div>
          </section>

          <section className="py-16 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* Info Section */}
                <div className="space-y-12">
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Why Volunteer?</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      Volunteering with ICEEE TRUST offers a unique opportunity to contribute directly to sustainable development. Whether you're a professional looking to share expertise or a student seeking internship experience, your contribution matters.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-6">Volunteer Roles</h2>
                    <div className="space-y-4">
                      <Card className="bg-muted/50 border-none">
                        <CardContent className="p-4 flex gap-4">
                          <BookOpen className="w-6 h-6 text-primary flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold">Education Mentors</h3>
                            <p className="text-sm text-muted-foreground">Support our community education and youth development programs.</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/50 border-none">
                        <CardContent className="p-4 flex gap-4">
                          <Sprout className="w-6 h-6 text-primary flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold">Field Assistants</h3>
                            <p className="text-sm text-muted-foreground">Help implement environmental and agricultural projects on the ground.</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/50 border-none">
                        <CardContent className="p-4 flex gap-4">
                          <Users className="w-6 h-6 text-primary flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold">Capacity Builders</h3>
                            <p className="text-sm text-muted-foreground">Provide training in financial literacy and business skills.</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-6">Internship Opportunities</h2>
                    <Card className="bg-secondary text-secondary-foreground border-none">
                      <CardContent className="p-6">
                        <HeartHandshake className="w-8 h-8 mb-4" />
                        <p className="text-sm leading-relaxed">
                          We offer structured internships for university students and recent graduates in project management, communications, and field research. Select "Internship" in your availability to be considered.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Application Form */}
                <div className="lg:col-span-2">
                  <Card className="shadow-lg border-0">
                    <CardHeader className="bg-muted/30 border-b pb-6">
                      <CardTitle className="text-2xl">Volunteer Application Form</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input id="phone" type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="availability">Availability *</Label>
                            <Select value={formData.availability} onValueChange={v => setFormData({...formData, availability: v})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select availability" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Full-time">Full-time</SelectItem>
                                <SelectItem value="Part-time">Part-time</SelectItem>
                                <SelectItem value="Weekends">Weekends</SelectItem>
                                <SelectItem value="Flexible">Flexible</SelectItem>
                                <SelectItem value="Internship">Seeking Internship</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="skills">Skills & Experience Registration *</Label>
                          <Textarea 
                            id="skills" 
                            rows={4} 
                            required 
                            placeholder="Please describe your professional skills, previous volunteer experience, and what you hope to contribute."
                            value={formData.skills} 
                            onChange={e => setFormData({...formData, skills: e.target.value})} 
                          />
                        </div>

                        <div className="space-y-4">
                          <Label className="text-base">Areas of Interest (Select all that apply)</Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-6 rounded-xl border">
                            {programAreas.map(area => (
                              <div key={area} className="flex items-center space-x-3">
                                <Checkbox 
                                  id={`interest-${area}`} 
                                  checked={formData.interests.includes(area)}
                                  onCheckedChange={(checked) => handleInterestChange(area, checked)}
                                />
                                <Label htmlFor={`interest-${area}`} className="font-normal cursor-pointer">{area}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button type="submit" size="lg" className="w-full h-14 text-lg" disabled={loading}>
                          {loading ? 'Submitting Application...' : 'Submit Application'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default VolunteerPage;