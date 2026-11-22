'use strict';

/**
 * Original-source 13 illuminated initial gate. Run on Windows Node.js:
 * node sims/lp2_giant13_acrostic_original_sft.cjs
 *
 * Source: independently pixel-identified giant letters in
 * im-results/lp2-round9-independent-unmapped-class-audit.md.
 * Tests only fixed source-order readouts and one historically familiar
 * additive-key operation. No plaintext/key discovery is presumed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const source = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'lp2-ink-annotations.json'), 'utf8'));
/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const primes = [];
  for (let candidate = 2; primes.length < count; candidate += 1) {
    if (primes.every(p => candidate % p !== 0)) primes.push(candidate);
  }
  return primes;
}
const phiStream = firstPrimes(120).map(p => p - 1);
const sites = [
  [0, 0, 'S'], [3, 0, 'L'], [3, 119, 'P'], [6, 71, 'A'],
  [8, 0, 'X'], [15, 9, 'L'], [23, 0, 'U'], [27, 0, 'M'],
  [33, 0, 'D'], [33, 91, 'NG'], [39, 119, 'IA'],
  [40, 0, 'F'], [54, 0, 'A']
];
const cap = sites.map(([page, offset, name]) => {
  const sym = source.translit.indexOf(name);
  assert.ok(sym >= 0);
  assert.equal(source.pages[page].indices[offset], sym,
    'Original GP29 at giant-cap location');
  const pageInk = ink.pages.find(p => p.page === page);
  assert.ok(pageInk.red_spans.some(s => s.start === offset),
    'Each giant initial starts an original red span');
  return sym;
});
assert.equal(cap.length, 13);
assert.equal(source.translit[source.pages[56].indices[0]], 'AE',
  'Solved p56 giant-cap reference');
assert.equal(source.translit[source.pages[57].indices[0]], 'P',
  'Clear p57 giant-cap reference');
assert.deepEqual(cap, [15,20,13,24,14,20,1,19,23,21,27,0,24]);

/** @param {number} n @returns {number} */
const mod29 = n => ((n % 29) + 29) % 29;
/** @param {number[]} a @returns {string} */
const display = a => a.map(x => source.translit[x]).join('-');
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = new Array(29).fill(0);
  for (const x of a) counts[x] += 1;
  return counts.reduce((s, c) => s + c * (c - 1), 0) / (a.length * (a.length - 1));
}
/** @param {number[]} a @param {number[]} key @param {number} sign @returns {number[]} */
function additive(a, key, sign) {
  return a.map((x, i) => mod29(x + sign * key[i % key.length]));
}
/** @param {string} word @returns {number[]} */
function encodeSolvedWord(word) {
  const tokens = source.translit.map((s, i) => ({s, i}))
    .sort((a, b) => b.s.length - a.s.length);
  const s = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const out = [];
  for (let i = 0; i < s.length;) {
    const token = tokens.find(t => s.startsWith(t.s, i));
    assert.ok(token, 'source-native solved spelling');
    out.push(token.i);
    i += token.s.length;
  }
  return out;
}
/** @param {number[]} a @returns {number[]} */
function phiPrimeEncrypt(a) {
  let used = 0;
  return a.map(x => x === 0 ? 0 : mod29(x + phiStream[used++]));
}
/** @param {number[]} cipher @returns {number[][]} */
function phiPrimeInversePaths(cipher) {
  let states = [{n: 0, plain: []}];
  for (const c of cipher) {
    const next = [];
    for (const state of states) {
      if (c === 0) next.push({n: state.n, plain: [...state.plain, 0]});
      const p = mod29(c - (phiStream[state.n]));
      if (p !== 0) next.push({n: state.n + 1, plain: [...state.plain, p]});
    }
    states = next;
  }
  return states.map(s => s.plain);
}
const known = ('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE ' +
  'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE')
  .split(' ').flatMap(encodeSolvedWord);
assert.equal(known.length, 85);
assert.deepEqual(phiPrimeEncrypt(known), source.pages[56].indices,
  'Historical solved p56 F-transparent prime/totient cipher positive');

const p0Title = source.pages[0].indices.slice(0, 13);
const p0Black = [
  ...source.pages[0].indices.slice(13),
  ...source.pages[1].indices, ...source.pages[2].indices
];
const p3 = source.pages.slice(3, 8).flatMap(p => p.indices);
const nativeClear = source.pages[57].indices;
assert.equal(p0Title.length, 13);
assert.equal(p0Black.length, 716);
assert.equal(p3.length, 1145);
assert.equal(nativeClear.length, 95);
assert.equal(p0Title[0], cap[0], 'Same original p0 leading glyph; NOT independent evidence');

