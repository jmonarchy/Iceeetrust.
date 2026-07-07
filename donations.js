import 'dotenv/config';
import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /newsletter-subscribe - Subscribe to newsletter
router.post('/', async (req, res) => {
  const { email, name } = req.body;

  // Validate required fields
  if (!email) {
    return res.status(400).json({ error: 'Missing required field: email' });
  }

  try {
    // Check if email already exists
    const existingRecords = await pb
      .collection('newsletter_subscribers')
      .getFullList({
        filter: `email = "${email}"`,
      });

    if (existingRecords.length > 0) {
      const existingRecord = existingRecords[0];

      // If already subscribed and active
      if (existingRecord.active) {
        return res.json({
          success: false,
          message: 'Already subscribed',
        });
      }

      // If exists but inactive, reactivate
      await pb.collection('newsletter_subscribers').update(existingRecord.id, {
        active: true,
      });

      logger.info(`Newsletter subscriber reactivated: ${email}`);

      return res.json({
        success: true,
        message: 'Successfully subscribed to newsletter',
      });
    }

    // Create new subscriber
    const record = await pb.collection('newsletter_subscribers').create({
      email,
      name: name || '',
      active: true,
    });

    logger.info(`Newsletter subscriber created: ${record.id}`);

    res.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
    });
  } catch (error) {
    logger.error(`Newsletter subscription error: ${error.message}`);
    throw error;
  }
});

export default router;