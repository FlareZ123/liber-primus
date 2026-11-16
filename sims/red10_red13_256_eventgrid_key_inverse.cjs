'use strict';

/**
 * Corrected LP2 event-tape inversion test:
 * 225 red runes + 30 red13 marks + the p49 red10 table-opener = 256 events.
 * Excludes the p7 black five-dot motif erroneously recorded as black13.
 * Tests the mixed marker alphabet (13-dot=29, p49 10-dot=30) as eight
 * 256-bit section keys and as an XOR mask on the 256-byte base-60 grid.
 * Training uses early section halves; untouched latter halves are holdout.
 *
 * Run: node sims/red10_red13_256_eventgrid_key_inverse.cjs
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { inputs, cipherBytes, assign } = require('./grid_section_column_keys.cjs');
const { encode } = require('./grid_keyskip_viterbi.cjs');

const ROOT = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');
const annotation = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = inputs();
const original = new Map(corpus.pages.map((p) => [p.page, p]));
const runeIds = new Map(corpus.runes.map((c, i) => [c, i]));
const MOD = 29;
const signed = (a) => (a % MOD + MOD) % MOD;

/** @returns {{ordered:(number|null)[],red:number[]}} */
function eventCorpus() {
  const red = [];
  const ordered = [];
  const mixed = [];
  const markers = [];
  let dots13 = 0;
  let dots10 = 0;
  for (const page of annotation.pages) {
    const authentic = original.get(page.page);
    assert(authentic);
    const entries = [];
    for (const span of page.red_spans || []) {
      for (let j = 0; j < span.length; j++) {
        const val = runeIds.get([...span.runes][j]);
        assert.notEqual(val, undefined);
        assert.equal(authentic.indices[span.start + j], val);
        entries.push({ pos: span.start + j, kind: 1, val, marker: null });
      }
    }
    for (const mark of page.large_punctuation || []) {
      if (mark[1] === 13 && mark[2] === 'red') {
        entries.push({ pos: mark[0], kind: 0, val: null, marker: 29 });
        dots13++;
      }
      if (page.page === 49 && mark[1] === 10 && mark[2] === 'red') {
        entries.push({ pos: mark[0], kind: 0, val: null, marker: 30 });
        dots10++;
      }
    }
    entries.sort((a, b) => a.pos - b.pos || a.kind - b.kind);
    for (const e of entries) {
      ordered.push(e.val);
      mixed.push(e.val === null ? e.marker : e.val);
      if (e.val !== null) red.push(e.val);
      else markers.push(e.marker);
    }
  }
  assert.equal(red.length, 225);
  assert.equal(dots13, 30);
  assert.equal(dots10, 1);
  assert.equal(markers.length, 31);
  assert.equal(ordered.length, 256);
  assert.equal(mixed.length, 256);
  return { ordered, mixed, markers, red, dots13, dots10 };
}

const eventData = eventCorpus();
const TABLE = Buffer.from(JSON.parse(read('resources/liber-primus/base60-grid.json')).byte_rows.flat());
assert.equal(TABLE.length, 256);

/**
 * Freeze the complete finite, source-motivated family before looking at
 * original decoded scores.
 *
 * @param {number[]} red 225 rune indices in chosen order.
 * @returns {{name:string,keys:number[][]}[]}
 */
