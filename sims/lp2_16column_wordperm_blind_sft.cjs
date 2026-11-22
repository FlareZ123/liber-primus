"use strict";

/**
 * Word-level 16-column transposition attack with actual original LP2 word lengths.
 * Complete synthetic planted-key calibration and fixed heldout original rows.
 * This does not assume any plaintext rune value or author-supplied word key.
 *
 * Source clue being tested: p15 4x4 square, sixteen red spans, 2896=16*181.
 * These counts do not prove a 16-column instruction. Decoder is independently
 * trained on GP29-native Shakespeare/Gibran word-length pairs only.
 * Node22 CommonJS; does not write files.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const base=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(base,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const tx=read("resources/liber-primus/lp2-transcription.txt");
const refText=[
  ["Gibran",read("resources/control/gibran_prophet_58585.txt")],
  ["Shakespeare",read("resources/control/shakespeare_first300k.txt")]
];
const W=16,H=181,N=W*H,K=12;
const runes=new Set(gp.runes);
const tokens=gp.translit.slice().sort((a,b)=>b.length-a.length);

/**
 * @returns {number[]}
 */
function originalWordLengths() {
  let runeCount=0,len=0,out=[];
  for(const ch of tx) {
    if(runes.has(ch)) {
      runeCount++;len++;
      if(runeCount===12956){out.push(len);break;}
    } else if(ch==="-"||ch==="."||ch==="&") {
      if(len)out.push(len);
      len=0;
    }
  }
  assert.equal(runeCount,12956);
  assert.equal(out.length,N);
  return out;
}
/** @param {string} word */
function gpLength(word) {
  const w=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  let n=0;
  for(let i=0;i<w.length;) {
    const size=w.startsWith("ING",i)?3:w.startsWith("IO",i)?2
      :(tokens.find(t=>w.startsWith(t,i))||"").length;
    assert.ok(size, "invalid English source grapheme "+word);
    i+=size;n++;
  }
  return n;
}
const refs=refText.map(([name,t])=>({
  name,lens:(t.match(/[A-Za-z]+/g)||[]).map(gpLength)
}));
assert.deepEqual(refs.map(x=>x.lens.length),[15733,55407]);
const bin=x=>Math.min(K-1,x-1);
const joint=new Float64Array(K*K),left=new Float64Array(K),right=new Float64Array(K);
let pairs=0;
for(const ref of refs)for(let i=1;i<ref.lens.length;i++) {
  const a=bin(ref.lens[i-1]),b=bin(ref.lens[i]);
  joint[a*K+b]++;left[a]++;right[b]++;pairs++;
}
const model=new Float64Array(K*K);
for(let a=0;a<K;a++)for(let b=0;b<K;b++)
  model[a*K+b]=Math.log((joint[a*K+b]+3)/(left[a]+3*K))
    -Math.log((right[b]+3)/(pairs+3*K));

// 16 exact equal-size printed source column blocks; any other convention is a
// different cipher that needs its own independent source selector.
/** @param {number[]} cipher @returns {number[][]} */
function blocks(cipher) {
  assert.equal(cipher.length,N);
  return Array.from({length:W},(_,i)=>cipher.slice(i*H,(i+1)*H));
}
/** @param {number[][]} cols @param {number} start @param {number} stop */
function edges(cols,start,stop) {
  const result=Array.from({length:W},()=>new Float64Array(W));
  for(let a=0;a<W;a++)for(let b=0;b<W;b++)if(a!==b) {
    let s=0;
    for(let i=start;i<stop;i++)
      s+=model[bin(cols[a][i])*K+bin(cols[b][i])];
    result[a][b]=s;
  }
  return result;
}
/**
 * Find exact maximum scoring Hamiltonian *path* through sixteen ciphertext
 * column IDs via Held-Karp DP. No assumed source key, no language training
 * on original. The row-seam transition is left out of training to ensure
 * an unadjusted heldout consecutive-column evaluation.
 * @param {Float64Array[]} costs
 * @returns {number[]}
 */
function optimalOrder(costs) {
  const states=1<<W, dp=new Float64Array(states*W).fill(-Infinity);
  const parent=new Int8Array(states*W).fill(-1);
  for(let j=0;j<W;j++)dp[(1<<j)*W+j]=0;
  for(let mask=1;mask<states;mask++) {
    let rest=(states-1)^mask;
    for(let last=0;last<W;last++) {
      const old=dp[mask*W+last];
      if(old===-Infinity)continue;
      let remain=rest;
      while(remain) {
        const bit=remain&-remain,j=31-Math.clz32(bit);
        const at=(mask|bit)*W+j,candidate=old+costs[last][j];
        if(candidate>dp[at]){dp[at]=candidate;parent[at]=last;}
        remain^=bit;
      }
    }
  }
  const full=states-1;
  let last=0;
  for(let j=1;j<W;j++)
    if(dp[full*W+j]>dp[full*W+last])last=j;
  const order=[];
  let mask=full;
  while(last!==-1) {
    order.push(last);
    const prev=parent[mask*W+last];
    mask^=1<<last;
    last=prev;
  }
  return order.reverse();
}
/**
 * Heldout pointwise English conditional-length log-ratio per within-row pair.
 * @param {number[][]} cols
 * @param {number[]} order
 * @param {number} from
 * @param {number} to
 */
