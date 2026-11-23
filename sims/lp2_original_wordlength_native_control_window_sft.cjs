"use strict";
/**
 * Original LP2 whole-word length control versus untouched source-native GP29
 * and independent English converted to GP29 with frozen historical digraphs.
 * Node.js 22 CommonJS, no external packages.
 */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const get=p=>fs.readFileSync(path.join(root,p),"utf8");
const cp=JSON.parse(get("resources/liber-primus/lp2-corpus.json"));
const solved=JSON.parse(get("resources/external/relikd-solved-gp29-native-v1.json"));
const manuscript=get("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0,55).join("%");
const runeSet=new Set(cp.runes);
const gpTokens=cp.translit.slice().sort((a,b)=>b.length-a.length);
function runicLengths(t) {
  const out=[];let current=0;
  for(const c of t){
    if(runeSet.has(c))current++;
    else if(c==="%"||c==="/"||/\s/u.test(c)){}
    else if(current){out.push(current);current=0}
  }
  if(current)out.push(current);
  return out;
}
function latinGpLength(word) {
  let w=word.toUpperCase()
    .replace(/ING/g,"NG").replace(/IO/g,"IA")
    .replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  let n=0;
  while(w){
    const gp=gpTokens.find(t=>w.startsWith(t));
    if(!gp)return null;
    w=w.slice(gp.length);n++;
  }
  return n;
}
function latinLengths(t) {
  return (t.match(/[a-z]+/gi)||[])
    .map(latinGpLength).filter(Number.isInteger);
}
const original=runicLengths(manuscript),N=original.length,
  originalTwo=original.filter(x=>x===2).length;
assert.equal(N,2896);
assert.equal(original.reduce((a,b)=>a+b,0),12956);
assert.equal(originalTwo,448);
const native=solved.sections.flatMap(s=>runicLengths(s.source_text));
const nativeTwo=native.filter(x=>x===2).length;
assert.equal(native.length,733);
assert.equal(nativeTwo,178);
function scan(lengths) {
  assert(lengths.length>=N);
  let two=0,best=Infinity,worst=0,bestStart=-1,atOrBelow=0;
  for(let j=0;j<N;j++)two+=+(lengths[j]===2);
  for(let end=N;end<=lengths.length;end++){
    if(two<best){best=two;bestStart=end-N}
    worst=Math.max(worst,two);
    if(two<=originalTwo)atOrBelow++;
    if(end<lengths.length){
      two-=+(lengths[end-N]===2);
      two+=+(lengths[end]===2);
    }
  }
  return {referenceWords:lengths.length,contiguous2896WordWindows:lengths.length-N+1,
    minimumTwoRuneWords:best,maximumTwoRuneWords:worst,
    minimumFraction:best/N,minimumWindowStart:bestStart,
    atOrBelowOriginal:atOrBelow};
}
const controls=[
  ["Gibran, The Prophet","resources/control/gibran_prophet_58585.txt"],
  ["Emerson, Essays","resources/control/emerson_essays_2944.txt"],
  ["Shakespeare, first 300k","resources/control/shakespeare_first300k.txt"]
].map(([name,p])=>({name,...scan(latinLengths(get(p)))}));
assert.deepEqual(controls.map(x=>x.minimumTwoRuneWords),[612,711,527]);
assert.deepEqual(controls.map(x=>x.contiguous2896WordWindows),[12838,75037,52512]);
assert(controls.every(x=>x.atOrBelowOriginal===0));
console.log(JSON.stringify({
 status:"PASS",interpretation:"Empirical source-conditional word-length register, not proof of moved spaces",
 original:{cipherRunes:12956,printedCompleteWords:N,twoRuneWords:originalTwo,
    twoRuneFraction:originalTwo/N,meanRuneLength:12956/N},
 genuineSolvedReference:{nativeWords:native.length,twoRuneWords:nativeTwo,
    twoRuneFraction:nativeTwo/native.length},
 independentControls:controls,
 totalOverlappingControlWindows:controls.reduce((s,z)=>s+z.contiguous2896WordWindows,0),
 note:"Longer content, Latin GP normalized with ING→NG, IO→IA, QU→CW, V→U, K/Q→C, Z→S. Dependence among overlapping windows; unusual register or other language may yield different results."
},null,2));
