const mongoose = require('mongoose');
const MerkleTree = require('../utils/merkle');

const certificateSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    attendee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    blockHash: {
      type: String,
      required: true,
      unique: true,
    },
    merkleRoot: {
      type: String,
      required: true,
    },
    proof: {
      type: Array,
      default: [],
    },
    credits: {
      type: Number,
      default: 1,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      location: String,
      attendedAt: Date,
      signature: String,
      qrData: String,
    },
    socialShare: {
      linkedinPostId: String,
      sharedAt: Date,
      shareUrl: String,
    },
    blockchainIndex: Number,
  },
  {
    timestamps: true,
  }
);

certificateSchema.index({ attendee: 1, event: 1 }, { unique: true });
certificateSchema.index({ issuedAt: -1 });

certificateSchema.methods.verify = function verify(leafData) {
  return MerkleTree.verifyProof(leafData, this.proof, this.merkleRoot);
};

module.exports = mongoose.model('Certificate', certificateSchema);
