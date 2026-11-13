'use strict';

/**
 * Fixed-source LP2 p50 keyed GP28 binary packet gate.
 *
 * Source originals: resources/liber-primus/lp2-corpus.json and lp2-grid-256.json.
 * Run: node sims/lp2_p50_keyed_gp28_packet_allsecret_sft.cjs
 *
 * Every option is enumerated, with no parameter selected by language scoring.
 * A failure of a necessary condition excludes an entire secret alphabet class,
 * not the possibility of a different, more complex cryptographic transport.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const pages = corpus.pages.filter(p => p.page >= 0 && p.page <= 55 && p.indices.length > 0);
const rowKey = grid.pages.flatMap(p => p.bytes);
const columnKey = Array.from({length: 256}, (_, i) => rowKey[(i % 32) * 8 + Math.floor(i / 32)]);
const keys = [{name: 'printed rows', values: rowKey}, {name: 'printed columns', values: columnKey}];

assert.equal(pages.length, 55);
assert.equal(pages.reduce((sum, p) => sum + p.indices.length, 0), 12956);
assert.equal(rowKey.length, 256);
assert(rowKey.every(x => Number.isInteger(x) && x >= 0 && x < 256));

/**
 * Two unkeyed, natural 28-label encodings of each nonzero GP29 successor.
 * @param {'cyclic'|'sorted'} rank
 * @param {number} previous
 * @param {number} current
 * @returns {number}
 */
function stepRank(rank, previous, current) {
  assert.notEqual(previous, current);
  return rank === 'cyclic' ? (current - previous + 29) % 29 - 1 : current > previous ? current - 1 : current;
}

/** @param {'cyclic'|'sorted'} rank @returns {number[]} */
function extract(rank) {
  const result = [];
  for (const p of pages) {
    for (let i = 1; i < p.indices.length; i++) {
      const a = p.indices[i - 1];
      const b = p.indices[i];
      if (a !== b) result.push(stepRank(rank, a, b));
    }
  }
  return result;
}

const original = {cyclic: extract('cyclic'), sorted: extract('sorted')};
assert.equal(original.cyclic.length, 12815);
assert.equal(original.sorted.length, 12815);
assert.equal(pages.reduce((sum, p) => sum + p.indices.length - 1, 0) - original.cyclic.length, 86);

/**
 * @typedef {{rank:'cyclic'|'sorted', reverse:boolean, key: {name:string,values:number[]},
 * origin:number, clock:'packet'|'digit', reducer:'mod'|'scaled',
 * sign:number}} Setting
 */

/** @param {Setting} option @param {number} i @param {number} width */
function shift(option, i, width) {
  const sourcePos = option.clock === 'packet' ? Math.floor(i / width) : i;
  const byte = option.key.values[(sourcePos + option.origin) % 256];
  return option.reducer === 'mod' ? byte % 28 : Math.floor(byte * 28 / 256);
}

/**
 * Reverse printed packet digit order if specified; unmask all source digits.
 * The resulting labels can still be subject to a completely secret 28! mapping.
 * @param {number[]} source
 * @param {Setting} option
 * @param {number} width
 * @returns {number[]}
 */
function unwhiten(source, option, width) {
  const result = source.slice();
  const groups = Math.floor(source.length / width);
  for (let packet = 0; packet < groups; packet++) {
    for (let j = 0; j < width; j++) {
      const i = packet * width + j;
      const sourceIndex = packet * width + (option.reverse ? width - 1 - j : j);
      result[i] = (source[sourceIndex] + option.sign * shift(option, i, width) + 56) % 28;
    }
  }
  return result;
}

/**
 * Five radix-28 digits encode all three-byte integers only if the candidate
 * secret symbol labelled 27 has no more than nine possible second symbols.
 * @param {number[]} labels
 */
function fiveGate(labels) {
  const followers = Array.from({length: 28}, () => new Set());
  let invalidWithVisibleOrder = 0;
  const groups = Math.floor(labels.length / 5);
  for (let p = 0; p < groups; p++) {
    const i = p * 5;
    followers[labels[i]].add(labels[i + 1]);
    let value = 0;
    for (let j = 0; j < 5; j++) value = value * 28 + labels[i + j];
    if (value >= 256 ** 3) invalidWithVisibleOrder++;
  }
  return {minFollowers: Math.min(...followers.map(x => x.size)), invalidWithVisibleOrder};
}

