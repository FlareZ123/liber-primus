'use strict';
/**
 * Original LP1 Onion3-style out-of-band JPEG transfer gate for LP2.
 * Read-only SFT. Run from repository root with Node.js 22.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');

/** @param {number} n @returns {Buffer} */
function jpg(n) {
  return fs.readFileSync(path.join(root, String(n).padStart(2, '0') + '.jpg'));
}
/** @param {Buffer} b @returns {string} */
function sha(b) {
  return crypto.createHash('sha256').update(b).digest('hex');
}
/**
 * Locate the first genuine JPEG end of image after its scan data.
 * Byte-stuffed FF00 and restart markers are not termination markers.
 * @param {Buffer} data
 * @returns {{eoi:number, segments:{marker:number,payload:Buffer}[]}}
 */
function scan(data) {
  assert.equal(data.subarray(0, 2).toString('hex'), 'ffd8');
  let p = 2, inScan = false;
  /** @type {{marker:number,payload:Buffer}[]} */
  const segments = [];
  while (p < data.length) {
    assert.equal(data[p], 0xff, 'Expected JPEG marker at byte ' + p);
    while (data[p] === 0xff) p++;
    const m = data[p++];
    if (inScan) {
      if (m === 0 || (m >= 0xd0 && m <= 0xd7)) {
        while (p < data.length && data[p] !== 0xff) p++;
        continue;
      }
      if (m === 0xd9) return {eoi:p, segments};
      throw new Error('Unexpected scan marker ff' + m.toString(16));
    }
    assert.notEqual(m, 0xd9);
    const len = data.readUInt16BE(p);
    assert.ok(len >= 2 && p + len <= data.length);
    if (m === 0xda) {
      p += len;
      inScan = true;
      while (p < data.length && data[p] !== 0xff) p++;
    } else {
      segments.push({marker:m, payload:data.subarray(p+2, p+len)});
      p += len;
    }
  }
  throw new Error('JPEG scan lacks EOI');
}

const a = jpg(5), lp1 = scan(a);
assert.equal(a.length, 673066);
assert.equal(lp1.eoi, 336353);
const center = a.subarray(lp1.eoi, lp1.eoi + 360);
assert.equal(center.subarray(0, 2).toString('hex'), '0a0a');
const hex = center.subarray(2).toString('ascii');
assert.match(hex, /^[0-9a-fA-F]{358}$/);
assert.equal(sha(Buffer.from(hex, 'hex')),
  '82c135148b6cf85e9b550afdbc6204be075ff67717356a8ae18b76f9cc3af5fa');
assert.deepEqual(a.subarray(lp1.eoi + 360),
  Buffer.from(a.subarray(0, lp1.eoi)).reverse());
console.log('LP1 positive: true EOI 336353, 360-byte known OOB header, 179-byte magic square, complete reversed JPEG.');

let rgb=0, gray=0;
const app0 = new Set(), app2 = new Set(), firstDqt = new Set(), rgbDqt = new Set();
for (let i=17;i<=74;i++) {
  const original = jpg(i), r = scan(original);
  assert.equal(r.eoi, original.length, i + '.jpg has bytes beyond first true EOI');
  const apps = r.segments.filter(x => x.marker>=0xe0 && x.marker<=0xef);
  assert.deepEqual(apps.map(x => x.marker), [0xe0, 0xe2]);
  app0.add(sha(apps[0].payload));
  app2.add(sha(apps[1].payload));
  const frame = r.segments.find(x => x.marker===0xc0);
  assert.ok(frame);
  assert.equal(frame.payload.readUInt16BE(1), 3600);
  assert.equal(frame.payload.readUInt16BE(3), 2400);
  const q = r.segments.filter(x => x.marker===0xdb);
  firstDqt.add(sha(q[0].payload));
  if(frame.payload[5]===3) {
    rgb++;
    assert.equal(q.length, 2);
    rgbDqt.add(sha(q[1].payload));
  } else {
    assert.equal(frame.payload[5], 1);
    gray++;
    assert.equal(q.length, 1);
  }
  console.log(i + '.jpg: ' + original.length + ' bytes, '
    + frame.payload[5] + ' components, EOI at EOF, '
    + apps.length + ' APP segments, ' + q.length + ' DQT tables');
}
assert.equal(rgb,35);
assert.equal(gray,23);
assert.equal(app0.size,1);
assert.equal(app2.size,1);
assert.equal(firstDqt.size,1);
assert.equal(rgbDqt.size,1);
console.log('LP2 58/58: no post-EOI bytes; 35 RGB, 23 gray; common APP0, APP2 and DQT settings.');

/* Additional source-triggered direct receiver: the 32x8 printed p50
 * conventional base60 table superficially forms four 8x8 JPEG DQT tables.
 * The literal interpretation requires 1..255 coefficients, including in
 * zigzag ordering. The zero coefficients are an algebraic obstruction. */
const grid = JSON.parse(fs.readFileSync(
  path.join(root,'lp2-grid-256.json'),'utf8'));
assert.equal(grid.bytes.length,256);
const zeros = grid.bytes.flatMap((value,index)=>value===0?[index]:[]);
assert.deepEqual(zeros,[192,229]);
console.log('p50 direct four-DQT gate: table indices 192 and 229 are 00 (zero).');
console.log('No literal complete four-quantization-table interpretation. DCT coefficient steganography and other table roles remain untested here.');
