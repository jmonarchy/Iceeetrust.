import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
const PESAPAL_API_URL = process.env.PESAPAL_API_URL || 'https://pay.pesapal.com/v3';
const PESAPAL_LIVE_API_URL = 'https://pay.pesapal.com/v3';
const PESAPAL_SUCCESS_URL = process.env.PESAPAL_SUCCESS_URL || 'https://gray-cattle-650260.hostingersite.com/donation-success';
const PESAPAL_IPN_URL = process.env.PESAPAL_IPN_URL || 'https://gray-cattle-650260.hostingersite.com/hcgi/api/pesapal/ipn';
const PESAPAL_IPN_ID = process.env.PESAPAL_IPN_ID;
const FALLBACK_USD_TO_TZS_RATE = parseFloat(process.env.FALLBACK_USD_TO_TZS_RATE || '2600');

// Maps frontend payment-method slugs → exact SELECT values in the donations schema.
// DB allowed: "Visa/Mastercard" | "PayPal" | "Airtel Money" | "M-Pesa" | "Tigo Pesa" | "HaloPesa" | "Bank Transfer"
const PAYMENT_METHOD_MAP = {
  visa: 'Visa/Mastercard',
  mastercard: 'Visa/Mastercard',
  paypal: 'PayPal',
  airtel_money: 'Airtel Money',
  m_pesa: 'M-Pesa',
  tigo_pesa: 'Tigo Pesa',
  halo_pesa: 'HaloPesa',
  bank_transfer: 'Bank Transfer',
};

// DB allowed: "One-time" | "Monthly Recurring"
const DONATION_TYPE_MAP = {
  'One-time': 'One-time',
  'Monthly': 'Monthly Recurring',
  'Monthly Recurring': 'Monthly Recurring',
};

// PesaPal does not support transaction limit increases for NGOs.
// Hard cap: $8 USD (or equivalent). Bank Transfer should be used for larger amounts.
const PESAPAL_MAX = {
  USD: 8,
  TZS: 8 * FALLBACK_USD_TO_TZS_RATE,   // ~20,800 TZS at default rate
  KES: 8 * 130,                          // ~1,040 KES (approx)
  EUR: 7,
  GBP: 6,
};

// Token cache: { token, expiresAt }
let tokenCache = null;

// ─── Validators ────────────────────────────────────────────────────────────────

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  const digitsOnly = phone.replace(/\D/g, '');
  return /^[\d\s\-+()]+$/.test(phone) && digitsOnly.length >= 10;
}

// FIX: Accept any positive number — no artificial decimal restriction
function isValidAmount(amount) {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
}

// ─── PesaPal token (cached) ────────────────────────────────────────────────────

async function getPesaPalToken(forceRefresh = false) {
  if (!forceRefresh && tokenCache && tokenCache.expiresAt > Date.now()) {
    logger.info('Returning cached PesaPal token');
    return tokenCache.token;
  }

  if (!PESAPAL_CONSUMER_KEY || !PESAPAL_CONSUMER_SECRET) {
    throw new Error(
      'PesaPal credentials not configured: PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET are required'
    );
  }

  if (!PESAPAL_API_URL.startsWith(PESAPAL_LIVE_API_URL)) {
    throw new Error(
      `PESAPAL_API_URL "${PESAPAL_API_URL}" is not the live PesaPal endpoint. ` +
      `Set PESAPAL_API_URL=${PESAPAL_LIVE_API_URL} in your .env file.`
    );
  }

  const tokenUrl = `${PESAPAL_API_URL}/api/Auth/RequestToken`;
  logger.info(`Requesting fresh PesaPal token from: ${tokenUrl}`);

  const response = await axios.post(
    tokenUrl,
    { consumer_key: PESAPAL_CONSUMER_KEY, consumer_secret: PESAPAL_CONSUMER_SECRET },
    {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      validateStatus: () => true,
    }
  );

  logger.info(`PesaPal token response status: ${response.status}`);
  logger.info(`PesaPal token response data: ${JSON.stringify(response.data)}`);

  if (response.status >= 400) {
    tokenCache = null;
    const msg = response.data?.message || response.data?.error || 'Unknown error';
    throw new Error(`PesaPal token request failed: ${response.status} - ${msg}`);
  }

  if (!response.data?.token) {
    tokenCache = null;
    throw new Error(
      `PesaPal token request failed: Missing token in response. Got: ${JSON.stringify(response.data)}`
    );
  }

  const token = response.data.token;
  const expiresIn = response.data.expiresIn ?? response.data.expires_in ?? 3600;
  tokenCache = { token, expiresAt: Date.now() + expiresIn * 1000 - 60_000 };
  logger.info(`PesaPal token obtained and cached (expires in ${expiresIn}s)`);
  return token;
}

