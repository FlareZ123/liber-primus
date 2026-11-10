'use strict';
/**
 * Direct 28/42 plaintext inversion allowing a per-word inserted null.
 *
 * At each aligned rune offset, if both symbols encode plaintext, then
 * D = inverse(4)*(C28-C42) = P28-P42 (mod29). If one is a null, the
 * observed difference no longer constrains the genuine plaintext
 * symbol on the other page; its letter is searched directly.
 * Each observed word may contain at most one null (prior probability
 * 0.45, uniform insertion slot), or zero (prior 0.55).
 *
 * Product automaton: two dictionary tries, two unknown-word fallbacks,
 * two null-used bits. Exact GP letter-trigram and word-frequency scoring
 * per path, global pruning to a bounded beam. Heldout plants include
 * genuine inserted null glyphs with no plaintext and an independent
 * random shared key, for an end-to-end recovery check.
 *
 * Run offline: node sims/relative_key_nullbeam.cjs
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const base=require('./relative_key_english_probe.cjs');
const {trainTrigram}=require('./relative_key_trigram_probe.cjs');
const {trainDictionary}=require('./relative_key_dictionary_beam.cjs');
const ROOT=path.resolve(__dirname,'..');
const M=29,N=31,SCALE=4,INV=22,END=30,START=29;
const MAX_BEAM=5500,OOV_PENALTY=7.5,WORD_WEIGHT=0.47,INSERT_PROB=.45;
const map=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8')).translit;
const read=(p)=>fs.readFileSync(path.join(ROOT,p),'utf8');
const mod=x=>((x%M)+M)%M;
const idx=(a,b,c)=>(a*N+b)*N+c;
const unknown=(a,b)=>-1-a*N-b;
const unctx=id=>[Math.floor((-id-1)/N),(-id-1)%N];
const field=(node,dict)=>node>=0?[dict.nodes[node].u,dict.nodes[node].v]:unctx(node);
/** @param {{start:boolean[],end:boolean[]}} page */
function wordLengths(page){
  const out=[];let begin=0;
  for(let i=0;i<page.end.length;i++){
    if(page.start[i])begin=i;
    out[i]=i-begin+1;
  }
  let nextEnd=page.end.length-1;
  for(let i=page.end.length-1;i>=0;i--){
    if(page.end[i])nextEnd=i;
    out[i]=nextEnd-(i-out[i]+1)+1;
  }
  return out;
}
/**
 * @param {number} node
 * @param {number} rune
 * @param {boolean} isEnd
 * @param {any} dict
 * @param {Float64Array} lm
 * @param {boolean} nullHere
 */
function advance(node,rune,isEnd,dict,lm,nullHere){
  if(nullHere){
    if(node===0&&isEnd)return [];
    const [u,v]=field(node,dict);
    if(!isEnd)return [{node,score:0,oov:0}];
    let endBonus=lm[idx(u,v,END)];
    if(node>=0){
      const terminal=dict.nodes[node].terminal;
      if(!terminal)return [];
      endBonus+=WORD_WEIGHT*Math.log((terminal+0.1)/(dict.total+0.1*dict.vocabulary));
    }
    return [{node:0,score:endBonus,oov:0}];
  }
  const out=[];
  if(node>=0){
    const parent=dict.nodes[node],next=parent.children[rune];
    if(next>=0){
      const destination=dict.nodes[next];
      if(!isEnd||destination.terminal){
        let score=lm[idx(parent.u,parent.v,rune)];
        if(isEnd)score+=lm[idx(parent.v,rune,END)] +
          WORD_WEIGHT*Math.log((destination.terminal+0.1)/(dict.total+0.1*dict.vocabulary));
        out.push({node:isEnd?0:next,score,oov:0});
      }
    }
    if(node===0){
      const score=lm[idx(START,START,rune)]-
        OOV_PENALTY+(isEnd?lm[idx(START,rune,END)]:0);
      out.push({node:isEnd?0:unknown(START,rune),score,oov:1});
    }
  }else{
    const [u,v]=unctx(node);
    const score=lm[idx(u,v,rune)]+(isEnd?lm[idx(v,rune,END)]:0);
    out.push({node:isEnd?0:unknown(v,rune),score,oov:0});
  }
  return out;
}
/**
 * @param {number} nullUsed
 * @param {boolean} nullHere
 * @param {boolean} isEnd
 * @param {number} length
 */
