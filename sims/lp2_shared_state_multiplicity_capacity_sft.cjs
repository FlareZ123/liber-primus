// Agent 49: multiplicity-capacity necessary condition, direct shared finite-state output.
"use strict";
const fs=require("node:fs");
function run(corpus,txt,lo=0,hi=55){
const pages=corpus.pages.filter(p=>p.page>=lo&&p.page<=hi&&p.indices.length),cipher=pages.flatMap(p=>p.indices),N=cipher.length;
const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
const words=(txt.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]).map(w=>{const out=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3;}else if(w.startsWith("IO",i)){out.push(27);i+=2;}else{const x=tokens.find(x=>w.startsWith(x.s,i));if(!x)throw Error(w);out.push(x.i);i+=x.s.length;}}return out;});
const n=words.reduce((s,w)=>s+w.length,0);let results=[];
const qs=[5,8,13,16,29],joint=qs.map(q=>new Uint8Array(n-N+1).fill(1));
for(const L of [2,3,4,5]){
 const cm=new Map();let cap=0;for(let i=0;i+L<=N;i++){let x=0;for(let j=0;j<L;j++)x=x*29+cipher[i+j];let f=cm.get(x)||0;cap+=f;cm.set(x,f+1);}
 const cFreq=[...cm.values()].sort((a,b)=>b-a),cPrefix=[0];for(const f of cFreq)cPrefix.push(cPrefix[cPrefix.length-1]+f);
 const B=(pages.length-1)*(L-1),seq=new Int32Array(n).fill(-1),m=new Map();let offset=0;
 for(const w of words){for(let i=0;i+L<=w.length;i++){let x=0;for(let j=0;j<L;j++)x=x*29+w[i+j];if(!m.has(x))m.set(x,m.size);seq[offset+i]=m.get(x);}offset+=w.length;}
 const stats=qs.map(q=>({q,minDeficit:Infinity,passed:0}));
 const hist=new Int32Array(m.size),freq=new Int32Array(N+1);let max=0;
 const add=v=>{if(v<0)return;let f=hist[v]++;if(f)freq[f]--;freq[f+1]++;max=Math.max(max,f+1);};
 const rem=v=>{if(v<0)return;let f=--hist[v];freq[f+1]--;if(f)freq[f]++;while(max&&freq[max]===0)max--;};
 for(let i=0;i<=N-L;i++)add(seq[i]);for(let i=0;i+N<=n;i++){if(i){rem(seq[i-1]);add(seq[i+N-L]);}
 let r=0,ps=0,def=qs.map(q=>0);
 for(let f=max;f>0;f--){if(!freq[f])continue;r+=freq[f];ps+=freq[f]*f;
 for(let j=0;j<qs.length;j++)def[j]=Math.max(def[j],ps-cPrefix[Math.min(r*qs[j],cFreq.length)]);}
 for(let j=0;j<stats.length;j++){const s=stats[j];s.minDeficit=Math.min(s.minDeficit,def[j]);if(def[j]<=B)s.passed++;else joint[j][i]=0;}
 }results.push({L,B,cap,maxC:cFreq[0],stats});
}
return {N,n,windows:n-N+1,results,joint:qs.map((q,i)=>({q,passed:joint[i].reduce((a,b)=>a+b,0)}))};
}
function plant(){
 let s=49281;const next=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s;};
 const q=8,dict=Array.from({length:q},()=>{let a=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){const j=next()%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;});
 const vocabulary=Array.from({length:20},()=>Array.from({length:5+next()%5},()=>next()%29));
 const words=Array.from({length:200},()=>vocabulary[next()%vocabulary.length]);
 const p=words.flat(),c=[];let k=0;for(let i=0;i<p.length;i++){if(i===301||i===850)k=next()%q;let x=p[i];c.push(x===0?0:dict[k][x]);if(x!==0)k=(k+1)%q;}
 const results=[];for(let L=2;L<=5;L++){let pm=new Map(),cm=new Map();const add=(m,k)=>m.set(k,(m.get(k)||0)+1);
 for(const w of words)for(let j=0;j+L<=w.length;j++)add(pm,w.slice(j,j+L).join(","));
 for(let j=0;j+L<=c.length;j++)add(cm,c.slice(j,j+L).join(","));
 const a=[...pm.values()].sort((x,y)=>y-x),b=[...cm.values()].sort((x,y)=>y-x);let d=0,ps=0,cs=0,k=0;for(let r=1;r<=a.length;r++){ps+=a[r-1];while(k<Math.min(q*r,b.length))cs+=b[k++];d=Math.max(d,ps-cs);}if(d>2*(L-1))throw Error("plant rejected");results.push({L,deficit:d,budget:2*(L-1)});}
 return results;
}
module.exports={run,plant};
if(require.main===module){const corpus=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));const controls=["gibran_prophet_58585.txt","shakespeare_first300k.txt","emerson_essays_2944.txt"];console.log(JSON.stringify({plant:plant(),controls:controls.map(f=>{const txt=fs.readFileSync("resources/control/"+f,"utf8");return {file:f,full:run(corpus,txt),chapter:run(corpus,txt,40,53)};})},null,2));}
