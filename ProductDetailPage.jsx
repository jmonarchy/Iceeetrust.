import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { CreditCard, Building, Smartphone, Heart } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import apiServerClient from '@/lib/apiServerClient';

// PesaPal does not support limit increases for NGOs — hard cap is $8 USD.
// Donors needing to give more should use Bank Transfer.
const PESAPAL_MAX_USD = 8;
const FALLBACK_USD_TO_TZS = 2600;

const PAYMENT_METHODS = [
  { slug: 'airtel_money', icon: Smartphone, label: 'Airtel Money', pesapal: true },
  { slug: 'tigo_pesa', icon: Smartphone, label: 'Tigo Pesa', pesapal: true },
  { slug: 'visa', icon: CreditCard, label: 'Visa', pesapal: true },
  { slug: 'mastercard', icon: CreditCard, label: 'Mastercard', pesapal: true },
  { slug: 'bank_transfer', icon: Building, label: 'Bank Transfer', pesapal: false },
];

const DonationPage = () => {
  const [donationType, setDonationType] = useState('One-time');
  const [sponsorType, setSponsorType] = useState('General');
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('airtel_money');
  const [usdToTzs, setUsdToTzs] = useState(FALLBACK_USD_TO_TZS);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', donor_email: '',
    donor_phone: '', donor_country: '', donor_organization: '', message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Predefined amounts capped at $8 for PesaPal. Bank Transfer is shown for larger gifts.
  const predefinedAmounts = [1, 2, 5, 8];

  // Fetch live exchange rate on mount
  useEffect(() => {
    apiServerClient
      .fetch('/donations/exchange-rate')
      .then(r => r.json())
      .then(d => { if (d?.rate) setUsdToTzs(d.rate); })
      .catch(() => { });
  }, []);

  // FIX: customAmount can be decimal — parseFloat handles it correctly
  const amountUSD = customAmount ? (parseFloat(customAmount) || 0) : selectedAmount;
  const amountTZS = Math.round(amountUSD * usdToTzs);

  const selectedMethodObj = PAYMENT_METHODS.find(m => m.slug === paymentMethod);
  const isBankTransfer = !selectedMethodObj?.pesapal;

  // Show a clear message when the donor exceeds $8 — guide them to Bank Transfer
  const limitError = !isBankTransfer && amountUSD > PESAPAL_MAX_USD
    ? `PesaPal donations are limited to $${PESAPAL_MAX_USD}. For larger donations please select Bank Transfer below.`
    : '';

  const handleChange = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isBankTransfer) { setSuccess(true); return; }

    if (limitError) { toast.error(limitError); return; }

    // FIX: Validate amount is a real positive number (works with decimals too)
    if (!amountUSD || isNaN(amountUSD) || amountUSD <= 0) {
      toast.error('Please enter a valid donation amount.');
      return;
    }
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast.error('Please enter your first and last name.');
      return;
    }
    if (!formData.donor_email) {
      toast.error('Please enter your email address.');
      return;
    }
    if (!formData.donor_phone) {
      toast.error('Please enter your phone number.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiServerClient.fetch('/donations/pesapal/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          email: formData.donor_email.trim(),
          donor_phone: formData.donor_phone.trim(),
          amount: amountUSD,     // always a clean JS number
          currency: 'USD',
          payment_method: paymentMethod,
          donation_type: donationType,
          sponsor_type: sponsorType,
          message: formData.message || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errMsg = data?.error || data?.message || 'Payment initiation failed';
        // PesaPal account-level transaction limit — guide user to bank transfer
        if (
          errMsg.includes('amount_exceeds_default_limit') ||
          errMsg.includes('exceeds limit') ||
          errMsg.includes('Transaction amount exceeds')
        ) {
          throw new Error(
            'This amount exceeds the current PesaPal transaction limit. ' +
            'Please use Bank Transfer for this donation, or try a smaller amount.'
          );
        }
        throw new Error(errMsg);
      }

      if (data.payment_url) {
        toast.success('Redirecting to secure payment gateway…');
        window.location.href = data.payment_url;
      } else {
        throw new Error('No payment URL returned from server.');
      }
    } catch (error) {
      console.error('Donation error:', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Bank Transfer success screen ──────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center py-20 px-4">
          <Card className="max-w-lg w-full text-center shadow-lg">
            <CardContent className="pt-12 pb-12 px-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
              <p className="text-muted-foreground text-lg mb-8">
                Your generous support helps us continue our mission of empowering communities across Tanzania.
              </p>
              <div className="bg-muted p-6 rounded-xl mb-8 text-left">
                <h3 className="font-semibold mb-2">Bank Transfer Details:</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Please use your full name as the payment reference.
                </p>
                <div className="text-sm space-y-1 font-medium">
                  <p>Bank: NMB Bank</p>
                  <p>Account Name: INTEGRATED COMMUNITY TRUST (ICEEET)</p>
                  <p>Account Number: 24710040449</p>
                  <p>Currency: TZS</p>
                </div>
              </div>
              <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                Make Another Donation
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Main donation form ────────────────────────────────────────────────────
  return (
    <>
      <Helmet>
        <title>Donate - ICEEE TRUST</title>
        <meta name="description" content="Support ICEEE TRUST's mission to empower communities in Tanzania." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow bg-muted/30 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Make a Difference Today</h1>
              <p className="text-xl text-muted-foreground">
                Your contribution directly supports sustainable development initiatives in Tanzania.
              </p>
            </div>

            <Card className="shadow-xl border-0">
              <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="divide-y divide-border">

                  {/* ── Step 1: Type, Sponsor, Amount ── */}
                  <div className="p-8 space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">1. Choose Donation Type</h3>
                      <RadioGroup value={donationType} onValueChange={setDonationType} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex items-center space-x-2 border rounded-lg p-4 flex-1 cursor-pointer hover:bg-muted/50 transition-colors">
                          <RadioGroupItem value="One-time" id="one-time" />
                          <Label htmlFor="one-time" className="cursor-pointer flex-1 font-medium">One-time Donation</Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-lg p-4 flex-1 cursor-pointer hover:bg-muted/50 transition-colors">
                          <RadioGroupItem value="Monthly Recurring" id="monthly" />
                          <Label htmlFor="monthly" className="cursor-pointer flex-1 font-medium">Monthly Giving</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">2. Where Should Your Donation Go?</h3>
                      <Select value={sponsorType} onValueChange={setSponsorType}>
                        <SelectTrigger className="w-full h-12 text-base">
                          <SelectValue placeholder="Where should your donation go?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General">General Fund (Area of Greatest Need)</SelectItem>
                          <SelectItem value="Sponsor a Project">Sponsor a Project</SelectItem>
                          <SelectItem value="Sponsor a Community">Sponsor a Community</SelectItem>
                          <SelectItem value="Sponsor a Youth Program">Sponsor a Youth Program</SelectItem>
                          <SelectItem value="Sponsor Environmental Activities">Sponsor Environmental Activities</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">3. Select Amount (USD)</h3>

                      {/* FIX: More predefined amounts including larger ones */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        {predefinedAmounts.map(amt => (
                          <Button
                            key={amt}
                            type="button"
                            variant={selectedAmount === amt && !customAmount ? 'default' : 'outline'}
                            onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                            className={`h-16 text-lg font-semibold ${selectedAmount === amt && !customAmount ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                          >
                            ${amt}
                          </Button>
                        ))}
                      </div>

                      {/* FIX: step="any" allows decimals; min="1" blocks negatives */}
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                        <Input
                          type="number"
                          min="1"
                          step="any"
                          value={customAmount}
                          onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(0); }}
                          placeholder="Enter custom amount"
                          className="h-16 pl-8 text-lg font-semibold"
                        />
                      </div>

                      {/* TZS preview */}
                      {amountUSD > 0 && !isBankTransfer && !limitError && (
                        <p className="text-sm text-muted-foreground mt-3">
                          ≈ TZS {amountTZS.toLocaleString()} at today's rate (1 USD = {usdToTzs.toLocaleString()} TZS)
                        </p>
                      )}

                      {/* Over-limit warning — only shown above 10,000,000 now */}
                      {limitError && (
                        <div className="mt-3 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                          {limitError}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Step 2: Payment Method ── */}
                  <div className="p-8 space-y-6 bg-muted/30">
                    <h3 className="text-lg font-semibold">4. Payment Method</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {PAYMENT_METHODS.map((method) => (
                        <div
                          key={method.slug}
                          onClick={() => setPaymentMethod(method.slug)}
                          className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === method.slug
                              ? 'border-primary bg-primary/5 ring-1 ring-primary'
                              : 'bg-card hover:border-primary/50'
                            }`}
                        >
                          <method.icon className={`w-5 h-5 mr-3 ${paymentMethod === method.slug ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div>
                            <span className="font-medium">{method.label}</span>
                            {method.pesapal && (
                              <span className="ml-2 text-xs text-muted-foreground">via PesaPal</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {isBankTransfer && (
                      <div className="bg-card border rounded-lg p-4 text-sm">
                        <p className="font-semibold mb-2">NMB Bank Details:</p>
                        <p>Account Name: INTEGRATED COMMUNITY TRUST (ICEEET)</p>
                        <p>Account Number: 24710040449</p>
                        <p>Currency: TZS</p>
                        <p className="text-muted-foreground mt-2 italic">
                          Click "Confirm Pledge" and we'll email you a confirmation with these details.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ── Step 3: Donor Info ── */}
                  <div className="p-8 space-y-6">
                    <h3 className="text-lg font-semibold">5. Your Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">First Name *</Label>
                        <Input id="first_name" value={formData.first_name} onChange={(e) => handleChange('first_name', e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name *</Label>
                        <Input id="last_name" value={formData.last_name} onChange={(e) => handleChange('last_name', e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="donor_email">Email Address *</Label>
                        <Input id="donor_email" type="email" value={formData.donor_email} onChange={(e) => handleChange('donor_email', e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="donor_phone">Phone Number *</Label>
                        <Input id="donor_phone" type="tel" value={formData.donor_phone} onChange={(e) => handleChange('donor_phone', e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="donor_country">Country</Label>
                        <Input id="donor_country" value={formData.donor_country} onChange={(e) => handleChange('donor_country', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="donor_organization">Organization (Optional)</Label>
                        <Input id="donor_organization" value={formData.donor_organization} onChange={(e) => handleChange('donor_organization', e.target.value)} />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="message">Message (Optional)</Label>
                        <Textarea id="message" value={formData.message} onChange={(e) => handleChange('message', e.target.value)} rows={3} />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-14 text-lg mt-8"
                      disabled={loading || (!isBankTransfer && !!limitError)}
                    >
                      {loading
                        ? 'Processing…'
                        : isBankTransfer
                          ? `Confirm Pledge of $${customAmount || selectedAmount}`
                          : `Pay $${customAmount || selectedAmount} via PesaPal`}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
                      <Heart className="w-4 h-4" />
                      {isBankTransfer ? 'Secure bank transfer' : 'Secure payment via PesaPal'}
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default DonationPage;