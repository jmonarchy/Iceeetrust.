import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Admin signup is disabled. Admin accounts are provisioned directly.
const SignupPage = () => {
  return (
    <>
      <Helmet>
        <title>Access Restricted - ICEEE TRUST</title>
        <meta name="description" content="Admin access is restricted." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <ShieldAlert className="w-12 h-12 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">Access Restricted</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                New admin accounts cannot be created here. Please contact the system administrator.
              </p>
              <Button asChild className="w-full">
                <Link to="/login">Go to Login</Link>
              </Button>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SignupPage;