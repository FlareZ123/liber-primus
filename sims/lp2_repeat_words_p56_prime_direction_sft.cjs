'use strict';

/**
 * Original 85 repeat-bearing LP2 ciphertext words as a candidate source-derived
 * GP prime-sum direction key for the independent known 85-rune p56.
 * One locked chronological readout and one known-plaintext consumer.
 * No scalar, alphabet, event phase, sign or offset search.
 * Node.js 22, CommonJS; run from any current working directory.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name */
const source = name => fs.readFileSync(path.join(root, name), 'utf8');

/** @param {number} n */
function primeList(n) {
  const result = [];
  for (let p = 2; result.length < n; p++) {
    let prime = true;
    for (let d = 2; d * d <= p; d++) if (p % d === 0) { prime = false; break; }
    if (prime) result.push(p);
  }
  return result;
}

/** @param {string} plaintext @param {string[]} translit */
function nativeGP(plaintext, translit) {
  const tokens = translit.map((t, i) => ({t, i}))
    .sort((a, b) => b.t.length - a.t.length);
  const result = [];
  for (const wordRaw of plaintext.toUpperCase().match(/[A-Z]+/g) || []) {
    const word = wordRaw.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
    for (let j = 0; j < word.length;) {
      const match = tokens.find(x => word.startsWith(x.t, j));
      assert(match, 'unknown GP token from ' + word);
      result.push(match.i);
      j += match.t.length;
    }
  }
  return result;
}

/** @param {number[]} values */
function ioc(values) {
  const count = new Int32Array(29);
  for (const v of values) count[v]++;
  return count.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

function main() {
  const gp = JSON.parse(source('resources/liber-primus/lp2-corpus.json'));
  const raw = source('resources/liber-primus/lp2-transcription.txt')
    .split('%').slice(0, 55).join('%');
  const glyph = new Map(gp.runes.map((r, i) => [r, i]));
  const pages = gp.pages.filter(p => p.status === 'unsolved' && p.indices.length);
  const words = [];
  let runes = [], beginning = -1, runeOffset = 0;
  const finish = () => {
    if (runes.length) {
      words.push({beginning, end: runeOffset - 1, runes});
      runes = [];
      beginning = -1;
    }
  };
  for (const ch of raw) {
    if (glyph.has(ch)) {
      if (!runes.length) beginning = runeOffset;
      runes.push(glyph.get(ch));
      runeOffset++;
    } else if (ch === '%' || ch === '/' || /\s/u.test(ch)) {
      // Physical page and visual wrap can carry a single word.
    } else finish();
  }
  finish();
  assert.equal(runeOffset, 12956);
  assert.equal(words.length, 2896);

  const events = [];
  let offset = 0;
  for (const p of pages) {
    for (let i = 1; i < p.indices.length; i++)
      if (p.indices[i] === p.indices[i - 1])
        events.push({page: p.page, first: offset + i - 1, second: offset + i});
    offset += p.indices.length;
  }
  assert.equal(offset, 12956);
  assert.equal(events.length, 86);

  const wordIds = events.map(e => {
    const word = words.findIndex(w => w.beginning <= e.second && w.end >= e.second);
    assert(word >= 0);
    return word;
  });
  const unique = [...new Set(wordIds)];
  assert.equal(unique.length, 85);
  assert.equal(wordIds.filter((w, i) => wordIds.indexOf(w) !== i).length, 1);
  assert.equal(events[0].page, 0);

  // Source-selected: canonical Gematria Primus assigns first 29 primes to
  // its 29 symbols; read complete exceptional words in original chronology.
  const primes = primeList(100);
  const wordKey = unique.map(w => words[w].runes.reduce((s, x) => s + primes[x], 0) % 29);
  assert.equal(wordKey.length, 85);

  // The independent solved LP2 physical p56 is an 85-GP-rune plaintext
  // under prime/totient shifts; its real key is fully known from source.
  const p56 = gp.pages.find(p => p.page === 56).indices;
  assert.equal(p56.length, 85);
  const prose = [
    'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO',
    'IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE'
  ].join(' ');
  const known = nativeGP(prose, gp.translit);
  assert.equal(known.length, 85);
  const trueKey = p56.map((c, i) => (c - known[i] + 29) % 29);
  const matches = wordKey.filter((v, i) => v === trueKey[i]).length;
  assert.equal(matches, 2);
  const candidate = p56.map((c, i) => (c - wordKey[i] + 29) % 29);
  const observedIoC = ioc(candidate);
  assert(Math.abs(observedIoC - 0.03081232492997199) < 1e-12);
  assert.notDeepEqual(candidate, known);

  const plant = known.map((p, i) => (p + wordKey[i]) % 29);
  assert.deepEqual(plant.map((c, i) => (c - wordKey[i] + 29) % 29), known);
  const shiftedControl = wordKey.slice();
  shiftedControl[0] = (shiftedControl[0] + 1) % 29;
  assert.notDeepEqual(plant.map((c, i) => (c - shiftedControl[i] + 29) % 29), known);

  console.log(JSON.stringify({
    source: {runes: runeOffset, originalWords: words.length,
      repeatedCipherEvents: events.length, eventBearingWords: unique.length,
      uniqueDoubleEventWords: 1},
    sourceSelectedReadout: 'chronological distinct event word -> GP prime-weight word sum mod29',
    originalSolvedControl: {
      physicalPage: 56, length: p56.length,
      knownKeySymbolMatches: matches,
      expectedRandomMatchesForIndependentGP29: 85 / 29,
      candidateDecodedIoC: observedIoC,
      nativePlaintextRecovered: false,
      candidateGPTranslit: candidate.map(v => gp.translit[v]).join(' ')
    },
    positivePlant: {nativeRuneCount: known.length, exactReversal: true,
      wrongKeySymbolControlRejected: true},
    conclusion: '85-to-85 length match supplies no authentic key or word-address instruction; this particular prime-sum direction is rejected.'
  }, null, 2));
}

if (require.main === module) main();
module.exports = {primeList, nativeGP, ioc};