function nullPrior(nullUsed,nullHere,isEnd,length){
  if(nullHere&&nullUsed)return -Infinity;
  if(!isEnd)return 0;
  return nullUsed||nullHere?
    Math.log(INSERT_PROB/Math.max(1,length)):Math.log(1-INSERT_PROB);
}
/** @param {number} seed */
function randomGenerator(seed){
  let state=seed>>>0;
  return()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296;};
}
/**
 * @param {{xs:number[],start:boolean[],end:boolean[]}} A
 * @param {{xs:number[],start:boolean[],end:boolean[]}} B
 * @param {any} dict
 * @param {Float64Array} lm
 * @param {number} beam
 */
function invert(A,B,dict,lm,beam=MAX_BEAM){
  const count=Math.min(A.xs.length,B.xs.length);
  const d=Uint8Array.from({length:count},(_,i)=>mod(INV*(A.xs[i]-B.xs[i])));
  const lensA=wordLengths(A),lensB=wordLengths(B);
  let states=[{a:0,b:0,na:0,nb:0,score:0,prev:null,p:0,q:0,extraA:0,extraB:0,oov:0}];
  let highWater=0;
  for(let t=0;t<count;t++){
    const uniq=new Map();
    const eA=A.end[t],eB=B.end[t];
    const doAdd=(old,pa,pb,an,bn)=>{
      const pA=nullPrior(old.na,an,eA,lensA[t]),pB=nullPrior(old.nb,bn,eB,lensB[t]);
      if(!Number.isFinite(pA)||!Number.isFinite(pB))return;
      const aa=advance(old.a,pa,eA,dict,lm,an);
      if(!aa.length)return;
      const bb=advance(old.b,pb,eB,dict,lm,bn);
      if(!bb.length)return;
      for(const x of aa)for(const y of bb){
        const newA=eA?0:old.na+Number(an),newB=eB?0:old.nb+Number(bn);
        const score=old.score+x.score+y.score+pA+pB-(an?Math.log(29):0)-(bn?Math.log(29):0);
        const k=(((x.node+1000)*(dict.nodes.length+1000)+y.node+1000)*4)+(2*newA+newB);
        const current=uniq.get(k);
        if(!current||score>current.score)
          uniq.set(k,{a:x.node,b:y.node,na:newA,nb:newB,score,prev:old,p:an?29:pa,q:bn?29:pb,
            extraA:old.extraA+Number(an),extraB:old.extraB+Number(bn),oov:old.oov+x.oov+y.oov});
      }
    };
    for(const old of states){
      if(A.start[t]&&old.a!==0)continue;
      if(B.start[t]&&old.b!==0)continue;
      for(let p=0;p<M;p++){
        doAdd(old,p,mod(p-d[t]),false,false);
        if(!old.nb)doAdd(old,p,29,false,true);
        if(!old.na)doAdd(old,29,p,true,false);
      }
      if(!old.na&&!old.nb)doAdd(old,29,29,true,true);
    }
    if(!uniq.size)return {status:'no-path',position:t};
    highWater=Math.max(highWater,uniq.size);
    states=[...uniq.values()].sort((x,y)=>y.score-x.score).slice(0,beam);
  }
  const best=states[0],p=new Uint8Array(count),q=new Uint8Array(count);
  let cur=best;
  for(let t=count-1;t>=0;t--){p[t]=cur.p;q[t]=cur.q;cur=cur.prev;}
  const render=(x,starts)=>Array.from(x,(v,i)=>(starts[i]?' ':'')+(v===29?'[null]':map[v])).join('').trim();
  let matches=0,normal=0;
  for(let i=0;i<count;i++)if(p[i]<29&&q[i]<29){
    normal++;
    if(mod(A.xs[i]-4*p[i])===mod(B.xs[i]-4*q[i]))matches++;
  }
  assert.equal(normal,matches);
  return {status:'success',length:count,score:best.score,nullA:best.extraA,nullB:best.extraB,
    oovWords:best.oov,maxUniqueStates:highWater,p:Array.from(p),q:Array.from(q),
    pText:render(p,A.start),qText:render(q,B.start),
    matchedCommonKeyPositions:matches};
}
/**
 * Insert at most one null rune into each reference plaintext word, before
 * encrypting with a shared randomly sampled pad. Null ciphertexts are
 * drawn independently uniform, so no key cancellation applies to them.
 * @param {number[][]} words
 * @param {()=>number} random
 * @param {number} count
 */
