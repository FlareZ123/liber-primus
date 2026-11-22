'use strict';
/**
 * Disjoint-half test of a two-swap recovered outer rune permutation.
 *
 * Fit sigma only on LP2 page pair 28/42 first 134 rune offsets, then
 * score all 135 cyclic rotations of page42's *second-half ciphertext*
 * while holding its observed word-break flags fixed.
 *
 * Compare exact marginalized GP bigram likelihood and a position-aware
 * independent-rune model. Count dictionary-compatible word crossings
 * wholly in that untouched second half.
 */
const fs=require('node:fs');
const path=require('node:path');
const base=require('./relative_key_english_probe.cjs');
const {train,singleLogZ}=require('./relative_key_forward_likelihood.cjs');
const {fit,llr,canonical}=require('./relative_key_unknown_permutation.cjs');
const {pageWords,makeOverlaps}=require('./relative_key_word_overlap.cjs');
const ROOT=path.resolve(__dirname,'..'),M=29;
const mod=x=>(x%M+M)%M;

/** @param {number[][]} words */
function uniqueDictionary(words){
  const tmp=new Map();
  for(const w of words){
    const k=w.length;
    if(!tmp.has(k))tmp.set(k,new Map());
    tmp.get(k).set(w.join(','),w);
  }
  return new Map([...tmp].map(([n,words])=>[n,[...words.values()]]));
}
/** @param {number[]} permutation */
function inversePermutation(permutation){
  const result=new Uint8Array(M);
  for(let p=0;p<M;p++)result[permutation[p]]=p;
  return result;
}
/**
 * Number of length>=4 word crossings admitting any simultaneous complete
 * dictionary-word pair under an arbitrary, fixed internal rune permutation.
 * @param {{xs:number[]}} a
 * @param {{xs:number[]}} b
 * @param {number[]} f
 * @param {ReturnType<typeof makeOverlaps>} overlaps
 */
function supports(a,b,f,overlaps){
  const inverse=inversePermutation(f);
  let found=0;
  const locations=[];
  for(const e of overlaps){
    let exists=false;
    for(const left of e.left){
      let key=0;
      for(let t=0;t<e.size;t++){
        const d=mod(a.xs[e.start+t]-b.xs[e.start+t]);
        const q=inverse[mod(f[left[t]]-d)];
        key=key*M+q;
      }
      if(e.right.has(key)){exists=true;break;}
    }
    if(exists){found++;locations.push({start:e.start,length:e.size});}
  }
  return {found,total:overlaps.length,locations};
}
/**
 * IID position-conditioned likelihood under the inferred permutation.
 * @param {{xs:number[],start:boolean[],end:boolean[]}} a
 * @param {{xs:number[],start:boolean[],end:boolean[]}} b
 * @param {Float64Array[]} marginals
 * @param {number[]} f
 * @param {number} from
 * @param {number} to
 */
function slotIID(a,b,marginals,f,from,to){
  const inverse=inversePermutation(f);
  let score=0;
  for(let t=from;t<to;t++){
    const A=marginals[(a.start[t]?1:0)+(a.end[t]?2:0)];
    const B=marginals[(b.start[t]?1:0)+(b.end[t]?2:0)];
    const d=mod(a.xs[t]-b.xs[t]);
    let probability=0;
    for(let p=0;p<M;p++)probability+=A[p]*B[inverse[mod(f[p]-d)]];
    score+=Math.log(M*probability);
  }
  return score;
}
function study(){
  const source=fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8');
  const training=base.corpusWords(source.slice(0,240000));
  const model=train(training),a=base.lp2Page(28),b=base.lp2Page(42);
  const n=Math.min(a.xs.length,b.xs.length),cut=Math.floor(n/2);
  const selected=fit(a,b,model.conditional),f=canonical(selected.selected.permutation);
  const dict=uniqueDictionary(training);
  const wordsA=pageWords(28),wordsB=pageWords(42);
  const overlaps=makeOverlaps(wordsA,wordsB,dict).filter(e=>e.start>=cut&&e.start+e.size<=n);
  const rows=[],testB=b.xs.slice(cut,n);
  for(let shift=0;shift<testB.length;shift++){
    const shifted={...b,xs:b.xs.slice()};
    for(let t=cut;t<n;t++)shifted.xs[t]=testB[(t-cut+shift)%testB.length];
    const forward=llr(a,shifted,model.conditional,f,cut,n);
    const iid=slotIID(a,shifted,model.marginal,f,cut,n);
    const support=supports(a,shifted,f,overlaps);
    rows.push({shift,forward,iid,excess:forward-iid,dictionaryWords:support.found});
  }
  const ranks={};
  for(const field of ['forward','iid','excess','dictionaryWords']){
    const sorted=rows.slice().sort((a,b)=>b[field]-a[field]);
    ranks[field]={rank:sorted.findIndex(v=>v.shift===0)+1,
      maxima:sorted[0][field],median:sorted[Math.floor(sorted.length/2)][field]};
  }
  return {
    model:'unknown two-swap internal rune permutation trained ONLY on offsets 0..133',
    selectedPermutation:f,selectedSwaps:selected.selected.substitutions,
    actual:rows[0],eligibleWordOverlaps:overlaps.length,
    heldoutOffsets:[cut,n-1],testedRotations:rows.length,
    ranks,topByForward:rows.slice().sort((x,y)=>y.forward-x.forward).slice(0,8),
    topByExcess:rows.slice().sort((x,y)=>y.excess-x.excess).slice(0,5),
    interpretation:'This is a conditional, post-selected page-pair study, not evidence of recovered plaintext or a true key. Rotation ranks do not account for initial discovery.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(study(),null,2)+'\n');
module.exports={uniqueDictionary,inversePermutation,supports,slotIID,study};
