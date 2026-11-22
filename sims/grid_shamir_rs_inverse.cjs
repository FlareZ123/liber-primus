'use strict';

/**
 * Source-locked 8-share interpolation challenge for the LP2 32x8 base-60 table.
 * SFT: node sims/grid_shamir_rs_inverse.cjs, Node.js 22, built-in modules only.
 * Polynomial-share layouts use x=1..8, with 32 rows as byte coordinates.
 * A degree-7 interpolation always fits eight shares, so its reconstructed
 * x=0 secret is a hypothesis, not evidence of hidden secret sharing.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createCipheriv, getCiphers, createHash } = require('node:crypto');

const ROOT = path.join(__dirname, '..');
const GRID_FILE = path.join(ROOT, 'resources', 'liber-primus', 'base60-grid.json');
const LP2_FILE = path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json');
const ENGLISH_FILE = path.join(ROOT, 'resources', 'control', 'shakespeare_first300k.txt');
const ALPHABET = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ';
const MOD = 29;

/** @param {number} a @param {number} b @param {number} irreducible @returns {number} */
function gfMul(a, b, irreducible) {
  let result = 0;
  for (let i = 0; i < 8; i++) {
    if ((b & 1) !== 0) result ^= a;
    b >>>= 1;
    a <<= 1;
    if ((a & 256) !== 0) a ^= irreducible;
  }
  return result;
}

/** @param {number} poly @returns {{mul: (a:number,b:number)=>number, inverse: (n:number)=>number}} */
function gf256(poly) {
  const lut = Array.from({ length: 256 }, () => new Uint8Array(256));
  const inverses = new Uint8Array(256);
  for (let a = 0; a < 256; a++) {
    for (let b = 0; b < 256; b++) lut[a][b] = gfMul(a, b, poly);
  }
  for (let a = 1; a < 256; a++) {
    for (let b = 1; b < 256; b++) {
      if (lut[a][b] === 1) {
        inverses[a] = b;
        break;
      }
    }
    assert.notEqual(inverses[a], 0, 'Expected genuine finite field polynomial');
  }
  return { mul: (a, b) => lut[a][b], inverse: (a) => {
    assert.notEqual(a, 0);
    return inverses[a];
  }, add: (a, b) => a ^ b, sub: (a, b) => a ^ b, id: 'GF256/0x' + poly.toString(16) };
}

/** @param {number} value @param {number} n @returns {number} */
function modPow(value, n) {
  let result = 1;
  for (let base = (value % 257 + 257) % 257; n > 0; n >>>= 1) {
    if (n & 1) result = result * base % 257;
    base = base * base % 257;
    value = base;
  }
  return result;
}

/** @returns {{mul: (a:number,b:number)=>number, inverse:(a:number)=>number}} */
function prime257() {
  return { mul: (a, b) => a * b % 257, inverse: (a) => {
    assert.notEqual(a, 0);
    return modPow(a, 255);
  }, add: (a, b) => (a + b) % 257,
  sub: (a, b) => (a - b + 257) % 257, id: 'GF257' };
}

/** @param {number[]} xs @param {number[]} ys @param {number} target @param {ReturnType<typeof gf256>|ReturnType<typeof prime257>} field @returns {number} */
function interpolate(xs, ys, target, field) {
  assert.equal(xs.length, ys.length);
  let result = 0;
  for (let i = 0; i < xs.length; i++) {
    let summand = ys[i];
    for (let j = 0; j < xs.length; j++) {
      if (i === j) continue;
      summand = field.mul(summand, field.mul(field.sub(target, xs[j]), field.inverse(field.sub(xs[i], xs[j]))));
    }
    result = field.add(result, summand);
  }
  return result;
}

/** @param {number[]} shares @param {number} degree @param {ReturnType<typeof gf256>} field @returns {boolean} */
function isDegreeAtMost(shares, degree, field) {
  const xs = Array.from({length: degree + 1}, (_, i) => i + 1);
  const ys = shares.slice(0, degree + 1);
  for (let i = degree + 1; i < shares.length; i++) {
    if (interpolate(xs, ys, i + 1, field) !== shares[i]) return false;
  }
  return true;
}

/** @param {number[][]} table @param {ReturnType<typeof gf256>} field @param {boolean} reversed @returns {number[]} */
function recover(table, field, reversed) {
  const xs = [1,2,3,4,5,6,7,8];
  return table.map(row => interpolate(xs, reversed ? [...row].reverse() : row, 0, field));
}

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const histogram = new Uint32Array(MOD);
  for (const symbol of symbols) histogram[symbol]++;
  const collisions = histogram.reduce((sum, n) => sum + n * (n - 1), 0);
  return collisions / (symbols.length * (symbols.length - 1));
}

/** @param {number[]} key @param {string} cipher @param {number} length @returns {Buffer} */
function pad(key, cipher, length) {
  const encrypted = createCipheriv(cipher, Buffer.from(key), Buffer.alloc(16));
  return Buffer.concat([encrypted.update(Buffer.alloc(length)), encrypted.final()]);
}

/** @param {number[][]} pages @param {Buffer} stream @param {number} sign @returns {number[]} */
function unmask(pages, stream, sign) {
  const plain = [];
  for (const page of pages) {
    for (let i = 0; i < page.length; i++) plain.push((page[i] + sign * (stream[i] % MOD) + MOD) % MOD);
  }
  return plain;
}

