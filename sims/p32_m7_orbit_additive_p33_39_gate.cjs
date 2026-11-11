'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const shakespeare = fs.readFileSync(path.join(root, 'resources/control/shakespeare_first300k.txt'), 'utf8');
const M = 29;
const pages = corpus.pages.filter((p) => p.page >= 33 && p.page <= 39).map((p) => p.indices);
assert.equal(pages.length, 7);
assert.deepEqual(pages.map((p) => p.length), [214,261,271,238,228,228,240]);
assert.equal(pages.flat().length, 1680);
const matrix = [[14,25],[25,28]];
function mod(x) { return ((x % M) + M) % M; }
function inv(x) {
  const n = mod(x);
  for (let k=1;k<M;k++) if (mod(n*k)===1) return k;
  throw new Error('noninvertible denominator: '+n);
}
function forwardMap(x) {
  const d=mod(matrix[1][0]*x+matrix[1][1]);
  assert.notEqual(d,0);
  return mod((matrix[0][0]*x+matrix[0][1])*inv(d));
}
function inverseMap(x) {
  const d=mod(-matrix[1][0]*x+matrix[0][0]);
  assert.notEqual(d,0);
  return mod((matrix[1][1]*x-matrix[0][1])*inv(d));
}
function orbit(start,step) {
  const out=[]; let x=start;
  for(let i=0;i<7;i++){assert.ok(!out.includes(x));out.push(x);x=step(x);}
  assert.equal(x,start);
  return out;
}
const forward=orbit(13,forwardMap), reverse=orbit(13,inverseMap);
assert.deepEqual(forward,[13,24,19,3,6,20,17]);
assert.deepEqual(reverse,[13,17,20,6,3,19,24]);
const contracts={physical:pages,redTitle:[pages[0].slice(91),...pages.slice(1)]};
assert.equal(contracts.redTitle.flat().length,1589);
const specs=[
  ['forward_subtract',forward,-1],
  ['forward_add',forward,1],
  ['reverse_subtract',reverse,-1],
  ['reverse_add',reverse,1]
];
function apply(rows,key,sign){return rows.flat().map((c,i)=>mod(c+sign*key[i%7]));}
const digraph={TH:2,NG:21,EO:12,OE:22,AE:25,IA:27,EA:28};
const letter={A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,Y:26,Z:15};
function toGP(text){
  const s=text.toUpperCase().replace(/[^A-Z]/g,''),out=[];
  for(let i=0;i<s.length;i++){
    const pair=digraph[s.slice(i,i+2)];
    if(pair!==undefined){out.push(pair);i++;}else out.push(letter[s[i]]);
  }
  return out;
}
const reference=toGP(shakespeare),training=reference.slice(0,160000);
const unigram=new Float64Array(M),bigram=new Float64Array(M*M),trigram=new Float64Array(M*M*M);
for(let i=0;i<training.length;i++){
  unigram[training[i]]++;
  if(i>0)bigram[training[i-1]*M+training[i]]++;
  if(i>1)trigram[(training[i-2]*M+training[i-1])*M+training[i]]++;
}
const uLog=new Float64Array(M),bLog=new Float64Array(M*M),tLog=new Float64Array(M*M*M);
for(let x=0;x<M;x++)uLog[x]=Math.log((unigram[x]+1)/(training.length+M));
for(let a=0;a<M;a++)for(let x=0;x<M;x++)bLog[a*M+x]=Math.log((bigram[a*M+x]+12*Math.exp(uLog[x]))/(unigram[a]+12));
for(let a=0;a<M;a++)for(let b=0;b<M;b++)for(let x=0;x<M;x++){
  const j=(a*M+b)*M+x;
  tLog[j]=Math.log((trigram[j]+9*Math.exp(bLog[b*M+x]))/(bigram[a*M+b]+9));
}
function score(a){
  let total=uLog[a[0]]+bLog[a[0]*M+a[1]];
  for(let i=2;i<a.length;i++)total+=tLog[(a[i-2]*M+a[i-1])*M+a[i]];
  return total/a.length;
}
function ioc(a){
  const counts=new Int32Array(M);
  for(const x of a)counts[x]++;
  let n=0;for(const c of counts)n+=c*(c-1);
  return n/(a.length*(a.length-1));
}
function evaluate(rows){
  return specs.map(([name,key,sign])=>{
    const out=apply(rows,key,sign);
    return {name,score:score(out),ioc:ioc(out),preview:out.slice(0,80).map(x=>corpus.translit[x]).join('')};
  }).sort((a,b)=>b.score-a.score);
}
function bestScore(rows){return Math.max(...evaluate(rows).map(x=>x.score));}
function rotate(a,k){const n=k%a.length;return a.slice(n).concat(a.slice(0,n));}
let seed=0x14a7c29;
function random32(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
const observed={};
for(const [name,rows] of Object.entries(contracts)){
  const raw=rows.flat();
  observed[name]={runes:raw.length,rawScore:score(raw),rawIoC:ioc(raw),variants:evaluate(rows)};
}
const observedFamilyMax=Math.max(bestScore(contracts.physical),bestScore(contracts.redTitle));
const nullMaxima=[];
for(let trial=0;trial<2000;trial++){
  const rotatedPages=pages.map(p=>rotate(p,random32()%p.length));
  const rotatedRedTitle=[rotatedPages[0].slice(91),...rotatedPages.slice(1)];
  nullMaxima.push(Math.max(bestScore(rotatedPages),bestScore(rotatedRedTitle)));
}
const exceedances=nullMaxima.filter(x=>x>=observedFamilyMax).length;
const sortedNull=[...nullMaxima].sort((a,b)=>a-b);
const matchedNull={
  seed:'0x014a7c29',trials:nullMaxima.length,observedFamilyMax,exceedances,
  plusOneP:(exceedances+1)/(nullMaxima.length+1),
  median:sortedNull[1000],percentile95:sortedNull[1900],maximum:sortedNull[1999]
};
assert.equal(exceedances,1894);
assert.ok(Math.abs(matchedNull.plusOneP-0.9470264867566217)<1e-15);
const positiveControls={};
for(const [name,rows] of Object.entries(contracts)){
  const n=rows.flat().length,plain=reference.slice(175000,175000+n);
  assert.equal(plain.length,n);
  const cipher=plain.map((x,i)=>mod(x+forward[i%7]));
  const recovered=cipher.map((x,i)=>mod(x-forward[i%7]));
  assert.deepEqual(recovered,plain);
  positiveControls[name]={runes:n,plaintextScore:score(plain),encryptedScore:score(cipher),exactRecovery:true};
}
const result={
  classification:'bounded negative for the exact M7-orbit periodic additive GP29 keystream; no unknown LP2 plaintext recovered',
  source:{physicalPages:[33,34,35,36,37,38,39],pageLengths:pages.map(p=>p.length),totalPhysicalRunes:1680,redTitleStartOnPhysicalP33:91,redTitleRunes:1589},
  keyDerivation:{matrix,start:13,forwardOrbit:forward,reverseOrbit:reverse},
  observed,matchedNull,positiveControls,
  reference:{shakespeareGPRunes:reference.length,trainingGPRunes:training.length}
};
assert.equal(observed.physical.variants[0].name,'reverse_subtract');
assert.ok(Math.abs(observed.physical.variants[0].score-(-6.2220395377218365))<1e-12);
assert.equal(observed.redTitle.variants[0].name,'reverse_subtract');
assert.ok(Math.abs(observed.redTitle.variants[0].score-(-6.236474389853661))<1e-12);
console.log(JSON.stringify(result,null,2));
