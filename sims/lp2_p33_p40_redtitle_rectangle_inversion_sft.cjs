"use strict";
/**
 * Original-source distinct red-title 10/8 columnar key gate.
 *
 * p33..39: 1680 GP29 glyphs, 10 distinct red heading glyphs, 1670 = 10*167
 * p40..53: 3008 GP29 glyphs, 8 distinct red heading glyphs, 3000 = 8*375
 *
 * Original anti-repeat property would survive the *correct* final-layer
 * inverse if the underlying plaintext to that final layer was a low-doublet
 * GP29 stream. Test both source-natural ascending and descending column orders.
 *
 * Run from repo root: node sims/lp2_p33_p40_redtitle_rectangle_inversion_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const json = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const book = json("resources/liber-primus/lp2-corpus.json");
const ink = json("resources/liber-primus/lp2-ink-annotations.json");
/** @param {number} first @param {number} last @returns {number[]} */
function chapter(first, last) {
  return book.pages.filter(p => p.page >= first && p.page <= last)
    .flatMap(p => p.indices);
}
/** @param {number[]} a @returns {number} */
function doubles(a) {
  return a.slice(1).reduce((n, x, i) => n + Number(x === a[i]), 0);
}
/**
 * @param {number[]} key
 * @param {boolean} descending
 * @returns {number[]}
 */
function order(key, descending) {
  const indexes = key.map((x, i) => ({x, i}));
  indexes.sort((a, b) => descending ? b.x - a.x : a.x - b.x);
  return indexes.map(x => x.i);
}
/**
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {boolean} descending
 * @returns {number[]}
 */
function inverse(ciphertext, key, descending) {
  const n = key.length, height = ciphertext.length / n;
  assert(Number.isInteger(height));
  const cols = Array(n); let offset = 0;
  for (const j of order(key, descending)) {
    cols[j] = ciphertext.slice(offset, offset + height);
    offset += height;
  }
  assert.equal(offset, ciphertext.length);
  return ciphertext.map((_, i) => cols[i % n][Math.floor(i / n)]);
}
/**
 * @param {number[]} plaintext
 * @param {number[]} key
 * @param {boolean} descending
 * @returns {number[]}
 */
function forward(plaintext, key, descending) {
  const n = key.length, height = plaintext.length / n;
  assert(Number.isInteger(height));
  return order(key, descending).flatMap(j =>
    Array.from({length:height}, (_, i) => plaintext[i*n+j]));
}
/** @param {number} length @returns {number[]} */
function plantedAntiRepeat(length) {
  const out = [7];
  for (let i = 1; i < length; i++)
    out.push((out[i-1] + 1 + (i * 7) % 28) % 29);
  return out;
}
const scenarios = [
  {first:33, last:39, keyLength:10, pageRunes:1680, bodyRunes:1670,
   rawDoubles:12, forwardOrderDoubles:69, reverseOrderDoubles:61,
   key:[23,12,14,5,0,10,24,7,8,6]},
  {first:40, last:53, keyLength:8, pageRunes:3008, bodyRunes:3000,
   rawDoubles:18, forwardOrderDoubles:101, reverseOrderDoubles:105,
   key:[0,9,19,26,6,23,25,8]}
];
const result=[];
for (const s of scenarios) {
  const source = chapter(s.first, s.last);
  assert.equal(source.length, s.pageRunes);
  const key = source.slice(0, s.keyLength);
  assert.deepEqual(key, s.key);
  assert.equal(new Set(key).size, s.keyLength,
    "original red heading consists of distinct symbol identities");
  const redSource = ink.pages.find(p => p.page === s.first).red_spans
    .find(span => span.start === 0 && span.length === s.keyLength);
  assert(redSource, "ink inventory must independently locate heading");
  assert.equal([...redSource.runes].length, s.keyLength);
  const symbols = new Map(book.runes.map((r, i) => [r, i]));
  assert.deepEqual([...redSource.runes].map(r => symbols.get(r)), key);
  const body = source.slice(s.keyLength);
  assert.equal(body.length, s.bodyRunes);
  assert.equal(doubles(body), s.rawDoubles);
  const outcome={pages:s.first+"-"+s.last, originalRuneCount:source.length,
    headingLength:key.length, originalHeading:key,
    keyReadOrderAscending:order(key,false),
    keyReadOrderDescending:order(key,true),
    bodyLength:body.length, bodyDoubles:doubles(body),
    baselineUniformDoubles:(body.length-1)/29,
    originalIoC:(()=>{let count=new Array(29).fill(0);for(const x of body)count[x]++;return count.reduce((z,n)=>z+n*(n-1),0)/(body.length*(body.length-1))})()};
  for (const descending of [false,true]) {
    const label=descending?"descending":"ascending";
    const plain=inverse(body,key,descending);
    assert.deepEqual(forward(plain,key,descending), body,
      "every untouched original rune must reencrpyt exactly");
    const expected=descending?s.reverseOrderDoubles:s.forwardOrderDoubles;
    assert.equal(doubles(plain),expected);
    const planted=plantedAntiRepeat(body.length);
    assert.equal(doubles(planted),0);
    const encrypted=forward(planted,key,descending);
    assert.deepEqual(inverse(encrypted,key,descending),planted,
      "a valid final-columnar inverse restores 0-doublet input exactly");
    outcome[label]={restoredDoubles:doubles(plain),
      syntheticFinalLayerRestoresZero:true,
      prefixGP:plain.slice(0,55).map(i=>book.translit[i]).join("")};
  }
  result.push(outcome);
}
console.log(JSON.stringify({classification:"frozen original-source final-transposition gate",
  conclusion:"Both original key-ranked 10/8-column inverse outputs lose the anti-repeat signature and do not recover ordinary GP29 prose; no unknown plaintext/key.",
  source:"LP2 p33-39 and p40-53 original corpus and red-ink annotations",
  scenarios:result},null,2));
