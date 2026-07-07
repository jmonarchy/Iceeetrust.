import 'dotenv/config';
import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /project-proposals - Create project proposal
router.post('/', async (req, res) => {
  const {
    project_name,
    description,
    budget,
    timeline,
    expected_impact,
    submitter_name,
    submitter_email,
    submitter_organization,
  } = req.body;

  if (!project_name || !description || !budget || !timeline || !submitter_name || !submitter_email) {
    return res.status(400).json({
      error: 'Missing required fields: project_name, description, budget, timeline, submitter_name, submitter_email',
    });
  }

  try {
    const record = await pb.collection('project_proposals').create({
      project_name,
      description,
      budget,
      timeline,
      expected_impact: expected_impact || '',
      submitter_name,
      submitter_email,
      submitter_organization: submitter_organization || '',
    });

    logger.info(`Project proposal created: ${record.id}`);

    return res.json({
      success: true,
      message: 'Proposal submitted successfully',
      proposalId: record.id,
    });
  } catch (error) {
    logger.error(`Project proposal error: ${error.message}`);
    return res.status(500).json({ message: 'Something went wrong!', error: { name: error.name, message: error.message } });
  }
});

export default router;