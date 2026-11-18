"use strict";

/**
 * Original LP2 nine-chapter joint-context decision, Issue #1485.
 * Windows 11, Node.js 22 CommonJS, no dependencies.
 * Run: node sims/lp2_chapter_joint_context_cv_euler_sft.cjs
 *
 * Frozen model: sixteen mutually exclusive joint higher-order transition
 * signatures from four bits (within printed words, offset >=6):
 * [current==previous, current==two-back, current==five-back,
 *  current==24-2*six-back mod29].
 * All four features were committed before this experiment. The T6 arm is
 * historically postselected; empirical conditional tails are exploratory.
 *
 * Prediction: two-fold alternate-page cross-validation within each of the
 * nine source-visible illustrated chapters. A chapter model backs off to
 * its global training-frequency model by a fixed empirical-Bayes mass
 * calibrated on three source-native English GP books BEFORE observing LP2.
 * Baseline: pooled frequency trained on identical held-out pages.
 *
 * Null: 1200 independently sampled original-page Euler trails preserving
 * every page's exact ordered bigram inventory, first/last rune, page
 * length and all source-specified word/page/chapter positions.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const source = pages.flatMap(p => p.indices);
const words = parseSharedCorpus();
const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
const cuts = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];
const chapterOf = p => {
  for (let k = 0; k < 9; k++) if (p >= cuts[k] && p < cuts[k+1]) return k;
  throw new Error("invalid page");
};
const pagePosition = new Uint8Array(source.length);
const chapterPosition = new Uint8Array(source.length);
const foldPosition = new Uint8Array(source.length);
let cursor = 0;
for (const page of pages) {
  const k = chapterOf(page.page);
  const f = (page.page - cuts[k]) % 2;
  for (let j = 0; j < page.indices.length; j++) {
    pagePosition[cursor] = page.page;
    chapterPosition[cursor] = k;
    foldPosition[cursor] = f;
    cursor++;
  }
}
assert.equal(pages.length, 55);
assert.equal(cursor, 12956);
assert.equal(words.words.length, 2896);
assert.equal(words.crossPageWords, 32);
const spans = [];
cursor = 0;
for (const w of words.words) {
  const actual = Array.from(w.runes, r => runeMap.get(r));
  assert.deepEqual(source.slice(cursor, cursor + actual.length), actual);
  spans.push([cursor, cursor+actual.length]);
  cursor += actual.length;
}
assert.equal(cursor, source.length);
const eligible = [];
for (const [start, end] of spans) {
  for (let i = start+6; i < end; i++) eligible.push({
    pos:i,chapter:chapterPosition[i],fold:foldPosition[i]
  });
}
assert.equal(eligible.length, 1290);

/** @param {ArrayLike<number>} tape @param {number} i */
function signature(tape,i) {
  return Number(tape[i]===tape[i-1]) |
    (Number(tape[i]===tape[i-2])<<1) |
    (Number(tape[i]===tape[i-5])<<2) |
    (Number(tape[i]===(24-2*tape[i-6]+58)%29)<<3);
}
const B=16;
const ALPHA=0.5;
/** @param {ArrayLike<number>} tape @param {number} mass */
function evaluate(tape,mass) {
  const gains=Array(9).fill(0), held=Array(9).fill(0);
  const leaveOneOutBits=Array(9).fill(0), leaveOneOutN=Array(9).fill(0);
  const allCounts=new Float64Array(9*B);
  for(const e of eligible)allCounts[e.chapter*B+signature(tape,e.pos)]++;
  for(let k=0;k<9;k++){
    const ref=new Float64Array(B);
    let sum=0;
    for(let other=0;other<9;other++)if(other!==k)
      for(let j=0;j<B;j++){ref[j]+=allCounts[other*B+j];sum+=allCounts[other*B+j];}
    for(let j=0;j<B;j++)leaveOneOutBits[k]-=
      allCounts[k*B+j]*Math.log2((ref[j]+ALPHA)/(sum+B*ALPHA));
    for(let j=0;j<B;j++)leaveOneOutN[k]+=allCounts[k*B+j];
  }
  for(let f=0;f<2;f++){
    const global=new Float64Array(B), local=Array.from({length:9},()=>new Float64Array(B));
    const ns=Array(9).fill(0);let n=0;
    for(const e of eligible)if(e.fold!==f){
      const s=signature(tape,e.pos);
      global[s]++;local[e.chapter][s]++;ns[e.chapter]++;n++;
    }
    for(const e of eligible)if(e.fold===f){
      const s=signature(tape,e.pos);
      const gp=(global[s]+ALPHA)/(n+B*ALPHA);
      const cp=(local[e.chapter][s]+mass*gp)/(ns[e.chapter]+mass);
      gains[e.chapter]+=Math.log2(cp/gp);
      held[e.chapter]++;
    }
  }
  return {
    gains, held, totalGain:gains.reduce((a,b)=>a+b,0),
    maxRate:Math.max(...gains.map((g,k)=>g/held[k])),
    loo:leaveOneOutBits.map((bits,k)=>bits/leaveOneOutN[k])
  };
}

