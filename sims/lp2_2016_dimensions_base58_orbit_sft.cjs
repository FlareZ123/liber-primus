"use strict";

/**
 * 2016 563x569 image-dimension book-address walk, exact original-source test.
 * This is a conditional navigation hypothesis, not recovered LP2 plaintext.
 * Node.js 20+, CommonJS, no packages and no file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createDecipheriv} = require("node:crypto");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const table = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const chunks = read("resources/lp2-transcription.txt").split("%");
const prime = new Map(corpus.runes.map((ch,i) => [ch,corpus.prime[i]]));
assert.equal(chunks.length,57);
const gridTokens = table.pages.find(p => p.page===50).tokens;
assert.equal(gridTokens.length,104);
assert.deepEqual(table.pages.filter(p => [49,50,51].includes(p.page))
  .map(p => p.tokens.length),[80,104,72]);
assert.equal(grid.byte_rows[10][0],142);

/** @param {string} source @returns {string[]} */
function printedWords(source) {
  const words = [];
  let word = "";
  for (const ch of source) {
    if (prime.has(ch)) word += ch;
    else if (ch==="/" || /\s/u.test(ch)) continue;
    else if (word) { words.push(word); word=""; }
  }
  if (word) words.push(word);
  return words;
}
const words = Array.from({length:58},(_,p) => p===50 ? gridTokens
  : printedWords(chunks[p>=51?p-1:p]));
const wordSum = word => [...word].reduce((v,ch) => v + prime.get(ch),0);
assert.equal(wordSum(words[0][5]),563);
assert(words[0][5].startsWith("ᚾᛖᚹᛒᚪᛋ"));
assert.equal(wordSum(words[1][32]),569);
const row = corpus.pages.find(p => p.page===32).indices.slice(0,11);
const col = Array.from({length:11},(_,i) =>
  corpus.pages.find(p => p.page===32).indices[i*11]);
assert.equal(row.reduce((n,i)=>n+corpus.prime[i],0),563);
assert.equal(col.reduce((n,i)=>n+corpus.prime[i],0),569);
const originalSums = words.map((ws,p) => p===50 ? [] : ws.map(wordSum));

/**
 * @param {number} first
 * @param {number[][]} sums
 * @returns {{reason:string,path:number[],terminal:number,period?:number,enteredAt?:number}}
 */
function walk(first,sums) {
  let n=first;
  const seen = new Map(), route = [];
  for (let k=0;k<150;k++) {
    const p=n%58,idx=Math.floor(n/58);
    if (idx>=words[p].length) return {reason:"invalid",path:route,terminal:n};
    if (p===50) return {reason:"table",path:route,terminal:n};
    if (p>=56) return {reason:"solved",path:route,terminal:n};
    if (seen.has(n)) return {reason:"cycle",path:route,terminal:n,
      period:route.length-seen.get(n),enteredAt:seen.get(n)};
    seen.set(n,route.length);
    route.push(n);
    n=sums[p][idx];
  }
  throw new Error("Unexpected walk >150 steps");
}
const width = walk(563,originalSums),height = walk(569,originalSums);
assert.deepEqual(width.path,[
  563,180,267,66,250,157,276,245,427,211,258,285,227,111,
  117,604,226,495,162,225,255,522,83,17,78,101,264,191,
  362,307,384,320,290]);
assert.equal(width.terminal,563);
assert.equal(width.period,33);
assert.equal(width.enteredAt,0);
assert.deepEqual(height.path,[569,374]);
assert.equal(height.reason,"table");
assert.equal(height.terminal,50);
assert.equal(words[50][0],"2M");

const short2012=walk(503,originalSums),long2012=walk(509,originalSums);
assert.equal(short2012.reason,"cycle");
assert.equal(short2012.period,4);
assert.equal(long2012.reason,"table");
assert.equal(long2012.terminal,166);
console.log("2016 width563: 33-word original cycle through p0:w5.");
console.log("2016 height569: 569 -> 374 -> p50:w0, token 2M;",
  "global grid cell80 (zero-based), row10 column0, byte142.");