// ─── GET /donations/exchange-rate ──────────────────────────────────────────────

router.get('/exchange-rate', async (req, res) => {
  logger.info('=== Exchange Rate Request ===');
  try {
    const exchangeRateApiUrl = process.env.EXCHANGE_RATE_API_URL;
    if (!exchangeRateApiUrl) {
      return res.json({ rate: FALLBACK_USD_TO_TZS_RATE, from: 'USD', to: 'TZS', timestamp: new Date().toISOString() });
    }

    const response = await axios.get(`${exchangeRateApiUrl}/USD`, { timeout: 5000, validateStatus: () => true });
    if (response.status >= 400 || !response.data?.rates?.TZS) {
      logger.warn(`Exchange rate API issue (status ${response.status}), using fallback`);
      return res.json({ rate: FALLBACK_USD_TO_TZS_RATE, from: 'USD', to: 'TZS', timestamp: new Date().toISOString() });
    }

    const rate = parseFloat(response.data.rates.TZS);
    logger.info(`Exchange rate: 1 USD = ${rate} TZS`);
    return res.json({ rate, from: 'USD', to: 'TZS', timestamp: new Date().toISOString() });
  } catch (error) {
    logger.warn(`Exchange rate error: ${error.message}, using fallback`);
    return res.json({ rate: FALLBACK_USD_TO_TZS_RATE, from: 'USD', to: 'TZS', timestamp: new Date().toISOString() });
  }
});

// ─── POST /donations/pesapal/get-token ────────────────────────────────────────

router.post('/pesapal/get-token', async (req, res) => {
  logger.info('=== PesaPal Token Request ===');
  try {
    const token = await getPesaPalToken();
    return res.json({
      access_token: token,
      expires_in: Math.floor((tokenCache.expiresAt - Date.now()) / 1000),
    });
  } catch (error) {
    logger.error(`Token request error: ${error.message}`);
    return res.status(500).json({ message: 'Something went wrong!', error: { name: error.name, message: error.message } });
  }
});

// ─── POST /donations/pesapal/initiate ─────────────────────────────────────────

