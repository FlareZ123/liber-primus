'use strict';
/**
 * Original LP2 GF(29) four-block, all-secret stationary affine-Hill obstruction.
 * Run with Node.js 22: node sims/lp2_final_fourblock_fourier_allsecret_sft.cjs
 * Only read-only operations. Original rune data are taken from the canonical
 * source; native-GP English from a pinned, public-domain Shakespeare sample.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const https = require('node:https');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const B = 29;
const N = B ** 4;
const cosine = new Float64Array(B * B);
const sine = new Float64Array(B * B);
for (let k = 0; k < B; k++) {
  for (let j = 0; j < B; j++) {
    const angle = 2 * Math.PI * k * j / B;
    cosine[k * B + j] = Math.cos(angle);
    sine[k * B + j] = -Math.sin(angle);
  }
}
const mod = x => (x % B + B) % B;

/**
 * A full four-dimensional discrete Fourier transform over the additive group
 * GF(29)^4. For ANY nonzero secret 4-vector w, it returns the complex mean
 * of exp(-2*pi*i*w.C/29); the largest modulus is invariant under a hidden
 * invertible 4x4 GF(29) mixing matrix and arbitrary constant 4-vector offset.
 *
 * @param {number[]} stream Runic indices in [0,28].
 * @param {number} phase Starting offset into the source-visible chapter.
 * @returns {{blocks:number,max:number,frequency:number[]}}
 */
function spectrum(stream, phase = 0) {
  const count = Math.floor((stream.length - phase) / 4);
  assert.ok(count > 0);
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  for (let i = 0; i < count; i++) {
    let j = 0;
    for (let component = 0; component < 4; component++) {
      const value = stream[phase + i * 4 + component];
      assert.ok(Number.isInteger(value) && value >= 0 && value < B);
      j = j * B + value;
    }
    re[j]++;
  }
  const workRe = new Float64Array(B);
  const workIm = new Float64Array(B);
  for (let stride = 1; stride < N; stride *= B) {
    const span = stride * B;
    for (let base = 0; base < N; base += span) {
      for (let offset = 0; offset < stride; offset++) {
        for (let k = 0; k < B; k++) {
          let r = 0;
          let q = 0;
          for (let j = 0; j < B; j++) {
            const index = base + offset + j * stride;
            const real = re[index];
            const imag = im[index];
            const weight = k * B + j;
            r += real * cosine[weight] - imag * sine[weight];
            q += real * sine[weight] + imag * cosine[weight];
          }
          workRe[k] = r;
          workIm[k] = q;
        }
        for (let k = 0; k < B; k++) {
          const index = base + offset + k * stride;
          re[index] = workRe[k];
          im[index] = workIm[k];
        }
      }
    }
  }
  let max = 0;
  let at = -1;
  for (let i = 1; i < N; i++) {
    const amplitude = Math.hypot(re[i], im[i]) / count;
    if (amplitude > max) {
      max = amplitude;
      at = i;
    }
  }
  return {
    blocks: count,
    max,
    frequency: [
      Math.floor(at / B ** 3),
      Math.floor(at / B ** 2) % B,
      Math.floor(at / B) % B,
      at % B
    ]
  };
}

/** @param {number} lo @param {number} hi @returns {number[]} */
function chapter(lo, hi) {
  return corpus.pages.filter(x => x.page >= lo && x.page <= hi)
    .flatMap(x => x.indices);
}

/** @param {Buffer} bytes @returns {string} */
function blobSha(bytes) {
  return crypto.createHash('sha1')
    .update(Buffer.from('blob ' + bytes.length + '\0'))
    .update(bytes).digest('hex');
}

/** @param {string} url @returns {Promise<Buffer>} */
function fetchBytes(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {headers: {'User-Agent': 'LP2-fourblock-gate'}}, res => {
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error('reference HTTP ' + res.statusCode));
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/** @param {string} english @returns {number[]} */
function englishGP(english) {
  const single = new Map(corpus.translit.map((s, i) => [s, i]));
  const multigraphs = [...single.keys()].filter(s => s.length > 1)
    .sort((a, b) => b.length - a.length);
  const result = [];
  for (let word of english.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, 'CW').replace(/[VKZ]/g,
      c => ({V: 'U', K: 'C', Z: 'S'})[c]);
    for (let i = 0; i < word.length;) {
      const multi = multigraphs.find(s => word.startsWith(s, i));
      if (multi) {
        result.push(single.get(multi));
        i += multi.length;
      } else {
        if (single.has(word[i])) result.push(single.get(word[i]));
        i++;
      }
    }
  }
  return result;
}

/**
 * Cheap English lower bound: every genuine four-symbol plaintext has
 * four coordinate projections, each of which is among the 29^4 hidden
 * linear projections enumerated by spectrum(ciphertext).
 * @param {number[]} data
 * @param {number} start
 * @param {number} count Four-rune block count
 * @returns {number[]}
 */
