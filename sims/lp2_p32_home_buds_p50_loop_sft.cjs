"use strict";

/**
 * Agent8 SFT: p32 HOME/BUDS receiver for the frozen p50 navigation composite.
 * Reads canonical repository resources only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const wordfreq = read("resources/control/english_wordfreq_textblob.txt");
const tableTokens = grid.pages.flatMap((page) => page.tokens);

const gpAlphabet = corpus.translit
  .map((token, index) => ({ token: token.toLowerCase(), index }))
  .sort((left, right) => right.token.length - left.token.length);

/** @param {string} word @returns {number[]} */
function tokenize(word) {
  let rest = word
    .toLowerCase()
    .replace(/qu/g, "cw")
    .replace(/v/g, "u")
    .replace(/[kq]/g, "c")
    .replace(/z/g, "s")
    .replace(/[^a-z]/g, "");
  const out = [];
  while (rest.length > 0) {
    if (rest.startsWith("ing")) {
      out.push(21);
      rest = rest.slice(3);
      continue;
    }
    if (rest.startsWith("io")) {
      out.push(27);
      rest = rest.slice(2);
      continue;
    }
    const hit = gpAlphabet.find(({ token }) => rest.startsWith(token));
    assert.ok(hit, "unrecognized GP token in " + word + ": " + rest);
    out.push(hit.index);
    rest = rest.slice(hit.token.length);
  }
  return out;
}

/** @param {string} word @returns {number} */
function gp0(word) {
  return tokenize(word).reduce((sum, value) => sum + value, 0);
}

const alphabet60 = grid.alphabet;
/** @param {string} token @returns {number} */
function decode60(token) {
  const high = alphabet60.indexOf(token[0]);
  const low = alphabet60.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0, "invalid base60 token " + token);
  return high * 60 + low;
}
const table60 = tableTokens.map(decode60);

/** @param {number} start @param {number} steps @returns {number[]} */
function walk60(start, steps) {
  const route = [start];
  let state = start;
  for (let index = 0; index < steps; index += 1) {
    assert.ok(state >= 0 && state < table60.length);
    state = table60[state];
    route.push(state);
  }
  return route;
}

const route = walk60(gp0("SEEKS"), 23);
assert.deepEqual(route, [
  71,108,14,183,81,58,146,92,236,238,129,179,175,18,15,212,
  70,169,228,144,125,20,102,32,
]);
assert.equal(gp0("EPIPHANY"), 121);
assert.equal(gp0("EMPTY"), 92);
assert.equal(gp0("THE"), 20);
assert.equal(gp0("DEVOTED"), 102);
assert.equal(route.indexOf(gp0("EMPTY")), 7);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const p32 = corpus.pages.find((page) => page.page === 32);
assert.ok(p32);
assert.equal(p32.indices.length, 121);
assert.equal(gp0("HOME"), 48);
assert.equal(gp0("BUDS"), 56);

/** @returns {{start:number,end:number,indices:number[],text:string}[]} */
function parseP32Fragments() {
  const raw = transcription.split("%")[32];
  const fragments = [];
  let current = [];
  let start = 0;
  let offset = 0;
  const flush = () => {
    if (current.length === 0) return;
    fragments.push({
      start,
      end: offset,
      indices: current.slice(),
      text: current.map((value) => corpus.translit[value]).join("").toUpperCase(),
    });
    current = [];
  };
  for (const char of raw) {
    if (runeIndex.has(char)) {
      if (current.length === 0) start = offset;
      current.push(runeIndex.get(char));
      offset += 1;
    } else if (char === "/" || /\s/u.test(char)) {
      continue;
    } else {
      flush();
    }
  }
  flush();
  assert.equal(offset, 121);
  return fragments;
}

/** @param {string} raw @returns {boolean} */
function endsWithBoundary(raw) {
  for (let index = raw.length - 1; index >= 0; index -= 1) {
    const char = raw[index];
    if (char === "/" || /\s/u.test(char)) continue;
    return !runeIndex.has(char);
  }
  return true;
}

