"use strict";
/**
 * LP2 exact-mask full-book local interleaved GP29 × 2 word-pair direction.
 * Single one-pass source-visible hypothesis, frozen before original scoring.
 * Windows 11 Node22: node sims/lp2_gp29_fullbook_interleaved_direction_original_sft.cjs
 *
 * No ciphertext key is inferred here; an original output with random-looking
 * GP29 is a negative for THIS unkeyed ascending local-rank convention.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
/** @param {string} p @returns {string} */
function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ids = new Map(corpus.runes.map((v, i) => [v, i]));
const words = read("resources/liber-primus/lp2-transcription.txt")
  .replace(/[\/\n\r%&$\s]/g, "")
  .split(/[-.]/)
  .filter(t => /[\u16A0-\u16FF]/u.test(t))
  .slice(0, 2896)
  .map(t => Array.from(t, rune => {
    const v = ids.get(rune);
    assert.notEqual(v, undefined);
    return v;
  }));
const sourcePages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const source = sourcePages.flatMap(p => p.indices);
const N = source.length;
assert.equal(N, 12956);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), source);
const lengths = words.map(w => w.length);
const repeat = new Uint8Array(N);
let E = 0;
for (let i = 1; i < N; i++) {
  repeat[i] = Number(source[i] === source[i - 1]);
  E += repeat[i];
}
assert.equal(E, 86);
const pairEnd = new Map();
let offset = 0;
let U = 0;
for (let w = 0; w < words.length; w += 2) {
  const a = lengths[w], b = lengths[w + 1];
  offset += a + b;
  if (a !== b) pairEnd.set(offset - 1, U++);
}
assert.equal(offset, N);
assert.equal(U, 1242);
/** @typedef {{type:"rune"|"bit",at:number,base:bigint}} Event */
const events = /** @type {Event[]} */([]);
for (let i = 0; i < N; i++) {
  events.push({type:"rune", at:i, base:i===0?29n:(repeat[i]?1n:28n)});
  if (pairEnd.has(i)) {
    events.push({type:"bit", at:pairEnd.get(i), base:2n});
  }
}
assert.equal(events.length, N + U);
const M = events.reduce((v,e)=>v*e.base,1n);
const Q = 29n ** BigInt(N);
assert.equal(M, 29n*28n**BigInt(N-1-E)*(1n<<BigInt(U)));
assert.ok(M>=Q);
/** @param {number[]} x @returns {bigint} */
function base29(x) {
  let y=0n;
  for(const v of x) y=29n*y+BigInt(v);
  return y;
}
/** @param {bigint} y @returns {number[]} */
function from29(y) {
  assert.ok(y>=0n&&y<Q);
  const x=new Array(N);
  for(let i=N-1;i>=0;i--){x[i]=Number(y%29n);y/=29n;}
  assert.equal(y,0n);
  return x;
}
/** @param {number[]} xs @returns {number[]} */
function pairBits(xs) {
  const b=[];
  for(let i=0;i+1<xs.length;i+=2) if(xs[i]!==xs[i+1])
    b.push(Number(xs[i]>xs[i+1]));
  return b;
}
/** @param {number[]} b @returns {number[]} */
function unrankLengths(b) {
  const x=lengths.slice();
  let cursor=0;
  for(let i=0;i+1<x.length;i+=2) {
    const a=x[i], c=x[i+1];
    if(a===c)continue;
    const v=b[cursor++];
    x[i]=v?Math.max(a,c):Math.min(a,c);
    x[i+1]=v?Math.min(a,c):Math.max(a,c);
  }
  assert.equal(cursor,U);
  return x;
}
/**
 * @param {number[]} runes
 * @param {number[]} wordLengths
 * @returns {bigint}
 */
function rank(runes,wordLengths) {
  const bits=pairBits(wordLengths);
  assert.equal(bits.length,U);
  let value=0n;
  for(const e of events) {
    let d;
    if(e.type==="bit") d=bits[e.at];
    else if(e.at===0) d=runes[0];
    else {
      const here=runes[e.at],prev=runes[e.at-1];
      if(repeat[e.at]){assert.equal(here,prev);d=0;}
      else {assert.notEqual(here,prev);d=here<prev?here:here-1;}
    }
    assert.ok(d>=0&&BigInt(d)<e.base);
    value=value*e.base+BigInt(d);
  }
  return value;
}
/**
 * @param {bigint} value
 * @returns {{runes:number[],wordLengths:number[]}}
 */
function unrank(value) {
  assert.ok(value>=0n&&value<M);
  const runeDigits=new Array(N),bits=new Array(U);
  for(let i=events.length-1;i>=0;i--){
    const e=events[i],d=Number(value%e.base);
    value/=e.base;
    if(e.type==="bit")bits[e.at]=d;
    else runeDigits[e.at]=d;
  }
  assert.equal(value,0n);
  const runes=[runeDigits[0]];
  for(let i=1;i<N;i++){
    const prev=runes[i-1],d=runeDigits[i];
    runes.push(repeat[i]?prev:(d<prev?d:d+1));
  }
  return {runes,wordLengths:unrankLengths(bits)};
}
/** @param {number[]} v @returns {number} */
function ioc(v) {
  const h=Array(29).fill(0);
  for(const x of v)h[x]++;
  return h.reduce((s,x)=>s+x*(x-1),0)/(v.length*(v.length-1));
}
const Roriginal=rank(source,lengths);
const P=Roriginal*Q/M;
const base=(P*M+Q-1n)/Q;
assert.ok(Roriginal>=base);
const reconstructed=unrank(base+(Roriginal-base));
assert.deepEqual(reconstructed.runes,source);
assert.deepEqual(reconstructed.wordLengths,lengths);
const solved=corpus.pages.find(p=>p.page===57).indices;
assert.equal(solved.length,95);
const native=Array.from({length:N},(_,i)=>solved[i%solved.length]);
const Rplanted=(base29(native)*M+Q-1n)/Q;
const cipher=unrank(Rplanted);
assert.equal(rank(cipher.runes,cipher.wordLengths),Rplanted);
assert.equal(Rplanted*Q/M,base29(native));
assert.deepEqual(from29(Rplanted*Q/M),native);
const text=from29(P),before16=sourcePages.filter(p=>p.page<16)
  .reduce((s,p)=>s+p.indices.length,0);
console.log("LOCAL MIXED-RADIX INTERLEAVED source original rune/bit events",events.length,
  "equal sites",E,"unequal pair bits",U,"source zero residual",Roriginal===base);
console.log("original first300 IoC",ioc(text.slice(0,300)).toFixed(9),
  "original p16 first200 IoC",ioc(text.slice(before16,before16+200)).toFixed(9),
  "authentic p57-native plant IoC",ioc(native).toFixed(9));
console.log("first80 decoded original GP29",text.slice(0,80).join(","));
console.log("PASS entire 12956 original-source rune tape, 2896 gaps,",
  "and independent original-shaped 12956-runic solved-native plant.");
