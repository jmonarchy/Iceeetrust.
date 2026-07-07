import 'dotenv/config';
import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /volunteer/signup - Create volunteer signup and send confirmation email
router.post('/signup', async (req, res) => {
  const { name, email, phone, skills, availability, interests } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Missing required fields: name, email, phone' });
  }

  try {
    const record = await pb.collection('volunteer_signups').create({
      name,
      email,
      phone,
      skills: skills || '',
      availability: availability || '',
      interests: interests || '',
    });

    try {
      await pb.sendRecordEmail(record, 'volunteer_confirmation');
      logger.info(`Confirmation email sent to ${email}`);
    } catch (error) {
      logger.warn(`Failed to send confirmation email to ${email}: ${error.message}`);
    }

    logger.info(`Volunteer signup created: ${record.id}`);

    return res.json({
      success: true,
      signupId: record.id,
    });
  } catch (error) {
    logger.error(`Volunteer signup error: ${error.message}`);
    return res.status(500).json({ message: 'Something went wrong!', error: { name: error.name, message: error.message } });
  }
});

export default router;