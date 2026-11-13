'use strict';
/**
 * Original-input historical-key gate.
 * Reproduce: node sims/lp2_2014_three_onion256_rank28_sft.cjs
 * Tests source-exact three labelled 2014 hex registers, the printed
 * 256-byte LP2 table, GP29 stream keys and 28-successor rank keys.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const source = read('resources/external/2014-stage05-three-onion-hex-blocks.txt');
const matches = [...source.matchAll(/string:\s*-\s*(\d+)\s*\r?\n([a-f0-9]{512})/gi)];
const labels = ['1033', '761', '3301'];
assert.deepEqual(matches.map(x => x[1]), labels);
const onions = matches.map(x => [...Buffer.from(x[2], 'hex')]);
assert(onions.every(x => x.length === 256));
const table = JSON.parse(read('resources/liber-primus/base60-grid.json')).byte_rows.flat();
assert.equal(table.length, 256);
const pages = JSON.parse(read('resources/liber-primus/lp2-corpus.json'))
  .pages.filter(p => p.page < 56 && p.indices.length > 0);
assert.equal(pages.length, 55);
const ciphertext = pages.flatMap(p => p.indices);
assert.equal(ciphertext.length, 12956);

/** @param {number[]} a @param {number} alphabet @returns {{ioc:number,maximum:number}} */
function profile(a, alphabet) {
  const freq = Array(alphabet).fill(0);
  for (const v of a) {
    assert(Number.isInteger(v) && v >= 0 && v < alphabet);
    freq[v]++;
  }
  return {ioc:freq.reduce((s, v) => s + v * (v - 1), 0) /
    (a.length * (a.length - 1)), maximum:Math.max(...freq)};
}

/** @typedef {{position:number,circular:number,absolute:number}} Transition */
/** @type {Transition[]} */
const transitions = [];
let position = 0, repeats = 0;
for (const p of pages) {
  for (let j = 1; j < p.indices.length; j++) {
    const prev = p.indices[j - 1], curr = p.indices[j];
    if (prev === curr) { repeats++; continue; }
    transitions.push({position:position + j,
      circular:(curr - prev + 28) % 29,
      absolute:curr - Number(curr > prev)});
  }
  position += p.indices.length;
}
assert.equal(position, 12956);
assert.equal(repeats, 86);
assert.equal(transitions.length, 12815);

/** @param {number} mask @param {boolean} grid @returns {number[]} */
function sourceKey(mask, grid) {
  const k = Array(256).fill(0);
  for (let i = 0; i < 3; i++) if (mask & (1 << i)) {
    for (let j = 0; j < 256; j++) k[j] ^= onions[i][j];
  }
  if (grid) for (let j = 0; j < 256; j++) k[j] ^= table[j];
  return k;
}

const binary = [], gp29 = [], rank28 = [];
for (let mask = 0; mask < 8; mask++) {
  for (const grid of [false, true]) {
    if (!mask && !grid) continue;
    const key = sourceKey(mask, grid);
    const label = labels.filter((_, i) => mask & (1 << i)).join('^') +
      (grid ? (mask ? '^TABLE' : 'TABLE') : '');
    const out = key.map((v, j) => v ^ table[j]);
    binary.push({label, printableASCII:out.filter(v => v >= 32 && v <= 126).length});
    for (const sign of [-1, 1]) {
      gp29.push({label, sign, ...profile(ciphertext.map((v, i) =>
        (v + 29 + sign * (key[i % 256] % 29)) % 29), 29)});
      for (const order of ['circular', 'absolute']) {
        rank28.push({label, sign, order,
          ...profile(transitions.map(t =>
            (t[order] + 28 + sign * (key[t.position % 256] % 28)) % 28), 28)});
      }
    }
  }
}
assert.equal(binary.length, 15);
assert.equal(gp29.length, 30);
assert.equal(rank28.length, 60);

// One independently constructed positive: a keyed 28-successor cipher
// MUST invert its own 256-symbol plaintext with the frozen state rule.
const key = sourceKey(4, true);
const planted = Array.from({length:256}, (_, i) => (7 * i + Math.floor(i / 13)) % 28);
let previous = 5;
const plantedCipher = planted.map((v, i) =>
  (previous = (previous + 1 + ((v + key[i] % 28) % 28)) % 29));
previous = 5;
const recovered = plantedCipher.map((v, i) => {
  const relative = (v - previous + 28) % 29;
  previous = v;
  return (relative - key[i] % 28 + 28) % 28;
});
assert.deepEqual(recovered, planted);

// Authentic solved-p56 key check. An independent p56 plaintext is fixed by
// its genuine consecutive-prime-totient cipher with one literal F at offset 56.
// A source-256 key used at p56 should predict this already solved shift stream.
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink56 = gp.pages[56].indices;
assert.equal(ink56.length, 85);
const gpTokens = gp.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
const knownP56English =
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO ' +
  'IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const nativeP56 = [];
