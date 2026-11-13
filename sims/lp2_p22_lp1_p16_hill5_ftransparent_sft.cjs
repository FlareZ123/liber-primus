#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription=read('resources/liber-primus/lp2-transcription.txt');
const wordFreq=read('resources/control/english_wordfreq_textblob.txt');
const quadText=read('resources/control/dukotah_english_quadgrams.txt');
const mod=(x,p=29)=>((x%p)+p)%p;
const pow=(x,n,p)=>{let a=mod(x,p),o=1;while(n){if(n%2)o=mod(o*a,p);a=mod(a*a,p);n=Math.floor(n/2);}return o;};
function inverseMatrix(m,p=29){
 const n=m.length,a=m.map((r,i)=>r.map(x=>mod(x,p)).concat(Array.from({length:n},(_,j)=>i===j?1:0)));
 let det=1;
 for(let c=0;c<n;c++){
  let q=c;while(q<n&&a[q][c]===0)q++;
  if(q===n)throw Error('singular matrix');
  if(q!==c){[a[q],a[c]]=[a[c],a[q]];det=mod(-det,p);}
  const pv=a[c][c];det=mod(det*pv,p);const iv=pow(pv,p-2,p);
  for(let j=0;j<2*n;j++)a[c][j]=mod(a[c][j]*iv,p);
  for(let r=0;r<n;r++)if(r!==c){const f=a[r][c];for(let j=0;j<2*n;j++)a[r][j]=mod(a[r][j]-f*a[c][j],p);}
 }
 return {inverse:a.map(r=>r.slice(n)),determinant:det};
}
const transpose=m=>m[0].map((_,j)=>m.map(r=>r[j]));
const apply=(xs,m)=>{if(xs.length%5)throw Error('non-whole Hill blocks');const out=[];for(let i=0;i<xs.length;i+=5){const v=xs.slice(i,i+5);for(const row of m)out.push(mod(row.reduce((s,x,j)=>s+x*v[j],0)));}return out;};
const same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
const insert=(payload,skip,n)=>{let j=0;return Array.from({length:n},(_,i)=>skip.has(i)?0:payload[j++]);};
const square=[[434,1311,312,278,966],[204,812,934,280,1071],[626,620,809,620,626],[1071,280,934,812,204],[966,278,312,1311,434]];
assert(square.every(r=>r.reduce((a,b)=>a+b,0)===3301));
assert(square[0].map((_,j)=>square.reduce((s,r)=>s+r[j],0)).every(x=>x===3301));
assert.equal(square.reduce((s,r,i)=>s+r[i],0),3301);
assert.equal(square.reduce((s,r,i)=>s+r[4-i],0),3301);
const M=square.map(r=>r.map(x=>mod(x,29))), mi=inverseMatrix(M);
assert.equal(mi.determinant,10);
const variants=[['M',M],['M^T',transpose(M)],['M^-1',mi.inverse],['(M^-1)^T',transpose(mi.inverse)]];
const runeMap=new Map(corpus.runes.map((r,i)=>[r,i]));
const p22Text=transcription.split('%').map(x=>x.trim()).filter(Boolean)[22];
const source=corpus.pages.find(p=>p.page===22).indices;
const transcribed=Array.from(p22Text).filter(ch=>runeMap.has(ch)).map(ch=>runeMap.get(ch));
assert.equal(source.length,131);assert(same(source,transcribed));
const fpos=source.flatMap((x,i)=>x===0?[i]:[]);
assert.deepEqual(fpos,[13,51,55,119,124,128]);
const skipCounts=Array.from({length:fpos.length+1},(_,k)=>k).filter(k=>(source.length-k)%5===0);
assert.deepEqual(skipCounts,[1,6]);
const masks=[...fpos.map(i=>[i]),fpos];
const dict=new Set(wordFreq.split(/\r?\n/).flatMap(l=>{const m=l.trim().match(/^([a-z]+)\s+\d+$/);return m?[m[1].toUpperCase()]:[];}));
const qgrams=new Map();let qtotal=0;
for(const l of quadText.trim().split(/\r?\n/)){const [g,n]=l.trim().split(/\s+/);if(g&&n){qgrams.set(g,+n);qtotal+=+n;}}
const render=xs=>xs.map(x=>corpus.translit[x]).join('');
function qscore(xs){const s=render(xs).replace(/[^A-Z]/g,'');let z=0,n=0;for(let i=0;i+4<=s.length;i++){z+=Math.log10((qgrams.get(s.slice(i,i+4))||1)/qtotal);n++;}return z/n;}
function words(xs){let out=[],w='',j=0;for(const ch of Array.from(p22Text)){if(runeMap.has(ch))w+=corpus.translit[xs[j++]];else if('-.&$'.includes(ch)){if(w)out.push(w);w='';}}if(w)out.push(w);assert.equal(j,xs.length);return out;}
function wordStats(xs){const ws=words(xs),long=ws.filter(w=>w.length>=3);return {wordCount:ws.length,dictionaryHits:ws.filter(w=>dict.has(w)).length,longWordCount:long.length,longWordHits:long.filter(w=>dict.has(w))};}
const raw={quadgram:qscore(source),...wordStats(source)};
const p57=corpus.pages.find(p=>p.page===57).indices;
const results=[];let plant=0;
for(const [name,D] of variants)for(const skipPositions of masks){
 const skip=new Set(skipPositions),cipherPayload=source.filter((_,i)=>!skip.has(i));
 assert.equal(cipherPayload.length%5,0);
 const plainPayload=apply(cipherPayload,D),plain=insert(plainPayload,skip,source.length);
 const decodedF=plainPayload.filter(x=>x===0).length;
 const E=inverseMatrix(D).inverse;
 assert(same(insert(apply(plainPayload.filter((_,i)=>!skip.has(i)),E),skip,source.length),source));
 const planted=Array.from({length:cipherPayload.length},(_,i)=>1+mod(i*17+plant*11+skipPositions.length*7+3,28));
 const plantedCipher=apply(planted,E),plantedBack=apply(plantedCipher,D);
 assert(same(planted,plantedBack));
 assert(same(insert(plantedBack,skip,source.length),insert(planted,skip,source.length)));
 plant++;
 results.push({matrix:name,skip:skipPositions,payloadLength:cipherPayload.length,decodedF,validFTransparent:decodedF===0,quadgram:qscore(plain),...wordStats(plain)});
}
assert.equal(results.length,28);
assert.equal(results.filter(r=>r.validFTransparent).length,0);
const fcounts=results.map(r=>r.decodedF);
assert.equal(Math.min(...fcounts),1);assert.equal(Math.max(...fcounts),9);
const byQuad=[...results].sort((a,b)=>b.quadgram-a.quadgram);
const byWords=[...results].sort((a,b)=>b.longWordHits.length-a.longWordHits.length||b.quadgram-a.quadgram);
console.log(JSON.stringify({
 source:{page:22,runes:source.length,Fpositions:fpos,wordCount:raw.wordCount,printedLP1p16Square:square,mod29:M,determinant:mi.determinant},
 model:{blockSize:5,noPaddingSkipCounts:skipCounts,masks,orientations:variants.map(x=>x[0]),configurations:results.length},
 validation:{exactForwardReplays:results.length,syntheticPositivePlants:results.length,validFTransparentOutputs:results.filter(r=>r.validFTransparent).length,decodedFRange:[Math.min(...fcounts),Math.max(...fcounts)]},
 language:{raw,solvedP57:{runes:p57.length,quadgram:qscore(p57)},bestByQuadgram:byQuad.slice(0,5),bestByLongWords:byWords.slice(0,5)},
 allConfigurations:results
},null,2));
