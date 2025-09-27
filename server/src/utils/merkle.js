const crypto = require('crypto');

/**
 * Simple Merkle tree implementation for certificate datasets.
 */
class MerkleTree {
  constructor(leaves = []) {
    this.leaves = leaves.map((leaf) => this.hash(leaf));
    this.layers = this.buildLayers(this.leaves);
  }

  hash(data) {
    const value = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  buildLayers(nodes) {
    if (nodes.length === 0) {
      return [['']];
    }

    const layers = [nodes];
    while (layers[layers.length - 1].length > 1) {
      layers.push(this.buildNextLayer(layers[layers.length - 1]));
    }
    return layers;
  }

  buildNextLayer(nodes) {
    const nextLayer = [];
    for (let i = 0; i < nodes.length; i += 2) {
      const left = nodes[i];
      const right = nodes[i + 1] || left; // duplicate last hash if odd
      nextLayer.push(this.hash(left + right));
    }
    return nextLayer;
  }

  getRoot() {
    return this.layers[this.layers.length - 1][0];
  }

  getProof(leafIndex) {
    let index = leafIndex;
    const proof = [];

    for (let layer = 0; layer < this.layers.length - 1; layer += 1) {
      const currentLayer = this.layers[layer];
      const isRightNode = index % 2;
      const pairIndex = isRightNode ? index - 1 : index + 1;

      if (pairIndex < currentLayer.length) {
        proof.push({
          position: isRightNode ? 'left' : 'right',
          data: currentLayer[pairIndex],
        });
      }

      index = Math.floor(index / 2);
    }

    return proof;
  }

  static verifyProof(leaf, proof, root) {
    const tree = new MerkleTree();
    let hash = tree.hash(leaf);

    proof.forEach((item) => {
      hash = tree.hash(
        item.position === 'left' ? item.data + hash : hash + item.data
      );
    });

    return hash === root;
  }
}

module.exports = MerkleTree;
