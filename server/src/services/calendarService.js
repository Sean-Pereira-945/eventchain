const axios = require('axios');
const env = require('../config/env');
const logger = require('../config/logger');

// Placeholder functions that demonstrate how calendar integration would work.
// In production you would use OAuth2 and Google Calendar API client.
const syncEventToGoogleCalendar = async (event, user) => {
  if (!user.integrations?.googleCalendar?.refreshToken) {
    return null;
  }

  try {
    const payload = {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: new Date(`${event.date.toISOString().split('T')[0]}T${event.startTime}:00Z`).toISOString(),
      },
      end: {
        dateTime: new Date(`${event.date.toISOString().split('T')[0]}T${event.endTime}:00Z`).toISOString(),
      },
      location: event.location.address,
    };

    // This is a simplified example. In reality you'd exchange refresh tokens for access tokens.
    await axios.post('https://www.googleapis.com/calendar/v3/calendars/primary/events', payload, {
      headers: {
        Authorization: `Bearer ${user.integrations.googleCalendar.accessToken}`,
      },
    });

    return true;
  } catch (error) {
    logger.warn('Failed to sync event to Google Calendar', { error: error.response?.data || error.message });
    return false;
  }
};

module.exports = {
  syncEventToGoogleCalendar,
};