function nativeCoordinatePeaks(data, start, count) {
  const maxima = [];
  for (let component = 0; component < 4; component++) {
    const histogram = new Int32Array(B);
    for (let i = 0; i < count; i++) {
      histogram[data[start + 4 * i + component]]++;
    }
    let peak = 0;
    for (let frequency = 1; frequency < B; frequency++) {
      let re = 0;
      let im = 0;
      for (let symbol = 0; symbol < B; symbol++) {
        const weight = frequency * B + symbol;
        re += histogram[symbol] * cosine[weight];
        im += histogram[symbol] * sine[weight];
      }
      peak = Math.max(peak, Math.hypot(re, im) / count);
    }
    maxima.push(peak);
  }
  return maxima;
}

/** @param {number[]} source @returns {number[]} */
function hillEncode(source) {
  assert.equal(source.length % 4, 0);
  const result = [];
  for (let i = 0; i < source.length; i += 4) {
    const [p, q, r, s] = source.slice(i, i + 4);
    result.push(mod(p + 2 * q + 3 * r + 4 * s),
      mod(q + 5 * r + 6 * s), mod(r + 7 * s), s);
  }
  return result;
}

/** @param {number[]} source @returns {number[]} */
function hillDecode(source) {
  assert.equal(source.length % 4, 0);
  const result = [];
  for (let i = 0; i < source.length; i += 4) {
    const [a, b, c, d] = source.slice(i, i + 4);
    const s = d;
    const r = mod(c - 7 * s);
    const q = mod(b - 5 * r - 6 * s);
    const p = mod(a - 2 * q - 3 * r - 4 * s);
    result.push(p, q, r, s);
  }
  return result;
}

async function main() {
  const source = chapter(33, 55);
  assert.equal(source.length, 4996);
  const original = [];
  for (const [lo, hi, expectedLength] of [[33, 39, 1680], [40, 53, 3008], [54, 55, 308]]) {
    const runes = chapter(lo, hi);
    assert.equal(runes.length, expectedLength);
    const phases = Array.from({length: 4}, (_, phase) => ({phase, ...spectrum(runes, phase)}));
    original.push({pages: [lo, hi], phases, maxAcrossPhases: Math.max(...phases.map(x => x.max))});
  }
  const reference = await fetchBytes('https://raw.githubusercontent.com/karpathy/char-rnn/master/data/tinyshakespeare/input.txt');
  assert.equal(blobSha(reference), '7dcb3a2d4cc3b48b6283dd46870bfeb78f88aac9');
  const native = englishGP(reference.toString('utf8'));
  assert.equal(native.length, 810930);
  const starts = [0, 5000, 20000, 60000, 100000];
  const controls = [];
  for (const count of [420, 752]) {
    const samples = starts.map(start => {
      const projections = nativeCoordinatePeaks(native, start, count);
      return {start, coordinatePeaks: projections, weakestCoordinate: Math.min(...projections)};
    });
    controls.push({count, minimumWeakestCoordinate: Math.min(...samples.map(x => x.weakestCoordinate)), samples});
  }
  assert.ok(original[0].maxAcrossPhases < controls[0].minimumWeakestCoordinate);
  assert.ok(original[1].maxAcrossPhases < controls[1].minimumWeakestCoordinate);
  const plain = native.slice(0, 752 * 4);
  const encrypted = hillEncode(plain);
  assert.deepEqual(hillDecode(encrypted), plain);
  const positive = spectrum(encrypted, 0);
  const coordinateMax = Math.max(...nativeCoordinatePeaks(plain, 0, 752));
  assert.ok(positive.max >= coordinateMax - 1e-9);
  assert.ok(positive.max > original[1].maxAcrossPhases + 0.15);
  assert.ok(Math.abs(original[0].maxAcrossPhases - 0.18410671013852792) < 1e-9);
  assert.ok(Math.abs(original[1].maxAcrossPhases - 0.1302385639896952) < 1e-9);
  console.log(JSON.stringify({
    classification: 'BENDABLE ALL-SECRET HILL4 ENGLISH-REGISTER NEGATIVE; NO LP2 PLAINTEXT',
    mathematics: 'Full 29^4 additive Fourier spectrum; invariant under every secret invertible affine GF29 Hill4',
    original, controls,
    positive: {blocks: 752, source: 'independent original-native Shakespeare text',
      cipher: 'reversible secret upper-triangular Hill4', exactRoundtrip: true,
      maxFourierAmplitude: positive.max, minRequiredFromNaturalCoordinate: coordinateMax},
    scope: 'Only stationary 4x4 affine GF29 mixing on the frozen chapter and block alignment, decoded to ordinary native-GP English. No claim for changing matrices, nonlinear operations, language changes, or small terminal p54-55.'
  }, null, 2));
}
main().catch(err => {console.error(err); process.exitCode = 1;});
