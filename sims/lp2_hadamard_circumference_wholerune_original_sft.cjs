'use strict';
/**
 * Source-derived 2-by-2 outside-in H, tested as a direct reversible original
 * LP2 rune decoder over four original visible scopes.
 * The known p0 13-dot candidate uses an H pairing on outermost rune values.
 * No first-party source states that the same rule encrypts body text.
 *
 * Node.js 22 CommonJS, read-only, positive native original control.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'),'utf8'));
const mod=a=>((a%29)+29)%29;
const pages=corpus.pages.filter(p=>p.page<=55).map(p=>p.indices);
const joined=pages.flat();assert.equal(joined.length,12956);
const chapterEnds=[0,3,8,15,23,27,33,40,54,56];
const chapters=chapterEnds.slice(1).map((end,i)=>
  pages.slice(chapterEnds[i],end).flat());
const transcript=fs.readFileSync(path.join(root,'resources/lp2-transcription.txt'),'utf8')
  .split('%').slice(0,55).join('%');
const idx=new Map(corpus.runes.map((r,i)=>[r,i]));
const words=[];let current=[];
for(const ch of transcript){
  if(idx.has(ch))current.push(idx.get(ch));
  else if(ch==='/'||/\s/u.test(ch)){}
  else if(current.length){words.push(current);current=[];}
}
if(current.length)words.push(current);
assert.equal(words.length,2896);
assert.deepEqual(words.flat(),joined);
const scopes={book:[joined],chapters,pages,words};
for(const [name,chunks] of Object.entries(scopes)){
  assert.deepEqual(chunks.flat(),joined,name);
}
function H(xs){
  const out=[];
  for(let i=0;i<Math.floor(xs.length/2);i++){
    const a=xs[i],b=xs[xs.length-i-1];
    out.push(mod(a-b),mod(a+b));
  }
  if(xs.length%2)out.push(xs[Math.floor(xs.length/2)]);
  return out;
}
function HI(xs){
  const out=Array(xs.length);
  const m=Math.floor(xs.length/2);
  for(let i=0;i<m;i++){
    const d=xs[2*i],s=xs[2*i+1];
    out[i]=mod(15*(s+d));
    out[xs.length-i-1]=mod(15*(s-d));
  }
  if(xs.length%2)out[m]=xs[xs.length-1];
  return out;
}
const convert=(chunks,fn)=>chunks.flatMap(fn);
function ioc(xs){
  const freq=Array(29).fill(0);
  for(const x of xs)freq[x]++;
  return freq.reduce((v,n)=>v+n*(n-1),0)/(xs.length*(xs.length-1));
}
const translit=corpus.translit;
const first=xs=>xs.slice(0,70).map(i=>translit[i]).join(' ');
const clear=corpus.pages.find(p=>p.page===57).indices;
assert.equal(clear.length,95);
const planted=Array.from({length:joined.length},(_,i)=>clear[i%95]);
const outcome=[];
for(const [name,chunks] of Object.entries(scopes)){
  for(const mode of ['H','HI']){
    const output=convert(chunks,mode==='H'?H:HI);
    const counterpart=mode==='H'?HI:H;
    assert.deepEqual(convert(chunks,fn=>counterpart((mode==='H'?H:HI)(fn))),joined);
    const plantedChunks=[];let start=0;
    for(const chunk of chunks){plantedChunks.push(planted.slice(start,start+chunk.length));start+=chunk.length;}
    const encryption=mode==='H'?HI:H;
    const encoded=plantedChunks.map(encryption);
    const exactRecovered=convert(encoded,mode==='H'?H:HI);
    assert.deepEqual(exactRecovered,planted);
    outcome.push({scope:name,mode,originalIOC:ioc(output),
      originalE:output.filter(x=>x===18).length,
      p0Prefix:first(output)});
  }
}
console.log(JSON.stringify({input:{runes:joined.length,words:words.length,
  physicalPages:pages.length,chunks:Object.fromEntries(
    Object.entries(scopes).map(([k,v])=>[k,v.length]))},
  originalRawIoC:ioc(joined),realSolvedP57IoC:ioc(clear),variants:outcome,
  positive:'All 8 exact reversible source-GP plants recovered 12956/12956.',
  decision:outcome.some(x=>x.originalIOC>0.05)?
    'One H candidate shows native-GP IoC; examine exact prose and independent holdout':
    'Direct p0-marker H/HI on complete original rune units does not reveal native-GP plaintext',
  warning:'No signed instruction says to apply H globally; these are exactly eight bounded source-shaped operations'
},null,2));
