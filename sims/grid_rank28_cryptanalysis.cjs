'use strict';
/**
 * Exact predecessor-excluding rank-28 ciphertext inversion with the eight
 * original 32-byte base60 LP2 grid columns as AES-CTR or ChaCha20 stream keys.
 * All eight keys assigned bijectively by exact subset DP, no fitted alphabet.
 *
 * The missing 29th predecessor-equality rune is treated as an erasure, not
 * interpreted as GP EA. The test is intentionally strict and reversible
 * on every non-erasure symbol, with a fully hidden source-key plant.
 *
 * Original fixed-source attack; Node.js 22, CommonJS, no writes.
 * @module grid_rank28_cryptanalysis
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { encodeEnglish, seededRandom } = require('./outer_permutation_assignment.cjs');
const ROOT = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const RUNES = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const LOOKUP = new Map(RUNES.map((glyph, i) => [glyph, i]));
const GROUP_LENGTHS = [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316];
const SPLIT = 0.55;
const MOD = 28;
const SETTINGS = [];
for (const scheme of ['sorted', 'cyclic'])
for (const cipher of ['aes-256-ctr', 'chacha20'])
for (const reverse of [false, true])
for (const reducer of ['mod', 'scaled'])
for (const sign of [-1, 1])
  SETTINGS.push({ scheme, cipher, reverse, reducer, sign });
assert.equal(SETTINGS.length, 32);

/** @param {number} x @param {number} n @returns {number} */
const mod = (x, n) => ((x % n) + n) % n;

/** @returns {number[][]} Sectioned source GP integer ciphertext. */
function originalGroups() {
  const original = read('resources/lp2-transcription.txt');
  const normalized = original.split('%').slice(0, 55).join('%')
    .replace(/[\r\n\t\/% ]/g, '');
  const groups = normalized.split('$').map(section =>
    [...section].filter(rune => LOOKUP.has(rune)).map(rune => LOOKUP.get(rune)))
    .filter(group => group.length);
  assert.deepEqual(groups.map(group => group.length), GROUP_LENGTHS);
  return groups;
}

/** @returns {Buffer[]} Actual eight 32-byte vertical columns. */
function sourceKeys() {
  const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
  assert.equal(grid.byte_rows.length, 32);
  assert.ok(grid.byte_rows.every(row => row.length === 8));
  const raw = Buffer.from(grid.byte_rows.flat());
  assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),
    '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
  return Array.from({length: 8}, (_, column) =>
    Buffer.from(grid.byte_rows.map(row => row[column])));
}

/**
 * @param {number[][]} groups
 * @param {'sorted'|'cyclic'} scheme
 * @returns {number[][]}
 */
function ranks(groups, scheme) {
  let previous = 0, started = false;
  return groups.map(group => group.map(ciphertext => {
    let rank = -1;
    if (started && ciphertext !== previous) {
      rank = scheme === 'sorted' ?
        ciphertext - Number(ciphertext > previous) :
        mod(ciphertext - previous - 1, 29);
    }
    previous = ciphertext;
    started = true;
    return rank;
  }));
}

/**
 * @param {number} residue
 * @param {number} previous
 * @param {'sorted'|'cyclic'} scheme
 * @returns {number}
 */
function forwardRank(residue, previous, scheme) {
  return scheme === 'sorted' ? residue + Number(residue >= previous) :
    (previous + residue + 1) % 29;
}

/**
 * @param {Buffer} key
 * @param {object} setting
 * @param {number} count
 * @returns {Uint8Array}
 */
function keyStream(key, setting, count) {
  const actual = setting.reverse ? Buffer.from(key).reverse() : key;
  const cipher = crypto.createCipheriv(setting.cipher, actual, Buffer.alloc(16));
  const bytes = Buffer.concat([cipher.update(Buffer.alloc(count)), cipher.final()]);
  return Uint8Array.from(bytes, byte =>
    setting.reducer === 'mod' ? byte % MOD : Math.floor(MOD * byte / 256));
}

