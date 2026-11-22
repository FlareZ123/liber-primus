"use strict";

/**
 * LP2 source-visible 10/13/23-dot checksum decision.
 * Preserve every original GP29 rune, mark, repeated mark and cross-page carry.
 * Test four fixed arithmetic rules, two literal scope conventions and both
 * mark directions. Exhaust all cyclic control offsets without fitting a key.
 *
 * Windows 11 / Node.js 22:
 * node sims/lp2_10_13_23_marker_checksum_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {decryptTotient} = require("./solved_cipher_regression.cjs");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const annotations = JSON.parse(fs.readFileSync(path.join(root,
  "resources", "liber-primus", "lp2-ink-annotations.json"), "utf8"));
const allRunes = corpus.pages.flatMap(p => p.indices);
const n = allRunes.length;

/**
 * @param {string} sentence
 * @returns {number[]}
 */
function gpEncode(sentence) {
  const tokens = corpus.translit.map((token, i) => ({token, i}))
    .sort((a, b) => b.token.length - a.token.length);
  const result = [];
  for (const word of sentence.split(" ")) {
    for (let j = 0; j < word.length;) {
      const found = tokens.find(t => word.startsWith(t.token, j));
      assert.ok(found, "Unencodable source GP word: " + word.slice(j));
      result.push(found.i);
      j += found.token.length;
    }
  }
  return result;
}

/**
 * @returns {{page: number, pos: number, local: number,
 *    k: number, color: string, pageStart: number, pageEnd: number}[]}
 */
function getMarks() {
  const source = new Map(annotations.pages.map(p => [p.page, p]));
  const result = [];
  let pageStart = 0;
  for (const p of corpus.pages) {
    const event = source.get(p.page);
    for (const [local, k, color] of event?.large_punctuation || []) {
      assert.ok(local >= 0 && local <= p.indices.length);
      result.push({page:p.page, local, pos:pageStart + local,
        k, color, pageStart, pageEnd:pageStart + p.indices.length});
    }
    pageStart += p.indices.length;
  }
  assert.equal(pageStart, 13136);
  assert.equal(result.length, 36);
  assert.deepEqual([10, 13, 23].map(k =>
    result.filter(x => x.k === k).length), [4, 31, 1]);
  assert.deepEqual(result.filter(x => x.page === 0)
    .map(x => [x.local, x.k, x.color]), [[13, 13, "red"]]);
  assert.deepEqual(annotations.pages.find(p => p.page === 0).red_spans
    .map(x => [x.start, x.length]), [[0, 13]]);
  return result;
}

/**
 * @typedef {{start: number, length: number, k: number, page: number}} Span
 *
 * @param {ReturnType<typeof getMarks>} events
 * @param {"continuous"|"page-local"} scope
 * @param {"before"|"after"} direction
 * @returns {Span[]}
 */
function defineSpans(events, scope, direction) {
  const spans = [];
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    let start, end;
    if (direction === "before") {
      const previous = i ? events[i - 1].pos : 0;
      start = scope === "continuous" ? previous :
        Math.max(e.pageStart,
          i && events[i - 1].page === e.page ? previous : e.pageStart);
      end = e.pos;
    } else {
      const next = i + 1 < events.length ? events[i + 1].pos : n;
      start = e.pos;
      end = scope === "continuous" ? next :
        Math.min(e.pageEnd,
          i + 1 < events.length && events[i + 1].page === e.page
            ? next : e.pageEnd);
    }
    if (end > start) spans.push({start, length:end - start,
      k:e.k, page:e.page});
  }
  assert.ok(spans.every(x => x.start >= 0 &&
    x.start + x.length <= n && x.length > 0));
  return spans;
}

/**
 * @param {number[]} values
 * @returns {number[]}
 */
function doubledPrefix(values) {
  const prefix = [0];
  let running = 0;
  for (let i = 0; i < 2 * n; i++) {
    running += values[i % n];
    prefix.push(running);
  }
  return prefix;
}

/**
 * @param {Span[]} spans
 * @param {number[]} prefix
 * @param {(sum:number,marker:number)=>boolean} predicate
 * @param {number} shift
 * @returns {number}
 */
function countMatches(spans, prefix, predicate, shift) {
  let found = 0;
  for (const {start, length, k} of spans) {
    const p = (start + shift) % n;
    if (predicate(prefix[p + length] - prefix[p], k)) found++;
  }
  return found;
}

