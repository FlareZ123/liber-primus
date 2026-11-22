'use strict';
/**
 * Original source handoff: p55 final DJU-BEI -> p27 word AEF -> p50
 * 103rd cell -> GEM graph cycle -> prime ordinal155 -> authentic p56
 * prime/totient + plaintext-F bypass, starting p27 local offset36.
 *
 * This source-constrained, single-start hypothesis fails exactly at p27
 * local rune 186. Exhaust all admissible F skip/consume decisions.
 * node sims/lp2_p27_gem_prime155_strictf_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const rows=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/base60-grid.json'),'utf8')).byte_rows;
/** @param {number} n @returns {number} */
const mod29=n=>((n%29)+29)%29;
/** @param {number[]} data @returns {number} */
function ioc(data){const f=Array(29).fill(0);for(const v of data)f[v]++;return f.reduce((sum,n)=>sum+n*(n-1),0)/(data.length*(data.length-1));}
const p55=corpus.pages.find(x=>x.page===55).indices;
const p27=corpus.pages.find(x=>x.page===27).indices;
const p57=corpus.pages.find(x=>x.page===57).indices;
assert.deepEqual([p55.length,p27.length,p57.length],[76,234,95]);
/** @param {number[]} arr @returns {string} */
const spell=arr=>arr.map(x=>corpus.translit[x]).join('');
assert.equal(spell(p55.slice(-6)),'DJUBEI');
assert.equal(spell(p27.slice(28,34)),'DJUBEI');
const first=p55.slice(-6).slice(0,3).reduce((s,x)=>s+corpus.prime[x],0);
const second=p55.slice(-6).slice(3).reduce((s,x)=>s+corpus.prime[x],0);
assert.deepEqual([first,second],[129,159]);
assert.deepEqual([mod29(first+second),mod29(first-second)],[27,28]);
assert.equal(spell(p27.slice(34,36)),'AEF');
assert.equal(p27.slice(34,36).reduce((s,x)=>s+corpus.prime[x],0),103);
assert.equal(rows.length,32);
for(const row of rows)assert.equal(row.length,8);
const flat=rows.flat();
assert.equal(flat.length,256);
/** @param {number} oneBasedCell @returns {{rune:string,next:number}} */
function step(oneBasedCell){
  const i=oneBasedCell-1,byte=flat[i];
  const q=Math.floor(byte/29),r=byte%29;
  const directions=[[-1,1],[0,1],[1,1],[-1,0],[0,0],[1,0],[-1,-1],[0,-1],[1,-1]];
  const [dc,dr]=directions[q];
  const row=Math.floor(i/8),col=i%8;
  const nr=row+dr,nc=col+dc;
  assert.ok(nr>=0&&nr<32&&nc>=0&&nc<8);
  return {rune:corpus.translit[r],next:nr*8+nc+1};
}
const route=[103,111,119,127,128];
assert.equal(route.map(i=>step(i).rune).join(''),'OOGEM');
assert.deepEqual(route.map(i=>step(i).next),[111,119,127,128,119]);
const gem=route.slice(-3).map(i=>step(i).rune);
assert.deepEqual(gem,['G','E','M']);
const startOrdinal=gem.reduce((sum,s)=>sum+corpus.prime[corpus.translit.indexOf(s)],0);
assert.equal(startOrdinal,155);
const primes=[];
for(let n=2;primes.length<500;n++){
  let prime=true;
  for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break;}
  if(prime)primes.push(n);
}
assert.equal(primes[startOrdinal-1],907);
const source=p27.slice(36);
assert.equal(source.length,198);
assert.equal(source.filter(x=>x===0).length,9);
/**
 * All possible current prime-clock positions survive as a set; a cipher F
 * can be literal F (no clock) or encoded non-F (clock consumed).
 * A non-F ciphertext cannot decode to plaintext F, since the original
 * solved p56 rule emits literal F unchanged.
 * @param {number[]} ciphertext
 * @returns {{failure:number,atEnd:number[],beforeFailure:number[]}}
 */
function strictFStates(ciphertext){
  let states=new Set([0]);
  for(let i=0;i<ciphertext.length;i++){
    const next=new Set();
    for(const k of states){
      if(ciphertext[i]===0)next.add(k);
      const p=mod29(ciphertext[i]-(primes[startOrdinal-1+k]-1));
      if(p!==0)next.add(k+1);
    }
    if(next.size===0)return {failure:i,atEnd:[],beforeFailure:[...states]};
    states=next;
  }
  return {failure:-1,atEnd:[...states],beforeFailure:[]};
}
const actual=strictFStates(source);
assert.deepEqual(actual,{failure:150,atEnd:[],beforeFailure:[147]});
assert.equal(p27[186],24); // Original non-F cipher A
assert.equal(primes[startOrdinal-1+147],1997);
assert.equal(mod29(p27[186]-(1997-1)),0); // Illegal output F
// Source-native genuine p57 positive: twice the 95 known plaintext runes,
// then its first eight, to reproduce the original 198-rune target length.
const native=[...p57,...p57,...p57.slice(0,8)];
assert.equal(native.length,198);
const synthetic=[];
let clock=0;
for(const v of native){
  if(v===0){synthetic.push(0);continue;}
  synthetic.push(mod29(v+(primes[startOrdinal-1+clock++]-1)));
}
const positive=strictFStates(synthetic);
assert.equal(positive.failure,-1);
assert.ok(positive.atEnd.includes(clock));
// Replay with the known true F-mask and prime clock, checking every rune.
let consumed=0;
const reconstructed=[];
for(const p of native){
  if(p===0){reconstructed.push(0);continue;}
  reconstructed.push(mod29(p+(primes[startOrdinal-1+consumed++]-1)));
}
assert.deepEqual(reconstructed,synthetic);
const raw=source.map((c,i)=>mod29(c-(primes[startOrdinal-1+i]-1)));
console.log(JSON.stringify({
  sourceChain:'p55 DJU-BEI -> p27 rune28 -> next AEF prime103 -> p50 cell103 OOGEM -> GEM prime155',
  originalPage27FromRune:36,
  ciphertextRunes:198,
  originalCipherFs:9,
  seedPrimeOrdinal:155,seedPrime:907,
  strictFAllMaskFirstFailureAtDecodedIndex:150,
  sourcePageRuneOfContradiction:186,
  sourceCipherRune:'A',forcedPrime:1997,forbiddenPlaintext:'F',
  rawContinuousTotientIoC:ioc(raw),
  fullPlantGPSourceRunes:198,
  survivedPlantedTrueFClock:clock,
  recoveredUnknownPlaintext:false
},null,2));
