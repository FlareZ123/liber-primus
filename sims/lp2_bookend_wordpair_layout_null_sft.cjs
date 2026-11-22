'use strict';
// SFT: node sims/lp2_bookend_wordpair_layout_null_sft.cjs
// Exact original word inventory, fixed printed length tape and two alternative shuffling levels.
const assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path');
const root=path.resolve(__dirname,'..');
const gp=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const master=fs.readFileSync(path.join(root,'resources/transcriptions/liber_primus_master.txt'),'utf8');
const sections=master.slice(master.indexOf('\n\n')+2).split('$').slice(7,16);
const words=sections.flatMap(s=>s.split(/[-.&§]/u).map(z=>z.match(/[\u16A0-\u16FF]/gu)).filter(Boolean));
assert.equal(words.length,2896);
const ids=new Map(),types=[],lens=[],pages=[],chapters=[];
const chapterStarts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956];
const pageEnds=[];let sum=0;
for(const p of gp.pages.filter(p=>p.page<=55)){sum+=p.indices.length;pageEnds.push(sum)}
assert.equal(sum,12956);
let offset=0,pg=0;
for(const w of words){
  while(pg<pageEnds.length&&offset>=pageEnds[pg])pg++;
  const ch=chapterStarts.findIndex((v,i)=>offset>=v&&offset<chapterStarts[i+1]);
  assert.ok(ch>=0&&pg<pageEnds.length);
  const text=w.join('');
  if(!ids.has(text))ids.set(text,ids.size);
  types.push(ids.get(text));lens.push(w.length);pages.push(pg);chapters.push(ch);
  offset+=w.length;
}
assert.equal(offset,12956);
const target=ids.get('ᛞᛄᚢ')*2896+ids.get('ᛒᛖᛁ');
const original=new Map();
for(let i=0;i<types.length-1;i++){
  if(pages[i]!==pages[i+1])continue;
  const k=types[i]*2896+types[i+1];
  if(!original.has(k))original.set(k,[]);
  original.get(k).push(i);
}
assert.deepEqual([...original].filter(([,pos])=>pos.length>=2),[[target,[1462,2894]]]);
/** @param {number[]} layout */
function groups(layout){
  const map=new Map();
  for(let i=0;i<layout.length;i++){
    const k=layout[i]+':'+lens[i];if(!map.has(k))map.set(k,[]);
    map.get(k).push(i);
  }
  return [...map.values()];
}
/** @param {number} seed */
function randomSource(seed){return()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296)}
/** @param {string} name @param {number[]} layout @param {number} seed */
function simulate(name,layout,seed){
  const allGroups=groups(layout),rand=randomSource(seed),a=Int32Array.from(types);
  const N=30000;let any=0,long=0,targetTwice=0,duplicates=0;const histogram={};
  for(let trial=0;trial<N;trial++){
    a.set(types);
    for(const pos of allGroups)for(let j=pos.length-1;j>0;j--){
      const k=Math.floor(rand()*(j+1)),x=pos[j],y=pos[k],v=a[x];
      a[x]=a[y];a[y]=v;
    }
    const seen=new Set();let repeated=0,max=0,found=0;
    for(let i=0;i<a.length-1;i++){
      if(layout[i]!==layout[i+1])continue;
      const k=a[i]*2896+a[i+1];if(k===target)found++;
      if(seen.has(k)){repeated++;max=Math.max(max,lens[i]+lens[i+1]);}
      else seen.add(k);
    }
    duplicates+=repeated;any+=Number(max>0);long+=Number(max>=6);
    targetTwice+=Number(found===2);histogram[max]=(histogram[max]||0)+1;
  }
  return {name,seed:'0x'+seed.toString(16),trials:N,groups:allGroups.length,
    anyRepeatedPair:any,atLeastSixRunes:long,observedPairExactlyTwice:targetTwice,
    meanRepeatedPairs:duplicates/N,histogram};
}
const chapter=simulate('visual-chapter plus word-length',chapters,0x3301be17);
const page=simulate('physical-page plus word-length',pages,0x3301be18);
assert.equal(chapter.atLeastSixRunes,4);
assert.equal(chapter.observedPairExactlyTwice,3);
assert.equal(page.atLeastSixRunes,754);
assert.equal(page.observedPairExactlyTwice,379);
console.log(JSON.stringify({source:'Original 12956 GP29 runes, 2896 printed words',
  sourceWordTypes:ids.size,observed:{pair:'DJU BEI',wordIndices:[1462,2894],
    originalPages:[27,55],runes:6},
  chapter,page,exactSelectedPairProbabilities:{
    chapter:(25/(83*82))*(1/(14*13)),
    page:(4/(13*12))*(1/2)
  },interpretation:'A long repeated word pair is unusually placed under chapter-wide exchangeability; page-conditioned location is much less surprising. No key/plaintext inferred.'},null,2));