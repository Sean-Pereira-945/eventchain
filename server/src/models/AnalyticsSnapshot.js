const mongoose = require('mongoose');

const analyticsSnapshotSchema = new mongoose.Schema(
  {
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    timeframe: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    metrics: {
      totalEvents: Number,
      registrations: Number,
      attendance: Number,
      revenue: Number,
      certificateIssued: Number,
      followerGrowth: Number,
    },
    breakdown: {
      byCategory: Object,
      byLocation: Object,
      byStatus: Object,
    },
  },
  {
    timestamps: true,
  }
);

analyticsSnapshotSchema.index({ organizer: 1, timeframe: 1, date: -1 });

module.exports = mongoose.model('AnalyticsSnapshot', analyticsSnapshotSchema);
