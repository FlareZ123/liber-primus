'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const gp = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const lexiconText = fs.readFileSync(path.join(root, 'resources', 'control', 'english_wordfreq_textblob.txt'), 'utf8');

const padPath = process.argv[2];
assert(padPath, 'usage: node sims/lp2_cos560_dense_p55_word13_sft.cjs <_560.00>');
const pad = fs.readFileSync(padPath);
assert.equal(pad.length, 3992970, 'authoritative _560.00 byte length');

const MOD = 29;
const C = gp.pages.find((page) => page.page === 55).indices;
assert.equal(C.length, 76);
const wordLengths = [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(wordLengths.reduce((sum, n) => sum + n, 0), 76);
const wordStart = wordLengths.slice(0, 7).reduce((sum, n) => sum + n, 0);
assert.equal(wordStart, 23);
const targetCipher = C.slice(wordStart, wordStart + 13);
assert.equal(targetCipher.length, 13);

/** @param {number} x @returns {number} */
function mod29(x) {
  const r = x % MOD;
  return r < 0 ? r + MOD : r;
}

const translitTokens = gp.translit.map((text, index) => ({text, index}))
  .sort((a, b) => b.text.length - a.text.length);

/** @param {string} raw @returns {number[]} */
function encodeWord(raw) {
  const text = raw.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < text.length;) {
    if (text.startsWith('ING', i)) {
      out.push(21);
      i += 3;
      continue;
    }
    if (text.startsWith('IO', i)) {
      out.push(27);
      i += 2;
      continue;
    }
    const token = translitTokens.find((item) => text.startsWith(item.text, i));
    if (!token) return [];
    out.push(token.index);
    i += token.text.length;
  }
  return out;
}

const unique = new Map();
for (const line of lexiconText.split(/\r?\n/u)) {
  const match = /^([A-Za-z]+) (\d+)$/u.exec(line);
  if (!match) continue;
  const encoded = encodeWord(match[1]);
  if (encoded.length === 13) unique.set(encoded.join(','), {word: match[1].toUpperCase(), encoded});
}
const entries = [...unique.values()];
assert.equal(entries.length, 379);

const edges = [new Int32Array(MOD).fill(-1)];
const terminals = [''];
for (const entry of entries) {
  let node = 0;
  for (const rune of entry.encoded) {
    let next = edges[node][rune];
    if (next < 0) {
      next = edges.length;
      edges[node][rune] = next;
      edges.push(new Int32Array(MOD).fill(-1));
      terminals.push('');
    }
    node = next;
  }
  terminals[node] = entry.word;
}

/**
 * Find exact dictionary preimages at every key offset.
 * Decode relation is p = c + sign*k. For dsk>0, each skipped key must
 * have encoded the same plaintext rune to the previous ciphertext rune.
 *
 * @param {Uint8Array|Buffer} rawPad
 * @param {1|-1} sign
 * @param {number} maxSkip
 * @returns {Array<object>}
 */
function denseScan(rawPad, sign, maxSkip = 3) {
  const n = rawPad.length;
  const key = new Uint8Array(n);
  for (let i = 0; i < n; i += 1) key[i] = rawPad[i] % MOD;

  const hits = [];
  const maxStart = n - targetCipher.length * (maxSkip + 1) - 1;
  const pa = new Int32Array(4096);
  const nodes = new Int32Array(4096);
  const npa = new Int32Array(4096);
  const nnodes = new Int32Array(4096);

  for (let start = 0; start <= maxStart; start += 1) {
    const firstPlain = mod29(targetCipher[0] + sign * key[start]);
    const firstNode = edges[0][firstPlain];
    if (firstNode < 0) continue;

    let count = 1;
    pa[0] = start;
    nodes[0] = firstNode;
    let curPA = pa;
    let curNodes = nodes;
    let nextPA = npa;
    let nextNodes = nnodes;

    for (let ci = 1; ci < targetCipher.length && count > 0; ci += 1) {
      let nextCount = 0;
      const prevCipher = targetCipher[ci - 1];
      const cipher = targetCipher[ci];

      for (let s = 0; s < count; s += 1) {
        const previousAccepted = curPA[s];
        const node = curNodes[s];

        for (let dsk = 0; dsk <= maxSkip; dsk += 1) {
          const acc = previousAccepted + 1 + dsk;
          if (acc >= n) break;

          const plain = mod29(cipher + sign * key[acc]);
          const child = edges[node][plain];
          if (child < 0) continue;

          let valid = true;
          for (let m = previousAccepted + 1; m < acc; m += 1) {
            if (mod29(plain - sign * key[m]) !== prevCipher) {
              valid = false;
              break;
            }
          }
          if (!valid) continue;

          // Deduplicate identical (accepted-key,node) states at this rune.
          let duplicate = false;
          for (let z = 0; z < nextCount; z += 1) {
            if (nextPA[z] === acc && nextNodes[z] === child) {
              duplicate = true;
              break;
            }
          }
          if (!duplicate) {
            assert(nextCount < nextPA.length, 'state buffer overflow');
            nextPA[nextCount] = acc;
            nextNodes[nextCount] = child;
            nextCount += 1;
          }
        }
      }

      count = nextCount;
      [curPA, nextPA] = [nextPA, curPA];
      [curNodes, nextNodes] = [nextNodes, curNodes];
    }

    for (let s = 0; s < count; s += 1) {
      const word = terminals[curNodes[s]];
      if (word) {
        hits.push({
          start,
          end: curPA[s],
          consumed: curPA[s] - start + 1,
          skips: curPA[s] - start - 12,
          sign,
          word
        });
      }
    }

    if (start > 0 && start % 500000 === 0) {
      console.log(JSON.stringify({progress: start, sign, hits: hits.length}));
    }
  }

  return hits;
}

