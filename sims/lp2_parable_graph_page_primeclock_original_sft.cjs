'use strict';

/**
 * Source-first LP2 original-cipher test:
 * 2013 PARABLE 3 prime ordinals -> source p50 base60 graph -> 56-node
 * exact page50-centered ancestry -> subtree-first inorder page assignment ->
 * each assigned address is the one-based rank of a page-local prime-totient
 * keystream using the exact solved-p56 literal-F transparent GP29 cipher.
 *
 * A complete inverse needs every rune to be algebraically admissible. Native
 * GP English is a separate stronger requirement; no plaintext is inferred by
 * choosing branches, phases, signs or seeds for a better word score.
 *
 * Run: node sims/lp2_parable_graph_page_primeclock_original_sft.cjs
 * Node 22 CommonJS, Windows compatible, no external runtime dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file */
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const grid = read('resources/liber-primus/lp2-grid-256.json');
const bytes = grid.bytes;
assert.equal(bytes.length, 256);
assert.equal(corpus.pages.length, 58);
const known = corpus.pages[57].indices;
const clauses = [known.slice(7, 37), known.slice(37, 67), known.slice(67, 95)];
assert.deepEqual(clauses.map(x => x.reduce((s,i) => s + corpus.prime[i], 0)),
  [1259,1031,1229]);

const reverse = Array.from({length:256},()=>[]);
bytes.forEach((v,i)=>reverse[v].push(i));
const sizeCache = new Map();
/** @param {number} node @returns {number} */
function subtreeSize(node) {
  if (sizeCache.has(node)) return sizeCache.get(node);
  const result = 1 + reverse[node].reduce((s,v) => s + subtreeSize(v), 0);
  sizeCache.set(node,result);
  return result;
}
/** @param {number} node @returns {number[]} */
function subtreeFirstInorder(node) {
  const children = reverse[node].map(id => ({id, size:subtreeSize(id)}))
    .sort((a,b) => b.size - a.size || a.id - b.id);
  if (children.length === 0) return [node];
  return [
    ...subtreeFirstInorder(children[0].id),
    node,
    ...children.slice(1).flatMap(c => subtreeFirstInorder(c.id))
  ];
}
const pageNodes = subtreeFirstInorder(201);
assert.equal(pageNodes.length,56);
assert.equal(pageNodes[50],201);
assert.deepEqual(reverse[201],[82,128]);
assert.deepEqual(reverse[201].map(subtreeSize),[50,5]);
assert.deepEqual([pageNodes[0],pageNodes[3],pageNodes[32],
  pageNodes[33],pageNodes[43],pageNodes[49],pageNodes[55]],
  [178,172,73,103,79,163,128]);

const primes = [];
for(let x=2;primes.length<800;x++){
  let prime=true;
  for(let d=2;d*d<=x;d++) if(x%d===0){prime=false;break}
  if(prime) primes.push(x);
}
/** @param {number} node @param {number} count @returns {number[]} */
function phiKeys(node,count) {
  assert(node >= 1 && node + count - 1 <= primes.length);
  return primes.slice(node-1,node-1+count).map(p=>(p-1)%29);
}
/**
 * Test all possible legitimate plaintext-F bypass branches. Deduplicate by
 * clock-index only because future possibility depends solely on clock index.
 * @param {number[]} ciphertext
 * @param {number} node one-based prime ordinal
 * @returns {{failAt:null|number,survivingClocks:number[],samplePlain:number[]|null}}
 */
