'use strict';
/**
 * Original LP2 quote-pair generic necessary-condition SFT.
 * Run: node sims/quote_pair_generic_invariants.cjs
 * JSDoc describes model assumptions; no unknown plaintext is inferred.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(base, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const quotes = JSON.parse(fs.readFileSync(path.join(base, 'resources/liber-primus/lp2-quote-punctuation-spans.json'), 'utf8'));
const runes = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(runes.length, 12956);
const qa = quotes.quotes.find(x => x.start === 9811 && x.end === 9869);
const qb = quotes.quotes.find(x => x.start === 12522 && x.end === 12592);
assert.ok(qa && qb);
assert.equal(qa.page_slices[0].page, 40);
assert.equal(qa.page_slices[0].start, 171);
assert.equal(qb.page_slices[0].page, 53);
assert.equal(qb.page_slices[0].start, 53);
const N = [5, 7, 2, 3, 4].reduce((a,b) => a+b, 0);
const A = runes.slice(qa.start, qa.start + N);
const B = runes.slice(qb.start, qb.start + N);
const mod = n => (n % 29 + 29) % 29;
const bitcount = x => {let n=0; for(let b=x>>>0; b; b&=b-1) n++; return n;};

/** Exhaustive maximum clique on compatible equality relations, n<=30. */
function partition(a,b) {
  assert.equal(a.length,b.length);
  const n=a.length, edges=a.map((_,i)=>{
    let mask=0;
    for(let j=0;j<n;j++) if(i!==j && ((a[i]===a[j])===(b[i]===b[j]))) mask|=1<<j;
    return mask;
  });
  let best=0, winner=0;
  function search(candidates, chosen, count) {
    if(count+bitcount(candidates)<=best) return;
    if(!candidates) {if(count>best){best=count;winner=chosen;}return;}
    while(candidates) {
      const low=candidates&-candidates, v=31-Math.clz32(low);
      candidates&=~low;
      search(candidates&edges[v],chosen|low,count+1);
      if(count+bitcount(candidates)<=best)break;
    }
  }
  search((1<<n)-1,0,0);
  return {agreement:best,minimumChanges:n-best,
    unchangedPositions:Array.from({length:n},(_,i)=>i).filter(i=>winner&(1<<i)),
    alteredPositions:Array.from({length:n},(_,i)=>i).filter(i=>!(winner&(1<<i)))};
}
const inverse=Array.from({length:29},(_,a)=>a===0?0:
  Array.from({length:28},(_,b)=>b+1).find(b=>(a*b)%29===1));

/** Check exact F29 constraints for arbitrary unknown T-symbol pad and optional quote shift. */
function fits(a,b,astart,bstart,T,freeOffset,drop=0) {
  const w=T+Number(freeOffset), rows=[];
  for(let i=0;i<a.length;i++) {
    if(drop&(1<<i))continue;
    const r=new Uint8Array(w+1), x=(astart+i)%T, y=(bstart+i)%T;
    r[x]=mod(r[x]+1);r[y]=mod(r[y]-1);
    if(freeOffset)r[T]=1;
    r[w]=mod(a[i]-b[i]); rows.push(r);
  }
  let rank=0;
  for(let col=0;col<w && rank<rows.length;col++) {
    let k=rank;while(k<rows.length && !rows[k][col]) k++;
    if(k===rows.length)continue;
    [rows[k],rows[rank]]=[rows[rank],rows[k]];
    const inv=inverse[rows[rank][col]];
    for(let j=col;j<=w;j++)rows[rank][j]=mod(rows[rank][j]*inv);
    for(let j=rank+1;j<rows.length;j++) {
      const factor=rows[j][col];
      if(!factor)continue;
      for(let h=col;h<=w;h++)rows[j][h]=mod(rows[j][h]-factor*rows[rank][h]);
    }
    rank++;
  }
  return rows.slice(rank).every(r=>r[w]===0);
}
function minChanges(a,b,s,t,T,free) {
  if(fits(a,b,s,t,T,free))return 0;
  for(let i=0;i<a.length;i++) if(fits(a,b,s,t,T,free,1<<i))return 1;
  for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)
    if(fits(a,b,s,t,T,free,(1<<i)|(1<<j)))return 2;
  return null;
}
function testClock(s,t,free) {
  const possible=[];
  for(let T=1;T<=29;T++){
    const changed=minChanges(A,B,s,t,T,free);
    if(changed!==null)possible.push({period:T,minimumChanges:changed});
  }
  return {minimumExactPeriod:possible.find(x=>x.minimumChanges===0)?.period,
    minimumWithTwoChanges:possible[0]?.period,firstModels:possible.slice(0,8)};
}

// Model-matched exact positive controls, including a hidden period-seven pad.
const P=Array.from({length:N},(_,i)=>mod(i*i+3*i+7));
const ca=P.map(x=>mod(17*x+8)),cb=P.map(x=>mod(11*x+6));
assert.equal(partition(ca,cb).minimumChanges,0);
const corrupted=cb.slice(); corrupted[8]=mod(corrupted[8]+1);corrupted[19]=mod(corrupted[19]+1);
assert.ok(partition(ca,corrupted).minimumChanges<=2);
const key=Array.from({length:7},(_,i)=>mod(7*i*i+3));
const pa=P.map((x,i)=>mod(x+key[(9811+i)%7]+4));
const pb=P.map((x,i)=>mod(x+key[(12522+i)%7]+17));
assert.equal(fits(pa,pb,9811,12522,7,true),true);
assert.equal(fits(pa,pb,9811,12522,7,false),false);
const answer={
  claim:'Conditional on a common 21-rune plaintext phrase only; no authentic plaintext recovered',
  sourceOffsets:[[9811,9832],[12522,12543]],
  wordLengths:[5,7,2,3,4],
  ciphertextA:A,ciphertextB:B,
  independentFixedSubstitutions:partition(A,B),
  periods:{
    global_sameShift:testClock(9811,12522,false),
    global_independentShifts:testClock(9811,12522,true),
    physicalPage_sameShift:testClock(171,53,false),
    physicalPage_independentShifts:testClock(171,53,true)
  },
  syntheticControls:'PASS'
};
assert.equal(answer.independentFixedSubstitutions.agreement,14);
assert.equal(answer.periods.global_sameShift.minimumExactPeriod,22);
assert.equal(answer.periods.global_independentShifts.minimumExactPeriod,21);
assert.equal(answer.periods.physicalPage_sameShift.minimumExactPeriod,23);
assert.equal(answer.periods.physicalPage_independentShifts.minimumExactPeriod,21);
assert.equal(answer.periods.global_sameShift.minimumWithTwoChanges,19);
assert.equal(answer.periods.global_independentShifts.minimumWithTwoChanges,19);
console.log(JSON.stringify(answer,null,2));
