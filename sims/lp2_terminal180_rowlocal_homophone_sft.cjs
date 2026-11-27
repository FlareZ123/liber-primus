'use strict';
const fs=require('node:fs');
const path=require('node:path');
function counts(a,k){const c=Array(k).fill(0);for(const x of a)c[x]++;return c;}

function solve(S,T,limit=3000,fixed=false){
 const N=30,ALL=(1<<30)-1, idx=b=>31-Math.clz32(b&-b), pop=b=>{let n=0;while(b){b&=b-1;n++}return n;};
 const sc=S.map(a=>counts(a,256)),tc=T.map(a=>counts(a,29));const sm=sc.map(a=>a.filter(x=>x).sort((a,b)=>b-a));const tm=tc.map(a=>a.filter(x=>x).sort((a,b)=>b-a));
 const xs=Array.from({length:256},(_,x)=>({x,rows:sc.map((c,r)=>[r,c[x]]).filter(a=>a[1])})).filter(a=>a.rows.reduce((s,r)=>s+r[1],0)>1);
 const adj=Array.from({length:N},()=>new Map());const inter=(a,b)=>a.reduce((s,x,i)=>s+Math.min(x,b[i]),0);
 for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){const k=inter(sc[i],sc[j]);if(!k)continue;const m=tc.map((a,u)=>tc.reduce((mask,b,v)=>u!==v&&inter(a,b)>=k?mask|(1<<v):mask,0));adj[i].set(j,m);adj[j].set(i,m);}
 const labelRows=Array.from({length:7},(_,n)=>Array.from({length:29},(_,y)=>tc.reduce((m,a,r)=>a[y]>=n?m|(1<<r):m,0)));
 const d0=sm.map((a,i)=>fixed?1<<i:tm.reduce((m,b,r)=>a[0]<=b[0]&&a.length>=b.length?m|(1<<r):m,0));
 let nodes=0,capped=false,witness=null;
 function propagate(d,xd){let changed=true;while(changed){changed=false;let used=0;for(const a of d){if(!a)return false;if(!(a&(a-1))){if(used&a)return false;used|=a;}}
 for(let i=0;i<N;i++){if(d[i]&(d[i]-1)){const v=d[i]&~used;if(!v)return false;if(v!==d[i]){d[i]=v;changed=true;}}for(const [j,m] of adj[i]){let k=0;for(let b=d[i];b;b&=b-1){let q=idx(b);if(m[q]&d[j])k|=1<<q;}if(!k)return false;if(k!==d[i]){d[i]=k;changed=true;}}}
 for(let i=0;i<xs.length;i++){let a=xs[i],m=0;for(let b=xd[i];b;b&=b-1){let y=idx(b);if(a.rows.every(([r,n])=>d[r]&labelRows[n][y]))m|=1<<y;}if(!m)return false;if(m!==xd[i]){xd[i]=m;changed=true;}for(const [r,n] of a.rows){let k=0;for(let b=m;b;b&=b-1)k|=labelRows[n][idx(b)];k&=d[r];if(!k)return false;if(k!==d[r]){d[r]=k;changed=true;}}}
 for(let r=0;r<N;r++){const need=Array(29).fill(0);for(let i=0;i<xs.length;i++)if(!(xd[i]&(xd[i]-1)))need[idx(xd[i])]+=sc[r][xs[i].x];let k=0;for(let b=d[r];b;b&=b-1){const t=idx(b);if(need.every((n,y)=>n<=tc[t][y]))k|=1<<t;}if(!k)return false;if(k!==d[r]){d[r]=k;changed=true;}}
 }return true;}
 function dfs(d,xd){if(++nodes>limit){capped=true;return false;}if(!propagate(d,xd))return false;let q=-1,bn=31,which=0;for(let i=0;i<N;i++){let n=pop(d[i]);if(n>1&&n<bn){q=i;bn=n;which=0;}}for(let i=0;i<xd.length;i++){let n=pop(xd[i]);if(n>1&&n<bn){q=i;bn=n;which=1;}}if(q<0){const R=d.map(idx);const map={};for(let i=0;i<xs.length;i++)map[xs[i].x]=idx(xd[i]);for(let r=0;r<N;r++){let cap=tc[R[r]].slice();for(const x of S[r])if(x in map)cap[map[x]]--;for(const x of S[r])if(!(x in map)){const y=cap.findIndex(n=>n>0);if(y<0)throw Error("bad");map[x]=y;cap[y]--;}if(cap.some(n=>n))throw Error("bad cap");}witness={R,map};return true;}const src=which?xd:d;for(let b=src[q];b;b&=b-1){let a=d.slice(),x=xd.slice();(which?x:a)[q]=b&-b;if(dfs(a,x))return true;if(capped)return false;}return false;}
 const rootD=d0.slice(),rootX=xs.map(()=>((1<<29)-1));const rootOK=propagate(rootD,rootX);if(rootOK)dfs(rootD,rootX);
 if(witness)check(S,T,witness);
 return {status:witness?"SAT":capped?"CAP":"UNSAT",nodes,rootOK,witness};
}

