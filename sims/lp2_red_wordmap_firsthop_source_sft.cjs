"use strict";

/**
 * Source-visible red ink as the selector for the proposed 2016 GP-prime
 * 58-page word graph. Examines direct solved targets and terminal graph
 * destinations without tuning any word address or ciphertext rune.
 *
 * Research status: exploratory. No unknown LP2 plaintext is inferred.
 * Run: node sims/lp2_red_wordmap_firsthop_source_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..", "resources", "liber-primus");
/** @param {string} filename */
function read(filename) {
  return fs.readFileSync(path.join(root, filename), "utf8");
}
const corpus = JSON.parse(read("lp2-corpus.json"));
const ink = JSON.parse(read("lp2-ink-annotations.json"));
const grid = JSON.parse(read("lp2-grid-256.json"));
const text = read("lp2-transcription.txt");
const known = read("lp1-plaintext-reference.txt");
const byRune = new Map(corpus.runes.map((rune, i) => [rune, corpus.prime[i]]));
const chunks = text.split("%");
assert.equal(chunks.length, 57);

/** @param {string} pageText */
function pageWords(pageText) {
  /** @type {{word:string,start:number,end:number}[]} */
  const found = [];
  let word = "";
  let start = 0;
  let offset = 0;
  for (const ch of pageText) {
    if (byRune.has(ch)) {
      if (!word) start = offset;
      word += ch;
      offset++;
    } else if (ch === "/" || /\s/u.test(ch)) {
      // A printed line/page wrap is not a word break.
    } else if (word) {
      found.push({ word, start, end: offset });
      word = "";
    }
  }
  if (word) found.push({ word, start, end: offset });
  return found;
}

const pages = Array.from({ length: 58 }, (_, page) => page === 50
  ? grid.pages.find((item) => item.page === 50).tokens
  : pageWords(chunks[page >= 51 ? page - 1 : page]));
assert.equal(pages[50].length, 104);
assert.equal(pages.slice(0, 56).reduce((total, words, p) =>
  total + (p === 50 ? 0 : words.length), 0), 2928);

const solved56 = known.split("### 56")[1].split("### 57")[0]
  .split(/\r?\n\r?\n/u).slice(0, 2).join(" ").match(/[A-Z]+/gu);
const solved57 = known.split("### 57")[1].match(/[A-Z]+/gu);
assert.equal(solved56[3], "THE");
assert.equal(solved57[2], "THE");
assert.equal(solved57[5], "TO");

/** @param {string} word */
function primeSum(word) {
  return [...word].reduce((value, rune) => value + byRune.get(rune), 0);
}

/** @param {string} word */
function walk(word) {
  let n = primeSum(word);
  const visited = new Set();
  for (let depth = 0; depth < 150; depth++) {
    const page = n % 58;
    const j = Math.floor(n / 58);
    const target = pages[page][j];
    assert.ok(target, "In-bounds word pointer required");
    if (page === 50) return { kind: "table", depth, page, j };
    if (page >= 56) {
      const label = (page === 56 ? solved56 : solved57)[j];
      assert.ok(label);
      return { kind: "solved", depth, page, j, label };
    }
    if (visited.has(n)) return { kind: "cycle", depth, page, j };
    visited.add(n);
    n = primeSum(target.word);
  }
  assert.fail("Unexpected long pointer walk");
}

/** @param {number} n @param {number} k */
function choose(n, k) {
  if (k < 0 || k > n) return 0;
  let result = 1;
  for (let i = 1; i <= k; i++) result *= (n - i + 1) / i;
  return result;
}

/** @param {number} total @param {number} successes @param {number} picks */
function hypergeometric(total, successes, picks) {
  return Array.from({ length: picks + 1 }, (_, k) =>
    choose(successes, k) * choose(total - successes, picks - k) /
    choose(total, picks));
}
const positive = hypergeometric(4, 2, 2);
assert.ok(Math.abs(positive[0] - 1 / 6) < 1e-12);
assert.ok(Math.abs(positive[1] - 2 / 3) < 1e-12);
assert.ok(Math.abs(positive[2] - 1 / 6) < 1e-12);