/**
 * Construct a 13-rune control from one dictionary word and an actual pad window.
 * When a current key would make a doublet, force exactly one skip, exercising
 * the same skip-validity constraint as the inverse.
 *
 * @param {Uint8Array|Buffer} rawPad
 * @param {number[]} plain
 * @param {number} start
 * @param {1|-1} sign
 * @returns {{cipher:number[], skips:number[], end:number}}
 */
function plant(rawPad, plain, start, sign) {
  const cipher = [];
  const skips = [];
  let accepted = start - 1;

  for (let i = 0; i < plain.length; i += 1) {
    let acc = accepted + 1;
    let dsk = 0;
    if (i > 0 && mod29(plain[i] - sign * (rawPad[acc] % MOD)) === cipher[i - 1]) {
      acc += 1;
      dsk = 1;
    }
    cipher.push(mod29(plain[i] - sign * (rawPad[acc] % MOD)));
    skips.push(dsk);
    accepted = acc;
  }
  return {cipher, skips, end: accepted};
}

const controlEntry = entries[0];
let control = null;
for (let start = 0; start < 100000 && !control; start += 1) {
  for (const sign of [-1, 1]) {
    const candidate = plant(pad, controlEntry.encoded, start, sign);
    if (candidate.skips.some((value) => value > 0)) {
      control = {start, sign, ...candidate};
      break;
    }
  }
}
assert(control, 'failed to create forced-skip positive control');

// Verify the generic transition itself against the planted control with a tiny
// local trie containing only the control word.
const savedCipher = targetCipher.slice();
for (let i = 0; i < 13; i += 1) targetCipher[i] = control.cipher[i];
const controlHits = denseScan(pad.subarray(0, Math.min(pad.length, control.start + 1000)), control.sign, 3)
  .filter((hit) => hit.start === control.start && hit.word === controlEntry.word);
for (let i = 0; i < 13; i += 1) targetCipher[i] = savedCipher[i];
assert(controlHits.length > 0, 'forced-skip control was not recovered');

const forwardMinus = denseScan(pad, -1, 3);
const forwardPlus = denseScan(pad, 1, 3);
const reversed = Buffer.from(pad).reverse();
const reverseMinus = denseScan(reversed, -1, 3);
const reversePlus = denseScan(reversed, 1, 3);

const all = [
  ...forwardMinus.map((hit) => ({direction: 'forward', ...hit})),
  ...forwardPlus.map((hit) => ({direction: 'forward', ...hit})),
  ...reverseMinus.map((hit) => ({direction: 'reverse', ...hit})),
  ...reversePlus.map((hit) => ({direction: 'reverse', ...hit}))
];

console.log('RESULT_JSON ' + JSON.stringify({
  padBytes: pad.length,
  p55WordStart: wordStart,
  p55WordLength: 13,
  dictionaryTypes: entries.length,
  maxSkip: 3,
  scans: {
    forwardMinus: forwardMinus.length,
    forwardPlus: forwardPlus.length,
    reverseMinus: reverseMinus.length,
    reversePlus: reversePlus.length
  },
  totalHits: all.length,
  hits: all.slice(0, 200),
  control: {
    word: controlEntry.word,
    start: control.start,
    sign: control.sign,
    skips: control.skips,
    recovered: controlHits.length
  }
}));
