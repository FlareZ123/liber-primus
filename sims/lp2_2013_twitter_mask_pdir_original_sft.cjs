'use strict';

/**
 * Test a first-party 2013 Twitter/761-MP3 XOR key stream under the distinct
 * 2016 signed-message wordwise pointer-direction hypothesis (#1329).
 * Exact historical operand, first byte, previous-word GP-prime parity.
 * No phase fitting, candidate tuning, or arbitrary new keystream library.
 *
 * Node.js 22, from repo root: node sims/lp2_2013_twitter_mask_pdir_original_sft.cjs
 * Source-native solved-p57 control is enciphered independently of the decoder.
 * Two original 300-rune windows are independently decoded.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const https = require('node:https');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const source = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const sections = source.split(/^%\s*$/m);
assert.equal(sections.length, 57); // p50 is numerical-only; no source rune section
const Q = 29;
const mod = (x, k) => (x % k + k) % k;
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const group = new RegExp('[' + corpus.runes.join('') + ']+', 'gu');
const maskFile = 'https://raw.githubusercontent.com/neuroretransmit/cicada/' +
  'ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter/' +
  '560.13%5E761.mp3.bin';
const maskGitSha = '2b4d661ab1b56c64337dd31cb0c27f7b13e107ff';

/** @param {string} url @returns {Promise<Buffer>} */
function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'liber-primus-source-gate' } }, res => {
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error('historical source HTTP ' + res.statusCode));
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/** @param {Buffer} bytes @returns {string} */
function gitSha(bytes) {
  return crypto.createHash('sha1')
    .update(Buffer.from('blob ' + bytes.length + '\0', 'ascii'))
    .update(bytes).digest('hex');
}

/** @param {number} p @returns {{cipher:number[],lens:number[]}} */
function windowAt(p) {
  const raw = sections.slice(p, p + 3).join('').replace(/[\/\n&$§%]/g, '');
  const words = [...raw.matchAll(group)].map(m =>
    [...m[0]].map(r => runeIndex.get(r)));
  const flat = words.flat();
  assert(flat.length >= 300, 'Original window must have at least 300 runes');
  const original = corpus.pages.slice(p, p + 3).flatMap(x => x.indices);
  assert.deepEqual(flat, original, 'Original unmodified physical word stream');
  const cipher = flat.slice(0, 300);
  let left = 300;
  const lens = [];
  for (const word of words) {
    if (!left) break;
    const n = Math.min(left, word.length);
    lens.push(n);
    left -= n;
  }
  assert.equal(left, 0);
  assert.equal(lens.reduce((a, b) => a + b, 0), 300);
  return {cipher, lens};
}

/**
 * The 2016 "numbers are the direction" rule is fixed to PREVIOUS cipher
 * word GP-prime-sum parity. The first direction is forward.
 * @param {number[]} cipher @param {number[]} lens @returns {number[]}
 */
function direction(cipher, lens) {
  const result = [];
  let offset = 0;
  let previous = [];
  for (const n of lens) {
    const d = !previous.length ? 1 :
      (previous.reduce((a, rune) => a + corpus.prime[rune], 0) % 2 ? 1 : -1);
    result.push(...Array(n).fill(d));
    previous = cipher.slice(offset, offset + n);
    offset += n;
  }
  assert.equal(offset, cipher.length);
  return result;
}

/**
 * Native GP29 ciphertext-dependent pointer plan. Convention h=0/1 says
 * whether a backward word steps one extra time before its first rune;
 * m=0, c=0 are fixed and not searched.
 * @param {number[]} cipher @param {number[]} lens
 * @param {number} flip @param {number} h
 */
function plan(cipher, lens, flip, h) {
  const d = direction(cipher, lens).map(x => x * (flip ? -1 : 1));
  const move = Array(cipher.length).fill(0);
  let start = 0;
  for (const n of lens) {
    if (d[start] < 0 && h) move[start] = -1;
    start += n;
  }
  assert.equal(start, cipher.length);
  return {d, move};
}

/**
 * Exact 0,1,2 collision-skips for LAST (model0), one optional coin for
 * model1; stage1 objective is normalized GP29 index of coincidence.
 * All key indices have explicit ring semantics, no fitted start offset.
 * @param {number[]} cipher @param {number[]} lens
 * @param {Uint8Array} key
 * @param {number} flip @param {number} h
 * @param {number} sign @param {number} model
 */
function beamInverse(cipher, lens, key, flip, h, sign, model) {
  const {d, move} = plan(cipher, lens, flip, h);
  let states = [{j:0, s:0, counts:new Uint16Array(Q), plain:[]}];
  for (let i = 0; i < cipher.length; i++) {
    const C = cipher[i], prev = i ? cipher[i - 1] : -1;
    const candidates = new Map();
    for (const st of states) {
      const j = st.j + move[i];
      const K = [0, 1, 2].map(n =>
        mod(sign * key[mod(j + n * d[i], key.length)], Q));
      const offers = [[mod(C - K[0], Q),
        j + (model === 1 && prev === C ? 2 : 1) * d[i]]];
      if (prev >= 0) {
        const p1 = mod(C - K[1], Q), p2 = mod(C - K[2], Q);
        if (model === 0) {
          if (mod(p1 + K[0], Q) === prev) offers.push([p1, j + 2 * d[i]]);
          if (mod(p2 + K[0], Q) === prev &&
            mod(p2 + K[1], Q) === prev) offers.push([p2, j + 3 * d[i]]);
        } else if (mod(p2 + K[0], Q) === prev) {
          offers.push([p2, j + 3 * d[i]]);
        }
      }
      for (const [plain, next] of offers) {
        const score = st.s + 2 * st.counts[plain];
        const old = candidates.get(next);
        if (old && score <= old.s) continue;
        const counts = st.counts.slice();
        counts[plain]++;
        candidates.set(next, {
          j:next, s:score, counts, plain:st.plain.concat(plain)
        });
      }
    }
    states = [...candidates.values()].sort((a, b) => b.s - a.s).slice(0, 32);
    assert(states.length, 'Every word-directed variant must retain a path');
  }
  const best = states[0];
  return {ioc:Q * best.s / (cipher.length * (cipher.length - 1)),
    plain:best.plain, endPointer:best.j};
}

