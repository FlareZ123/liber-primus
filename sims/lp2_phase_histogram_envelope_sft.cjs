'use strict';
// Run from any working directory; emits JSON for lp2_phase_histogram_feasibility.py.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const read = p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const C = corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
const N=C.length;
assert.equal(N,12956);
const tok=corpus.translit.map((token,index)=>({token,index})).sort((a,b)=>b.token.length-a.token.length);
function gp(raw){
  const s=raw.toUpperCase().replaceAll('V','U').replaceAll('K','C');
  const out=[];
  for(let i=0;i<s.length;){
    const t=tok.find(t=>s.startsWith(t.token,i));
    if(t){out.push(t.index);i+=t.token.length;}else i++;
  }
  return out;
}
const crow=gp(['I','II','III'].map(r=>read('resources/external/2013-book-of-law-'+r+'.txt')).join('\n'));
const ed=read('resources/external/cicada2012-blake-marriage-gutenberg45315.txt');
const blake=gp(ed.slice(ed.indexOf('THE ARGUMENT'),ed.indexOf('*** END OF THIS PROJECT GUTENBERG EBOOK')));
assert.equal(crow.length,21611);assert.equal(blake.length,18631);
const donor=[['Crowley-0',crow.slice(0,N)],['Crowley-4327',crow.slice(4327,4327+N)],['Crowley-8655',crow.slice(8655,8655+N)],['Blake-0',blake.slice(0,N)],['Blake-5675',blake.slice(5675,5675+N)]];
const native=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const runeMap=new Map(corpus.runes.map((r,i)=>[r,i]));
const sections=native.sections.map(s=>[s.name,[...s.source_text].flatMap(r=>runeMap.has(r)?[runeMap.get(r)]:[])]);
const pool=sections.flatMap(x=>x[1]);assert.equal(pool.length,2979);
const cycled=Array.from({length:N},(_,i)=>pool[i%pool.length]);
const donors=[...donor,['solved-cyclic',cycled]];
const pages=[0,3,8,15,23,28,33,40,54,56];
const starts=pages.map(n=>corpus.pages.filter(p=>p.page<n).reduce((a,p)=>a+p.indices.length,0));
assert.deepEqual(starts,[0,729,1874,3603,5506,6761,7960,9640,12648,12956]);
function hist(a){const h=Array(29).fill(0);for(const v of a)h[v]++;return h;}
function prefix(a){let s=0;return a.slice().sort((x,y)=>y-x).map(x=>s+=x);}
function rows(a,q){const h=Array.from({length:q},()=>Array(29).fill(0));a.forEach((x,i)=>h[i%q][x]++);return h;}
function envelope(h){return h.map(prefix).reduce((a,b)=>a.map((x,i)=>x+b[i]),Array(29).fill(0));}
const scopes=[['global',0,N],...starts.slice(1).map((e,i)=>['chapter'+(i+1),starts[i],e])];
const results=[];
for(const q of [8,13])for(const [name,b,e] of scopes){
  const cap=envelope(rows(C.slice(b,e),q));
  const comparisons=donors.map(([d,a])=>{const p=prefix(hist(a.slice(b,e))),gaps=p.map((v,k)=>v-cap[k]);const max=Math.max(...gaps);return {d,max,k:gaps.indexOf(max)+1,top1:p[0],top5:p[4],top1gap:gaps[0]};});
  results.push({q,name,n:e-b,cap,comparisons});
}
assert.equal(results.filter(x=>x.comparisons.every(t=>t.max>0)).length,19);
const term=C.slice(12648);
const terminalRows=rows(term,13);
const targets=donor.map(([name,a])=>({name,h:hist(a.slice(12648))}));
const nativeTargets=sections.filter(([name])=>['0_welcome','0_koan_1','0_loss_of_divinity'].includes(name)).map(([name,a])=>({name,h:hist(a.slice(0,308))}));
const chapterPrivateBookwide=[8,13].map(q=>{
  const cap=results.filter(x=>x.q===q&&x.name!=='global').reduce((a,r)=>a.map((v,k)=>v+r.cap[k]),Array(29).fill(0));
  const comparisons=donors.map(([d,a])=>{const p=prefix(hist(a)),gaps=p.map((v,k)=>v-cap[k]);const max=Math.max(...gaps);return {d,max,k:gaps.indexOf(max)+1};});
  assert.equal(comparisons.every(x=>x.max>0),true);
  return {q,cap,comparisons};
});
console.log(JSON.stringify({results,chapterPrivateBookwide,rows:terminalRows,targets,native:nativeTargets,terminalCipher:term,plantPlain:sections.find(x=>x[0]==='0_welcome')[1].slice(0,308)},null,2));
