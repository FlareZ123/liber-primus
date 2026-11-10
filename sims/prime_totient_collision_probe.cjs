'use strict';
/**
 * Prime-totient GP inversion. Authentic LP2 page56 uses phi(primes) as a
 * mod29 additive key. Test whether unsolved LP2 can be decoded with the
 * same source plus collision-driven key draws. All conclusions conditional.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const solved=require('./authentic_lp1_p03_p04_vigenere_recovery.cjs');
const lang=require('./relative_key_english_probe.cjs');
const ROOT=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const mod=x=>(x%29+29)%29;
const W=Number(process.env.PRIME_WINDOW||12000);
const D=Number(process.env.PRIME_DRIFT||14);
const PEN=Number(process.env.PRIME_SKIP_COST||1.6);
assert.ok(Number.isInteger(W)&&W>=4000&&W<=100000);
assert.ok(Number.isInteger(D)&&D>=4&&D<=60);
/** @param {number} len @returns {Uint8Array} */
function primesMod(len){
  const bound=Math.ceil(len*(Math.log(len)+Math.log(Math.log(len))))+200;
  const sieve=new Uint8Array(bound),out=new Uint8Array(len);let count=0;
  for(let p=2;p<bound&&count<len;p++)if(!sieve[p]){
    out[count++]=(p-1)%29;
    if(p*p<bound)for(let i=p*p;i<bound;i+=p)sieve[i]=1;
  }
  assert.equal(count,len);return out;
}
const key=primesMod(W+800);
const counts=new Float64Array(29).fill(0.8);
for(const word of lang.corpusWords(read('resources/control/shakespeare_first300k.txt').slice(0,240000)))
  for(const r of word)counts[r]+=0.004;
for(const r of solved.plaintext.slice(251))counts[r]++;
const total=counts.reduce((a,b)=>a+b,0);
const q=Float64Array.from(counts,x=>Math.log(x/total));
/** @param {number[]} C @param {number} start @param {number} sign */
function direct(C,start,sign){
  let s=0;for(let i=0;i<C.length;i++)s+=q[mod(C[i]-sign*key[start+i])];
  return s;
}
/**
 * Viterbi with <=D collision-driven key-skips; exact equality constraint
 * K[j-1]-K[j] == C[i-1]-C[i] mod29, with inverse GP runes P=C-K.
 * @param {number[]} C @param {number} start @param {number} sign
 * @param {boolean} trace
 */
function decode(C,start,sign,trace=false){
  let a=new Float64Array(D+1).fill(-Infinity),b=new Float64Array(D+1);
  a[0]=q[mod(C[0]-sign*key[start])];
  const steps=trace?new Uint8Array(C.length*(D+1)):null;
  for(let i=1;i<C.length;i++){
    b.fill(-Infinity);
    for(let d=0;d<=D;d++){
      const j=start+i+d;
      let best=a[d],skip=0;
      if(d&&C[i]!==C[i-1]&&mod(sign*(key[j-1]-key[j]))===mod(C[i-1]-C[i])){
        const candidate=a[d-1]-PEN;
        if(candidate>best){best=candidate;skip=1;}
      }
      b[d]=best+q[mod(C[i]-sign*key[j])];
      if(steps)steps[i*(D+1)+d]=skip;
    }
    [a,b]=[b,a];
  }
  let score=-Infinity,drift=0;
  for(let d=0;d<=D;d++)if(a[d]>score){score=a[d];drift=d;}
  if(!trace)return {score};
  const used=drift,P=new Array(C.length),skips=[];
  for(let i=C.length-1;i>=0;i--){
    P[i]=mod(C[i]-sign*key[start+i+drift]);
    if(i&&steps[i*(D+1)+drift]){skips.push(i);drift--;}
  }
  assert.equal(drift,0);
  return {score,totalSkips:used,skips:skips.reverse(),plaintext:P,
    transliteration:P.map(v=>corpus.translit[v]).join('')};
}
/** @param {number[]} C @param {boolean} withSkips */
function scan(C,withSkips){
  const best=[];
  for(const sign of [1,-1])for(let start=0;start<W;start++){
    const score=withSkips?decode(C,start,sign).score:direct(C,start,sign);
    if(best.length<4||score>best[best.length-1].score){
      best.push({start,sign,score});best.sort((x,y)=>y.score-x.score);
      if(best.length>4)best.pop();
    }
  }
  return best.map(x=>({...x,...(withSkips?decode(C,x.start,x.sign,true):{})}));
}
/** @param {number} seed */
function random(seed){
  let x=seed>>>0;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};
}
/** @param {number[]} P @param {number} start @param {boolean} filter */
function encrypt(P,start,filter){
  const rand=random(0x33012026),out=[],skips=[];
  let k=start;
  for(let i=0;i<P.length;i++){
    let c=mod(P[i]+key[k++]);
    if(filter&&i&&c===out[i-1]&&rand()<0.85){
      skips.push(i);c=mod(P[i]+key[k++]);
    }
    out.push(c);
  }
  return {out,skips};
}
const P=solved.plaintext.slice(0,251),start=3301;
const plain=encrypt(P,start,false),filtered=encrypt(P,start,true);
const plantDirect=scan(plain.out,false),plantSkip=scan(filtered.out,true);
const trueModel=plantSkip.find(x=>x.start===start&&x.sign===1);
const acc=trueModel?trueModel.plaintext.filter((x,i)=>x===P[i]).length/P.length:null;
assert.ok(plantDirect.some(x=>x.start===start&&x.sign===1));
const chosen=[0,28,42,49,55].map(page=>{
  const C=corpus.pages.find(p=>p.page===page).indices;
  return {page,n:C.length,direct:scan(C,false).slice(0,2),
    skip:scan(C,true).slice(0,2).map(({plaintext,...x})=>x)};
});
console.log(JSON.stringify({model:'LP2 p56 prime-totient additive key with exact one-draw duplicate-collision skips',
  parameters:{keyStartWindow:W,driftLimit:D,skipPenalty:PEN},
  positive:{source:'authentic LP1 p03 rune plaintext withheld from fitted prior',trueStart:start,
    trueKeyInTop4Direct:plantDirect.some(x=>x.start===start&&x.sign===1),
    trueKeyInTop4Skip:Boolean(trueModel),realSkips:filtered.skips,
    recoveredSkips:trueModel?.skips,runeAccuracy:acc,
    directWinner:plantDirect[0].start,skipWinner:plantSkip[0].start},
  real:chosen,interpretation:'scores alone are not recovered keys or plaintext'},null,2));
