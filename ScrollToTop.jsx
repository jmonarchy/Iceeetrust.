import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Building2, CheckCircle2, Info, Loader2 } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient';

// FIX #3: Accept processor prop from DonationPage
const DonationForm = ({ processor = 'pesapal' }) => {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [donationType, setDonationType] = useState('One-time');
  const [sponsorType, setSponsorType] = useState('General');
  const [paymentMethod, setPaymentMethod] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(2600);
  const [formErrors, setFormErrors] = useState({});

  const predefinedAmountsUSD = [10, 25, 50, 100, 250, 500];

  // FIX #3: Set default payment method based on processor
  useEffect(() => {
    if (processor === 'stripe') {
      setPaymentMethod('visa');
    } else {
      setPaymentMethod('m_pesa');
    }
  }, [processor]);

  // FIX #3: Payment methods filtered by processor
  const stripePaymentMethods = [
    { value: 'visa', label: 'Visa' },
    { value: 'mastercard', label: 'Mastercard' },
    { value: 'paypal', label: 'PayPal' },
  ];

  const pesapalPaymentMethods = [
    { value: 'm_pesa', label: 'M-Pesa (TZS)' },
    { value: 'airtel_money', label: 'Airtel Money (TZS)' },
    { value: 'tigo_pesa', label: 'Tigo Pesa (TZS)' },
    { value: 'halo_pesa', label: 'HaloPesa (TZS)' },
    { value: 'visa', label: 'Visa (USD/TZS)' },
    { value: 'mastercard', label: 'Mastercard (USD/TZS)' },
    { value: 'paypal', label: 'PayPal (USD/TZS)' },
    { value: 'bank_transfer', label: 'Bank Transfer (TZS)' },
  ];

  const availablePaymentMethods = processor === 'stripe' ? stripePaymentMethods : pesapalPaymentMethods;

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await apiServerClient.fetch('/donations/exchange-rate');
        if (response.ok) {
          const data = await response.json();
          if (data.rate) setExchangeRate(data.rate);
        }
      } catch (error) {
        console.error('Could not fetch live exchange rate, using default 2600 TZS/USD', error);
      }
    };
    fetchExchangeRate();
  }, []);

  const validateForm = () => {
    const errors = {};
    const amt = parseFloat(customAmount || selectedAmount);

    if (isNaN(amt) || amt <= 0) {
      errors.amount = 'Please enter a valid positive amount';
    }
    if (!firstName.trim()) errors.firstName = 'First name is required';
    if (!lastName.trim()) errors.lastName = 'Last name is required';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!donorEmail.trim() || !emailRegex.test(donorEmail)) {
      errors.donorEmail = 'Please enter a valid email address';
    }

    const digitsOnly = donorPhone.replace(/\D/g, '');
    if (!donorPhone.trim() || digitsOnly.length < 10) {
      errors.donorPhone = 'Please enter a valid phone number (at least 10 digits)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDonate = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form.');
      return;
    }

    setLoading(true);

    // FIX #8: Send the raw amount + currency, let backend handle conversion
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;

    // FIX #7: bank_transfer skips API entirely
    if (paymentMethod === 'bank_transfer') {
      const trackingId = `bank_${Date.now()}`;
      sessionStorage.setItem('pesapal_order_tracking_id', trackingId);
      sessionStorage.setItem('pesapal_donation_data', JSON.stringify({
        firstName,
        lastName,
        email: donorEmail,
        amount,
        currency,
        usdAmount: currency === 'USD' ? amount : parseFloat((amount / exchangeRate).toFixed(2)),
        tzsAmount: currency === 'TZS' ? amount : parseFloat((amount * exchangeRate).toFixed(2)),
        method: paymentMethod,
        date: new Date().toISOString(),
      }));
      setLoading(false);
      navigate(`/donation-success?order_tracking_id=${trackingId}&method=bank_transfer`);
      return;
    }

    try {
      // FIX #3: Route to correct endpoint based on processor
      const endpoint = processor === 'stripe'
        ? '/donations'
        : '/donations/pesapal/initiate';

      // FIX #3 + #8: Build correct payload for each processor
      let payload;
      if (processor === 'stripe') {
        payload = {
          donor_name: `${firstName.trim()} ${lastName.trim()}`,
          donor_email: donorEmail.trim(),
          donor_phone: donorPhone.trim(),
          amount,
          currency,
          donation_type: donationType,
          sponsor_type: sponsorType,
          payment_method: paymentMethod,
          message: message.trim(),
        };
      } else {
        payload = {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: donorEmail.trim(),
          amount,
          currency,               // FIX #8: pass currency so backend skips double-conversion
          payment_method: paymentMethod,
          donor_phone: donorPhone.trim(),
          donation_type: donationType,   // FIX #11: now saved
          sponsor_type: sponsorType,     // FIX #11: now saved
          message: message.trim(),       // FIX #11: now saved
        };
      }

      const response = await apiServerClient.fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to initiate donation.');
      }

      toast.success('Donation initiated securely.');

      // Store data for success page
      if (processor === 'stripe') {
        // Stripe returns a checkout URL — redirect directly
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      } else {
        // PesaPal
        if (data.order_tracking_id) {
          sessionStorage.setItem('pesapal_order_tracking_id', data.order_tracking_id);
          sessionStorage.setItem('pesapal_donation_data', JSON.stringify({
            firstName,
            lastName,
            email: donorEmail,
            amount,
            currency,
            usdAmount: data.usd_amount,
            tzsAmount: data.tzs_amount,
            method: paymentMethod,
            date: new Date().toISOString(),
          }));
        }

        if (data.payment_url) {
          window.location.href = data.payment_url;
          return;
        }
      }

      // Fallback: navigate to local success page
      const trackingId = data.order_tracking_id || data.sessionId || `manual_${Date.now()}`;
      navigate(`/donation-success?order_tracking_id=${trackingId}&method=${paymentMethod}`);

    } catch (error) {
      console.error('Donation error:', error);
      toast.error(error.message || 'Something went wrong while processing your donation.');
    } finally {
      setLoading(false);
    }
  };

  // FIX #8: Display amounts correctly based on selected currency
  const currentAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;
  const displaySymbol = currency === 'USD' ? '$' : 'TSh ';

  return (
    <form onSubmit={handleDonate} className="space-y-8" noValidate>

      {/* 1. Donation Amount & Currency */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Label className="text-lg font-semibold">1. Select Amount & Currency *</Label>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="bg-primary/10 text-primary font-medium px-3 py-1.5 rounded-md text-sm border border-primary/20 whitespace-nowrap">
              1 USD = {exchangeRate.toLocaleString()} TZS
            </div>
            <div className="w-full sm:w-32">
              <Select value={currency} onValueChange={(val) => {
                setCurrency(val);
                setSelectedAmount(predefinedAmountsUSD[2]); // reset to $50 default
                setCustomAmount('');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD (Intl)</SelectItem>
                  <SelectItem value="TZS">TZS (Local)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* FIX #8: Predefined amounts always in USD internally, displayed in selected currency */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {predefinedAmountsUSD.map((usdAmt) => {
            const displayAmt = currency === 'USD' ? usdAmt : Math.round(usdAmt * exchangeRate);
            const isSelected = selectedAmount === usdAmt && !customAmount;
            return (
              <Button
                key={usdAmt}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedAmount(usdAmt); // always store USD value
                  setCustomAmount('');
                  setFormErrors((prev) => ({ ...prev, amount: null }));
                }}
                className={`h-14 text-base font-semibold ${isSelected ? 'ring-2 ring-primary ring-offset-1' : ''}`}
              >
                {displaySymbol}{displayAmt.toLocaleString()}
              </Button>
            );
          })}
        </div>

        <div>
          <Label htmlFor="customAmount">Custom Amount *</Label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              {displaySymbol}
            </span>
            <Input
              id="customAmount"
              type="number"
              min="1"
              step="any"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(0);
                if (formErrors.amount) setFormErrors((prev) => ({ ...prev, amount: null }));
              }}
              placeholder="Enter custom amount"
              className={`pl-12 h-12 text-base ${formErrors.amount ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            />
          </div>
          {formErrors.amount && <p className="text-sm text-destructive mt-2">{formErrors.amount}</p>}

          {/* Real-time conversion display */}
          {currentAmount > 0 && (
            <div className="mt-3 bg-secondary/30 p-4 rounded-lg flex items-start gap-3 border border-border">
              <Info className="w-5 h-5 text-secondary-foreground shrink-0 mt-0.5" />
              <div>
                {currency === 'USD' ? (
                  <p className="text-sm font-medium text-secondary-foreground">
                    Equivalent: <strong>${currentAmount.toLocaleString()} USD ≈ {Math.round(currentAmount * exchangeRate).toLocaleString()} TZS</strong>
                  </p>
                ) : (
                  <p className="text-sm font-medium text-secondary-foreground">
                    Equivalent: <strong>TSh {currentAmount.toLocaleString()} TZS ≈ ${(currentAmount / exchangeRate).toFixed(2)} USD</strong>
                  </p>
                )}
                <p className="text-xs text-secondary-foreground/70 mt-1">
                  Rate: 1 USD = {exchangeRate.toLocaleString()} TZS
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Sponsorship Type */}
      <div className="space-y-6 pt-6 border-t border-border">
        <Label className="text-lg font-semibold block">2. Where should we direct your support? *</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label>Donation Frequency *</Label>
            <RadioGroup value={donationType} onValueChange={setDonationType} className="flex flex-col gap-3">
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="One-time" id="one-time" />
                <Label htmlFor="one-time" className="cursor-pointer flex-1">One-time Donation</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="Monthly Recurring" id="monthly" />
                <Label htmlFor="monthly" className="cursor-pointer flex-1">Monthly Recurring</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-3">
            <Label>Fund Designation *</Label>
            <Select value={sponsorType} onValueChange={setSponsorType}>
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="Select Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General Fund</SelectItem>
                <SelectItem value="Sponsor a Project">Sponsor a Project</SelectItem>
                <SelectItem value="Sponsor a Community">Sponsor a Community</SelectItem>
                <SelectItem value="Sponsor a Youth Program">Youth Program</SelectItem>
                <SelectItem value="Sponsor Environmental Activities">Environmental Activities</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 3. Donor Information */}
      <div className="space-y-6 pt-6 border-t border-border">
        <Label className="text-lg font-semibold block">3. Your Information *</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); if (formErrors.firstName) setFormErrors((p) => ({ ...p, firstName: null })); }}
              className={formErrors.firstName ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {formErrors.firstName && <p className="text-sm text-destructive">{formErrors.firstName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); if (formErrors.lastName) setFormErrors((p) => ({ ...p, lastName: null })); }}
              className={formErrors.lastName ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {formErrors.lastName && <p className="text-sm text-destructive">{formErrors.lastName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="donorEmail">Email Address *</Label>
            <Input
              id="donorEmail"
              type="email"
              value={donorEmail}
              onChange={(e) => { setDonorEmail(e.target.value); if (formErrors.donorEmail) setFormErrors((p) => ({ ...p, donorEmail: null })); }}
              className={formErrors.donorEmail ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {formErrors.donorEmail && <p className="text-sm text-destructive">{formErrors.donorEmail}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="donorPhone">Phone Number *</Label>
            <Input
              id="donorPhone"
              type="tel"
              placeholder="+255..."
              value={donorPhone}
              onChange={(e) => { setDonorPhone(e.target.value); if (formErrors.donorPhone) setFormErrors((p) => ({ ...p, donorPhone: null })); }}
              className={formErrors.donorPhone ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {formErrors.donorPhone && <p className="text-sm text-destructive">{formErrors.donorPhone}</p>}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Leave a note or comment with your donation"
            />
          </div>
        </div>
      </div>

      {/* 4. Payment Method — filtered by processor */}
      <div className="space-y-6 pt-6 border-t border-border">
        <Label className="text-lg font-semibold block">4. Payment Method *</Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger className="w-full h-12 text-base">
            <SelectValue placeholder="Select Payment Method" />
          </SelectTrigger>
          <SelectContent>
            {availablePaymentMethods.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* FIX #7: bank_transfer shows details but skips PesaPal */}
        {paymentMethod === 'bank_transfer' && (
          <div className="bg-muted p-5 rounded-xl border border-border flex items-start gap-4">
            <Building2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold mb-2">NMB Bank Details</h4>
              <p className="text-sm text-muted-foreground mb-1">Account Name: <strong>INTEGRATED COMMUNITY TRUST (ICEEET)</strong></p>
              <p className="text-sm text-muted-foreground mb-1">Account Number: <strong>24710040449</strong></p>
              <p className="text-sm text-muted-foreground">Currency: <strong>TZS</strong></p>
              <p className="text-sm text-amber-600 mt-2 font-medium">
                After submitting, please make the transfer manually and send proof to our email.
              </p>
            </div>
          </div>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full h-14 text-lg gap-2" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Initiating Payment...
          </>
        ) : (
          <>
            {paymentMethod === 'bank_transfer' ? 'Submit Bank Transfer Request' : 'Proceed to Donate'}
            <CheckCircle2 className="w-5 h-5" />
          </>
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        By proceeding, you agree to our Terms and Privacy Policy.{' '}
        {processor === 'stripe' ? 'Processed securely via Stripe.' : 'Processed securely via PesaPal.'}
      </p>
    </form>
  );
};

export default DonationForm;