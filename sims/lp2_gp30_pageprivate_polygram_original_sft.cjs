"use strict";
/**
 * Exact original GP30 five-packet word-space resegmentation obstruction.
 * Node.js 22, CommonJS, no packages or network.
 * Run: node sims/lp2_gp30_pageprivate_polygram_original_sft.cjs
 *
 * A single arbitrary SECRET map per full k-token packet and physical page
 * preserves packet equality under any independent page-local phase.
 * Since the 30th symbol is a genuine movable SPACE, this tests value-
 * and word-boundary-changing polygraphic ciphers.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8").replace(/\r\n/g, "\n");
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runes = new Map(gp.runes.map((ch, i) => [ch, i]));
const rawPages = transcription.split("%").slice(0, 55);
assert.equal(rawPages.length, 55);
const pages = [];
let inWord = false, words = 0, carries = 0;
for (let p = 0; p < rawPages.length; p++) {
  const tokens = [];
  for (const ch of rawPages[p]) {
    if (runes.has(ch)) {
      tokens.push(runes.get(ch));
      inWord = true;
    } else if (ch === "/" || /\s/u.test(ch)) {
      // Printed line and physical page wraps do not finish a word.
    } else if (inWord) {
      tokens.push(29);
      words++;
      inWord = false;
    }
  }
  const physicalPage = p < 50 ? p : p + 1;
  assert.deepEqual(tokens.filter(x => x < 29),
    gp.pages.find(q => q.page === physicalPage).indices);
  pages.push({page:physicalPage, tokens});
  if (inWord && p + 1 < rawPages.length) {
    const next = [...rawPages[p + 1]].find(ch =>
      runes.has(ch) || (ch !== "/" && !/\s/u.test(ch)));
    if (runes.has(next)) carries++;
  }
}
if (inWord) {
  pages.at(-1).tokens.push(29);
  words++;
}
const cipher = pages.flatMap(p => p.tokens);
assert.equal(pages.length, 55);
assert.equal(cipher.length, 15852);
assert.equal(words, 2896);
assert.equal(carries, 32);
assert.equal(cipher.filter(x => x === 29).length, words);
assert.deepEqual(cipher.filter(x => x < 29),
  gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices));

const alphabet = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** Authentically calibrated LP1 orthography, also checked against clear p57.
 * @param {string} input @returns {number[]}
 */
function encodeWord(input) {
  const w = input.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < w.length;) {
    if (w.startsWith("ING", i)) {
      out.push(21); i += 3;
    } else if (w.startsWith("IO", i)) {
      out.push(27); i += 2;
    } else {
      const match = alphabet.find(t => w.startsWith(t.s, i));
      assert(match, "unmapped GP native word");
      out.push(match.i);
      i += match.s.length;
    }
  }
  return out;
}
/** @param {string} text @returns {number[]} */
const encodeText = text => (text.toUpperCase().match(/[A-Z]+/g) || [])
  .flatMap(word => [...encodeWord(word), 29]);
const p57 = encodeText(read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split("### 57\n")[1].trim());
assert.equal(p57.length, 115);
assert.deepEqual(p57.filter(x => x < 29), gp.pages[57].indices);

/** Number of unordered identical complete k-packet pairs at one phase.
 * @param {number[]} tokens @param {number} k @param {number} phase
 */
function collisions(tokens, k, phase) {
  const m = new Map();
  for (let i = phase; i + k <= tokens.length; i += k) {
    let code = 0;
    for (let j = 0; j < k; j++) code = code * 30 + tokens[i + j];
    m.set(code, (m.get(code) || 0) + 1);
  }
  let total = 0;
  for (const n of m.values()) total += n * (n - 1) / 2;
  return total;
}
/** Grant ALL independent page-private phases; overrelax each side.
 * @param {{page:number,tokens:number[]}[]} parts @param {number} k
 * @param {"min"|"max"} operation @param {(page:number)=>boolean} include
 */
function bound(parts, k, operation, include) {
  let total = 0;
  for (const p of parts) {
    if (!include(p.page)) continue;
    const row = Array.from({length:k},
      (_,phase) => collisions(p.tokens, k, phase));
    total += operation === "max" ? Math.max(...row) : Math.min(...row);
  }
  return total;
}
const areas = {
  full:p => true,
  trainingP16to21:p => p >= 16 && p <= 21,
  holdoutP40to53:p => p >= 40 && p <= 53
};
const ks = [2,3,4,5,6,7,8];
const observed = Object.fromEntries(ks.map(k =>
  [k,Object.fromEntries(Object.entries(areas).map(([n,select]) =>
    [n,bound(pages,k,"max",select)]))]));
