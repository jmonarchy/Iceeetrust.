import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const DonationCancelPage = () => {
  return (
    <>
      <Helmet>
        <title>Payment Cancelled - ICEEE TRUST</title>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow bg-muted/20 py-20 px-4 flex items-center justify-center">
          <Card className="max-w-md w-full shadow-lg border-0 text-center">
            <CardHeader className="pt-10">
              <XCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="text-3xl">Payment Cancelled</CardTitle>
            </CardHeader>
            <CardContent className="pb-10">
              <p className="text-muted-foreground mb-8 text-lg">
                Your donation process was cancelled and no charges were made. If you experienced technical difficulties, please try again.
              </p>
              <div className="space-y-4">
                <Link to="/donate" className="block w-full">
                  <Button size="lg" className="w-full gap-2 text-lg h-14">
                    Try Again <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/" className="block w-full">
                  <Button variant="outline" size="lg" className="w-full h-14">
                    Return to Homepage
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default DonationCancelPage;