"use strict";

/**
 * Three-round GP29^2 additive Feistel, original-source all-secret graph gate.
 *
 * Any three-round Feistel on four-rune packets has
 *   X = L + F1(R), A = R + F2(X), B = X + F3(A),
 * hence B-L = F1(R) + F3(A).  With V(A)=-F3(A), each
 * authentic plaintext/ciphertext packet adds a graph equation
 * F1(R)-V(A)=B-L. A weighted bipartite graph has a solution exactly
 * when every cycle's edge weights sum consistently in GF(29)^2.
 * This necessary condition holds for every secret F1,F2,F3, including
 * completely non-linear and noninvertible individual functions.
 *
 * A graph with no contradictions need not admit the middle function F2.
 * All tests use original ciphertext, its source page/section/word
 * boundaries, source-calibrated authentic GP29 donor controls, and
 * full positive Feistel forward/backward replay.
 *
 * SFT: node sims/lp2_gp29_fourblock_three_round_allsecret_graph_sft.cjs
 * Node 22, CommonJS, read-only, no network/dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
}
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = gp.pages.filter(p => p.page <= 55 && p.indices.length);
const original = pages.flatMap(p => p.indices);
const {parseLP2Words} = require("./lp2_word_pages.cjs");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const parsed = parseLP2Words(transcription);
const lengths = parsed.words.map(w => w.length);
assert.equal(pages.length, 55);
assert.equal(original.length, 12956);
assert.equal(lengths.length, 2896);
assert.equal(lengths.reduce((a,b) => a+b,0), original.length);
assert.equal(parsed.crossPageWords, 32);

/** @param {number} a @returns {number} */
function mod(a) { return (a % 29 + 29) % 29; }
/** @param {number} a @param {number} b @returns {number} */
function pair(a,b) { return 29*a+b; }

/**
 * Weighted union-find for x(R)-y(A)=B-L in two independent GF29 axes.
 * The equation's necessary-and-sufficient consistency test applies
 * to F1 and F3 alone, with the middle F2 left entirely arbitrary.
 * @param {number[]} plain
 * @param {number[]} cipher
 * @param {number} phase - 0..3 fixed block offset
 * @returns {{packets:number,cycles:number,contradictions:number}}
 */
function graphGate(plain, cipher, phase) {
  assert.equal(plain.length, cipher.length);
  const n = 2*29*29;
  const parent = Int16Array.from({length:n}, (_,i)=>i);
  const rank = new Int8Array(n);
  const delta0 = new Int8Array(n);
  const delta1 = new Int8Array(n);
  /** @param {number} i @returns {number} */
  function find(i) {
    if (parent[i] === i) return i;
    const prev = parent[i];
    const root = find(prev);
    delta0[i] = mod(delta0[i]+delta0[prev]);
    delta1[i] = mod(delta1[i]+delta1[prev]);
    parent[i] = root;
    return root;
  }
  let packets = 0, cycles = 0, contradictions = 0;
  for(let i=phase; i+3<cipher.length; i+=4) {
    const left = pair(plain[i+2],plain[i+3]);
    const right = 841 + pair(cipher[i],cipher[i+1]);
    const weight0 = mod(cipher[i+2]-plain[i]);
    const weight1 = mod(cipher[i+3]-plain[i+1]);
    const a = find(left), b = find(right);
    const dx0 = delta0[left], dy0 = delta0[right];
    const dx1 = delta1[left], dy1 = delta1[right];
    packets++;
    if(a===b) {
      cycles++;
      if(mod(dx0-dy0)!==weight0 || mod(dx1-dy1)!==weight1) {
        contradictions++;
      }
    } else if(rank[a]>=rank[b]) {
      parent[b]=a;
      delta0[b]=mod(dx0-dy0-weight0);
      delta1[b]=mod(dx1-dy1-weight1);
      if(rank[a]===rank[b]) rank[a]++;
    } else {
      parent[a]=b;
      delta0[a]=mod(weight0-dx0+dy0);
      delta1[a]=mod(weight1-dx1+dy1);
    }
  }
  return {packets,cycles,contradictions};
}

