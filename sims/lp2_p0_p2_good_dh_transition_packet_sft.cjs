"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const M = 29;
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const raw = fs.readFileSync(path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

/** @param {number} x @returns {number} */
function mod(x) { return ((x % M) + M) % M; }

/** @param {number} x @param {number} y @returns {number[]} */
function H(x, y) { return [mod(x - y), mod(x + y)]; }

/** @param {number[]} v @returns {number[]} */
function shell4(v) { return [...H(v[0], v[3]), ...H(v[1], v[2])]; }

/**
 * @param {string} text
 * @param {number} page
 * @returns {{page:number,index:number,start:number,end:number,length:number,values:number[]}[]}
 */
function parsePage(text, page) {
  const words = [];
  const runes = [];
  let current = [];
  let start = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({page,index:words.length,start,end:start+current.length-1,length:current.length,values:current.slice()});
    current = [];
  };
  for (const ch of [...text]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if ((ch === "-" || ch === ".") && current.length) {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {number[]} a @returns {number[][]} */
function permutations(a) {
  if (a.length < 2) return [a.slice()];
  const out = [];
  for (let i = 0; i < a.length; i++) {
    for (const tail of permutations(a.slice(0, i).concat(a.slice(i + 1)))) out.push([a[i], ...tail]);
  }
  return out;
}

const st = {p:23,g:5,a:6,b:15,A:8,B:19,K:2};
const parts = raw.split("%");
const lines28 = parts[28].split("/").map((line) => [...line].map((ch) => runeIndex.get(ch)).filter((v) => v !== undefined)).filter((line) => line.length);
assert.equal(lines28[0][st.B - 1], 22);
assert.equal(lines28[5][st.p - 1], 20);
const hereB = lines28[0][st.B - 1];
const dhp = lines28[5][st.p - 1];

const GOOD = [6,3,3,23];
const C0 = [24,21,26,14];
const K0 = [18,18,23,20];
const C2 = [1,2,8,26];
const K2 = [24,28,5,3];
assert.deepEqual(C0.map((v,i)=>mod(v-K0[i])), GOOD);
assert.deepEqual(C2.map((v,i)=>mod(v-K2[i])), GOOD);

const T1 = [st.a, mod(st.K*st.g), mod(st.B-st.A), mod(st.K*st.a)];
assert.deepEqual(T1, [6,10,11,12]);
assert.deepEqual(C2.map((v,i)=>mod(v-C0[i])), T1);
assert.deepEqual(K2.map((v,i)=>mod(v-K0[i])), T1);
assert.deepEqual(shell4(T1), [st.p,mod(st.A-st.B),mod(st.g-st.a),mod(st.p-st.K)]);

const words = [];
for (let i = 0; i < 55; i++) {
  const page = i <= 49 ? i : i + 1;
  words.push(...parsePage(parts[i], page));
}
const fours = words.filter((w) => w.length === 4);
assert.equal(fours.length, 514);
const map4 = new Map();
for (const w of fours) {
  const key = w.values.join(",");
  if (!map4.has(key)) map4.set(key, []);
  map4.get(key).push(w);
}
const pairHits = [];
for (const from of fours) {
  const predicted = from.values.map((v,i)=>mod(v+T1[i]));
  for (const to of map4.get(predicted.join(",")) || []) pairHits.push({from,to});
}
assert.equal(pairHits.length, 1);
assert.deepEqual([pairHits[0].from.page,pairHits[0].from.start,pairHits[0].to.page,pairHits[0].to.start],[0,49,2,36]);

const family = new Map();
for (const p of permutations(T1)) {
  for (let mask=0; mask<16; mask++) {
    const delta = p.map((v,i)=>mod((mask>>i)&1 ? -v : v));
    family.set(delta.join(","), delta);
  }
}
assert.equal(family.size, 384);
const hist = new Map();
const selectedFamily = [];
for (const delta of family.values()) {
  let hits = 0;
  let selected = false;
  for (const from of fours) {
    const predicted = from.values.map((v,i)=>mod(v+delta[i]));
    for (const to of map4.get(predicted.join(",")) || []) {
      hits++;
      if (from.page===0 && from.start===49 && to.page===2 && to.start===36) selected = true;
    }
  }
  hist.set(hits, (hist.get(hits) || 0) + 1);
  if (selected) selectedFamily.push({delta,hits});
}
assert.deepEqual(Object.fromEntries([...hist].sort((a,b)=>a[0]-b[0])), {"0":248,"1":118,"2":18});
assert.deepEqual(selectedFamily, [{delta:[6,10,11,12],hits:1}]);

const KFoundDrop = [12,28,1,8];
const T0 = [st.a,st.B,hereB,mod(st.K*st.a)];
assert.deepEqual(T0,[6,19,22,12]);
assert.deepEqual(KFoundDrop.map((v,i)=>mod(v+T0[i])), K0);
const middleStep = [0,dhp,mod(st.A-st.B),0];
assert.deepEqual(middleStep,[0,20,18,0]);
assert.deepEqual(T0.map((v,i)=>mod(v+middleStep[i])), T1);
assert.deepEqual(K0.map((v,i)=>mod(v+T1[i])), K2);
assert.equal(T0.reduce((a,b)=>a+b,0),59);
assert.equal(T1.reduce((a,b)=>a+b,0),39);

const T2 = T1.map((v,i)=>mod(v+middleStep[i]));
const K4 = K2.map((v,i)=>mod(v+T2[i]));
const C4 = GOOD.map((v,i)=>mod(v+K4[i]));
assert.deepEqual(T2,[6,1,0,12]);
assert.deepEqual(K4,[1,0,5,15]);
assert.deepEqual(C4,[7,3,8,9]);
const p4 = fours.filter((w)=>w.page===4);
assert.equal(p4.length,13);
assert.equal(p4.filter((w)=>w.values.join(",")===C4.join(",")).length,0);
assert.equal(fours.filter((w)=>w.values.join(",")===C4.join(",")).length,0);

const otherP0 = [
  ["LUCK",[8,17,9,27]],
  ["PATHS",[23,14,21,7]]
];
const p2Map = new Set(fours.filter((w)=>w.page===2).map((w)=>w.values.join(",")));
for (const [,cipher] of otherP0) {
  const predicted = cipher.map((v,i)=>mod(v+T1[i]));
  assert.equal(p2Map.has(predicted.join(",")), false);
}

console.log(JSON.stringify({
  T0,T1,middleStep,T2,
  keys:{droppedFound:KFoundDrop,p0Good:K0,p2Good:K2,p4Predicted:K4},
  pairHits:pairHits.length,
  family:{size:family.size,hist:Object.fromEntries([...hist].sort((a,b)=>a[0]-b[0])),selected:selectedFamily},
  p4:{predictedCipher:C4,completeFourRuneWords:p4.length,hits:0},
  holdoutAllManuscriptHits:fours.filter((w)=>w.values.join(",")===C4.join(",")).length
},null,2));
