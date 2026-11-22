'use strict';
/**
 * Source-fixed Josephus ordering of the 256 numerical grid cells, followed
 * by eight AES-256-CTR pads, one per printed text section.
 *
 * Clue: 225 original red GP runes plus 31 source thirteen-dot marks yield
 * exactly 256 events whose one-based rune weights sum to 13 * 256.
 * Centering by 13 gives a cyclic zero-sum step schedule. Josephus elimination
 * uses every original grid cell once, unlike the earlier repeated-state walk.
 *
 * The cipher and fixed-zero nonce remain explicit *hypotheses*. An English
 * positive control tests the decoder; original data alone determines its
 * negative outcome. Usage: node sims/ink256_josephus_aes_sections_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash, createCipheriv } = require('node:crypto');
const { encode, train } = require('./grid_keyskip_viterbi.cjs');
const read = relative => fs.readFileSync(path.resolve(__dirname, '..', relative), 'utf8');
const json = relative => JSON.parse(read(relative));
const corpus = json('resources/liber-primus/lp2-corpus.json');
const ink = json('resources/liber-primus/lp2-ink-annotations.json');
const bytes = json('resources/liber-primus/base60-grid.json').byte_rows.flat();
const alphabet = new Map(corpus.runes.map((rune, index) => [rune, index]));
const mod = (value, width) => (value % width + width) % width;
assert.equal(bytes.length, 256);
assert.equal(createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/** @returns {number[]} One-based GP runes, zero-valued dot stencils. */
function sourceEvents() {
  const result = [];
  for (const page of ink.pages) {
    const entries = [];
    for (const span of page.red_spans || []) {
      const original = corpus.pages[page.page].indices;
      for (let j = 0; j < span.length; j++) {
        const rune = [...span.runes][j];
        assert.equal(alphabet.get(rune), original[span.start + j]);
        entries.push({ at: span.start + j, type: 1, value: original[span.start + j] + 1 });
      }
    }
    for (const mark of page.large_punctuation || []) {
      if (mark[1] === 13) entries.push({ at: mark[0], type: 0, value: 0 });
    }
    entries.sort((a, b) => a.at - b.at || a.type - b.type);
    result.push(...entries.map(entry => entry.value));
  }
  assert.equal(result.length, 256);
  assert.equal(result.filter(v => v === 0).length, 31);
  assert.equal(result.reduce((a, b) => a + b, 0), 13 * 256);
  return result;
}

/** @param {number[]} events @returns {number[]} Original cell indices. */
function josephus(events) {
  const unused = Array.from({ length: events.length }, (_, i) => i);
  const visits = [];
  let cursor = 0;
  for (const event of events) {
    cursor = mod(cursor + event - 13, unused.length);
    visits.push(unused.splice(cursor, 1)[0]);
    if (unused.length) cursor %= unused.length;
  }
  assert.equal(visits.length, 256);
  assert.equal(new Set(visits).size, 256);
  assert.equal(unused.length, 0);
  assert.deepEqual(visits.slice(0, 8), [3, 255, 7, 252, 246, 0, 18, 5]);
  return visits;
}

/** @returns {number[][]} Eight source-specified text sections. */
function sections() {
  const master = read('resources/transcriptions/liber_primus_master.txt');
  const start = master.indexOf('ᛋᚻᛖᚩᚷᛗᛡᚠ');
  assert(start >= 0);
  const text = master.slice(start).split('%').slice(0, 56).join('%');
  const parts = text.split('$').map(s => [...s].filter(r => alphabet.has(r))
    .map(r => alphabet.get(r))).filter(s => s.length);
  assert.equal(parts.length, 9);
  const groups = [parts[0], parts[1], parts[2], parts[3].concat(parts[4]),
    parts[5], parts[6], parts[7], parts[8]];
  assert.deepEqual(groups.map(x => x.length),
    [729, 1145, 1729, 1903, 1021, 1524, 1589, 3316]);
  return groups;
}

/**
 * Deterministic CTR keystream. The all-zero IV is a frozen candidate input,
 * not an IV prescription for real-world AES encryption.
 * @param {Buffer} key
 * @param {number} size
 */
function pad(key, size) {
  assert.equal(key.length, 32);
  const cipher = createCipheriv('aes-256-ctr', key, Buffer.alloc(16));
  return Buffer.concat([cipher.update(Buffer.alloc(size)), cipher.final()]);
}

