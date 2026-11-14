'use strict';

/**
 * Director #916: independent non-alphabet first consumer for the period-observed
 * ABAAB five-site floral selector. CJS, Node 22, original local corpus.
 *
 * Frozen source hypothesis: only A-site pickup, only B-site pickup, or reversible
 * A-then-B lane packing. The two natural clocks are the original physical page
 * boundary and the uninterrupted p40-p48 floral-chapter start. No secret key,
 * rune relabeling, rotation search, custom transposition or adjusted word breaks.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
/** @param {string} file */
function read(file) { return fs.readFileSync(path.join(ROOT, file), 'utf8'); }
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter(p => p.page >= 40 && p.page <= 48);
const pattern = 'ABAAB';
const E = 18, NRUNE = 29;
assert.equal(pages.length, 9);
assert.equal(pages.reduce((s, p) => s + p.indices.length, 0), 2408);
assert.equal(corpus.translit[E], 'E');

/** @param {number[]} x */
function stats(x) {
  const counts = new Uint32Array(NRUNE);
  for (const v of x) {
    assert(Number.isInteger(v) && v >= 0 && v < NRUNE);
    counts[v]++;
  }
  const n = x.length;
  return {n, literalE: counts[E], scaledIoC: NRUNE *
    counts.reduce((a, c) => a + c * (c - 1), 0) / (n * (n - 1)),
    first80: x.slice(0, 80).map(v => corpus.translit[v]).join('')};
}

/** @param {boolean} resetAtPage */
function addresses(resetAtPage) {
  let streamAt = 0;
  /** @type {{A:number[],B:number[]}} */
  const at = {A: [], B: []};
  const all = [];
  for (const page of pages) {
    if (resetAtPage) streamAt = 0;
    for (const rune of page.indices) {
      at[pattern[streamAt % 5]].push(all.length);
      all.push(rune);
      streamAt++;
    }
  }
  assert.equal(all.length, 2408);
  return {all, at};
}

/** @param {number[]} orig @param {{A:number[],B:number[]}} at */
function pick(orig, at) {
  return {
    A: at.A.map(i => orig[i]),
    B: at.B.map(i => orig[i])
  };
}

/** @param {number[]} a @param {number[]} b @param {{A:number[],B:number[]}} at */
function reassemble(a, b, at) {
  assert.equal(a.length, at.A.length);
  assert.equal(b.length, at.B.length);
  const out = new Array(a.length + b.length);
  for (let i = 0; i < a.length; i++) out[at.A[i]] = a[i];
  for (let i = 0; i < b.length; i++) out[at.B[i]] = b[i];
  return out;
}

const digraph = {TH:2, NG:21, EO:12, OE:22, AE:25, IA:27, EA:28};
const letters = {A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,Y:26,Z:15};
/** @param {string} value @returns {number[]} */
function gp(value) {
  const s = value.toUpperCase().replace(/[^A-Z]/g, '');
  const out = [];
  for (let i = 0; i < s.length; i++) {
    const d = digraph[s.slice(i, i + 2)];
    if (d !== undefined) { out.push(d); i++; }
    else { assert(letters[s[i]] !== undefined); out.push(letters[s[i]]); }
  }
  return out;
}

/** @param {number[]} x @param {number} width */
function minEInWindows(x, width) {
  let cnt = 0;
  for (let i = 0; i < width; i++) cnt += Number(x[i] === E);
  let min = cnt, max = cnt;
  for (let i = width; i < x.length; i++) {
    cnt += Number(x[i] === E) - Number(x[i - width] === E);
    if (cnt < min) min = cnt;
    if (cnt > max) max = cnt;
  }
  return {min, max, windows: x.length - width + 1};
}

const refs = [
  {name:'Gibran The Prophet', file:'resources/control/gibran_prophet_58585.txt'},
  {name:'Shakespeare', file:'resources/control/shakespeare_first300k.txt'}
].map(z => ({name:z.name, gp:gp(read(z.file))}));

const out = {};
for (const [name, pageReset] of [['per_page', true], ['continuous', false]]) {
  const {all, at} = addresses(pageReset);
  const {A, B} = pick(all, at);
  // This is the complete reversible two-lane pickup, with no value-changing key.
  assert.deepEqual(reassemble(A, B, at), all);
  assert.deepEqual(reassemble(B, A, {A:at.B, B:at.A}), all);
  const expected = pageReset ? [1447, 54, 961, 35] : [1445, 46, 963, 43];
  assert.deepEqual([A.length, stats(A).literalE, B.length, stats(B).literalE], expected);
  const native = refs.map(ref => ({
    name: ref.name,
    A: minEInWindows(ref.gp, A.length),
    B: minEInWindows(ref.gp, B.length),
    full: minEInWindows(ref.gp, all.length)
  }));
  // A source-native GP prose lane is recognized when genuinely inserted in the
  // exact same original position mask (the discarded lane remains arbitrary).
  const planted = refPick => {
    const plantA = refPick.gp.slice(0, A.length);
    const plantB = refPick.gp.slice(A.length, A.length + B.length);
    const enc = reassemble(plantA, plantB, at);
    const rec = pick(enc, at);
    assert.deepEqual(rec.A, plantA);
    assert.deepEqual(rec.B, plantB);
    return {A_E:stats(plantA).literalE, B_E:stats(plantB).literalE,
      exactRerecovery:rec.A.length + rec.B.length};
  };
  out[name] = {
    A:stats(A), B:stats(B), A_then_B:stats(A.concat(B)),
    nativeFullAndLaneEWindowBounds:native,
    controls:refs.map(z => ({name:z.name,...planted(z)}))
  };
  for (const src of native) {
    assert(stats(A).literalE < src.A.min);
    assert(stats(B).literalE < src.B.min);
    assert(stats(all).literalE < src.full.min);
  }
}

console.log(JSON.stringify({status:'PASS', model:'source-period ABAAB mask, no value-changing operation',
  originalPages:'physical p40-p48', originalTotalRunes:2408,
  result:out, conclusion:'neither original GP29 A/B pickup lane nor reversible A-then-B packing reads as source-native GP English. Reversible reorder preserves the original globally nearuniform runes; no second creator-chosen value-changing operation or key is in the source.'}, null, 2));
