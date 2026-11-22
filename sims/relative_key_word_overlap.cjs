"use strict";

/**
 * Pre-specified LP2 page 28/42 factor-4 shared-key hypothesis:
 * C_A[i]=4P_A[i]+K[i], C_B[i]=4P_B[i]+K[i] (mod 29).
 * The hidden key cancels: P_A[i]-P_B[i]=22(C_A[i]-C_B[i]) mod 29.
 *
 * Evaluate whether two actual rune-word boundaries admit any simultaneous
 * ordinary English GP-rune word pair at each aligned overlap (length >=4).
 * Synthetic controls use authentic page word lengths, disjoint Shakespeare
 * reference portions, a planted common key, and optional doublet repair.
 *
 * Run: node sims/relative_key_word_overlap.cjs
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");

const ROOT=path.join(__dirname,"..");
const CORPUS=JSON.parse(fs.readFileSync(
  path.join(ROOT,"resources","liber-primus","lp2-corpus.json"),"utf8"));
const TRANSCRIPT=fs.readFileSync(
  path.join(ROOT,"resources","liber-primus","lp2-transcription.txt"),"utf8");
const SHAKESPEARE=fs.readFileSync(
  path.join(ROOT,"resources","control","shakespeare_first300k.txt"),"utf8");
const RUNES=new Map(CORPUS.runes.map((ch,i)=>[ch,i]));
const LATIN=new Map(CORPUS.translit.map((name,i)=>[name,i]));
const mod=x=>((x%29)+29)%29;

/** @param {string} word @returns {number[]} */
function encode(word){
  const w=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/K/g,"C").replace(/Z/g,"S");
  const out=[];
  for(let i=0;i<w.length;){
    const d=LATIN.get(w.slice(i,i+2));
    if(d!==undefined){out.push(d);i+=2;}
    else{
      const x=LATIN.get(w[i]);
      assert.notEqual(x,undefined,"Invalid GP character");
      out.push(x);i++;
    }
  }
  return out;
}

/**
 * @param {number} page LP2 physical page number
 * @returns {{words:number[][],spans:{start:number,end:number,len:number}[],len:number}}
 */
function pageWords(page){
  const pieces=TRANSCRIPT.split("%");
  const raw=pieces[page>=51?page-1:page];
  const words=raw.replace(/[\/%\s]+/gu,"").split(/[-.&$§]+/u)
    .map(w=>[...w].filter(ch=>RUNES.has(ch)).map(ch=>RUNES.get(ch)))
    .filter(w=>w.length);
  let offset=0;
  const spans=words.map(w=>{
    const span={start:offset,end:offset+w.length,len:w.length};
    offset+=w.length;
    return span;
  });
  const original=CORPUS.pages.find(p=>p.page===page).indices;
  assert.deepEqual(words.flat(),original,"Transcription and numeric corpus disagree");
  return {words,spans,len:offset};
}

/**
 * @param {string} source
 * @param {boolean} unique True for the training lexicon, false for heldout tokens
 * @returns {Map<number,number[][]>} GP word groups by rune length
 */
function lexicon(source,unique){
  const byLength=new Map(),seen=new Set();
  for(const token of source.match(/[A-Za-z]+/g)||[]){
    const runes=encode(token),key=runes.join(",");
    if(unique&&seen.has(key))continue;
    seen.add(key);
    if(!byLength.has(runes.length))byLength.set(runes.length,[]);
    byLength.get(runes.length).push(runes);
  }
  return {byLength,keys:seen};
}

/**
 * @param {{spans:{start:number,end:number,len:number}[]}} a
 * @param {{spans:{start:number,end:number,len:number}[]}} b
 * @param {Map<number,number[][]>} dict
 * @returns {Array<{start:number,size:number,aLen:number,bLen:number,left:number[][],right:Set<number>}>}
 */
function makeOverlaps(a,b,dict){
  const edges=[];
  for(const wa of a.spans)for(const wb of b.spans){
    const start=Math.max(wa.start,wb.start);
    const stop=Math.min(wa.end,wb.end);
    const size=stop-start;
    if(size<4)continue;
    const posA=start-wa.start,posB=start-wb.start;
    const left=(dict.get(wa.len)||[]).map(w=>w.slice(posA,posA+size));
    const right=new Set((dict.get(wb.len)||[]).map(w=>
      w.slice(posB,posB+size).reduce((acc,x)=>acc*29+x,0)));
    edges.push({start,size,aLen:wa.len,bLen:wb.len,left,right});
  }
  return edges;
}

/**
 * @param {number[]} diff P_A - P_B, modulo 29
 * @param {ReturnType<typeof makeOverlaps>} overlaps
 * @returns {{total:number,supported:number,byLength:Record<string,{total:number,supported:number}>}}
 */
