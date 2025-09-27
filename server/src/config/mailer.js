const nodemailer = require('nodemailer');
const env = require('./env');
const logger = require('./logger');

/**
 * Configure Nodemailer SMTP transporter for transactional emails.
 */
const transporter = nodemailer.createTransport({
  host: env.email.host,
  port: env.email.port,
  secure: env.email.secure,
  auth: {
    user: env.email.user,
    pass: env.email.pass,
  },
});

// Verify the transporter once at startup so we can surface configuration issues early.
transporter.verify((error) => {
  if (error) {
    logger.warn('⚠️  Email transporter configuration issue', { error });
  } else {
    logger.info('📧 Email transporter ready');
  }
});

module.exports = transporter;
