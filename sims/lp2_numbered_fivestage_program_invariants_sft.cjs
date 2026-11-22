'use strict';
/**
 * Original pp36–38 five-numbered-stage length and all-secret substitution gate.
 * Node22, Windows11, CommonJS, read-only. Run node this-file.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
/** @param {string} n @returns {string} */
function read(n){return fs.readFileSync(path.join(root,n),'utf8');}
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript=read('resources/liber-primus/lp2-transcription.txt').replace(/\r\n/g,'\n').split('\n%\n');
assert.equal(transcript.length,57);
const source=transcript.slice(36,39).join('\n'),marks=[...source.matchAll(/(?:^|\n)([1-5])-/gu)];
assert.deepEqual(marks.map(x=>Number(x[1])),[1,2,3,4,5]);
const ri=new Map(gp.runes.map((r,i)=>[r,i]));
/** @param {string} s @returns {number[]} */
const runes=s=>[...s].flatMap(ch=>ri.has(ch)?[ri.get(ch)]:[]);
const units=marks.map((mark,i)=>{
  const begin=mark.index+mark[0].length;
  const end=i===4?source.indexOf('\n&\n',begin):marks[i+1].index;
  assert.ok(end>begin);
  const text=source.slice(begin,end).trim(),seq=runes(text);
  const words=text.replace(/\/\n/gu,'').split(/[.\-]/u).map(runes).filter(x=>x.length);
  assert.deepEqual(words.flat(),seq);
  return {number:i+1,runes:seq,words:words.length};
});
assert.deepEqual(units.map(x=>x.runes.length),[139,91,98,96,129]);
assert.deepEqual(units.map(x=>x.words),[30,20,25,19,28]);
const nativeSource=read('resources/liber-primus/lp1-plaintext-reference.txt');
const headings=[...nativeSource.matchAll(/^###\s+(\d+)\s*$/gmu)];
const selections=headings.map((h,i)=>({n:Number(h[1]),s:nativeSource.slice(h.index+h[0].length,headings[i+1]?.index??nativeSource.length)
 .replace(/^#.*$/gmu,'').replace(/^\s*\[.*\]\s*$/gmu,'')}))
 .filter(x=>x.n>=1&&x.n<=16&&![4,7,8].includes(x.n));
/** @param {string} s @returns {number[]} */
function nativeGP(s){
  s=s.toUpperCase().replace(/QU/gu,'CW').replace(/V/gu,'U').replace(/[KQ]/gu,'C').replace(/Z/gu,'S');
  const toks=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
  const o=[];
  for(const w of s.match(/[A-Z]+/gu)||[])for(let i=0;i<w.length;){
    if(w.startsWith('ING',i)){o.push(21);i+=3;continue;}
    if(w.startsWith('IO',i)){o.push(27);i+=2;continue;}
    const r=toks.find(x=>w.startsWith(x.t,i));
    assert.ok(r);o.push(r.i);i+=r.t.length;
  }
  return o;
}
const native=selections.flatMap(x=>nativeGP(x.s));
assert.equal(native.length,2797);
/** @param {number[]} a @returns {number} */
function ioc(a){const f=Array(29).fill(0);for(const n of a)f[n]++;return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));}
const cases=units.map(unit=>{
 const n=unit.runes.length,real=ioc(unit.runes);let minimum=Infinity,atOrBelow=0;
 for(let i=0;i+n<=native.length;i++){
  const x=ioc(native.slice(i,i+n));minimum=Math.min(minimum,x);if(x<=real)atOrBelow++;
 }
 assert.equal(atOrBelow,0);
 // An arbitrary full-key bijection preserves the exact equality statistic.
 const sigma=Array.from({length:29},(_,i)=>(17*i+9)%29);
 assert.equal(new Set(sigma).size,29);
 assert.ok(Math.abs(ioc(unit.runes.map(x=>sigma[x]))-real)<1e-15);
 return {number:unit.number,n,words:unit.words,IOC:real,
   nativeWindows:native.length-n+1,nativeMinimumIOC:minimum,
   nativeAtOrBelow:atOrBelow};
});
assert.equal(units.reduce((s,x)=>s+x.runes.length,0),553);
console.log(JSON.stringify({scope:'All 29! static secret bijections per numbered '+
 'item preserve IOC. Literal successions of length-preserving rune stages '+
 'cannot have five different complete output lengths.',
 originalScans:['53.jpg','54.jpg','55.jpg'],originalLP2Pages:[36,37,38],
 nLabels:5,nRunes:553,nativeLP1Runes:native.length,cases,
 authenticUnknownPlaintextRecovered:0},null,2));
