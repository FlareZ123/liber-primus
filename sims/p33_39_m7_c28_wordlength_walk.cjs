#!/usr/bin/env node
'use strict';

// Reproduce the source-selected p33-39 M7 -> C28 word-length walk and its
// bounded controls. No fitted keys, offsets, or language-model parameters.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const transcript = read('resources/lp2-transcription.txt');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');

const P = 29, INF = 29;
const mod = (x) => ((x % P) + P) % P;
function pow(a, n) {
  let r = 1; a = mod(a);
  while (n > 0) { if (n & 1) r = mod(r * a); a = mod(a * a); n = Math.floor(n / 2); }
  return r;
}
const inv = (x) => pow(x, 27);
function apply(M, x) {
  const [a,b,c,d] = M;
  if (x === INF) return c === 0 ? INF : mod(a * inv(c));
  const den = mod(c*x+d);
  return den === 0 ? INF : mod((a*x+b)*inv(den));
}
function mul(A,B) {
  return [mod(A[0]*B[0]+A[1]*B[2]),mod(A[0]*B[1]+A[1]*B[3]),
          mod(A[2]*B[0]+A[3]*B[2]),mod(A[2]*B[1]+A[3]*B[3])];
}
function mpow(M,n) {
  let out=[1,0,0,1],base=M.slice();
  while(n>0){if(n&1)out=mul(out,base);base=mul(base,base);n=Math.floor(n/2);}
  return out;
}
function projectivelyEqual(A,B) {
  let scale=null;
  for(let i=0;i<4;i++)if(A[i]!==0){if(B[i]===0)return false;scale=mod(B[i]*inv(A[i]));break;}
  return scale!==null&&A.every((v,i)=>mod(v*scale)===mod(B[i]));
}
const M7=[14,25,25,28], M28=[14,28,25,20], M28i=[20,1,4,14];
const S=[11,8,0,1], Si=[8,23,0,1];
assert.ok(projectivelyEqual(M7,mul(mul(S,mpow(M28,4)),Si)));
assert.ok(projectivelyEqual(mul(M28,M28i),[1,0,0,1]));

const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const primeOf=new Map(corpus.runes.map((r,i)=>[r,corpus.prime[i]]));
const translit=w=>[...w].map(r=>corpus.translit[runeIndex.get(r)]).join('');
const primeSum=w=>[...w].reduce((s,r)=>s+primeOf.get(r),0);
const pages=transcript.split('%');
const pageWords=p=>(pages[p]||'').replace(/\//g,' ').match(/[\u16A0-\u16FF]+/gu)||[];
function clauseWords(source){return source.split('-').map(piece=>(piece.match(/[\u16A0-\u16FF]/gu)||[]).join('')).filter(Boolean);}
const clauses=(pages[32]||'').replace(/\/\s*/gu,'').split(/[.&$§]/u).map(clauseWords).filter(x=>x.length);
const clauseWordsAll=clauses.flat();
assert.deepEqual(clauses.map(x=>x.length),[7,15]);
assert.equal(clauseWordsAll.length,22);
const seedWord=clauseWordsAll[21], seedSum=primeSum(seedWord), seed=seedSum%P;
assert.equal(translit(seedWord),'AGBEO'); assert.equal(seedSum,216); assert.equal(seed,13);
const orbit=[];
let o=seed;
for(let i=0;i<7;i++){orbit.push(o);o=apply(M7,o);}
assert.deepEqual(orbit,[13,24,19,3,6,20,17]); assert.equal(o,seed);

const firstSums=clauses[0].map(primeSum), firstResidues=firstSums.map(x=>x%P);
const firstImages=firstResidues.map(x=>apply(M7,x));
assert.deepEqual(firstSums,[73,125,267,613,191,184,14]);
assert.deepEqual(firstResidues,[15,9,6,4,17,10,14]);
assert.deepEqual(firstImages,[28,21,20,14,13,8,18]);

const body=signed.split('-----BEGIN PGP SIGNATURE-----')[0].split('Hash: SHA1')[1]||'';
const tokens=body.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)||[];
assert.equal(tokens.length,45);
const firstClauseMessage=firstImages.map(x=>x===INF||x===0?null:(tokens[x-1]??null));
assert.deepEqual(firstClauseMessage,['are','meaning','their','way','the','the','the']);

