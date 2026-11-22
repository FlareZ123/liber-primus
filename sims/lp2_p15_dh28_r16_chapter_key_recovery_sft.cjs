'use strict';

/**
 * Source-led DH group-of-28 chain-cipher original key recovery.
 *
 * The original GP field has 29 elements. A primitive root 2 yields exactly
 * 28 nonzero additive steps; the reserved zero step can encode rare GP EA.
 * The printed p50 source's degree16 cofactor is reduced modulo 28, the
 * multiplicative group order, to supply a candidate 16-stage key clock.
 *
 * The eighteen one-rune p15–22 source words give enough linear constraints
 * to reconstruct all 16 secret state cells plus any secret 28-way A/I images
 * by CRT over Z4 and Z7, without guessing the starting state.
 *
 * No source authenticates the DH28 chain model. Positive plants calibrate
 * the inverse; unknown-page plaintext is only claimed if the original
 * ranked output independently passes a language test.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const cp=JSON.parse(fs.readFileSync(
  path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const raw=fs.readFileSync(
  path.join(root,'resources/lp2-transcription.txt'),'utf8');
const mod=(x,m=28)=>(x%m+m)%m;
const poly=[13,20,26,12,6,2,13,26,6,26,11,7,15,11,17,25,1];
const runeMap=new Map(cp.runes.map((r,i)=>[r,i]));
const input=cp.pages.filter(p=>p.page>=15&&p.page<=22).flatMap(p=>p.indices);
assert.equal(input.length,1903);
const globalStart=cp.pages.filter(p=>p.page<15)
  .reduce((n,p)=>n+p.indices.length,0);
assert.equal(globalStart,3603);
const allWords=[];let word=[],offset=0;
function close(){
  if(word.length){allWords.push({start:word[0][0],
    glyphs:word.map(x=>x[1])});word=[];}
}
for(const ch of raw.split('%').slice(0,55).join('%')){
  if(runeMap.has(ch))word.push([offset++,runeMap.get(ch)]);
  else if(ch==='%'||ch==='/'||/\s/u.test(ch)){}
  else close();
}
close();
assert.equal(allWords.length,2896);
assert.equal(offset,12956);
const words=allWords.filter(w=>w.start>=globalStart&&
  w.start<globalStart+input.length)
  .map((w,i)=>({start:w.start-globalStart,
    glyphs:w.glyphs,ordinal:i}));
assert.equal(words.length,437);
const anchors=words.filter(w=>w.glyphs.length===1)
  .map(w=>w.start);
assert.equal(anchors.length,18);
const exp2=Array(28).fill(0);const log2=new Int8Array(29).fill(-1);
let exp=1;
for(let i=0;i<28;i++){
  assert.equal(log2[exp],-1);
  exp2[i]=exp;log2[exp]=i;exp=exp*2%29;
}
assert.equal(exp,1);
assert.equal(exp2.includes(0),false);
assert.equal(new Set(exp2).size,28);
const chrono=Array.from({length:input.length},(_,i)=>i);

function readLogSteps(cipher){
  const d=new Int8Array(cipher.length).fill(-1);
  let zero=0;
  for(let i=1;i<cipher.length;i++){
    const diff=mod(cipher[i]-cipher[i-1],29);
    if(diff===0){zero++;continue}
    d[i]=log2[diff];
    assert(d[i]>=0);
  }
  assert(anchors.every(i=>d[i]>=0),
    'all original one-rune words need nonzero DH step');
  return {d,zero};
}
const originalSteps=readLogSteps(input);
assert.equal(originalSteps.zero,10);

function rows28(n){
  const a=poly.map(x=>mod(x));
  const out=Array.from({length:16},(_,i)=>{
    const row=new Uint8Array(16);row[i]=1;return row;
  });
  for(let t=16;t<n;t++){
    const row=new Uint8Array(16);
    for(let j=0;j<16;j++){
      let s=0;
      for(let k=0;k<16;k++)s+=a[k]*out[t-16+k][j];
      row[j]=mod(-s);
    }
    out.push(row);
  }
  return out;
}

function inverseMatrix(input,m){
  const inv=Array(m).fill(0);
  for(let i=1;i<m;i++)for(let j=1;j<m;j++)
    if(i*j%m===1)inv[i]=j;
  const a=input.map((r,i)=>[
    ...r.map(v=>mod(v,m)),
    ...Array.from({length:16},(_,j)=>+(i===j))
  ]);
  for(let i=0;i<16;i++){
    let p=i;
    while(p<16&&!inv[a[p][i]])p++;
    assert(p<16,'source first16 anchor matrix not invertible mod '+m);
    [a[i],a[p]]=[a[p],a[i]];
    const mul=inv[a[i][i]];
    for(let k=i;k<32;k++)a[i][k]=mod(a[i][k]*mul,m);
    for(let j=0;j<16;j++){
      if(j===i)continue;
      const t=a[j][i];
      if(t)for(let k=i;k<32;k++)
        a[j][k]=mod(a[j][k]-t*a[i][k],m);
    }
  }
  return a.map(row=>row.slice(16));
}
const crt=(a4,b7)=>mod(a4+4*mod(2*(b7-a4),7),28);
const dot=(a,b)=>mod(a.reduce((v,x,i)=>v+x*b[i],0));

function solve(steps, rows, label){
  const anchorsC=anchors.map(i=>steps[i]);
  assert(anchorsC.every(c=>c>=0&&c<28));
  const first=anchors.slice(0,16).map(i=>rows[i]);
  const i4=inverseMatrix(first,4),i7=inverseMatrix(first,7);
  const inverse28=i4.map((row,i)=>row.map((x,j)=>crt(x,i7[i][j])));
  for(let i=0;i<16;i++)for(let j=0;j<16;j++)
    assert.equal(dot(first[i],inverse28.map(x=>x[j])),+(i===j));
  const interpolate=t=>Array.from({length:16},(_,j)=>{
    let s=0;for(let k=0;k<16;k++)s+=rows[t][k]*inverse28[k][j];
    return mod(s);
  });
  const l1=interpolate(anchors[16]),l2=interpolate(anchors[17]);
  const baseC=anchorsC.slice(0,16);
  const h1=mod(anchorsC[16]-dot(l1,baseC));
  const h2=mod(anchorsC[17]-dot(l2,baseC));
  const total1=l1.reduce((a,b)=>a+b,0)%28;
  const total2=l2.reduce((a,b)=>a+b,0)%28;
  const sample=chrono.filter(i=>
    i%7===2&&steps[i]>=0&&!anchors.includes(i));
  assert(sample.length>=265);
  const ip=sample.map(i=>interpolate(i));
  const bases=ip.map(row=>dot(row,baseC));
  const sums=ip.map(row=>row.reduce((a,b)=>a+b,0)%28);
  const sumI=new Uint8Array(sample.length);
  const survivors=[];
  let countPatterns=0,consistentSingular=0;
  function register(mask,uA,uI){
    if(uA===uI)return;
    const freq=new Uint16Array(28);
    for(let j=0;j<sample.length;j++){
      const key=bases[j]-sums[j]*uA-sumI[j]*(uI-uA);
      freq[mod(steps[sample[j]]-key)]++;
    }
    const pairs=freq.reduce((s,n)=>s+n*(n-1),0);
    survivors.push({mask,uA,uI,screen:pairs/(sample.length*(sample.length-1))});
  }
  let previousGray=0,sumI1=0,sumI2=0;
  for(let n=0;n<(1<<15);n++){
    const gray=n^(n>>>1);
    if(n){
      const delta=gray^previousGray;
      const bit=31-Math.clz32(delta);
      const sign=(gray&delta)?1:-1;
      sumI1=mod(sumI1+sign*l1[bit+1]);
      sumI2=mod(sumI2+sign*l2[bit+1]);
      for(let j=0;j<sample.length;j++)
        sumI[j]=mod(sumI[j]+sign*ip[j][bit+1]);
    }
    previousGray=gray;
    for(let endings=0;endings<4;endings++){
      countPatterns++;
      const e1=endings&1,e2=(endings>>>1)&1;
      const a=mod((e1?0:1)-total1+sumI1);
      const b=mod(e1-sumI1);
      const c=mod((e2?0:1)-total2+sumI2);
      const d=mod(e2-sumI2);
      const p4=[],p7=[];
      for(let uA=0;uA<4;uA++)for(let uI=0;uI<4;uI++)
        if(mod(a*uA+b*uI,4)===h1%4&&
          mod(c*uA+d*uI,4)===h2%4)p4.push([uA,uI]);
      for(let uA=0;uA<7;uA++)for(let uI=0;uI<7;uI++)
        if(mod(a*uA+b*uI,7)===h1%7&&
          mod(c*uA+d*uI,7)===h2%7)p7.push([uA,uI]);
      if(p4.length*p7.length>1)consistentSingular++;
      for(const [x,y] of p4)for(const [u,v] of p7)
        register(gray,crt(x,u),crt(y,v));
    }
  }
  survivors.sort((a,b)=>b.screen-a.screen);
  const selected=survivors.slice(0,1500).map(candidate=>{
    const plain16=baseC.map((c,j)=>mod(c-
      (j===0||((candidate.mask>>(j-1))&1)===0?
        candidate.uA:candidate.uI)));
    const seed=inverse28.map(row=>dot(row,plain16));
    const bins=new Uint16Array(28);
    let n=0;
    for(let i=1;i<steps.length;i++){
      if(steps[i]<0)continue;
      bins[mod(steps[i]-dot(rows[i],seed))]++;
      n++;
    }
    const pairs=bins.reduce((s,b)=>s+b*(b-1),0);
    return {...candidate,seed,full:pairs/(n*(n-1)),
      maxRuneCount:Math.max(...bins),validRunes:n};
  }).sort((a,b)=>b.full-a.full);
  const answer={
    label,
    assignments:countPatterns,
    keyCandidates:survivors.length,
    multiplyConsistentEndSystems:consistentSingular,
    sampleRunes:sample.length,
    bestSample:survivors[0]?.screen,
    bestFullFromTop1500:selected[0]?.full,
    top3:selected.slice(0,3).map(x=>({
      screen:x.screen,full:x.full,mask:x.mask,
      uA:x.uA,uI:x.uI,seed:x.seed,maxRuneCount:x.maxRuneCount
    }))
  };
  if(label==='native-plant'){
    const expected=Array.from({length:16},(_,j)=>(3+7*j)%28);
    const real=selected.find(c=>c.seed.every((v,j)=>v===expected[j]));
    answer.knownSeedFound=Boolean(real);
    answer.knownSeedRank=real?selected.indexOf(real)+1:-1;
    answer.knownSeedIoC=real?.full;
  }
  return answer;
}
const rows=rows28(input.length);
const native=cp.pages.find(p=>p.page===57).indices;
assert.equal(native.length,95);
const truth=Array.from({length:input.length},(_,i)=>native[i%95]);
for(let i=1;i<truth.length;i++)if(i%151===0)truth[i]=28;
anchors.forEach((pos,i)=>truth[pos]=i%2?10:24);
const knownSeed=Array.from({length:16},(_,j)=>(3+7*j)%28);
const positive=new Array(input.length);
positive[0]=9;
for(let i=1;i<positive.length;i++){
  const code=truth[i]===28?-1:
    mod(11*truth[i]+3+dot(rows[i],knownSeed));
  positive[i]=truth[i]===28?positive[i-1]:
    mod(positive[i-1]+exp2[code],29);
}
const positiveSteps=readLogSteps(positive);
assert(positiveSteps.zero>=12);
const originalResult=solve(originalSteps.d,rows,'original');
const plantedResult=solve(positiveSteps.d,rows,'native-plant');
assert(plantedResult.knownSeedFound);
assert.equal(plantedResult.knownSeedRank,1);
const result={
  verdict:'Original DH28 log-step and source R16 modulo28 p15 chapter key reconstruction',
  source:'1903 original p15–22 cipher runes, 18 singleton A/I anchors, 10 original repeats',
  model:'C_i=C_(i-1)+2^((sigma(P_i)+K_i) mod28) mod29; EA->same rune',
  original:originalResult,
  nativePositive:{
    ...plantedResult,
    zeroSteps:positiveSteps.zero,
    fullExactForwardAndLogInverse:true
  }
};
console.log(JSON.stringify(result,null,2));