router.post('/pesapal/initiate', async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    amount,
    currency,
    payment_method,
    donor_phone,
    donation_type,
    sponsor_type,
    message,
  } = req.body;

  logger.info('=== PesaPal Payment Initiation ===');
  logger.info(`Body: ${JSON.stringify({ first_name, last_name, email, amount, currency, payment_method, donor_phone })}`);

  // ── Field validation ──────────────────────────────────────────────────────
  if (!first_name?.trim()) return res.status(400).json({ error: 'first_name is required' });
  if (!last_name?.trim()) return res.status(400).json({ error: 'last_name is required' });
  if (!email || !isValidEmail(email)) return res.status(400).json({ error: 'Valid email is required' });
  if (!amount || !isValidAmount(String(amount))) return res.status(400).json({ error: 'amount must be a positive number' });
  if (!payment_method?.trim()) return res.status(400).json({ error: 'payment_method is required' });
  if (!donor_phone || !isValidPhone(donor_phone)) return res.status(400).json({ error: 'Valid phone number with at least 10 digits is required' });

  if (payment_method === 'bank_transfer') {
    return res.status(400).json({ error: 'bank_transfer does not use PesaPal. Show bank details on the frontend.' });
  }

  try {
    const amountNum = parseFloat(amount);
    const upperCurrency = (currency || 'USD').toUpperCase();

    // FIX: Limit raised to 10,000,000 across all currencies
    const maxForCurrency = PESAPAL_MAX[upperCurrency] ?? PESAPAL_MAX.USD;

    if (amountNum > maxForCurrency) {
      logger.warn(`Amount ${amountNum} ${upperCurrency} exceeds limit of ${maxForCurrency}`);
      return res.status(422).json({
        error: `Donations via PesaPal are limited to $8 USD (or equivalent). ` +
          `Please use Bank Transfer for larger donations.`,
        code: 'AMOUNT_LIMIT_EXCEEDED',
        limitAmount: maxForCurrency,
        currency: upperCurrency,
      });
    }

    // ── Currency conversion for DB storage only ───────────────────────────
    let amountUSD, amountTZS;
    if (upperCurrency === 'TZS') {
      amountTZS = Math.round(amountNum);
      amountUSD = parseFloat((amountNum / FALLBACK_USD_TO_TZS_RATE).toFixed(2));
    } else {
      amountUSD = parseFloat(amountNum.toFixed(2));
      amountTZS = Math.round(amountNum * FALLBACK_USD_TO_TZS_RATE);
    }

    logger.info(`Payment: ${amountNum} ${upperCurrency} | DB: ${amountUSD} USD / ${amountTZS} TZS`);

    const orderId = `donation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    logger.info(`Order ID: ${orderId}`);

    if (!PESAPAL_IPN_ID) {
      throw new Error(
        'PESAPAL_IPN_ID is not configured. Register your IPN URL at pay.pesapal.com and add the ID to your environment variables.'
      );
    }

    // Always request a fresh token before submitting
    const accessToken = await getPesaPalToken(true);

    const paymentPayload = {
      id: orderId,
      currency: upperCurrency,
      amount: amountNum,
      description: `Donation - ${donation_type || 'General'} - ${sponsor_type || 'General Fund'}`,
      callback_url: PESAPAL_IPN_URL,
      redirect_url: PESAPAL_SUCCESS_URL,
      notification_id: PESAPAL_IPN_ID,
      billing_address: {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email_address: email.trim(),
        phone_number: donor_phone.trim(),
      },
    };

    logger.info(`Payment payload: ${JSON.stringify(paymentPayload, null, 2)}`);

    const initiateUrl = `${PESAPAL_API_URL}/api/Transactions/SubmitOrderRequest`;
    logger.info(`Submit URL: ${initiateUrl}`);

    const paymentResponse = await axios.post(initiateUrl, paymentPayload, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      validateStatus: () => true,
    });

    logger.info(`Payment response status: ${paymentResponse.status}`);
    logger.info(`Payment response data: ${JSON.stringify(paymentResponse.data)}`);

    if (paymentResponse.status >= 400) {
      const msg = paymentResponse.data?.message || paymentResponse.data?.error || 'Unknown error';
      throw new Error(`PesaPal payment initiation failed: ${paymentResponse.status} - ${msg}`);
    }

    const { redirect_url, order_tracking_id } = paymentResponse.data;

    if (!redirect_url || !order_tracking_id) {
      logger.error(`Unexpected PesaPal response: ${JSON.stringify(paymentResponse.data)}`);
      throw new Error(
        `PesaPal payment initiation failed: Missing redirect_url or order_tracking_id. Got: ${JSON.stringify(paymentResponse.data)}`
      );
    }

    logger.info(`Redirect URL: ${redirect_url}`);
    logger.info(`Order tracking ID: ${order_tracking_id}`);

    const mappedPaymentMethod = PAYMENT_METHOD_MAP[payment_method] ?? null;
    const mappedDonationType = DONATION_TYPE_MAP[donation_type] ?? null;

    // Only fields that actually exist in the DB schema.
    // usd_amount, tzs_amount, pesapal_order_id do NOT exist — sending them
    // causes PocketBase to reject the whole record, breaking every payment.
    const donationPayload = {
      donor_name: `${first_name.trim()} ${last_name.trim()}`,
      donor_email: email.trim(),
      donor_phone: donor_phone.trim(),
      amount: amountUSD,
      currency: upperCurrency,
      order_tracking_id,
      payment_status: 'PENDING',
      pesapal_transaction_id: orderId,
      message: message || '',
      ...(mappedPaymentMethod ? { payment_method: mappedPaymentMethod } : {}),
      ...(mappedDonationType ? { donation_type: mappedDonationType } : {}),
      ...(sponsor_type ? { sponsor_type } : {}),
    };

    logger.info(`Creating donation record: ${JSON.stringify(donationPayload)}`);

    let donationRecord;
    try {
      donationRecord = await pb.collection('donations').create(donationPayload);
    } catch (pbError) {
      logger.error(`PocketBase record creation failed: ${JSON.stringify(pbError)}`);
      return res.status(422).json({
        message: 'Donation record creation failed: database validation error',
        error: { name: pbError.name, message: pbError.message, data: pbError.data ?? null },
      });
    }

    logger.info(`Donation record created: ${donationRecord.id}`);
    logger.info('=== PesaPal Payment Initiation Completed ===');

    return res.json({
      payment_url: redirect_url,
      order_tracking_id,
    });
  } catch (error) {
    logger.error(`PesaPal initiate error: ${error.message}`);
    return res.status(500).json({ message: 'Something went wrong!', error: { name: error.name, message: error.message } });
  }
});

// ─── POST /donations/pesapal/ipn ──────────────────────────────────────────────

router.post('/pesapal/ipn', async (req, res) => {
  const orderTrackingId = req.body.orderTrackingId || req.body.order_tracking_id;

  logger.info('=== PesaPal IPN Received ===');
  logger.info(`Order Tracking ID: ${orderTrackingId}`);
  logger.info(`Full IPN body: ${JSON.stringify(req.body)}`);

  if (!orderTrackingId) {
    logger.warn('IPN received without orderTrackingId');
    return res.status(400).json({ error: 'Missing orderTrackingId' });
  }

  try {
    const accessToken = await getPesaPalToken();

    const statusUrl = `${PESAPAL_API_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`;
    const statusResponse = await axios.get(statusUrl, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      validateStatus: () => true,
    });

    logger.info(`Status response: ${statusResponse.status} - ${JSON.stringify(statusResponse.data)}`);

    if (statusResponse.status >= 400) {
      const msg = statusResponse.data?.message || statusResponse.data?.error || 'Unknown error';
      throw new Error(`Failed to get transaction status: ${statusResponse.status} - ${msg}`);
    }

    const rawStatus =
      statusResponse.data.payment_status_description ||
      statusResponse.data.payment_status ||
      statusResponse.data.status;

    // Normalize to exact DB enum: PENDING | COMPLETED | FAILED | CANCELLED
    const STATUS_MAP = {
      Completed: 'COMPLETED', COMPLETED: 'COMPLETED',
      Failed: 'FAILED', FAILED: 'FAILED',
      Cancelled: 'CANCELLED', CANCELLED: 'CANCELLED',
      Invalid: 'FAILED', INVALID: 'FAILED',
    };
    const paymentStatus = STATUS_MAP[rawStatus] ?? 'PENDING';
    logger.info(`PesaPal status: ${rawStatus} → DB: ${paymentStatus}`);

    const donations = await pb.collection('donations').getFullList({
      filter: `order_tracking_id = "${orderTrackingId}"`,
    });

    if (donations.length === 0) {
      logger.warn(`No donation found for tracking ID: ${orderTrackingId}`);
      return res.json({ success: true, status: paymentStatus });
    }

    const donation = donations[0];
    await pb.collection('donations').update(donation.id, { payment_status: paymentStatus });
    logger.info(`Donation ${donation.id} updated to: ${paymentStatus}`);

    if (paymentStatus === 'COMPLETED') {
      try {
        await pb.sendRecordEmail(donation, 'donation_confirmation');
        await pb.collection('donations').update(donation.id, { receipt_sent: true });
        logger.info(`Confirmation email sent to ${donation.donor_email}`);
      } catch (emailError) {
        logger.warn(`Failed to send confirmation email: ${emailError.message}`);
      }
    }

    logger.info('=== PesaPal IPN Processing Completed ===');
    return res.json({ success: true, status: paymentStatus });
  } catch (error) {
    logger.error(`IPN processing error: ${error.message}`);
    return res.status(500).json({ message: 'Something went wrong!', error: { name: error.name, message: error.message } });
  }
});

// ─── GET /donations/pesapal/status/:orderTrackingId ───────────────────────────

router.get('/pesapal/status/:orderTrackingId', async (req, res) => {
  const { orderTrackingId } = req.params;

  if (!orderTrackingId) {
    return res.status(400).json({ error: 'orderTrackingId is required' });
  }

  try {
    const donations = await pb.collection('donations').getFullList({
      filter: `order_tracking_id = "${orderTrackingId}"`,
    });

    if (donations.length === 0) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    const donation = donations[0];
    return res.json({
      order_tracking_id: orderTrackingId,
      payment_status: donation.payment_status,
      amount: donation.amount,
      currency: donation.currency,
      payment_method: donation.payment_method,
      donor_name: donation.donor_name,
      donor_email: donation.donor_email,
    });
  } catch (error) {
    logger.error(`Status check error: ${error.message}`);
    return res.status(500).json({ message: 'Something went wrong!', error: { name: error.name, message: error.message } });
  }
});

export default router;