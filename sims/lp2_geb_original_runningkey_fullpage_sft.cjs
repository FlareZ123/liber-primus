'use strict';

/**
 * Source-selected, whole-page LP2 key test: literal contiguous 2014 GEB book
 * text as either-polarity additive GP29 running key, all possible offsets.
 * Windows Node.js 22 SFT, read-only; GEB source retrieved at runtime and not
 * redistributed. Scores full original p0 and prints p1 continuation holdouts.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const p0 = corpus.pages.find(p => p.page === 0).indices;
const p1 = corpus.pages.find(p => p.page === 1).indices;
assert.equal(p0.length, 262);
assert.equal(p1.length, 266);
assert.deepEqual(p0.slice(0, 13), [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);

const url = 'https://raw.githubusercontent.com/neuroretransmit/cicada/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/007-fifth-onion/eternal-golden-braid.txt';
const GP = new Map(corpus.translit.map((v, i) => [v, i]));
const pairs = new Set(['TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA']);

/** @param {string} link @returns {Promise<string>} */
function fetchText(link) {
  return new Promise((resolve, reject) => {
    https.get(link, response => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error('Pinned GEB source HTTP status ' + response.statusCode));
        return;
      }
      let value = '';
      response.setEncoding('utf8');
      response.on('data', part => { value += part; });
      response.on('end', () => resolve(value));
      response.on('error', reject);
    }).on('error', reject);
  });
}

/** @param {string} input @param {boolean} splitNg @returns {Uint8Array} */
function tokenize(input, splitNg) {
  const letters = input.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/Q/g, 'C').replace(/[^A-Z]/g, '');
  const out = [];
  for (let i = 0; i < letters.length;) {
    const two = letters.slice(i, i + 2);
    if (pairs.has(two) && (two !== 'NG' || !splitNg)) {
      out.push(GP.get(two));
      i += 2;
    } else {
      out.push(GP.get(letters[i]));
      i++;
    }
  }
  assert.ok(out.every(v => Number.isInteger(v) && v >= 0 && v < 29));
  return Uint8Array.from(out);
}

/** @param {ArrayLike<number>} ciphertext @param {Uint8Array} source @param {number} start @param {number} sign @returns {number[]} */
function decode(ciphertext, source, start, sign) {
  const out = [];
  for (let i = 0; i < ciphertext.length; i++) {
    let v = ciphertext[i] + sign * source[start + i];
    if (v < 0) v += 29;
    else if (v >= 29) v -= 29;
    out.push(v);
  }
  return out;
}

/** @param {ArrayLike<number>} r @returns {number} */
function ioc(r) {
  const f = new Uint32Array(29);
  for (let i = 0; i < r.length; i++) f[r[i]]++;
  let acc = 0;
  for (const n of f) acc += n * (n - 1);
  return acc / (r.length * (r.length - 1));
}

/** @param {ArrayLike<number>} r @returns {string} */
function display(r) {
  return Array.from(r, i => corpus.translit[i]).join(' ');
}

/**
 * Exact full-length candidate scoring, no crib or language-dependent offset
 * constraint. Includes all possible GEB byte-normalized GP29 start offsets.
 * @param {Uint8Array} key
 * @param {ArrayLike<number>} cipher
 * @param {number} sign
 * @param {Float64Array} logp
 * @returns {{off:number,score:number}[]}
 */
function scan(key, cipher, sign, logp) {
  const top = [];
  const maxOff = key.length - cipher.length;
  let floor = -Infinity;
  for (let off = 0; off <= maxOff; off++) {
    let score = 0;
    for (let i = 0; i < cipher.length; i++) {
      let v = cipher[i] + sign * key[off + i];
      if (v < 0) v += 29;
      else if (v >= 29) v -= 29;
      score += logp[v];
    }
    if (score <= floor) continue;
    top.push({ off, score: score / cipher.length });
    top.sort((a, b) => b.score - a.score);
    if (top.length > 5) top.pop();
    if (top.length === 5) floor = top[4].score * cipher.length;
  }
  return top;
}

/** @param {ArrayLike<number>} values @param {Float64Array} logp @returns {number} */
function scoreNative(values, logp) {
  let out = 0;
  for (let i = 0; i < values.length; i++) out += logp[values[i]];
  return out / values.length;
}

async function main() {
  const original = await fetchText(url);
  assert.equal(original.length, 1951562);
  assert.equal(original.indexOf('TORTOISE: Your argument is persuasive'), 87816);
  const train = tokenize(fs.readFileSync(path.join(ROOT, 'resources', 'control', 'shakespeare_first300k.txt'), 'utf8'), false);
  const f = new Float64Array(29).fill(1);
  for (const v of train) f[v]++;
  const logp = Float64Array.from(f, n => Math.log(n / (train.length + 29)));
  const p57 = corpus.pages.find(p => p.page === 57).indices;
  const clearGibran = fs.readFileSync(path.join(ROOT, 'resources', 'control', 'gibran_prophet_58585.txt'), 'utf8');
  const start = clearGibran.indexOf('Almustafa');
  assert.ok(start >= 0);
  const control = tokenize(clearGibran.slice(start, start + 800), false).slice(0, p0.length);
  assert.equal(control.length, p0.length);
  console.log('Control native English p57 average logP:', scoreNative(p57, logp));
  console.log('Independent Gibran 262-rune average logP:', scoreNative(control, logp));
  console.log('Original ciphertext p0 average logP:', scoreNative(p0, logp));

  for (const splitNg of [false, true]) {
    const key = tokenize(original, splitNg);
    if (!splitNg) assert.equal(key.length, 1394375);
    const anchor = 87816;
    const plant = Array.from(control, (p, i) => (p + key[anchor + i]) % 29);
    assert.deepEqual(decode(plant, key, anchor, -1), Array.from(control));
    // A local source-offset search must recover this independently planted key.
    const neighbors = [];
    for (let off = anchor - 50; off <= anchor + 50; off++) {
      neighbors.push({ off, score: scoreNative(decode(plant, key, off, -1), logp) });
    }
    neighbors.sort((a, b) => b.score - a.score);
    assert.equal(neighbors[0].off, anchor);
    console.log('Plant PASS at historical source GP offset', anchor, 'splitNg', splitNg);

    for (const sign of [-1, 1]) {
      const top = scan(key, p0, sign, logp);
      const answer = top.map(({ off, score }) => {
        const runes = decode(p0, key, off, sign);
        const holdout = decode(p1, key, off + p0.length, sign);
        return { off, avgLogP: score, fullP0IoC: ioc(runes),
          holdoutP1AvgLogP: scoreNative(holdout, logp),
          originalP0PrefixGP: display(runes.slice(0, 50)),
          originalP1PrefixGP: display(holdout.slice(0, 30)) };
      });
      console.log(JSON.stringify({
        GEBsourceGP: key.length, splitNg, sign, candidateOffsets: key.length - p0.length + 1,
        fullOriginalP0Runes: p0.length, sourceSelectedKey: 'contiguous GEB GP29',
        originalTop5: answer
      }));
    }
  }
  console.log('PASS: both spellings, both signs, all historical source offsets, full original p0 and p1 untouched holdout; no candidate is declared plaintext without coherent literal reading.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
