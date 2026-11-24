'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const paths=['resources/liber-primus/lp2-corpus.json','resources/liber-primus/lp2-transcription.txt','resources/external/relikd-solved-gp29-native-v1.json','resources/control/english_wordfreq_textblob.txt','resources/control/gibran_prophet_58585.txt','resources/control/shakespeare_first300k.txt','resources/control/emerson_essays_2944.txt','resources/control/blake_song_of_liberty_train.txt'];
const data=paths.map(p=>fs.readFileSync(p,'utf8'));
const j=JSON.parse(data[0]),idx=new Map(j.runes.map((x,i)=>[x,i]));
const native=JSON.parse(data[2]).sections.map(s=>({name:s.name,words:s.source_text.split(/[^ᚠ-ᛠ]+/u).map(w=>[...w].filter(x=>idx.has(x)).map(x=>idx.get(x))).filter(w=>w.length)}));
let words=[],w=[],at=0,start=0;
for(const x of data[1].split('%').slice(0,55).join('%')){
  if(idx.has(x)){if(!w.length)start=at;w.push(idx.get(x));at++}
  else if(!' %/\n\r\t'.includes(x)&&w.length){words.push({start,w});w=[]}
}
if(w.length)words.push({start,w});
assert.deepEqual(words.flatMap(x=>x.w),j.pages.slice(0,56).flatMap(p=>p.indices));
assert.equal(words.length,2896);assert.equal(at,12956);
const tokens=j.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} word @returns {number[]} */
function encode(word){
  let s=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG').replace(/IO/g,'IA'),p=[];
  while(s.length){const t=tokens.find(t=>s.startsWith(t.s));assert(t);p.push(t.i);s=s.slice(t.s.length)}
  return p;
}
const base=new Map();
for(const f of data.slice(3))for(const w of f.match(/[A-Za-z]+/g)||[]){const p=encode(w);base.set(p.join(','),p)}
/** @param {number} ex */
function lexicon(ex){const m=new Map(base);for(let i=0;i<native.length;i++)if(i!==ex)for(const w of native[i].words)m.set(w.join(','),w);return m}
const mod=x=>((x%29)+29)%29;
const inv=Array.from({length:29},(_,x)=>Array.from({length:29},(_,y)=>y).find(y=>x*y%29===1)||0);
/** @param {number} x @param {number} e */
function pow(x,e){let r=1;for(;e;e>>=1,x=x*x%29)if(e&1)r=r*x%29;return r}
const ord=Array.from({length:29},(_,x)=>x===0?0:Array.from({length:28},(_,i)=>i+1).find(e=>pow(x,e)===1));
const orders=[0,1,2,4,7,14,28],cl=ord.map(x=>orders.indexOf(x));
const units=[1,3,5,9,11,13,15,17,19,23,25,27];
// Equality of order classes is both necessary and sufficient for some legal exponent.
for(let x=0;x<29;x++)for(let y=0;y<29;y++)assert.equal(cl[x]===cl[y],units.some(e=>pow(x,e)===y));
const input=[],output=[];
for(let a=1;a<29;a++)for(let b=0;b<29;b++){
  input.push({a,b,tab:Array.from({length:29},(_,x)=>cl[mod(a*x+b)])});
  output.push({a,b,tab:Array.from({length:29},(_,x)=>cl[mod((x-b)*inv[a])])});
}
/** @param {number[]} w @param {number[]} t */
function sig(w,t){assert(w.length<=18);return w.reduce((s,x)=>7*s+t[x],0)}
/** @param {{start:number,w:number[]}[]} rows @param {Map<string,number[]>} L @param {boolean} hold */
function solve(rows,L,hold){
  assert(rows.every(r=>!r.w.includes(0)));
  const lens=[...new Set(rows.map(x=>x.w.length))];
  const lists=new Map(lens.map(n=>[n,[...L.values()].filter(w=>w.length===n&&(!hold||!w.includes(0)))]));
  const sigs=output.map(k=>rows.map(r=>sig(r.w,k.tab)));
  const cnt=Array(rows.length+1).fill(0),individual=Array(rows.length).fill(0);
  let max=0,best=[];
  for(const a of input){
    const sets=new Map(lens.map(n=>[n,new Set(lists.get(n).map(w=>sig(w,a.tab)))]));
    for(let k=0;k<output.length;k++){
      let count=0,mask=0;
      for(let r=0;r<rows.length;r++)if(sets.get(rows[r].w.length).has(sigs[k][r])){count++;mask|=1<<r;individual[r]++}
      cnt[count]++;if(count>max){max=count;best=[]}
      if(count===max)best.push({a:a.a,b:a.b,d:output[k].a,e:output[k].b,mask});
    }
  }
  assert.equal(cnt.reduce((a,b)=>a+b,0),812**2);
  return {lex:L.size,lengthCounts:Object.fromEntries(lens.map(n=>[n,lists.get(n).length])),individual,cnt,max,bestN:best.length,best};
}
const starts=j.pages.map((_,i)=>j.pages.slice(0,i).reduce((n,p)=>n+p.indices.length,0));
const rows=words.filter(x=>x.start>=starts[15]&&x.start+x.w.length<=starts[22]&&!x.w.includes(0)).sort((a,b)=>b.w.length-a.w.length||a.start-b.start).slice(0,6).map(x=>({start:x.start-starts[15],w:x.w}));
assert.deepEqual(rows.map(x=>[x.start,x.w.length]),[[159,13],[322,12],[341,12],[1522,11],[1571,11],[834,10]]);
for(const hold of [false,true]){
  const r=solve(rows,lexicon(-1),hold);
  assert.equal(r.max,2);assert.equal(r.bestN,2);
  assert.deepEqual(r.cnt,hold?[656508,2834,2,0,0,0,0]:[656134,3208,2,0,0,0,0]);
  console.log(JSON.stringify({original:'p15-21',hold,rows:rows.map(x=>[x.start,x.w.length]),...r}));
}
let seed=0x47c1a55e;
const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
for(const [i,k,hold]of [[3,{a:9,b:11,d:7,e:18},false],[4,{a:13,b:4,d:21,e:8},true]]){
  const L=lexicon(i),rows=[];
  let off=0,total=0,replayed=0;
  for(const p of native[i].words){
    const ex=p.map(()=>units[rng()%12]);
    const w=p.map((v,z)=>hold&&v===0?0:mod(k.d*pow(mod(k.a*v+k.b),ex[z])+k.e));
    const rec=w.map((c,z)=>hold&&p[z]===0?0:mod((pow(mod((c-k.e)*inv[k.d]),units.find(v=>v*ex[z]%28===1))-k.b)*inv[k.a]));
    total+=p.length;replayed+=rec.filter((x,z)=>x===p[z]).length;
    // Positive calibration deliberately chooses native, in-register zero-free anchors.
    if(!w.includes(0)&&L.has(p.join(',')))rows.push({start:off,w,p});
    off+=p.length;
  }
  rows.sort((a,b)=>b.w.length-a.w.length||a.start-b.start);
  const chosen=rows.slice(0,6),r=solve(chosen,L,hold);
  const truth=r.best.some(v=>v.a===k.a&&v.b===k.b&&v.d===k.d&&v.e===k.e);
  assert.equal(replayed,total);assert(truth);assert.equal(r.max,6);assert.equal(r.bestN,2);
  console.log(JSON.stringify({control:i,hold,k,chosen:chosen.map(x=>[x.start,x.w.length,x.p.map(x=>j.translit[x]).join('')]),total,replayed,truth,...r}));
}
