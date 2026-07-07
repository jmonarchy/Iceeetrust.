import 'dotenv/config';
import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /contact/submit - Create contact submission and send confirmation email
router.post('/submit', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields: name, email, subject, message' });
  }

  try {
    // FIX: collection is 'contact_submissions' not 'contacts'
    const record = await pb.collection('contact_submissions').create({
      name,
      email,
      subject,
      message,
    });

    try {
      await pb.sendRecordEmail(record, 'contact_confirmation');
      logger.info(`Confirmation email sent to ${email}`);
    } catch (error) {
      logger.warn(`Failed to send confirmation email to ${email}: ${error.message}`);
    }

    logger.info(`Contact submission created: ${record.id}`);

    return res.json({
      success: true,
      submissionId: record.id,
    });
  } catch (error) {
    logger.error(`Contact submission error: ${error.message}`);
    return res.status(500).json({ message: 'Something went wrong!', error: { name: error.name, message: error.message } });
  }
});

export default router;