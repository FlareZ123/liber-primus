'use strict';
const fs=require('node:fs'),path=require('node:path');
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
function experiment(gp,raw){
 const mod=x=>(x%29+29)%29,N=12956,lengths=gp.pages.filter(p=>p.page<56).map(p=>p.indices.length),C=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
 const tok=gp.translit.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);
 function encode(s){let a=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3;continue}if(w.startsWith("IO",i)){a.push(27);i+=2;continue}const t=tok.find(x=>w.startsWith(x[0],i));if(!t)throw Error(w);a.push(t[1]);i+=t[0].length}}return a}
 const docs=raw.map(encode);
 function partitions(lens,b,off){let o=0,blocks=[];for(const l of lens){for(let i=off;i+b<=l;i+=b)blocks.push(Array.from({length:b},(_,j)=>o+i+j));o+=l}return blocks}
 function pairCount(c,blocks){let pairs=0;for(const B of blocks)for(let i=0;i<B.length;i++)for(let j=i+1;j<B.length;j++)pairs+=c[B[i]]===c[B[j]];return pairs}
 function factors(p,blocks,q,hold,reset){const phase=new Int16Array(p.length);let pos=0,j=0;for(const l of lengths){if(reset)j=0;for(let i=0;i<l;i++,pos++){phase[pos]=hold&&p[pos]===0?-1:j%q;if(phase[pos]>=0)j++}}
 let constant=0;const U=Array.from({length:q},()=>new Int32Array(29)),E=Array.from({length:q},()=>Array.from({length:q},()=>new Int32Array(29)));
 for(const B of blocks)for(let i=0;i<B.length;i++)for(let j=i+1;j<B.length;j++){const a=B[i],b=B[j],x=phase[a],y=phase[b];if(x<0&&y<0)constant++;else if(x<0)U[y][mod(-p[b])]++;else if(y<0)U[x][mod(-p[a])]++;else if(x===y)constant+=p[a]===p[b];else if(x<y)E[x][y][mod(p[a]-p[b])]++;else E[y][x][mod(p[b]-p[a])]++}
 const edges=[];let lb=constant;for(let x=0;x<q;x++){lb+=Math.min(...U[x]);for(let y=x+1;y<q;y++)if(E[x][y].some(v=>v)){let m=Math.min(...E[x][y]);lb+=m;edges.push({x,y,h:E[x][y],m})}}
 return{constant,U,E,edges,lb}
 }
 // Disjoint triangles tighten independent-edge lower bounds. Select largest exact
 // gains greedily; every edge is used at most once, so the resulting bound is sound.
 function triangleBound(f,q){const ix=Array.from({length:q},()=>Array(q).fill(-1));f.edges.forEach((e,i)=>ix[e.x][e.y]=i);const tris=[];for(let a=0;a<q;a++)for(let b=a+1;b<q;b++)for(let c=b+1;c<q;c++){const ids=[ix[a][b],ix[b][c],ix[a][c]];if(ids.includes(-1))continue;const [ab,bc,ac]=ids.map(i=>f.edges[i]);let m=Infinity;for(let x=0;x<29;x++)for(let y=0;y<29;y++)m=Math.min(m,ab.h[x]+bc.h[y]+ac.h[(x+y)%29]);const gain=m-ab.m-bc.m-ac.m;if(gain)tris.push({ids,gain})}
 tris.sort((a,b)=>b.gain-a.gain);let v=f.lb;const used=new Set();for(const t of tris)if(t.ids.every(x=>!used.has(x))){v+=t.gain;t.ids.forEach(x=>used.add(x))}return v}
 const rows=[];
 for(const mode of ["continuous","page"])for(let b=3;b<=4;b++)for(let off=0;off<b;off++){const blocks=partitions(mode==="continuous"?[N]:lengths,b,off),target=pairCount(C,blocks);for(const q of [8,13])for(const hold of [false,true])for(const reset of mode==="continuous"?[false]:[false,true]){const ds=docs.map((d,di)=>{const a=[];for(let i=0;i+N<=d.length;i+=N){const f=factors(d.slice(i,i+N),blocks,q,hold,reset),t=triangleBound(f,q);a.push([f.lb,t])}return{di,n:a.length,min:Math.min(...a.map(x=>x[0])),minTri:Math.min(...a.map(x=>x[1])),survive:a.filter(x=>x[0]<=target).length,surviveTri:a.filter(x=>x[1]<=target).length,values:a}});rows.push({mode,b,off,q,hold,reset,target,ds})}}
 return rows;
}
const f=paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(f[0]),f.slice(1)),null,2));