/** @param {number[]} values */
function ioc(values) {
  const frequencies = new Uint32Array(29);
  for (const value of values) frequencies[value]++;
  return frequencies.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

/** @param {number[]} values @param {object} lm */
function languageScore(values, lm) {
  let result = 0;
  for (let i = 2; i < values.length; i++) {
    result += lm.trigram[(values[i - 2] * 29 + values[i - 1]) * 29 + values[i]];
  }
  return result / (values.length - 2);
}

const pow15 = [];
const log15 = new Int16Array(29).fill(-1);
for (let i = 0, x = 1; i < 28; i++, x = x * 15 % 29) {
  assert.equal(log15[x], -1);
  log15[x] = i;
  pow15.push(x);
}
assert.equal(new Set(pow15).size, 28);

/**
 * Lossless GP28 differential decoder: repeat previous ciphertext -> EA(28);
 * otherwise the nonzero delta is an exponent in the primitive GP29 group.
 * @param {number[]} cipher
 * @param {Buffer} keyStream
 * @param {number} sign
 */
function decode28(cipher, keyStream, sign) {
  let prev = 0;
  return cipher.map((current, i) => {
    const delta = mod(current - prev, 29);
    prev = current;
    return delta === 0 ? 28 : mod(log15[delta] + sign * (keyStream[i] % 28), 28);
  });
}

/** @param {number[]} plain @param {Buffer} keyStream @param {number} sign */
function encode28(plain, keyStream, sign) {
  let prev = 0;
  return plain.map((rune, i) => {
    if (rune !== 28)
      prev = (prev + pow15[mod(rune - sign * (keyStream[i] % 28), 28)]) % 29;
    return prev;
  });
}

function main() {
  const events = sourceEvents();
  const visits = josephus(events);
  const keys = Array.from({ length: 8 }, (_, i) =>
    Buffer.from(visits.slice(i * 32, (i + 1) * 32).map(j => bytes[j])));
  const groups = sections();
  const ks = groups.map((group, i) => pad(keys[i], group.length));
  const model = train(read('resources/control/shakespeare_first300k.txt'));
  const english = encode(read('resources/control/shakespeare_first300k.txt')).slice(0, 512);
  const positive = encode28(english, pad(keys[0], english.length), -1);
  assert.deepEqual(decode28(positive, pad(keys[0], english.length), -1), english);
  const cases = [];
  for (const sign of [-1, 1]) {
    for (const reduction of ['mod29', 'scale29']) {
      const decoded = groups.map((group, s) =>
        group.map((rune, i) => mod(rune + sign *
          (reduction === 'mod29' ? ks[s][i] % 29 :
            Math.floor(29 * ks[s][i] / 256)), 29)));
      const all = decoded.flat();
      cases.push({ decoder: reduction, sign, ioc: ioc(all),
        trigramLogLikelihood: languageScore(all, model),
        firstSectionPrefix: decoded[0].slice(0, 60).map(x => corpus.translit[x]).join('') });
    }
    const decoded = groups.map((group, s) => decode28(group, ks[s], sign));
    for (let s = 0; s < groups.length; s++)
      assert.deepEqual(encode28(decoded[s], ks[s], sign), groups[s]);
    const all = decoded.flat();
    cases.push({ decoder: 'gp28-zero-delta', sign, ioc: ioc(all),
      trigramLogLikelihood: languageScore(all, model),
      firstSectionPrefix: decoded[0].slice(0, 60).map(x => corpus.translit[x]).join('') });
  }
  cases.sort((a, b) => b.trigramLogLikelihood - a.trigramLogLikelihood);
  const original = groups.flat();
  const output = {
    hypothesis: '13-centered Josephus 256-cell traversal, eight fixed AES-256-CTR sections',
    source: { eventCount: events.length, centeredSum: 0,
      uniqueVisits: visits.length, firstVisits: visits.slice(0, 12),
      keySha256: keys.map(key => createHash('sha256').update(key).digest('hex')),
      sectionLengths: groups.map(x => x.length) },
    controls: { englishGpTrigramLogLikelihood: languageScore(english, model),
      originalCiphertextTrigramLogLikelihood: languageScore(original, model),
      originalCiphertextIoc: ioc(original),
      positiveGp28Plant: '512/512 correctly recovered' },
    originalModels: cases,
    decision: 'Source-only key hypothesis; no genuine plaintext is inferred without a strong original-language signal.'
  };
  console.log(JSON.stringify(output, null, 2));
}
if (require.main === module) main();
module.exports = { sourceEvents, josephus, sections, decode28, encode28, main };
