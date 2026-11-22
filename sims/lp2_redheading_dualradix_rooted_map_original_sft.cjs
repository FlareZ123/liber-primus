'use strict';
/**
 * LP2 nine red chapter headings, base59/base60 numeral-table graph, and
 * original-cipher solved-page transfer. Windows Node.js 22 CommonJS SFT.
 *
 * All inputs are unmodified published artifact transcriptions. No
 * ciphertext solution or author-authenticated table radix is claimed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} source */
const load = source => JSON.parse(fs.readFileSync(
  path.join(root,source),'utf8'));
const gp=load('resources/liber-primus/lp2-corpus.json');
const ink=load('resources/liber-primus/lp2-ink-annotations.json');
const grid=load('resources/liber-primus/base60-grid.json');
const tokens=grid.rows.flat();
assert.equal(tokens.length,256);
assert.equal(ink.counts.red,225);
assert.equal(grid.alphabet.length,60);
assert(tokens.every(token=>token.length===2&&!token.includes('f')));
const alpha59=grid.alphabet.replace('f','');
assert.equal(alpha59.length,59);
/** @param {string} alphabet */
function decodeTable(alphabet) {
  const radix=alphabet.length;
  return tokens.map(token=>alphabet.indexOf(token[0])*radix+
    alphabet.indexOf(token[1]));
}
const T59=decodeTable(alpha59),T60=decodeTable(grid.alphabet);
assert.deepEqual(T60,grid.byte_rows.flat());
assert.deepEqual([Math.min(...T59),Math.max(...T59)],[0,251]);
const pages=[0,3,8,15,23,27,33,40,54];
const headings=pages.map(page=>{
  const marks=ink.pages.find(r=>r.page===page);
  const spans=marks.red_spans.filter(s=>s.start===0||
    (page===15&&s.start===9));
  const source=spans.flatMap(s=>gp.pages[page].indices.slice(
    s.start,s.start+s.length));
  const ordinal=source.reduce((sum,n)=>sum+n,0);
  const gpPrime=source.reduce((sum,n)=>sum+gp.prime[n],0);
  const first=gp.pages[page].indices.slice(0,spans[0].length);
  return {page,len:source.length,ordinal,gpPrime,
    firstOrdinal:first.reduce((s,v)=>s+v,0),
    firstPrime:first.reduce((s,v)=>s+gp.prime[v],0)};
});
assert.deepEqual(headings.map(x=>x.len),[13,16,12,20,16,19,10,8,9]);
assert.deepEqual(headings.map(x=>x.ordinal),
  [181,208,131,284,220,305,109,116,159]);
const addresses=headings.map(x=>x.ordinal%256);
assert.deepEqual(addresses,[181,208,131,28,220,49,109,116,159]);
assert.deepEqual(addresses.map(i=>T59[i]),
  [40,56,118,148,57,16,181,53,244]);
assert.deepEqual(addresses.map(i=>T60[i]),
  [40,57,120,150,58,16,184,54,248]);
assert.deepEqual(headings.filter(x=>x.len===16).map(x=>x.page),[3,23]);
assert.equal(tokens[189],'3C');
assert.equal(T59[189],189);
/** @param {number[]} table @param {number} seed */
function route(table,seed) {
  const seen=new Set();
  const path=[];
  let at=seed;
  while(!seen.has(at)){
    seen.add(at);
    path.push(at);
    at=table[at];
  }
  return {path,cycleEntry:at};
}
const walks=Array.from({length:256},(_,seed)=>route(T59,seed));
assert(walks.every(x=>x.cycleEntry===189));
assert.equal(Math.max(...walks.map(x=>x.path.length)),39);
assert.deepEqual(route(T59,181).path.slice(0,2),[181,40]);
assert.deepEqual(route(T59,208).path.slice(0,2),[208,56]);
assert.deepEqual(route(T59,220).path.slice(0,2),[220,57]);
assert.deepEqual(route(T59,116).path.slice(0,2),[116,53]);
/** @param {number[]} table */
function cycles(table) {
  const finished=new Uint8Array(256),out=[];
  for(let seed=0;seed<256;seed++){
    if(finished[seed])continue;
    const path=[],index=new Map();
    let at=seed;
    while(!finished[at]&&!index.has(at)){
      index.set(at,path.length);
      path.push(at);
      at=table[at];
    }
    if(!finished[at])out.push(path.slice(index.get(at)));
    for(const node of path)finished[node]=1;
  }
  return out;
}
assert.deepEqual(cycles(T59),[[189]]);
assert.deepEqual(cycles(T60).map(x=>x.length).sort((a,b)=>a-b),
  [2,11]);
