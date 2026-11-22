'use strict';
/**
 * Joint dictionary/trigram beam inversion for LP2 pages 28/42 under a
 * candidate scaled reused key: C28-C42 = 4(P28-P42) (mod29).
 *
 * Each aligned ciphertext position restricts the 29 plaintext rune
 * pairs. A product dictionary automaton enforces independently observed
 * rune-word boundaries on both pages, and scores GP letter trigrams and
 * Shakespeare-trained word frequencies. OOV tokens use a language-model
 * fallback with explicit per-word penalty. Beam states remember both
 * trie nodes (or two preceding OOV letters); backpointers recover both
 * rune streams and thus the hypothesized common keystream.
 *
 * Node.js 22, CommonJS, offline; execute: node sims/relative_key_dictionary_beam.cjs
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const base=require('./relative_key_english_probe.cjs');
const {trainTrigram}=require('./relative_key_trigram_probe.cjs');
const ROOT=path.resolve(__dirname,'..'), MOD=29, N=31;
const START=29, END=30, SCALE=4, INV_SCALE=22;
const alphabet=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8')).translit;
const mod=x=>((x%MOD)+MOD)%MOD;
const WIDTH=7000, OOV_PENALTY=7.5, FREQ_WEIGHT=0.47;
const UNKNOWN_OFFSET=1000;
assert.equal(mod(SCALE*INV_SCALE),1);
const index=(a,b,c)=>(a*N+b)*N+c;

/** @param {number} u @param {number} v */
function unknownId(u,v){return -1-u*N-v;}
/** @param {number} id */
function unknownCtx(id){const k=-id-1;return [Math.floor(k/N),k%N];}
/** @param {number[][]} wordTokens */
function trainDictionary(wordTokens){
  /** @type {Array<{children:Int32Array,u:number,v:number,terminal:number}>} */
  const nodes=[{children:new Int32Array(MOD).fill(-1),u:START,v:START,terminal:0}];
  let total=0;
  for(const word of wordTokens){
    if(!word.length||word.length>32)continue;
    let node=0;total++;
    for(const ch of word){
      assert.ok(Number.isInteger(ch)&&ch>=0&&ch<MOD);
      let next=nodes[node].children[ch];
      if(next<0){
        next=nodes.length;
        nodes[node].children[ch]=next;
        nodes.push({children:new Int32Array(MOD).fill(-1),u:nodes[node].v,v:ch,terminal:0});
      }
      node=next;
    }
    nodes[node].terminal++;
  }
  const vocabulary=nodes.filter(x=>x.terminal>0).length;
  return {nodes,total,vocabulary};
}
/**
 * Score one new rune and constrain a word end. The internal unknown-word
 * state tracks the preceding two letters, so language scoring remains exact.
 * An unknown token is penalized exactly once when begun.
 * @param {number} oldNode
 * @param {number} rune
 * @param {boolean} end
 * @param {{nodes:Array<{children:Int32Array,u:number,v:number,terminal:number}>,total:number,vocabulary:number}} dict
 * @param {Float64Array} lm
 * @param {boolean} allowUnknown
 */
function step(oldNode,rune,end,dict,lm,allowUnknown){
  const paths=[];
  if(oldNode>=0){
    const ancestor=dict.nodes[oldNode];
    const next=ancestor.children[rune];
    if(next>=0){
      const target=dict.nodes[next];
      if(!end||target.terminal){
        let reward=lm[index(ancestor.u,ancestor.v,rune)];
        if(end)reward+=lm[index(ancestor.v,rune,END)] +
          FREQ_WEIGHT*Math.log((target.terminal+0.1)/(dict.total+0.1*dict.vocabulary));
        paths.push({node:end?0:next,score:reward,oov:0});
      }
    }
    if(oldNode===0&&allowUnknown){
      const reward=lm[index(START,START,rune)] +
        (end?lm[index(START,rune,END)]:0)-OOV_PENALTY;
      paths.push({node:end?0:unknownId(START,rune),score:reward,oov:1});
    }
  }else{
    const [u,v]=unknownCtx(oldNode);
    let reward=lm[index(u,v,rune)];
    if(end)reward+=lm[index(v,rune,END)];
    paths.push({node:end?0:unknownId(v,rune),score:reward,oov:0});
  }
  return paths;
}
/**
 * Beam search in the two trie products. Kept paths are exact under the
 * stated language score; only global beam pruning is approximate.
 * @param {{xs:number[],start:boolean[],end:boolean[]}} pageA
 * @param {{xs:number[],start:boolean[],end:boolean[]}} pageB
 * @param {{nodes:Array<{children:Int32Array,u:number,v:number,terminal:number}>,total:number,vocabulary:number}} dict
 * @param {Float64Array} lm
 * @param {{scale?:number,beam?:number,oov?:boolean}} opts
 */
