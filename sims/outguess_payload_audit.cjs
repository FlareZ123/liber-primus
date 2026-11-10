'use strict';
/**
 * Audit OutGuess output artifacts without assuming that successful extraction
 * means a genuine hidden message. Usage: node sims/outguess_payload_audit.cjs DIR
 * Requires the unpacked artifact from workflow lp2-outguess.yml.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

/** @param {Buffer} bytes @returns {number} */
function entropy(bytes) {
  const freq = new Uint32Array(256);
  for (const byte of bytes) freq[byte]++;
  let total = 0;
  for (const count of freq) if (count) {
    const p = count / bytes.length;
    total -= p * Math.log2(p);
  }
  return total;
}

/** @param {Buffer} a @param {Buffer} b @returns {number} */
function commonPrefix(a, b) {
  let i = 0;
  const max = Math.min(a.length, b.length);
  while (i < max && a[i] === b[i]) i++;
  return i;
}

/** @param {string} directory */
function audit(directory) {
  const files = fs.readdirSync(directory).filter(n => /^\d\d\.payload$/.test(n)).sort();
  const buffers = new Map(files.map(n => [n, fs.readFileSync(path.join(directory, n))]));
  const sample = files.filter(n => n !== '00.payload' && n !== '08.payload');
  const pairs = [];
  for (let i = 0; i < sample.length; i++)
    for (let j = i + 1; j < sample.length; j++)
      pairs.push(commonPrefix(buffers.get(sample[i]), buffers.get(sample[j])));
  pairs.sort((a,b) => a-b);
  const summaries = sample.map(name => {
    const bytes = buffers.get(name);
    return {page: Number(name.slice(0,2)), length: bytes.length,
      entropy: Number(entropy(bytes).toFixed(5)),
      sha256: createHash('sha256').update(bytes).digest('hex')};
  });
  return {
    category: 'unverified binary extraction outputs, not validated steganographic messages',
    controls: ['00.payload','08.payload'].filter(name=>buffers.has(name)),
    lp2Count: sample.length,
    uniqueLengths: [...new Set(summaries.map(x=>x.length))],
    commonPrefixBytes: pairs.length ? pairs[0] : null,
    allPairsPrefix: pairs.length ? {min:pairs[0],median:pairs[Math.floor(pairs.length/2)],max:pairs[pairs.length-1]} : null,
    meanByteEntropy: summaries.reduce((a,x)=>a+x.entropy,0)/Math.max(1,summaries.length),
    outputs: summaries
  };
}

if (require.main === module) {
  const dir = process.argv[2];
  assert.ok(dir, 'Supply extracted OutGuess artifact directory');
  console.log(JSON.stringify(audit(dir), null, 2));
}
module.exports = { audit, commonPrefix, entropy };
