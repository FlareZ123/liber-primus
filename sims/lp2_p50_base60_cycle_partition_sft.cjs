#!/usr/bin/env node
'use strict';
// Source-constrained p50 base-60 functional-graph audit. Run from repo root.
const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const t=read('resources/liber-primus/base60-grid.json'),c=read('resources/liber-primus/lp2-corpus.json'),L=read('resources/external/relikd-solved-gp29-native-v1.json');
const N=256,mod=x=>((x%29)+29)%29,a60=t.alphabet,a59=a60.replace('f',''),tokens=t.rows.flat();
const dec=(a,s)=>[...s].reduce((v,ch)=>{const d=a.indexOf(ch);if(d<0)throw Error('bad digit');return v*a.length+d;},0);
const f=tokens.map(x=>dec(a60,x)),g=tokens.map(x=>dec(a59,x));
function graph(next){const seen=new Set(),cycles=[];for(let s=0;s<N;s++){if(seen.has(s))continue;const p=[],at=new Map();let v=s;while(!seen.has(v)&&!at.has(v)){at.set(v,p.length);p.push(v);v=next[v];}if(at.has(v))cycles.push(p.slice(at.get(v)));p.forEach(x=>seen.add(x));}const id=new Int16Array(N).fill(-1);cycles.forEach((a,k)=>a.forEach(x=>id[x]=k));const basins=Array(cycles.length).fill(0);for(let i=0;i<N;i++){let v=i;while(id[v]<0)v=next[v];basins[id[v]]++;}return{cycles,basins};}
const G=graph(f),H=graph(g),cyc=G.cycles.flat(),cs=new Set(cyc),keep=Array.from({length:N},(_,i)=>i).filter(i=>!cs.has(i));
const p0=c.pages.find(x=>x.page===0).indices.slice(0,13),p8=c.pages.find(x=>x.page===8).indices.slice(12);
if(p0.length!==13||p8.length!==243||keep.length!==243)throw Error('count mismatch');
const ri=new Map(L.runes.map((r,i)=>[r,i])),tr=[],ho=[];
for(const s of L.sections){const q=[...s.source_text].filter(x=>ri.has(x)).map(x=>ri.get(x)),cut=Math.floor(q.length*2/3);tr.push(q.slice(0,cut));ho.push(q.slice(cut));}
const tri=new Float64Array(29**3),alpha=.1;let T=0;
for(const q of tr)for(let i=2;i<q.length;i++){tri[q[i-2]*841+q[i-1]*29+q[i]]++;T++;}
const den=Math.log(T+alpha*29**3),score=q=>{let z=0,n=0;for(let i=2;i<q.length;i++){z+=Math.log(tri[q[i-2]*841+q[i-1]*29+q[i]]+alpha)-den;n++;}return z/n;};
const controls=[];for(const q of ho)for(let i=0;i+p8.length<=q.length;i++)controls.push(score(q.slice(i,i+p8.length)));controls.sort((a,b)=>a-b);
const ch=Array.from({length:N},()=>[]);for(const x of keep)ch[f[x]].push(x);
const roots=keep.filter(x=>cs.has(f[x])),child=(x,d)=>ch[x].slice().sort((a,b)=>d*(a-b));
function walk(kind,d,rm){let rs=roots.slice();if(rm==='addr')rs.sort((a,b)=>a-b);if(rm==='desc')rs.sort((a,b)=>b-a);if(rm==='cycle')rs=G.cycles.flatMap(a=>a.flatMap(x=>child(x,d)));if(rm==='cycle-rev')rs=G.cycles.slice().reverse().flatMap(a=>a.slice().reverse().flatMap(x=>child(x,d)));const out=[];if(kind==='bfs'){const q=rs.slice();for(let i=0;i<q.length;i++){const x=q[i];out.push(x);q.push(...child(x,d));}}else{const v=x=>{if(kind==='pre')out.push(x);child(x,d).forEach(v);if(kind==='post')out.push(x);};rs.forEach(v);}return out;}
const rank=new Map(keep.map((x,i)=>[x,i])),trans=[];
for(const rm of ['addr','desc','cycle','cycle-rev'])for(const d of [1,-1])for(const kind of ['bfs','pre','post']){const o=walk(kind,d,rm),pos=new Map(o.map((x,i)=>[x,i]));trans.push(score(o.map(x=>p8[rank.get(x)])),score(keep.map(x=>p8[pos.get(x)])));}
trans.sort((a,b)=>b-a);
const keys=[cyc,cyc.map(x=>f[x]),cyc.map(x=>f[x]-x)],periodic=[];
for(const raw of keys)for(const rev of [false,true]){const b=(rev?raw.slice().reverse():raw.slice()).map(mod);for(let r=0;r<13;r++){const k=b.slice(r).concat(b.slice(0,r));for(const sign of [1,-1])for(const holdF of [false,true]){let j=0;const out=p8.map(x=>{if(holdF&&x===0)return 0;const y=mod(x-sign*k[j%13]);j++;return y;});periodic.push(score(out));}}}
periodic.sort((a,b)=>b-a);
const c11=G.cycles.find(x=>x.length===11),c2=G.cycles.find(x=>x.length===2),nonInitial=[1,2,3,4,5,6,7,9,10,11,12],off=nonInitial.indexOf(p0.indexOf(0)),zero=c11.find(x=>f[x]===0),start=(c11.indexOf(zero)-off+11)%11,ord11=c11.slice(start).concat(c11.slice(0,start)),ord2=c2.slice().reverse(),C=new Array(N);
ord11.forEach((x,i)=>C[x]=p0[nonInitial[i]]);ord2.forEach((x,i)=>C[x]=p0[[0,8][i]]);keep.forEach((x,i)=>C[x]=p8[i]);
const pathDiff=keep.map(x=>mod(C[x]-C[f[x]])),subtreeInv=keep.map(x=>mod(C[x]-ch[x].reduce((s,y)=>s+C[y],0))),dualDiff=keep.map(x=>mod(C[x]-C[g[x]]));
const ch59=Array.from({length:N},()=>[]);for(let x=0;x<N;x++)if(x!==189)ch59[g[x]].push(x);
const size=x=>1+ch59[x].reduce((s,y)=>s+size(y),0),sz=Array.from({length:N},(_,x)=>size(x));
console.log(JSON.stringify({
 p0:p0.length,p0WordInitialsEqual:p0[0]===p0[8],p8:p8.length,
 base60:{cycles:G.cycles,cycleLengths:G.cycles.map(x=>x.length),cyclic:cyc.length,noncyclic:keep.length,basins:G.basins},
 base59:{cycles:H.cycles,lowercaseFOccurrences:tokens.join('').split('f').length-1,subtree121:sz.flatMap((v,i)=>v===121?[i]:[]),subtree76:sz.flatMap((v,i)=>v===76?[i]:[])},
 language:{controls:controls.length,controlMin:controls[0],controlMedian:controls[Math.floor(controls.length/2)],p8Original:score(p8),bestForestTransposition:trans[0],best13CycleKey:periodic[0],base60PathDifference:score(pathDiff),base60SubtreeInverse:score(subtreeInv),dualRadixPathDifference:score(dualDiff)},
 candidates:{forestTranspositions:trans.length,periodic13Keys:periodic.length}
},null,2));
