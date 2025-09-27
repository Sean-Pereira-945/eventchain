const path = require('path');
const fs = require('fs');
const env = require('../config/env');
const logger = require('../config/logger');
const MerkleTree = require('../utils/merkle');

// Lazy require to avoid circular dependencies before blockchain package is built.
const getBlockchainClass = () => {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const { CertificateBlockchain } = require(path.resolve(process.cwd(), 'blockchain/src')); // expects an index export
  return CertificateBlockchain;
};

let blockchainInstance;

const getBlockchain = () => {
  if (!blockchainInstance) {
    const Blockchain = getBlockchainClass();
    blockchainInstance = new Blockchain({
      persistencePath: env.blockchain.persistencePath,
    });
  }
  return blockchainInstance;
};

const issueCertificateBlock = async (payload) => {
  const chain = getBlockchain();
  const block = await chain.addCertificate(payload);
  return block;
};

const verifyCertificateHash = async (hash) => {
  const chain = getBlockchain();
  return chain.verifyCertificate(hash);
};

const getBlockchainState = async (limit = 10) => {
  const chain = getBlockchain();
  return chain.getLatestBlocks(limit);
};

const rebuildMerkleTree = (certificates) => {
  const tree = new MerkleTree(certificates.map((c) => JSON.stringify(c)));
  return tree.getRoot();
};

const ensurePersistenceDir = () => {
  const dir = path.dirname(env.blockchain.persistencePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info('Created blockchain persistence directory', { dir });
  }
};

ensurePersistenceDir();

module.exports = {
  getBlockchain,
  issueCertificateBlock,
  verifyCertificateHash,
  getBlockchainState,
  rebuildMerkleTree,
};
