'use strict';

/**
 * Source-constrained cross-round DES-key schedule.
 *
 * Derivation, fixed before examining unknown LP2 plaintext:
 *   - p32 has 121 runes, so the 121st prime is modulus 661.
 *   - 2014 onion7 HTML supplies title=133 and div id=331.
 *   - 331^133 mod 661 = 566, the midpoint of the original 2016 JPEG's
 *     563x569 dimensions (which also equal p32's first-row/first-column
 *     GP-prime sums).
 *   - log_331(133) = 36; subtract log_331(331)=1 to obtain stride 35.
 *   - The archived OpenPuff squares have unique orders 5 and 7, whose
 *     product is the same 35.
 *   - Start at 566 mod 256 = 54 and traverse the original 256-byte
 *     base60 table by stride 35. Since gcd(35,256)=1, this visits every
 *     byte exactly once. Group consecutive permuted bytes into 32 8-byte
 *     DES keys, one per source-delimited 13-dot fragment.
 *
 * This is a hypothesis, not an established Cicada instruction. The test
 * evaluates 64 finite DES/encoding/clock variants on original ciphertext,
 * with a planted source-native positive control.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {createCipheriv} = require('node:crypto');
const {train, encode} = require('./grid_keyskip_viterbi.cjs');
const {plainScore} = require('./grid_latin_register_inverse.cjs');

const root = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');
const grid = read('resources/liber-primus/base60-grid.json');

const mod = (a, n) => ((a % n) + n) % n;
function gcd(a, b) { return b ? gcd(b, a % b) : a; }
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
function nthPrime(k) {
  let found = 0;
  for (let n = 2; ; n++) if (isPrime(n) && ++found === k) return n;
}
function modPow(a, e, n) {
  let x = 1n, b = BigInt(a), k = BigInt(e), m = BigInt(n);
  while (k > 0n) {
    if (k & 1n) x = x * b % m;
    b = b * b % m;
    k >>= 1n;
  }
  return Number(x);
}
function discreteLog(base, target, p, order) {
  let x = 1;
  for (let k = 0; k < order; k++) {
    if (x === target) return k;
    x = x * base % p;
  }
  throw new Error('target is not in the declared subgroup');
}
function jpegSize(buf) {
  assert.equal(buf[0], 0xff);
  assert.equal(buf[1], 0xd8);
  const sof = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
                       0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let p = 2;
  while (p < buf.length) {
    while (p < buf.length && buf[p] !== 0xff) p++;
    while (p < buf.length && buf[p] === 0xff) p++;
    const marker = buf[p++];
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0xd8 || marker === 0x01 ||
        (marker >= 0xd0 && marker <= 0xd7)) continue;
    const length = buf.readUInt16BE(p);
    if (sof.has(marker)) {
      return {width: buf.readUInt16BE(p + 5),
              height: buf.readUInt16BE(p + 3)};
    }
    p += length;
  }
  throw new Error('JPEG SOF dimensions not found');
}

// Reconstruct every source input to the modular key schedule.
const html = fs.readFileSync(path.join(root, 'resources/cicada2014-onion7-index.html'), 'utf8');
const titleMatch = html.match(/<title>\s*(\d+)\s*<\/title>/i);
const idMatch = html.match(/<div\s+id=["'](\d+)["']/i);
assert.ok(titleMatch && idMatch);
const exponent = Number(titleMatch[1]);
const base = Number(idMatch[1]);

const magic = fs.readFileSync(path.join(root, 'resources/cicada2014-openpuff-magic-squares.txt'), 'utf8');
const squareBlocks = magic.trim().split(/\r?\n\s*\r?\n/).filter(Boolean);
const squareOrders = squareBlocks.map(block => block.trim().split(/\r?\n/).filter(x => x.trim()).length);
const uniqueSquareOrders = [...new Set(squareOrders)].sort((a, b) => a - b);
assert.deepEqual(uniqueSquareOrders, [5, 7]);
const squareProduct = uniqueSquareOrders.reduce((a, b) => a * b, 1);

const page32 = corpus.pages.find(p => p.page === 32);
assert.ok(page32);
assert.equal(page32.indices.length, 121);
const modulus = nthPrime(page32.indices.length);
assert.equal(modulus, 661);
const imagePath = path.join(root, 'resources/historical/cicada2016-4gq25.jpg');
const image = jpegSize(fs.readFileSync(imagePath));
assert.deepEqual(image, {width: 563, height: 569});
const p32PrimeRow = page32.indices.slice(0, 11).map(i => corpus.prime[i]);
const p32PrimeColumn = page32.indices.filter((_, i) => i % 11 === 0).map(i => corpus.prime[i]);
assert.equal(p32PrimeRow.reduce((a, b) => a + b, 0), image.width);
assert.equal(p32PrimeColumn.reduce((a, b) => a + b, 0), image.height);
const midpoint = (image.width + image.height) / 2;
assert.equal(midpoint, 566);
const seed = midpoint % 256;
assert.equal(seed, 54);
assert.equal(modPow(base, exponent, modulus), midpoint);
const log = discreteLog(base, exponent, modulus, modulus - 1);
assert.equal(log, 36);
assert.equal(discreteLog(base, base, modulus, modulus - 1), 1);
const stride = log - 1;
assert.equal(stride, squareProduct);
assert.equal(gcd(stride, 256), 1);
assert.ok([2, 3, 5, 11].every(q => modPow(base, 660 / q, modulus) !== 1),
  'HTML id must be a primitive root modulo 661');

const table = Buffer.from(grid.byte_rows.flat());
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every(row => row.length === 8));
assert.equal(table.length, 256);
const permutation = Array.from({length: 256}, (_, i) => mod(seed + stride * i, 256));
assert.equal(new Set(permutation).size, 256);
const permutedBytes = Buffer.from(permutation.map(i => table[i]));
const keyHash = crypto.createHash('sha256').update(permutedBytes).digest('hex');
const keys = Array.from({length: 32}, (_, row) =>
  Buffer.from(permutedBytes.subarray(row * 8, row * 8 + 8)));

// Reconstruct the original 32 fragments from the 31 printed 13-dot marks.
const all = [], origin = [], start = [];
for (const page of corpus.pages) {
  start[page.page] = all.length;
  for (const c of page.indices) {
    all.push(c);
    origin.push(page.page);
  }
}
assert.equal(all.length, 13136);
const dots = [];
for (const rec of ink.pages) {
  assert.equal(rec.rune_count, corpus.pages[rec.page].indices.length);
  for (const mark of rec.large_punctuation || [])
    if (mark[1] === 13) dots.push(start[rec.page] + mark[0]);
}
dots.sort((a, b) => a - b);
assert.equal(dots.length, 31);
const fragmentIndex = new Array(all.length);
let f = 0, di = 0;
for (let p = 0; p < all.length; p++) {
  while (di < dots.length && dots[di] === p) { di++; f++; }
  fragmentIndex[p] = f;
}
assert.equal(di, 31);
assert.equal(fragmentIndex[12955], 27);
assert.equal(fragmentIndex[12956], 28);
const segments = Array.from({length: 32}, () => []);
for (let p = 0; p < 12956; p++)
  segments[fragmentIndex[p]].push({c: all[p], page: origin[p]});
assert.equal(segments.reduce((sum, x) => sum + x.length, 0), 12956);
const original = segments.map(s => s.map(x => x.c));

/** DES stream, using three identical EDE3 keys to implement single DES. */
function desStream(key, length, row, mode) {
  const triple = Buffer.concat([key, key, key]);
  const nonce = Buffer.alloc(8);
  if (mode.salt === 'row') nonce.writeBigUInt64BE(BigInt(row));
  if (mode.stream === 'ofb') {
    const cipher = createCipheriv('des-ede3-ofb', triple, nonce);
    return Buffer.concat([cipher.update(Buffer.alloc(length)), cipher.final()]);
  }
  const cipher = createCipheriv('des-ede3', triple, null);
  cipher.setAutoPadding(false);
  const out = Buffer.alloc(Math.ceil(length / 8) * 8);
  for (let block = 0; block < out.length / 8; block++) {
    const counter = Buffer.alloc(8);
    counter.writeBigUInt64BE(BigInt(block) +
      (mode.salt === 'row' ? BigInt(row) : 0n));
    cipher.update(counter).copy(out, block * 8);
  }
  cipher.final();
  return out.subarray(0, length);
}
function padsFor(mode) {
  return keys.map((baseKey, row) => desStream(
    mode.reverse ? Buffer.from(baseKey).reverse() : baseKey,
    segments[row].length, row, mode));
}
function keyDigit(x, base, mode) {
  return mode.reducer === 'mod' ? x % base : Math.floor(x * base / 256);
}
function decode(segs, pads, mode) {
  return segs.map((seq, row) => {
    const out = [];
    for (let j = 0; j < seq.length; j++) {
      const c = seq[j], direct = mode.format === 'direct29' || j === 0;
      const radix = direct ? 29 : 28;
      const digit = keyDigit(pads[row][j], radix, mode);
      if (direct) out.push(mod(c - mode.sign * digit, 29));
      else if (c === seq[j - 1]) out.push(28);
      else out.push(mod(mod(c - seq[j - 1] - 1, 29) -
        mode.sign * digit, 28));
    }
    return out;
  });
}
function encodeCipher(segs, pads, mode) {
  return segs.map((seq, row) => {
    const out = [];
    for (let j = 0; j < seq.length; j++) {
      const p = seq[j], direct = mode.format === 'direct29' || j === 0;
      const radix = direct ? 29 : 28;
      const digit = keyDigit(pads[row][j], radix, mode);
      if (direct) out.push(mod(p + mode.sign * digit, 29));
      else if (p === 28) out.push(out[j - 1]);
      else out.push(mod(out[j - 1] + 1 +
        mod(p + mode.sign * digit, 28), 29));
    }
    return out;
  });
}
const modes = [];
for (const stream of ['ctr', 'ofb'])
  for (const salt of ['zero', 'row'])
    for (const reverse of [false, true])
      for (const format of ['direct29', 'diff28'])
        for (const reducer of ['mod', 'scaled'])
          for (const sign of [-1, 1])
            modes.push({stream, salt, reverse, format, reducer, sign});