const pages = transcription.split("%");
const p32Fragments = parseP32Fragments();
assert.equal(p32Fragments.length, 22);
assert.equal(endsWithBoundary(pages[31]), false);
assert.equal(p32Fragments.length - 1, 21);
const emptyStep = route.indexOf(gp0("EMPTY"));
const selectedFragment = p32Fragments[emptyStep];
assert.deepEqual(
  { index: emptyStep, start: selectedFragment.start, end: selectedFragment.end, text: selectedFragment.text },
  { index: 7, start: 33, end: 44, text: "HOMEXWDSLFD" }
);
assert.equal(p32Fragments.slice(1, emptyStep + 1).length, 7);
const selectedPosition = gp0("EMPTY") % selectedFragment.indices.length;
assert.equal(selectedPosition, 4);
assert.equal(corpus.translit[selectedFragment.indices[selectedPosition]], "X");
assert.equal(selectedFragment.start + selectedPosition, 37);

const side = 11;
const prime = (value) => corpus.prime[value];
assert.equal(p32.indices.slice(0, side).reduce((sum, value) => sum + prime(value), 0), 563);
assert.equal(
  Array.from({ length: side }, (_, row) => p32.indices[row * side])
    .reduce((sum, value) => sum + prime(value), 0),
  569
);

const frequency = new Map();
for (const line of wordfreq.split(/\r?\n/u)) {
  const match = line.match(/^([a-z]{4})\s+(\d+)$/u);
  if (match) frequency.set(match[1].toUpperCase(), Number(match[2]));
}
const directions = [
  [0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1],
];

/** @param {number} row @param {number} col @param {number} dr @param {number} dc @returns {string|null} */
function fourLetterAt(row, col, dr, dc) {
  let text = "";
  for (let step = 0; step < 4; step += 1) {
    const y = row + step * dr;
    const x = col + step * dc;
    if (y < 0 || y >= side || x < 0 || x >= side) return null;
    const token = corpus.translit[p32.indices[y * side + x]];
    if (token.length !== 1) return null;
    text += token.toUpperCase();
  }
  return text;
}

const gridWords = [];
for (let row = 0; row < side; row += 1) {
  for (let col = 0; col < side; col += 1) {
    for (const [dr, dc] of directions) {
      const word = fourLetterAt(row, col, dr, dc);
      if (word && frequency.has(word)) {
        gridWords.push({ word, gp0: gp0(word), row, col, dr, dc, frequency: frequency.get(word) });
      }
    }
  }
}
assert.deepEqual(gridWords, [
  { word: "HOME", gp0: 48, row: 3, col: 0, dr: 0, dc: 1, frequency: 295 },
  { word: "BUDS", gp0: 56, row: 8, col: 5, dr: 0, dc: 1, frequency: 6 },
]);

