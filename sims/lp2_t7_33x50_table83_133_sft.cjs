#!/usr/bin/env node
"use strict";

/*
 * Retained, postselected 50x33 table-83..132 negative test (not a doublet-free void).
 *
 * Source inputs:
 *   resources/liber-primus/lp2-corpus.json
 *   resources/liber-primus/base60-grid.json
 *
 * The test is deliberately narrow. It:
 *   1. extracts original LP2 runes 2739..4388 inclusive;
 *   2. treats them as a 50x33 row-major block;
 *   3. uses table cells 83..132 (50 bytes) as row keys, or
 *      cells 83..115 (33 bytes) as column keys;
 *   4. tests base-60 and conditional base-59 interpretations,
 *      both additive signs, and key reversal;
 *   5. reports native GP29 IoC plus a 1000-draw matched random
 *      best-of-16 control.
 *
 * This is an intermediate falsification, not a claimed cipher.
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/base60-grid.json"), "utf8"
));

const N = 12956;
const START = 2739;
const END = 4389; // half-open; inclusive endpoint is 4388
const ROWS = 50;
const COLS = 33;
if (END - START !== ROWS * COLS) throw new Error("window size mismatch");

const stream = corpus.pages
  .slice(0, 56)
  .flatMap(p => p.indices);
if (stream.length !== N) throw new Error("canonical LP2 length mismatch");

const voidStream = stream.slice(START, END);
const repeats = [];
for (let i = 1; i < voidStream.length; i++) {
  if (voidStream[i] === voidStream[i - 1]) repeats.push(START + i);
}
if (repeats.join(',') !== '2740,3140,3852') {
  throw new Error('original interval repeat inventory mismatch');
}


function ioc(a) {
  const counts = new Array(29).fill(0);
  for (const x of a) counts[x]++;
  let num = 0;
  for (const n of counts) num += n * (n - 1);
  return num / (a.length * (a.length - 1));
}

const alpha60 = grid.alphabet;
const alpha59 = alpha60.replace("f", "");

function decodeToken(token, alphabet) {
  let n = 0;
  for (const ch of token) {
    const d = alphabet.indexOf(ch);
    if (d < 0) throw new Error(`invalid token ${token} for alphabet`);
    n = n * alphabet.length + d;
  }
  return n;
}

const tokens = grid.rows.flat();
const bytes60 = grid.byte_rows.flat();
const bytes59 = tokens.map(t => decodeToken(t, alpha59));

function apply(key, axis, reversed, sign) {
  const k = reversed ? [...key].reverse() : key;
  const out = new Array(voidStream.length);

  if (axis === "row") {
    const rowKey = k.slice(83, 133);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c;
        out[i] = ((voidStream[i] + sign * (rowKey[r] % 29)) % 29 + 29) % 29;
      }
    }
  } else {
    const colKey = k.slice(83, 116);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c;
        out[i] = ((voidStream[i] + sign * (colKey[c] % 29)) % 29 + 29) % 29;
      }
    }
  }
  return out;
}

const tested = [];
for (const [codec, key] of [["base60", bytes60], ["base59", bytes59]]) {
  for (const axis of ["row", "col"]) {
    for (const reversed of [false, true]) {
      for (const sign of [1, -1]) {
        const out = apply(key, axis, reversed, sign);
        tested.push({
          codec, axis, reversed, sign,
          ioc: ioc(out)
        });
      }
    }
  }
}
tested.sort((a, b) => b.ioc - a.ioc);

// Fixed null seed and a complete 256-byte key; the earlier 50-byte null
// was sliced at offset 83 and therefore never supplied valid keys.
let rngState = 0x3301;
function uniform() {
  rngState = (Math.imul(rngState, 1664525) + 1013904223) >>> 0;
  return rngState / 4294967296;
}

function randomBest() {
  const key = Array.from({length: 256}, () => Math.floor(uniform() * 256));
  let best = -Infinity;
  for (const axis of ["row", "col"]) {
    for (const reversed of [false, true]) {
      for (const sign of [1, -1]) {
        best = Math.max(best, ioc(apply(key, axis, reversed, sign)));
      }
    }
  }
  return best;
}

const random = [];
for (let i = 0; i < 1000; i++) random.push(randomBest());
random.sort((a, b) => a - b);
const target = tested[0].ioc;
const ge = random.filter(x => x >= target).length;

console.log(JSON.stringify({
  interval: { start: START, endInclusive: END - 1, length: END - START, internalAdjacentEquals: repeats },
  shape: { rows: ROWS, cols: COLS },
  endpoints: { start: START / COLS, end: END / COLS },
  raw_ioc: ioc(voidStream),
  best_original: tested[0],
  all_original: tested,
  random_control: {
    draws: random.length,
    p50: random[499],
    p90: random[899],
    p95: random[949],
    p99: random[989],
    max: random[999],
    ge,
    empirical_p: (ge + 1) / (random.length + 1)
  }
}, null, 2));
