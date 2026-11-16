'use strict';

/**
 * p57 one-edge-per-word 75-rune key -> original p55 local 75-rune gate.
 *
 * Historical reason to test: the final clear PARABLE (p57) tells the reader
 * to shed circumferences; its 20 printed words contain 95 GP29 runes.
 * Removing exactly one endpoint rune from every word gives 75 candidate
 * key runes, matching the complete p55 local text after its one-rune p54
 * word carry. The operation is a hypothesis, not an authored key instruction.
 *
 * Run on Windows 11 / Node.js 22:
 *   node sims/lp2_p57_oneedge75_p55_ftransparent_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} rel @returns {string} */
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const index = new Map(corpus.runes.map((r, i) => [r, i]));
const page55 = corpus.pages.find(p => p.page === 55);
const page57 = corpus.pages.find(p => p.page === 57);
assert.ok(page55 && page57);
assert.equal(page55.indices.length, 76);
assert.equal(page57.indices.length, 95);

// '%' is a physical page boundary. Printed words end at a small divider
// or punctuation, never at a '/' line wrap.
const words = [];
let word = [];
for (const glyph of transcription.split('%').at(-1)) {
  if (index.has(glyph)) word.push(index.get(glyph));
  else if ('-.$&§'.includes(glyph) && word.length) {
    words.push(word);
    word = [];
  }
}
if (word.length) words.push(word);
assert.equal(words.length, 20);
assert.deepEqual(words.map(w => w.length),
  [7, 4, 2, 6, 7, 2, 2, 7, 2, 4, 4, 3, 3, 14, 4, 2, 8, 5, 3, 6]);
assert.deepEqual(words.flat(), page57.indices);

const cipher = page55.indices.slice(1);
assert.equal(cipher.length, 75);
assert.equal(page55.indices[0], 21);
const plant = page57.indices.slice(0, 75);

/**
 * Historical GP29 F-transparent encryption: P=F emits F without advancing
 * the key, while non-F plaintext consumes exactly one symbol. A non-F
 * plaintext can also emit ciphertext F, so decoding must keep both paths.
 * @param {number[]} plain
 * @param {number[]} key
 * @param {number} sign
 * @returns {number[]}
 */
function encrypt(plain, key, sign) {
  let clock = 0;
  return plain.map(p => p === 0 ? 0 : (p + sign * key[clock++] + 29) % 29);
}

/**
 * Exact F-bypass inverse; no beam, dictionary or guessed F locations.
 * @param {number[]} enc
 * @param {number[]} key
 * @param {number} sign
 * @returns {{paths: {plain: number[], clock: number}[], firstDead: number|null}}
 */
function inverse(enc, key, sign) {
  /** @type {{plain:number[],clock:number}[]} */
  let paths = [{ plain: [], clock: 0 }];
  for (let i = 0; i < enc.length; i++) {
    /** @type {{plain:number[],clock:number}[]} */
    const next = [];
    for (const candidate of paths) {
      if (enc[i] === 0) {
        next.push({ plain: [...candidate.plain, 0], clock: candidate.clock });
      }
      if (candidate.clock < key.length) {
        const p = (enc[i] - sign * key[candidate.clock] + 29) % 29;
        if (p !== 0) {
          next.push({
            plain: [...candidate.plain, p],
            clock: candidate.clock + 1
          });
        }
      }
    }
    paths = next;
    if (paths.length === 0) return { paths, firstDead: i + 1 };
  }
  for (const candidate of paths) {
    assert.deepEqual(encrypt(candidate.plain, key, sign), enc);
  }
  return { paths, firstDead: null };
}

/** @param {number[]} a */
function ioc(a) {
  const counts = Array(29).fill(0);
  a.forEach(x => counts[x]++);
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (a.length * (a.length - 1));
}

/** @param {number[]} a */
const asGP = a => a.map(v => corpus.translit[v]).join('');

const outcomes = [];
for (const endpoint of ['head', 'tail']) {
  const key = words.flatMap(w => endpoint === 'head' ? w.slice(1) : w.slice(0, -1));
  assert.equal(key.length, 75);
  for (const sign of [-1, +1]) {
    // Complete source-clear positive under exactly the same inverse.
    const planted = inverse(encrypt(plant, key, sign), key, sign);
    assert.ok(planted.paths.some(candidate =>
      candidate.plain.every((v, i) => v === plant[i])));

    const actual = inverse(cipher, key, sign);
    outcomes.push({
      endpoint,
      sign,
      candidateCount: actual.paths.length,
      firstDead: actual.firstDead,
      candidates: actual.paths.map(candidate => ({
        ioc: ioc(candidate.plain),
        bypasses: 75 - candidate.clock,
        plaintext: asGP(candidate.plain)
      })),
      plantedExact: 75
    });
  }
}
assert.deepEqual(outcomes.map(x => [x.candidateCount, x.firstDead]),
  [[2, null], [0, 54], [0, 8], [0, 66]]);
assert.ok(Math.max(...outcomes[0].candidates.map(x => x.ioc)) < 0.038);
assert.ok(ioc(plant) > 0.059);
console.log(JSON.stringify({
  input: 'Unchanged physical p55 runes 1..75 (p54 word-carry excluded)',
  source: 'Clear p57: 95 runes, 20 printed words',
  candidate: 'Remove one endpoint rune per p57 word, GP29 additive F-transparent',
  referenceClearFirst75IoC: ioc(plant),
  outcomes,
  conclusion: 'Three exact original inverses impossible; the fourth has two nonprose paths. No LP2 plaintext or authenticated key.'
}, null, 2));
