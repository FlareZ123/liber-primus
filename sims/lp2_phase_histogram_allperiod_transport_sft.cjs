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

/** @param {number[]} cuts @param {number} q @param {boolean} shared */
function capacity(cuts,q,shared){
  const total=Array(29).fill(0);
  const combined=shared?new Uint16Array(Math.min(q,N)*29):null;
  /** @param {Uint16Array} h */
  function accumulate(h){
    for(let j=0;j<h.length;j+=29){
      const a=h.subarray(j,j+29);a.sort();let s=0;
      for(let k=0;k<29;k++){s+=a[28-k];total[k]+=s;}
    }
  }
  for(let i=1;i<cuts.length;i++){
    const b=cuts[i-1],e=cuts[i],len=e-b,lim=Math.min(q,len);
    if(!lim)continue;
    const h=combined??new Uint16Array(lim*29);
    for(let j=b;j<e;j++)h[((j-b)%q)*29+C[j]]++;
    if(!shared)accumulate(h);
  }
  if(combined)accumulate(combined);
  assert.equal(total[28],N);
  return total;
}
const pageCuts=corpus.pages.filter(p=>p.page<56).reduce((a,p)=>[...a,a.at(-1)+p.indices.length],[0]);
const scopes=[['global',[0,N],true],['chapter-shared',starts,true],['page-shared',pageCuts,true],['chapter-private',starts,false],['page-private',pageCuts,false]];
const prefixes=donors.map(([d,a])=>[d,prefix(hist(a))]);
const out=[];
for(const [name,cuts,shared] of scopes){
  const limit=3301,first=prefixes.map(()=>null),last=prefixes.map(()=>null),pass=prefixes.map(()=>0),ranges=prefixes.map(()=>[]),all=[];
  for(let q=1;q<=limit;q++){
    const cap=capacity(cuts,q,shared);
    const gaps=prefixes.map(([d,p])=>Math.max(...p.map((v,k)=>v-cap[k])));
    gaps.forEach((g,i)=>{if(g<=0){if(first[i]===null)first[i]=q;last[i]=q;pass[i]++;const r=ranges[i];if(r.length&&r.at(-1)[1]===q-1)r.at(-1)[1]=q;else r.push([q,q]);}});
    if([8,13,29,59,100,256,3301].includes(q))all.push({q,gaps});
  }
  out.push({name,limit,donors:prefixes.map(([d],i)=>({d,first:first[i],last:last[i],pass:pass[i],ranges:ranges[i]})),selected:all});
}
// Known q8 and q13 checkpoints from the previous exact envelope.
assert.deepEqual(out[0].selected.slice(0,2).map(x=>x.gaps),[[4070,4005,3963,4014,3946,3960],[3882,3817,3771,3819,3751,3765]]);
assert.deepEqual(out[3].selected.slice(0,2).map(x=>x.gaps),[[2835,2770,2724,2751,2700,2699],[2346,2281,2238,2260,2217,2223]]);
console.log(JSON.stringify(out,null,2));
