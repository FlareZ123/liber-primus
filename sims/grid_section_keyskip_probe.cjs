'use strict';
/**
 * Section-continuous AES/ChaCha grid-column keys, allowing collision-triggered
 * 0-2 additional key draws per rune, exact Viterbi word-agnostic decoding.
 *
 * This extends the direct-key control in grid_section_column_keys.cjs with
 * actual key-pointer drift rather than source-independent output replacement.
 * Run: node sims/grid_section_keyskip_probe.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { inputs, cipherBytes } = require('./grid_section_column_keys.cjs');
const { decode, encrypt } = require('./mirror_jpeg_pad.cjs');
const { train, encode } = require('./grid_keyskip_viterbi.cjs');
const { headScore } = require('./mirror_jpeg_offsets.cjs');

const ROOT = path.resolve(__dirname, '..');
const WINDOW = 220;
const HEAD = 24;
const CONFIRM = 24;
const NULL_ROUNDS = 40;

/** @param {number[][]} cols */
function candidates(cols) {
  const out = [];
  for (const algorithm of ['aes-256-ctr', 'chacha20'])
    for (const reversed of [false, true])
      for (let col = 0; col < 8; col++) {
        const key = reversed ? cols[col].slice().reverse() : cols[col];
        const stream = cipherBytes(key, algorithm, 900);
        for (const scaled of [false, true]) {
          const pad = Uint8Array.from(stream, b => scaled ? Math.floor(29 * b / 256) : b % 29);
          for (const sign of [-1, 1])
            out.push({ algorithm, reversed, col, scaled, sign, key: pad,
              tag: algorithm + ':' + (reversed ? 'reverse' : 'forward') + ':col' + col
                + ':' + (scaled ? 'scale' : 'mod') + ':sign' + sign });
        }
      }
  assert.equal(out.length, 128);
  return out;
}

/**
 * @param {number[]} data
 * @param {ReturnType<typeof candidates>} keys
 * @param {ReturnType<typeof train>} lm
 */
function screen(data, keys, lm) {
  const head = data.slice(0, HEAD);
  const full = data.slice(0, WINDOW);
  assert.equal(full.length, WINDOW);
  const ranked = keys.map(key => ({
    key, short: headScore(head, key.key, 0, key.sign, lm)
  })).sort((a, b) => b.short - a.short);
  const finalists = ranked.slice(0, CONFIRM).map(r => ({
    short: r.short, full: decode(full, r.key.key, 0, r.key.sign, lm),
    tag: r.key.tag
  })).sort((a, b) => b.full.perRune - a.full.perRune);
  return { ranked, finalists };
}

/** @param {number} initial */
function rng(initial) {
  let x = initial >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}

/** @param {number[][]} columns @param {() => number} rand */
function shuffled(columns, rand) {
  return columns.map(column => {
    const a = column.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = rand() % (i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  });
}

function main() {
  const { groups, columnKeys } = inputs();
  const lm = train(fs.readFileSync(path.join(ROOT,
    'resources/control/shakespeare_first300k.txt'), 'utf8'));
  const choices = candidates(columnKeys);
  const solved = fs.readFileSync(path.join(ROOT,
    'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8');
  const sample = encode(solved.split('### 3')[1].split('### 4')[0]).slice(0, WINDOW);
  assert.equal(sample.length, WINDOW);
  const realKey = choices.find(x => x.algorithm === 'aes-256-ctr' && !x.reversed
    && x.col === 0 && !x.scaled && x.sign === 1);
  const planted = encrypt(sample, realKey.key, 0, 1, 0x452301c2);
  const control = screen(planted.cipher, choices, lm);
  const trueRank = control.ranked.findIndex(r => r.key.tag === realKey.tag) + 1;
  const verified = control.finalists.find(x => x.tag === realKey.tag);
  assert.ok(verified, 'Planted true key must survive top 24 head screen');
  const recovered = verified.full.plain.filter((p, i) => p === sample[i]).length;
  assert.ok(recovered >= 198, 'Planted exact key should recover at least 90% of text');
  console.log('PLANT', JSON.stringify({
    source: 'independent solved LP1 text', trueKey: realKey.tag, trueRank,
    recovered, total: WINDOW, plantedSkips: planted.skips,
    inferredSkips: verified.full.skips, score: verified.full.perRune,
    winner: control.finalists[0].tag, winnerScore: control.finalists[0].full.perRune
  }));

  const real = [];
  for (let i = 0; i < groups.length; i++) {
    const result = screen(groups[i], choices, lm);
    const top = result.finalists.slice(0, 3).map(x => ({
      key: x.tag, shortScore: x.short, fullScore: x.full.perRune,
      inferredSkips: x.full.skips, first48: x.full.plain.slice(0, 48)
    }));
    real.push({ group: i, groupLength: groups[i].length,
      bestHead: result.ranked[0].short, top });
    console.log('REAL', JSON.stringify(real[i]));
  }

  const rand = rng(0x45230219);
  const target = groups[0];
  let exceed = 0, mean = 0, largest = -Infinity;
  const actual = real[0].top[0].fullScore;
  for (let k = 0; k < NULL_ROUNDS; k++) {
    const fake = screen(target, candidates(shuffled(columnKeys, rand)), lm);
    const top = fake.finalists[0].full.perRune;
    if (top >= actual) exceed++;
    mean += top;
    largest = Math.max(largest, top);
  }
  console.log('NULL', JSON.stringify({
    group: 0, rounds: NULL_ROUNDS, shortWindow: HEAD, longWindow: WINDOW,
    candidatesPerGroup: 128, retained: CONFIRM,
    observedMax: actual, shuffledKeyMeanMax: mean / NULL_ROUNDS,
    shuffledKeyMax: largest, fullSearchCorrectedUpperTail: (exceed + 1) / (NULL_ROUNDS + 1)
  }));
}
if (require.main === module) main();
module.exports = { candidates, screen, shuffled };
