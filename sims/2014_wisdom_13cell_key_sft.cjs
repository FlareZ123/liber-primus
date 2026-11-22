#!/usr/bin/env node
"use strict";

// Source-constrained test of the 13 word-cell GP-prime sums from the
// 2013/2014 Wisdom square as a GP29 Vigenere key.
// Run: node sims/2014_wisdom_13cell_key_sft.cjs

const assert = require("node:assert/strict");
const fs = require("node:fs");
const read = path => fs.readFileSync(path, "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const alpha = corpus.translit;
const pages = corpus.pages.filter(page => page.page < 56);
const C = pages.flatMap(page => page.indices);
assert.equal(C.length, 12956);

const pageStart = new Map();
let offset = 0;
for (const page of pages) {
  pageStart.set(page.page, offset);
  offset += page.indices.length;
}
const annotations = new Map(ink.pages.map(page => [page.page, page]));
const marks = [];
for (const page of pages) {
  for (const mark of annotations.get(page.page)?.large_punctuation || []) {
    if (mark[1] === 13) marks.push({
      global: pageStart.get(page.page) + mark[0],
      ink: mark[2],
    });
  }
}
marks.sort((a, b) => a.global - b.global ||
  (a.ink === "black" ? -1 : b.ink === "black" ? 1 : 0));
assert.equal(marks.length, 28);
assert.equal(marks.filter(mark => mark.ink === "red").length, 27);
assert.equal(marks.filter(mark => mark.ink === "black").length, 1);
assert.equal(marks[marks.length - 1].global, C.length);
const bounds = [0, ...marks.map(mark => mark.global)];
const fragments = bounds.slice(0, -1).map((start, i) => ({
  start, end: bounds[i + 1], length: bounds[i + 1] - start,
}));
assert.equal(fragments.length, 28);
assert.deepEqual(fragments.flatMap((f, i) => f.length === 0 ? [i + 1] : []), [9, 12]);

const sums = [341,366,199,130,320,245,91,226,320,130,199,366,341];
const mod = x => ((x % 29) + 29) % 29;
function phi(n) {
  let x = n, result = n;
  for (let p = 2; p * p <= x; p++) {
    if (x % p === 0) {
      while (x % p === 0) x /= p;
      result -= result / p;
    }
  }
  if (x > 1) result -= result / x;
  return result;
}
const keys = [
  {name:"raw-word-cell-sums-mod29", key:sums.map(mod)},
  {name:"phi-word-cell-sums-mod29", key:sums.map(n => mod(phi(n)))},
];
assert.deepEqual(keys[0].key, [22,18,25,14,1,13,4,23,1,14,25,18,22]);
assert.deepEqual(keys[1].key, [10,4,24,19,12,23,14,25,12,19,24,4,10]);

function tokenize(source) {
  const text = source.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/K/g,"C").replace(/Z/g,"S");
  const map = new Map(alpha.map((token, i) => [token, i]));
  const multi = alpha.filter(token => token.length > 1).sort((a,b) => b.length-a.length);
  const out = [];
  for (let i = 0; i < text.length;) {
    const ch = text[i];
    if (ch >= "A" && ch <= "Z") {
      const token = multi.find(t => text.startsWith(t, i));
      if (token) { out.push(map.get(token)); i += token.length; }
      else if (map.has(ch)) { out.push(map.get(ch)); i++; }
      else i++;
    } else i++;
  }
  return out;
}
function train(symbols) {
  const tri = new Float64Array(29 ** 3), bi = new Float64Array(29 ** 2);
  for (let i = 0; i + 2 < symbols.length; i++) {
    tri[symbols[i] * 841 + symbols[i+1] * 29 + symbols[i+2]]++;
    bi[symbols[i] * 29 + symbols[i+1]]++;
  }
  return sequence => {
    let total = 0;
    for (let i = 0; i + 2 < sequence.length; i++) {
      const a = sequence[i], b = sequence[i+1], c = sequence[i+2];
      total += Math.log((tri[a*841+b*29+c] + 0.1) / (bi[a*29+b] + 2.9));
    }
    return total / (sequence.length - 2);
  };
}
function transform(input, key, reset, sign) {
  const output = new Array(input.length);
  for (const fragment of fragments) {
    for (let i = fragment.start; i < fragment.end; i++) {
      const phase = reset ? i - fragment.start : i;
      output[i] = mod(input[i] + sign * key[phase % key.length]);
    }
  }
  return output;
}
function ioc(sequence) {
  const counts = new Uint32Array(29);
  for (const x of sequence) counts[x]++;
  let pairs = 0;
  for (const n of counts) pairs += n * (n - 1);
  return pairs / (sequence.length * (sequence.length - 1));
}

const control = tokenize(read("resources/control/shakespeare_first300k.txt"));
assert.equal(control.length, 218800);
const score = train(control);
const variants = [];
for (const item of keys) {
  for (const reset of [true, false]) {
    for (const sign of [-1, 1]) {
      const P = transform(C, item.key, reset, sign);
      assert.deepEqual(transform(P, item.key, reset, -sign), C);
      variants.push({
        key: item.name,
        clock: reset ? "13-dot-reset" : "continuous",
        operation: sign === -1 ? "subtract" : "add",
        score: score(P),
        ioc: ioc(P),
        preview: P.slice(0, 80).map(x => alpha[x]).join(" "),
        exactReencrypt: true,
      });
    }
  }
}
variants.sort((a,b) => b.score-a.score);
console.log(JSON.stringify({
  unknownRunes: C.length,
  thirteenDotMarks: marks.length,
  redMarks: 27,
  blackMarks: 1,
  fragments: fragments.length,
  emptyFragmentsOneBased: [9,12],
  wordCellSums: sums,
  keys: keys.map(item => ({name:item.name, key:item.key})),
  rawScore: score(C),
  nativeShakespeareScore: score(control),
  variants,
}, null, 2));
