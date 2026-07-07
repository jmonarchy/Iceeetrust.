import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Shield, Target, Eye } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import pb from '@/lib/pocketbaseClient';

const TransparencyPage = () => {
  const [boardMembers, setBoardMembers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [boardRes, docsRes] = await Promise.all([
          pb.collection('board_members').getFullList({ sort: 'order', $autoCancel: false }),
          pb.collection('documents').getFullList({ sort: '-created', $autoCancel: false })
        ]);
        setBoardMembers(boardRes);
        setDocuments(docsRes);
      } catch (error) {
        console.error('Error fetching transparency data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderDocList = (categories) => {
    const filtered = documents.filter(doc => categories.includes(doc.category));
    if (filtered.length === 0) return <p className="text-sm text-muted-foreground">Documents will be uploaded soon.</p>;
    
    return (
      <ul className="space-y-3">
        {filtered.map(doc => (
          <li key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-medium text-sm">{doc.title}</span>
            </div>
            {doc.file && (
              <Button variant="ghost" size="sm" asChild>
                <a href={pb.files.getUrl(doc, doc.file)} target="_blank" rel="noopener noreferrer" download>
                  <Download className="w-4 h-4 mr-2" /> PDF
                </a>
              </Button>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      <Helmet>
        <title>Transparency & Governance - ICEEE TRUST</title>
        <meta name="description" content="ICEEE TRUST is committed to transparency, accountability, and good governance." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow">
          <section className="bg-primary text-primary-foreground py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <Shield className="w-16 h-16 mx-auto mb-6 opacity-80" />
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Transparency & Governance</h1>
              <p className="text-xl text-primary-foreground/80 leading-relaxed">
                We are committed to the highest standards of accountability, ensuring that every resource is utilized effectively to create lasting impact.
              </p>
            </div>
          </section>

          {/* Mission, Vision, Values */}
          <section className="py-16 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="bg-muted/30 border-none shadow-none">
                  <CardContent className="p-8 text-center">
                    <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                    <p className="text-muted-foreground">To empower communities through integrated programs in education, economic development, and environmental stewardship, creating lasting positive change.</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 border-none shadow-none">
                  <CardContent className="p-8 text-center">
                    <Eye className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                    <p className="text-muted-foreground">A thriving East Africa where every community has the resources, knowledge, and opportunities to build a sustainable and prosperous future.</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 border-none shadow-none">
                  <CardContent className="p-8 text-center">
                    <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-4">Our Values</h3>
                    <p className="text-muted-foreground">Community-Centered, Transparent, Sustainable, and Inclusive in all our operations and partnerships.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Board Members */}
          <section className="py-16 bg-muted/30 border-y border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Board of Directors</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">Our leadership team brings decades of experience in development, finance, and community organizing.</p>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading board members...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {boardMembers.map(member => (
                    <Card key={member.id} className="overflow-hidden border-none shadow-md">
                      <div className="aspect-square bg-muted relative">
                        {member.photo ? (
                          <img src={pb.files.getUrl(member, member.photo)} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Photo</div>
                        )}
                      </div>
                      <CardContent className="p-6 text-center">
                        <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                        <p className="text-primary text-sm font-medium mb-3">{member.title}</p>
                        {member.bio && <p className="text-sm text-muted-foreground line-clamp-3">{member.bio}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Documents & Registration */}
          <section className="py-16 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                  <h2 className="text-3xl font-bold mb-8">Public Records & Reports</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">Financial Reports & Audits</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {renderDocList(['Financial Report', 'Audited Statement'])}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">Policies & Procedures</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {renderDocList(['Policy'])}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div>
                  <Card className="bg-primary text-primary-foreground border-none">
                    <CardHeader>
                      <CardTitle>Registration Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-primary-foreground/70 text-sm">Legal Name</p>
                        <p className="font-semibold">INTEGRATED COMMUNITY TRUST (ICEEET)</p>
                      </div>
                      <div>
                        <p className="text-primary-foreground/70 text-sm">Registration Status</p>
                        <p className="font-semibold">Registered NGO in Tanzania</p>
                      </div>
                      <div>
                        <p className="text-primary-foreground/70 text-sm">Headquarters</p>
                        <p className="font-semibold">Kijitonyama Mpakani B Street Kinondoni, Dar es Salaam</p>
                      </div>
                      <div className="pt-4 mt-4 border-t border-primary-foreground/20">
                        <p className="text-sm leading-relaxed">
                          ICEEE TRUST operates in full compliance with the Non-Governmental Organizations Act of Tanzania.
                        </p>
                      </div>
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

export default TransparencyPage;