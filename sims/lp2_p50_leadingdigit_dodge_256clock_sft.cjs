"use strict";

/**
 * Original 256-source-cell high-digit modular dodge gate.
 *
 * Candidate cipher: a 29-rune cumulative additive register driven by the
 * high base60 digit (0..4) of the original printed p49..51 32x8 table.
 * On a proposed repeated cipher rune, advance the table clock once and retry.
 * This operation has exact source-reproducible high digits and a clear inverse.
 *
 * Any ciphertext-consistent skip path is accepted by the DP: unknown plaintext,
 * arbitrary initial GP shift, and every one of the 256 source clock phases.
 * No English score or crib is necessary to reject the exact model.
 *
 * Run: node sims/lp2_p50_leadingdigit_dodge_256clock_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const pages = corpus.pages.filter((p) => p.page <= 55);
const ciphertext = pages.flatMap((p) => p.indices);
const tokens = grid.pages.flatMap((p) => p.tokens);
const digits = grid.pages.flatMap((p) => p.bytes.map((b) => Math.floor(b / 60)));
assert.equal(ciphertext.length, 12956);
assert.equal(tokens.length, 256);
assert.equal(digits.length, 256);
for (let i = 0; i < digits.length; i++) {
  assert.equal(digits[i], Number(tokens[i][0]));
}
assert.deepEqual([0,1,2,3,4].map((d) => digits.filter((x) => x === d).length),
  [60,58,65,56,17]);

const chapterStarts = [0,3,8,15,23,27,33,40,54];
const chapters = chapterStarts.map((p, idx) =>
  pages.filter((page) => page.page >= p &&
    page.page < (chapterStarts[idx + 1] ?? 56))
    .reduce((sum, page) => sum + page.indices.length, 0));
assert.deepEqual(chapters, [729,1145,1729,1903,1021,1433,1680,3008,308]);
const one = [ciphertext.length];

/**
 * @param {number[]} cipher GP29 runes
 * @param {number} start An arbitrary p50 table cell, 0..255
 * @param {number[]} segments Exact clock-reset segment lengths
 * @returns {{pass: boolean, prefix: number, maxStates: number, finalStates: number}}
 */
function scan(cipher, start, segments) {
  let pos = 0, maxStates = 0;
  for (const length of segments) {
    let states = new Set([0]);
    for (let local = 1; local < length; local++) {
      const i = pos + local;
      const delta = (cipher[i] - cipher[i - 1] + 29) % 29;
      const next = new Set();
      for (const skips of states) {
        if (delta !== 0) next.add(skips);
        const digit = digits[(start + local + skips + 1) % 256];
        if (delta === digit) next.add(skips + 1);
      }
      states = next;
      if (states.size > maxStates) maxStates = states.size;
      if (!states.size) return {pass:false, prefix:i, maxStates, finalStates:0};
    }
    pos += length;
  }
  assert.equal(pos,cipher.length);
  return {pass:true,prefix:pos,maxStates,finalStates:1};
}

/**
 * Genuine forward encryption with both the source 256-cell high-digit tape
 * and the repeated-output clock dodge. Keeps the realized plaintext, shifts
 * and clock path for exact reverse verification.
 * @param {number[]} plain
 * @param {number} start
 * @param {number[]} segments
 */
function encrypt(plain, start, segments) {
  const out = [], phases = [], shifted = [];
  let pos = 0;
  for (const length of segments) {
    let clock = 0, previous = -1, key = 0;
    for (let local = 0; local < length; local++) {
      const p = plain[pos + local];
      let c = (p + key) % 29;
      if (previous === c) {
        clock++;
        key = (key + digits[(start + clock) % 256]) % 29;
        c = (p + key) % 29;
      }
      out.push(c);
      phases.push(clock);
      shifted.push(key);
      previous = c;
      clock++;
      key = (key + digits[(start + clock) % 256]) % 29;
    }
    pos += length;
  }
  assert.equal(pos, plain.length);
  for (let i = 0; i < plain.length; i++) {
    assert.equal((out[i] - shifted[i] + 29) % 29,plain[i]);
  }
  return {out,phases,shifted};
}

const repeatPositions = [];
for (let i = 1; i < ciphertext.length; i++) {
  if (ciphertext[i] === ciphertext[i - 1]) repeatPositions.push(i);
}
assert.equal(repeatPositions.length, 86);
assert.equal(repeatPositions[0], 122);
assert.equal(repeatPositions.at(-1), 12939);

// Native-GP text is a positive, even though its exact prose is immaterial
// to a feasibility test. Use the preserved authenticated solved pages.
const solved = corpus.pages.filter((p) => p.page >= 56 && p.page <= 57)
  .flatMap((p) => p.indices);
assert.equal(solved.length, 180);
const planted = Array.from({length:ciphertext.length},
  (_,i) => solved[i % solved.length]);
for (const layout of [one,chapters]) {
  for (const start of [0,17,71,255]) {
    const control = encrypt(planted,start,layout);
    const test = scan(control.out,start,layout);
    assert.equal(test.pass,true,
      "a genuinely emitted source-driven dodge stream must be accepted");
    console.log("POSITIVE",JSON.stringify({
      startsAt:start,segments:layout.length,
      n:control.out.length,repeats:control.out.filter((x,i) =>
        i>0 && x===control.out[i-1]).length,
      accepted:test.pass,realizedClockSkips:
        control.phases.reduce((s,k,i)=>s+(i>0&&k>control.phases[i-1]+1?1:0),0),
    }));
  }
}

const reports = [];
for (const layout of [one,chapters]) {
  const rows = [];
  for (let start=0;start<256;start++) {
    rows.push({start,...scan(ciphertext,start,layout)});
  }
  assert.equal(rows.filter((x)=>x.pass).length,0,
    "unexpected original path survives; inspect before promoting an exclusion");
  reports.push({
    mode:layout.length===1?"book-continuous":"nine-physical-chapter-resets",
    tableStartsTested:rows.length,
    completeCompatiblePaths:rows.filter((x)=>x.pass).length,
    earliestFailure:Math.min(...rows.map((x)=>x.prefix)),
    latestFailure:Math.max(...rows.map((x)=>x.prefix)),
    furthestStarts:rows.sort((a,b)=>b.prefix-a.prefix).slice(0,6),
  });
}
console.log("ORIGINAL",JSON.stringify({
  totalUnknownRunes:ciphertext.length,
  duplicateRumes:repeatPositions.length,
  digitCounts:[0,1,2,3,4].map(x=>digits.filter(y=>y===x).length),
  reports,
},null,2));
console.log("DECISION: Exactly this cumulative GP29 source-high-digit, one-step repeat-dodge model has no possible original-cipher clock path for any of 256 initial phases, even with unrestricted plaintext. This says nothing about unrelated table byte consumers, word-varying disks, F bypass, or two-step/nonlinear encoders.");
