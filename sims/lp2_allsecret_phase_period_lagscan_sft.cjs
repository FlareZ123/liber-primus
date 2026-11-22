'use strict';
/**
 * Blind search for a portable secret periodic GP29 substitution clock:
 * C[i] = sigma[i%P](plaintext[i]), arbitrary unknown bijective sigma.
 * Then C[i] === C[i+P] iff plaintext[i] === plaintext[i+P].
 * The scan tests all possible P in [6, 4096] without searching keys.
 * Familywise shuffled-position maxima and a 729-phase native GP plant
 * are fixed before scoring original stream.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'));
const input=corpus.pages.slice(0,56).flatMap(p=>p.indices);
assert.equal(input.length,12956);
const lp1=fs.readFileSync(path.join(__dirname,'../resources/transcriptions/lp1_wulfic_canonical.txt'),'utf8').split('%');
const map=new Map(corpus.runes.map((r,i)=>[r,i]));
const native=[3,8,9,10,11,14].flatMap(i=>[...lp1[i]].filter(ch=>map.has(ch)).map(ch=>map.get(ch))).concat(corpus.pages[57].indices);
assert.equal(native.length,1096);
const MAX=4096,MIN=6;
let rng=0x20143301;
/** @returns {number} */
function draw(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;}
/**
 * @param {number[]} values
 * @returns {number}
 */
function baseline(values){
  const hist=new Uint32Array(29);
  values.forEach(x=>hist[x]++);
  return hist.reduce((a,n)=>a+n*(n-1),0)/(values.length*(values.length-1));
}
/**
 * @param {number[]} values
 * @param {number} p
 * @returns {{period:number,matches:number,expected:number,z:number}}
 */
function lag(values,p){
  let n=0;
  const total=values.length-p;
  for(let i=0;i<total;i++)n+=(values[i]===values[i+p]);
  const base=baselineValue;
  const mean=total*base;
  const z=(n-mean)/Math.sqrt(total*base*(1-base));
  return {period:p,matches:n,expected:mean,z};
}
/**
 * @param {number[]} values
 * @returns {{period:number,matches:number,expected:number,z:number}[]}
 */
function scan(values){
  const top=[];
  for(let p=MIN;p<=MAX;p++){
    const hit=lag(values,p);
    if(top.length<12){top.push(hit);top.sort((a,b)=>b.z-a.z);}
    else if(hit.z>top[11].z){top[11]=hit;top.sort((a,b)=>b.z-a.z);}
  }
  return top;
}
const baselineValue=baseline(input);
const scanOriginal=scan(input);
const periods=[49,76,95,121,243,256,729,1033,3301].map(p=>lag(input,p));
const countNull=32,nullMax=[];
for(let t=0;t<countNull;t++){
  const permutation=input.slice();
  for(let i=permutation.length-1;i>0;i--){
    const j=draw()%(i+1);
    [permutation[i],permutation[j]]=[permutation[j],permutation[i]];
  }
  nullMax.push(scan(permutation)[0].z);
}
const maxOriginal=scanOriginal[0].z;
const pEmpirical=(nullMax.filter(z=>z>=maxOriginal).length+1)/(countNull+1);
// Native-GP independent-position positive, encrypted by 729 arbitrary secret
// permutations, so exact shifted equality at 729 must survive encryption.
const donor=Array.from({length:input.length},()=>native[draw()%native.length]);
const secret=Array.from({length:729},()=>{
  const seq=Array.from({length:29},(_,i)=>i);
  for(let i=28;i>0;i--){const j=draw()%(i+1);[seq[i],seq[j]]=[seq[j],seq[i]];}
  return seq;
});
const planted=donor.map((x,i)=>secret[i%729][x]);
const positiveLag=lag(planted,729);
let direct=0;
for(let i=0;i<planted.length-729;i++){
  assert.equal(planted[i]===planted[i+729],donor[i]===donor[i+729]);
  direct+=(donor[i]===donor[i+729]);
}
assert.equal(positiveLag.matches,direct);
assert(positiveLag.z>5,'Native-GP secret periodic plant must give strong true 729-lag signal');
console.log(JSON.stringify({
  model:'All-secret bijective GP29 substitution with single continuous repeating phase clock',
  original_runes:input.length,p_min:MIN,p_max:MAX,
  original_empirical_baseline:baselineValue,
  top_original:scanOriginal,author_number_periods:periods,
  native_729_periodic_plant:positiveLag,
  familywise_shuffle_max_32:nullMax,
  familywise_plus_one_p:pEmpirical,
  caution:'A lack of peaks excludes only this stationary whole-book periodic-bijection class under ordinary native-GP plaintext. It does not test per-page resets, ciphertext-dependent updates, or external pads.'
},null,2));