/** @returns {number[]} GP-English prior projected into 28 rank states. */
function englishModel() {
  const shakespeare = read('resources/control/shakespeare_first300k.txt');
  const reference = encodeEnglish(shakespeare.slice(0, 180000));
  const counts = new Float64Array(MOD).fill(0.5);
  for (const x of reference) counts[x % MOD]++;
  const total = counts.reduce((a, b) => a + b, 0);
  const prior = Array.from(counts, value => Math.log(value / total));
  const control = encodeEnglish(shakespeare.slice(180000));
  assert.ok(control.length >= GROUP_LENGTHS.reduce((a, b) => a + b, 0));
  return { prior, control: control.map(value => value % MOD) };
}

/**
 * @param {number[]} ranksArray
 * @param {Uint8Array} pad
 * @param {number[]} logPrior
 * @param {number} sign
 * @returns {{train:number,holdout:number}}
 */
function score(ranksArray, pad, logPrior, sign) {
  const boundary = Math.floor(ranksArray.length * SPLIT);
  let train = 0, holdout = 0;
  for (let i = 0; i < ranksArray.length; i++) {
    if (ranksArray[i] === -1) continue;
    const value = mod(ranksArray[i] - sign * pad[i], MOD);
    if (i < boundary) train += logPrior[value];
    else holdout += logPrior[value];
  }
  return { train, holdout };
}

/** Exact maximum-weight bijective section-to-column assignment via 8-bit DP. */
function assignment(matrix) {
  const states = 256, dp = new Float64Array(states).fill(-Infinity);
  const previous = new Int16Array(states).fill(-1);
  const chosen = new Int8Array(states).fill(-1);
  dp[0] = 0;
  for (let mask = 0; mask < states; mask++) {
    if (!Number.isFinite(dp[mask])) continue;
    let section = 0;
    for (let bits = mask; bits; bits &= bits - 1) section++;
    if (section === 8) continue;
    for (let column = 0; column < 8; column++) {
      if (mask & (1 << column)) continue;
      const next = mask | (1 << column);
      const n = dp[mask] + matrix[section][column];
      if (n > dp[next]) {
        dp[next] = n; previous[next] = mask; chosen[next] = column;
      }
    }
  }
  const order = Array(8);
  let mask = 255;
  for (let section = 7; section >= 0; section--) {
    order[section] = chosen[mask];
    mask = previous[mask];
  }
  assert.equal(mask, 0);
  return { order, train: dp[255] };
}

/**
 * @param {number[][]} originalRanked
 * @param {Buffer[]} keys
 * @param {object} setting
 * @param {number[]} logPrior
 * @returns {object}
 */
function evaluateOne(originalRanked, keys, setting, logPrior) {
  const matrix = [], held = [];
  for (const group of originalRanked) {
    const ranksForGroup = [], heldGroup = [];
    for (const key of keys) {
      const values = score(group, keyStream(key, setting, group.length), logPrior, setting.sign);
      ranksForGroup.push(values.train);
      heldGroup.push(values.holdout);
    }
    matrix.push(ranksForGroup);
    held.push(heldGroup);
  }
  const best = assignment(matrix);
  return {
    setting,
    order: best.order,
    train: best.train,
    holdout: best.order.reduce((acc, col, i) => acc + held[i][col], 0),
  };
}

/** @param {number[][]} observed @param {Buffer[]} keys @param {number[]} logPrior */
function scan(observed, keys, logPrior) {
  const cache = Object.fromEntries(['sorted', 'cyclic'].map(s => [s, ranks(observed, s)]));
  return SETTINGS.map(setting => evaluateOne(cache[setting.scheme], keys, setting, logPrior))
    .sort((a, b) => b.train - a.train);
}

/**
 * Hidden-key positive: GP-English projected to rank28 and encoded via a
 * complete plaintext-dependent source-key path with 0.7% marked repeat noise.
 *
 * @param {number[]} plaintext
 * @param {Buffer[]} keys
 * @param {number[]} order
 * @param {object} setting
 * @returns {{groups:number[][],erased:number,correct:number}}
 */