function keyFamilies(red) {
  const families = [];
  for (const geometry of ['chronological', 'interior']) {
    for (const marker of [0, 13, 29]) {
      /** @type {number[]} */
      const positions = Array(256).fill(marker);
      if (geometry === 'chronological') {
        let j = 0;
        for (let i = 0; i < 256; i++) {
          if (eventData.ordered[i] !== null) positions[i] = red[j++];
        }
        assert.equal(j, 225);
      } else {
        let j = 0;
        for (let y = 1; y < 16; y++) {
          for (let x = 1; x < 16; x++) positions[y * 16 + x] = red[j++];
        }
      }

      for (const gridXor of [false, true]) {
        const bytes = Buffer.from(positions.map((c, i) => gridXor ? c ^ TABLE[i] : c));
        for (const layout of ['chunks', 'columns']) {
          const pieces = Array.from({ length: 8 }, (_, i) =>
            layout === 'chunks' ? [...bytes.subarray(i * 32, (i + 1) * 32)] :
              [...bytes].filter((_, j) => j % 8 === i));
          for (const sha of [false, true]) {
            const keys = sha ? pieces.map(p =>
              [...crypto.createHash('sha256').update(Buffer.from(p)).digest()]) : pieces;
            assert(keys.every(k => k.length === 32));
            families.push({
              name: [geometry, 'mark' + marker, gridXor ? 'xor-grid' : 'raw',
                layout, sha ? 'sha256' : 'direct'].join('/'),
              keys,
            });
          }
        }
      }
    }
  }
  // Preserve the two source-defined marker classes rather than collapsing
  // every punctuation event to one fitted fill value.
  for (const geometry of ['chronological-mixed', 'interior-mixed']) {
    const positions = Array(256).fill(0);
    if (geometry === 'chronological-mixed') {
      let j = 0;
      for (let i = 0; i < 256; i++) {
        positions[i] = eventData.ordered[i] === null ? eventData.mixed[i] : red[j++];
      }
      assert.equal(j, 225);
    } else {
      let j = 0;
      for (let y = 1; y < 16; y++) {
        for (let x = 1; x < 16; x++) positions[y * 16 + x] = red[j++];
      }
      assert.equal(j, 225);
      // The 31 remaining header cells are row 0 followed by column 0.
      const header = Array.from({ length: 16 }, (_, i) => i)
        .concat(Array.from({ length: 15 }, (_, i) => (i + 1) * 16));
      assert.equal(header.length, eventData.markers.length);
      header.forEach((index, i) => { positions[index] = eventData.markers[i]; });
    }

    for (const gridXor of [false, true]) {
      const bytes = Buffer.from(positions.map((c, i) => gridXor ? c ^ TABLE[i] : c));
      for (const layout of ['chunks', 'columns']) {
        const pieces = Array.from({ length: 8 }, (_, i) =>
          layout === 'chunks' ? [...bytes.subarray(i * 32, (i + 1) * 32)] :
            [...bytes].filter((_, j) => j % 8 === i));
        for (const sha of [false, true]) {
          const keys = sha ? pieces.map(p =>
            [...crypto.createHash('sha256').update(Buffer.from(p)).digest()]) : pieces;
          assert(keys.every(k => k.length === 32));
          families.push({
            name: [geometry, gridXor ? 'xor-grid' : 'raw', layout,
              sha ? 'sha256' : 'direct'].join('/'),
            keys,
          });
        }
      }
    }
  }
  assert.equal(families.length, 64);
  return families;
}

/**
 * Fixed GP rune uniformity diagnostic.
 * @param {number[]} c actual rune indices
 * @param {Buffer} pad running key stream
 * @param {number} from first local offset
 * @param {number} to exclusive local offset
 * @param {number} sign key sign
 * @param {boolean} scaled convert byte to 29 bins by scaling
 * @returns {number}
 */
function score(c, pad, from, to, sign, scaled) {
  const counts = new Uint16Array(MOD);
  for (let i = from; i < to; i++) {
    const key = scaled ? Math.floor(pad[i] * MOD / 256) : pad[i] % MOD;
    counts[signed(c[i] + sign * key)]++;
  }
  let sum = 0;
  for (const n of counts) sum += n * (n - 1);
  return sum / ((to - from) * (to - from - 1));
}

/**
 * Search the whole fixed source/cipher family on first-half runes only,
 * then freeze the best mode and assignment and score untouched second half.
 * @param {number[][]} groups eight actual or planted LP2 rune sections
 * @param {number[]} red 225 original source event GP indices
 * @returns {object}
 */
