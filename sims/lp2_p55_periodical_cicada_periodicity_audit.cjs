'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const corpus=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const annotations=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-ink-annotations.json','utf8'));
const raw=fs.readFileSync('resources/lp2-transcription.txt','utf8').replace(/\r/g,'');
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const texts=raw.split('%').map(s=>s.trim()).filter(Boolean);
assert.equal(texts.length,57);
texts.splice(50,0,'');
function parseWords(text){
  const words=[];let cur=[];
  const finish=()=>{if(cur.length){words.push(cur.slice());cur=[];}};
  for(const ch of text){
    if(runeIndex.has(ch))cur.push(runeIndex.get(ch));
    else if(ch==='/'||/\s/u.test(ch)){}
    else finish();
  }
  finish();return words;
}
const p55Words=parseWords(texts[55]);
assert.equal(p55Words.length,17);
assert.equal(corpus.pages[55].runic_count,76);

const marks=annotations.pages.flatMap(p=>(p.large_punctuation||[])
  .filter(m=>m[1]===13&&m[2]==='red')
  .map(m=>({page:p.page,offset:m[0]})));
assert.equal(marks.length,30);
let globalStart=0;
const pageStart=[];
for(let p=0;p<corpus.pages.length;p++){pageStart[p]=globalStart;globalStart+=corpus.pages[p].runic_count;}
const residues={page:Array(13).fill(0),offset:Array(13).fill(0),global:Array(13).fill(0)};
for(const m of marks){
  residues.page[m.page%13]++;
  residues.offset[m.offset%13]++;
  residues.global[(pageStart[m.page]+m.offset)%13]++;
}
assert.deepEqual(residues.page,[5,3,5,4,2,1,3,5,0,1,1,0,0]);
assert.deepEqual(residues.offset,[4,1,2,2,2,4,4,4,1,2,2,1,1]);
assert.deepEqual(residues.global,[2,4,4,2,3,1,2,4,2,2,1,1,2]);

const unknown=corpus.pages.slice(0,56);
const stream=unknown.flatMap(p=>p.indices);
function ic(a){const f=Array(29).fill(0);for(const x of a)f[x]++;const n=a.length;return f.reduce((s,v)=>s+v*(v-1),0)/(n*(n-1));}
function periodProfile(period,resetPages){
  const cols=Array.from({length:period},()=>[]);
  if(resetPages){for(const page of unknown)page.indices.forEach((x,i)=>cols[i%period].push(x));}
  else stream.forEach((x,i)=>cols[i%period].push(x));
  const values=cols.map(ic);
  return {period,mean:values.reduce((a,b)=>a+b,0)/period,min:Math.min(...values),max:Math.max(...values)};
}
const globalProfiles=Array.from({length:40},(_,i)=>periodProfile(i+1,false));
const pageProfiles=Array.from({length:40},(_,i)=>periodProfile(i+1,true));
const rank=(arr,p)=>1+arr.slice().sort((a,b)=>b.mean-a.mean).findIndex(x=>x.period===p);
function lagMetrics(k,resetPages){
  const joint=Array.from({length:29},()=>Array(29).fill(0)),left=Array(29).fill(0),right=Array(29).fill(0);
  let n=0,equal=0;
  const consume=a=>{for(let i=0;i+k<a.length;i++){const x=a[i],y=a[i+k];joint[x][y]++;left[x]++;right[y]++;n++;if(x===y)equal++;}};
  if(resetPages)unknown.forEach(p=>consume(p.indices));else consume(stream);
  let mi=0;for(let x=0;x<29;x++)for(let y=0;y<29;y++){const v=joint[x][y];if(v)mi+=(v/n)*Math.log2((v*n)/(left[x]*right[y]));}
  return {lag:k,pairs:n,equalityRate:equal/n,mutualInformationBits:mi};
}
const result={
  hypothesis:'p55 cicada illustration + 17 printed words + red13 punctuation + p57 EMERGE might suggest a periodical-cicada 13/17-year clock',
  p55:{runes:76,printedWords:p55Words.length,red13TerminalMark:marks.some(m=>m.page===55&&m.offset===76)},
  red13MarkerCount:marks.length,
  red13ResidueCounts:residues,
  period17:{
    global:globalProfiles[16],globalRank:rank(globalProfiles,17),
    pageReset:pageProfiles[16],pageResetRank:rank(pageProfiles,17),
    globalLag:lagMetrics(17,false),pageLocalLag:lagMetrics(17,true)
  },
  period13:{
    global:globalProfiles[12],globalRank:rank(globalProfiles,13),
    pageReset:pageProfiles[12],pageResetRank:rank(pageProfiles,13)
  },
  decision:'No concentrated red13 modulo-13 placement and no standout period17 column-IC or lag17 echo. This rejects a simple global/page-reset period17 Vigenere clock, not every possible use of the cicada motif. No source-selected key or reversible operation is supplied by the visual association alone.'
};
console.log(JSON.stringify(result,null,2));