function planted(plaintext, keys, order, setting) {
  const random = seededRandom(0x1283301);
  let previous = 0, total = 0, erased = 0, correct = 0;
  const groups = GROUP_LENGTHS.map((count, groupIndex) => {
    const key = keyStream(keys[order[groupIndex]], setting, count);
    const output = [];
    for (let i = 0; i < count; i++) {
      const input = plaintext[total++];
      const rank = mod(input + setting.sign * key[i], MOD);
      let ciphertext = forwardRank(rank, previous, setting.scheme);
      if (random() < 0.007) {
        ciphertext = previous;
        erased++;
      } else {
        correct++;
      }
      output.push(ciphertext);
      previous = ciphertext;
    }
    return output;
  });
  assert.equal(correct + erased, plaintext.length);
  assert.ok(erased > 30 && erased < 150);
  return { groups, erased, correct };
}

/** @param {Buffer[]} keys @param {()=>number} random */
function shuffleSourceKeys(keys, random) {
  return keys.map(key => {
    const out = Buffer.from(key);
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  });
}

/** @returns {object} Original and hidden-source positive test. */
function run() {
  const original = originalGroups(), keys = sourceKeys(), language = englishModel();
  const real = scan(original, keys, language.prior);
  const truth = {scheme: 'cyclic', cipher: 'aes-256-ctr',
    reverse: false, reducer: 'mod', sign: 1};
  const order = [5, 2, 6, 1, 7, 0, 4, 3];
  const plant = planted(language.control.slice(0, 12956), keys, order, truth);
  const positives = scan(plant.groups, keys, language.prior);
  const first = positives[0];
  const isTrue = a => JSON.stringify(a.setting) === JSON.stringify(truth) &&
    JSON.stringify(a.order) === JSON.stringify(order);
  assert.ok(isTrue(first), 'original-grid key configuration not recovered by positive control');
  const recovered = ranks(plant.groups, truth.scheme);
  let matched = 0, positions = 0;
  let start = 0;
  for (let section = 0; section < 8; section++) {
    const pad = keyStream(keys[order[section]], truth, GROUP_LENGTHS[section]);
    for (let i = 0; i < pad.length; i++) {
      const rank = recovered[section][i];
      if (rank < 0) continue;
      positions++;
      matched += Number(mod(rank - pad[i], MOD) === language.control[start + i]);
    }
    start += GROUP_LENGTHS[section];
  }
  assert.equal(matched, positions);
  assert.ok(positions > 12800);
  const random = seededRandom(0x12a32801);
  const nullTop = [];
  for (let i = 0; i < 12; i++) {
    const shuffled = shuffleSourceKeys(keys, random);
    const winner = scan(original, shuffled, language.prior)[0];
    nullTop.push({train:winner.train,holdout:winner.holdout});
  }
  return {
    source:'Original eight base60 32-byte vertical columns, all unsolved LP2 runes',
    groups:GROUP_LENGTHS, settings:SETTINGS.length, exactColumnBijections:40320,
    register:'GP-English Shakespeare first 180k, 29th rune projected into rank residue0',
    loss:'Actual 29th previous-equality output treated as erasure; no plaintext imputed there',
    realBestTrain:real.slice(0,5),
    truePlant:{truth,assignment:order,erasureCount:plant.erased,
      exactDecoded:matched,totalDecodable:positions,
      scannerWinner:first,correctTop:isTrue(first)},
    shuffledGrid:{
      replicates:nullTop.length,
      trainAtLeastReal:nullTop.filter(x=>x.train>=real[0].train).length,
      holdoutAtLeastReal:nullTop.filter(x=>x.holdout>=real[0].holdout).length,
      scores:nullTop
    },
    caveat:'The 28-rank source register and eight-column stream cipher are test hypotheses, not authenticated Cicada key usage. This test does not cover alternative IVs, nontrivial grid KDFs, unknown substitution after rank encryption, or hidden key-consumption skips.'
  };
}
if (require.main === module)
  process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
module.exports = { originalGroups, sourceKeys, ranks, forwardRank, keyStream,
  assignment, score, scan, planted, run };