assert.deepEqual(observed, {
  2:{full:1783,trainingP16to21:241,holdoutP40to53:417},
  3:{full:56,trainingP16to21:8,holdoutP40to53:13},
  4:{full:3,trainingP16to21:0,holdoutP40to53:1},
  5:{full:0,trainingP16to21:0,holdoutP40to53:0},
  6:{full:0,trainingP16to21:0,holdoutP40to53:0},
  7:{full:0,trainingP16to21:0,holdoutP40to53:0},
  8:{full:0,trainingP16to21:0,holdoutP40to53:0}
});
/** Lay an equal-length native source window over the original page slots.
 * @param {number[]} tokens
 */
function overlay(tokens) {
  assert.equal(tokens.length, cipher.length);
  let start = 0;
  return pages.map(p => {
    const part = {page:p.page,
      tokens:tokens.slice(start,start+p.tokens.length)};
    start += p.tokens.length;
    return part;
  });
}
let seed = 0x33012026;
/** @returns {number} */
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}
const sourceFiles = [
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"]
];
const controls = {};
for (const [name,filename] of sourceFiles) {
  const donor = encodeText(read(filename));
  assert(donor.length > cipher.length);
  const windowScores = [];
  for (let sample = 0; sample < 128; sample++) {
    const start = Math.floor(random() * (donor.length-cipher.length));
    const native = overlay(donor.slice(start,start+cipher.length));
    windowScores.push(Object.fromEntries(ks.map(k =>
      [k,Object.fromEntries(Object.entries(areas).map(([n,select]) =>
        [n,bound(native,k,"min",select)]))])));
  }
  const scores = Object.fromEntries(ks.map(k => [k,
    Object.fromEntries(Object.keys(areas).map(area => {
      const values = windowScores.map(row => row[k][area])
        .sort((a,b) => a-b);
      return [area,{minimum:values[0],median:values[64],
        maximum:values.at(-1),
        excluded:values.filter(n => n > observed[k][area]).length}];
    }))]));
  for (const k of [2,3,4,5,6]) {
    assert.equal(scores[k].full.excluded,128, name + " full native k" + k);
  }
  for (const k of [2,3,4]) {
    for (const area of ["trainingP16to21","holdoutP40to53"]) {
      assert.equal(scores[k][area].excluded,128,name + " " + area);
    }
  }
  controls[name]={donorTokens:donor.length,windows:128,scores};
}
/** Euclidean modular inverse. @param {number} a @param {number} mod */
function inverse(a,mod) {
  let t=0, nt=1, r=mod, nr=a;
  while(nr!==0) {
    const q=Math.floor(r/nr);
    [t,nt]=[nt,t-q*nt];
    [r,nr]=[nr,r-q*nr];
  }
  assert.equal(r,1);
  return (t%mod+mod)%mod;
}
/**
 * Constructive five-packet private page cipher; 30th symbol SPACE is movable.
 * Multiplication by 7 is bijective mod 30^5. Fringe tokens are untouched.
 * @param {number[]} tokens @param {number} phase
 * @param {number} salt @param {boolean} decrypt
 */
function transform(tokens,phase,salt,decrypt) {
  const k=5, mod=30**5, inv=inverse(7,mod), out=tokens.slice();
  for (let i=phase;i+k<=tokens.length;i+=k) {
    let code=0;
    for(let j=0;j<k;j++)code=code*30+tokens[i+j];
    code=decrypt?(((code-salt+mod)*inv)%mod):
      ((code*7+salt)%mod);
    for(let j=k-1;j>=0;j--) {
      out[i+j]=code%30;
      code=Math.floor(code/30);
    }
  }
  return out;
}
const plant=overlay(encodeText(read(sourceFiles[0][1]))
  .slice(0,cipher.length));
let changedSpacePositions=0;
for(const p of plant) {
  const phase=p.page%5, salt=p.page*131+17;
  const encrypted=transform(p.tokens,phase,salt,false);
  assert.deepEqual(transform(encrypted,phase,salt,true),p.tokens);
  assert.equal(collisions(encrypted,5,phase),
    collisions(p.tokens,5,phase));
  changedSpacePositions+=p.tokens.filter((x,i) =>
    (x===29)!==(encrypted[i]===29)).length;
}
assert(changedSpacePositions>0);
const solvedCipher=transform(p57,2,17,false);
assert.deepEqual(transform(solvedCipher,2,17,true),p57);
assert(p57.some((x,i) => (x===29)!==(solvedCipher[i]===29)));

const output={
  conclusion:"Only a bounded, source-native all-key exclusion; no plaintext, key or creator-selected opcode",
  source:{runes:12956,words,carries,physicalPages:pages.length,
    gp30Tokens:cipher.length,observedMaximum:observed},
  controls,
  syntheticPositive:{nativeTokens:15852,recoveredTokens:15852,
    changedSpacePositions,p57Tokens:p57.length,
    p57Recovered:true},
  sha256:{
    originalTranscription:crypto.createHash("sha256")
      .update(transcription).digest("hex"),
    gpCorpus:crypto.createHash("sha256")
      .update(read("resources/liber-primus/lp2-corpus.json")).digest("hex")
  }
};
console.log(JSON.stringify(output,null,2));
