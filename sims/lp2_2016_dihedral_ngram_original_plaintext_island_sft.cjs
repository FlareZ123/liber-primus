'use strict';
/**
 * Period-authored 2016 shift-independent score, fixed and converted to a
 * direct whole-manuscript plaintext search for 40-rune affine/Atbash islands.
 * Uses the true dihedral invariant d29, not |a-b| under mod29 wrap.
 * Original source: https://cicada3301.boards.net/thread/12/case-shift-independent-text-analysis
 * Node22 CommonJS, read-only, original plus p57 authentic clear positive.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const gp=require('../resources/liber-primus/lp2-corpus.json');
const root=path.join(__dirname,'..');
const read=x=>fs.readFileSync(path.join(root,x),'utf8');
const sourceFiles=[
 ['Shakespeare','resources/control/shakespeare_first300k.txt'],
 ['Gibran','resources/control/gibran_prophet_58585.txt'],
 ['Emerson','resources/control/emerson_essays_2944.txt']
];
const alpha=gp.translit.map((token,n)=>({token,n})).sort((a,b)=>b.token.length-a.token.length);
function enc(text){
 const ret=[];
 const normalized=text.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S').replace(/Q/g,'C');
 for(const word of normalized.match(/[A-Z]+/g)||[]){
  for(let i=0;i<word.length;){
   const x=alpha.find(z=>word.startsWith(z.token,i));
   assert(x);
   ret.push(x.n);i+=x.token.length;
  }
 }
 return ret;
}
const files=sourceFiles.map(([label,file])=>{
 const v=enc(read(file));const split=Math.floor(v.length*0.70);
 return {label,train:v.slice(0,split),test:v.slice(split)};
});
const mod=x=>(x%29+29)%29;
function dist(a,b){const x=mod(b-a);return Math.min(x,29-x);}
for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let k=0;k<29;k++){
 assert.equal(dist(a,b),dist(mod(a+k),mod(b+k)));
 assert.equal(dist(a,b),dist(mod(-a+k),mod(-b+k)));
}
function countTetragrams(step){
 const ct=new Uint32Array(15**4);
 for(let i=0;i+3<step.length;i++)ct[3375*step[i]+225*step[i+1]+15*step[i+2]+step[i+3]]++;
 return ct;
}
function steps(v){
 const d=[];
 for(let i=1;i<v.length;i++)d.push(dist(v[i-1],v[i]));
 return d;
}
const counts=new Uint32Array(15**4);
for(const src of files){
 const c=countTetragrams(steps(src.train));
 c.forEach((v,i)=>counts[i]+=v);
}
const total=counts.reduce((x,y)=>x+y,0);
function score(v){
 let s=0;
 const d=steps(v);
 for(let j=0;j+3<d.length;j++)
  s+=Math.log((counts[3375*d[j]+225*d[j+1]+15*d[j+2]+d[j+3]]+0.5)/(total+0.5*counts.length));
 return s/(d.length-3);
}
const W=40;
const p=gp.pages.filter(x=>x.page<=55&&x.indices.length);
const unsolved=[];
for(const x of p)for(let i=0;i+W<=x.indices.length;i++)
 unsolved.push({page:x.page,offset:i,s:score(x.indices.slice(i,i+W))});
unsolved.sort((a,b)=>b.s-a.s);
const nSource=[];
for(const {label,test} of files)for(let i=0;i+W<=test.length;i+=W)
 nSource.push({label,s:score(test.slice(i,i+W))});
nSource.sort((a,b)=>a.s-b.s);
const solved57=gp.pages.find(x=>x.page===57);
assert(solved57&&solved57.indices.length>=95);
const positive=[];
for(let i=0;i+W<=solved57.indices.length;i+=5)
 positive.push({offset:i,s:score(solved57.indices.slice(i,i+W))});
const percentile=(v,t)=>v[Math.min(v.length-1,Math.floor((v.length-1)*t))].s;
const sourceThreshold=percentile(nSource,0.01);
const p57min=Math.min(...positive.map(x=>x.s)),p57max=Math.max(...positive.map(x=>x.s));
const originalAbove1=unsolved.filter(z=>z.s>=sourceThreshold).length;
const originalAboveP57=unsolved.filter(z=>z.s>=p57min).length;
const sampleTrain=files[0].train.slice(20000,20000+W);
const tests=[];
for(let k=0;k<29;k++)for(const sign of [-1,1]){
 const transformed=sampleTrain.map(x=>mod(sign*x+k));
 tests.push({sign,k,err:Math.abs(score(transformed)-score(sampleTrain))});
}
assert(tests.every(x=>x.err<1e-12));
const words=unsolved.slice(0,20).map(x=>{
 const vals=gp.pages.find(z=>z.page===x.page).indices.slice(x.offset,x.offset+W);
 return {...x,cipherGP:vals.map(v=>gp.translit[v]).join(''),rawIndices:vals};
});

const ptcounts=new Uint32Array(29**3);
for(const f of files)for(let i=0;i+2<f.train.length;i++){
 const x=f.train;ptcounts[841*x[i]+29*x[i+1]+x[i+2]]++;
}
const pttotal=ptcounts.reduce((a,b)=>a+b,0);
function plainScore(v){
 let s=0;
 for(let i=0;i+2<v.length;i++)
  s+=Math.log((ptcounts[841*v[i]+29*v[i+1]+v[i+2]]+0.5)/
    (pttotal+0.5*ptcounts.length));
 return s/(v.length-2);
}
function phaseRank(original){
 const rows=[];
 for(let sign of [1,-1])for(let shift=0;shift<29;shift++){
  const dec=original.map(x=>mod(sign*x+shift));
  rows.push({sign,shift,score:plainScore(dec),
    text:dec.map(x=>gp.translit[x]).join('')});
 }
 return rows.sort((a,b)=>b.score-a.score);
}
const best=words[0],page24=gp.pages.find(p=>p.page===best.page);
const full=page24.indices;
const p24cur=full.slice(best.offset,best.offset+W);
const p24next=full.slice(best.offset+W,best.offset+2*W);
const topRank=phaseRank(p24cur);
const p57Rank=phaseRank(solved57.indices.slice(0,W));
const nativePlain=[];
for(const f of files)for(let i=0;i+W<=f.test.length;i+=W)
 nativePlain.push(plainScore(f.test.slice(i,i+W)));
nativePlain.sort((a,b)=>a-b);
const phase=topRank[0];
const nextRank=plainScore(p24next.map(x=>mod(phase.sign*x+phase.shift)));
console.log('PHASE_READOUT '+JSON.stringify({
 candidate:{page:best.page,offset:best.offset,top4:topRank.slice(0,4),
  next40Length:p24next.length,next40SamePhaseScore:nextRank,
  next40SamePhaseText:p24next.map(x=>gp.translit[mod(phase.sign*x+phase.shift)]).join('')},
 genuineP57:{phaseRankIdentity:p57Rank.findIndex(x=>x.sign===1&&x.shift===0)+1,
  identityScore:p57Rank.find(x=>x.sign===1&&x.shift===0).score,
  top3:p57Rank.slice(0,3)},
 nativeScores:{p1:nativePlain[Math.floor(nativePlain.length*.01)],
  median:nativePlain[Math.floor(nativePlain.length*.5)],
  p99:nativePlain[Math.floor(nativePlain.length*.99)]}
}));

console.log('ORIGINAL_DIFFERENCE_QUADGRAM '+JSON.stringify({
 controls:{trainLengths:files.map(x=>({name:x.label,length:x.train.length})),
  nativeWindowCount:nSource.length,nativeP1:sourceThreshold,
  nativeMedian:percentile(nSource,.5),nativeP99:percentile(nSource,.99),
  solvedP57ClearWindowCount:positive.length,p57min,p57max,
  plantedRotationsAndReflections:tests.length,exactScorePreservation:true},
 original:{words:2896,runes:12956,w:W,windows:unsolved.length,
  aboveNativeP1:originalAbove1,aboveAuthenticP57Min:originalAboveP57,
  top:words}
}));