/**
 * Ten radix-28 digits can only encode six-byte integers if radix digit 27
 * never occurs in the first position. Test the necessary condition without
 * knowing which secret source label is digit 27.
 * @param {number[]} labels
 */
function tenGate(labels) {
  const starts = new Set();
  const groups = Math.floor(labels.length / 10);
  for (let p = 0; p < groups; p++) starts.add(labels[p * 10]);
  return {distinctLeaders: starts.size};
}

/** @returns {Setting[]} */
function settings() {
  const result = [];
  for (const rank of ['cyclic', 'sorted']) {
    for (const reverse of [false, true]) {
      for (const key of keys) {
        for (const origin of [0, 80]) {
          for (const clock of ['packet', 'digit']) {
            for (const reducer of ['mod', 'scaled']) {
              for (const sign of [-1, 1]) {
                result.push({rank, reverse, key, origin, clock, reducer, sign});
              }
            }
          }
        }
      }
    }
  }
  return result;
}

const variants = settings();
assert.equal(variants.length, 128);
let minFollowers = Infinity;
let maxFollowers = -Infinity;
let minInvalid = Infinity;
let maxInvalid = -Infinity;
let minLeaders = Infinity;
for (const v of variants) {
  const g5 = fiveGate(unwhiten(original[v.rank], v, 5));
  const g10 = tenGate(unwhiten(original[v.rank], v, 10));
  minFollowers = Math.min(minFollowers, g5.minFollowers);
  maxFollowers = Math.max(maxFollowers, g5.minFollowers);
  minInvalid = Math.min(minInvalid, g5.invalidWithVisibleOrder);
  maxInvalid = Math.max(maxInvalid, g5.invalidWithVisibleOrder);
  minLeaders = Math.min(minLeaders, g10.distinctLeaders);
  assert(g5.minFollowers > 9, 'impossible secret 28-way mapping accepted for five-digit packet');
  assert.equal(g10.distinctLeaders, 28, 'forbidden top digit may be absent');
}
assert.equal(minFollowers, 21);
assert.equal(maxFollowers, 26);
assert.equal(minInvalid, 47);
assert.equal(maxInvalid, 93);
assert.equal(minLeaders, 28);

/**
 * A deterministic, independent synthetic positive. Uses exact source page
 * lengths, initial runes, repeat-mask positions and source numeric table,
 * but generates an independent byte plaintext and secret 28-way alphabet.
 *
 * @param {number} packetWidth 5 for 3 bytes or 10 for 6 bytes
 * @param {number} bytesPerPacket
 */
