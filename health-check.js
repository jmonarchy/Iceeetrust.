import 'dotenv/config';
import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /volunteer-apply - Submit volunteer application
router.post('/', async (req, res) => {
  const { name, email, phone, skills, availability, interests } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({
      error: 'Missing required fields: name, email, phone',
    });
  }

  try {
    const record = await pb.collection('volunteer_applications').create({
      name,
      email,
      phone,
      skills: skills || '',
      availability: availability || '',
      interests: Array.isArray(interests) ? interests : [],
    });

    logger.info(`Volunteer application created: ${record.id}`);

    return res.json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: record.id,
    });
  } catch (error) {
    logger.error(`Volunteer application error: ${error.message}`);
    return res.status(500).json({ message: 'Something went wrong!', error: { name: error.name, message: error.message } });
  }
});

export default router;