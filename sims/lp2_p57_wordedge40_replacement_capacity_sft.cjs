'use strict';
/**
 * Exact 2015-p0 40-event replacement-only all-key GP29 index-of-coincidence
 * bound and p57's 40 removed word-edge rune key. Read-only Node.js 22 SFT.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const wordsSource=read('resources/liber-primus/lp2-transcription.txt').split('%').at(-1);
const runeMap=new Map(corpus.runes.map((r,i)=>[r,i]));
const words=[];let buf=[];
for(const ch of [...wordsSource]){
  if(runeMap.has(ch))buf.push(runeMap.get(ch));
  else if('-.$&§'.includes(ch)&&buf.length){words.push(buf);buf=[];}
}
if(buf.length)words.push(buf);
assert.equal(words.length,20);
assert.deepEqual(words.flat(),corpus.pages[57].indices);
const edgeKey=words.flatMap(w=>[w[0],w.at(-1)]);
assert.equal(edgeKey.length,40);
const inner=words.flatMap(w=>w.slice(1,-1));
assert.equal(inner.length,55);
const original=corpus.pages.slice(0,3).flatMap(p=>p.indices);
assert.deepEqual(corpus.pages.slice(0,3).map(p=>p.indices.length),[262,266,201]);
assert.equal(original.length,729);
const primes=[],comp=new Uint8Array(10000);
for(let p=2;primes.length<730;p++){
  if(comp[p])continue;
  primes.push(p);
  if(p*p<comp.length)for(let k=p*p;k<comp.length;k+=p)comp[k]=1;
}
const mod=n=>(n%29+29)%29;
let shiftedPrevious=mod(-2);
const D=original.map((c,i)=>{
  const shifted=mod(c-primes[i+1]);
  const step=mod(shifted-shiftedPrevious);
  shiftedPrevious=shifted;
  return step;
});
const E=D.map((v,i)=>i===0?v:mod(v-D[i-1]));
const events=[];
for(let i=1;i<D.length;i++)if(D[i]===D[i-1])events.push(i);
assert.equal(events.length,40);
assert.equal(D.filter((v,i)=>i>0&&v===D[i-1]).length,40);
assert.equal(E.filter((v,i)=>i>0&&v===0).length,40);
assert.equal(events[0],9);
assert.equal(events.at(-1),724);
const ioc=arr=>{
  const f=new Uint32Array(29);
  arr.forEach(x=>f[x]++);
  return f.reduce((s,x)=>s+x*(x-1),0)/(arr.length*(arr.length-1));
};
const eventSet=new Set(events);
function completeKeyUpper(arr){
  assert.equal(arr.length,729);
  const fixed=new Uint32Array(29);
  arr.forEach((r,i)=>{if(!eventSet.has(i))fixed[r]++;});
  assert.equal(fixed.reduce((s,x)=>s+x,0),689);
  const chosen=fixed.indexOf(Math.max(...fixed));
  // Convexity: shifting any free occurrence from a less populated bin to
  // the currently largest bin never decreases sum freq*(freq-1).
  const planted=arr.slice();
  events.forEach(i=>{planted[i]=chosen;});
  const upper=ioc(planted);
  const freq=new Uint32Array(29);
  planted.forEach(x=>freq[x]++);
  const direct=freq.reduce((s,n)=>s+n*(n-1),0)/(729*728);
  assert.equal(upper,direct);
  let pseudo=0x3301a55;
  for(let t=0;t<1000;t++){
    const perm=arr.slice();
    for(const index of events){
      pseudo^=pseudo<<13; pseudo^=pseudo>>>17; pseudo^=pseudo<<5;
      perm[index]=(pseudo>>>0)%29;
    }
    assert.ok(ioc(perm)<=upper);
  }
  return {fixed:689,free:40,sourceIOC:ioc(arr),
    bestAssignedRune:corpus.translit[chosen],
    maximumPossibleReplacementOnlyIOC:upper};
}
const maxC=completeKeyUpper(original);
const maxD=completeKeyUpper(D);
const maxE=completeKeyUpper(E);
assert.equal(maxC.maximumPossibleReplacementOnlyIOC,0.038299492003195705);
assert.equal(maxD.maximumPossibleReplacementOnlyIOC,0.038623584919881215);
assert.equal(maxE.maximumPossibleReplacementOnlyIOC,0.03992749363119733);
const clearP57=ioc(corpus.pages[57].indices);
assert.equal(clearP57,0.06270996640537514);
assert.ok([maxC,maxD,maxE].every(x=>x.maximumPossibleReplacementOnlyIOC<0.04));
const shifted=events.map((site,i)=>mod(D[site]+edgeKey[i]));
const output=shifted.map(x=>corpus.translit[x]).join(' ');
const sourceKeyOrders=[
  {name:'left-right',runes:edgeKey},
  {name:'firsts-lasts',runes:words.map(w=>w[0]).concat(words.map(w=>w.at(-1)))}
];
const native=Array.from({length:729},(_,i)=>corpus.pages[57].indices[i%95]);
const fullTapeVariants=[];
for(const register of [{name:'C',data:original},{name:'D',data:D},{name:'E',data:E}]){
  for(const sourceKey of sourceKeyOrders){
    for(const numeral of ['ordinal','prime']){
      for(const sign of [-1,1]){
        const pad=sourceKey.runes.map(r=>numeral==='ordinal'?r:corpus.prime[r]);
        const inverse=register.data.map((c,i)=>mod(c+sign*pad[i%40]));
        const synthetic=native.map((p,i)=>mod(p-sign*pad[i%40]));
        assert.deepEqual(synthetic.map((c,i)=>mod(c+sign*pad[i%40])),native);
        assert.deepEqual(inverse.map((p,i)=>mod(p-sign*pad[i%40])),register.data);
        fullTapeVariants.push({register:register.name,keyOrder:sourceKey.name,numeral,
          sign,ioc:ioc(inverse),first80:inverse.slice(0,80)
            .map(r=>corpus.translit[r]).join('')});
      }
    }
  }
}
assert.equal(fullTapeVariants.length,24);
fullTapeVariants.sort((a,b)=>b.ioc-a.ioc);
assert.equal(fullTapeVariants[0].ioc,0.03522437781697041);
assert.ok(fullTapeVariants.every(x=>x.ioc<0.04));

console.log(JSON.stringify({
  source:'original pp0–2 and solved p57: 20 printed words, 40 word-edge runes',
  historical:'2015 first prime-difference yields precisely 40 doublet event slots',
  theorem:'any replacement of exactly those 40 runes only, with all 689 others unchanged, cannot produce GP29 IoC >= 0.04',
  p57ClearIOC:clearP57,
  firstAndLastEvent:[events[0],events.at(-1)],
  direct40ValuePlusP57EdgeReadout:output,
  direct40TextIsNotPlaintext:true,
  repeated40KeyFullTape:{tested:24,best:fullTapeVariants[0],maxIOC:fullTapeVariants[0].ioc},
  bounds:{printed:maxC,first2015Difference:maxD,second2015Difference:maxE},
  decision:'40-to-40 edge-key event replacement cannot itself recover 729-rune native-GP plaintext; another independently selected transformation would be required'
},null,2));