function score(cols,order,from,to) {
  let sum=0;
  for(let j=1;j<order.length;j++)
    for(let r=from;r<to;r++)
      sum+=model[bin(cols[order[j-1]][r])*K+bin(cols[order[j]][r])];
  return sum/((order.length-1)*(to-from));
}
const identity=Array.from({length:W},(_,i)=>i);
const FOLDS=[
  {name:"pilot_earlier_rows_train",train:[0,120],test:[120,H]},
  {name:"independent_later_rows_train",train:[60,H],test:[0,60]}
];
/** @param {number[]} x */
function analyze(x) {
  const cols=blocks(x);
  return FOLDS.map(f=>{
    const order=optimalOrder(edges(cols,...f.train));
    return {name:f.name,order,
      trainingScore:score(cols,order,...f.train),
      heldoutScore:score(cols,order,...f.test),
      identityHeldout:score(cols,identity,...f.test)};
  });
}
/** @param {number[]} seq @param {number[]} key */
function encipherColumnar(seq,key) {
  assert.equal(seq.length,N);assert.equal(key.length,W);
  const cols=Array.from({length:W},()=>[]);
  for(let i=0;i<seq.length;i++)cols[i%W].push(seq[i]);
  return key.flatMap(k=>cols[k]);
}
let seed=0x00133010;
function rand() {seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;}
function randomOrder(n) {
  const out=Array.from({length:n},(_,i)=>i);
  for(let i=n-1;i>0;i--) {
    const j=Math.floor(rand()*(i+1));
    [out[i],out[j]]=[out[j],out[i]];
  }
  return out;
}
/** @param {number[]} seq */
function shuffle(seq) {
  const out=seq.slice();
  for(let i=out.length-1;i>0;i--) {
    const j=Math.floor(rand()*(i+1));
    [out[i],out[j]]=[out[j],out[i]];
  }
  return out;
}
function nullColumnShuffle(source) {
  const cols=blocks(source).map(shuffle);
  return cols.flat();
}
/** @param {number[]} x */
function stats(x) {
  const ordered=x.slice().sort((a,b)=>a-b);
  return {n:x.length,min:ordered[0],
    median:ordered[Math.floor(x.length/2)],
    max:ordered[ordered.length-1],
    mean:x.reduce((s,v)=>s+v,0)/x.length,
    p025:ordered[Math.floor(.025*x.length)],
    p975:ordered[Math.floor(.975*x.length)]};
}
const unknown=originalWordLengths();
const original=analyze(unknown);

// Both nulls reproduce the full original length multiset. Column shuffle
// additionally conditions on each original column's own word-length counts.
const NULLS=24,nulls=[];
for(const kind of ["global","perCipherColumn"]) {
  const records=[];
  for(let i=0;i<NULLS;i++) {
    const arr=kind==="global"?shuffle(unknown):nullColumnShuffle(unknown);
    const a=analyze(arr);
    records.push(a.map(x=>x.heldoutScore));
  }
  nulls.push({kind,folds:FOLDS.map((f,i)=>{
    const values=records.map(x=>x[i]);
    return {fold:f.name,stats:stats(values),
      nullAtOrAboveOriginal:values.filter(x=>x>=original[i].heldoutScore).length,
      empiricalUpperP:(1+values.filter(x=>x>=original[i].heldoutScore).length)/(NULLS+1)};
  })});
}

// Native English control generator. Hidden key and source exact passage are
// never supplied to the optimizer, only scored after its frozen path choice.
const PLANTS=8,plants=refs.map(ref=>{
  const outcomes=[];
  for(let j=0;j<PLANTS;j++) {
    const at=Math.floor(rand()*(ref.lens.length-N+1));
    const plain=ref.lens.slice(at,at+N),key=randomOrder(W);
    const ciphertext=encipherColumnar(plain,key);
    const a=analyze(ciphertext);
    const trueOrder=identity.map(j=>key.indexOf(j));
    outcomes.push(a.map((x,i)=>{
      const correctAdjacent=x.order.slice(1).filter((c,j)=>
        trueOrder.some((t,k)=>k>0&&t===c&&trueOrder[k-1]===x.order[j])).length;
      return {fold:FOLDS[i].name,correctOf15Adjacent:correctAdjacent,
        heldoutRecovered:x.heldoutScore,
        heldoutTrue:score(blocks(ciphertext),trueOrder,...FOLDS[i].test)};
    }));
  }
  return {source:ref.name,plants:PLANTS,folds:FOLDS.map((fold,i)=>{
    const v=outcomes.map(x=>x[i]);
    return {fold:fold.name,
      heldoutRecovered:stats(v.map(x=>x.heldoutRecovered)),
      heldoutTrue:stats(v.map(x=>x.heldoutTrue)),
      correctAdjacentEdgesOf15:stats(v.map(x=>x.correctOf15Adjacent))};
  })};
});
const report={test:"source-hypothesized 16-column original word permutation",
  width:W,rows:H,originalWords:N,trainAndHeldoutFolds:FOLDS,
  model:"GP29 word-length transition log-ratio; independent Shakespeare+Gibran",
  original,nulls,plants,
  caveat:"No author selected this exact width/order, recovered key, source plaintext or cipher. Training-only path optimizations are not evidence"};
console.log(JSON.stringify(report,null,2));
