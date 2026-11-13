'use strict';

/**
 * SFT: is the original 2014 32x8 byte table recoverable from the *2013* CicadaOS
 * random tape, directly or under a fixed 1- or 8-byte XOR/additive mask?
 *
 * Input: the pinned 2013 ISO (not executed/mounted) and the repository's source
 * 2014 grid. All source reads are deterministic, and no LP2 language scorer is
 * trained or consulted. Every orientation/key model has an independent positive.
 *
 * Usage: node sims/lp2_2013_cicadaos_grid_tape_window_sft.cjs path/to/3301.iso
 */
const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const ISO_MD5 = '74062dee4093c6ca0340cda23f0e994b';
const GRID_SHA256 = '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290';
const DATA_BYTES = 118818811;
const SECTOR = 2048;

/** @param {Buffer} iso @param {string[]} segments @returns {Buffer} */
function isoFile(iso, segments) {
  const pvd = 16 * SECTOR;
  assert.equal(iso.subarray(pvd + 1, pvd + 6).toString(), 'CD001');
  let record = pvd + 156;
  for (const segment of segments) {
    const lba = iso.readUInt32LE(record + 2);
    const size = iso.readUInt32LE(record + 10);
    const start = lba * SECTOR;
    let found = -1;
    for (let offset = 0; offset < size;) {
      const length = iso[start + offset];
      if (!length) {
        offset = (Math.floor(offset / SECTOR) + 1) * SECTOR;
        continue;
      }
      const p = start + offset;
      const n = iso[p + 32];
      const name = iso.subarray(p + 33, p + 33 + n).toString('ascii').split(';')[0].replace(/\.$/, '');
      if (name.toUpperCase() === segment.toUpperCase()) {
        found = p;
        break;
      }
      offset += length;
    }
    assert.notEqual(found, -1, 'Missing ISO path component ' + segment);
    record = found;
  }
  const dataStart = iso.readUInt32LE(record + 2) * SECTOR;
  const dataSize = iso.readUInt32LE(record + 10);
  assert.ok(dataStart >= 0 && dataStart + dataSize <= iso.length, 'Out-of-range ISO extent');
  assert.equal((iso[record + 25] & 2), 0, 'Requested ISO item is a directory');
  return iso.subarray(dataStart, dataStart + dataSize);
}

/** @param {Buffer} grid @returns {{name:string, bytes:Buffer}[]} */
function layouts(grid) {
  const column = Buffer.alloc(256);
  for (let j = 0; j < 256; j++) {
    column[j] = grid[(j % 32) * 8 + Math.floor(j / 32)];
  }
  return [
    {name: 'row-major', bytes: grid},
    {name: 'row-major reversed', bytes: Buffer.from(grid).reverse()},
    {name: 'column-major', bytes: column},
    {name: 'column-major reversed', bytes: Buffer.from(column).reverse()},
  ];
}

/** @typedef {{name:string, radix:number, lag:number, width:number, op:'xor'|'add'|'r29'}} Model */
const models = [
  {name: 'byte XOR with 1-byte mask', radix: 256, lag: 1, width: 6, op: 'xor'},
  {name: 'byte addition with 1-byte mask', radix: 256, lag: 1, width: 6, op: 'add'},
  {name: 'byte XOR with repeating 8-byte mask', radix: 256, lag: 8, width: 6, op: 'xor'},
  {name: 'byte addition with repeating 8-byte mask', radix: 256, lag: 8, width: 6, op: 'add'},
  {name: 'GP29 residues plus one unknown constant', radix: 29, lag: 1, width: 9, op: 'r29'},
];

/** @param {number} a @param {number} b @param {Model} m */
function delta(a, b, m) {
  if (m.op === 'xor') return a ^ b;
  if (m.op === 'add') return (b - a + 256) & 255;
  return ((b % 29) - (a % 29) + 29) % 29;
}

/** @param {number} target @param {number} src @param {Model} m */
function keyFrom(target, src, m) {
  if (m.op === 'xor') return target ^ src;
  if (m.op === 'add') return (target - src + 256) & 255;
  return ((target % 29) - (src % 29) + 29) % 29;
}

/** @param {number} src @param {number} key @param {Model} m */
function applyKey(src, key, m) {
  if (m.op === 'xor') return src ^ key;
  if (m.op === 'add') return (src + key) & 255;
  return ((src % 29) + key) % 29;
}

