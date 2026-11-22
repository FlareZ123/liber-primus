'use strict';
/**
 * P40/P54 two red titles GP-prime sum 435+597=1032=phi(1033);
 * original Cicada prime 3301; all floral red prime sum3294 picks
 * exponent 3301-3294=7. Complete framed floral 3316=4*829,
 * where 829 is also a recovered p15 Fibonacci-index prime.
 *
 * Frozen RSA4 base29 cycle-walk over 829 four-rune blocks, both
 * exponent directions and both base29 digit orders. Proposed key use
 * is conjectural; numerical source selection alone proves no cipher.
 *
 * Windows Node.js 22: node sims/lp2_p15_1033_3301_rsa4_floral_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
/** @param {string} f @returns {any} */
const read=f=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',f),'utf8'));
const c=read('resources/liber-primus/lp2-corpus.json');
const ink=read('resources/liber-primus/lp2-ink-annotations.json');
const P=1033,Q=3301,N=P*Q,PHI=(P-1)*(Q-1);
const E=7,D=1459543,RADIX=29,WIDTH=4,DOMAIN=RADIX**WIDTH;
assert.equal(N,3409933);
assert.equal(PHI,3405600);
assert.equal(E*D%PHI,1);
assert.equal(DOMAIN,707281);
assert.ok(N*N<Number.MAX_SAFE_INTEGER);
const source=c.pages.slice(40,56).flatMap(p=>p.indices);
assert.equal(source.length,3316);
assert.equal(source.length/WIDTH,829);
const reds=ink.pages.filter(p=>p.page>=40&&p.page<=55)
  .flatMap(p=>(p.red_spans||[]).map(s=>[p.page,s.start,s.length]));
assert.deepEqual(reds,[[40,0,8],[53,128,51],[54,0,9]]);
const sums=reds.map(([page,start,count])=>c.pages[page].indices
  .slice(start,start+count).reduce((s,index)=>s+c.prime[index],0));
assert.deepEqual(sums,[435,2262,597]);
assert.equal(sums[0]+sums[2],P-1);
assert.equal(Q-sums.reduce((a,b)=>a+b,0),E);
/** @param {number} x @param {number} exp */
function pow(x,exp){
  let result=1;
  while(exp>0){
    if(exp%2)result=result*x%N;
    x=x*x%N;
    exp=Math.floor(exp/2);
  }
  return result;
}
/** @param {number} v @param {number} exp */
function cycle(v,exp){
  let steps=0;
  do{
    v=pow(v,exp);
    steps++;
    assert.ok(steps<=PHI);
  }while(v>=DOMAIN);
  return {v,steps};
}
/** @param {number[]} list @param {number} exp @param {boolean} reverse */
function apply(list,exp,reverse){
  const out=[];let maxCycle=0,total=0;
  assert.equal(list.length%WIDTH,0);
  for(let i=0;i<list.length;i+=WIDTH){
    const digits=list.slice(i,i+WIDTH);
    if(reverse)digits.reverse();
    let v=digits.reduce((a,b)=>a*RADIX+b,0);
    const z=cycle(v,exp);
    v=z.v;
    const next=Array(WIDTH);
    for(let j=WIDTH-1;j>=0;j--){
      next[j]=v%RADIX;
      v=Math.floor(v/RADIX);
    }
    if(reverse)next.reverse();
    out.push(...next);
    maxCycle=Math.max(maxCycle,z.steps);
    total+=z.steps;
  }
  return {out,maxCycle,meanCycle:total/(list.length/WIDTH)};
}
/** @param {number[]} list */
function ioc(list){
  const h=Array(29).fill(0);
  for(const v of list)h[v]++;
  return h.reduce((s,n)=>s+n*(n-1),0)/(list.length*(list.length-1));
}
const expected={
  '7,false':0.03437294747164896,
  '7,true':0.034780314649753376,
  '1459543,false':0.03443826449573984,
  '1459543,true':0.03455816399121586
};
const native=Array.from({length:source.length},
  (_,i)=>c.pages[57].indices[i%c.pages[57].indices.length]);
assert.ok(ioc(native)>0.05);
const results=[];
for(const exp of [E,D])for(const reverse of [false,true]){
  const decoded=apply(source,exp,reverse);
  const encryptedBack=apply(decoded.out,exp===E?D:E,reverse);
  assert.deepEqual(encryptedBack.out,source);
  assert.ok(Math.abs(ioc(decoded.out)-
    expected[`${exp},${reverse}`])<1e-14);
  const plantCipher=apply(native,E,reverse);
  const recovered=apply(plantCipher.out,D,reverse);
  assert.deepEqual(recovered.out,native);
  results.push({exp,reverse,decodedIoC:ioc(decoded.out),
    sourceGP29IoC:ioc(source),knownPlantIoC:ioc(native),
    maxCycle:decoded.maxCycle,meanCycle:decoded.meanCycle,
    originalExact:true,plantedExact:true,
    prefix:decoded.out.slice(0,48)
      .map(i=>c.translit[i]).join('.')});
}
console.log(JSON.stringify({
  primePair:[P,Q],publicExponent:E,privateExponent:D,
  modulus:N,totient:PHI,sourceVisibleRedSums:sums,
  unmodifiedFloralRunes:source.length,blocks:source.length/WIDTH,
  results,
  verdict:'Four complete original GP29 RSA inverses remain near-random. No unknown LP2 plaintext or authenticated key.'
},null,2));
