'use strict';
/* node sims/lp2_pair_binary_affine_rigidity_sft.cjs */
const assert=require('node:assert/strict');
const corpus=require('../resources/liber-primus/lp2-corpus.json');
const tape=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
assert.equal(tape.length,12956);
/** @param {number[]} cols */
function rank(cols){
  const base=Array(5).fill(0);
  let r=0;
  for(let x of cols)for(let i=4;i>=0;i--){
    if(!(x&(1<<i)))continue;
    if(base[i])x^=base[i];
    else{base[i]=x;r++;break;}
  }
  return r;
}
/** @param {number[]} cols */
function image(cols){
  return Array.from({length:32},(_,x)=>{
    let y=0;
    for(let i=0;i<5;i++)if(x&(1<<i))y^=cols[i];
    return y;
  });
}
/** @param {number[]} v @param {number} offset */
function support(v,offset){
  const M=Array.from({length:29},()=>Array(29).fill(0));
  for(let i=offset;i+1<v.length;i+=2)M[v[i]][v[i+1]]++;
  const missing=[];
  const rows=Array(29).fill(0),cols=Array(29).fill(0);
  for(let i=0;i<29;i++)for(let j=0;j<29;j++)if(!M[i][j]){
    missing.push([i,j]);rows[i]++;cols[j]++;
  }
  return {M,missing,fullRows:rows.filter(x=>x===0).length,
    fullCols:cols.filter(x=>x===0).length,maxRow:Math.max(...rows),maxCol:Math.max(...cols)};
}
const scopes=[support(tape,0),support(tape,1)];
for(const s of scopes){
  assert(s.maxRow<=1&&s.maxCol<=1);
  assert(s.fullRows>16&&s.fullCols>16);
}
// Finite rank-pair capacity derivation for surjective mixed output projections.
// If both ranks <5, each output has 2^(r+s-5) fiber decompositions.
// Whole empty fibers or a missing singleton-singleton edge are the only
// ways a decomposition can fail when absent input pairs form a matching.
const proof=[];
for(let r=1;r<=5;r++)for(let s=r;s<=5;s++){
  if(r+s<5)continue;
  if(s===5){
    proof.push({r,s,lower:30,case:'two distinct translates of an odd 29-set'});
    continue;
  }
  const f=1<<(5-r),g=1<<(5-s);
  const decomp=1<<(r+s-5);
  const blocked=Math.floor(3/f)+Math.floor(3/g)+
    Math.min(Math.floor(3/(f-1)),Math.floor(3/(g-1)));
  if(r===1&&s===4){
    proof.push({r,s,decomp,blocked,lower:30,case:'complementary images; >=15 rank4 fibers and both rank1 fibers'});
  }else{
    assert(blocked<decomp);
    proof.push({r,s,decomp,blocked,lower:32,case:'a nonempty surviving fiber pair for every output'});
  }
}
// Deterministic adversarial parameter sanity check.  This samples the
// theorem's full rank types, not an exhaustive matrix search or key fit.
let state=0x25b1af19;
function random(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}
function shuffle(a){
  for(let i=a.length-1;i>0;i--){const j=random()%(i+1);[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
function secretAlphabet(){return shuffle(Array.from({length:32},(_,i)=>i)).slice(0,29);}
function randomMap(r){
  const b=[];
  while(b.length<r){const v=1+random()%31;if(rank([...b,v])>b.length)b.push(v);}
  for(let tries=0;tries<1000;tries++){
    const c=Array.from({length:5},()=>{
      let v=0,m=random()%(1<<r);
      for(let j=0;j<r;j++)if(m&(1<<j))v^=b[j];
      return v;
    });
    if(rank(c)===r)return c;
  }
  throw Error('could not sample rank');
}
function projectionSize(M,A,B,L,R,t){
  const a=image(L),b=image(R),seen=new Set();
  for(let i=0;i<29;i++)for(let j=0;j<29;j++)
    if(M[i][j])seen.add(a[A[i]]^b[B[j]]^t);
  return seen.size;
}
const trials=[];
for(const row of proof){
  let min=32,n=0,attempts=0;
  for(let iter=0;iter<128;iter++){
    let L,R;
    do{L=randomMap(row.r);R=randomMap(row.s);attempts++;}while(rank([...L,...R])!==5);
    const A=secretAlphabet(),B=secretAlphabet(),t=random()%32;
    for(const s of scopes){
      const count=projectionSize(s.M,A,B,L,R,t);
      assert(count>=row.lower);
      min=Math.min(min,count);n++;
    }
  }
  trials.push({r:row.r,s:row.s,attempts,n,min});
}
for(let i=0;i<128;i++){
  const A=secretAlphabet(),B=secretAlphabet(),L=randomMap(5),Z=Array(5).fill(0);
  for(const s of scopes){
    assert.equal(projectionSize(s.M,A,B,L,Z,random()%32),29);
    assert.equal(projectionSize(s.M,A,B,Z,L,random()%32),29);
  }
}
// Authentic known-text restricted-domain positives.  The mixed invertible
// map (x,y)->(x XOR y,y) is legal on these particular native pair supports,
// though it is not a globally closed GP29^2 map.  Choose output alphabet
// explicitly to contain the emitted codes; this is calibration only.
const plants=[];
for(const page of [56,57]){
  const p=corpus.pages.find(x=>x.page===page).indices;
  const plain=corpus.pages.find(x=>x.page===57).indices; // p57 is clear GP.
  const v=page===57?plain:p;
  // p56's stored indices are ciphertext, not its solved plaintext.
  // Only p57 is used as native plaintext; skip the encrypted p56 array.
  if(page!==57)continue;
  for(let off=0;off<2;off++){
    const raw=[];
    for(let i=off;i+1<v.length;i+=2)raw.push(v[i]^v[i+1],v[i+1]);
    const emitted=[...new Set(raw.filter((_,i)=>i%2===0))];
    assert(emitted.length<=29);
    const A=[...emitted,...shuffle(Array.from({length:32},(_,i)=>i)
      .filter(x=>!emitted.includes(x))).slice(0,29-emitted.length)];
    const enc=raw.map((x,i)=>i%2?x:A.indexOf(x));
    const dec=[];
    for(let i=0;i<enc.length;i+=2)dec.push(A[enc[i]]^enc[i+1],enc[i+1]);
    assert.equal(dec.join(','),v.slice(off,off+raw.length).join(','));
    const ss=support(enc,0);
    assert(ss.maxRow>1||ss.maxCol>1);
    plants.push({page,offset:off,runes:raw.length,firstLaneCodes:emitted.length,
      maxMissingRow:ss.maxRow,maxMissingCol:ss.maxCol,exact:true});
  }
}
console.log(JSON.stringify({runes:tape.length,
  scopes:scopes.map(({M,...x},offset)=>({offset,...x})),
  proof,trials,pureLaneTrials:512,plants,finalSeed:state},null,2));