function invert(ciphertext,node){
  const keys=phiKeys(node,ciphertext.length+1);
  let states=new Map([[0,[]]]);
  for(let i=0;i<ciphertext.length;i++){
    const next=new Map();
    const c=ciphertext[i];
    for(const [k,plain] of states){
      const decoded=(c-keys[k]+29)%29; // historically solved p56 inverse
      if(decoded!==0&&!next.has(k+1))next.set(k+1,[...plain,decoded]);
      if(c===0&&!next.has(k))next.set(k,[...plain,0]); // literal F, no clock
    }
    if(next.size===0)return {failAt:i,survivingClocks:[],samplePlain:null};
    states=next;
  }
  return {failAt:null,survivingClocks:[...states.keys()],
    samplePlain:states.values().next().value};
}
/** @param {number[]} plaintext @param {number} node @returns {number[]} */
function forward(plaintext,node){
  const keys=phiKeys(node,plaintext.length+1);
  let k=0;
  return plaintext.map(p=>p===0?0:(p+keys[k++])%29);
}
/** @param {number[]} xs @returns {number} */
function ioc(xs){
  const f=Array.from({length:29},()=>0);
  xs.forEach(x=>f[x]++);
  return f.reduce((t,n)=>t+n*(n-1),0)/(xs.length*(xs.length-1));
}
// Reversible authentically-solved plaintext positive with true F bypass.
const nativePlant=known;
const positive=invert(forward(nativePlant,172),172);
assert.equal(positive.failAt,null);
// A decoder that ignores the literal-F route is not a valid solved-p56 model.
assert(nativePlant.includes(0));
const pages=Array.from({length:56},(_,i)=>i).filter(p=>p!==50);
assert.equal(corpus.pages[50].indices.length,0);
const results=pages.map(page=>{
  const node=pageNodes[page],cipher=corpus.pages[page].indices,
    decoded=invert(cipher,node);
  return {page,node,prime:primes[node-1],runes:cipher.length,
    failureAt:decoded.failAt,possibleClocks:decoded.survivingClocks.length,
    ioc:decoded.samplePlain?ioc(decoded.samplePlain):null,
    first80:decoded.samplePlain
      ?decoded.samplePlain.slice(0,80).map(x=>corpus.translit[x]).join(''):null};
});
const survivors=results.filter(r=>r.failureAt===null);
assert.deepEqual(survivors.map(r=>r.page),[3,33,43,49,55]);
assert.deepEqual(survivors.map(r=>r.possibleClocks),[1,2,3,1,1]);
assert(survivors.every(r=>r.ioc<0.05));

// Fixed-page null: p50 remains mapped to its 56-node graph root201.
// Only the other 55 page seeds are permuted. No seed/clock or sign fitting.
let state=0x33012026;
/** @returns {number} */
function random32(){
  state^=state<<13;
  state^=state>>>17;
  state^=state<<5;
  return state>>>0;
}
const trials=3000;
let sum=0,ge=0,eq=0,min=Infinity,max=0;
for(let t=0;t<trials;t++){
  const seeds=pages.map(p=>pageNodes[p]);
  for(let i=seeds.length-1;i>0;i--){
    const j=random32()%(i+1);
    [seeds[i],seeds[j]]=[seeds[j],seeds[i]];
  }
  let count=0;
  for(let i=0;i<pages.length;i++){
    const result=invert(corpus.pages[pages[i]].indices,seeds[i]);
    if(result.failAt===null) count++;
  }
  sum+=count;
  ge+=Number(count>=survivors.length);
  eq+=Number(count===survivors.length);
  min=Math.min(min,count);max=Math.max(max,count);
}
console.log(JSON.stringify({
  classification:'FINITE ORIGINAL-CIPHER NEGATIVE, NO NEW LP2 PLAINTEXT',
  root201: {firstSubtree:50, numericOnlyRootAtPage:50,lastSubtree:5},
  original: {runePages:55, impossible:50, completeArithmeticCandidates:survivors.length,
    survivors,
    longestSurvivingPage:Math.max(...survivors.map(r=>r.runes)),
    nativeClearP57IoC:ioc(known)},
  null:{seed:'0x33012026',trials,randomization:'page50 root held fixed, permute 55 other graph-node prime rank seeds',
    mean:sum/trials,min,max,equalOriginal:eq,atLeastOriginal:ge,
    empiricalUpperTail:(ge+1)/(trials+1)},
  solvedNativePositive:{length:nativePlant.length,
    originalContainsTransparentF:true,
    fullRecoveredAlgebraically:positive.failAt===null},
  noDecodingClaim:'All surviving direct GP29 outputs remain nonlinguistic; both page assignment and node-as-prime-ordinal semantics are provisional, not original-authenticated.'
},null,2));