const boundaries = new Set(p32Fragments.flatMap((fragment) => [fragment.start, fragment.end]));
const dh = { p:23, g:5, a:6, b:15, A:8, B:19, K:2 };
assert.equal(selectedPosition + 1, dh.g);
const homeStart = 33;
const xOffset = 37;
const homeRow = Math.floor(homeStart / side);
const homeCol = homeStart % side;
const xRow = Math.floor(xOffset / side);
const xCol = xOffset % side;
const diagonalFamily = [];
for (const [field, value] of Object.entries(dh)) {
  const step = value % side;
  for (const dr of [-1, 1]) {
    for (const dc of [-1, 1]) {
      const row = homeRow + dr * step;
      const col = homeCol + dc * step;
      const translatedXRow = xRow + dr * step;
      const translatedXCol = xCol + dc * step;
      if (
        row < 0 || row >= side || col < 0 || col + 3 >= side ||
        translatedXRow < 0 || translatedXRow >= side ||
        translatedXCol < 0 || translatedXCol >= side
      ) continue;
      const destination = row * side + col;
      const translatedX = translatedXRow * side + translatedXCol;
      const word = fourLetterAt(row, col, 0, 1);
      diagonalFamily.push({
        field, value, step, dr, dc, destination, translatedX, word,
        dictionary: word !== null && frequency.has(word),
        boundary: boundaries.has(translatedX),
      });
    }
  }
}
const dictionaryDiagonals = diagonalFamily.filter((row) => row.dictionary);
assert.deepEqual(dictionaryDiagonals, [{
  field:"g", value:5, step:5, dr:1, dc:1, destination:93, translatedX:97,
  word:"BUDS", dictionary:true, boundary:true,
}]);
assert.deepEqual(diagonalFamily.filter((row) => row.dictionary && row.boundary), dictionaryDiagonals);
assert.equal(93 - 33, 60);
assert.equal(5 * (side + 1), 60);
assert.equal(97, p32Fragments[16].start);
assert.equal(p32Fragments[15].text, "OENGOMBUDS");
assert.deepEqual(p32Fragments[15].indices.slice(0, 4), [22,21,3,19]);
assert.deepEqual(p32Fragments[15].indices.slice(4), [17,1,23,15]);
assert.deepEqual([dh.p - 1, dh.p - dh.K, 3, dh.B], [22,21,3,19]);

const deltas = { N:[-1,0], S:[1,0], E:[0,1], W:[0,-1] };
/** @param {number} index @param {string} token @returns {number|null} */
function literalMove(index, token) {
  const match = token.match(/^([1-9])([NSEWnsew])$/u);
  if (!match) return null;
  const row = Math.floor(index / 8);
  const col = index % 8;
  const [dr, dc] = deltas[match[2].toUpperCase()];
  const distance = Number(match[1]);
  const nextRow = row + dr * distance;
  const nextCol = col + dc * distance;
  return nextRow >= 0 && nextRow < 32 && nextCol >= 0 && nextCol < 8
    ? nextRow * 8 + nextCol
    : null;
}

/** @param {number} index @param {string} token @returns {number|null} */
function hexCardinalMove(index, token) {
  if (!/^[0-9A-Fa-f]{2}$/u.test(token)) return null;
  const direction = String.fromCharCode(Number.parseInt(token, 16)).toUpperCase();
  if (!Object.hasOwn(deltas, direction)) return null;
  const row = Math.floor(index / 8);
  const col = index % 8;
  const [dr, dc] = deltas[direction];
  const nextRow = row + dr;
  const nextCol = col + dc;
  return nextRow >= 0 && nextRow < 32 && nextCol >= 0 && nextCol < 8
    ? nextRow * 8 + nextCol
    : null;
}

const tableCompositeTransitions = [];
for (let source = 0; source < tableTokens.length; source += 1) {
  const middle = literalMove(source, tableTokens[source]);
  if (middle === null) continue;
  const destination = hexCardinalMove(middle, tableTokens[middle]);
  if (destination === null) continue;
  tableCompositeTransitions.push({
    source,
    sourceToken: tableTokens[source],
    middle,
    middleToken: tableTokens[middle],
    destination,
  });
}
assert.deepEqual(tableCompositeTransitions, [{
  source:57, sourceToken:"1w", middle:56, middleToken:"4E", destination:48,
}]);
assert.equal(gp0("WAY"), 57);
assert.equal(gp0("BUDS"), 56);
assert.equal(gp0("HOME"), 48);
assert.equal(tableTokens[48], "4D");
assert.equal(hexCardinalMove(48, tableTokens[48]), null);
assert.equal(String.fromCharCode(Number.parseInt(tableTokens[48], 16)), "M");

const signedBody = signed2016
  .slice(signed2016.indexOf("Hello."), signed2016.indexOf("-----BEGIN PGP SIGNATURE-----"))
  .replace(/\b7A35090F\b/g, "");