/**
 * Fixed source-native GP English control. The source's ING and IO precedence
 * is calibrated to 181 literal LP1 solved words and held-out 95-rune LP2 p57
 * by sims/lp2_native_gp_source_orthography_sft.cjs.
 * These three continuous books are overlaid on original printed word masks
 * ONLY to set a fixed smoothing parameter. They are not LP2 null books.
 */
const tokens=corpus.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
function englishToGP(input) {
  const out=[];
  const text=input.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  for(const word of text.match(/[A-Z]+/g)||[]){
    for(let i=0;i<word.length;){
      if(word.startsWith("ING",i)){out.push(21);i+=3;}
      else if(word.startsWith("IO",i)){out.push(27);i+=2;}
      else{
        const t=tokens.find(x=>word.startsWith(x.s,i));
        assert(t,"unmapped English GP spelling");
        out.push(t.i);i+=t.s.length;
      }
    }
    if(out.length>=source.length)break;
  }
  assert(out.length>=source.length,"native source not long enough");
  return out.slice(0,source.length);
}
const controls=[
  englishToGP(read("resources/control/gibran_prophet_58585.txt")),
  englishToGP(read("resources/control/emerson_essays_2944.txt")),
  englishToGP(read("resources/control/shakespeare_first300k.txt"))
];
const MASSES=[8,16,32,64,128,256,512,1024];
const calibration=MASSES.map(mass=>({
  mass, bits:-controls.reduce((sum,control)=>sum+evaluate(control,mass).totalGain,0)
}));
calibration.sort((a,b)=>a.bits-b.bits||a.mass-b.mass);
const mass=calibration[0].mass;
console.log("FROZEN_ALPHA_CALIBRATION",JSON.stringify(calibration));
console.log("SMOOTHING_MASS",mass);
const observed=evaluate(source,mass);
const chapters=Array.from({length:9},(_,k)=>({
  chapter:k+1, pages:[cuts[k],cuts[k+1]-1],
  runes:pages.filter(p=>chapterOf(p.page)===k).reduce((n,p)=>n+p.indices.length,0),
  eligible:observed.held[k],
  gainBits:+observed.gains[k].toFixed(5),
  gainPerSlot:+(observed.gains[k]/observed.held[k]).toFixed(7),
  untrainedBitsPerSlot:+observed.loo[k].toFixed(7)
}));
console.log("OBSERVED_CHAPTERS",JSON.stringify(chapters));
console.log("OBSERVED_TOTAL",JSON.stringify({
  gainBits:observed.totalGain,maxRate:observed.maxRate,
  minUntrained:Math.min(...observed.loo)
}));

