'use strict';

/**
 * Exact original-source 76/180 register test across p53, p55, PARABLE and the p50 table.
 * Node.js 22 CommonJS. Run from the repository with node sims/lp2_p53_p55_parable76_grid_gate.cjs.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, 'resources', 'liber-primus', name), 'utf8');
const corpus = JSON.parse(read('lp2-corpus.json'));
const table = JSON.parse(read('base60-grid.json'));
const ink = JSON.parse(read('lp2-ink-annotations.json'));
const transcription = read('lp2-transcription.txt');
const p53 = corpus.pages[53].indices;
const p55 = corpus.pages[55].indices;
const p57 = corpus.pages[57].indices;
const marks53 = ink.pages.find((p) => p.page === 53);
const marks55 = ink.pages.find((p) => p.page === 55);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const mod = (x) => ((x % 29) + 29) % 29;
const sha = (items) => crypto.createHash('sha256').update(Buffer.from(items)).digest('hex');

assert.equal(p53.length, 179);
assert.equal(p55.length, 76);
assert.equal(p57.length, 95);
assert.equal(marks53.red_spans.length, 1);
assert.equal(marks53.red_spans[0].start, 128);
assert.equal(marks53.red_spans[0].length, 51);
assert.deepEqual(marks53.large_punctuation, [[179, 13, 'red']]);
assert.deepEqual(marks55.large_punctuation, [[76, 13, 'red']]);

const wordStart = transcription.lastIndexOf('ᛈᚪᚱᚪᛒᛚᛖ.');
assert.ok(wordStart >= 0);
const paragraph = transcription.slice(wordStart).replace(/[\s/§]/gu, '');
const words = paragraph.split(/[.\-]/u)
  .map((w) => Array.from(w).filter((r) => runeIndex.has(r)).map((r) => runeIndex.get(r)))
  .filter((w) => w.length);
assert.equal(words.length, 20);
assert.deepEqual(words.flat(), p57);
assert.equal(words[0].length, 7);
const body = words.slice(1);
assert.equal(body.length, 19);
const shed = {
  first: words[0].concat(...body.map((w) => w.slice(1))),
  last: words[0].concat(...body.map((w) => w.slice(0, -1))),
};
assert.equal(shed.first.length, 76);
assert.equal(shed.last.length, 76);

const byteRows = table.rows.map((row) => row.map((token) =>
  60 * table.alphabet.indexOf(token[0]) + table.alphabet.indexOf(token[1])));
assert.equal(byteRows.length, 32);
for (const row of byteRows) assert.equal(row.length, 8);
const tableBytes = byteRows.flat();
assert.equal(tableBytes.length, 256);
assert.equal(sha(tableBytes), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const perimeterPositions = [];
for (let x = 0; x < 8; x++) perimeterPositions.push([0, x]);
for (let y = 1; y < 32; y++) perimeterPositions.push([y, 7]);
for (let x = 6; x >= 0; x--) perimeterPositions.push([31, x]);
for (let y = 30; y >= 1; y--) perimeterPositions.push([y, 0]);
const insidePositions = [];
for (let y = 1; y < 31; y++) {
  for (let x = 1; x < 7; x++) insidePositions.push([y, x]);
}
assert.equal(perimeterPositions.length, 76);
assert.equal(insidePositions.length, 180);
const rim = perimeterPositions.map(([y, x]) => byteRows[y][x]);

/** @param {number[]} xs */
function ioc(xs) {
  const freq = Array(29).fill(0);
  for (const x of xs) freq[x]++;
  return freq.reduce((sum, n) => sum + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}

/** @param {number[]} xs */
function translate(xs) { return xs.map((x) => corpus.translit[x]).join(''); }

/** @param {number[]} original @param {number[]} key */
function encodeConsuming(original, key) {
  assert.ok(original.length <= key.length);
  return original.map((p, i) => mod(p + key[i]));
}

/** @param {number[]} original @param {number[]} key */
function encodeTransparentF(original, key) {
  const out = [];
  let used = 0;
  for (const p of original) {
    if (p === 0) { out.push(0); continue; }
    assert.ok(used < key.length);
    out.push(mod(p + key[used++]));
  }
  return out;
}

/** @param {number[]} source @param {number[]} key */
function decodeTransparentF(source, key) {
  let states = [{ cursor: 0, plaintext: [], skipAt: [] }];
  for (let i = 0; i < source.length; i++) {
    const next = [];
    for (const st of states) {
      if (source[i] === 0) {
        next.push({ cursor: st.cursor, plaintext: st.plaintext.concat(0), skipAt: st.skipAt.concat(i) });
      }
      if (st.cursor >= key.length) continue;
      const plain = mod(source[i] - key[st.cursor]);
      if (plain !== 0) {
        next.push({ cursor: st.cursor + 1, plaintext: st.plaintext.concat(plain), skipAt: st.skipAt });
      }
    }
    states = next;
  }
  return states;
}

/** @param {number[]} bytes */
function byteSummary(bytes) {
  let longest = 0;
  let run = 0;
  for (const b of bytes) {
    if (b >= 32 && b <= 126) { run++; longest = Math.max(longest, run); }
    else run = 0;
  }
  return {
    printable: bytes.filter((b) => b >= 32 && b <= 126).length,
    highestBit: bytes.filter((b) => b >= 128).length,
    longestPrintableRun: longest,
    prefixHex: Buffer.from(bytes.slice(0, 24)).toString('hex'),
    sha256: sha(bytes),
  };
}

/** @param {number} x @param {'index'|'prime'} codec */
function runeByte(x, codec) { return codec === 'index' ? x : corpus.prime[x]; }

// Source-locked Vigenere-29 with 16 word-edge/rim/order/sign combinations.
const triple = [];
const xor = [];
for (const [edge, tape] of Object.entries(shed)) {
  for (const direction of ['clockwise', 'counterclockwise']) {
    const rimBytes = direction === 'clockwise' ? rim : rim.slice().reverse();
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        const key = tape.map((x, i) => mod(s1 * x + s2 * (rimBytes[i] % 29)));
        const decoded = p55.map((c, i) => mod(c - key[i]));
        assert.deepEqual(encodeConsuming(decoded, key), p55);
        const transparent = decodeTransparentF(p55, key);
        for (const result of transparent) {
          assert.deepEqual(encodeTransparentF(result.plaintext, key), p55);
        }
        triple.push({
          edge, direction, shedCoefficient: s1, rimCoefficient: s2,
          noSkipIoC: ioc(decoded),
          transparentLegalPaths: transparent.map((x) => ({
            cursor: x.cursor, skipAt: x.skipAt, ioc: ioc(x.plaintext),
            prefix: translate(x.plaintext.slice(0, 35)),
          })),
          noSkipPrefix: translate(decoded.slice(0, 35)),
        });
      }
    }
    // The authentic 2014 three-share XOR is a distinct byte-valued consumer.
    for (const codec of ['index', 'prime']) {
      const payload = p55.map((x, i) => rimBytes[i] ^ runeByte(x, codec) ^ runeByte(tape[i], codec));
      xor.push({ edge, direction, codec, ...byteSummary(payload) });
    }
  }
}