for (const word of knownP56English.split(' ')) {
  for (let i = 0; i < word.length;) {
    const found = gpTokens.find(x => word.startsWith(x.token, i));
    assert(found, 'Missing native p56 GP token');
    nativeP56.push(found.index);
    i += found.token.length;
  }
}
assert.equal(nativeP56.length, 85);
/** @param {number} n @returns {number} */
function phi(n) {
  let count = 0;
  for (let j = 1; j <= n; j++) {
    let a = j, b = n;
    while (b) { const tmp = a % b; a = b; b = tmp; }
    if (a === 1) count++;
  }
  return count;
}
const primeList = [];
for (let x = 2; primeList.length < 90; x++) {
  let prime = true;
  for (let j = 2; j * j <= x; j++) {
    if (x % j === 0) {prime = false; break;}
  }
  if (prime) primeList.push(x);
}
let primeCursor = 0;
const authenticP56 = ink56.map((c, i) =>
  i === 56 ? 0 : (c - (phi(primeList[primeCursor++]) - 1) % 29 + 29) % 29);
assert.deepEqual(authenticP56, nativeP56);
assert.equal(primeCursor, 84);
const knownShift56 = ink56.map((c, i) => (c - nativeP56[i] + 29) % 29);
const originalP56Checks = [];
for (let mask = 0; mask < 8; mask++) {
  for (const grid of [false, true]) {
    if (!mask && !grid) continue;
    const source = sourceKey(mask, grid);
    for (const clock of ['p56-reset', 'terminal-76']) {
      const offset = clock === 'p56-reset' ? 0 : 76;
      for (const sign of [-1, 1]) {
        let matches = 0;
        for (let i = 0; i < ink56.length; i++) {
          if (i === 56) continue; // authentic transparent F is unencrypted
          const predicted = (29 + sign * (source[(offset + i) % 256] % 29)) % 29;
          matches += Number(predicted === knownShift56[i]);
        }
        originalP56Checks.push({mask, grid, clock, sign, matches});
      }
    }
  }
}
assert.equal(originalP56Checks.length, 60);
assert.equal(Math.max(...originalP56Checks.map(x => x.matches)), 9);
const positiveSource = sourceKey(5, true);
const nativeKnownPlant = authenticP56.map((v, i) =>
  (v + positiveSource[(76 + i) % 256] % 29) % 29);
assert.equal(nativeKnownPlant.filter((v, i) =>
  (v - authenticP56[i] + 29) % 29 === positiveSource[(76 + i) % 256] % 29).length, 85);

// Independently source-motivated but NOT authenticated p55 plaintext crib:
// solved LP1 p5's moth-linked terminal seven-word phrase has exactly the
// same seven source-native GP word lengths as p55's final seven body words.
/** @param {string} english @returns {number[]} */
function sourceNativeGP(english) {
  const s = english.replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const arr = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith('ING', i)) {arr.push(21); i += 3;}
    else if (s.startsWith('IO', i)) {arr.push(27); i += 2;}
    else {
      const token = gpTokens.find(x => s.startsWith(x.token, i));
      assert(token, 'Missing source-native token');
      arr.push(token.index);
      i += token.token.length;
    }
  }
  return arr;
}
const cribWords = 'THE TOTIENT FUNCTION IS SACRED ALL THINGS'
  .split(' ').map(sourceNativeGP);
assert.deepEqual(cribWords.map(w => w.length), [2, 7, 7, 2, 6, 3, 3]);
const candidateCrib = cribWords.flat();
assert.equal(candidateCrib.length, 30);
const last55 = gp.pages[55].indices.slice(-30);
assert.equal(gp.pages[55].indices.length - last55.length, 46);
const provisionalP55Matches = [];
for (let mask = 0; mask < 8; mask++) {
  for (const grid of [false, true]) {
    if (!mask && !grid) continue;
    const key = sourceKey(mask, grid);
    for (const sign of [-1, 1]) {
      const matches = candidateCrib.reduce((n, v, i) =>
        n + Number((last55[i] - v + 29) % 29 ===
          (sign * (key[46 + i] % 29) + 29) % 29), 0);
      provisionalP55Matches.push({mask, grid, sign, matches});
    }
  }
}
assert.equal(provisionalP55Matches.length, 30);
assert.equal(Math.max(...provisionalP55Matches.map(x => x.matches)), 3);

// Reused-byte-tape falsifier: the fully reassembled, historic 2013 Twitter
// 988×65-byte original puzzle string is independently source-captured.
const twitterRows = read('resources/cicada2013-twitter-hex-stream.txt')
  .trim().split(/\r?\n/);
