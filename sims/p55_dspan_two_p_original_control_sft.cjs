"use strict";

/**
 * Original LP2 p55 D-to-D strict-interior recursive-fold test.
 * Node.js 20+ CommonJS; runs from repository root, writes nothing.
 * Source originals: resources/lp2-transcription.txt, lp2-corpus.json.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");

const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const chunks = fs.readFileSync("resources/lp2-transcription.txt", "utf8").split("%");
const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
assert.equal(chunks.length, 57);

/** @param {string} raw @returns {number[][]} */
function parseWords(raw) {
  const out = [];
  let current = [];
  for (const ch of raw) {
    if (runeToIndex.has(ch)) {
      current.push(runeToIndex.get(ch));
    } else if (ch === "%" || ch === "/" || /\s/u.test(ch)) {
      // Pages and printed line wraps do not terminate words.
    } else if (current.length) {
      out.push(current);
      current = [];
    }
  }
  if (current.length) out.push(current);
  return out;
}

const originalWords = parseWords(chunks.slice(0, 55).join("%"));
const strictInteriors = originalWords.flatMap(w => w.length > 2 ? w.slice(1, -1) : []);
const page55Words = parseWords(chunks[54]);
const p55Interior = page55Words.flatMap(w => w.length > 2 ? w.slice(1, -1) : []);
assert.equal(originalWords.length, 2896);
assert.equal(strictInteriors.length, 7247);
assert.equal(page55Words.length, 17);
assert.equal(p55Interior.length, 43);

const positions = idx => p55Interior.flatMap((v, i) => v === idx ? [i + 1] : []);
assert.deepEqual(positions(23), [5, 23]); // D
assert.deepEqual(positions(14), [13, 31]); // X: equal-length competing span
const dSpan = p55Interior.slice(5, 22); // strictly between 1-based D positions
const xSpan = p55Interior.slice(13, 30);
assert.equal(dSpan.length, 17);
assert.equal(xSpan.length, 17);

/**
 * @param {number[]} xs
 * @param {"left-minus-right"|"right-minus-left"|"plus"} op
 * @returns {number[]}
 */
function fold(xs, op) {
  const half = Math.floor(xs.length / 2), next = [];
  for (let i = 0; i < half; i++) {
    const left = xs[i], right = xs[xs.length - 1 - i];
    const value = op === "left-minus-right" ? left - right :
      op === "right-minus-left" ? right - left : left + right;
    next.push(((value % 29) + 29) % 29);
  }
  if (xs.length % 2) next.push(xs[half]);
  return next;
}

/** @param {number[]} xs @param {"left-minus-right"|"right-minus-left"|"plus"} op */
function reduce(xs, op) {
  const levels = [xs];
  while (levels.at(-1).length > 1) levels.push(fold(levels.at(-1), op));
  return levels;
}
function target(levels) {
  const first = levels[1], last = levels.at(-1)[0];
  return first[0] === 16 && first[1] === 7 && first[2] === 3 && last === 13;
}
const gp = array => array.map(idx => corpus.translit[idx]).join(" ");
const operations = ["left-minus-right", "right-minus-left", "plus"];
const controlRows = [];
for (const op of operations) {
  const hits = [];
  let firstTWO = 0, lastP = 0;
  for (let start = 0; start + 17 <= strictInteriors.length; start++) {
    const levels = reduce(strictInteriors.slice(start, start + 17), op);
    const first = levels[1];
    if (first[0] === 16 && first[1] === 7 && first[2] === 3) firstTWO++;
    if (levels.at(-1)[0] === 13) lastP++;
    if (target(levels)) hits.push(start);
  }
  controlRows.push({
    op, hits, firstTWO, lastP,
    dSpan: target(reduce(dSpan, op)),
    xSpan: target(reduce(xSpan, op))
  });
}
assert.deepEqual(controlRows, [
  {op:"left-minus-right",hits:[7209],firstTWO:1,lastP:236,dSpan:true,xSpan:false},
  {op:"right-minus-left",hits:[],firstTWO:0,lastP:264,dSpan:false,xSpan:false},
  {op:"plus",hits:[],firstTWO:0,lastP:250,dSpan:false,xSpan:false}
]);
assert.deepEqual(reduce(dSpan, "left-minus-right").map(gp), [
  "TH IA A B C EA F X I M U C P H NG L S",
  "T W O N NG D EA A I",
  "G EO R S NG",
  "X Y R",
  "I Y",
  "P"
]);

// The terminal output is a linear functional of the 17 original GP indices.
// Derive it from basis inputs to avoid fitting coefficients to the target.
const coefficients = Array.from({length:17}, (_, i) => {
  const basis = Array(17).fill(0);
  basis[i] = 1;
  return reduce(basis, "left-minus-right").at(-1)[0];
});
assert.deepEqual(coefficients,
  [1,28,28,1,28,28,1,1,28,28,28,1,1,28,1,1,28]);

// Fixed-multiset conditional null: shuffle exactly the 17 original indices.
// All predicates and seed fixed. This is a post-selected diagnostic, not
// a p-value for the original discovery after selecting D/sign/phrase.
const permutations = 10000000;
let state = 0x3301;
function random32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const shuffled = dSpan.slice();
let prefixTWO = 0, terminalP = 0, both = 0;
for (let k = 0; k < permutations; k++) {
  for (let j = shuffled.length - 1; j > 0; j--) {
    const i = random32() % (j + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const isTWO = ((shuffled[0] - shuffled[16] + 29) % 29 === 16)
    && ((shuffled[1] - shuffled[15] + 29) % 29 === 7)
    && ((shuffled[2] - shuffled[14] + 29) % 29 === 3);
  let last = 0;
  for (let j = 0; j < 17; j++) last += shuffled[j] * coefficients[j];
  const isP = last % 29 === 13;
  if (isTWO) prefixTWO++;
  if (isP) terminalP++;
  if (isTWO && isP) both++;
}
assert.deepEqual([prefixTWO, terminalP, both], [555, 345122, 15]);
console.log(JSON.stringify({
  corpus: {words:originalWords.length, strictInteriorRunes:strictInteriors.length},
  p55:{pageLocalSegments:page55Words.length,strictInteriors:p55Interior.length,
    dPositions:positions(23),xPositions:positions(14),dSpan,
    recursion:reduce(dSpan,"left-minus-right").map(gp)},
  controls:controlRows,
  shuffledNull:{seed:0x3301,permutations,prefixTWO,terminalP,jointTWOandP:both}
}, null, 2));
console.log("Interpretation: conditional motif only; no independent radix/sign/direction selector, LP2 key or plaintext.");