assert.equal(modes.length, 64);

const gpTrain = fs.readFileSync(path.join(root, 'resources/control/shakespeare_first300k.txt'), 'utf8');
const english = train(gpTrain.slice(0, 190000));
const nativeRef = encode(gpTrain.slice(205000));
assert.ok(nativeRef.length >= 12956);
function sliceSplit(decoded) {
  const tr = [], ho = [];
  for (let row = 0; row < decoded.length; row++)
    for (let j = 0; j < decoded[row].length; j++)
      (segments[row][j].page < 28 ? tr : ho).push(decoded[row][j]);
  return {tr, ho};
}
function ioc(vals) {
  const hist = Array(29).fill(0);
  for (const c of vals) hist[c]++;
  return hist.reduce((s, n) => s + n * (n - 1), 0) /
    (vals.length * (vals.length - 1));
}
function search(segs) {
  return modes.map(mode => {
    const pads = padsFor(mode);
    const decoded = decode(segs, pads, mode);
    const {tr, ho} = sliceSplit(decoded);
    return {
      mode, train: plainScore(tr, english), heldout: plainScore(ho, english),
      trainIoc: ioc(tr), heldoutIoc: ioc(ho),
      prefix: decoded[0].slice(0, 45).map(x => corpus.translit[x]).join(''),
      decoded
    };
  }).sort((a, b) => b.train - a.train);
}
function plant() {
  const truth = {stream: 'ctr', salt: 'row', reverse: false,
    format: 'diff28', reducer: 'scaled', sign: 1};
  const ref = nativeRef.slice(0, 12956);
  let offset = 0;
  const native = segments.map(s => {
    const v = ref.slice(offset, offset + s.length);
    offset += s.length;
    return v;
  });
  const pads = padsFor(truth);
  const cipher = encodeCipher(native, pads, truth);
  const inverted = decode(cipher, pads, truth);
  assert.deepEqual(inverted, native);
  assert.deepEqual(encodeCipher(inverted, pads, truth), cipher);
  const match = search(cipher);
  const idx = match.findIndex(x => JSON.stringify(x.mode) === JSON.stringify(truth));
  const checked = sliceSplit(inverted);
  return {
    trueKeyModeRank: idx + 1, correctMode: truth,
    recovered: inverted.flat().length, reencrypted: cipher.flat().length,
    heldoutNative: plainScore(checked.ho, english),
    trueModeHeldout: match[idx].heldout,
    bestAlternativeTraining: match.filter(x =>
      JSON.stringify(x.mode) !== JSON.stringify(truth))[0].train
  };
}