/** @param {number} a @param {number} b @returns {[number,number]} */
function f1(a,b) {return [mod(a*a+3*a*b+b+7),mod(5*a+b*b+1)];}
/** @param {number} a @param {number} b @returns {[number,number]} */
function f2(a,b) {return [mod(a*b+11*a+5),mod(a*a+2*b+19)];}
/** @param {number} a @param {number} b @returns {[number,number]} */
function f3(a,b) {return [mod(3*a*a+b+13),mod(a*b+7*b+17)];}
/** @param {number[]} plain @param {number} phase @returns {number[]} */
function encrypt(plain, phase=0) {
  const out=plain.slice();
  for(let i=phase;i+3<plain.length;i+=4) {
    const u=f1(plain[i+2],plain[i+3]);
    const x0=mod(plain[i]+u[0]), x1=mod(plain[i+1]+u[1]);
    const v=f2(x0,x1);
    const a0=mod(plain[i+2]+v[0]),a1=mod(plain[i+3]+v[1]);
    const w=f3(a0,a1);
    out[i]=a0;out[i+1]=a1;
    out[i+2]=mod(x0+w[0]);out[i+3]=mod(x1+w[1]);
  }
  return out;
}
/** @param {number[]} cipher @param {number} phase @returns {number[]} */
function decrypt(cipher,phase=0) {
  const out=cipher.slice();
  for(let i=phase;i+3<cipher.length;i+=4) {
    const a0=cipher[i],a1=cipher[i+1];
    const w=f3(a0,a1);
    const x0=mod(cipher[i+2]-w[0]),x1=mod(cipher[i+3]-w[1]);
    const v=f2(x0,x1);
    const r0=mod(a0-v[0]),r1=mod(a1-v[1]);
    const u=f1(r0,r1);
    out[i]=mod(x0-u[0]);out[i+1]=mod(x1-u[1]);
    out[i+2]=r0;out[i+3]=r1;
  }
  return out;
}

const sources = [
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"]
];
const pools = sources.map(([,name])=>{
  /** @type {number[][][]} */
  const b=Array.from({length:30},()=>[]);
  for(const word of read(name).match(/[A-Za-z]+/g)||[]) {
    const encoded=encodeSourceNativeGP(word);
    if(encoded.length<b.length)b[encoded.length].push(encoded);
  }
  for(const length of lengths) assert(b[length]?.length,"donor missing "+length);
  return b;
});
let seed=0x33012026;
/** @returns {number} */
function random() {
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return seed>>>0;
}
/** @param {number[][][]} indexed @returns {number[]} */
function sample(indexed) {
  const out=[];
  for(const length of lengths) {
    const pool=indexed[length];
    out.push(...pool[random()%pool.length]);
  }
  assert.equal(out.length,original.length);
  return out;
}

// Source-authentic physical section cuts, shown by '$' in the transcript.
// These cuts are not invented codeword boundaries.
const runes=new Set(gp.runes);
let seen=0;
const cutAt=[0];
for(const character of transcription.split("%").slice(0,55).join("%")) {
  if(runes.has(character)) seen++;
  if(character==="$" && seen>cutAt[cutAt.length-1]) cutAt.push(seen);
}
assert.equal(seen,original.length);
if(cutAt[cutAt.length-1]!==seen) cutAt.push(seen);
assert.equal(cutAt.length,9,"Expected eight source sections");
/** @type {Array<[number,number]>} */
const sections=cutAt.slice(1).map((end,i)=>[cutAt[i],end]);
let physical=0;
/** @type {Array<[number,number]>} */
const pageSpans=pages.map(p=>{
  const v=[physical,physical+p.indices.length];
  physical+=p.indices.length;
  return /** @type {[number,number]} */(v);
});
assert.equal(physical,original.length);

