'use strict';

/**
 * Source-pinned original 2014 GEB book-code witness as a GP29 running key.
 * Two original, source-selected LP2 chapter entrances, without fitting a
 * password, key period, alphabet or page-local phase.
 *
 * The copyrighted external book text is streamed into CI, not vendored.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const https = require('node:https');
const crypto = require('node:crypto');

const URL = 'https://raw.githubusercontent.com/kylevedder/JChains/f035cd2e9ac30de505915acb374fe119ecf5c57a/inputs/GEB.txt';
const GIT_SHA1 = '03c403fa3db18dd9ee966e555e4978036b5f6b56';
const GEB_BYTES = 1953906;
const MOD = 29;
const PLANT_OFFSET = 12345;

/** @param {string} url @returns {Promise<Buffer>} */
function retrieve(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 35000 }, response => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error('Frozen source HTTP status ' + response.statusCode));
        return;
      }
      /** @type {Buffer[]} */
      const parts = [];
      response.on('data', chunk => parts.push(chunk));
      response.on('end', () => resolve(Buffer.concat(parts)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Convert the literal source to the same published greedy GP29 transliteration
 * used by the canonical LP2 corpus and previous book-source key screens.
 * @param {string} source
 * @param {{translit:string[]}} corpus
 * @returns {Uint8Array}
 */
function encode(source, corpus) {
  const names = corpus.translit.map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length);
  const text = source.toUpperCase()
    .replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S');
  /** @type {number[]} */
  const out = [];
  for (let i = 0; i < text.length;) {
    if (text[i] < 'A' || text[i] > 'Z') { i++; continue; }
    let matched = false;
    for (const t of names) {
      if (text.startsWith(t.token, i)) {
        out.push(t.index);
        i += t.token.length;
        matched = true;
        break;
      }
    }
    assert(matched, 'Unsupported source at character ' + i);
  }
  return Uint8Array.from(out);
}

/**
 * @param {Uint8Array|number[]} ct
 * @param {Uint8Array} key
 * @param {number} offset
 * @param {number} sign
 * @param {Float64Array} logp
 * @param {number} first
 * @param {number} last
 * @returns {number}
 */
function score(ct, key, offset, sign, logp, first, last) {
  let sum = 0;
  for (let i = first; i < last; i++) {
    const x = ct[i] + sign * key[offset + i];
    sum += logp[(x + MOD) % MOD];
  }
  return sum / (last - first);
}

/**
 * Keep only the top candidates from a full lawful alignment scan.
 * @param {Uint8Array} ct
 * @param {Uint8Array} key
 * @param {number} sign
 * @param {Float64Array} logp
 * @param {number} trainLength
 * @param {number} limit
 * @returns {Array<{offset:number,train:number,holdout:number,full:number}>}
 */
function scan(ct, key, sign, logp, trainLength, limit=10) {
  const usable = key.length - ct.length + 1;
  assert(usable > 0);
  /** @type {Array<{offset:number,train:number}>} */
  const leaders = [];
  for (let offset = 0; offset < usable; offset++) {
    const s = score(ct, key, offset, sign, logp, 0, trainLength);
    if (leaders.length === limit && s <= leaders[leaders.length - 1].train) continue;
    let insert = leaders.findIndex(x => x.train < s);
    if (insert < 0) insert = leaders.length;
    leaders.splice(insert, 0, { offset, train: s });
    if (leaders.length > limit) leaders.pop();
  }
  return leaders.map(x => {
    const holdout = score(ct, key, x.offset, sign, logp, trainLength, ct.length);
    return {
      ...x, holdout,
      full: (trainLength * x.train + (ct.length - trainLength) * holdout) / ct.length
    };
  });
}

/**
 * @param {Uint8Array} ct
 * @param {Uint8Array} key
 * @param {number} offset
 * @returns {Uint8Array}
 */
function encrypt(ct, key, offset) {
  return Uint8Array.from(ct, (value, i) => (value + key[offset + i]) % MOD);
}

/** @returns {Promise<void>} */
async function main() {
  const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
  const shakespeare = fs.readFileSync('resources/control/shakespeare_first300k.txt', 'utf8');
  const raw = await retrieve(URL);
  assert.equal(raw.length, GEB_BYTES, 'Frozen full book source byte length');
  const sha = crypto.createHash('sha1').update(Buffer.concat([
    Buffer.from('blob ' + raw.length + '\0'), raw
  ])).digest('hex');
  assert.equal(sha, GIT_SHA1, 'Frozen original source Git blob SHA1');
  console.log('PINNED SOURCE: complete GEB witness', raw.length, 'bytes; Git blob', sha);
  const key = encode(raw.toString('utf8'), corpus);
  assert(key.length > 200000);
  console.log('PINNED SOURCE: GP29 key', key.length, 'symbols');

  const refTrain = encode(shakespeare.slice(0, 240000), corpus);
  const refHoldout = encode(shakespeare.slice(240000), corpus);
  const counts = Array(MOD).fill(1);
  for (const n of refTrain) counts[n]++;
  const denom = counts.reduce((sum, x) => sum + x, 0);
  const logp = Float64Array.from(counts, n => Math.log(n / denom));
  const nativeMean = score(refHoldout, Uint8Array.from({length:refHoldout.length}), 0, -1, logp, 0, refHoldout.length);
  assert(refHoldout.length > 3000);

  const cases = [
    { id: 'original visual chapter p0–2', start: 0, end: 2, train: 262 },
    { id: 'original visually rubric-marked section p40–53', start: 40, end: 53, train: 231 }
  ];
  for (const task of cases) {
    const original = Uint8Array.from(corpus.pages.slice(task.start, task.end + 1)
      .flatMap(p => p.indices));
    assert(original.length >= task.train + 200);
    const plaintextPlant = refHoldout.slice(111, 111 + original.length);
    assert.equal(plaintextPlant.length, original.length);
    const cipherPlant = encrypt(plaintextPlant, key, PLANT_OFFSET);
    const plantWinners = scan(cipherPlant, key, -1, logp, task.train);
    assert.equal(plantWinners[0].offset, PLANT_OFFSET,
      'Actual source-key plant must rank first using training excerpt only');
    assert(plantWinners[0].holdout > nativeMean - 0.2);
    console.log('POSITIVE', task.id, 'original runes', original.length,
      'source offset recovered', plantWinners[0].offset,
      'plant train', plantWinners[0].train.toFixed(6),
      'plant holdout', plantWinners[0].holdout.toFixed(6));
    const ranked = [-1, 1].map(sign => ({
      sign,
      top: scan(original, key, sign, logp, task.train),
    }));
    console.log('ORIGINAL', JSON.stringify({
      target: task.id, originalRunes: original.length, sourceKeyRunes: key.length,
      legalOffsets: key.length - original.length + 1,
      source: URL, historicalNote: 'Stage08 GEB source is creator-selected as book-code; reusing it as LP2 key is a hypothesis',
      nativeControlMean: nativeMean, ranked
    }));
    const winner = ranked.reduce((a,b) => b.top[0].train > a.top[0].train ? b : a);
    assert(winner.top[0].holdout < nativeMean - 0.2,
      'Unexpected holdout signal: investigate rather than silently discard');
  }
  console.log('PASS: complete original GEB witness contains no direct GP29 running-key alignment giving held-out native GP-English for either selected original chapter');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