function main() {
  assert.equal(n, 13136);
  assert.equal(corpus.pages.slice(0, 56)
    .reduce((a, p) => a + p.runic_count, 0), 12956);
  const known = gpEncode(
    "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO " +
    "IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
  const cipher = corpus.pages[56].indices;
  assert.equal(known.length, 85);
  assert.deepEqual(decryptTotient(cipher, new Set([56])), known,
    "Authentic p56 positive control");
  assert.equal(corpus.pages[57].indices.length, 95);
  const marks = getMarks();

  // Actual source-runic values of all five solved marker-delimited intervals.
  // The p56 digest (128 printed hex digits) is not GP29 text or a rune clock.
  const solved = [];
  for (const [page, stream] of [[56, cipher], [56, known],
      [57, corpus.pages[57].indices]]) {
    const event = marks.filter(e => e.page === page);
    let start = 0;
    for (const e of event) {
      const v = stream.slice(start, e.local);
      const prime = v.reduce((a, b) => a + corpus.prime[b], 0);
      const gp0 = v.reduce((a, b) => a + b, 0);
      solved.push({page, register:page === 57 ? "clear" :
        stream === cipher ? "printed" : "known-plaintext",
        start, end:e.local, marker:e.k, gp0, prime,
        gp0ModMarker:gp0 % e.k, primeModMarker:prime % e.k});
      start = e.local;
    }
  }
  assert.deepEqual(solved.filter(x => x.page === 56 &&
    x.register === "printed").map(x => x.primeModMarker), [12, 7, 0]);
  assert.deepEqual(solved.filter(x => x.page === 56 &&
    x.register === "known-plaintext").map(x => x.primeModMarker), [12, 4, 8]);
  assert.deepEqual(solved.filter(x => x.page === 57)
    .map(x => x.primeModMarker), [7, 0]);

  const gp0 = doubledPrefix(allRunes);
  const prime = doubledPrefix(allRunes.map(v => corpus.prime[v]));
  const rules = [
    {name:"GP0 % mark == 0", prefix:gp0, check:(v, m) => v % m === 0},
    {name:"GPprime % mark == 0", prefix:prime, check:(v, m) => v % m === 0},
    {name:"GP0 % 29 == mark", prefix:gp0, check:(v, m) => v % 29 === m},
    {name:"GPprime % 29 == mark", prefix:prime, check:(v, m) => v % 29 === m},
  ];
  const results = [];
  for (const scope of ["continuous", "page-local"]) {
    for (const direction of ["before", "after"]) {
      const spans = defineSpans(marks, scope, direction);
      for (const rule of rules) {
        const observed = countMatches(spans, rule.prefix, rule.check, 0);
        let sum = 0, notLess = 0, maximum = 0;
        for (let offset = 0; offset < n; offset++) {
          const value = countMatches(spans, rule.prefix, rule.check, offset);
          sum += value;
          if (value >= observed) notLess++;
          maximum = Math.max(maximum, value);
        }
        results.push({scope, direction, rule:rule.name,
          originalSpans:spans.length, matches:observed,
          cyclicNullMean:sum / n, cyclicNullUpperTail:notLess / n,
          cyclicNullMax:maximum});
      }
    }
  }
  assert.equal(results.length, 16);
  assert.deepEqual(results.map(x => x.matches),
    [3,3,0,0,4,0,0,0,4,3,1,1,3,1,0,1]);
  assert.ok(results.every(r => r.cyclicNullUpperTail >= 0.27));

  // A short native-register test proves the implemented sum/modulus predicate
  // accepts exactly matching marker-sized aggregates.
  for (const marker of [10, 13, 23]) {
    const nativeGP = Array(marker).fill(1);
    assert.equal(nativeGP.reduce((x, y) => x + y, 0) % marker, 0);
    assert.equal((marker + 1) % marker, 1);
  }

  console.log(JSON.stringify({
    status:"NO UNIVERSAL SOURCE-SIMPLE DOT CHECKSUM",
    printedMarkers:marks.length, nonemptyContinuousClosingSpans:34,
    duplicates:marks.filter((e, i) => i > 0 &&
      e.pos === marks[i - 1].pos).map(e => [e.page, e.local]),
    originalRunes:n, originalUnknownRunes:12956,
    authenticSolvedRegisters:solved,
    exactAllSourceCircularRotations:n,
    comparisons:results,
    constraint:"No extra font, punctuation or guessed rune is inserted",
  }, null, 2));
}
if (require.main === module) main();
module.exports = {main, gpEncode, getMarks, defineSpans, countMatches};
