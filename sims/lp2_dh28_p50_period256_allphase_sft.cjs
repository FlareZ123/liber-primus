'use strict';

/** Original direct p50-256 byte key for nonzero GF29 step/DH28 exponent. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const gp=JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'),'utf8'));
const g=JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-grid-256.json'),'utf8'));
const transcript=fs.readFileSync(path.join(root,
  'resources/lp2-transcription.txt'),'utf8');
const pages=gp.pages.filter(p=>p.page<=55&&p.indices.length);
const cipher=pages.flatMap(p=>p.indices);
assert.equal(cipher.length,12956);
assert.equal(g.bytes.length,256);
const key=Uint8Array.from(g.bytes.map(x=>x%28));
const runeIndex=new Map(gp.runes.map((r,i)=>[r,i]));
const wordTime=new Uint16Array(cipher.length);
let runePosition=0,word=-1,inWord=false;
for(const ch of transcript.split('%').slice(0,55).join('%')){
  if(runeIndex.has(ch)){
    if(!inWord){word++;inWord=true}
    wordTime[runePosition++]=word;
  }else if(ch==='%'||ch==='/'||/\s/u.test(ch)){}
  else inWord=false;
}
assert.equal(runePosition,cipher.length);
assert.equal(word+1,2896);
const heads=[],pageTime=new Uint16Array(cipher.length);
let start=0;
for(const p of pages){
  heads.push(start);
  for(let i=0;i<p.indices.length;i++)pageTime[start+i]=i;
  start+=p.indices.length;
}
const isHead=new Set(heads);
const log=new Int16Array(29).fill(-1);
let state=1;
for(let i=0;i<28;i++){
  assert.equal(log[state],-1);
  log[state]=i;state=state*2%29;
}
assert.equal(state,1);
const originalStep=new Int16Array(cipher.length).fill(-1);
const nzTime=new Uint16Array(cipher.length);
let nonzero=0,zeros=0;
for(let i=1;i<cipher.length;i++){
  if(isHead.has(i))continue;
  const d=(cipher[i]-cipher[i-1]+29)%29;
  if(!d){zeros++;continue}
  originalStep[i]=log[d];
  nzTime[i]=nonzero++;
}
assert.equal(zeros,86);
assert.equal(nonzero,12815);
const first=pages.filter(p=>p.page<15).reduce((n,p)=>n+p.indices.length,0);
const chapterEnd=first+pages.filter(p=>p.page>=15&&p.page<=22)
  .reduce((n,p)=>n+p.indices.length,0);
assert.equal(chapterEnd-first,1903);
const modes=[
 ['global-rune',i=>i],
 ['page-rune',i=>pageTime[i]],
 ['global-word',i=>wordTime[i]],
 ['nonzero-rank',i=>nzTime[i]]
];
function ioc(hist,n){
  return hist.reduce((sum,x)=>sum+x*(x-1),0)/(n*(n-1));
}
const summary=[];
for(const [mode,clock] of modes)for(const sign of [-1,1]){
  let fullBest={ioc:-Infinity},chapterBest={ioc:-Infinity};
  for(let phase=0;phase<256;phase++){
    const all=new Uint16Array(28),ch=new Uint16Array(28);
    let n=0,m=0;
    for(let i=1;i<cipher.length;i++){
      if(originalStep[i]<0)continue;
      const index=(clock(i)+phase)&255;
      const value=(originalStep[i]+sign*key[index]+28)%28;
      all[value]++;n++;
      if(i>=first&&i<chapterEnd){ch[value]++;m++}
    }
    const a={phase,ioc:ioc(all,n),top1:Math.max(...all)};
    const b={phase,ioc:ioc(ch,m),top1:Math.max(...ch)};
    if(a.ioc>fullBest.ioc)fullBest=a;
    if(b.ioc>chapterBest.ioc)chapterBest=b;
  }
  summary.push({mode,sign,fullBest,chapterBest});
}
assert.equal(summary.length,8);
assert(summary.every(r=>r.fullBest.ioc<0.036));
assert(summary.every(r=>r.chapterBest.ioc<0.037));
const bestAll=Math.max(...summary.map(x=>x.fullBest.ioc));
const bestChapter=Math.max(...summary.map(x=>x.chapterBest.ioc));
assert.equal(bestAll,0.03581981300812166);
assert.equal(bestChapter,0.036304606148665014);

// Full-length native-GP reversible positive: direct p50 byte period256,
// hidden 28-way alphabet 11p+3, reserved EA literal as zero difference.
// Clear p57 is an original source text. Physical page heads remain arbitrary.
const p57=gp.pages.find(p=>p.page===57).indices;
assert.equal(p57.length,95);
const plain=Array.from({length:cipher.length},(_,i)=>p57[i%95]);
for(let i=151;i<cipher.length;i+=151)plain[i]=28;
const planted=new Uint8Array(cipher.length);
let k0=0;
for(const p of pages){
  planted[k0]=(7+k0)%29;
  for(let j=1;j<p.indices.length;j++){
    const idx=k0+j;
    let d=0;
    if(plain[idx]!==28){
      const exp=(11*plain[idx]+3+key[idx&255])%28;
      d=1;
      for(let z=0;z<exp;z++)d=d*2%29;
    }
    planted[idx]=(planted[idx-1]+d)%29;
  }
  k0+=p.indices.length;
}
let recovered=0,exceptions=0;
for(let i=1;i<planted.length;i++){
  if(isHead.has(i))continue;
  const d=(planted[i]-planted[i-1]+29)%29;
  if(!d){
    assert.equal(plain[i],28);exceptions++;recovered++;continue;
  }
  const q=(log[d]-key[i&255]+28)%28;
  const p=(23*(q-3+28))%28; // 11^{-1}=23 modulo28
  assert.equal(p,plain[i]);
  recovered++;
}
assert.equal(recovered,12901);
assert(exceptions>=80);
console.log(JSON.stringify({
  model:'source period256 p50 byte modulo28 reused as DH28 nonzero-step exponent key',
  original:{runicSymbols:cipher.length,validNonzeroSteps:nonzero,
    originalZeroSteps:zeros,bestFullBookIoC:bestAll,
    bestP15ChapterIoC:bestChapter,modes:summary},
  nativePositive:{entireBookExactRecovery:recovered,
    zeroStepEAExceptions:exceptions,
    allSourceNativeRunesReencryptedExactly:true}
},null,2));