let rootState=0x59c1ca99;
/** @returns {number} */
function rootRandom() {
  rootState^=rootState<<13;
  rootState^=rootState>>>17;
  rootState^=rootState<<5;
  return rootState>>>0;
}
let anyOneFixed=0,onlyRoot189=0;
const rootTrials=120000;
for(let trial=0;trial<rootTrials;trial++){
  const value=T59.slice();
  for(let i=255;i>0;i--){
    const j=Math.floor(rootRandom()/4294967296*(i+1));
    [value[i],value[j]]=[value[j],value[i]];
  }
  const c=cycles(value);
  if(c.length===1&&c[0].length===1){
    anyOneFixed++;
    if(c[0][0]===189)onlyRoot189++;
  }
}
assert.deepEqual([anyOneFixed,onlyRoot189],[443,18]);

/* Both numeral interpretations are shuffled as the SAME 256 printed
 * token positions, retaining their source covariance. */
const variants=[];
for(const kind of ['ordinal','gpPrime']){
  for(const first of [false,true]){
    for(const shift of [0,-1]){
      const addr=headings.map(item=>{
        const key=first
          ? kind==='ordinal'?'firstOrdinal':'firstPrime'
          : kind;
        return ((item[key]+shift)%256+256)%256;
      });
      variants.push(addr);
    }
  }
}
assert.equal(variants.length,8);
/** @param {number[]} table @param {number[]} addr */
const solvedCount=(table,addr)=>addr.reduce((n,i)=>
  n+Number(table[i]===56||table[i]===57),0);
let pairState=0x2f330101;
/** @returns {number} */
function pairRandom() {
  pairState^=pairState<<13;
  pairState^=pairState>>>17;
  pairState^=pairState<<5;
  return pairState>>>0;
}
let orderedPair=0,primaryPair=0,any16=0;
const pairTrials=150000;
for(let trial=0;trial<pairTrials;trial++){
  const perm=Array.from({length:256},(_,i)=>i);
  for(let i=255;i>0;i--){
    const j=Math.floor(pairRandom()/4294967296*(i+1));
    [perm[i],perm[j]]=[perm[j],perm[i]];
  }
  const v59=perm.map(i=>T59[i]),v60=perm.map(i=>T60[i]);
  if(v59[208]===56&&v59[220]===57)orderedPair++;
  if(solvedCount(v59,addresses)>=2)primaryPair++;
  if(variants.some(a=>solvedCount(v59,a)>=2)||
     variants.some(a=>solvedCount(v60,a)>=2))any16++;
}
assert.deepEqual([orderedPair,primaryPair,any16],[3,480,9500]);

// Source-selected direct key transfer: authenticated solved p56 plaintext
// from its prime-totient stream, and the originally clear p57 text.
const primes=[];
for(let n=2;primes.length<84;n++){
  let isPrime=true;
  for(let d=2;d*d<=n;d++)if(n%d===0){isPrime=false;break;}
  if(isPrime)primes.push(n);
}
let keyPosition=0;
const mod29=x=>(x%29+29)%29;
const key56=gp.pages[56].indices.map((c,i)=>
  i===56?0:mod29(c-(primes[keyPosition++]-1)));
const key57=gp.pages[57].indices;
assert.equal(key56.length,85);
assert.equal(keyPosition,84);
assert.deepEqual(key56.slice(0,5),[24,9,18,9,23]); // AN END
assert.equal(key57.length,95);
assert.deepEqual(key57.slice(0,7),[13,24,4,24,17,20,18]); // PARABLE
/** @param {number[]} values */
function coincidence(values){
  const frequencies=Array(29).fill(0);
  for(const value of values)frequencies[value]++;
  return frequencies.reduce((s,n)=>s+n*(n-1),0)/
    (values.length*(values.length-1));
}
const directTransfer=[];
for(const [source,lo,hi,key] of [[56,3,7,key56],[57,23,26,key57]]){
  const cipher=gp.pages.filter(p=>p.page>=lo&&p.page<=hi)
    .flatMap(p=>p.indices);
  for(const sign of [-1,1]){
    const decoded=cipher.map((x,i)=>mod29(x+sign*key[i%key.length]));
    assert.deepEqual(decoded.map((x,i)=>mod29(x-sign*key[i%key.length])),cipher);
    directTransfer.push({source,chapter:[lo,hi],sign,
      decodedIoC:coincidence(decoded),
      first20:decoded.slice(0,20).map(i=>gp.translit[i]).join('-')});
  }
}
assert(directTransfer.every(row=>row.decodedIoC<0.039));
console.log(JSON.stringify({
  status:'Candidate numeric navigation and global base59 root; NO unknown plaintext',
  headings,sourceTable:{tokenCount:256,noLowercaseF:true},
  base59:{headingOutputs:addresses.map(i=>T59[i]),root:189,
    all256TerminateAtRoot:true,maxDistinctWalk:39,cycles:cycles(T59)},
  base60:{headingOutputs:addresses.map(i=>T60[i]),
    cycleLengths:cycles(T60).map(x=>x.length)},
  shuffledSourceTable:{rootTrials,anyOneFixed,onlyRoot189,
    pairTrials,orderedPair,primaryPair,any16},
  directSolvedPageKeyTransfer:directTransfer,
  nextDecision:'Require an author-selected original-cipher operation to promote navigation'
},null,2));
