'use strict';

/**
 * Source-constrained self-referential word-sign test for original LP2.
 * Signed-2016 candidate: "their numbers are the direction".
 * Hypothesis: GP prime-sum parity of each decoded word sets the sign of the
 * authentic p56 transparent-F prime-totient additive key. The key advances
 * exactly once per non-F plaintext rune, including words carried across
 * physical LP2 pages. Both odd/even sign orientations and key starts 0..4999
 * are searched, with no language filtering of the original.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const source = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const original = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8');
const alphabet = new Map(source.runes.map((r, i) => [r, i]));
const pagesWithoutNumericP50 = original.split('%').slice(0, 55).join('\n');

/** @typedef {{start:number,end:number,c:number[]}} CipherWord */

/** @returns {CipherWord[]} */
function parseOriginalWords() {
  /** @type {CipherWord[]} */
  const out = [];
  let buf = [];
  let position = 0;
  const flush = () => {
    if (buf.length) {
      out.push({start:position - buf.length, end:position, c:buf});
      buf = [];
    }
  };
  for (const ch of pagesWithoutNumericP50) {
    if (alphabet.has(ch)) {
      buf.push(alphabet.get(ch));
      position++;
    } else if ('-.$&'.includes(ch)) {
      flush();
    }
    // Physical line breaks and '%' page separators do not consume key or
    // end a word: 32 original printed words carry across physical pages.
  }
  flush();
  assert.equal(position, 12956);
  assert.equal(out.length, 2896);
  assert.deepEqual(out.flatMap(w => w.c),
    source.pages.filter(p => p.page <= 55).flatMap(p => p.indices),
    'Unchanged rune-by-rune original corpus');
  return out;
}

/** @param {number} count @returns {number[]} */
function primeTotients(count) {
  const sieve = new Uint8Array(180000);
  const out = [];
  for (let p = 2; p < sieve.length && out.length < count; p++) {
    if (sieve[p]) continue;
    out.push((p - 1) % 29);
    if (p * p < sieve.length) {
      for (let n = p * p; n < sieve.length; n += p) sieve[n] = 1;
    }
  }
  assert.equal(out.length, count);
  return out;
}
const key = primeTotients(9000);
const mod29 = x => (x % 29 + 29) % 29;

/**
 * F is prime 2 (even); the other 28 GP primes are odd.
 * GP-prime-sum parity = count(non-F) mod 2 = number of key advances mod 2.
 * @param {CipherWord[]} words
 * @param {number} start
 * @param {boolean} evenPlus Whether even number of non-F runes selects +.
 * @returns {{runes:number,words:number}}
 */
function reach(words, start, evenPlus) {
  let states = new Set([0]);
  let done = 0;
  for (let wi = 0; wi < words.length; wi++) {
    const next = new Set();
    for (const used of states) {
      for (const sign of [-1, 1]) {
        let local = new Set([used]);
        for (const c of words[wi].c) {
          const after = new Set();
          for (const v of local) {
            if (c === 0) after.add(v); // transparent plaintext F
            if (mod29(c - sign * key[start + v]) !== 0) {
              after.add(v + 1); // every encrypted non-F consumes key
            }
          }
          local = after;
          if (!local.size) break;
        }
        for (const v of local) {
          const requiredParity = sign === (evenPlus ? 1 : -1) ? 0 : 1;
          if (((v - used) & 1) === requiredParity) next.add(v);
        }
      }
    }
    if (!next.size) return {runes:done, words:wi};
    states = next;
    done += words[wi].c.length;
  }
  return {runes:done, words:words.length};
}

/**
 * Exact forward emitter for original-shaped native-GP plaintext controls.
 * @param {CipherWord[]} plain
 * @param {number} start
 * @param {boolean} evenPlus
 * @returns {CipherWord[]}
 */
function encrypt(plain, start, evenPlus) {
  let used = 0;
  return plain.map(word => {
    const nonF = word.c.filter(p => p !== 0).length;
    const sign = ((nonF & 1) === 0) === evenPlus ? 1 : -1;
    const c = word.c.map(p => {
      if (p === 0) return 0;
      const out = mod29(p + sign * key[start + used]);
      used++;
      return out;
    });
    return {...word, c};
  });
}

