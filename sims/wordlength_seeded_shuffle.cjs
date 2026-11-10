"use strict";
/**
 * Clue-seeded whole-word shuffle inversion using only visible LP2 word lengths.
 *
 * Tests whether English source word order was hidden by a seeded Fisher-Yates
 * permutation inside each of the eight substantive LP2 sections, after the
 * verified red title. Unlike rune-key searches, the test requires no guess
 * about the later rune substitution, pad or alphabet.
 *
 * Runtime: Node.js 22; node sims/wordlength_seeded_shuffle.cjs
 * Inputs: pinned canonical master, independent Shakespeare GP reference.
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {parseMaster,englishWords,runeLength}=require("./wordlength_crib_scan.js");

const ROOT=path.resolve(__dirname,"..");
const read=relative=>fs.readFileSync(path.join(ROOT,relative),"utf8");
const TITLE_WORDS=[2,3,2,3,4,3,2,2];
const TOTAL_SEEDS=4096;
const ENGINES=["lcg","xorshift"];
const MODES=["same","increment","stream"];
const NULL_TRIALS=24;
const CATS=3;
const isRune=c=>c>="\u16A0"&&c<="\u16FF";

/** @returns {number[][]} Eight original section-body rune-word-length lists. */
function manuscriptBodies(){
  const original=read("resources/transcriptions/liber_primus_master.txt");
  assert.deepEqual(parseMaster(original).cipherLengths.length,2896);
  const first=original.indexOf("ᛋᚻᛖᚩᚷ");
  assert.ok(first>=0);
  const unsolved=original.slice(first).split("%").slice(0,56).join("%");
  const sections=unsolved.split("$")
    .map(text=>text.replace(/[\s/%]/g,"").match(/[\u16A0-\u16FF]+/gu)||[])
    .filter(words=>words.length);
  assert.deepEqual(sections.map(words=>words.length),[158,255,383,2,435,224,349,355,735]);
  assert.equal(sections.reduce((n,x)=>n+x.reduce((m,w)=>m+w.length,0),0),12956);
  const merged=[sections[0],sections[1],sections[2],
    sections[4],sections[5],sections[6],sections[7],sections[8]];
  const bodies=merged.map((words,i)=>words.slice(TITLE_WORDS[i]).map(w=>[...w].filter(isRune).length));
  assert.deepEqual(bodies.map(a=>a.length),[156,252,381,432,220,346,353,733]);
  return bodies;
}

/** @param {number} seed @param {string} engine */
function generator(seed,engine){
  let state=seed>>>0;
  if(engine==="xorshift"&&state===0)state=0x9e3779b9;
  return function next() {
    if(engine==="lcg")state=(Math.imul(state,1664525)+1013904223)>>>0;
    else{
      state^=state<<13;
      state^=state>>>17;
      state^=state<<5;
      state>>>=0;
    }
    return state;
  };
}

/** @param {number} count @param {function():number} next */
function fisherYates(count,next){
  const indices=Int32Array.from({length:count},(_,i)=>i);
  for(let i=count-1;i>0;i--){
    const j=next()%(i+1);
    const t=indices[i];indices[i]=indices[j];indices[j]=t;
  }
  return indices;
}

/**
 * One seeded permutation per section, with shared seed, incremented seed,
 * or one continuous PRNG. Text headings remain in their original locations.
 * @param {number[]} sizes @param {number} seed @param {string} engine
 * @param {string} mode
 * @returns {Int32Array[]}
 */
function permutations(sizes,seed,engine,mode){
  const continuous=generator(seed,engine);
  return sizes.map((size,i)=>fisherYates(size,
    mode==="stream"?continuous:generator((seed+(mode==="increment"?i:0))>>>0,engine)));
}

/** @param {number[][]} groups @param {Int32Array[]} perms */
function hideOrder(groups,perms){
  return groups.map((arr,i)=>Array.from(perms[i],index=>arr[index]));
}

/** @param {number} x @returns {number} */
function category(x){return x<=2?0:x<=5?1:2;}

/** @param {number[][]} encrypted @param {Int32Array[]} perms */
function inverseTransitions(encrypted,perms){
  const ct=new Float64Array(CATS*CATS);
  for(let g=0;g<encrypted.length;g++){
    const arr=encrypted[g], p=perms[g];
    const orig=new Uint8Array(arr.length);
    for(let i=0;i<arr.length;i++)orig[p[i]]=category(arr[i]);
    for(let i=1;i<orig.length;i++)ct[orig[i-1]*CATS+orig[i]]++;
  }
  return ct;
}

/** @param {Float64Array} ct */
function chiSquare(ct){
  const rows=new Float64Array(CATS),cols=new Float64Array(CATS);
  let sum=0;
  for(let a=0;a<CATS;a++)for(let b=0;b<CATS;b++){
    const v=ct[a*CATS+b];
    rows[a]+=v;cols[b]+=v;sum+=v;
  }
  let chi2=0;
  for(let a=0;a<CATS;a++)for(let b=0;b<CATS;b++){
    const expected=rows[a]*cols[b]/sum;
    if(expected)chi2+=(ct[a*CATS+b]-expected)**2/expected;
  }
  return chi2;
}

/** @param {number[][]} groups @param {number} seed @param {string} engine @param {string} mode */
function scoreModel(groups,seed,engine,mode){
  const perms=permutations(groups.map(x=>x.length),seed,engine,mode);
  return chiSquare(inverseTransitions(groups,perms));
}