function check(S,T,w){if(new Set(w.R).size!==30)throw Error("row bijection");for(let r=0;r<30;r++){const a=counts(S[r].map(x=>w.map[x]),29),b=counts(T[w.R[r]],29);if(a.join()!==b.join())throw Error("wrong row "+r);}}

function ambiguity(S,T,w,rim){
 const n=counts(S.flat(),256),seen=new Set(S.flat());let ways=1n;const fact=k=>{let r=1n;for(let i=2;i<=k;i++)r*=BigInt(i);return r;};
 let swap=null;
 for(let r=0;r<30;r++){const singles=S[r].filter(x=>n[x]===1),f=counts(singles.map(x=>w.map[x]),29);let k=fact(singles.length);for(const j of f)k/=fact(j);ways*=k;
 for(const x of singles)for(const y of singles)if(x!==y&&w.map[x]!==w.map[y]&&(rim.includes(x)||rim.includes(y))&&!swap){const map={...w.map,[x]:w.map[y],[y]:w.map[x]};check(S,T,{R:w.R,map});swap={row:r,tokens:[x,y],values:[w.map[x],w.map[y]],changedRim:rim.map((z,i)=>w.map[z]!==map[z]?i:-1).filter(i=>i>=0)};}}
 const missing=[...new Set(rim.filter(x=>!seen.has(x)))];return {knownRimPositions:rim.filter(x=>seen.has(x)).length,unseenRimTokens:missing.length,innerCodebooksLowerBound:ways.toString(),unseenRimCompletions:(29n**BigInt(missing.length)).toString(),swap};
}

function experiment(grid,corpus){
 const S=Array.from({length:30},(_,r)=>grid.bytes.slice((r+1)*8+1,(r+1)*8+7)),rim=grid.bytes.filter((_,i)=>i<8||i>=248||i%8===0||i%8===7);
 const primes=[];for(let n=2;primes.length<85;n++)if(primes.every(p=>n%p))primes.push(n);let j=0;const p56=corpus.pages[56].indices.map((x,i)=>i===56?x:(x-primes[j++]+1+29000)%29);
 const known=p56.map(x=>corpus.translit[x]).join("");if(j!==84||known!=="ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE")throw Error("native control");
 const P=[...p56,...corpus.pages[57].indices],C=[...corpus.pages[56].indices,...corpus.pages[57].indices];if(P.length!==180||rim.length!==76||new Set(S.flat()).size!==127)throw Error("shape");
 const out=[];
 for(const [name,Y] of [["plain",P],["printed",C],["pad",C.map((x,i)=>(x-P[i]+29)%29)]])for(const layout of ["row","col"]){let T=Array.from({length:30},(_,r)=>Array.from({length:6},(_,k)=>Y[layout==="row"?r*6+k:k*30+r]));for(const reverse of [false,true]){const U=reverse?T.slice().reverse():T;const a=solve(S,U,3000,true);out.push({name,layout,reverse,mode:"fixed",...a});}const a=solve(S,T);out.push({name,layout,mode:"free",...a,ambiguity:a.witness?ambiguity(S,T,a.witness,rim):null});}
 let seed=0x3819da52;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){let j=rng()%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
 const controls=[];for(let k=0;k<3;k++){const F=Array.from({length:256},()=>rng()%29);const T=S.map(row=>shuffle(row.map(x=>F[x])));const w={R:S.map((_,i)=>i),map:Object.fromEntries(S.flat().map(x=>[x,F[x]]))};check(S,T,w);const a=solve(S,T,3000,true);if(a.status!=="SAT")throw Error("fixed control "+a.status);const Q=shuffle(T.map((_,i)=>i)),U=Q.map(i=>T[i]);const truth={R:Q.map((_,i)=>Q.indexOf(i)),map:w.map};check(S,U,truth);const b=solve(S,U,3000,false);controls.push({fixedStatus:a.status,fixedNodes:a.nodes,freeStatus:b.status,freeNodes:b.nodes,truthReplays:true});}
 return {source:"2550eae357442912220e05dc51147523a61dd75a / 054f2a0f780b7d46901acbe3d9bf4f0ac1801165",p56:known,out,controls};
}

if(require.main===module){const root=path.resolve(__dirname,'..');const grid=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-grid-256.json'),'utf8'));const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));console.log(JSON.stringify(experiment(grid,corpus),null,2));}
module.exports={experiment};