/**
 * Each source region may select its own entirely secret round functions
 * and one best of four independent packet phases.
 * @param {number[]} plain
 * @param {Array<[number,number]>} regions
 * @returns {{contradictions:number,cycles:number,packets:number}}
 */
function bestIndependent(plain,regions) {
  let contradictions=0,cycles=0,packets=0;
  for(const [start,end] of regions) {
    const p=plain.slice(start,end),c=original.slice(start,end);
    const choices=[0,1,2,3].map(k=>graphGate(p,c,k));
    choices.sort((a,b)=>a.contradictions-b.contradictions
      || a.cycles-b.cycles);
    contradictions+=choices[0].contradictions;
    cycles+=choices[0].cycles;
    packets+=choices[0].packets;
  }
  return {contradictions,cycles,packets};
}

const solved57=gp.pages.find(p=>p.page===57).indices;
assert.equal(solved57.length,95);
const solved57cipher=encrypt(solved57);
assert.deepEqual(decrypt(solved57cipher),solved57);
assert.deepEqual(encrypt(decrypt(solved57cipher)),solved57cipher);
assert.equal(graphGate(solved57,solved57cipher,0).contradictions,0);
const result={
  model:"Three-round GP29^2 Feistel additive graph constraint, all-secret F1/F3",
  source:{runes:original.length,words:lengths.length,
    physicalPages:pages.length,sections:sections.length,
    sectionRuneLengths:sections.map(([a,b])=>b-a),
    printedPageCarries:parsed.crossPageWords},
  candidateNativeBooksPerDonor:96,
  seed:"0x33012026",
  graphEquation:"F1(R)+F3(A)=B-L modulo 29 (two components)",
  solvedP57Plant:{runes:95,exactForwardInverse:true,graphConsistent:true},
  donors:{}
};
let firstPlant=false;
for(let d=0;d<sources.length;d++) {
  let globalSurvivors=0, chapterSurvivors=0, pageSurvivors=0;
  let minGlobal=Infinity,minChapter=Infinity,minPage=Infinity;
  let maxGlobal=0,maxChapter=0,maxPage=0;
  let first=null;
  for(let trial=0;trial<96;trial++) {
    const p=sample(pools[d]);
    const g=[0,1,2,3].map(i=>graphGate(p,original,i));
    g.sort((a,b)=>a.contradictions-b.contradictions);
    const ch=bestIndependent(p,sections);
    const pg=bestIndependent(p,pageSpans);
    if(!first)first={global:g[0],chapters:ch,pages:pg};
    if(g[0].contradictions===0)globalSurvivors++;
    if(ch.contradictions===0)chapterSurvivors++;
    if(pg.contradictions===0)pageSurvivors++;
    minGlobal=Math.min(minGlobal,g[0].contradictions);
    minChapter=Math.min(minChapter,ch.contradictions);
    minPage=Math.min(minPage,pg.contradictions);
    maxGlobal=Math.max(maxGlobal,g[0].contradictions);
    maxChapter=Math.max(maxChapter,ch.contradictions);
    maxPage=Math.max(maxPage,pg.contradictions);
    if(!firstPlant) {
      const cipher=encrypt(p);
      assert.deepEqual(decrypt(cipher),p);
      assert.deepEqual(encrypt(decrypt(cipher)),cipher);
      assert.equal(graphGate(p,cipher,0).contradictions,0);
      firstPlant=true;
    }
  }
  result.donors[sources[d][0]]={
    originalGlobal:{survivingBooks:globalSurvivors,minContradictions:minGlobal,
      maxContradictions:maxGlobal},
    originalEightSectionKeys:{survivingBooks:chapterSurvivors,
      minContradictions:minChapter,maxContradictions:maxChapter},
    originalPagePrivateKeys:{survivingBooks:pageSurvivors,
      minContradictions:minPage,maxContradictions:maxPage},
    firstControl:first
  };
}
assert(Object.values(result.donors).every(v=>v.originalGlobal.survivingBooks===0));
console.log(JSON.stringify(result,null,2));
