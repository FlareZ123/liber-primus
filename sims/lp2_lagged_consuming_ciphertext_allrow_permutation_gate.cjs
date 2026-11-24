'use strict';
const fs=require('node:fs');
const path=require('node:path');
function run(corpus,native,donors){
 const mod=n=>((n%29)+29)%29;
 const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length).map(p=>p.indices),total=pages.reduce((n,c)=>n+c.length,0);
 function top(p,k){const freq=Array(29).fill(0);for(const x of p)freq[x]++;return freq.sort((a,b)=>b-a).slice(0,k).reduce((s,n)=>s+n,0)}
 function bound(arrays,q,requireGlobalRows=true){
  const seen=Array.from({length:29},()=>new Set());for(const c of arrays){let n=0;for(let i=0;i<c.length;i++){n=c[i]?n+1:0;if(n>q)seen[c[i-q]].add(c[i]);}}
  const forced=seen.slice(1).every(x=>x.size===28);
  if(requireGlobalRows&&!forced)throw Error("nonzero row condition not forced");
  const counts=Array.from({length:29},()=>Array(29).fill(0));let unknown=0,holds=0,consuming=0;const cuts=[];
  for(const c of arrays){let cut=0,streak=0;for(;cut<c.length;){streak=c[cut++]?streak+1:0;if(streak===q)break;}
   if(streak!==q){unknown+=c.length;cuts.push(c.length);continue}
   unknown+=cut;cuts.push(cut);let queue=c.slice(cut-q,cut);
   for(let i=cut;i<c.length;i++){const x=c[i];if(!x){holds++;continue}const k=queue.shift();queue.push(x);if(!k)throw Error("nonzero queue invariant");counts[k][x]++;consuming++;}
  }
  const ranks=Array(28).fill(0);for(let k=1;k<29;k++){const row=counts[k].slice(1).sort((a,b)=>b-a);for(let i=0;i<28;i++)ranks[i]+=row[i];}
  const ranked=[holds,...ranks].sort((a,b)=>b-a);ranked[0]+=unknown;
  const N=unknown+holds+consuming;
  return {forced,unknown,holds,consuming,N,cuts,ranked,top9:ranked.slice(0,9).reduce((a,b)=>a+b,0),maxIoc:ranked.reduce((a,b)=>a+b*(b-1),0)/(N*(N-1))};
 }
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function donor(s){const result=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tokens.find(t=>w.startsWith(t.s));if(!t)throw Error("donor token "+w);result.push(t.i);w=w.slice(t.s.length)}}return result}
 const stats=donors.map(({name,s})=>{const p=donor(s),windows=[];for(let off=0;off+total<=p.length;off+=Math.floor(total/4)){const a=p.slice(off,off+total),freq=Array(29).fill(0);for(const v of a)freq[v]++;windows.push({off,top9:top(a,9),ioc:freq.reduce((a,b)=>a+b*(b-1),0)/(total*(total-1))});}return {name,sourceRunes:p.length,windows:windows.length,minTop9:Math.min(...windows.map(w=>w.top9)),maxTop9:Math.max(...windows.map(w=>w.top9)),minIoc:Math.min(...windows.map(w=>w.ioc)),maxIoc:Math.max(...windows.map(w=>w.ioc))}});
 const trueP=native.sections.flatMap(s=>Array.from(s.source_text,c=>native.runes.indexOf(c)).filter(x=>x>=0));
 const result={total,original:{},donorWindows:stats,controls:[]};
 for(const q of [8,13]){
  result.original[q]=bound(pages,q);
  const tables=Array.from({length:29},(_,k)=>[0,...Array.from({length:28},(_,i)=>1+mod(0)+((i+3*k+5)%28))]);
  const seed=Array.from({length:q},(_,i)=>1+((i*7+3)%28)),queue=seed.slice();
  const c=trueP.map(p=>{if(!p)return 0;const v=tables[queue.shift()][p];queue.push(v);return v});
  const decQueue=seed.slice(),p=c.map(v=>{if(!v)return 0;const d=tables[decQueue.shift()].indexOf(v);decQueue.push(v);return d});
  if(String(p)!==String(trueP))throw Error("plant inverse");
  const b=bound([c],q,false),actual=top(trueP,9);
  if(actual>b.top9)throw Error("invalid bound");
  result.controls.push({q,n:trueP.length,actualTop9:actual,boundTop9:b.top9,replay:true});
 }
 return result;
}
const root=path.resolve(__dirname,'..');
const load=p=>fs.readFileSync(path.join(root,p),'utf8');
const sources=["resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
console.log(JSON.stringify(run(JSON.parse(load('resources/liber-primus/lp2-corpus.json')),JSON.parse(load('resources/external/relikd-solved-gp29-native-v1.json')),sources.map(name=>({name,s:load(name)}))),null,2));
