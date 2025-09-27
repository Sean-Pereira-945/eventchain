const Event = require('../models/Event');
const AnalyticsSnapshot = require('../models/AnalyticsSnapshot');

const buildDashboardMetrics = async (organizerId) => {
  const events = await Event.find({ organizer: organizerId }).lean({ virtuals: true });

  const totals = events.reduce(
    (acc, event) => {
      acc.totalEvents += 1;
      acc.registrations += event.attendees.length;
      const attended = event.attendees.filter((a) => a.attended).length;
      acc.attendance += attended;
      acc.certificates += event.attendees.filter((a) => a.certificateIssued).length;
      acc.revenue += event.registrationFee * event.attendees.length;
      return acc;
    },
    { totalEvents: 0, registrations: 0, attendance: 0, certificates: 0, revenue: 0 }
  );

  totals.attendanceRate = totals.registrations
    ? Math.round((totals.attendance / totals.registrations) * 100)
    : 0;

  const categories = events.reduce((acc, event) => {
    acc[event.category] = (acc[event.category] || 0) + 1;
    return acc;
  }, {});

  return {
    overview: totals,
    categories,
    upcomingEvents: events.filter((event) => event.date > new Date()),
    recentEvents: events.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5),
  };
};

const recordSnapshot = async (organizerId, timeframe, metrics) => {
  return AnalyticsSnapshot.create({
    organizer: organizerId,
    timeframe,
    metrics,
  });
};

module.exports = {
  buildDashboardMetrics,
  recordSnapshot,
};
