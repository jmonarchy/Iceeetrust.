import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Download, ArrowLeft, Heart, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const DonationSuccessPage = () => {
  const [donationData, setDonationData] = useState(null);
  const [trackingId, setTrackingId] = useState(null);

  useEffect(() => {
    // Check for PesaPal tracking ID in session storage
    const storedTrackingId = sessionStorage.getItem('pesapal_order_tracking_id');
    const storedDataStr = sessionStorage.getItem('pesapal_donation_data') || sessionStorage.getItem('donation_receipt');
    
    if (storedTrackingId) {
      setTrackingId(storedTrackingId);
    }
    
    if (storedDataStr) {
      try {
        setDonationData(JSON.parse(storedDataStr));
      } catch (e) {
        console.error("Failed to parse donation data from session storage");
      }
    }
  }, []);

  const handleDownloadReceipt = () => {
    if (!donationData) return;
    
    const receiptContent = `
ICEEE TRUST - OFFICIAL DONATION RECEIPT
=========================================
Date: ${new Date(donationData.date || Date.now()).toLocaleString()}
Receipt/Tracking ID: ${trackingId || 'N/A'}
Payment Method: ${donationData.method || 'PesaPal'}

DONOR INFORMATION
-----------------
Name: ${donationData.firstName} ${donationData.lastName}
Email: ${donationData.email}

DONATION DETAILS
----------------
Amount (USD): $${donationData.usdAmount?.toFixed(2) || donationData.amount?.toFixed(2)}
Amount (TZS): ${donationData.tzsAmount ? donationData.tzsAmount.toLocaleString() + ' TZS' : 'N/A'}

Status: COMPLETED (Awaiting final confirmation from processor)

Thank you for your generous support. ICEEE TRUST is a registered NGO.
Your contribution directly impacts communities in Tanzania.
=========================================
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${trackingId || 'Donation'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Receipt downloaded successfully.');
  };

  if (!donationData && !trackingId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center py-20 px-4">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-10 pb-8">
              <Heart className="w-12 h-12 text-primary/50 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Recent Donations</h2>
              <p className="text-muted-foreground mb-6">We couldn't find details for a recent transaction in this session.</p>
              <Link to="/donate">
                <Button>Return to Donate</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Donation Successful - ICEEE TRUST</title>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow bg-muted/20 py-16 flex items-center justify-center px-4">
          <Card className="max-w-xl w-full shadow-xl border-0 bg-card overflow-hidden">
            <div className="h-2 w-full bg-primary" />
            <CardHeader className="text-center pt-10 pb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">Thank You!</CardTitle>
              <p className="text-lg text-muted-foreground mt-3">
                Your generous donation empowers communities in Tanzania.
              </p>
              {donationData?.email && (
                <div className="bg-primary/5 text-primary-foreground/80 border border-primary/20 text-sm py-2 px-4 rounded-full inline-block mt-4">
                  A confirmation email will be sent to {donationData.email} once fully processed.
                </div>
              )}
            </CardHeader>

            <CardContent className="p-8">
              <div className="bg-muted p-6 rounded-2xl border border-border/50 space-y-4">
                <h4 className="font-semibold text-foreground border-b border-border/50 pb-2 mb-4 flex items-center gap-2">
                  <Receipt className="w-4 h-4" /> Transaction Summary
                </h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Donor Name:</span>
                    <span className="font-medium">{donationData?.firstName} {donationData?.lastName}</span>
                  </div>
                  
                  {donationData?.usdAmount && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">USD Amount:</span>
                      <span className="font-bold text-lg">${donationData.usdAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {donationData?.tzsAmount && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">TZS Amount:</span>
                      <span className="font-bold text-lg text-primary">{donationData.tzsAmount.toLocaleString()} TZS</span>
                    </div>
                  )}

                  {!donationData?.usdAmount && donationData?.amount && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-bold text-lg">{donationData.currency} {donationData.amount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {trackingId && (
                    <div className="flex justify-between items-center text-sm pt-3 border-t border-border/50 mt-3">
                      <span className="text-muted-foreground">Tracking ID:</span>
                      <span className="font-mono text-xs text-muted-foreground break-all text-right max-w-[200px]">
                        {trackingId}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">PENDING VERIFICATION</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="text-muted-foreground">{new Date(donationData?.date || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-8 pt-0 flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleDownloadReceipt} 
                variant="outline" 
                className="w-full sm:w-1/2 gap-2 h-12"
              >
                <Download className="w-4 h-4" />
                Download Receipt
              </Button>
              
              <Link to="/" className="w-full sm:w-1/2">
                <Button className="w-full gap-2 h-12">
                  <ArrowLeft className="w-4 h-4" /> Return Home
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default DonationSuccessPage;