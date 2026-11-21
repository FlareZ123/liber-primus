"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.resolve(__dirname, "..", relative), "utf8");
}

/** @param {number} n @returns {number} */
function mod29(n) {
  return (n % 29 + 29) % 29;
}

/** @param {number} base @param {number} power @param {number} modulus @returns {number} */
function modPow(base, power, modulus) {
  let x = 1;
  for (let i = 0; i < power; i += 1) x = x * base % modulus;
  return x;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const tokens = table.pages.flatMap((page) => page.tokens);
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const pages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length);
const chapters = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26], [27, 32], [33, 39], [40, 53], [54, 55]];

assert.equal(pages.length, 55);
assert.equal(pages.reduce((sum, page) => sum + page.indices.length, 0), 12956);
assert.equal(tokens.length, 256);
assert.deepEqual(tokens.flatMap((token, i) => token === "00" ? [i] : []), [192, 229]);

const events = [];
const phase = Array.from({ length: 256 }, () => []);
let globalOffset = 0;
for (const page of pages) {
  for (let local = 0; local < page.indices.length; local += 1, globalOffset += 1) {
    if (local === 0 || page.indices[local] !== page.indices[local - 1]) continue;
    const cell = (globalOffset - 1) % 256;
    const chapter = chapters.findIndex(([lo, hi]) => lo <= page.page && page.page <= hi);
    assert.ok(chapter >= 0);
    const event = { page: page.page, local, global: globalOffset, cell, chapter, rune: page.indices[local] };
    phase[cell].push(events.length);
    events.push(event);
  }
}
assert.equal(events.length, 86);
assert.deepEqual(phase[192].map((index) => events[index].rune), [26, 3, 1, 24]);
assert.deepEqual(phase[192].map((index) => events[index].page), [9, 24, 25, 34]);
assert.deepEqual(phase[229].map((index) => events[index].rune), [14]);

const phase210Runes = phase[210].map((index) => events[index].rune);
assert.deepEqual(phase210Runes, [21, 14, 3]); // NG, X, O
assert.deepEqual(phase[210].map((index) => events[index].page), [4, 20, 27]);
const phase192RuneSum = phase[192].reduce((sum, index) => sum + corpus.prime[events[index].rune], 0);
const phase210RuneSum = phase[210].reduce((sum, index) => sum + corpus.prime[events[index].rune], 0);
assert.equal(phase192RuneSum, 210); // Y 103 + O 7 + U 3 + A 97
assert.equal(phase210RuneSum, 133); // NG 79 + X 47 + O 7
assert.equal(phase210Runes.reduce((sum, rune) => sum + rune, 0), 38);
assert.equal(tokens[210], "06");
const stage11 = read("resources/historical/stage11-2014-index.html");
assert.ok(stage11.includes("<title>133</title>"));

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} input @returns {number[]} */
function gpEnglish(input) {
  const word = input.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith("ING", i)) {
      out.push(21);
      i += 3;
    } else if (word.startsWith("IO", i)) {
      out.push(27);
      i += 2;
    } else {
      const token = gpTokens.find(({ symbol }) => word.startsWith(symbol, i));
      assert.ok(token, "unmapped source word " + input);
      out.push(token.value);
      i += token.symbol.length;
    }
  }
  return out;
}

const signedBody = signed.split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "");
const signedWords = (signedBody.match(/[A-Za-z]+/g) || []).map((word, index) => ({
  index, word: word.toUpperCase(), runes: gpEnglish(word),
}));
assert.equal(signedWords.length, 43);
const sourceWords = [...new Map(signedWords.map((row) => [row.word, row])).values()]
  .filter((row) => row.runes.length >= 3);
assert.equal(sourceWords.length, 31);

/** @param {number[]} labels @returns {Array<{cell:number,word:string,offset:number}>} */
function wordHits(labels) {
  const hits = [];
  for (let cell = 0; cell < 256; cell += 1) {
    const ids = phase[cell];
    if (ids.length < 3) continue;
    for (const { word, runes } of sourceWords) {
      for (let start = 0; start + runes.length <= ids.length; start += 1) {
        if (runes.every((r, i) => labels[ids[start + i]] === r)) {
          hits.push({ cell, word, offset: start });
        }
      }
    }
  }
  return hits;
}

const original = events.map((event) => event.rune);
assert.deepEqual(wordHits(original), [{ cell: 192, word: "YOU", offset: 0 }]);

// Explicit detection controls, independent of the actual YOU string.
const erased = original.slice();
erased[phase[192][2]] = 0;
assert.deepEqual(wordHits(erased), []);
const planted = erased.slice();
phase[140].forEach((index, i) => { planted[index] = gpEnglish("MAP")[i]; });
assert.ok(wordHits(planted).some((hit) => hit.cell === 140 && hit.word === "MAP"));

