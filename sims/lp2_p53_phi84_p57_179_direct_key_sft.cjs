"use strict";
/**
 * One source-exact p53 179-rune original-input key transfer.
 *
 * The 85 independently solved p56 GP runes have one literal Fehu at local56
 * that holds the prime-totient clock, giving 84 actual key shifts. The clear
 * p57 has 95 runes. 84+95=179 equals preceding p53's original GP rune count.
 *
 * Hypothesis, NOT author authenticated: concatenate the source p56 active
 * totient shifts and the clear p57 rune indices as one literal 179-rune
 * GP29 additive key, subtract it from p53 in original physical order.
 * There are no variable phases, resets, F skips on p53, or tuned scales.
 *
 * Prints full candidate and native-GP language control scores and checks
 * genuine p56 solved plaintext and a complete native-GP positive plant.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(ROOT,p),"utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const page = n => corpus.pages.find(p => p.page===n).indices;
const mod = v => ((v%29)+29)%29;

/** @param {number} count @returns {number[]} */
function primes(count) {
  const result=[];
  for(let n=2;result.length<count;n++) {
    let prime=true;
    for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break;}
    if(prime)result.push(n);
  }
  return result;
}

/** Literal solved-p56 original spellings, no editorial correction. */
function gp(words) {
  const tok=corpus.translit.map((value,index)=>({value,index}))
    .sort((a,b)=>b.value.length-a.value.length);
  const result=[];
  for(const word of words.split(" ")) for(let i=0;i<word.length;) {
    const match=tok.find(x=>word.startsWith(x.value,i));
    assert(match);
    result.push(match.index);
    i+=match.value.length;
  }
  return result;
}
const p56Expected = gp(
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO " +
  "IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
const p56=page(56),p57=page(57),p53=page(53);
assert.deepEqual([p53.length,p56.length,p57.length],[179,85,95]);
const p56Primes=primes(84);
const activeKey=p56Primes.map(p=>mod(p-1));
let clock=0;
const p56Decoded=p56.map((c,i)=>{
  if(i===56){assert.equal(c,0);return 0;}
  return mod(c-activeKey[clock++]);
});
assert.equal(clock,84);
assert.deepEqual(p56Decoded,p56Expected);
const key=[...activeKey,...p57];
assert.equal(key.length,p53.length);
const decoder = c=>c.map((x,i)=>mod(x-key[i]));
const encoder = p=>p.map((x,i)=>mod(x+key[i]));
const original=decoder(p53);
assert.deepEqual(encoder(original),p53);
const tokenize={};
corpus.translit.forEach((value,i)=>tokenize[value]=i);
function nativeGP(text) {
  const s=text.toUpperCase().replace(/V/g,"U").replace(/K/g,"C")
    .replace(/Q/g,"C").replace(/Z/g,"S");
  const out=[];
  for(let i=0;i<s.length;i++) {
    if(!/[A-Z]/.test(s[i]))continue;
    if(s.slice(i,i+3)==="ING") {
      out.push(tokenize.NG);i+=2;continue;
    }
    const pair=s.slice(i,i+2);
    if(Object.hasOwn(tokenize,pair)){out.push(tokenize[pair]);i++;continue;}
    if(Object.hasOwn(tokenize,s[i]))out.push(tokenize[s[i]]);
  }
  return out;
}
const source=nativeGP(read("resources/control/shakespeare_first300k.txt"));
assert.equal(source.length,217644);
const bi=new Uint32Array(29*29),tri=new Uint32Array(29*29*29);
for(let i=1;i<source.length;i++) {
  bi[source[i-1]*29+source[i]]++;
  if(i>=2)tri[(source[i-2]*29+source[i-1])*29+source[i]]++;
}
/** @param {number[]} values @returns {number} */
function score(values) {
  let sum=0;
  for(let i=2;i<values.length;i++) {
    const preceding=values[i-2]*29+values[i-1];
    sum+=Math.log((tri[preceding*29+values[i]]+0.1)/
      (bi[preceding]+2.9));
  }
  return sum/(values.length-2);
}
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const count=new Uint16Array(29);
  for(const x of values)count[x]++;
  return count.reduce((s,n)=>s+n*(n-1),0)/
    (values.length*(values.length-1));
}
const controls=[];
for(let start=0;start+179<=source.length;start+=179)
  controls.push(score(source.slice(start,start+179)));
controls.sort((a,b)=>a-b);
const plant=source.slice(5000,5179);
assert.deepEqual(decoder(encoder(plant)),plant);
const scored={originalRaw:score(p53),originalDecoded:score(original),
  originalIoC:ioc(p53),decodedIoC:ioc(original),
  nativeMinimum:controls[0],nativeMedian:controls[Math.floor(controls.length/2)],
  nativeMaximum:controls.at(-1),
  nativeWindows:controls.length,
  nativeAtOrBelowCandidate:controls.filter(v=>v<=score(original)).length};
assert.equal(scored.nativeAtOrBelowCandidate,0);
assert(scored.originalDecoded<scored.originalRaw);
const summary={
  status:"REJECT direct 84+95 source-key transfer on original p53",
  completeRunes:179,
  p56PrimeClockConsumed:84,
  p56GenuinePlaintextMatches:85,
  p57ClearRunes:95,
  fullOriginalRecipherPositions:179,
  nativeGPPlantRecovered:179,
  scores:scored,
  originalDecodedGP:original.map(v=>corpus.translit[v]).join("")
};
console.log(JSON.stringify(summary,null,2));
