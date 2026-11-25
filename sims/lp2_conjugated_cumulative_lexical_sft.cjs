"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=f=>fs.readFileSync(path.join(__dirname,"..",f),"utf8");

function run(gp,tr,sources){
const mod=x=>(x%29+29)%29,N=58;
const inv=Array.from({length:29},(_,x)=>Array.from({length:29},(_,y)=>y).find(y=>x*y%29===1)||0);
const glyph=new Map(gp.runes.map((r,i)=>[r,i]));
const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
function native(s){return (s.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>{
let r=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S"),p=[];
while(r){let t=tokens.find(t=>r.startsWith(t.t));if(!t)throw Error(r);p.push(t.i);r=r.slice(t.t.length)}return {w,p}
})}
const dict=new Map();for(const s of sources)for(const w of native(s))if(!dict.has(w.p.join(",")))dict.set(w.p.join(","),w);
const by=Array.from({length:30},()=>[]);for(const w of dict.values())if(w.p.length<30)by[w.p.length].push(w);
let pos=0;const groups=[...tr.split("%").slice(0,55).join("%").replace(/\/\r?\n/g,"").replace(/[\r\n%]/g,"").matchAll(new RegExp("["+gp.runes.join("")+"]+","gu"))].map(x=>{let p=[...x[0]].map(r=>glyph.get(r));let z={pos,n:p.length,p};pos+=p.length;return z});
const full=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);if(pos!==12956||groups.length!==2896||groups.flatMap(w=>w.p).some((x,i)=>x!==full[i]))throw Error("layout");
const starts=[0];for(let p=0;p<56;p++)starts.push(starts.at(-1)+gp.pages.find(x=>x.page===p).indices.length);
function insert(mat,a,b,p){
 const v=new Int8Array(N);v[b]=1;v[a]=mod(v[a]-1);v[29+p]=28;
 for(let j=0;j<N;j++){if(!v[j])continue;const r=mat[j];if(r){let k=v[j];for(let i=j;i<N;i++)v[i]=mod(v[i]-k*r[i])}else{
 let k=inv[v[j]];for(let i=j;i<N;i++)v[i]=v[i]*k%29;mat[j]=v;return
 }}
}
function expressions(mat){
 const expr=Array(N);for(let j=N-1;j>=0;j--){const v=new Int8Array(N),r=mat[j];if(!r)v[j]=1;else for(let k=j+1;k<N;k++)if(r[k])for(let i=k;i<N;i++)v[i]=mod(v[i]-r[k]*expr[k][i]);expr[j]=v}return expr
}
function legal(mat){
 const expr=expressions(mat);for(let a=0;a<2;a++){const seen=new Set();for(let i=29*a;i<29*(a+1);i++){let k=expr[i].join(",");if(seen.has(k))return false;seen.add(k)}}return true
}
function state(){return {mat:Array(N).fill(null),edge:new Int8Array(841).fill(-1),row:new Int8Array(841).fill(-1),col:new Int8Array(841).fill(-1),zero:-1,nonzero:0}}
function compile(C,P){
 let eq=[],seen=new Set();
 for(let j=0;j<P.length;j++){const a=C[j],b=C[j+1],p=P[j];const e=a*29+b;if(!seen.has(e)){eq.push([a,b,p,e,a*29+p,b*29+p]);seen.add(e)}else if(eq.find(x=>x[3]===e)[2]!==p)return null}
 const tmp=state();let zero=-1,nonzero=0;
 for(const [a,b,p,e,r,c] of eq){
 if(a===b){if((zero>=0&&zero!==p)||(nonzero&(1<<p)))return null;zero=p}else{if(zero===p)return null;nonzero|=1<<p}
 if(tmp.row[r]>=0&&tmp.row[r]!==b||tmp.col[c]>=0&&tmp.col[c]!==a)return null;tmp.row[r]=b;tmp.col[c]=a;insert(tmp.mat,a,b,p)
 }
 return legal(tmp.mat)?{eq,zero,nonzero}:null
}
function compatible(s,c){
 if(c.zero>=0&&(s.zero>=0&&s.zero!==c.zero||s.nonzero&(1<<c.zero)))return false;
 if(s.zero>=0&&c.nonzero&(1<<s.zero))return false;
 for(const [a,b,p,e,r,z] of c.eq)if(s.edge[e]>=0&&s.edge[e]!==p||s.row[r]>=0&&s.row[r]!==b||s.col[z]>=0&&s.col[z]!==a)return false;
 return true
}
function extend(s,c){
 if(!compatible(s,c))return null;
 const t={mat:s.mat.slice(),edge:s.edge.slice(),row:s.row.slice(),col:s.col.slice(),zero:s.zero>=0?s.zero:c.zero,nonzero:s.nonzero|c.nonzero};
 for(const [a,b,p,e,r,z] of c.eq)if(t.edge[e]<0){insert(t.mat,a,b,p);t.edge[e]=p;t.row[r]=b;t.col[z]=a}
 return legal(t.mat)?t:null
}
// Find the maximum number of plaintext symbols with algebraically unique
// edge increments across all possible solutions of the training equations.
function decodeForced(s,C){
 const expr=expressions(s.mat);let p=[];
 for(let j=1;j<C.length;j++){
 let a=C[j-1],b=C[j],found=-1;
 for(let k=0;k<29;k++){let ok=true;for(let i=0;i<N;i++)if(mod(expr[b][i]-expr[a][i]-expr[29+k][i])){ok=false;break}if(ok){if(found>=0)throw Error("forced collision");found=k}}
 p.push(found)
 }
 return p
}
function solve(rows,C,cap,mode){
 const base=state(),rs=rows.map(r=>({...r,cands:by[r.C.length-1].flatMap(w=>{const c=compile(r.C,w.p);return c?[{...w,...c}]:[]})})).sort((a,b)=>a.cands.length-b.cands.length||b.C.length-a.C.length||a.pos-b.pos);
 let trials=0,checks=0,nodes=0,remaining=0,capped=false,maxDepth=0,examples=[],log=[];
 function search(s,rs,chosen){
 if(capped)return;nodes++;maxDepth=Math.max(maxDepth,chosen.length);
 if(!rs.length){
 remaining++;const pred=decodeForced(s,C);
 if(examples.length<5)examples.push({rank:s.mat.filter(Boolean).length,forced:pred.filter(x=>x>=0).length,pred,chosen});
 if(remaining>=100)capped=true;return
 }
 let best=-1,cs=null;
 for(let i=0;i<rs.length;i++){const a=[];for(const c of rs[i].cands){checks++;if(checks>cap*100){capped=true;return}if(compatible(s,c))a.push(c)}
 if(!a.length)return;
 if(cs===null||a.length<cs.length){best=i;cs=a;if(cs.length===1)break}}
 const row=rs[best],rest=rs.filter((_,i)=>i!==best);
 for(const c of cs){if(++trials>cap){capped=true;return}const t=extend(s,c);if(t)search(t,rest,chosen.concat({pos:row.pos,w:c.w,p:c.p,correct:row.P?String(c.p)===String(row.P):null}));if(capped)return}
 }
 if(mode==="fixed"){
 let frontier=[{s:base,chosen:[]}];
 for(const r of rs){const next=[];for(const u of frontier)for(const w of r.cands){if(++trials>cap)return {capped:true,log,trials,remaining:frontier.length};const s=extend(u.s,w);if(s)next.push({s,chosen:u.chosen.concat({pos:r.pos,w:w.w,p:w.p,correct:r.P?String(w.p)===String(r.P):null})})}
 log.push({pos:r.pos,n:r.C.length-1,local:r.cands.length,survivors:next.length});frontier=next;if(!frontier.length)break}
 return {capped:false,log,trials,remaining:frontier.length,examples:frontier.slice(0,5).map(u=>({rank:u.s.mat.filter(Boolean).length,chosen:u.chosen}))}
 }
 search(base,rs,[]);return {capped,trials,checks,nodes,remaining,maxDepth,local:rs.map(r=>[r.pos,r.C.length-1,r.cands.length]),examples}
}
const spans=[[0,2],[3,7],[23,26],[54,55]],results=[];
let seed=0x330e115a;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}function perm(){let p=Array.from({length:29},(_,i)=>i);for(let i=28;i;i--){let j=rng()%(i+1);[p[i],p[j]]=[p[j],p[i]]}return p}
for(const [a,b] of spans){
 const first=starts[a],last=starts[b+1],long=groups.filter(w=>w.pos>first&&w.pos+w.n<=last&&w.n>=8);
 const S=perm(),H=perm(),Sinv=Array(29);S.forEach((x,i)=>Sinv[x]=i);
 const P=Array.from({length:last-first},()=>rng()%29);
 for(const w of groups.filter(w=>w.pos>=first&&w.pos+w.n<=last)){const candidates=by[w.n];if(candidates?.length){const q=candidates[rng()%candidates.length].p;for(let j=0;j<q.length;j++)P[w.pos-first+j]=q[j]}}
 const C=[rng()%29];for(let i=1;i<P.length;i++)C.push(Sinv[mod(S[C[i-1]]+H[P[i]])]);
 const orig=long.map(w=>({pos:w.pos,C:full.slice(w.pos-1,w.pos+w.n)}));
 const plant=long.map(w=>({pos:w.pos,C:C.slice(w.pos-first-1,w.pos-first+w.n),P:P.slice(w.pos-first,w.pos-first+w.n)}));
 let st=state();for(const r of plant){const c=compile(r.C,r.P);if(!c)throw Error("plant local");st=extend(st,c);if(!st)throw Error("plant false rejection")}
 const train=plant.filter(w=>w.C.length-1>=10),hold=plant.filter(w=>w.C.length-1<10);
 let fixed={original:solve(orig.filter(w=>w.C.length-1>=10),full.slice(first,last),300000,"fixed"),plant:solve(train,C,300000,"fixed")};
 const adaptive={original:solve(orig,full.slice(first,last),200000,"adaptive"),plant:solve(plant,C,200000,"adaptive")};
 // Score algebraically forced plaintext only on positions not used as anchors.
 const used=new Set();for(const r of plant)for(let i=0;i<r.P.length;i++)used.add(r.pos-first+i);
 for(const ex of adaptive.plant.examples){let held=0,correct=0;for(let i=1;i<P.length;i++)if(!used.has(i)&&ex.pred[i-1]>=0){held++;correct+=ex.pred[i-1]===P[i]}ex.heldForced=held;ex.heldCorrect=correct;ex.heldLength=P.length-1-used.size;if(held!==correct)throw Error("wrong forced planted decoding");delete ex.pred}
 for(const ex of adaptive.original.examples)delete ex.pred;
 results.push({span:[a,b],long:long.length,truePlantRank:st.mat.filter(Boolean).length,fixed,adaptive});
}
return {dict:dict.size,results}
}

console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt"),["shakespeare_first300k.txt","emerson_essays_2944.txt","gibran_prophet_58585.txt"].map(f=>read("resources/control/"+f))),null,2));
