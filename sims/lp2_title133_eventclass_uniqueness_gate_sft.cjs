"use strict";

/**
 * Director #1691: audit whether original title133 uniquely selects the
 * 31-of-256 red/mark object and its combinadic rank convention.
 *
 * The decisive source-level check precedes any factorization:
 * three already-established, source-visible mark predicates A/B/C are
 * reconstructed from the original ink inventory and chapter-mark inventory.
 * If more than one gives 31 selected marks + 225 red runes = 256 events,
 * title133 cannot uniquely select the event object because each fixed-weight
 * state space has the same 133-bit capacity.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const ink = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-ink-annotations.json"),
  "utf8"
));
const punctuation = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-punctuation-identity.json"),
  "utf8"
));
const html = fs.readFileSync(
  path.join(root, "resources", "historical", "stage11-2014-index.html"),
  "utf8"
);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  const kk = Math.min(k, n - k);
  let result = 1n;
  for (let i = 1; i <= kk; i += 1) {
    result = result * BigInt(n - kk + i) / BigInt(i);
  }
  return result;
}

/** @param {bigint} value @returns {number} */
function bitLength(value) {
  return value.toString(2).length;
}

/** @param {number} value @returns {boolean} */
function isPrime(value) {
  if (value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
    if (value % divisor === 0) return false;
  }
  return true;
}

/** @returns {{page:number,offset:number,dots:number,color:string}[]} */
function physicalMarks() {
  const result = [];
  for (const page of ink.pages) {
    for (const [offset, dots, color] of page.large_punctuation || []) {
      result.push({page: page.page, offset, dots, color});
    }
  }
  return result;
}

/** @param {{page:number,offset:number,dots:number,color:string}} mark @returns {string} */
function signature(mark) {
  return `${mark.page}:${mark.offset}:${mark.dots}:${mark.color}`;
}

assert.ok(html.includes("<title>133</title>"));
assert.equal(ink.counts.red, 225);

const marks = physicalMarks();
assert.equal(marks.length, 36);

// A: uniform morphology, all physical 13-dot marks regardless of color.
const classA = marks.filter((mark) => mark.dots === 13);
assert.equal(classA.length, 31);

// B: uniform red-ink + prime-dot predicate, i.e. 30 red13 plus terminal red23.
const classB = marks.filter((mark) => mark.color === "red" && isPrime(mark.dots));
assert.equal(classB.length, 31);
assert.equal(classB.filter((mark) => mark.dots === 13).length, 30);
assert.equal(classB.filter((mark) => mark.dots === 23).length, 1);

// C: original large chapter/section marks, image-matched in the punctuation
// identity resource. They contain 28 thirteen-dot + 3 ten-dot marks.
const chapterEvents = punctuation.events.filter(
  (event) => event.symbol === "⁜" && event.large_mark
);
assert.equal(chapterEvents.length, 31);
assert.deepEqual(
  chapterEvents.reduce((counts, event) => {
    const dots = event.large_mark.dot_count;
    counts[dots] = (counts[dots] || 0) + 1;
    return counts;
  }, {}),
  {"10": 3, "13": 28}
);
const classC = chapterEvents.map((event) => ({
  page: event.page,
  offset: event.local_rune_offset,
  dots: event.large_mark.dot_count,
  color: event.large_mark.color
}));

const sets = [classA, classB, classC].map(
  (selected) => new Set(selected.map(signature))
);
assert.notDeepEqual([...sets[0]].sort(), [...sets[1]].sort());
assert.notDeepEqual([...sets[0]].sort(), [...sets[2]].sort());
assert.notDeepEqual([...sets[1]].sort(), [...sets[2]].sort());

const classes = [
  {name: "A_all_physical_13dot", marks: classA.length},
  {name: "B_red_prime_dot", marks: classB.length},
  {name: "C_chapter_marks", marks: classC.length}
].map((item) => {
  const events = ink.counts.red + item.marks;
  const width = bitLength(choose(events, item.marks) - 1n);
  return {...item, events, fixedWeightBits: width};
});

assert.deepEqual(
  classes.map((item) => [item.events, item.marks, item.fixedWeightBits]),
  [[256, 31, 133], [256, 31, 133], [256, 31, 133]]
);

// The title therefore identifies a shared cardinality/weight property, not one
// unique event predicate.
assert.equal(new Set(classes.map((item) => item.fixedWeightBits)).size, 1);
assert.equal(classes[0].fixedWeightBits, 133);

// The red-only reduced tape used by the later factor route is a separate
// 30-of-255 object whose full enumerative capacity is 130 bits, so title133
// does not independently choose a rank convention on that reduced state.
const redOnlyBits = bitLength(choose(255, 30) - 1n);
assert.equal(redOnlyBits, 130);

console.log(JSON.stringify({
  status: "PASS: #1691 title133 object-selection uniqueness fails",
  title: 133,
  sourceNaturalClasses: classes,
  pairwiseDistinct: true,
  reducedRedOnly: {
    events: 255,
    marks: 30,
    fixedWeightBits: redOnlyBits
  },
  decision: "Three distinct source-visible 31-of-256 objects all have 133-bit capacity. Title133 cannot uniquely select the all-13-dot tape, and the later 30-of-255 rank convention remains selected only by downstream factor labels unless an independent rank-semantic prediction is supplied."
}, null, 2));