const signedWords = signedBody.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
const signed57 = [...new Set(signedWords.map((word) => word.toUpperCase()).filter((word) => gp0(word) === 57))];
assert.deepEqual(signed57, ["WAY", "WILL"]);
const theFollowers = signedWords
  .map((word, index) => word.toUpperCase() === "THE" ? signedWords[index + 1] : null)
  .filter(Boolean)
  .map((word) => word.toUpperCase());
assert.deepEqual(theFollowers, ["PATH", "DEVOTED", "WAY", "MAP", "ROAD", "DIRECTION"]);
assert.deepEqual(theFollowers.filter((word) => gp0(word) === 57), ["WAY"]);


// Cross-route holdout: the independently selected p32 PARABLE/SURFACE path
// uses GP-prime residues modulo B=19 from the final fragment at offset117.
const parable = [
  "LIKE","THE","INSTAR","TUNNELING","TO","THE","SURFACE",
  "WE","MUST","SHED","OUR","OWN","CIRCUMFERENCES","FIND",
  "THE","DIVINITY","WITHIN","AND","EMERGE",
];
const surfaceOffsets = [117,107,97,87];
const surfaceResidues = surfaceOffsets.map((offset) => corpus.prime[p32.indices[offset]] % dh.B);
assert.deepEqual(surfaceResidues, [2,3,4,5]);
assert.deepEqual(surfaceResidues.map((value) => parable[value]), ["INSTAR","TUNNELING","TO","THE"]);
assert.equal(dictionaryDiagonals[0].translatedX, surfaceOffsets[2]);
assert.equal(corpus.translit[p32.indices[97]], "B");
assert.equal(corpus.prime[p32.indices[97]], 61);
assert.equal(corpus.prime[p32.indices[97]] % dh.B, 4);
assert.equal(parable[4], "TO");

const surfaceSet = new Set(surfaceOffsets);
assert.deepEqual(
  diagonalFamily.filter((row) => row.dictionary && surfaceSet.has(row.translatedX)),
  dictionaryDiagonals
);
assert.deepEqual(
  diagonalFamily.filter((row) => surfaceSet.has(row.translatedX)),
  dictionaryDiagonals
);

// The HOME->BUDS destination is an 8-rune page-local fragment. Apply the
// already fixed outer-pair H(x,y)=(x-y,x+y) mod29 shell to every 8-rune
// fragment in unknown LP2 and charge only the pre-existing DH/cube vocabulary.
/** @param {number} x @param {number} y @returns {[number,number]} */
function H(x, y) {
  return [((x - y) % 29 + 29) % 29, (x + y) % 29];
}

/** @param {string} raw @returns {number[][]} */
function parseFragments(raw) {
  const fragments = [];
  let current = [];
  const flush = () => {
    if (current.length === 0) return;
    fragments.push(current.slice());
    current = [];
  };
  for (const char of raw) {
    if (runeIndex.has(char)) current.push(runeIndex.get(char));
    else if (char === "/" || /\s/u.test(char)) continue;
    else flush();
  }
  flush();
  return fragments;
}

/** @param {number[]} fragment @returns {number[]} */
function outerHShell(fragment) {
  assert.equal(fragment.length % 2, 0);
  const out = [];
  for (let layer = 0; layer < fragment.length / 2; layer += 1) {
    out.push(...H(fragment[layer], fragment[fragment.length - 1 - layer]));
  }
  return out;
}

