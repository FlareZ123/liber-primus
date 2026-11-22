"use strict";

/**
 * The 2014 stage11 trailing-space sequence skips prime 19, which is W
 * in Gematria Primus (GP zero-index 7). A plaintext-transparent W
 * requires W locations at the starts and ends of printed words to
 * survive ANY reversible non-W substitution, independent of the key.
 *
 * Compare original 55 unknown runic pages to all 9 genuine solved-GP
 * text controls and historical themed prose. This is a conditional
 * word-preserving, single-rune-transparency model test.
 *
 * Read-only Node 22 CommonJS SFT. No user input or generated files.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const GP=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const SOLVED=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const signed=read("resources/historical/cicada2014-stage11-message.asc");
const master=read("resources/liber-primus/lp2-transcription.txt");
const runes=new Set(GP.runes);
const W=GP.runes[7];
assert.equal(W,"ᚹ");
assert.equal(GP.prime[7],19);
assert.equal(GP.translit[7],"W");
const tails=signed.split("-----BEGIN PGP SIGNATURE-----")[0]
 .split(/\r?\n/).slice(3)
 .map(s=>(s.match(/ *$/)||[""])[0].length).filter(Boolean);
assert.deepEqual(tails,[2,3,7,11,13,17,23,29,31,37]);
assert.ok(signed.includes("     ky2khlqdf7qdznac.onion"));
const markedPrimes=[2,3,5,7,11,13,17,23,29,31,37];
assert.ok(!markedPrimes.includes(19));
/**
 * Original transcriptions use '-' for a printed word-dot, '.' for a
 * printed full-stop/section mark, '/' for a visual line break, '%' for
 * a page division, and '&' for non-rune page art boundaries.
 * Preserve words across visual line breaks.
 *
 * @param {string[]} sections
 * @returns {string[][]}
 */
function originalWords(sections){
 return sections.flatMap(s=>s.replace(/[\r\n\/]/g,"")
  .split(/[-.&%]+/).map(x=>[...x].filter(g=>runes.has(g)))
  .filter(a=>a.length));
}
/**
 * Known solved GP sections use '•' or other punctuation as separators.
 * @param {string[]} texts
 * @returns {string[][]}
 */
function solvedWords(texts){
 return texts.flatMap(s=>{
  const all=[],current=[];
  for(const ch of s){
   if(runes.has(ch)){current.push(ch);}
   else if(current.length){all.push(current.splice(0));}
  }
  if(current.length)all.push(current.slice());
  return all;
 });
}
/** @param {string[][]} words */
function positions(words){
 const joined=words.flat();
 return {
  words:words.length,runes:joined.length,
  Wstart:words.filter(w=>w[0]===W).length,
  Wend:words.filter(w=>w[w.length-1]===W).length,
  Wall:joined.filter(g=>g===W).length
 };
}
const chunks=master.split("%");
assert.equal(chunks.length,57);
const original=originalWords([chunks.slice(0,-2).join("")]);
const suffix=originalWords([chunks.slice(-2).join("")]);
const native=solvedWords(SOLVED.sections.map(s=>s.source_text));
const sourceIndices=GP.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.deepEqual(original.flat(),sourceIndices.map(i=>GP.runes[i]));
assert.deepEqual(positions(original),
 {words:2896,runes:12956,Wstart:82,Wend:98,Wall:401});
assert.deepEqual(positions(suffix),
 {words:45,runes:180,Wstart:3,Wend:3,Wall:8});
assert.deepEqual(positions(native),
 {words:740,runes:2979,Wstart:79,Wend:8,Wall:98});

/**
 * Exact two-sided Fisher conditional-on-margins test using log
 * combinations, avoiding external statistics libraries and overflow.
 *
 * @param {number} k1
 * @param {number} n1
 * @param {number} k2
 * @param {number} n2
 * @returns {number}
 */