function search(groups, red) {
  const sizes = groups.map(g => g.length);
  const cuts = sizes.map(n => Math.floor(n * 0.45));
  const trainN = cuts.reduce((a, b) => a + b, 0);
  const holdN = sizes.reduce((a, b) => a + b, 0) - trainN;
  const len = Math.max(...sizes);
  let best = { train: -Infinity };

  for (const family of keyFamilies(red)) {
    for (const algorithm of ['aes-256-ctr', 'chacha20']) {
      for (const reverse of [false, true]) {
        const streams = family.keys.map(k => cipherBytes(reverse ? k.slice().reverse() : k, algorithm, len));
        for (const scaled of [false, true]) for (const sign of [-1, 1]) {
          const w = groups.map((g, i) =>
            streams.map(p => cuts[i] * score(g, p, 0, cuts[i], sign, scaled)));
          const found = assign(w);
          const train = found.sum / trainN;
          if (train <= best.train) continue;

          const hold = groups.reduce((total, g, i) => total +
            (g.length - cuts[i]) * score(g, streams[found.assignment[i]],
              cuts[i], g.length, sign, scaled), 0) / holdN;

          best = {
            train, hold, family: family.name, algorithm, reverse,
            scaled, sign, assignment: found.assignment,
            individualHold: groups.map((g, i) => score(g, streams[found.assignment[i]],
              cuts[i], g.length, sign, scaled)),
          };
        }
      }
    }
  }
  return best;
}

/** @param {number} seed */
function makeRng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {number[]} originalRed @param {()=>number} random */
function shuffledRed(originalRed, random) {
  const a = originalRed.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = random() % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function plant(red) {
  const gp = encode(read('resources/control/shakespeare_first300k.txt'));
  const lengths = source.groups.map(g => g.length);
  const needed = lengths.reduce((a, b) => a + b, 0);
  assert(gp.length >= needed);
  const keySource = keyFamilies(red).find(x =>
    x.name === 'chronological/mark13/xor-grid/columns/sha256');
  assert(keySource);
  const actualPlain = gp.slice(100, 100 + needed);
  const plantGroups = [];
  let offset = 0;
  for (let i = 0; i < 8; i++) {
    const n = lengths[i];
    const pad = cipherBytes(keySource.keys[(i + 3) % 8], 'aes-256-ctr', n);
    plantGroups.push(Array.from({ length: n }, (_, j) =>
      (actualPlain[offset + j] + pad[j] % MOD) % MOD));
    offset += n;
  }
  const test = search(plantGroups, red);
  // An actual exact section-level round trip exists independently of the
  // adversarial blind model search.
  let roundtripped = 0;
  offset = 0;
  for (let i = 0; i < 8; i++) {
    const pad = cipherBytes(keySource.keys[(i + 3) % 8], 'aes-256-ctr', lengths[i]);
    for (let j = 0; j < lengths[i]; j++) {
      const p = signed(plantGroups[i][j] - pad[j] % MOD);
      if (p === actualPlain[offset + j]) roundtripped++;
    }
    offset += lengths[i];
  }
  assert.equal(roundtripped, needed);
  assert(test.hold > 0.045, 'Blind solver must find original-like GP structure');
  return { total: needed, exactRoundtrip: roundtripped, blind: test };
}

function main() {
  const red = eventData.red;
  const actual = search(source.groups, red);
  const synthetic = plant(red);
  const random = makeRng(0x33012513);
  const nullScores = [];
  for (let i = 0; i < 60; i++) {
    nullScores.push(search(source.groups, shuffledRed(red, random)).hold);
  }
  const outrank = nullScores.filter(s => s >= actual.hold).length;
  console.log(JSON.stringify({
    eventSource: { red: red.length, dot13: eventData.dots13, dot10: eventData.dots10,
      mixedEvents: eventData.mixed.length },
    modelCount: 64 * 2 * 2 * 2 * 2,
    original: actual,
    synthetic,
    null: {
      n: nullScores.length,
      mean: nullScores.reduce((a, b) => a + b, 0) / nullScores.length,
      countGeOriginal: outrank,
      addOneUpperTail: (outrank + 1) / (nullScores.length + 1),
      max: Math.max(...nullScores),
    },
    conclusion: 'Conditional source-key model test; an unverified hypothesis until original GP plaintext is recovered.',
  }, null, 2));
}

if (require.main === module) main();
module.exports = { eventCorpus, keyFamilies, search };
