import { Router } from 'express';
import healthCheck from './health-check.js';
import donationsRouter from './donations.js';
import contactRouter from './contact.js';
import volunteerRouter from './volunteer.js';
import partnershipRouter from './partnership.js';
import projectProposalsRouter from './project-proposals.js';
import newsletterSubscribeRouter from './newsletter-subscribe.js';
import volunteerApplyRouter from './volunteer-apply.js';
import filesRouter from './files.js';

const router = Router();

export default () => {
    router.get('/health', healthCheck);
    router.use('/donations', donationsRouter);
    router.use('/contact', contactRouter);
    router.use('/volunteer', volunteerRouter);
    router.use('/partnership', partnershipRouter);
    router.use('/project-proposals', projectProposalsRouter);
    router.use('/newsletter-subscribe', newsletterSubscribeRouter);
    router.use('/volunteer-apply', volunteerApplyRouter);
    router.use('/files', filesRouter);

    return router;
};