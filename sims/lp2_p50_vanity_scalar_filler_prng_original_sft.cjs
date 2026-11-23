'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const source = require('../resources/liber-primus/base60-grid.json');

/** @param {Buffer} expected @param {Buffer} actual @returns {{hits: number, longest: number}} */
function compare(expected, actual) {
  let hits = 0;
  let streak = 0;
  let longest = 0;
  for (let i = 0; i < expected.length; i++) {
    if (expected[i] === actual[i]) { hits++; streak++; }
    else streak = 0;
    longest = Math.max(longest, streak);
  }
  return { hits, longest };
}

/** @param {Buffer} key @returns {Map<string, Buffer>} */
function sourceStreams(key) {
  const streams = new Map();
  for (const [name, cipher, iv] of [
    ['AES-256-CTR-ZERO', 'aes-256-ctr', Buffer.alloc(16)],
    ['CHACHA20-ZERO', 'chacha20', Buffer.alloc(16)]
  ]) {
    const enc = crypto.createCipheriv(cipher, key, iv);
    streams.set(name, Buffer.concat([enc.update(Buffer.alloc(320)), enc.final()]));
  }
  /** @param {(i: number) => Buffer} block */
  const fromBlocks = block => Buffer.concat(Array.from({length: 10}, (_, i) => block(i)));
  /** @param {number} i */
  const be32 = i => { const b = Buffer.alloc(4); b.writeUInt32BE(i); return b; };
  const hash = b => crypto.createHash('sha256').update(b).digest();
  streams.set('SHA256(KEY||BE32)', fromBlocks(i => hash(Buffer.concat([key, be32(i)]))));
  streams.set('SHA256(BE32||KEY)', fromBlocks(i => hash(Buffer.concat([be32(i), key]))));
  streams.set('HMAC-SHA256(BE32)', fromBlocks(i => crypto.createHmac('sha256', key).update(be32(i)).digest()));
  let chain = Buffer.from(key);
  streams.set('SHA256-CHAIN', Buffer.concat(Array.from({length: 10}, () => (chain = hash(chain)))));
  return streams;
}

const rows = source.byte_rows;
assert.equal(rows.length, 32);
assert.ok(rows.every(r => r.length === 8));
const table = Buffer.from(rows.flat());
assert.equal(table.length, 256);
const key = Buffer.from(rows.map(r => r[4]));
assert.equal(key.toString('hex'), '61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4');
const targets = new Map([
  ['row-major-omit-column5', Buffer.from(rows.flatMap(r => r.filter((_, j) => j !== 4)))],
  ['column-major-omit-column5', Buffer.from(Array.from({length: 8}, (_, c) => c).filter(c => c !== 4).flatMap(c => rows.map(r => r[c])))]
]);
const streams = sourceStreams(key);
const trials = [];
for (const [layout, filler] of targets) {
  for (const [primitive, stream] of streams) {
    for (let offset = 0; offset <= 32; offset++) {
      trials.push({layout, primitive, offset, ...compare(filler, stream.subarray(offset, offset + filler.length))});
    }
  }
}
assert.equal(trials.length, 396);
assert.deepEqual(compare(targets.get('row-major-omit-column5'), targets.get('row-major-omit-column5')), {hits:224, longest:224});
const maxRun = Math.max(...trials.map(r => r.longest));
const maxHits = Math.max(...trials.map(r => r.hits));
const best = [...trials].sort((a,b) => b.longest - a.longest || b.hits - a.hits).slice(0,12);
console.log(JSON.stringify({source:'resources/liber-primus/base60-grid.json', scalar:key.toString('hex'), fillerBytes:224, layouts:[...targets.keys()],primitives:[...streams.keys()],offsets:'0..32 inclusive',trials:trials.length,maxRun,maxHits,best},null,2));
assert.ok(maxRun < 3, 'Unexpected >=3-byte original filler agreement: investigate rather than discarding');
console.log('PASS: positive 224/224 synthetic control and bounded original source gate');
