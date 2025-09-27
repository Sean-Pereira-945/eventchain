const mongoose = require('mongoose');
const crypto = require('crypto');

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    createdByIp: String,
    revokedAt: Date,
    revokedByIp: String,
    replacedByToken: String,
  },
  {
    timestamps: true,
  }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

refreshTokenSchema.methods.isExpired = function isExpired() {
  return Date.now() >= this.expiresAt.getTime();
};

refreshTokenSchema.methods.isActive = function isActive() {
  return !this.revokedAt && !this.isExpired();
};

refreshTokenSchema.statics.generateToken = function generateToken() {
  return crypto.randomBytes(40).toString('hex');
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