/** @type {{page:number,index:number,word:string,kind:string,depth:number,target:string}[]} */
const red = [];
const cohorts = [];
for (const marked of ink.pages) {
  if (marked.page >= 56 || !marked.red_spans) continue;
  const words = pages[marked.page];
  const chosen = new Set();
  for (const span of marked.red_spans) {
    for (let j = 0; j < words.length; j++) {
      const word = words[j];
      const overlap = word.start < span.start + span.length && word.end > span.start;
      if (!overlap) continue;
      assert.ok(word.start >= span.start &&
        word.end <= span.start + span.length,
      "Red span must select a whole printed word");
      chosen.add(j);
    }
  }
  const all = words.map((entry) => walk(entry.word));
  cohorts.push({ page: marked.page, all, chosen });
  for (const index of chosen) {
    const target = all[index];
    red.push({
      page: marked.page,
      index,
      word: words[index].word,
      kind: target.kind,
      depth: target.depth,
      target: target.kind === "solved"
        ? ("p" + target.page + ":w" + target.j + ":" + target.label)
        : target.kind,
    });
  }
}
assert.equal(cohorts.length, 13);
assert.equal(red.length, 50);
const direct = red.filter((entry) => entry.kind === "solved" &&
  entry.depth === 0);
const eventual = red.filter((entry) => entry.kind === "solved");
assert.equal(direct.length, 3);
assert.equal(eventual.length, 9);

const expectedDirect = [
  { page: 0, index: 0, target: "p57:w5:TO", sum: 347 },
  { page: 15, index: 4, target: "p56:w3:THE", sum: 230 },
  { page: 39, index: 26, target: "p57:w2:THE", sum: 173 },
];
for (const item of expectedDirect) {
  const hit = direct.find((entry) => entry.page === item.page &&
    entry.index === item.index);
  assert.ok(hit);
  assert.equal(hit.target, item.target);
  assert.equal(primeSum(hit.word), item.sum);
}
assert.equal(
  [...pages[0][0].word].map((rune) =>
    corpus.translit[corpus.runes.indexOf(rune)]).join(""),
  "SHEOGMIAF");
assert.equal(pages[0][0].start, 0);

/** @param {(route:ReturnType<typeof walk>)=>boolean} isHit */
function stratifiedTail(isHit) {
  let dist = [1];
  let observed = 0;
  let picks = 0;
  for (const { all, chosen } of cohorts) {
    const n = all.length;
    const s = all.filter(isHit).length;
    const c = chosen.size;
    picks += c;
    for (const j of chosen) if (isHit(all[j])) observed++;
    const local = hypergeometric(n, s, c);
    const next = Array(dist.length + local.length - 1).fill(0);
    for (let i = 0; i < dist.length; i++) {
      for (let j = 0; j < local.length; j++) {
        next[i + j] += dist[i] * local[j];
      }
    }
    dist = next;
  }
  assert.equal(picks, 50);
  const expectation = dist.reduce((sum, p, k) => sum + k * p, 0);
  const tail = dist.slice(observed).reduce((sum, p) => sum + p, 0);
  return { observed, expectation, tail };
}
const directNull = stratifiedTail((route) =>
  route.kind === "solved" && route.depth === 0);
const eventualNull = stratifiedTail((route) => route.kind === "solved");
assert.equal(directNull.observed, 3);
assert.ok(Math.abs(directNull.expectation - 0.8327590233771689) < 1e-9);
assert.ok(Math.abs(directNull.tail - 0.04387491766059103) < 1e-9);
assert.equal(eventualNull.observed, 9);
assert.ok(Math.abs(eventualNull.expectation - 5.894700326819532) < 1e-9);
assert.ok(Math.abs(eventualNull.tail - 0.11056669137182593) < 1e-9);

console.log("Original red word segments:", red.length, "in",
  cohorts.length, "pages; whole-book segments:", 2928);
console.log("Three direct source-to-solved pointers:");
for (const hit of direct) {
  console.log("p" + hit.page + ":w" + hit.index + " GPsum=" +
    primeSum(hit.word) + " -> " + hit.target);
}
console.log("Direct-red exact page-stratified null:", directNull);
console.log("Eventual-red exact page-stratified null:", eventualNull);
console.log("Original red targets in page/text order:",
  eventual.map((hit) => hit.target).join("; "));
console.log("No unknown plaintext or historically fixed navigation rule.");
