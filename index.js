import 'dotenv/config';
import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /partnership/inquire - Create partnership inquiry and send confirmation email
router.post('/inquire', async (req, res) => {
  const { organization_name, contact_person, email, phone, partnership_type, message } = req.body;

  if (!organization_name || !contact_person || !email || !phone || !partnership_type) {
    return res.status(400).json({ error: 'Missing required fields: organization_name, contact_person, email, phone, partnership_type' });
  }

  try {
    const record = await pb.collection('partnership_inquiries').create({
      organization_name,
      contact_person,
      email,
      phone,
      partnership_type,
      message: message || '',
    });

    try {
      await pb.sendRecordEmail(record, 'partnership_confirmation');
      logger.info(`Confirmation email sent to ${email}`);
    } catch (error) {
      logger.warn(`Failed to send confirmation email to ${email}: ${error.message}`);
    }

    logger.info(`Partnership inquiry created: ${record.id}`);

    return res.json({
      success: true,
      inquiryId: record.id,
    });
  } catch (error) {
    logger.error(`Partnership inquiry error: ${error.message}`);
    return res.status(500).json({ message: 'Something went wrong!', error: { name: error.name, message: error.message } });
  }
});

export default router;