const groupPowerKey = permutation.map(i => modPow(base, table[i], modulus) % 29);
const groupPowerKeySha256 = crypto.createHash('sha256')
  .update(Buffer.from(groupPowerKey)).digest('hex');
const groupModes = [];
for (const clock of ['book', 'page'])
  for (const format of ['direct29', 'diff28'])
    for (const sign of [-1, 1])
      groupModes.push({clock, format, sign});
function groupDecode(segs, mode) {
  let global = 0;
  return segs.map(seq => {
    const out = [];
    for (let j = 0; j < seq.length; j++) {
      const c = seq[j], direct = mode.format === 'direct29' || j === 0;
      const radix = direct ? 29 : 28;
      const idx = mode.clock === 'book' ? global : j;
      const digit = groupPowerKey[idx % 256] % radix;
      if (direct) out.push(mod(c - mode.sign * digit, 29));
      else if (c === seq[j - 1]) out.push(28);
      else out.push(mod(mod(c - seq[j - 1] - 1, 29) -
        mode.sign * digit, 28));
      global++;
    }
    return out;
  });
}
function groupEncode(segs, mode) {
  let global = 0;
  return segs.map(seq => {
    const out = [];
    for (let j = 0; j < seq.length; j++) {
      const p = seq[j], direct = mode.format === 'direct29' || j === 0;
      const radix = direct ? 29 : 28;
      const idx = mode.clock === 'book' ? global : j;
      const digit = groupPowerKey[idx % 256] % radix;
      if (direct) out.push(mod(p + mode.sign * digit, 29));
      else if (p === 28) out.push(out[j - 1]);
      else out.push(mod(out[j - 1] + 1 +
        mod(p + mode.sign * digit, 28), 29));
      global++;
    }
    return out;
  });
}
function groupSearch(segs) {
  return groupModes.map(mode => {
    const decoded = groupDecode(segs, mode);
    const {tr, ho} = sliceSplit(decoded);
    return {
      mode, train: plainScore(tr, english), heldout: plainScore(ho, english),
      trainIoc: ioc(tr), heldoutIoc: ioc(ho),
      prefix: decoded[0].slice(0, 45).map(x => corpus.translit[x]).join(''),
      decoded
    };
  }).sort((a, b) => b.train - a.train);
}
function groupPlant() {
  const truth = {clock: 'book', format: 'direct29', sign: 1};
  const ref = nativeRef.slice(0, 12956);
  let offset = 0;
  const native = segments.map(s => {
    const v = ref.slice(offset, offset + s.length);
    offset += s.length;
    return v;
  });
  const cipher = groupEncode(native, truth);
  const recovered = groupDecode(cipher, truth);
  assert.deepEqual(recovered, native);
  assert.deepEqual(groupEncode(recovered, truth), cipher);
  const match = groupSearch(cipher);
  const idx = match.findIndex(x => JSON.stringify(x.mode) === JSON.stringify(truth));
  return {
    trueModeRank: idx + 1, correctMode: truth,
    recovered: recovered.flat().length, reencrypted: cipher.flat().length,
    trueModeHeldout: match[idx].heldout,
    bestAlternativeTraining: match.filter(x =>
      JSON.stringify(x.mode) !== JSON.stringify(truth))[0].train
  };
}

