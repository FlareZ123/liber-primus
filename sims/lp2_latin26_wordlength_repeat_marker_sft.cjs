'use strict';
/** Reproduce: node sims/lp2_latin26_wordlength_repeat_marker_sft.cjs (Node 22). */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
/** @param {string} filename @returns {string} */
const read=filename=>fs.readFileSync(path.join(root,filename),'utf8');
const runeSet=new Set([...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ']);
const source=read('resources/lp2-transcription.txt').split('%').slice(0,55).join('%');
let page=0,previous=null,word=[],words=[],repeat=[0,0,0],total=0;
/** @returns {void} */
function finish(){
 if(!word.length)return;
 const L=word.length;
 word.forEach((x,k)=>{if(x.event){repeat[0]++;if(L>=8)repeat[1]++;if(k===0)repeat[2]++;}});
 words.push(word);word=[];
}
for(const c of source){
 if(runeSet.has(c)){
  const r={eligible:previous!==null&&previous.page===page,event:previous!==null&&previous.page===page&&previous.value===c,page,value:c};
  word.push(r);previous=r;total++;
 }else if(c==='%')page++;
 else if(c==='/'||/\s/u.test(c)){}
 else finish();
}
finish();
assert.equal(total,12956);assert.equal(words.length,2896);
assert.deepEqual(repeat,[86,21,23]);
const histogram=new Uint32Array(14);
for(const w of words)histogram[w.length-1]++;
assert.deepEqual([...histogram],[83,448,720,513,317,256,216,156,78,52,32,18,4,3]);
const refs=[
 'resources/control/gibran_prophet_58585.txt',
 'resources/control/shakespeare_first300k.txt',
 'resources/control/emerson_essays_2944.txt',
 'resources/liber-primus/lp1-plaintext-reference.txt'
];
/** @param {number[]} values @returns {number[]} */
function probs(values){
 const n=values.length,counts=new Uint32Array(15);
 for(const v of values)counts[Math.min(v,15)-1]++;
 return [...counts].map(x=>x/n);
}
/** @param {number[]} a @param {number[]} b @returns {number} */
function kl(a,b){return a.reduce((sum,p,k)=>sum+p*Math.log((p+1e-12)/(b[k]+1e-12)),0);}
const original=probs(words.map(w=>w.length));
const records=[];
for(const file of refs){
 const lines=read(file).split('\n');
 const txt=file.includes('lp1-plaintext-reference')?lines.filter(s=>!s.startsWith('#')).join(' '):lines.join('\n');
 const entries=txt.toUpperCase().match(/[A-Z]+/g)||[];
 const latin=entries.map(w=>w.length);
 const gp=entries.map(w=>{
  const x=w.replace(/[KQ]/g,'C').replace(/V/g,'U').replace(/Z/g,'S');
  return (x.match(/TH|NG|EO|OE|AE|IA|EA|./g)||[]).length;
 });
 const latinKL=kl(original,probs(latin)),gpKL=kl(original,probs(gp));
 assert(latinKL<gpKL,file+' native Latin shape should fit better');
 const occ=Array.from({length:15},(_,n)=>Array.from({length:n+1},()=>new Uint32Array(26)));
 const pop=new Uint32Array(15);
 for(const w of entries){
  const len=w.length;if(len<1||len>14)continue;
  pop[len]++;
  for(let k=0;k<len;k++)occ[len][k][w.charCodeAt(k)-65]++;
 }
 const expected=Array.from({length:26},()=>[0,0,0]);
 for(const w of words){
  const L=w.length;
  assert(pop[L]>0);
  for(let k=0;k<L;k++){
   if(!w[k].eligible)continue;
   for(let q=0;q<26;q++){
    const p=occ[L][k][q]/pop[L];
    expected[q][0]+=p;
    if(L>=8)expected[q][1]+=p;
    if(k===0)expected[q][2]+=p;
   }
  }
 }
 const score=v=>Math.sqrt(v.reduce((s,x,k)=>s+((x-repeat[k])/Math.sqrt(repeat[k]))**2,0));
 const rank=expected.map((v,q)=>({q,score:score(v)})).sort((a,b)=>a.score-b.score);
 assert.equal(rank[0].q,10,'Latin K expected to be nearest of 26 in '+file);
 records.push({file,referenceWords:entries.length,latinMean:latin.reduce((s,n)=>s+n,0)/entries.length,
  gpMean:gp.reduce((s,n)=>s+n,0)/entries.length,KLlatin:latinKL,KLgp:gpKL,
  bestMarker:String.fromCharCode(65+rank[0].q),expectedK:expected[10],
  markerSecond:String.fromCharCode(65+rank[1].q)});
}
console.log(JSON.stringify({result:'PASS; preliminary Latin-register discriminator, no cipher/key or plaintext',
 original:{runes:total,words:words.length,repeat,mean:total/words.length},
 references:records},null,2));