const e = 3;
const q = gp0("EMPTY") / dh.p;
assert.equal(q, 4);
const stateVocabulary = new Set([
  dh.p, dh.g, dh.a, dh.b, dh.A, dh.B, dh.K, e, q,
  (29 - dh.K) % 29,
  dh.g + dh.K,
]);
const eightRuneShells = [];
for (let page = 0; page <= 55; page += 1) {
  const fragments = parseFragments(pages[page]);
  for (let fragment = 0; fragment < fragments.length; fragment += 1) {
    const indices = fragments[fragment];
    if (indices.length !== 8) continue;
    const shell = outerHShell(indices);
    eightRuneShells.push({
      page,
      fragment,
      indices,
      shell,
      score: shell.filter((value) => stateVocabulary.has(value)).length,
    });
  }
}
assert.equal(eightRuneShells.length, 159);
const perfectShells = eightRuneShells.filter((row) => row.score === 8);
assert.deepEqual(perfectShells, [{
  page:32,
  fragment:15,
  indices:[22,21,3,19,17,1,23,15],
  shell:[7,8,27,15,2,4,2,7],
  score:8,
}]);
const shellHistogram = Object.fromEntries(
  Array.from({length:9}, (_, score) => [
    String(score),
    eightRuneShells.filter((row) => row.score === score).length,
  ])
);
assert.deepEqual(shellHistogram, {
  "0":2,"1":19,"2":31,"3":39,"4":31,"5":23,"6":10,"7":3,"8":1,
});
assert.deepEqual(perfectShells[0].shell, [
  dh.g + dh.K,
  dh.A,
  (29 - dh.K) % 29,
  dh.b,
  dh.K,
  q,
  dh.K,
  dh.g + dh.K,
]);

// The selected input itself has a compact fixed-state description. This is
// recorded as structure, not used to select the fragment.
assert.deepEqual(perfectShells[0].indices, [
  dh.p - 1,
  dh.p - dh.K,
  e,
  dh.B,
  dh.B - dh.K,
  1,
  dh.p,
  dh.b,
]);

// READ OUT + source-index consumer: the independently selected receiver's
// outer H pair returns the exact suffix of the upstream signed selector.
const targetOuterPair = H(
  perfectShells[0].indices[0],
  perfectShells[0].indices[perfectShells[0].indices.length - 1]
);
assert.deepEqual(targetOuterPair, [dh.g + dh.K, dh.A]);
assert.deepEqual(targetOuterPair, [7,8]);
assert.deepEqual(targetOuterPair.map((index) => signedWords[index].toUpperCase()), ["THE","DEVOTED"]);

const exactSelectorSuffixFragments = [];
for (let page = 0; page <= 55; page += 1) {
  const fragments = parseFragments(pages[page]);
  for (let fragment = 0; fragment < fragments.length; fragment += 1) {
    const indices = fragments[fragment];
    if (indices.length < 2) continue;
    const pair = H(indices[0], indices[indices.length - 1]);
    if (pair[0] === 7 && pair[1] === 8) {
      exactSelectorSuffixFragments.push({page,fragment,length:indices.length,indices});
    }
  }
}
assert.deepEqual(exactSelectorSuffixFragments, [
  {page:11,fragment:38,length:5,indices:[22,23,0,1,15]},
  {page:19,fragment:47,length:2,indices:[22,15]},
  {page:32,fragment:15,length:8,indices:[22,21,3,19,17,1,23,15]},
  {page:41,fragment:11,length:6,indices:[22,24,17,10,10,15]},
]);
assert.deepEqual(
  exactSelectorSuffixFragments.filter((row) => row.length === 8),
  [exactSelectorSuffixFragments[2]]
);

console.log(JSON.stringify({
  status:"PASS",
  upstream:{route,emptyStep,selectedPage:32,selectedFragment:selectedFragment.text,selectedXOffset:37},
  p32Grid:{side,topPrimeSum:563,leftPrimeSum:569,fourLetterWords:gridWords},
  diagonalTransfer:{
    dictionaryHits:dictionaryDiagonals,
    targetFragment:p32Fragments[15].text,
    targetPrefix:p32Fragments[15].indices.slice(0,4),
    targetPrefixDh:["p-1","p-K","e","B"],
  },
  frozenP50Composite:{transitions:tableCompositeTransitions,p32Labels:{56:"BUDS",48:"HOME"},terminal:"4D/M"},
  signedRole:{gp0_57_aliases:signed57,theFollowers},
}, null, 2));