/** @param {string} name @param {number[]} original @returns {object} */
function compare(name, original) {
  const subtract = additive(original, cap, -1);
  const add = additive(original, cap, 1);
  assert.deepEqual(additive(subtract, cap, 1), original);
  assert.deepEqual(additive(add, cap, -1), original);
  const plainPlant = additive(nativeClear, cap, 1);
  assert.deepEqual(additive(plainPlant, cap, -1), nativeClear,
    'Source-native p57 planted-key round trip');
  return {
    name, originalRunes: original.length, originalIoC: ioc(original),
    capSubtractIoC: ioc(subtract), capAddIoC: ioc(add),
    subtractOpening80: display(subtract.slice(0, 80)),
    addOpening80: display(add.slice(0, 80)),
    exactForwardRoundTrips: true
  };
}
/** @param {number[]} seed @param {number} length @returns {number[]} */
function fibonacci13(seed, length) {
  const out = seed.slice();
  for (let i = 13; i < length; i += 1) {
    out.push(mod29(out[i - 8] + out[i - 13]));
  }
  return out;
}
/**
 * Exact historical-p56 transparent-F feasibility on a frozen stream.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} start
 * @returns {number}
 */
function fTransparentReach(cipher, key, start) {
  let states = [0];
  for (let i = 0; i < cipher.length; i += 1) {
    const c = cipher[i], seen = new Set(), next = [];
    for (const consumed of states) {
      if (c === 0 && !seen.has(consumed)) {
        seen.add(consumed); next.push(consumed);
      }
      if (mod29(c - key[start + consumed]) !== 0 &&
          !seen.has(consumed + 1)) {
        seen.add(consumed + 1); next.push(consumed + 1);
      }
    }
    if (next.length === 0) return i;
    states = next;
  }
  return cipher.length;
}
/** @param {number[]} plain @param {number[]} key @returns {number[]} */
function fTransparentEncrypt(plain, key) {
  let consumed = 0;
  return plain.map(p => p === 0 ? 0 : mod29(p + key[consumed++]));
}

const fibKey = fibonacci13(cap, p0Black.length + p3.length + nativeClear.length + 13);
const fibDecode0 = p0Black.map((c, i) => mod29(c - fibKey[i]));
const fibDecode3 = p3.map((c, i) => mod29(c - fibKey[p0Black.length + i]));
assert.deepEqual(fibDecode0.map((p,i) => mod29(p + fibKey[i])), p0Black);
assert.deepEqual(fibDecode3.map((p,i) => mod29(p + fibKey[p0Black.length + i])), p3);
const fibP57Plant = nativeClear.map((p,i) => mod29(p + fibKey[i]));
assert.deepEqual(fibP57Plant.map((c,i) => mod29(c - fibKey[i])), nativeClear);
const fPlainPlant = fTransparentEncrypt(nativeClear, fibKey);
assert.equal(fTransparentReach(fPlainPlant, fibKey, 0), nativeClear.length);
const f0Reach = fTransparentReach(p0Black, fibKey, 0);
const f3Reach = fTransparentReach(p3, fibKey, p0Black.length);
const f3ResetReach = fTransparentReach(p3, fibKey, 0);
assert.equal(f0Reach, 39);
assert.equal(f3Reach, 19);
assert.equal(f3ResetReach, 73);
const altKey = source.pages[1].indices.slice(0, 13);
const forwardPhi = phiPrimeInversePaths(cap).map(display);
const reversedPhi = phiPrimeInversePaths([...cap].reverse()).map(display);
assert.equal(forwardPhi.length, 2);
assert.equal(reversedPhi.length, 2);
console.log(JSON.stringify({
  source: 'original lp2-corpus and red-ink annotations',
  giantSites: sites,
  giantRuneIndices: cap,
  giantReadout: display(cap),
  reversedReadout: display([...cap].reverse()),
  primeValues: cap.map(x => source.prime[x]),
  p0RedTitle: display(p0Title),
  p56PrimeTotientNativeControl: '85/85 source runes; true plaintext-F skip',
  fixedPhiPrimeReadouts: {forward: forwardPhi, reverse: reversedPhi},
  nativeP57ClearIoC: ioc(nativeClear),
  originalBody: compare('p0–2 after 13-rune p0 heading', p0Black),
  independentHoldout: compare('p3–7', p3),
  sourceMotivatedFibonacci13Candidate: {
    premise: '13 illuminated GP29 seeds, five-plus-eight-back Fibonacci taps from p15',
    keyFirst40: fibKey.slice(0, 40),
    keyRule: 'K[i]=(K[i-8]+K[i-13]) mod29 for i >=13; start at p0 black',
    p0Body: {runes: p0Black.length, outputIoC: ioc(fibDecode0),
      opening55: display(fibDecode0.slice(0,55))},
    p3Continuous: {runes: p3.length, outputIoC: ioc(fibDecode3),
      opening55: display(fibDecode3.slice(0,55))},
    historicalTransparentF: {
      p0ImpossibleAt: f0Reach, p3ContinuousImpossibleAt: f3Reach,
      p3ResetImpossibleAt: f3ResetReach
    },
    nativeP57Positive: '95/95 direct and transparent-F planted inverses',
    exactReencryption: true
  },
  unrelated13RuneKeyControl: {
    key: display(altKey),
    p0MinusIoC: ioc(additive(p0Black, altKey, -1)),
    p3MinusIoC: ioc(additive(p3, altKey, -1))
  },
  decision: 'No intelligible 13-glyph authored instruction or unknown-page prose under the tested finite source operations; no source chooses a nonrepeating cap-derived key/clock.'
}, null, 2));
