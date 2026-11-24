'use strict';
const fs = require('node:fs');
const path = require('node:path');
function run(c,ref){
  const prime=c.prime, source=c.pages[57].indices, spell=c.translit;
  const key=source.map(r=>parseInt(prime[r].toString(2).slice(1,-1)||"0",2)%29);
  const mod=x=>(x%29+29)%29;
  const rules=[["ING",21],["TH",2],["EO",12],["NG",21],["OE",22],["AE",25],["IA",27],["IO",27],["EA",28],["QU",5],["Q",5],["K",5],["V",1],...spell.map((s,i)=>[s,i]).filter(x=>x[0].length===1)].sort((a,b)=>b[0].length-a[0].length);
  function gp(t){let out=[];for(const word of t.toUpperCase().match(/[A-Z]+/g)||[]){for(let i=0;i<word.length;){const pair=rules.find(([s])=>word.startsWith(s,i));if(!pair){i++;continue}out.push(pair[1]);i+=pair[0].length}}return out}
  const sections=ref.split("### 56")[0].split(/^### /m).slice(1).map(s=>({id:Number(s.match(/^\d+/)[0]),P:gp(s)}));
  function model(train){let uni=Array(29).fill(.5),bi=Array.from({length:29},()=>Array(29).fill(.5)),tr=Array.from({length:841},()=>Array(29).fill(.5));for(const seq of train)for(let i=0;i<seq.length;i++){const x=seq[i];uni[x]++;if(i>0)bi[seq[i-1]][x]++;if(i>1)tr[29*seq[i-2]+seq[i-1]][x]++}const normalize=a=>{const s=a.reduce((x,y)=>x+y);return a.map(x=>x/s)};uni=normalize(uni);bi=bi.map(normalize);tr=tr.map(normalize);return (x,a,b)=>Math.log(a===29?uni[x]:b===29?.75*bi[a][x]+.25*uni[x]:.6*tr[b*29+a][x]+.3*bi[a][x]+.1*uni[x]);}
  function encode(P,sgn){let k=0;return P.map(p=>p===0?0:mod(p+sgn*key[k++%key.length]))}
  function decode(C,sgn,score){let states=new Map([["0,29,29",{k:0,a:29,b:29,count:1n,s:0,p:[]}]]);for(let i=0;i<C.length;i++){const next=new Map();for(const v of states.values()){const p=mod(C[i]-sgn*key[v.k%key.length]);const opts=[];if(C[i]===0)opts.push([0,v.k]);if(p!==0)opts.push([p,v.k+1]);for(const [x,k] of opts){const id=[k,x,v.a].join(",");const s=v.s+score(x,v.a,v.b);const old=next.get(id);const count=(old?.count??0n)+v.count;if(!old||s>old.s)next.set(id,{k,a:x,b:v.a,count,s,p:[...v.p,x]});else old.count=count}}states=next;if(!states.size)return {legal:false,fail:i,count:"0"}}let count=0n,best;for(const v of states.values()){count+=v.count;if(!best||v.s>best.s)best=v}return {legal:true,count:count.toString(),score:best.s/C.length,plaintext:best.p.map(x=>spell[x]).join(""),replay:encode(best.p,sgn).every((v,i)=>v===C[i]),P:best.p}}
  const score=model(sections.map(x=>x.P));
  const targets={p55:c.pages[55].indices,p0body:c.pages[0].indices.slice(13),p16:c.pages[16].indices,p54p55:c.pages[54].indices.concat(c.pages[55].indices)};
  const results=[];for(const [name,C] of Object.entries(targets))for(const sgn of [1,-1]){const {P,...d}=decode(C,sgn,score);results.push({name,sgn,n:C.length,...d})}
  const plants=[];for(const id of [1,3,16]){const s=sections.find(x=>x.id===id);const train=sections.filter(x=>x.id!==id).map(x=>x.P);const P=s.P.slice(0,260),sc=model(train);for(const sgn of [1,-1]){const C=encode(P,sgn),d=decode(C,sgn,sc);plants.push({id,sgn,exact:d.P?.filter((x,i)=>x===P[i]).length,n:P.length,score:d.score,legal:d.legal,replay:d.replay,count:d.count})}}
  return {sourceLen:source.length,trainLen:sections.reduce((s,x)=>s+x.P.length,0),key,distinct:new Set(key).size,results,plants};
}
const root=path.join(__dirname,'..','resources','liber-primus');
const c=JSON.parse(fs.readFileSync(path.join(root,'lp2-corpus.json'),'utf8'));
const ref=fs.readFileSync(path.join(root,'lp1-plaintext-reference.txt'),'utf8');
console.log(JSON.stringify(run(c,ref),null,2));