/** @param {string} text @returns {number[]} */
function englishGp(text) {
  const single = {A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,Y:26,Z:15};
  const pairs = {TH:2,NG:21,EO:12,OE:22,AE:25,IA:27,EA:28};
  const letters = text.toUpperCase().match(/[A-Z]+/g) || [];
  const out = [];
  for (const word of letters) {
    for (let i = 0; i < word.length; i++) {
      const combined = pairs[word.slice(i, i + 2)];
      if (combined !== undefined) { out.push(combined); i++; }
      else out.push(single[word[i]]);
    }
  }
  return out;
}

/** @returns {void} */
function main() {
  assert.ok(getCiphers().includes('aes-256-ctr'));
  assert.ok(getCiphers().includes('chacha20'));
  const grid = JSON.parse(fs.readFileSync(GRID_FILE, 'utf8'));
  const pages = JSON.parse(fs.readFileSync(LP2_FILE, 'utf8'));
  const rows = grid.byte_rows;
  const allPages = pages.pages.filter(page => page.page <= 55 && page.runic_count > 0);
  assert.equal(rows.length, 32);
  assert.ok(rows.every(row => row.length === 8 && row.every(x => Number.isInteger(x) && x >= 0 && x <= 255)));
  assert.equal(allPages.length, 55);
  assert.equal(allPages.reduce((s, p) => s + p.indices.length, 0), 12956);
  assert.equal(ALPHABET.length, 29);
  const allIndices = allPages.map(page => page.indices);
  const maxPage = Math.max(...allIndices.map(a => a.length));
  const source = englishGp(fs.readFileSync(ENGLISH_FILE, 'utf8'));
  assert.ok(source.length >= 12956, 'Need enough GP English for positive control');
  const positivePages = [];
  let cursor = 0;
  for (const p of allIndices) { positivePages.push(source.slice(cursor, cursor + p.length)); cursor += p.length; }
  const fields = [gf256(0x11b), gf256(0x11d), prime257()];
  const results = [];
  const diagnostics = [];
  const actualRaw = allIndices.flat();
  for (const field of fields) {
    const counts = [3,4,5,6].map(deg => ({degree:deg, passingRows:rows.filter(row => isDegreeAtMost(row, deg, field)).length}));
    diagnostics.push({field:field.id,counts});
    for (const reverse of [false,true]) {
      const secret = recover(rows, field, reverse);
      if (secret.some(v => v === 256)) continue;
      assert.ok(secret.every(v => v >= 0 && v <= 255));
      for (const cipher of ['aes-256-ctr','chacha20']) {
        const stream = pad(secret,cipher,maxPage);
        for (const sign of [-1,1]) {
          const plain = unmask(allIndices, stream, sign);
          const plantedCipher = positivePages.map(p => p.map((v, i) => (v - sign * (stream[i] % MOD) + 2*MOD) % MOD));
          const restored = unmask(plantedCipher,stream,sign);
          assert.deepEqual(restored, source.slice(0,12956),'Exact planted GP-source inverse failed');
          results.push({field:field.id,reversed:reverse,cipher,sign,key:Buffer.from(secret).toString('hex'),realIoc:ioc(plain),plantedIoc:ioc(restored),head:plain.slice(0,35).map(v => [...ALPHABET][v]).join('')});
        }
      }
    }
  }
  // Two source-defined 8-of-8 additive secret-share reconstructions.
  // Both are unconstrained by random shares, just like a degree-7 interpolant.
  const simpleShares = [
    { id: 'XOR-of-eight-columns', key: rows.map(row => row.reduce((a, b) => a ^ b, 0)) },
    { id: 'SUM256-of-eight-columns', key: rows.map(row => row.reduce((a, b) => (a + b) & 255, 0)) },
  ];
  for (const share of simpleShares) {
    for (const cipher of ['aes-256-ctr', 'chacha20']) {
      const stream = pad(share.key, cipher, maxPage);
      for (const sign of [-1, 1]) {
        const plain = unmask(allIndices, stream, sign);
        const plantedCipher = positivePages.map(p => p.map((v, i) => (v - sign * (stream[i] % MOD) + 2 * MOD) % MOD));
        const restored = unmask(plantedCipher, stream, sign);
        assert.deepEqual(restored, source.slice(0, 12956), 'Additive-share planted GP source inverse failed');
        results.push({field:share.id,reversed:false,cipher,sign,
          key:Buffer.from(share.key).toString('hex'),realIoc:ioc(plain),
          plantedIoc:ioc(restored),head:plain.slice(0,35).map(v => [...ALPHABET][v]).join('')});
      }
    }
  }
  const best = [...results].sort((a,b) => b.realIoc - a.realIoc);
  const sourceIoc = ioc(source.slice(0,12956));
  assert.ok(sourceIoc > 0.04);
  assert.ok(best.length > 0);
  console.log(JSON.stringify({grid_sha256:createHash('sha256').update(Buffer.from(rows.flat())).digest('hex'),
    pageCount:allPages.length,runeCount:12956,originalIoc:ioc(actualRaw),referenceIoc:sourceIoc,
    polynomialConsistency:diagnostics,candidateCount:results.length,ranked:best,
    verdict:'Candidate keys are degree-7 tautological interpolants; this finite family does not establish plaintext.'},null,2));
}
if (require.main === module) main();
module.exports = {gf256,prime257,interpolate,isDegreeAtMost,recover,englishGp,pad,unmask,ioc};
