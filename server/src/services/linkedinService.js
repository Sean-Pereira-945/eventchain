const axios = require('axios');
const logger = require('../config/logger');

const shareCertificateOnLinkedIn = async (user, certificate) => {
  if (!user.integrations?.linkedin?.accessToken) {
    return null;
  }

  try {
    const payload = {
      owner: `urn:li:person:${user.integrations.linkedin.profileId}`,
      subject: `Certificate earned: ${certificate.event.title}`,
      text: {
        text: `I just earned a certificate for ${certificate.event.title}! Verification hash: ${certificate.blockHash}`,
      },
    };

    const response = await axios.post('https://api.linkedin.com/v2/shares', payload, {
      headers: {
        Authorization: `Bearer ${user.integrations.linkedin.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    logger.warn('LinkedIn share failed', { error: error.response?.data || error.message });
    return null;
  }
};

module.exports = {
  shareCertificateOnLinkedIn,
};