/**
 * Retain one exact plaintext path for each terminal key-consumption state;
 * independent of language scoring or word guesses.
 * @param {CipherWord[]} words
 * @param {number} start
 * @param {boolean} evenPlus
 * @returns {number[][]}
 */
function decodeAllStates(words, start, evenPlus) {
  let states = new Map([[0, []]]);
  for (const word of words) {
    const next = new Map();
    for (const [used, whole] of states) for (const sign of [-1, 1]) {
      let local = new Map([[used, []]]);
      for (const c of word.c) {
        const after = new Map();
        for (const [v, p] of local) {
          if (c === 0 && !after.has(v)) after.set(v, [...p, 0]);
          const q = mod29(c - sign * key[start + v]);
          if (q !== 0 && !after.has(v + 1)) after.set(v + 1, [...p, q]);
        }
        local = after;
      }
      for (const [v, p] of local) {
        const requiredParity = sign === (evenPlus ? 1 : -1) ? 0 : 1;
        if (((v - used) & 1) === requiredParity && !next.has(v)) {
          next.set(v, [...whole, ...p]);
        }
      }
    }
    states = next;
  }
  return [...states.values()];
}

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const h = new Array(29).fill(0);
  for (const x of a) h[x]++;
  return h.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}

const words = parseOriginalWords();
const offsets = [0];
for (const p of source.pages.filter(p => p.page <= 55)) {
  offsets.push(offsets.at(-1) + p.runic_count);
}
const groups = [[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];
const expected = [
  [[],[3318,3319,3320,4613,4614]],
  [[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],
  [[],[1755,3077]]
];
const witness = new Map();
let nativeClock = 0;
for (let g = 0; g < groups.length; g++) {
  const [a,b] = groups[g];
  const selected = words.filter(w =>
    w.start >= offsets[a] && w.end <= offsets[b+1]);
  const len = selected.reduce((s,w) => s + w.c.length, 0);
  assert.equal(len, offsets[b+1] - offsets[a],
    'No carried word omitted at original chapter border');
  for (let ori = 0; ori < 2; ori++) {
    const evenPlus = ori === 0;
    const complete = [];
    let furthest = 0;
    for (let start = 0; start < 5000; start++) {
      const result = reach(selected, start, evenPlus);
      if (result.runes === len) complete.push(start);
      furthest = Math.max(furthest, result.runes);
    }
    assert.deepEqual(complete, expected[g][ori],
      'Exhaustive original result changed');
    console.log('original pp' + a + '-' + b,
      evenPlus ? 'even+' : 'odd+',
      'length=' + len, 'furthest=' + furthest,
      'complete=' + JSON.stringify(complete));
    for (const start of complete) {
      const paths = decodeAllStates(selected, start, evenPlus);
      assert.ok(paths.length > 0);
      const best = paths.map(p => ioc(p));
      assert.ok(best.every(v => v < 0.045),
        'Review independently: unexpectedly concentrated plaintext');
      witness.set(a + '-' + b + ':' + start, {
        states:paths.length,
        iocs:best,
        opening:paths[0].slice(0, 100).map(i => source.translit[i]).join('')
      });
    }
  }
  // Same original word lengths, authentic GP29 plaintext drawn from the
  // visible clear p57, with true secret key and word-parity sign.
  const p57 = source.pages.find(p => p.page === 57).indices;
  const plant = selected.map(w => ({
    ...w, c:w.c.map(() => p57[(nativeClock++) % p57.length])
  }));
  for (const evenPlus of [false,true]) {
    const ciphertext = encrypt(plant, 0, evenPlus);
    const reached = reach(ciphertext, 0, evenPlus);
    assert.equal(reached.runes, len, 'Whole-chapter native plaintext control');
    const decoded = decodeAllStates(ciphertext, 0, evenPlus);
    assert.ok(decoded.length > 0);
  }
}
console.log('SURVIVOR_PLAINTEXT_WITNESSES', JSON.stringify(Object.fromEntries(witness)));
console.log('PASS: all nine source-original chapters, 5,000 starts x 2',
  'sign conventions, true-F clock and original-shaped positive controls.');