function support(diff,overlaps){
  const result={total:overlaps.length,supported:0,byLength:{}};
  for(const e of overlaps){
    let found=false;
    for(const left of e.left){
      let key=0;
      for(let k=0;k<e.size;k++) key=key*29+mod(left[k]-diff[e.start+k]);
      if(e.right.has(key)){found=true;break;}
    }
    const row=result.byLength[e.size]||(result.byLength[e.size]={total:0,supported:0});
    row.total++;
    if(found){row.supported++;result.supported++;}
  }
  return result;
}

/** @param {number} seed */
function seededRandom(seed){
  let state=seed>>>0;
  return ()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
}

/**
 * @param {number[][]} template
 * @param {Map<number,number[][]>} reference
 * @param {Set<string>} known
 * @param {()=>number} random
 */
function sampleText(template,reference,known,random){
  const xs=[];let unknownWords=0;
  for(const word of template){
    const group=reference.get(word.length);
    assert.ok(group?.length,"No heldout word of length "+word.length);
    const choice=group[Math.floor(random()*group.length)];
    xs.push(...choice);
    if(!known.has(choice.join(",")))unknownWords++;
  }
  return {xs,unknownWords};
}

/**
 * Simulated ciphertext doublet suppression. The Bernoulli 81% mechanism is
 * illustrative, not independently established as Cicada's actual cipher.
 * @param {number[]} plaintext
 * @param {number[]} key
 * @param {()=>number} random
 * @param {number} repairRate
 */
function encrypt(plaintext,key,random,repairRate){
  const xs=plaintext.map((p,i)=>mod(4*p+key[i]));
  let repairs=0;
  for(let i=1;i<xs.length;i++){
    if(xs[i]===xs[i-1]&&random()<repairRate){
      const v=Math.floor(random()*28);
      xs[i]=v>=xs[i-1]?v+1:v;
      repairs++;
    }
  }
  return {xs,repairs};
}

/**
 * @param {{trials?:number,repairRate?:number,seed?:number}} [options]
 * @returns {object}
 */
function run(options={}){
  const trials=options.trials??400;
  const repairRate=options.repairRate??0.81;
  const random=seededRandom(options.seed??7831001);
  const a=pageWords(28),b=pageWords(42);
  assert.equal(a.len,269);
  assert.equal(b.len,272);
  const training=lexicon(SHAKESPEARE.slice(0,240000),true);
  const heldout=lexicon(SHAKESPEARE.slice(240000),false);
  assert.equal(training.keys.size,5002);
  const overlaps=makeOverlaps(a,b,training.byLength);
  assert.equal(overlaps.length,24);
  const ca=CORPUS.pages.find(p=>p.page===28).indices;
  const cb=CORPUS.pages.find(p=>p.page===42).indices;
  const trueDiff=ca.map((v,i)=>mod(22*(v-cb[i])));
  const actual=support(trueDiff,overlaps);
  assert.equal(actual.supported,2);

  const simulations=[];
  for(let trial=0;trial<trials;trial++){
    const pa=sampleText(a.words,heldout.byLength,training.keys,random);
    const pb=sampleText(b.words,heldout.byLength,training.keys,random);
    const sharedKey=Array.from({length:b.len},()=>Math.floor(random()*29));
    const ea=encrypt(pa.xs,sharedKey,random,repairRate);
    const eb=encrypt(pb.xs,sharedKey,random,repairRate);
    const d=ea.xs.map((v,i)=>mod(22*(v-eb.xs[i])));
    simulations.push({
      supported:support(d,overlaps).supported,
      unknownWords:pa.unknownWords+pb.unknownWords,
      repairedRunes:ea.repairs+eb.repairs
    });
  }

  const s=simulations.map(row=>row.supported).sort((x,y)=>x-y);
  const mean=field=>simulations.reduce((sum,row)=>sum+row[field],0)/simulations.length;
  const lower=simulations.filter(row=>row.supported<=actual.supported).length;
  const result={
    model:"C28=4*P28+K, C42=4*P42+K mod29; shared K at the same rune offset",
    input:{pages:[28,42],trainingGPWords:training.keys.size,
      overlaps:actual.total,overlapLengths:overlaps.map(e=>e.size)},
    observed:actual,
    controls:{trials,seed:options.seed??7831001,repairRate,
      heldoutSampling:"length-matched Shakespeare heldout GP words",
      meanSupported:mean("supported"),min:s[0],q05:s[Math.floor(0.05*trials)],
      median:s[Math.floor(0.5*trials)],q95:s[Math.floor(0.95*trials)],
      max:s[s.length-1],meanUnknownWords:mean("unknownWords"),
      meanRepairedRunes:mean("repairedRunes"),
      simulationsAtMostObserved:lower,
      addOneTailProbability:(lower+1)/(trials+1)}
  };
  assert.ok(lower===0,"Real text unexpectedly matched controls");
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)run();
module.exports={run,encode,pageWords,makeOverlaps,support};
