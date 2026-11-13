'use strict';
/**
 * All-offset p56 prime-totient key impossibility conditional on the
 * p55 moth-linked 30-rune crib; finite opposite-sign search.
 * CJS Node20+, no external dependencies or network.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const gp=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const lp1=fs.readFileSync(path.join(root,'resources/transcriptions/lp1_wulfic_canonical.txt'),'utf8');
const source='ᚦᛖ-ᛏᚩᛏᛁᛖᚾᛏ-ᚠᚢᚾᚳᛏᛡᚾ-ᛁᛋ-ᛋᚪᚳᚱᛖᛞ-ᚪᛚᛚ-ᚦᛝᛋ';
assert(lp1.includes(source));
const p=[...source].filter(r=>gp.runes.includes(r)).map(r=>gp.runes.indexOf(r));
const c=gp.pages[55].indices.slice(46);
assert.equal(p.length,30);assert.equal(c.length,30);
const mod=n=>(n%29+29)%29;
const need=c.map((v,i)=>mod(v-p[i])),opposite=need.map(v=>mod(-v));
const spots=need.flatMap((v,i)=>v===28?[i]:[]);
assert.deepEqual(spots,[8,24]);
// phi(prime) mod29 = 28 occurs only for prime=29 (exactly once
// in the infinite consecutive prime sequence): no offset can satisfy
// two distinct occurrences of the required residue.
const N=300000, limit=4500000, sieve=new Uint8Array(limit+1);
for(let i=2;i*i<=limit;i++)if(!sieve[i])for(let k=i*i;k<=limit;k+=i)sieve[k]=1;
const phi=[];
for(let i=2;i<=limit&&phi.length<N+30;i++)if(!sieve[i])phi.push((i-1)%29);
assert.equal(phi.length,N+30);assert.equal(phi[9],28);
assert.equal(phi.filter(x=>x===28).length,1);
function scan(required) {
 let best=-1,where=[],hits=0;
 for(let s=0;s<N;s++){
  let j=0;while(j<required.length&&phi[s+j]===required[j])j++;
  if(j>best){best=j;where=[s];}else if(j===best&&where.length<20)where.push(s);
  if(j===required.length)hits++;
 }
 return {bestPrefix:best,exampleOffsets:where,matches:hits};
}
const direct=scan(need),reverse=scan(opposite);
assert.equal(direct.bestPrefix,3);assert.equal(reverse.bestPrefix,2);
assert.equal(direct.matches,0);assert.equal(reverse.matches,0);
console.log(JSON.stringify({
 type:'Conditional original source crib, no plaintext recovered',
 p55LocalOffset:46,sourceNativeRunes:30,
 forwardKeyResidue28Offsets:spots,
 exactAllStartingPrimePhasesImpossible:true,
 finiteOppositeSign:{searchedPhases:N,...reverse},
 finiteDirectControl:direct,
 reasoning:'phi(p)=p-1 has residue 28 modulo29 only when p=29, once in the prime sequence'
},null,2));