const p33=pageWords(33);
let redWordIndex=null,offset=0;
for(let i=0;i<p33.length;i++){if(offset===91){redWordIndex=i;break;}offset+=[...p33[i]].length;}
assert.equal(redWordIndex,26); assert.equal(offset,91);
const selected=orbit.map((ordinal,i)=>{
  const all=pageWords(33+i), words=i===0?all.slice(redWordIndex):all;
  const w=words[ordinal-1]; assert.ok(w); return w;
});
const lengths=selected.map(w=>[...w].length);
assert.deepEqual(lengths,[2,1,7,3,8,3,4]); assert.equal(lengths.reduce((a,b)=>a+b,0),28);
const start=apply(Si,seed); assert.equal(start,11);
function walk(x,steps,M){const out=[];for(const n of steps){for(let i=0;i<n;i++)x=apply(M,x);out.push(x);}return out;}
const states=walk(start,lengths,M28);
assert.deepEqual(states,[2,24,3,8,23,14,11]); assert.equal(states.at(-1),start);
const words=states.map(x=>x===INF||x===0?null:(tokens[x-1]??null));
assert.deepEqual(words,['The','road','path','the','the','way','Primus']);
assert.equal(words.join('').replace(/[^A-Za-z]/g,'').length,26);
const anchors=['road','path','way'];

function seqAt(phase,dir){return Array.from({length:7},(_,i)=>orbit[(phase+(dir==='forward'?i:-i)+7)%7]);}
function variant(startPage,phase,dir,boundary){
  const seq=seqAt(phase,dir);
  const chosen=seq.map((ordinal,i)=>{
    const all=pageWords(startPage+i), ws=i===0&&boundary==='redTitle'?all.slice(redWordIndex):all;
    return ws[ordinal-1]||null;
  });
  if(chosen.some(w=>!w))return null;
  const lens=chosen.map(w=>[...w].length),st=apply(Si,seq[0]);
  const out=walk(st,lens,dir==='forward'?M28:M28i);
  const msg=out.map(x=>x===INF||x===0?null:(tokens[x-1]??null));
  return {startPage,phase,dir,boundary,seq,lens,sum:lens.reduce((a,b)=>a+b,0),states:out,words:msg,
    hits:anchors.filter(a=>msg.includes(a))};
}
const section=[];
for(let phase=0;phase<7;phase++)for(const dir of ['forward','reverse'])for(const boundary of ['physical','redTitle']){
  const v=variant(33,phase,dir,boundary);if(v)section.push(v);
}
const section28=section.filter(v=>v.sum===28),section28Anchors=section28.filter(v=>v.hits.length===3);
assert.equal(section.length,28);assert.equal(section28.length,2);assert.equal(section28Anchors.length,1);
assert.equal(section28Anchors[0].phase,0);assert.equal(section28Anchors[0].dir,'forward');assert.equal(section28Anchors[0].boundary,'redTitle');

const global=[];
for(let s=0;s<=49;s++)for(let phase=0;phase<7;phase++)for(const dir of ['forward','reverse']){
  const boundaries=s===33?['physical','redTitle']:['physical'];
  for(const boundary of boundaries){const v=variant(s,phase,dir,boundary);if(v)global.push(v);}
}
const global28=global.filter(v=>v.sum===28),global28Anchors=global28.filter(v=>v.hits.length===3);
assert.equal(global.length,682);assert.equal(global28.length,51);assert.equal(global28Anchors.length,2);
assert.ok(global28Anchors.some(v=>v.startPage===33&&v.phase===0&&v.dir==='forward'&&v.boundary==='redTitle'));
assert.ok(global28Anchors.some(v=>v.startPage===34&&v.phase===3&&v.dir==='reverse'&&v.boundary==='physical'));

const fixed=[];
for(let s=0;s<=49;s++){const v=variant(s,0,'forward',s===33?'redTitle':'physical');if(v)fixed.push(v);}
const fixed28=fixed.filter(v=>v.sum===28),fixed28Anchors=fixed28.filter(v=>v.hits.length===3);
assert.equal(fixed.length,48);assert.equal(fixed28.length,7);assert.equal(fixed28Anchors.length,1);
assert.equal(fixed28Anchors[0].startPage,33);

console.log(JSON.stringify({
  seed:{segmentation:clauses.map(c=>c.length),word22:translit(seedWord),sum:seedSum,residue:seed,orbit},
  firstClauseM7Gate:{sums:firstSums,residues:firstResidues,images:firstImages,messageWords:firstClauseMessage},
  sourcePath:{pages:[33,34,35,36,37,38,39],ordinals:orbit,selectedWords:selected.map(translit),
    selectedPrimeSums:selected.map(primeSum),lengths,startC28:start,states,messageWords:words,
    phrase:words.join(' '),letterCount:26},
  controls:{
    section:{variants:section.length,exact28:section28.length,exact28AndAllAnchors:section28Anchors.length},
    fixedForwardWindows:{valid:fixed.length,exact28:fixed28.length,exact28AndAllAnchors:fixed28Anchors.length,matchingStartPage:fixed28Anchors[0].startPage},
    global:{valid:global.length,exact28:global28.length,exact28AndAllAnchors:global28Anchors.length,
      adjacentAlternative:global28Anchors.find(v=>v.startPage===34)}
  },
  caveat:'Finite controls, not formal p-values; the expanded scan has an adjacent-window alternative.'
},null,2));