assert.equal(twitterRows.length, 988);
const twitterTape = Array(64167).fill(-1);
for (const row of twitterRows) {
  const [address, hex] = row.split(/:\s*/);
  assert.match(address, /^[0-9a-f]{7}$/i);
  assert.match(hex, /^(?:[0-9a-f]{2})+$/i);
  const offset = Number.parseInt(address, 16);
  const bytes = [...Buffer.from(hex, 'hex')];
  for (let i = 0; i < bytes.length; i++) {
    assert.equal(twitterTape[offset + i], -1,
      '2013 tape must have no overlap or duplicate assignments');
    twitterTape[offset + i] = bytes[i];
  }
}
assert(twitterTape.every(v => v >= 0 && v <= 255));
/** @param {number[]} tape @param {number[]} needle
 * @returns {{length:number,tapeOffset:number,keyOffset:number}} */
function longestExactWindow(tape, needle) {
  const triplets = new Map();
  for (let j = 0; j < needle.length - 2; j++) {
    const h = (needle[j] << 16) | (needle[j + 1] << 8) | needle[j + 2];
    if (!triplets.has(h)) triplets.set(h, []);
    triplets.get(h).push(j);
  }
  let best = {length:0,tapeOffset:-1,keyOffset:-1};
  for (let i = 0; i < tape.length - 2; i++) {
    const h = (tape[i] << 16) | (tape[i + 1] << 8) | tape[i + 2];
    for (const j of triplets.get(h) || []) {
      let length = 3;
      while (i + length < tape.length && j + length < needle.length &&
        tape[i + length] === needle[j + length]) length++;
      if (length > best.length) {
        best = {length, tapeOffset:i, keyOffset:j};
      }
    }
  }
  return best;
}
const crossRoundExactTapeWindows = labels.map((label, i) =>
  ({label, ...longestExactWindow(twitterTape, onions[i])}));
crossRoundExactTapeWindows.push({
  label:'LP2 printed 256-byte table',
  ...longestExactWindow(twitterTape, table)
});
assert.deepEqual(crossRoundExactTapeWindows.map(x => x.length), [3,3,3,3]);
const tapeWithPlant = twitterTape.slice();
tapeWithPlant.splice(1000, 256, ...onions[0]);
const plantedReuse = longestExactWindow(tapeWithPlant, onions[0]);
assert.deepEqual(plantedReuse, {length:256, tapeOffset:1000, keyOffset:0});

/** @param {number[]} a @returns {[number,number]} */
const range = a => [Math.min(...a), Math.max(...a)];
const full = range(gp29.map(x => x.ioc));
const step = range(rank28.map(x => x.ioc));
const largest = range(rank28.map(x => x.maximum));
assert(Math.abs(full[0] - 0.03445151591665119) < 1e-12);
assert(Math.abs(full[1] - 0.03457204379898642) < 1e-12);
assert(Math.abs(step[0] - 0.03567811761679654) < 1e-12);
assert(Math.abs(step[1] - 0.035763044723871505) < 1e-12);
assert.deepEqual(largest, [485, 525]);
console.log(JSON.stringify({
  result:'PASS: 2014 three-source direct original-inverse gate, no plaintext',
  sourceLabels:labels, eachKeyLength:256, gridLength:table.length,
  originalCipherRunes:ciphertext.length, originalRepeats:repeats,
  originalNonrepeatTransitions:transitions.length,
  tested: {historicalAndTableKeys:15, fullGP29Decodes:30, step28Decodes:60},
  solvedP56Shift:{eligibleCipherRunes:84, tested:originalP56Checks.length, matchesRange:range(originalP56Checks.map(x => x.matches)), maximum:originalP56Checks.filter(x => x.matches === 9)},
  mothLinkedP55Crib:{status:'UNAUTHENTICATED hypothesis, not solved plaintext',candidateRunes:30,tests:provisionalP55Matches.length,matchesRange:range(provisionalP55Matches.map(x => x.matches)),best:provisionalP55Matches.filter(x => x.matches === 3)},
  original2013TwitterTape:{bytes:twitterTape.length,combinations:crossRoundExactTapeWindows,positive:plantedReuse},
  sourceXorTableASCII:binary.filter(x => x.label !== 'TABLE'),
  fullGP29IoC:full, nonrepeatRank28IoC:step,
  largestSingleDecodedRank:largest,
  rawGP29:profile(ciphertext, 29),
  rawCircular:profile(transitions.map(x => x.circular), 28),
  rawAbsolute:profile(transitions.map(x => x.absolute), 28),
  positive:'256/256 rank symbols and 85/85 GP29 source-shift planted controls recovered exactly',
  interpretation:'All tested source-ordered direct binary, GP29 and 28-rank consumers remain ciphertext-like; no independent historical instruction selects the key, cipher, or XOR combination.'
}, null, 2));