/** @type {number} */
let seed = 0x33011916;
/** @returns {number} */
function random32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}

/** @param {number[]} values @param {number[]} indexes @returns {void} */
function permute(values, indexes) {
  for (let i = indexes.length - 1; i > 0; i -= 1) {
    const j = random32() % (i + 1);
    const x = indexes[i], y = indexes[j];
    [values[x], values[y]] = [values[y], values[x]];
  }
}

const every = events.map((_, i) => i);
const byChapter = chapters.map((_, chapter) => every.filter((i) => events[i].chapter === chapter));
let globalHits = 0, chapterHits = 0;
const n = 50000;
for (let trial = 0; trial < n; trial += 1) {
  const globallyShuffled = original.slice();
  permute(globallyShuffled, every);
  if (wordHits(globallyShuffled).length) globalHits += 1;

  const withinChapters = original.slice();
  for (const indexes of byChapter) permute(withinChapters, indexes);
  if (wordHits(withinChapters).length) chapterHits += 1;
}
assert.equal(globalHits, 31);
assert.equal(chapterHits, 56);

// Exact finite chapter-preserving assignment space for four original cell192
// event runes: chapter 2, two ordered distinct events of chapter 4,
// and chapter 6. Their fixed original sites are never reselected.
const sourceFirst = byChapter[2].map((index) => original[index]);
const sourceMiddle = byChapter[4].map((index) => original[index]);
const sourceLast = byChapter[6].map((index) => original[index]);
let assignments = 0, cycleMatches = 0, lexicalMatches = 0, jointMatches = 0;
for (const first of sourceFirst) {
  for (let i = 0; i < sourceMiddle.length; i += 1) {
    for (let j = 0; j < sourceMiddle.length; j += 1) {
      if (i === j) continue;
      for (const last of sourceLast) {
        const sequence = [first, sourceMiddle[i], sourceMiddle[j], last];
        const sum = sequence.reduce((total, rune) => total + rune, 0);
        const isCycle = sum === 36 || sum === 54;
        const hasSignedWord = sourceWords.some(({ runes }) => {
          for (let start = 0; start + runes.length <= 4; start += 1) {
            if (runes.every((rune, k) => sequence[start + k] === rune)) return true;
          }
          return false;
        });
        assignments += 1;
        if (isCycle) cycleMatches += 1;
        if (hasSignedWord) lexicalMatches += 1;
        if (isCycle && hasSignedWord) {
          jointMatches += 1;
          require("node:assert/strict").deepEqual(sequence, [26, 3, 1, 24]);
        }
      }
    }
  }
}
assert.equal(assignments, 11880);
assert.equal(cycleMatches, 440);
assert.equal(lexicalMatches, 12);
assert.equal(jointMatches, 1);

// Previously frozen source route: signed YOU -> p50[GP0(YOU)] -> p0 WILL,
// with independently published p38 reciprocal packet and p28 DH23 state.
// The new event channel proposes only another route to YOU; it does not
// license the already-known key schedule or decrypt new unknown runes.
const you = gpEnglish("YOU"), will = gpEnglish("WILL"), found = gpEnglish("FOUND");
assert.deepEqual(you, [26, 3, 1]);
assert.equal(you.reduce((a, b) => a + b, 0), 30);
assert.equal(tokens[30], "2L");
const alphabet = table.alphabet;
/** @param {string} token @returns {number} */
function number60(token) {
  return alphabet.indexOf(token[0]) * 60 + alphabet.indexOf(token[1]);
}
assert.equal(number60(tokens[30]), 141);

// The COMPLETE four-rune original readout YOUA is a numerical selector:
// GP0(YOUA)=54, the row6/col6 member of the only nontrivial
// reciprocal low-base60 index pair across all 256 printed table cells.
const readout = phase[192].map((index) => events[index].rune);
const readoutGp0 = readout.reduce((sum, rune) => sum + rune, 0);
assert.equal(readoutGp0, 54);

