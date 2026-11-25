"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function study(c,g,sh,d1,d2,dict){
const n=29,m=n**4,code=g.alphabet.replace("f",""),F=g.pages.flatMap(p=>p.tokens).map(t=>59*code.indexOf(t[0])+code.indexOf(t[1])),children=Array.from({length:256},()=>[]);for(let i=0;i<256;i++)if(i!==F[i])children[F[i]].push(i);
function subtree(u){let a=[u];for(let i=0;i<a.length;i++)a.push(...children[a[i]]);return a.sort((a,b)=>a-b);}
const V=subtree(58),W=subtree(244),ix=new Map(W.map((x,i)=>[x,i])),map=V.map(v=>ix.get(v)??-1);if(V.length!==121||W.length!==76||map.filter(x=>x>=0).some((x,i)=>x!==i))throw Error("source geometry");
const tokens=c.translit.map((t,i)=>[t,i]).sort((a,b)=>b[0].length-a[0].length),mod=x=>(x+n)%n;
const encode=w=>{w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");let o=[];while(w.length){const q=tokens.find(([t])=>w.startsWith(t));if(!q)return [];o.push(q[1]);w=w.slice(q[0].length)}return o};
const enc=s=>(s.match(/[a-z]+/gi)||[]).flatMap(encode),a=enc(d1),b=enc(d2),s=enc(sh),train=[s,a.slice(16000),b.slice(18000)],counts=Array.from({length:5},(_,i)=>new Uint32Array(n**(i+1))),totals=Array.from({length:5},(_,i)=>new Uint32Array(n**i));
for(const stream of train)for(let i=0;i<stream.length;i++){let x=stream[i],k=0,p=1;for(let j=0;j<5&&j<=i;j++){counts[j][k*n+x]++;totals[j][k]++;if(i-j>0){k+=p*stream[i-j-1];p*=n;}}}
const probs=Array.from({length:5},(_,i)=>new Float32Array(n**(i+1)));let sum=totals[0][0];for(let x=0;x<n;x++)probs[0][x]=(counts[0][x]+.5)/(sum+n*.5);
for(let j=1;j<5;j++){let den=n**(j-1);for(let k=0;k<n**j;k++){const t=totals[j][k],prior=probs[j-1],prev=(k%den)*n;for(let x=0;x<n;x++)probs[j][k*n+x]=(counts[j][k*n+x]+8*prior[prev+x])/(t+8)}}
for(const p of probs)for(let i=0;i<p.length;i++)p[i]=Math.log(p[i]);
const weights=new Map(),add=(w,f)=>{const x=encode(w);if(!x.length)return;const k=String.fromCharCode(...x);weights.set(k,(weights.get(k)||0)+f)};
for(const row of dict.split(/\r?\n/)){const z=/^([a-z]+)\s+(\d+)$/.exec(row);if(z)add(z[1],Number(z[2]));}for(const w of sh.match(/[a-z]+/gi)||[])add(w,1);
const nodes=[],node=()=>{nodes.push({children:new Map(),total:0,end:0});return nodes.length-1},root=node(),suffix=node();
function insert(start,w,weight){let k=start;nodes[k].total+=weight;for(let i=0;i<w.length;i++){let x=w.charCodeAt(i),v=nodes[k].children.get(x);if(v===undefined){v=node();nodes[k].children.set(x,v)}k=v;nodes[k].total+=weight;}nodes[k].end+=weight;}
for(const [w,f] of weights){insert(root,w,f);for(let i=0;i<w.length;i++)insert(suffix,w.slice(i),f)}
const tr=nodes.map(v=>{let o=Array.from({length:n},()=>[]);for(const [x,k] of v.children)o[x].push([k,Math.log(nodes[k].total/v.total),false]);if(v.end>0){let p=Math.log(v.end/v.total);for(const [x,k] of nodes[root].children)o[x].push([k,p+Math.log(nodes[k].total/nodes[root].total),true]);}return o;});
function decode(A,B,width=4096){
let beam=[{a:suffix,b:suffix,k:0,l:0,s:0,prev:null}],j=0,clipped=0;
for(let i=0;i<A.length;i++){let pa=probs[Math.min(i,4)],pb=probs[Math.min(j,4)],shared=map[i]>=0,d=shared?mod(A[i]-B[j]):0,next=new Map();
const offer=(q,x,y,u,v,k,l,score)=>{let ka=u[0],kb=v?v[0]:q.b,key=`${ka},${kb},${k},${l}`;let old=next.get(key);if(!old||score>old.s)next.set(key,{a:ka,b:kb,k,l,s:score,prev:q,x,y,sa:u[2],sb:v?v[2]:false});};
for(const q of beam){let ta=tr[q.a],tb=tr[q.b];for(let x=0;x<n;x++){if(!ta[x].length)continue;let k=(q.k*n+x)%m,ngA=pa[q.k*n+x];if(!shared){for(const u of ta[x])offer(q,x,-1,u,null,k,q.l,q.s+.5*(ngA+u[1]));continue;}let y=mod(x-d);if(!tb[y].length)continue;let l=(q.l*n+y)%m,ngB=pb[q.l*n+y];for(const u of ta[x])for(const v of tb[y])offer(q,x,y,u,v,k,l,q.s+.5*(ngA+ngB+u[1]+v[1]));}}
if(next.size>width)clipped++;beam=Array.from(next.values()).sort((a,b)=>b.s-a.s).slice(0,width);if(!beam.length)return {dead:i};if(shared)j++;}
let best=beam[0],x=[],y=[],ra=[],rb=[];for(let q=best;q.prev;q=q.prev){x.push(q.x);ra.push((q.sa?" ":"")+c.translit[q.x]);if(q.y>=0){y.push(q.y);rb.push((q.sb?" ":"")+c.translit[q.y]);}}
x.reverse();y.reverse();const pad=A.map((v,i)=>mod(v-x[i]));if(map.some((j,i)=>j>=0&&mod(y[j]+pad[i])!==B[j]))throw Error("replay");return {x,y,score:best.s,A:ra.reverse().join(""),B:rb.reverse().join(""),clipped,pad};
}
let seed=0x74726565;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%29;}
const controls=[];
for(let i=0;i<4;i++){const x=a.slice(2000+i*1000,2121+i*1000),y=b.slice(4000+i*1500,4076+i*1500),K=x.map(rand),A=x.map((v,j)=>mod(v+K[j])),B=W.map((v,j)=>mod(y[j]+K[V.indexOf(v)])),r=decode(A,B);controls.push({control:i,matchShared:r.y?.filter((v,j)=>v===y[j]).length??0,matchFull32:r.x?.filter((v,j)=>v===x[j]).length??0,score:r.score,A:r.A,B:r.B,clipped:r.clipped});}
const gate=controls.filter(x=>x.matchShared>=54).length>=3;
const original=gate?decode(c.pages[32].indices,c.pages[55].indices):null;
return {mapping:map,words:weights.size,nodes:nodes.length,controls,gatePassed:gate,original};
}
const d=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-grid-256.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt"].map(read);console.log(JSON.stringify(study(JSON.parse(d[0]),JSON.parse(d[1]),...d.slice(2)),null,2));