console.log("2012 controls: 503 enters 4-cycle; 509 reaches p50:w2 in 5 hops.");
console.log("Full 563 cycle GP prime sums:",width.path.join(","));

// One predeclared table consumer: 32 non-starting cycle values as a
// 32-byte key modulo256, decrypt the original 256-byte table with AES256-ECB.
// This source-motivated consumer is exploratory and not historically instructed.
const key=Buffer.from(width.path.slice(1).map(n => n%256));
const bytes=Buffer.from(grid.byte_rows.flat());
assert.equal(key.length,32);
assert.equal(bytes.length,256);
assert.equal(key.toString("hex"),
  "b40b42fa9d14f5abd3021de36f755ce2efa2e1ff0a53114e6508bf6a33804022");
const decrypt=createDecipheriv("aes-256-ecb",key,null);
decrypt.setAutoPadding(false);
const decoded=Buffer.concat([decrypt.update(bytes),decrypt.final()]);
assert.equal(decoded.subarray(0,16).toString("hex"),
  "ec728a5f0ef6c14bbabdc4abf60f0fa4");
const printable=decoded.reduce((n,v)=>n+(v>=32&&v<=126),0);
assert.equal(printable,93);
console.log("32-cycle-value AES256-ECB key:",key.toString("hex"));
console.log("AES256-ECB table plaintext prefix:",decoded.subarray(0,24).toString("hex"));
console.log("AES256-ECB printable bytes:",printable,"/256 (not recognizable plaintext)");


/**
 * One historical 2014 "let the text guide you" source-key transfer:
 * concatenate the 33 original orbit words, starting with the 563-selected
 * word. Use those exact GP tokens as the period-147 Vigenere subtraction key
 * with an independently reset key phase at each candidate target-page start.
 * This complete inverse does not fit any original ciphertext parameter.
 */
const orbitRuneKey=[...width.path.map(n=>words[n%58][Math.floor(n/58)]).join("")]
  .map(ch=>corpus.runes.indexOf(ch));
assert.equal(orbitRuneKey.length,147);
/** @param {number[]} arr @returns {number} */
function ioc(arr) {
  const counts=Array(29).fill(0);
  for(const v of arr)counts[v]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(arr.length*(arr.length-1));
}
for(const [page,expected] of [[32,0.03732782369146005],
                             [53,0.03621869311405436],
                             [55,0.03333333333333333]]) {
  const cipher=corpus.pages.find(p=>p.page===page).indices;
  const plain=cipher.map((v,i)=>(v-orbitRuneKey[i%147]+29)%29);
  assert.equal(ioc(plain),expected);
  assert(plain.every((v,i)=>(v+orbitRuneKey[i%147])%29===cipher[i]));
  console.log("Source-key 2014-Vigenere transfer, original p"+page,
    "count:",cipher.length,"decoded IoC:",ioc(plain).toFixed(12));
}