function positive(packetWidth, bytesPerPacket) {
  const option = {rank: 'cyclic', reverse: false, key: keys[0], origin: 0,
    clock: 'packet', reducer: 'mod', sign: 1};
  let state = packetWidth === 5 ? 0x33015693 : 0x3301560a;
  function next() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  }
  const perm = Array.from({length: 28}, (_, i) => i);
  for (let j = 27; j > 0; j--) {
    const k = next() % (j + 1);
    [perm[j], perm[k]] = [perm[k], perm[j]];
  }
  const inverse = Array.from({length: 28});
  for (let i = 0; i < 28; i++) inverse[perm[i]] = i;
  const groups = Math.floor(12815 / packetWidth);
  const payload = Array.from({length: groups * bytesPerPacket}, () => next() % 256);
  const clearDigits = [];
  for (let i = 0; i < payload.length; i += bytesPerPacket) {
    let value = 0;
    for (let j = 0; j < bytesPerPacket; j++) value = value * 256 + payload[i + j];
    const digits = Array.from({length: packetWidth}, () => 0);
    for (let j = packetWidth - 1; j >= 0; j--) {
      digits[j] = value % 28;
      value = Math.floor(value / 28);
    }
    assert.equal(value, 0);
    clearDigits.push(...digits);
  }
  while (clearDigits.length < 12815) clearDigits.push(next() % 28);
  const rawDigits = clearDigits.map((digit, i) =>
    (inverse[digit] - shift(option, i, packetWidth) + 28) % 28);
  const reconstructedPages = [];
  let offset = 0;
  for (const p of pages) {
    const target = [p.indices[0]];
    for (let i = 1; i < p.indices.length; i++) {
      const previous = target[i - 1];
      if (p.indices[i] === p.indices[i - 1]) {
        target.push(previous);
      } else {
        target.push((previous + rawDigits[offset++] + 1) % 29);
      }
    }
    reconstructedPages.push(target);
  }
  assert.equal(offset, 12815);
  const readDigits = [];
  for (const p of reconstructedPages) {
    for (let i = 1; i < p.length; i++) {
      if (p[i] !== p[i - 1]) readDigits.push(stepRank('cyclic', p[i - 1], p[i]));
    }
  }
  assert.deepEqual(readDigits, rawDigits);
  const recovered = unwhiten(readDigits, option, packetWidth).map(x => perm[x]);
  assert.deepEqual(recovered.slice(0, groups * packetWidth), clearDigits.slice(0, groups * packetWidth));
  const receivedBytes = [];
  for (let i = 0; i < groups * packetWidth; i += packetWidth) {
    let value = 0;
    for (let j = 0; j < packetWidth; j++) value = value * 28 + recovered[i + j];
    const block = Array.from({length: bytesPerPacket}, () => 0);
    for (let j = bytesPerPacket - 1; j >= 0; j--) {
      block[j] = value % 256;
      value = Math.floor(value / 256);
    }
    assert.equal(value, 0);
    receivedBytes.push(...block);
  }
  assert.deepEqual(receivedBytes, payload);
  if (packetWidth === 5) {
    assert(fiveGate(unwhiten(readDigits, option, 5)).minFollowers <= 9);
  } else {
    assert(tenGate(unwhiten(readDigits, option, 10)).distinctLeaders <= 27);
  }
  return {packets: groups, bytesRecovered: receivedBytes.length, pageRunesRecovered: 12956};
}
// Independent original visual-chapter reset: p40..53 has 3,008 runes over
// 13 rune-bearing pages (p50 is runeless). The 18 exact doublets are excluded.
// An independently keyed chapter-specific secret alphabet still needs a source
// label missing from ten-digit packet starts. None is missing in any setting.
const p40to53 = pages.filter(p => p.page >= 40 && p.page <= 53);
assert.equal(p40to53.length, 13);
assert.equal(p40to53.reduce((sum, p) => sum + p.indices.length, 0), 3008);
function chapterSteps(rank) {
  const result = [];
  for (const p of p40to53) {
    for (let i = 1; i < p.indices.length; i++) {
      const a = p.indices[i - 1], b = p.indices[i];
      if (a !== b) result.push(stepRank(rank, a, b));
    }
  }
  return result;
}
const originalChapter = {cyclic: chapterSteps('cyclic'), sorted: chapterSteps('sorted')};
assert.equal(originalChapter.cyclic.length, 2977);
assert.equal(originalChapter.sorted.length, 2977);
const chapterTenLeaders = variants.map(v =>
  tenGate(unwhiten(originalChapter[v.rank], v, 10)).distinctLeaders);
assert(chapterTenLeaders.every(n => n === 28),
  'a secret chapter-specific 28-way alphabet can avoid a forbidden leader');

const plant5 = positive(5, 3);
const plant10 = positive(10, 6);

console.log(JSON.stringify({
  source: {runes: 12956, pageIVs: 55, adjacentRepeats: 86, nonzeroSteps: 12815},
  sourceKeyBytes: rowKey.length,
  testedSettingsPerPacketWidth: variants.length,
  visualChapterP40to53: {runes: 3008, pageIVs: 13, adjacentRepeats: 18,
    nonzeroSteps: 2977, completeTenDigitPackets: 297,
    perChapterClockWithSecretChapterAlphabet: {testedSettings: variants.length,
      minDistinctLeaders: Math.min(...chapterTenLeaders), allModelsExcluded: true}},
  fiveToThree: {minFollowers, maxFollowers, secretAlphabetNecessaryMaximum: 9,
    visibleOrderInvalidPackets: [minInvalid, maxInvalid], validSyntheticPlant: plant5},
  tenToSix: {minDistinctLeaders: minLeaders, secretAlphabetNecessaryMaximum: 27,
    validSyntheticPlant: plant10},
  decision: 'Both complete binary-packet transports excluded under all 128 tested table-key readings, even with a secret fixed 28-way alphabet; the source does not specify the architecture.'
}, null, 2));