function fisherTwoSided(k1,n1,k2,n2){
 const N=n1+n2, K=k1+k2;
 const lfact=new Float64Array(N+1);
 for(let i=2;i<=N;i++)lfact[i]=lfact[i-1]+Math.log(i);
 const logc=(n,k)=>lfact[n]-lfact[k]-lfact[n-k];
 const lo=Math.max(0,K-n2),hi=Math.min(n1,K);
 const logs=[];
 for(let x=lo;x<=hi;x++)logs.push(
  logc(n1,x)+logc(n2,K-x)-logc(N,K));
 const max=Math.max(...logs);
 const observed=logs[k1-lo];
 const total=logs.reduce((sum,v)=>sum+Math.exp(v-max),0);
 const extreme=logs.reduce((sum,v)=>sum+
  (v<=observed+1e-10?Math.exp(v-max):0),0);
 return extreme/total;
}
const a=positions(original),b=positions(native),sameBook=positions(suffix);
const fisher={
 start:fisherTwoSided(a.Wstart,a.words,b.Wstart,b.words),
 end:fisherTwoSided(a.Wend,a.words,b.Wend,b.words),
 all:fisherTwoSided(a.Wall,a.runes,b.Wall,b.runes)
};
assert.ok(Math.abs(fisher.start-1.156629946706025e-16)<2e-19);
assert.ok(Math.abs(fisher.end-0.0003477568553329069)<1e-7);
assert.ok(Math.abs(fisher.all-0.5994862465158237)<2e-5);
// Construct a genuine one-to-one GP28 substitution excluding W.
// This preserves every W occurrence exactly, independent of the key.
/**
 * @param {string} ch
 * @param {number} shift
 * @returns {string}
 */
function shiftWithTransparentW(ch,shift){
 if(ch===W)return W;
 const i=GP.runes.indexOf(ch);
 assert(i>=0);
 const compressed=i>7?i-1:i;
 const nxt=(compressed+shift%28+28)%28;
 return GP.runes[nxt>=7?nxt+1:nxt];
}
const plant=native.map(w=>w.map(ch=>shiftWithTransparentW(ch,13)));
assert.deepEqual(positions(plant),positions(native));
assert.deepEqual(plant.map(w=>w.map(ch=>shiftWithTransparentW(ch,-13))),native);
assert.notDeepEqual(plant,native);
// Contrast with independent larger English sources, using literal W,
// which has the same plain-letter meaning as the GP W rune.
/** @param {string} p */
function latinPositions(p){
 const words=read(p).toUpperCase().match(/[A-Z]+/g)||[];
 return {source:p,words:words.length,
  Wstart:words.filter(s=>s[0]==="W").length,
  Wend:words.filter(s=>s.endsWith("W")).length};
}
const prose=[
 latinPositions("resources/control/shakespeare_first300k.txt"),
 latinPositions("resources/control/gibran_prophet_58585.txt"),
 latinPositions("resources/control/emerson_essays_2944.txt")
];
assert.deepEqual(prose.map(s=>[s.words,s.Wstart,s.Wend]),
 [[55407,3807,677],[15733,1067,155],[77932,5019,808]]);
const fraction=(x,y)=>+(100*x/y).toFixed(4);
console.log(JSON.stringify({
  source: "2014 PGP stage11 trailing-blank prime list omits 19 (GP W); blanks are not PGP-authenticated",
  cipherWordGroupDefinition:"rune runs separated by source transcribed printed word-dots and section punctuation; visual line wraps are ignored",
  originalUnknown:a,sourceSolvedNative:b,bookendSolvedLP2:sameBook,
  percentages:{
   original:{start:fraction(a.Wstart,a.words),end:fraction(a.Wend,a.words),all:fraction(a.Wall,a.runes)},
   native:{start:fraction(b.Wstart,b.words),end:fraction(b.Wend,b.words),all:fraction(b.Wall,b.runes)}
  },
  exactTwoSidedFisherAgainstNative:fisher,
  unrelatedEnglishControls:prose.map(z=>({
   ...z,startPercent:fraction(z.Wstart,z.words),
   endPercent:fraction(z.Wend,z.words)
  })),
  positiveTransparentWPlantPass:true,
  interpretation:"A W-transparent, word-boundary-preserving native-English LP2 cipher would retain the W boundary positions. The original positions disagree sharply with native controls despite similar total W frequency. This is conditional, not plaintext or a proof against all mechanisms."
},null,2));