/** @param {number[][]} bodies */
function search(bodies){
  let champion={chi2:-Infinity,engine:"",mode:"",seed:-1}, evaluations=0;
  const top=[];
  for(const engine of ENGINES)for(const mode of MODES)for(let seed=0;seed<TOTAL_SEEDS;seed++){
    const chi2=scoreModel(bodies,seed,engine,mode);
    evaluations++;
    if(chi2>champion.chi2)champion={chi2,engine,mode,seed};
    if(top.length<10||chi2>top[top.length-1].chi2){
      top.push({chi2,engine,mode,seed});
      top.sort((a,b)=>b.chi2-a.chi2);
      top.length=Math.min(10,top.length);
    }
  }
  return {champion,top,evaluations};
}

/** @param {number} seed */
function pseudorandom(seed){
  const next=generator(seed,"xorshift");
  return ()=>next()/4294967296;
}

/**
 * Reuse real eight body sizes but populate source words from untouched
 * Shakespeare tail. Optional one-rune padding per word simulates length
 * changes before encryption; plant key and source remain blind to search.
 * @param {number[][]} observed @param {number} padding
 */
function plant(observed,padding){
  const shakespeare=englishWords(read("resources/control/shakespeare_first300k.txt"));
  const tails=shakespeare.slice(Math.floor(shakespeare.length*0.8)).map(runeLength);
  const n=observed.reduce((s,b)=>s+b.length,0);
  assert.ok(tails.length>=n);
  const random=pseudorandom(0x37ac0de);
  let cursor=0;
  const text=observed.map(b=>Array.from({length:b.length},()=>{
    const length=tails[cursor++];
    return length+(random()<padding?1:0);
  }));
  const perms=permutations(text.map(a=>a.length),3301,"lcg","same");
  const scrambled=hideOrder(text,perms);
  return {padding,sourceChi2:chiSquare(inverseTransitions(text,
    text.map(a=>Int32Array.from({length:a.length},(_,i)=>i)))),
    scrambledChi2:chiSquare(inverseTransitions(scrambled,
    scrambled.map(a=>Int32Array.from({length:a.length},(_,i)=>i)))),
    recovered:search(scrambled)};
}

/** @param {number[][]} bodies */
function nullSearch(bodies){
  const random=generator(0x372a3301,"xorshift");
  const maxima=[];
  for(let t=0;t<NULL_TRIALS;t++){
    const shuffled=bodies.map(b=>{
      const p=fisherYates(b.length,random);
      return Array.from(p,j=>b[j]);
    });
    maxima.push(search(shuffled).champion.chi2);
  }
  maxima.sort((a,b)=>a-b);
  return {trials:NULL_TRIALS,seed:"0x372a3301",maxima,
    median:maxima[Math.floor(maxima.length/2)],largest:maxima[maxima.length-1]};
}

/** English GP-dependent word-length transitions, trained independently on a source split. */
function englishDirectionModel(){
  const {englishWords,runeLength}=require("./wordlength_crib_scan.js");
  const words=englishWords(read("resources/control/shakespeare_first300k.txt"));
  const cut=Math.floor(words.length*0.8);
  const a=words.slice(0,cut).map(w=>category(runeLength(w)));
  const cells=Array.from({length:3},()=>Array(3).fill(0));
  for(let i=1;i<a.length;i++)cells[a[i-1]][a[i]]++;
  const rows=cells.map(v=>v.reduce((s,x)=>s+x,0));
  const cols=[0,1,2].map(j=>cells.reduce((s,v)=>s+v[j],0));
  const n=rows.reduce((s,x)=>s+x,0);
  return cells.map((row,i)=>row.map((v,j)=>
    Math.log(((v+0.5)/(rows[i]+1.5))/((cols[j]+0.5)/(n+1.5)))));
}
/** @param {number[][]} groups @param {number[][]} weights */
function directionalScore(groups,weights){
  let value=0;
  for(const g of groups)
    for(let i=1;i<g.length;i++)value+=weights[category(g[i-1])][category(g[i])];
  return value;
}
/** @param {number[][]} groups @param {Int32Array[]} permutations */
function restoreSections(groups,permutations){
  return groups.map((g,k)=>{
    const decoded=new Array(g.length);
    for(let i=0;i<g.length;i++)decoded[permutations[k][i]]=g[i];
    return decoded;
  });
}

function main(){
  const bodies=manuscriptBodies();
  const identity=bodies.map(a=>Int32Array.from({length:a.length},(_,i)=>i));
  const unsolved={observedChi2:chiSquare(inverseTransitions(bodies,identity)),...search(bodies)};
  const controls=[plant(bodies,0),plant(bodies,0.45)];
  const weights=englishDirectionModel();
  const chosen=unsolved.champion;
  const decoded=restoreSections(bodies,permutations(bodies.map(g=>g.length),
    chosen.seed,chosen.engine,chosen.mode));
  const directional={
    training:"independent first-80%-Shakespeare GP word-length transition model",
    original:directionalScore(bodies,weights),
    recoveredByChi2Winner:directionalScore(decoded,weights),
    preference:"A higher score means a better fit to English word-length order"
  };
  const nulls=nullSearch(bodies);
  const exceed=nulls.maxima.filter(x=>x>=unsolved.champion.chi2).length;
  const out={hypothesis:"clue-number-seeded Fisher-Yates shuffling of complete section-body words",
    bodyWords:bodies.map(x=>x.length),
    modes:MODES,engines:ENGINES,seedDomain:"0..4095",unsolved,directional,controls,
    null:{...nulls,exceed,pUpper:(exceed+1)/(NULL_TRIALS+1)},
    evidence:"Candidate seed is genuine only if a visible-word-length shuffle also produces actual plaintext under an independently predictive rune cipher."};
  console.log(JSON.stringify(out,null,2));
}

if(require.main===module)main();
module.exports={manuscriptBodies,generator,fisherYates,permutations,hideOrder,
  inverseTransitions,chiSquare,scoreModel,search,plant,nullSearch};