// Planted original-source positive for the exact p56-style F-transparent inverse.
const native = p57.slice(0, 76);
const trialKey = shed.first.map((x, i) => mod(x + rim[i]));
const plantedCipher = encodeTransparentF(native, trialKey);
const plants = decodeTransparentF(plantedCipher, trialKey);
assert.ok(plants.some((x) => x.plaintext.every((v, i) => v === native[i])));

// P53 and p55 share the original printed moth artwork. Their lengths total 255.
const byte256 = [];
for (const markPosition of ['betweenPages', 'afterP55']) {
  const sequence = markPosition === 'betweenPages'
    ? [...p53, null, ...p55]
    : [...p53, ...p55, null];
  assert.equal(sequence.length, 256);
  for (const codec of ['index', 'prime']) {
    const values = sequence.map((x) => x === null ? 13 : runeByte(x, codec));
    for (const operation of ['xor', 'subtraction']) {
      const output = tableBytes.map((b, i) => operation === 'xor'
        ? (b ^ values[i]) : ((b - values[i] + 256) % 256));
      byte256.push({ topology: 'printed-concatenation', markPosition, codec, operation, ...byteSummary(output) });
    }
  }
}

// Assign p55 to the visible 76-cell rim, and p53+one terminal mark to the inner 180.
for (const codec of ['index', 'prime']) {
  const map = Array(256).fill(-1);
  perimeterPositions.forEach(([y, x], i) => { map[y * 8 + x] = runeByte(p55[i], codec); });
  const inner180 = p53.map((x) => runeByte(x, codec)).concat(13);
  insidePositions.forEach(([y, x], i) => { map[y * 8 + x] = inner180[i]; });
  assert.ok(map.every((v) => v >= 0));
  for (const operation of ['xor', 'subtraction']) {
    const output = tableBytes.map((b, i) => operation === 'xor'
      ? (b ^ map[i]) : ((b - map[i] + 256) % 256));
    byte256.push({ topology: 'rim-p55-interior-p53+mark', codec, operation, ...byteSummary(output) });
  }
}

const foundTransparent = triple.flatMap((x) => x.transparentLegalPaths.map((candidate) => ({
  edge: x.edge, direction: x.direction,
  s1: x.shedCoefficient, s2: x.rimCoefficient, ...candidate,
})));
const ranked = triple.slice().sort((a, b) => b.noSkipIoC - a.noSkipIoC);
console.log(JSON.stringify({
  source: {
    p53: { runes: p53.length, black: 128, red: 51, terminalMark: 13, sha256Indices: sha(p53) },
    p55: { runes: p55.length, terminalMark: 13, sha256Indices: sha(p55) },
    parable: { words: words.length, bodyWords: body.length, runes: p57.length,
      shedFirstSha256: sha(shed.first), shedLastSha256: sha(shed.last) },
    table: { cells: tableBytes.length, outer: rim.length, inner: insidePositions.length,
      sha256Bytes: sha(tableBytes) },
  },
  controls: { native76IoC: ioc(native), rawP55IoC: ioc(p55),
    transparentFPlantedRecovery: plants.some((x) => x.plaintext.every((v, i) => v === native[i])) },
  originalGP29: { tripleModels: triple.length,
    bestNoSkip: ranked.slice(0, 3),
    completeTransparentFPaths: foundTransparent.length,
    transparentPaths: foundTransparent },
  originalByteXor: xor,
  original256ByteConsumers: byte256,
}, null, 2));