function rng(seed) {
  let x=seed|0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};
}
function graph(original){
  const outgoing=Array.from({length:29},()=>[]);
  for(let i=1;i<original.length;i++)
    outgoing[original[i-1]].push(original[i]);
  return {original,outgoing,root:original.at(-1)};
}
/** Exactly reproduce the repo's uniformly randomized directed Euler trails. */
function euler({original,outgoing,root},random){
  const randomIndex=n=>Math.floor(random()*n);
  const last=new Int16Array(29).fill(-1);
  for(let v=0;v<29;v++)if(v!==root&&outgoing[v].length)
    last[v]=randomIndex(outgoing[v].length);
  let finished=false;
  while(!finished){
    finished=true;
    for(let v=0;v<29&&finished;v++){
      if(v===root||!outgoing[v].length)continue;
      const seen=new Int16Array(29).fill(-1), chain=[];
      let x=v;
      while(x!==root&&seen[x]===-1){
        assert(last[x]>=0);
        seen[x]=chain.length;chain.push(x);
        x=outgoing[x][last[x]];
      }
      if(x!==root){
        finished=false;
        for(const cyc of chain.slice(seen[x]))
          last[cyc]=randomIndex(outgoing[cyc].length);
      }
    }
  }
  const shuffled=outgoing.map((edges,v)=>{
    const a=edges.map((to,id)=>({to,id}));
    for(let j=a.length-1;j>0;j--){
      const m=randomIndex(j+1);[a[j],a[m]]=[a[m],a[j]];
    }
    if(v!==root&&last[v]>=0){
      const pos=a.findIndex(edge=>edge.id===last[v]);
      assert(pos>=0);a.push(a.splice(pos,1)[0]);
    }
    return a;
  });
  const offsets=new Uint16Array(29);
  let current=original[0];
  const tape=[current];
  for(let i=1;i<original.length;i++){
    const edge=shuffled[current][offsets[current]++];
    assert(edge,"Euler trail ended");
    current=edge.to;tape.push(current);
  }
  assert.equal(current,root);
  for(let v=0;v<29;v++)assert.equal(offsets[v],shuffled[v].length);
  return tape;
}
const graphs=pages.map(p=>graph(p.indices));
const rand=rng(0x85e45f39);
const N=1200;
const hitTotal={value:0},hitMax={value:0},hitMinLoo={value:0};
const hitChapters=Array.from({length:9},()=>({gain:0,lowLoo:0}));
const sums=Array(9).fill(0), squared=Array(9).fill(0);
let maxTotal=-Infinity,maxRate=-Infinity;
for(let rep=0;rep<N;rep++){
  const tape=graphs.flatMap(g=>euler(g,rand));
  assert.equal(tape.length,source.length);
  if(rep===0){
    let offset=0;
    for(const p of pages){
      const shuffled=tape.slice(offset,offset+p.indices.length);
      const counts=new Int16Array(29*29);
      for(let i=1;i<p.indices.length;i++){
        counts[p.indices[i-1]*29+p.indices[i]]++;
        counts[shuffled[i-1]*29+shuffled[i]]--;
      }
      assert(counts.every(x=>x===0),"page-bigram exact null violation");
      offset+=p.indices.length;
    }
  }
  const x=evaluate(tape,mass);
  hitTotal.value+=Number(x.totalGain>=observed.totalGain);
  hitMax.value+=Number(x.maxRate>=observed.maxRate);
  hitMinLoo.value+=Number(Math.min(...x.loo)<=Math.min(...observed.loo));
  maxTotal=Math.max(maxTotal,x.totalGain);
  maxRate=Math.max(maxRate,x.maxRate);
  for(let k=0;k<9;k++){
    hitChapters[k].gain+=Number(x.gains[k]>=observed.gains[k]);
    hitChapters[k].lowLoo+=Number(x.loo[k]<=observed.loo[k]);
    sums[k]+=x.gains[k];squared[k]+=x.gains[k]**2;
  }
}
const nullChapters=hitChapters.map((entry,k)=>({
  chapter:k+1,
  gainNullMean:+(sums[k]/N).toFixed(5),
  gainNullSD:+Math.sqrt(Math.max(0,squared[k]/N-(sums[k]/N)**2)).toFixed(5),
  gainUpper:entry.gain,
  lowUntrained:entry.lowLoo
}));
console.log("NULL_CHAPTERS",JSON.stringify(nullChapters));
console.log("NULL_OVERALL",JSON.stringify({
  trials:N,randomSeed:"0x85e45f39",hitsTotal:hitTotal.value,
  hitsMaxPerSlot:hitMax.value,hitsMinimumUntrained:hitMinLoo.value,
  maxNullGainBits:maxTotal,maxNullGainRate:maxRate
}));
console.log("DECISION","No chapter-specific decoder can be inferred from a score alone; source-selected state/key and blind inverse still required.");