// The same four original runes' GP-PRIME sum gives 210, indexing
// another source-observed three-event group NG-X-O. Its GP index sum
// gives physical page38, while the first group's index sum gives
// source offset54: the complete original page:offset address 38:54.
assert.equal(phase192RuneSum, 210);
const derivedPage = phase210Runes.reduce((sum, rune) => sum + rune, 0);
assert.equal(derivedPage, 38);
assert.equal(phase210RuneSum, 133); // original 2014 stage11 title
assert.equal(tokens[54], "2a");
assert.equal(tokens[36], "0s");
/** @param {number} index @returns {number} */
function low60(index) {
  return alphabet.indexOf(tokens[index][1]);
}
const cycles = [];
const fixed = [];
for (let cell = 0; cell < 256; cell += 1) {
  const next = low60(cell);
  if (next === cell) fixed.push(cell);
  else if (next < 256 && low60(next) === cell && cell < next) cycles.push([cell, next]);
}
assert.deepEqual(cycles, [[36, 54]]);
assert.deepEqual(fixed, [6, 9]);
assert.deepEqual([low60(54), low60(36)], [36, 54]);
assert.ok([36, 54].every((cell) => Math.floor(cell / 8) === cell % 8));
assert.deepEqual(phase.flatMap((indices, cell) => {
  if (!indices.length) return [];
  const sum = indices.reduce((total, index) => total + events[index].rune, 0);
  return sum === 54 ? [cell] : [];
}), [192]);
const p0 = pages.find((page) => page.page === 0);
const p38 = pages.find((page) => page.page === 38);
assert.equal(number60(tokens[phase192RuneSum]), 6);
assert.equal(low60(phase192RuneSum), 6);
assert.equal(low60(6), 6);
assert.ok(p0 && p38);
assert.deepEqual(p38.indices.slice(54, 57), [5, 12, 19]);
assert.equal(derivedPage, p38.page);
assert.equal(readoutGp0, 54);
assert.deepEqual(p38.indices.slice(readoutGp0, readoutGp0 + 3), [5, 12, 19]);
const packet = p38.indices.slice(54, 57);
assert.equal(packet.reduce((sum, rune) => sum + rune, 0), low60(readoutGp0));
// Independently source-selected private a=6 from literal p50[210]="06".
// In the preexisting typed packet grammar, slot1 = K*a mod29.
// The packet recovers K=2 by division mod29; the *different* DH mod23
// operation with source packet B=19 confirms the very same K=19^6 mod23.
const a = number60(tokens[phase192RuneSum]);
assert.equal(a, 6);
const inverseA = Array.from({ length: 28 }, (_, i) => i + 1).find((x) => a * x % 29 === 1);
assert.ok(Number.isInteger(inverseA));
const K = mod29(packet[1] * inverseA);
const A = modPow(packet[0], a, 23);
assert.equal(K, 2);
assert.equal(modPow(packet[2], a, 23), K);
assert.equal(a, 6);
assert.equal(A, 8);
const H = [mod29(A - packet[2]), mod29(A + packet[2])];
assert.deepEqual(H, [18, 27]);
const willKey = [packet[1], a, ...H];
const willCipher = p0.indices.slice(141, 145);
assert.deepEqual(willCipher, [19, 16, 9, 18]);
assert.deepEqual(willCipher.map((r, i) => mod29(r - willKey[i])), will);
assert.equal(will.reduce((a, b) => a + b, 0), 57);
assert.equal(number60(tokens[57]), 118);
assert.equal(number60(tokens[118]), 35);
const foundCipher = p0.indices.slice(117, 122);
const foundKey = [packet[1], mod29(packet[0] - a), mod29(K * packet[0]), mod29(a - packet[0]), A];
assert.deepEqual(foundCipher.map((r, i) => mod29(r - foundKey[i])), found);

console.log("original source: 12956 runes, 86 same-page equalities, 256 source cells");
console.log("first source token 00: cell192 -> Y O U A (pages9,24,25,34); other 00: cell229 -> X");
console.log("43 signed words, 31 unique >=3-rune words, five eligible phase groups");
console.log("exact signed-word literal matches: YOU, cell192, first three events");
console.log("full YOUA GP0=54 -> unique diagonal p50 low-digit cycle 54 -> 36 -> 54 -> p38[54..56] GP0=36");
console.log("first00 YOUA prime sum210 -> second event phase210 NG-X-O GP0=38, prime sum133 (historical title)");
console.log("complete original event coordinates: page38, rune offset54; literal p50[210]=06 gives DH private a=6");
console.log("typed packet [5,12,19] derives K=2 both via GP29 12/6 and DH mod23 19^6");
console.log("exact original-chapter identity assignments: " + assignments + " possibilities; "
  + cycleMatches + " cycle, " + lexicalMatches + " signed-word, " + jointMatches + " joint");
console.log("retrospective 50000-shuffle signed-vocabulary null: global " + globalHits
  + "/50000; chapter-preserving " + chapterHits + "/50000");
console.log("conditional known path: YOU -> 2L -> p0[141..144] WILL -> two hops -> p0[117..121] FOUND");
console.log("PASS. No new authenticated LP2 plaintext or cipher has been recovered.");
