"use strict";

/**
 * Issue #2438, Agent43: one complete GP29 page-carry feedback
 * inversion and exact same-carry-sum two-time-pad original holdout.
 * Read-only, Node.js 22 CommonJS; input entirely from repo resources.
 *
 * Scope: a source-motivated conditional cipher construction. The
 * original author never specified this update or this key consumer.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {parseSharedCorpus,physicalLP2Page}=require("./lp2_word_pages.cjs");
const root=path.resolve(__dirname,"..");
const gp=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const runes=new Map(gp.runes.map((c,i)=>[c,i]));
const mod=x=>((x%29)+29)%29;
const parsed=parseSharedCorpus();
assert.equal(parsed.runeCount,12956);
assert.equal(parsed.words.length,2896);
assert.equal(parsed.crossPageWords,32);
const original=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(original.length,12956);
assert.deepEqual(parsed.words.flatMap(w=>[...w.runes].map(c=>runes.get(c))),original);

/** @param {number[]} values @returns {number} */
function ioc(values){
 const cnt=new Array(29).fill(0);
 for(const x of values)cnt[x]++;
 return cnt.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
const carries=parsed.words.filter(w=>w.startPage!==w.endPage).map(w=>{
 const tokens=[...w.runes].map(c=>runes.get(c));
 const total=tokens.reduce((a,n)=>a+gp.prime[n],0);
 const first=physicalLP2Page(w.startPage),next=physicalLP2Page(w.endPage);
 assert.equal(next,first+1);
 return {first,next,word:tokens,length:tokens.length,sum:total,residue:mod(total)};
});
assert.equal(carries.length,32);
assert.deepEqual(carries.map(w=>w.next),[1,2,4,5,6,7,9,10,17,19,20,22,
 24,25,26,28,30,32,34,36,41,42,43,44,45,46,47,48,49,52,53,55]);
const stateUpdate=new Map(carries.map(w=>[w.next,w.residue]));

/**
 * A single complete reversible, source-shaped *proposed* law.
 * GP prime sum of whole printed word crossing a page turn
 * increments GP29 additive page state. Other turns preserve state.
 * Ciphertext feedback makes this distinct from a page Caesar:
 *   C_i = P_i + C_(i-1) + K_page (mod29).
 * K_0=13 is the printed p0 thirteen-dot initial operand.
 * This is a frozen hypothesis, not an authenticated author instruction.
 * @param {number[][]} pages
 * @param {number} initialState
 * @param {"decrypt"|"encrypt"} operation
 * @returns {number[][]}
 */
function operate(pages,initialState,operation){
 let state=mod(initialState),previousCipher=0;
 return pages.map((values,p)=>{
  if(stateUpdate.has(p))state=mod(state+stateUpdate.get(p));
  return values.map(v=>{
   const out=operation==="decrypt"?mod(v-previousCipher-state):
      mod(v+previousCipher+state);
   previousCipher=operation==="decrypt"?v:out;
   return out;
  });
 });
}
const cipherPages=gp.pages.filter(p=>p.page<=55).map(p=>p.indices);
const decoded=operate(cipherPages,13,"decrypt");
assert.deepEqual(operate(decoded,13,"encrypt"),cipherPages);
assert.equal(decoded.flat().length,12956);
const train=decoded.slice(16,22).flat(),hold=decoded.slice(40,54).flat();
assert.equal(train.length,1613);
assert.equal(hold.length,3008);
const trainIoC=ioc(train),holdIoC=ioc(hold);
assert(Math.abs(trainIoC-0.034689457094112815)<1e-12);
assert(Math.abs(holdIoC-0.034467448294405255)<1e-12);
for(let seed=0;seed<29;seed++){
 const alternative=operate(cipherPages,seed,"decrypt");
 assert.equal(ioc(alternative.slice(16,22).flat()),trainIoC);
 assert.equal(ioc(alternative.slice(40,54).flat()),holdIoC);
}
// Independent positive, 95 real readable GP symbols from solved p57.
const solved=gp.pages[57].indices;
assert.equal(solved.length,95);
let cipherPrev=0;
const plant=solved.map(p=>{const c=mod(p+cipherPrev+13);cipherPrev=c;return c});
let recoverPrev=0;
const recovered=plant.map(c=>{const p=mod(c-recoverPrev-13);recoverPrev=c;return p});
assert.deepEqual(recovered,solved);
assert.deepEqual(solved.map(i=>gp.runes[i]).join(""),gp.pages[57].indices.map(i=>gp.runes[i]).join(""));
console.log("FROZEN source carry feedback: p16–21 IoC",trainIoC,
 "independent p40–53 IoC",holdIoC,"solved-p57 native plant 95/95");
console.log("pp16–21 first80:",train.slice(0,80).map(x=>gp.translit[x]).join(" "));
console.log("pp40–53 first80:",hold.slice(0,80).map(x=>gp.translit[x]).join(" "));

/* If each complete carried word's exact Gematria-prime sum seeds
 * a deterministic page keystream, the only repeated *full sum*
 * source values select original page pairs p7/p20 and p22/p47.
 * A shared additive keystream forces equality of ciphertext symbols
 * at aligned offsets precisely where underlying plaintext runes agree.
 * No unknown key, offset, word-boundary shuffle or phase is fitted. */
const bySum=new Map();
for(const w of carries){
 if(!bySum.has(w.sum))bySum.set(w.sum,[]);
 bySum.get(w.sum).push(w.next);
}
const pairs=Array.from(bySum).filter(([,pages])=>pages.length>1)
 .map(([sum,pages])=>({sum,pages})).sort((a,b)=>a.sum-b.sum);
assert.deepEqual(pairs,[{sum:155,pages:[7,20]},{sum:632,pages:[22,47]}]);
const pairEquality=pairs.map(({sum,pages})=>{
 const a=gp.pages[pages[0]].indices,b=gp.pages[pages[1]].indices,
  n=Math.min(a.length,b.length);
 const equal=a.slice(0,n).filter((c,i)=>c===b[i]).length;
 return {sum,pages,n,equal};
});
assert.deepEqual(pairEquality,[
 {sum:155,pages:[7,20],n:208,equal:10},
 {sum:632,pages:[22,47],n:131,equal:2}
]);

// Independent native GP29 English controls, using conventional
// transliteration's published C/V/K/Q/Z and ING/IO conventions.
const spell=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} w @returns {number[]} */
function gpWord(w){
 const s=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
  .replace(/[KQ]/g,"C").replace(/Z/g,"S");
 const out=[];
 for(let i=0;i<s.length;){
  if(s.startsWith("ING",i)){out.push(21);i+=3}
  else if(s.startsWith("IO",i)){out.push(27);i+=2}
  else{
   const z=spell.find(t=>s.startsWith(t.s,i));
   assert(z,"unmappable native word: "+w);
   out.push(z.i);i+=z.s.length;
  }
 }
 return out;
}
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const native=s=>(s.match(/[A-Za-z]+/g)||[]).flatMap(gpWord);
const textA=native(read("resources/control/gibran_prophet_58585.txt"));
const textB=native(read("resources/control/shakespeare_first300k.txt"));
assert(textA.length>50000&&textB.length>200000);
let seed=0x33012014;
/** @returns {number} */
function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32}
const lengths=pairEquality.map(p=>p.n);
const originalEqual=pairEquality.reduce((s,p)=>s+p.equal,0);
const trials=10000;
let low=0,hitSum=0;
for(let t=0;t<trials;t++){
 let hits=0;
 for(const n of lengths){
  const i=Math.floor(rnd()*(textA.length-n));
  const j=Math.floor(rnd()*(textB.length-n));
  for(let k=0;k<n;k++)if(textA[i+k]===textB[j+k])hits++;
 }
 if(hits<=originalEqual)low++;
 hitSum+=hits;
}
console.log(JSON.stringify({pairEquality,sourceTotal:originalEqual,
 nativeGPSource:"Gibran vs Shakespeare",sourceRunes:[textA.length,textB.length],
 nativeMeanEqual:hitSum/trials,nativeLowerTail:low/trials,trials}));
console.log("PASS: exact 32 original carries and two original same-sum pairs; 29 IVs, original forward replay and native solved GP control. No original plaintext recovered.");
