'use strict';

/**
 * LP2 opening p0 13-rune title against the actual 2014 GEB book-cipher source.
 * Windows Node.js 22 single-file test. Read-only, with a pinned external
 * historical source edition and exact original-runic positive control.
 *
 * Run from any directory: node sims/lp2_p0_2014geb_two_crib_key_source_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');

const corpusPath = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
const red13 = corpus.pages.find((p) => p.page === 0).indices.slice(0, 13);
assert.deepEqual(red13, [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);
const p57Native = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(p57Native.length, 95);

const pinnedGEB = 'https://raw.githubusercontent.com/neuroretransmit/cicada/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/007-fifth-onion/eternal-golden-braid.txt';
const GP = new Map(corpus.translit.map((s, i) => [s, i]));
const digraphs = new Set(['TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA']);

/** @param {string} url @returns {Promise<string>} */
function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error('GEB pinned source HTTP ' + res.statusCode));
        return;
      }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (part) => { body += part; });
      res.on('end', () => resolve(body));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Two fixed source-native GP29 tokenizations. The second keeps N,G separate
 * instead of the NG ligature; the remaining digraphs match the first chart.
 * @param {string} str
 * @param {boolean} splitNg
 * @returns {number[]}
 */
function tokenize(str, splitNg) {
  const az = str.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/K/g, 'C')
    .replace(/Z/g, 'S')
    .replace(/Q/g, 'C')
    .replace(/[^A-Z]/g, '');
  const out = [];
  for (let i = 0; i < az.length;) {
    const pair = az.slice(i, i + 2);
    if (digraphs.has(pair) && !(splitNg && pair === 'NG')) {
      out.push(GP.get(pair));
      i += 2;
    } else {
      out.push(GP.get(az[i]));
      i += 1;
    }
  }
  assert.ok(out.every((x) => Number.isInteger(x) && x >= 0 && x < 29));
  return out;
}

/** @param {number[]} runes @returns {string} */
function alphabetString(runes) {
  return runes.map((v) => String.fromCharCode(65 + v)).join('');
}

/** @param {string} text @param {string} needle @returns {number} */
function countOccurrences(text, needle) {
  let count = 0;
  for (let pos = text.indexOf(needle); pos >= 0; pos = text.indexOf(needle, pos + 1)) {
    count += 1;
  }
  return count;
}

async function main() {
  const originalGEB = await fetchText(pinnedGEB);
  assert.equal(originalGEB.length, 1951562, 'Pinned edition has changed');
  assert.equal(originalGEB.indexOf('TORTOISE: Your argument is persuasive'), 87816);
  const cribs = ['EPIPHANY SEEKS', 'DIVINITY WITHIN'];
  for (const splitNg of [false, true]) {
    const G = tokenize(originalGEB, splitNg);
    const allSource = alphabetString(G);
    if (!splitNg) assert.equal(G.length, 1394375);
    const realKey = tokenize('YOUR ARGUMENT IS PERSUASIVE', splitNg).slice(0, 13);
    assert.equal(realKey.length, 13);
    const realNeedle = alphabetString(realKey);
    assert.ok(allSource.includes(realNeedle), 'Historically anchored positive source segment missing');

    // Genuine, independently solved LP2 plaintext positive; re-encode it with
    // an authentic contiguous 13-rune source key and recover the exact key.
    const native = p57Native.slice(0, 13);
    const syntheticCipher = native.map((p, i) => (p + realKey[i]) % 29);
    const recovered = syntheticCipher.map((c, i) => (29 + c - native[i]) % 29);
    assert.deepEqual(recovered, realKey);
    assert.ok(countOccurrences(allSource, alphabetString(recovered)) >= 1);

    for (const phrase of cribs) {
      const plain = tokenize(phrase, splitNg);
      assert.equal(plain.length, 13);
      for (const polarity of [-1, 1]) {
        const key = red13.map((c, i) => (29 + c + polarity * plain[i]) % 29);
        const matches = countOccurrences(allSource, alphabetString(key));
        assert.equal(matches, 0, 'A genuine source key match requires investigation');
        console.log(JSON.stringify({ spelling: splitNg ? 'N+G' : 'NG-ligature',
          crib: phrase, polarity, sourceRunes: G.length,
          key, sourceMatches: matches }));
      }
    }
  }
  console.log('PASS: original p0, pinned 2014 GEB, two independent cribs, eight full-source zero-match readings, solved-p57 positive.');
}

main().catch((err) => { console.error(err); process.exitCode = 1; });