function main() {
  const results = search(original);
  const best = results[0];
  const top = results.slice(0, 8).map(({mode, train, heldout, trainIoc,
    heldoutIoc, prefix}) => ({mode, train, heldout, trainIoc, heldoutIoc, prefix}));
  const split = sliceSplit(original);
  const output = {
    classification: 'bounded source-derived DES-key hypothesis; no plaintext claim',
    sourceDerivation: {
      htmlTitleExponent: exponent, htmlIdBase: base, p32RuneCount: page32.indices.length,
      modulus: modulus, modulusIs121stPrime: true, htmlIdPrimitiveRoot: true,
      modularPower: modPow(base, exponent, modulus), imageSize: [image.width, image.height],
      imageDimensionMidpoint: midpoint, p32FirstRowPrimeSum: p32PrimeRow.reduce((a,b)=>a+b,0),
      p32FirstColumnPrimeSum: p32PrimeColumn.reduce((a,b)=>a+b,0),
      discreteLog: log, identityLog: 1, logDifferenceStride: stride,
      uniqueOpenPuffSquareOrders: uniqueSquareOrders, squareOrderProduct: squareProduct,
      tableLength: table.length, seed: seed, stride: stride, gcdStrideTable: gcd(stride, 256),
      permutationUnique: new Set(permutation).size, keySha256: keyHash,
      first32KeyBytes: [...permutedBytes.subarray(0, 32)],
      selectedPrimePair: [449, 1109], primePairDifference: 1109 - 449,
      primePairDifferenceEqualsGroupOrder: 1109 - 449 === modulus - 1,
      cicada3301ResidueModGroupOrder: 3301 % (modulus - 1),
      selectedPrimePairPowersEqual: modPow(base, 449, modulus) === modPow(base, 1109, modulus),
      cicada3301PowerIsBase: modPow(base, 3301, modulus) === base,
      groupPowerKeySha256: groupPowerKeySha256,
      groupPowerKeyFirst32: groupPowerKey.slice(0, 32)
    },
    sourceLayout: {
      originalRunes: original.flat().length, fragments: segments.length,
      unsolvedFragmentLengths: segments.slice(0, 28).map(x => x.length),
      thirteenDotMarks: dots.length
    },
    modes: modes.length,
    topTraining: top,
    bestHeldoutFromFrozenTraining: {
      mode: best.mode, heldout: best.heldout, heldoutIoc: best.heldoutIoc
    },
    noKeyNative: {
      train: plainScore(split.tr, english), heldout: plainScore(split.ho, english),
      trainIoc: ioc(split.tr), heldoutIoc: ioc(split.ho)
    },
    trueSourceControl: plant(),
    groupPowerKeyTest: {
      modes: groupModes.length,
      topTraining: groupSearch(original).map(({mode, train, heldout, trainIoc, heldoutIoc, prefix}) =>
        ({mode, train, heldout, trainIoc, heldoutIoc, prefix})),
      noKeyNative: {train: plainScore(split.tr, english), heldout: plainScore(split.ho, english),
        trainIoc: ioc(split.tr), heldoutIoc: ioc(split.ho)},
      trueSourceControl: groupPlant()
    }
  };
  console.log(JSON.stringify(output, null, 2));
}
if (require.main === module) main();
module.exports = {main, desStream, decode, encodeCipher, padsFor, plant};