/**
 * Independently encrypt a known p57 native GP plaintext, deriving each
 * next word direction from previously emitted cipher words, not the source
 * page's original direction vector.
 * @param {number[]} plain @param {number[]} lens @param {Uint8Array} key
 * @param {number} flip @param {number} h
 * @param {number} sign @param {number} model
 */
function plant(plain, lens, key, flip, h, sign, model) {
  const cipher = [];
  let j = 0, offset = 0, previous = [], last = -1, skips = 0;
  for (const n of lens) {
    const parity = !previous.length ? 1 :
      (previous.reduce((a, r) => a + corpus.prime[r], 0) % 2 ? 1 : -1);
    const d = parity * (flip ? -1 : 1);
    if (d < 0 && h) j--;
    const word = [];
    for (const p of plain.slice(offset, offset + n)) {
      let y = mod(p + sign * key[mod(j, key.length)], Q);
      j += d;
      if (model === 0) {
        let ntry = 0;
        while (last >= 0 && y === last && ntry < 5) {
          y = mod(p + sign * key[mod(j, key.length)], Q);
          j += d;
          skips++;
          ntry++;
        }
      } else if (last >= 0 && y === last) {
        j += d;
        y = mod(p + sign * key[mod(j, key.length)], Q);
        j += d;
        skips += 2;
      }
      word.push(y);
      cipher.push(y);
      last = y;
    }
    previous = word;
    offset += n;
  }
  assert.equal(cipher.length, plain.length);
  return {cipher, skips};
}

/** @param {number[]} indices @returns {string} */
function roman(indices) {
  return indices.map(v => corpus.translit[v]).join('');
}

(async () => {
  const mask = await download(maskFile);
  assert.equal(mask.length, 4010732);
  assert.equal(gitSha(mask), maskGitSha);
  const key = Uint8Array.from(mask, x => x % Q);
  const sourceP57 = corpus.pages.find(p => p.page === 57).indices;
  assert.equal(sourceP57.length, 95);
  const runs = [windowAt(0), windowAt(40)];
  const plantedPlain = Array.from({length:300}, (_, i) => sourceP57[i % 95]);
  const ranked = [];
  let controls = 0;
  for (const flip of [0, 1]) for (const h of [0, 1])
    for (const sign of [-1, 1]) for (const model of [0, 1]) {
      const config = {flip, h, sign, model};
      const plantResult = plant(plantedPlain, runs[0].lens,
        key, flip, h, sign, model);
      const native = beamInverse(plantResult.cipher, runs[0].lens,
        key, flip, h, sign, model);
      assert(native.ioc >= 1.40,
        'Authenticated GP plant must pass first300 source-language threshold');
      controls++;
      for (let w = 0; w < runs.length; w++) {
        const decoded = beamInverse(runs[w].cipher, runs[w].lens,
          key, flip, h, sign, model);
        ranked.push({window:w === 0 ? 'p0-start' : 'p40-start',
          ...config, ioc:decoded.ioc,
          first120:roman(decoded.plain.slice(0, 120)),
          controlIoC:native.ioc, controlCollisionSteps:plantResult.skips});
      }
    }
  assert.equal(controls, 16);
  assert.equal(ranked.length, 32);
  ranked.sort((a, b) => b.ioc - a.ioc);
  console.log(JSON.stringify({
    source:'2013 original Twitter XOR mask (560.13 XOR AUDIO/761.MP3)',
    historicalSourceGitBlobSha:maskGitSha,
    historicalSourceLength:mask.length,
    firstByteClock:0,
    moduloRule:'historically sourced byte mod29, cyclic wrap for backward words',
    rule:'previous cipher word prime sum parity; first word forward',
    pointerFamily:'m=0 c=0, h0/h1, both signs, two orientations, LAST/coin',
    windows:[{name:'p0-start',runes:300,words:runs[0].lens.length},
      {name:'p40-start',runes:300,words:runs[1].lens.length}],
    independentNativePositiveControls:controls,
    candidateCount:ranked.length,
    originalAtLeast1Point4:ranked.filter(x => x.ioc >= 1.40).length,
    bestByWindow:['p0-start','p40-start'].map(w =>
      ranked.filter(x => x.window === w).slice(0, 3)),
    interpretation:'A reversible source-key hypothesis, never an authored LP2 decoder'
  }, null, 2));
})().catch(e => { console.error(e); process.exitCode = 1; });
