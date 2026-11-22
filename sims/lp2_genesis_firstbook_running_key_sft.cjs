'use strict';

/**
 * A motivated, finite running-key test from the title LIBER PRIMUS:
 * "first book" -> KJV Genesis. Test the original entire Genesis as the
 * single continuous Vigenere running key, all starting rune offsets and two
 * additive signs on untouched original LP2 p0 black body and pp1-2.
 *
 * No inferred plaintext is fitted, and no other book is searched.
 * External verse text is pinned by its exact Git blob SHA-1. Node22 CJS.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.join(__dirname, '..');
const gp = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const url = 'https://raw.githubusercontent.com/aruljohn/Bible-kjv/master/Genesis.json';
const expectedBlob = '99266086fc538315168650256b5edf765970d2ad';
const tokens = gp.translit.map((str, index) => ({str, index}))
  .sort((a, b) => b.str.length - a.str.length);

/** @param {string} original */
function encodeNativeGP(original) {
  const out = [];
  const clean = original.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) {out.push(21); i += 3; continue;}
      if (word.startsWith('IO', i)) {out.push(27); i += 2; continue;}
      const token = tokens.find(t => word.startsWith(t.str, i));
      assert(token, 'source-native English-to-GP orthography incomplete');
      out.push(token.index);
      i += token.str.length;
    }
  }
  return Uint8Array.from(out);
}

/** @param {Uint8Array|number[]} a */
function ioc(a) {
  const counts = new Int32Array(29);
  for (const rune of a) counts[rune]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}

/**
 * @param {number[]} ciphertext
 * @param {Uint8Array} key
 * @param {-1|1} sign
 */
function scan(ciphertext, key, sign) {
  const counts = new Int32Array(29);
  const n = ciphertext.length;
  const denom = n * (n - 1);
  const top = [];
  let above045 = 0;
  const last = key.length - n;
  for (let start = 0; start <= last; start++) {
    counts.fill(0);
    for (let i = 0; i < n; i++) {
      const v = sign === -1 ? (ciphertext[i] + 29 - key[start + i]) % 29
        : (ciphertext[i] + key[start + i]) % 29;
      counts[v]++;
    }
    let score = 0;
    for (let i = 0; i < 29; i++) score += counts[i] * (counts[i] - 1);
    score /= denom;
    if (score >= 0.045) above045++;
    if (top.length < 3 || score > top[top.length - 1].ioc) {
      top.push({offset: start, ioc: score});
      top.sort((a, b) => b.ioc - a.ioc);
      top.length = Math.min(top.length, 3);
    }
  }
  return {sign, trials: last + 1, max_ioc: top[0].ioc, count_ioc_at_least_045: above045, best_offsets: top};
}

async function main() {
  const response = await fetch(url, {headers: {'User-Agent': 'Liber-Primus-research'}});
  assert(response.ok, 'KJV Genesis pinned public domain external input retrieval');
  const raw = await response.text();
  const bytes = Buffer.from(raw, 'utf8');
  const gitBlob = crypto.createHash('sha1')
    .update(Buffer.from('blob ' + bytes.length + '\0')).update(bytes).digest('hex');
  assert.equal(gitBlob, expectedBlob, 'do not silently change the Genesis text source');
  const json = JSON.parse(raw);
  assert.equal(json.book, 'Genesis');
  assert.equal(json.chapters.length, 50);
  const text = json.chapters.flatMap(ch => ch.verses.map(verse => verse.text)).join(' ');
  const K = encodeNativeGP(text);
  assert.equal(K.length, 142678);
  assert(Math.abs(ioc(K) - 0.0633604446548159) < 1e-12);
  const p0black = gp.pages[0].indices.slice(13);
  const p1 = gp.pages[1].indices;
  const p2 = gp.pages[2].indices;
  assert.deepEqual([p0black.length, p1.length, p2.length], [249, 266, 201]);
  const combined = p0black.concat(p1, p2);
  assert.equal(combined.length, 716);
  const native = gp.pages[57].indices;
  assert.equal(native.length, 95);
  // Synthetic source-shaped positive: one independent encrypted key segment
  // reverts 716/716 runes, giving native author-like statistical control.
  const plant = Array.from({length: 716}, (_, i) => native[i % native.length]);
  const shift = 3301;
  const plantCipher = plant.map((x, i) => (x + K[shift + i]) % 29);
  const recovered = plantCipher.map((x, i) => (x + 29 - K[shift + i]) % 29);
  assert.deepEqual(recovered, plant);
  assert(ioc(recovered) > 0.06);
  const targets = [
    ['p0 black plus p1/p2 continuous', combined],
    ['p0 black only', p0black],
    ['p1 only', p1],
    ['p2 only', p2]
  ].map(([name, ciphertext]) => {
    const signed = [scan(ciphertext, K, -1), scan(ciphertext, K, 1)];
    return {name, length: ciphertext.length, original_ioc: ioc(ciphertext), signed};
  });
  assert(targets[0].signed.every(x => x.max_ioc < 0.04));
  assert(targets.slice(1).every(x => x.signed.every(v => v.max_ioc < 0.045)));
  console.log(JSON.stringify({
    hypothesis: 'KJV Genesis full-book GP29 Vigenere running key, all 142k starts',
    key_external_source: url,
    github_blob_sha1: expectedBlob,
    key_gp29_length: K.length,
    key_ioc: ioc(K),
    original_ciphertext_authenticated_plaintext: false,
    positive_solved_native_716_runes: 'PASS',
    original_targets: targets,
    decision: 'No simple continuous additive Genesis running-key plaintext recovered'
  }, null, 2));
}
main().catch(e => { console.error(e); process.exitCode = 1; });
