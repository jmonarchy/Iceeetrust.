import 'dotenv/config';
import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

// POST /files/upload - Upload file to PocketBase
router.post('/upload', async (req, res) => {
  try {
    // Check authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized — please log in.' });
    }

    const userId = req.user.id;

    // express-fileupload must be registered in main.js for req.files to be populated
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const file = req.files.file;

    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({
        error: `File size exceeds the 20MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
      });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return res.status(400).json({
        error: `File type "${file.mimetype}" is not allowed. Accepted: JPEG, PNG, GIF, WEBP, PDF.`,
      });
    }

    logger.info(`File upload: ${file.name} (${file.mimetype}, ${file.size} bytes) by user ${userId}`);

    const formData = new FormData();
    const blob = new Blob([file.data], { type: file.mimetype });
    formData.append('file', blob, file.name);
    formData.append('uploadedBy', userId);
    formData.append('fileType', file.mimetype);
    formData.append('fileSize', file.size.toString());
    formData.append('filename', file.name);

    const record = await pb.collection('files').create(formData);

    logger.info(`File uploaded successfully: ${record.id}`);

    const fileUrl = pb.files.getURL(record, record.file);

    return res.json({
      success: true,
      fileId: record.id,
      filename: record.filename || file.name,
      fileUrl,
      fileSize: record.fileSize,
    });
  } catch (error) {
    logger.error(`File upload error: ${error.message}`);
    return res.status(500).json({
      error: 'File upload failed.',
      details: error.message,
    });
  }
});

export default router;