function invert(pageA,pageB,dict,lm,opts={}){
  const scale=opts.scale??SCALE,beam=opts.beam??WIDTH;
  const inv=Array.from({length:28},(_,i)=>i+1).find(i=>mod(i*scale)===1);
  assert.notEqual(inv,undefined);
  const n=Math.min(pageA.xs.length,pageB.xs.length);
  const D=Uint8Array.from({length:n},(_,i)=>mod(inv*(pageA.xs[i]-pageB.xs[i])));
  /** @type {Array<{a:number,b:number,score:number,prev:object|null,p:number,q:number,oov:number}>} */
  let states=[{a:0,b:0,score:0,prev:null,p:0,q:0,oov:0}];
  let highWater=0,layerCount=0;
  for(let t=0;t<n;t++){
    const unique=new Map();
    const difference=D[t],endA=pageA.end[t],endB=pageB.end[t];
    for(const state of states){
      const aNode=state.a,bNode=state.b;
      if(pageA.start[t]&&aNode!==0)continue;
      if(pageB.start[t]&&bNode!==0)continue;
      for(let p=0;p<MOD;p++){
        const q=mod(p-difference);
        const ca=step(aNode,p,endA,dict,lm,opts.oov!==false);
        if(!ca.length)continue;
        const cb=step(bNode,q,endB,dict,lm,opts.oov!==false);
        if(!cb.length)continue;
        for(const x of ca)for(const y of cb){
          const newScore=state.score+x.score+y.score;
          const na=x.node,nb=y.node;
          const k=(na+UNKNOWN_OFFSET)*(dict.nodes.length+UNKNOWN_OFFSET)+nb+UNKNOWN_OFFSET;
          const old=unique.get(k);
          if(!old||newScore>old.score){
            unique.set(k,{a:na,b:nb,score:newScore,prev:state,p,q,oov:state.oov+x.oov+y.oov});
          }
        }
      }
    }
    if(!unique.size)return {status:'no-path',at:t,afterBeam:states.length};
    states=[...unique.values()].sort((x,y)=>y.score-x.score).slice(0,beam);
    highWater=Math.max(highWater,unique.size);
    layerCount++;
  }
  const best=states[0];
  const p=new Uint8Array(n),q=new Uint8Array(n);
  let state=best;
  for(let t=n-1;t>=0;t--){p[t]=state.p;q[t]=state.q;state=state.prev;}
  const text=(r,starts)=>Array.from(r,(v,i)=>(starts[i]?' ':'')+alphabet[v]).join('').trim();
  const cA=pageA.xs.slice(0,n),cB=pageB.xs.slice(0,n);
  const reconstructedA=Array.from(p,(v,i)=>mod(cA[i]-scale*v));
  const reconstructedB=Array.from(q,(v,i)=>mod(cB[i]-scale*v));
  assert.deepEqual(reconstructedA,reconstructedB);
  return {
    status:'success',n,score:best.score,oovWords:best.oov,highWater,beam,
    p:Array.from(p),q:Array.from(q),pText:text(p,pageA.start),qText:text(q,pageB.start),
    sharedKey:reconstructedA,verifiedCommonKey:true
  };
}
/** @param {number} seed */
function rng(seed){let x=seed>>>0;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
function test(){
  const source=fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8');
  const trainWords=base.corpusWords(source.slice(0,240000));
  const testWords=base.corpusWords(source.slice(240000));
  const dict=trainDictionary(trainWords),lm=trainTrigram(trainWords);
  const a=base.lp2Page(28),b=base.lp2Page(42);
  assert.equal(a.xs.length,269);assert.equal(b.xs.length,272);
  const observed=invert(a,b,dict,lm,{scale:4});
  const pa=base.stream(testWords.slice(0,400),269),pb=base.stream(testWords.slice(500,900),269);
  assert.equal(pa.xs.length,269);assert.equal(pb.xs.length,269);
  const random=rng(20261234),key=pa.xs.map(()=>Math.floor(random()*MOD));
  const cp={...pa,xs:pa.xs.map((v,i)=>mod(SCALE*v+key[i]))};
  const cq={...pb,xs:pb.xs.map((v,i)=>mod(SCALE*v+key[i]))};
  const planted=invert(cp,cq,dict,lm,{scale:4});
  const plantedAccuracy=planted.status==='success'?
    planted.p.filter((r,i)=>r===pa.xs[i]).length/pa.xs.length:0;
  return {
    hypothesis:'C28[i]=4P28[i]+K[i], C42[i]=4P42[i]+K[i], same unknown K',
    method:'Shakespeare GP word-frequency trie product plus trigram; beam 7000; OOV penalty 7.5 per token',
    trainWords:trainWords.length,lexicon:dict.vocabulary,
    pageLengths:[a.xs.length,b.xs.length],target:{
      status:observed.status,
      score:observed.score,
      oovWords:observed.oovWords,
      n:observed.n,
      verifiedCommonKey:observed.verifiedCommonKey,
      page28Candidate:observed.pText,
      page42Candidate:observed.qText
    },
    heldoutPlant:{
      status:planted.status,
      score:planted.score,
      oovWords:planted.oovWords,
      runeAccuracy:plantedAccuracy,
      trueScale:4,
      verifiedCommonKey:planted.verifiedCommonKey,
      estimatedPage28:planted.pText,
      realPage28:pa.xs.map((v,i)=>(pa.start[i]?' ':'')+alphabet[v]).join('').trim()
    },
    caveat:'A shared key reconstructed algebraically from the same difference constraints is tautological and not independent confirmation. Readable text and out-of-sample key prediction are still required.'
  };
}
if(require.main===module)console.log(JSON.stringify(test(),null,2));
module.exports={trainDictionary,step,invert,test};
