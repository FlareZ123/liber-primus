"use strict";
// SFT: node sims/lp2_parable_56tree_primeclock_original_sft.cjs
// Source only, Windows Node22/CommonJS, no packages or output files.
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const load=(p)=>JSON.parse(fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));
const corpus=load("resources/liber-primus/lp2-corpus.json");
const T=load("resources/liber-primus/lp2-grid-256.json").bytes;
const rev=Array.from({length:256},()=>[]);
for(let i=0;i<256;i++)rev[T[i]].push(i);
const children=new Map(),sizes=new Map();
/** @param {number} v */
function collect(v){if(children.has(v))return;const x=rev[v].filter(u=>u!==v);children.set(v,x);x.forEach(collect);}
/** @param {number} v @returns {number} */
function size(v){if(sizes.has(v))return sizes.get(v);const n=1+children.get(v).reduce((sum,x)=>sum+size(x),0);sizes.set(v,n);return n;}
/** @param {number} v @returns {number[]} */
function order(v){const x=children.get(v).slice().sort((a,b)=>size(b)-size(a)||a-b);
return x.length?[...order(x[0]),v,...x.slice(1).flatMap(order)]:[v];}
collect(201);
assert.equal(size(201),56);
const nodes=order(201);
assert.equal(new Set(nodes).size,56);
assert.deepEqual([nodes[0],nodes[32],nodes[44],nodes[50],nodes[55]],[178,73,82,201,128]);
const primes=[];
for(let n=2;primes.length<600;n++){let ok=true;for(let d=2;d*d<=n;d++)if(n%d===0){ok=false;break;}if(ok)primes.push(n);}
const mod=(n)=>((n%29)+29)%29;
/** @param {number[]} cipher @param {number} start */
function reach(cipher,start){let states=new Set([0]);for(let i=0;i<cipher.length;i++){
const next=new Set();for(const used of states){
const p=mod(cipher[i]-(primes[start+used]-1));
if(p!==0)next.add(used+1);if(cipher[i]===0)next.add(used);}
if(!next.size)return {firstImpossible:i,terminal:[]};states=next;}
return {firstImpossible:null,terminal:[...states]};}
/** @param {number[]} cipher @param {number} start */
function paths(cipher,start){let out=[{cursor:0,plain:[],skips:[]}];for(let i=0;i<cipher.length;i++){
const next=[];for(const x of out){const p=mod(cipher[i]-(primes[start+x.cursor]-1));
if(p!==0)next.push({cursor:x.cursor+1,plain:[...x.plain,p],skips:x.skips});
if(cipher[i]===0)next.push({cursor:x.cursor,plain:[...x.plain,0],skips:[...x.skips,i]});}
out=next;assert.ok(out.length<=1000);}return out;}
/** @param {number[]} symbols */
function ioc(symbols){const ct=Array(29).fill(0);symbols.forEach(v=>ct[v]++);
return ct.reduce((sum,v)=>sum+v*(v-1),0)/(symbols.length*(symbols.length-1));}
const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} w @returns {number[]} */
function word(w){const s=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
.replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
const a=[];for(let i=0;i<s.length;){const t=tokens.find(x=>s.startsWith(x.s,i));assert.ok(t);
a.push(t.i);i+=t.s.length;}return a;}
const solved=("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE "+
"THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE")
.split(" ").flatMap(word);
assert.equal(solved.length,85);
let clock=0;
const encoded=solved.map(p=>p===0?0:mod(p+(primes[clock++]-1)));
assert.deepEqual(encoded,corpus.pages[56].indices);
assert.equal(clock,84);
assert.ok(reach(encoded,0).terminal.includes(84));
const rows=[];
for(let p=0;p<56;p++){const original=corpus.pages[p].indices;if(!original.length)continue;
const node=nodes[p],fromNode=reach(original,node),fromParent=reach(original,T[node]);
rows.push({page:p,node,successor:T[node],runes:original.length,
nodeFailure:fromNode.firstImpossible,successorFailure:fromParent.firstImpossible});}
assert.equal(rows.length,55);
assert.deepEqual(rows.filter(x=>x.nodeFailure===null).map(x=>x.page),[33,43,49]);
assert.deepEqual(rows.filter(x=>x.successorFailure===null).map(x=>x.page),[42,43,49,51,55]);
const orig55=corpus.pages[55].indices,candidates=paths(orig55,T[nodes[55]]);
assert.equal(T[nodes[55]],201);
assert.deepEqual(candidates.map(x=>x.skips),[[41],[25],[15]]);
for(const c of candidates){let n=0;assert.deepEqual(c.plain.map(v=>v===0?0:mod(v+primes[201+n++]-1)),orig55);}
console.log(JSON.stringify({
  authoredInputs:"original p50 base60 table; canonical 55 LP2 unknown rune pages",
  pageMap:"candidate largest-child-first 56-descendant branch at source node201",
  testedPrimeStarts:"page node; original table successor, zero-based per page",
  nodeSurvivors:[33,43,49],successorSurvivors:[42,43,49,51,55],
  firstFailureExamples:rows.filter(x=>[0,22,32,53,55].includes(x.page)),
  solvedP56Positive:{runes:85,primeClock:84},
  p55SurvivingStrings:candidates.map(x=>({skippedAt:x.skips,
    normalizedIoC:29*ioc(x.plain),
    first60Translit:x.plain.slice(0,60).map(v=>corpus.translit[v]).join("")}))
},null,2));