/**
 * Index every source-observed model signature in each of four grid orientations.
 * Then scan the tape in a *single* rolling-radix pass per model.
 * Exact 6-byte differences use integers <2^48 and residue differences <29^9,
 * so JavaScript number arithmetic remains integer-exact.
 * @param {Buffer} tape @param {{name:string,bytes:Buffer}[]} sources @param {Model} m
 */
function scan(tape, sources, m) {
  const {radix, lag, width} = m;
  const tailBase = radix ** (width - 1);
  const map = new Map();
  for (const {name, bytes} of sources) {
    for (let j = 0; j + lag + width <= bytes.length; j++) {
      let h = 0;
      for (let k = 0; k < width; k++) h = h * radix + delta(bytes[j + k], bytes[j + k + lag], m);
      let refs = map.get(h);
      if (!refs) {
        refs = [];
        map.set(h, refs);
      }
      refs.push({name, bytes, j});
    }
  }
  const hits = [];
  let h = 0;
  for (let k = 0; k < width; k++) h = h * radix + delta(tape[k], tape[k + lag], m);
  for (let pos = 0; pos + lag + width <= tape.length; pos++) {
    const refs = map.get(h);
    if (refs) for (const {name, bytes, j} of refs) {
      const base = pos - j;
      const key = Array.from({length: lag}, (_, i) => keyFrom(bytes[j + i], tape[pos + i], m));
      /** @param {number} tablePos */
      const equals = tablePos => {
        const i = base + tablePos;
        const phase = ((tablePos - j) % lag + lag) % lag;
        return applyKey(tape[i], key[phase], m) === (m.op === 'r29' ? bytes[tablePos] % 29 : bytes[tablePos]);
      };
      let left = j, right = j + lag + width - 1;
      while (left > 0 && base + left > 0 && equals(left - 1)) left--;
      while (right + 1 < bytes.length && base + right + 1 < tape.length && equals(right + 1)) right++;
      const match = {layout: name, model: m.name, sourceOffset: base + left, tableOffset: left,
        matchLength: right - left + 1, key: key.join(','), fullTable: left === 0 && right === 255};
      hits.push(match);
    }
    if (pos + lag + width < tape.length) {
      h = (h % tailBase) * radix + delta(tape[pos + width], tape[pos + width + lag], m);
    }
  }
  hits.sort((a, b) => b.matchLength - a.matchLength);
  return {model: m.name, orientations: sources.length, signatures: map.size,
    hits: hits.length, best: hits.slice(0, 5)};
}

function run() {
  const table = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-grid-256.json', 'utf8'));
  const grid = Buffer.from(table.bytes);
  assert.equal(grid.length, 256);
  assert.equal(crypto.createHash('sha256').update(grid).digest('hex'), GRID_SHA256);
  const candidates = layouts(grid);
  for (const model of models) {
    const planted = Buffer.from(crypto.createHash('sha512').update('Cicada 2013 tape test').digest());
    const tape = Buffer.concat([planted, Buffer.alloc(17),
      Buffer.from(candidates[0].bytes.map((b, i) => model.op === 'xor' ? b ^ (i % model.lag ? 39 : 211)
        : model.op === 'r29' ? ((b % 29) + 29 - 7) % 29 : (b - (i % model.lag ? 39 : 211) + 256) & 255)),
      Buffer.alloc(17)]);
    const result = scan(tape, [{name: 'source-native positive', bytes: candidates[0].bytes}], model);
    assert.equal(result.best[0]?.matchLength, 256, 'Positive inversion failed: ' + model.name);
    assert.equal(result.best[0]?.fullTable, true);
  }
  console.log('Positive source-native 256-cell inversions: 5/5 PASS');

  const file = process.argv[2];
  assert.ok(file, 'Specify original 3301.iso as sole file argument');
  const image = fs.readFileSync(file);
  assert.equal(crypto.createHash('md5').update(image).digest('hex'), ISO_MD5, 'Original 2013 ISO MD5');
  const tape = isoFile(image, ['DATA', '560.13']);
  assert.equal(tape.length, DATA_BYTES);
  console.log('ISO MD5 validated:', ISO_MD5, '2013 tape bytes:', tape.length);
  console.log('2014 table SHA256:', GRID_SHA256);
  for (const m of models) {
    const outcome = scan(tape, candidates, m);
    console.log(JSON.stringify(outcome));
  }
}

run();
