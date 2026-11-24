"use strict";
// Printed p15 Hill transform on active non-F plaintext, F positions transparent.
// Complete inverse graph includes all choices for visible ciphertext F.
const fs=require("node:fs"),path=require("node:path");
const {inverse,transform}=require("./lp2_stage10_hill_outer_fhold_gate_sft.cjs");
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
const M=[[3258,3222,3152,3038],[3278,3299,3298,2838],[3288,3294,3296,2472],[4516,1206,708,1820]],n=M.length;
const ok=(v,m)=>{if(!v)throw Error(m)};
const eq=(a,b)=>String(a)===String(b);
function encode(P){const a=P.filter(x=>x!==0),cut=a.length-a.length%n,out=transform(M,a.slice(0,cut)).concat(a.slice(cut));let j=0;return P.map(x=>x===0?0:out[j++]);}
/** Enumerate every legal next complete active block, or unchanged final fringe. */
function edges(C,I,start){
 const out=[],active=[],mask=[];
 function rec(i){
  if(active.length===n){const p=transform(I,active);if(!p.includes(0)){let k=0;out.push({end:i,p:mask.map(h=>h?0:p[k++]),fringe:false});}return;}
  if(i===C.length)return;
  const c=C[i];if(c===0){mask.push(true);rec(i+1);mask.pop();}
  active.push(c);mask.push(false);rec(i+1);mask.pop();active.pop();
 }
 rec(start);
 if(C.slice(start).filter(x=>x!==0).length<n)out.push({end:C.length,p:C.slice(start),fringe:true});
 return out;
}
function support(C,I){
 const at=Array(C.length+1).fill(false);at[0]=true;let furthest=0,edgeCount=0,reachable=1;const graph=new Map();
 for(let i=0;i<C.length;i++)if(at[i]){const E=edges(C,I,i);graph.set(i,E);edgeCount+=E.length;for(const e of E){if(!at[e.end])reachable++;at[e.end]=true;furthest=Math.max(furthest,e.end);}}
 return {legal:at[C.length],furthest,edgeCount,reachable,graph};
}
function language(secs,exclude){const uni=Array(29).fill(.2),bi=Array.from({length:29},()=>Array(29).fill(.1)),tri=Array.from({length:841},()=>Array(29).fill(.05));for(let j=0;j<secs.length;j++)if(j!==exclude){const P=secs[j];for(let i=0;i<P.length;i++){uni[P[i]]++;if(i)bi[P[i-1]][P[i]]++;if(i>1)tri[P[i-2]*29+P[i-1]][P[i]]++;}}const norm=row=>{const s=row.reduce((a,b)=>a+b);return row.map(v=>v/s);};const u=norm(uni),b=bi.map(norm),t=tri.map(norm);return (x,y,z)=>Math.log(x<0?(y<0?u[z]:.7*b[y][z]+.3*u[z]):.55*t[x*29+y][z]+.35*b[y][z]+.1*u[z]);}
function decode(C,graph,LM){const at=Array.from({length:C.length+1},()=>new Map());at[0].set("-1,-1",{a:-1,b:-1,score:0,prev:null,p:null});
 for(let i=0;i<C.length;i++)for(const s of at[i].values())for(const e of graph.get(i)||[]){let a=s.a,b=s.b,score=s.score;for(const v of e.p){score+=LM(a,b,v);a=b;b=v;}const k=a+","+b,old=at[e.end].get(k);if(!old||score>old.score)at[e.end].set(k,{a,b,score,prev:s,p:e.p});}
 let best=null;for(const s of at.at(-1).values())if(!best||s.score>best.score)best=s;if(!best)return null;
 const p=[];for(let s=best;s.p;s=s.prev)p.unshift(s.p);return {P:p.flat(),score:best.score/C.length};
}
function run(data){const gp=JSON.parse(data[0]),native=JSON.parse(data[1]),map=new Map(gp.runes.map((v,i)=>[v,i])),secs=native.sections.map(s=>[...s.source_text].filter(v=>map.has(v)).map(v=>map.get(v))),I=inverse(M),out=[];
 // Known native toy exercises transparent F and block support.
 const toy=[0,1,2,0,3,4,0,5,6,0,7,8,0];const toyC=encode(toy),g=support(toyC,I);ok(g.legal,"toy support");
 for(const j of [1,4,5]){const P=secs[j],C=encode(P),{graph,...s}=support(C,I);ok(s.legal,"native support "+j);
  const d=decode(C,graph,language(secs,j));ok(d&&eq(encode(d.P),C),"native replay");
  out.push({target:native.sections[j].name,n:C.length,cipherF:C.filter(x=>x===0).length,...s,score:d.score,exact:d.P.filter((p,i)=>p===P[i]).length});
 }
 const C=gp.pages.slice(16,23).flatMap(p=>p.indices);ok(C.length===1744,"fixed receiver");
 const {graph,...s}=support(C,I);let d=null;if(s.legal){d=decode(C,graph,language(secs,-1));ok(d&&eq(encode(d.P),C),"original replay");}
 return {controls:out,original:{pages:[16,22],n:C.length,cipherF:C.filter(x=>x===0).length,...s,prediction:d?{score:d.score,plaintext:d.P.map(x=>gp.translit[x]).join(" ")}:null}};
}
if(require.main===module)console.log(JSON.stringify(run(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
module.exports={run,files,encode,edges,support,decode,language};