function plantPage(words,random,count=269){
  const letters=[],start=[],end=[],known=[];
  for(const w of words){
    if(letters.length>=count)break;
    const inserted=random()<INSERT_PROB?Math.floor(random()*(w.length+1)):-1;
    const sequence=[];
    for(let i=0;i<=w.length;i++){
      if(i===inserted)sequence.push(29);
      if(i<w.length)sequence.push(w[i]);
    }
    for(let i=0;i<sequence.length&&letters.length<count;i++){
      letters.push(sequence[i]);start.push(i===0);end.push(i===sequence.length-1);
      known.push(sequence[i]<29?sequence[i]:29);
    }
  }
  assert.equal(letters.length,count);
  return {xs:letters,start,end,known};
}
/** @param {number[][]} sourceA @param {number[][]} sourceB @param {number} seed */
function plant(sourceA,sourceB,seed){
  const random=randomGenerator(seed),pa=plantPage(sourceA,random),pb=plantPage(sourceB,random);
  const key=Array.from({length:269},()=>Math.floor(random()*29));
  const encrypted=page=>({...page,xs:page.xs.map((v,i)=>v===29?Math.floor(random()*29):mod(4*v+key[i]))});
  return {pa,pb,a:encrypted(pa),b:encrypted(pb)};
}
function study(){
  const shakespeare=read('resources/control/shakespeare_first300k.txt');
  const emerson=read('resources/control/emerson_essays_2944.txt');
  const gibran=read('resources/control/gibran_prophet_58585.txt');
  const training=base.corpusWords(shakespeare.slice(0,240000))
    .concat(base.corpusWords(emerson.slice(0,350000)))
    .concat(base.corpusWords(gibran.slice(0,72000)));
  const dict=trainDictionary(training),lm=trainTrigram(training);
  const A=base.lp2Page(28),B=base.lp2Page(42);
  const observed=invert(A,B,dict,lm);
  const held=base.corpusWords(shakespeare.slice(240000));
  const sample=plant(held.slice(0,400),held.slice(500,900),330104);
  const positive=invert(sample.a,sample.b,dict,lm);
  const knownA=sample.pa.known,knownB=sample.pb.known;
  const correctA=positive.status==='success'?positive.p.filter((v,i)=>v===knownA[i]).length/knownA.length:null;
  const correctB=positive.status==='success'?positive.q.filter((v,i)=>v===knownB[i]).length/knownB.length:null;
  const truePa=knownA.filter(x=>x<29).length,truePb=knownB.filter(x=>x<29).length;
  const count=269;
  return {
    hypothesis:'C28-C42=4(P28-P42) modulo29 only when neither rune is an inserted null',
    nullPolicy:'At most one per observed word, P(one null)=0.45, uniform slot; target p-word edges fixed',
    nullEmission:'Independent uniform ciphertext rune; no pad-cancellation constraint at null positions',
    beam:MAX_BEAM,trainingTokens:training.length,lexicon:dict.vocabulary,
    target:{
      status:observed.status,score:observed.score,
      inferredNulls28:observed.nullA,inferredNulls42:observed.nullB,
      outOfVocabularyWords:observed.oovWords,matchedKeyPositions:observed.matchedCommonKeyPositions,
      decoded28:observed.pText,decoded42:observed.qText
    },
    heldoutSynthetic:{
      status:positive.status,score:positive.score,
      trueNulls28:count-truePa,trueNulls42:count-truePb,
      recoveredNulls28:positive.nullA,recoveredNulls42:positive.nullB,
      accuracyIncludingNulls28:correctA,accuracyIncludingNulls42:correctB,
      outOfVocabularyWords:positive.oovWords,matchedKeyPositions:positive.matchedCommonKeyPositions
    },
    warning:'The null channel enlarges the parameter space and can overfit; verified key identity at constrained positions is algebraic, not independent cipher evidence.'
  };
}
if(require.main===module)console.log(JSON.stringify(study(),null,2));
module.exports={invert,plant,study};