// Matched original-layout null: each page retains its GP-prime inventory,
// printed word lengths, and physical page position. Shuffle rune weights only
// within each of the 55 unknown rune-bearing physical pages. The signed 2016
// dimensions remain independent, unchanged 563 and 569.
const sourcePages=words.map((ws,p)=>p===50 ? null : ({
  lengths: ws.map(w=>[...w].length),
  values: ws.join("").split("").map(ch=>prime.get(ch))
}));
let state=0x33015635;
/** @returns {number} */
function random() {
  state ^= state<<13; state ^= state>>>17; state ^= state<<5;
  return state>>>0;
}
/** @param {number[]} values @param {number[]} lengths @returns {number[]} */
function reSum(values,lengths) {
  const sums=[];
  let j=0;
  for (const len of lengths) {
    let s=0;
    for (let i=0;i<len;i++)s+=values[j++];
    sums.push(s);
  }
  assert.equal(j,values.length);
  return sums;
}
const B=10000;
let anyCycle=0,exact33=0,heightFirst=0,heightAny=0,joint=0;
for(let k=0;k<B;k++) {
  const sums=originalSums.slice();
  for(let p=0;p<56;p++) {
    if(p===50)continue;
    const list=sourcePages[p];
    const v=list.values.slice();
    for(let j=v.length-1;j>0;j--){
      const at=random()%(j+1);
      [v[j],v[at]]=[v[at],v[j]];
    }
    sums[p]=reSum(v,list.lengths);
  }
  const a=walk(563,sums),b=walk(569,sums);
  const isExact33=a.reason==="cycle" && a.terminal===563 &&
    a.enteredAt===0 && a.period===33;
  const isFirst=b.reason==="table" && b.path.length===2 && b.terminal===50;
  if(a.reason==="cycle")anyCycle++;
  if(isExact33)exact33++;
  if(isFirst)heightFirst++;
  if(b.reason==="table" && b.path.length===2)heightAny++;
  if(isExact33 && isFirst)joint++;
}
assert.deepEqual([anyCycle,exact33,heightFirst,heightAny,joint],
  [3167,0,24,169,0]);
console.log("Within-page shuffled rune null B=10000, xorshift seed 0x33015635");
console.log({anyCycle,exact33,heightFirst,heightAny,joint});

/**
 * Independent null conditioning more tightly on the original word register:
 * shuffle complete source rune words ONLY among same-length word slots
 * within each physical page. This preserves every page's entire word-sum
 * inventory, source GP-rune spelling and printed slot lengths.
 * All event selectors are still retrospectively recognized.
 */
const equalLengthSlots = sourcePages.map((page,p) => {
  if (p===50 || p>=56) return [];
  const groups = new Map();
  for (let i=0;i<page.lengths.length;i++) {
    const size=page.lengths[i];
    if (!groups.has(size)) groups.set(size,[]);
    groups.get(size).push(i);
  }
  return [...groups.values()].filter(group=>group.length>1);
});
let wordState=0x33a0d01e;
/** @returns {number} */
function wordRandom() {
  wordState^=wordState<<13;wordState^=wordState>>>17;
  wordState^=wordState<<5;
  return wordState>>>0;
}
const W=20000;
let wordCycle=0,wordHeight=0,wordJoint=0,wordAnyCycle=0;
for(let k=0;k<W;k++) {
  const sums=originalSums.map(row=>row.slice());
  for(let p=0;p<56;p++) {
    if(p===50) continue;
    for(const group of equalLengthSlots[p]) {
      const values=group.map(j=>sums[p][j]);
      for(let j=values.length-1;j>0;j--) {
        const at=wordRandom()%(j+1);
        [values[j],values[at]]=[values[at],values[j]];
      }
      for(let j=0;j<group.length;j++) sums[p][group[j]]=values[j];
    }
  }
  const a=walk(563,sums),b=walk(569,sums);
  const ac=a.reason==="cycle" && a.terminal===563 &&
    a.period===33 && a.enteredAt===0;
  const bc=b.reason==="table" && b.path.length===2 && b.terminal===50;
  if(a.reason==="cycle")wordAnyCycle++;
  if(ac)wordCycle++;
  if(bc)wordHeight++;
  if(ac&&bc)wordJoint++;
}
assert.deepEqual([wordCycle,wordHeight,wordJoint,wordAnyCycle],
  [1,577,0,8485]);
console.log("20,000 page-and-word-length-preserving whole-word shuffles",
  {wordCycle,wordHeight,wordJoint,wordAnyCycle});

console.log("Caveat: cycle length, two-hop landing and AES consumer were",
  "recognized after source inspection. No calibrated discovery p-value,",
  "authenticated key, unknown plaintext or onion destination.");
