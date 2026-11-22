'use strict';
/**
 * Key-independent parity obstruction for 28-symbol predecessor-excluding
 * GP transducers driven by p_n-1 or p_n modulo 28.
 *
 * The genuine solved p56 uses prime-totient (p_n-1) modulo 29.
 * This evaluates the distinctly proposed rank-28 extension intended
 * to account for 86 immediate doubles across unsolved LP2.
 *
 * Run: node sims/prime_totient_rank28_parity_invariant.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {encode}=require('./grid_keyskip_viterbi.cjs');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const GP=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const wordwise=text=>(text.toUpperCase().match(/[A-Z]+/g)||[])
  .flatMap(word=>encode(word));
const english=wordwise(read('resources/control/shakespeare_first300k.txt'));
const solved=wordwise(read('resources/liber-primus/lp1-plaintext-reference.txt')
  .replace(/^\s*#.*$/gm,''));
const pages=GP.pages.filter(p=>p.page<56&&p.indices.length);
assert.equal(pages.length,55);
assert.equal(pages.reduce((s,p)=>s+p.indices.length,0),12956);
const mod=n=>(n%29+29)%29;
const power=[], log=Array(29).fill(-1);
for(let x=1,i=0;i<28;i++,x=x*15%29){
  power.push(x);log[x]=i;
}
assert.equal(new Set(power).size,28);
/** @param {number[][]} arrays */
function measure(arrays){
  let steps=0,repeat=0;
  const even={cyclic:0,fieldPower:0},odd={cyclic:0,fieldPower:0};
  for(const seq of arrays){
    for(let i=1;i<seq.length;i++){
      const delta=mod(seq[i]-seq[i-1]);
      if(delta===0){repeat++;continue;}
      steps++;
      const cyc=delta-1, field=log[delta];
      assert.ok(field>=0);
      if(cyc%2===0)even.cyclic++;else odd.cyclic++;
      if(field%2===0)even.fieldPower++;else odd.fieldPower++;
    }
  }
  assert.equal(steps+repeat,12901);
  return {steps,repeat,even,odd};
}
/** @param {number[]} source @param {number} size */
function windowCounts(source,size){
  const plain=source.filter(x=>x<28);
  assert.ok(plain.length>size+1);
  let even=0,min=Infinity,max=0,minAt=-1,below=0;
  for(let i=0;i<size;i++)even+=Number(plain[i]%2===0);
  for(let start=0;start+size<=plain.length;start++){
    if(even<min){min=even;minAt=start;}
    max=Math.max(max,even);
    if(start+size<plain.length){
      even-=Number(plain[start]%2===0);
      even+=Number(plain[start+size]%2===0);
    }
  }
  return {runes:plain.length,windows:plain.length-size+1,
    minEven:min,maxEven:max,minAt};
}
/** @param {number} count */
function primes(count){
  const limit=400000,composite=new Uint8Array(limit+1),out=[];
  for(let p=2;p<=limit&&out.length<count;p++){
    if(composite[p])continue;
    out.push(p);
    if(p*p<=limit)for(let q=p*p;q<=limit;q+=p)composite[q]=1;
  }
  assert.equal(out.length,count);
  return out;
}
/**
 * Explicit native-GP forward/undo witness. EA 28 repeats, every other
 * letter is mapped bijectively through a nonzero 28-rank.
 * @param {'cyclic'|'fieldPower'} scheme
 * @param {number} primeStart
 */
function plant(scheme,primeStart){
  const source=english.slice(26000);
  const ps=primes(primeStart+Math.max(...pages.map(p=>p.indices.length))+3);
  const sample=[],expected=[];
  let at=0;
  for(const page of pages){
    const sourcePage=source.slice(at,at+page.indices.length);
    assert.equal(sourcePage.length,page.indices.length);
    at+=page.indices.length;
    let prev=Number(BigInt(page.page+3)*17n%29n);
    const cipher=[prev], plain=[sourcePage[0]];
    let k=primeStart;
    for(let i=1;i<sourcePage.length;i++){
      const x=sourcePage[i];
      const primeShift=ps[k++]-1;
      const rank=(x+primeShift)%28;
      const c=x===28?prev:scheme==='cyclic'?
        mod(prev+rank+1):mod(prev+power[rank]);
      cipher.push(c);
      plain.push(x);
      const difference=mod(c-prev);
      const decoded=difference===0?28:mod28(
        (scheme==='cyclic'?difference-1:log[difference])-primeShift);
      assert.equal(decoded,x);
      prev=c;
    }
    sample.push(cipher);
    expected.push(plain);
  }
  return {runes:sample.reduce((s,p)=>s+p.length,0),
    decoded:expected.reduce((s,p)=>s+p.length-1,0),
    keyStart:primeStart,parity:measure(sample)};
}
/** @param {number} x */
const mod28=x=>(x%28+28)%28;
function main(){
  const original=measure(pages.map(p=>p.indices));
  assert.deepEqual([original.steps,original.repeat],[12815,86]);
  assert.deepEqual(original.even,{cyclic:6495,fieldPower:6426});
  const reference=windowCounts(english,original.steps);
  const native=solved.filter(x=>x<28);
  const nativeEven=native.filter(x=>x%2===0).length;
  const exceptions=pages.length; // overgenerous odd first-prime stage per page
  const bound=Object.fromEntries(Object.keys(original.even).map(k=>{
    const best=Math.max(original.even[k],original.odd[k])+exceptions;
    return [k,{parityBestWithAll55OddStages:best,
      minSourceEven:reference.minEven,
      exactSourceWindowMatches:best>=reference.minEven?undefined:0,
      deficit:reference.minEven-best}];
  }));
  assert.deepEqual([reference.runes,reference.windows,
    reference.minEven,reference.maxEven],[217167,204353,6847,7511]);
  assert.ok(Object.values(bound).every(x=>x.deficit>0));
  const positive=[plant('cyclic',0),plant('fieldPower',79)];
  assert.equal(positive.length,2);
  const result={model:'p_n-1 (and p_n) mod28, with GF29 nonzero-rank output',
    fact:'every odd prime has even p_n-1; p_1=2 is the sole exception',
    cipherPages:pages.length,original,reference,
    sourceNative:{nonEA:native.length,even:nativeEven,
      fractionEven:nativeEven/native.length},
    exceptionalPrime2PositionsAtMost:exceptions,
    bound,positive,
    conclusion:'The original cyclic/15-power 28-rank direct GP-ordinal versions cannot match any contiguous source Shakespeare GP parity window, even granting one odd first-prime correction per page. The exclusion requires fixed original GP symbol ordinals and the declared EA repeat symbol.'};
  console.log(JSON.stringify(result,null,2));
}
if(require.main===module)main();
module.exports={measure,windowCounts,plant,main};
