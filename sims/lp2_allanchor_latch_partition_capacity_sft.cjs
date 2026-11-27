// Agent 7 — exact all-anchor latch capacity using two fixed alphabet halves.
"use strict";
/** @param {object} corpus @param {string} txt */
function run(corpus,txt){
 const A=29,mod=x=>(x%29+29)%29,R=n=>Array.from({length:n},(_,i)=>i),assert=(x,m)=>{if(!x)throw Error(m)};
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const gp=txt.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g).flatMap(w=>{let a=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{let t=tokens.find(t=>w.startsWith(t.s,i));assert(t,w);a.push(t.i);i+=t.s.length}}return a});
 const C=Uint8Array.from(corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices)),N=C.length;
 const pc=x=>{x=x-((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return (((x+(x>>>4))&0x0f0f0f0f)*0x01010101)>>>24};
 function direct(c,a){const map=new Int8Array(A);map.fill(-1);a.forEach((s,i)=>map[s]=i);let rows=R(a.length).map(()=>new Uint16Array(A)),s=-1,free=0;for(let i=1;i<c.length;i++){if(map[c[i-1]]>=0)s=map[c[i-1]];if(s<0)free++;else rows[s][mod(c[i]-c[i-1])]++}let caps=R(5).map(k=>rows.reduce((v,r)=>v+Array.from(r).sort((a,b)=>b-a).slice(0,k+1).reduce((x,y)=>x+y,0),free));return {caps,free}}
 function build(c){
  let n=c.length,D=new Uint8Array(n),nh=new Uint16Array(A),first=new Int32Array(A);first.fill(n-1);for(let i=1;i<n;i++){D[i]=mod(c[i]-c[i-1]);nh[D[i]]++;if(first[c[i-1]]===n-1)first[c[i-1]]=i-1}
  let width=Math.ceil(Math.max(...nh)/32),B=width*A;
  let eligible=R(A).map(s=>R(A).map(t=>new Uint32Array(B))),last=new Int32Array(A);last.fill(-1);let at=new Uint16Array(A);
  for(let i=1;i<n;i++){let d=D[i],j=at[d]++,w=d*width+(j>>>5),bit=1<<(j&31);last[c[i-1]]=i-1;for(let s=0;s<A;s++)if(last[s]>=0){eligible[s][s][w]|=bit;for(let t=0;t<A;t++)if(last[t]<last[s])eligible[s][t][w]|=bit}}
  return {width,B,eligible,first}
 }
 function half(c,G,built){let {width,B,eligible,first}=built,L=G.length,sz=1<<L,total=new Uint16Array(sz*5),free=new Uint16Array(sz);free[0]=c.length-1;
 for(let m=1;m<sz;m++){let j=31-Math.clz32(m&-m);free[m]=Math.min(first[G[j]],free[m&(m-1)])}
 for(let k=0;k<L;k++){let s=G[k],buffers=R(L).map(()=>new Uint32Array(B)),top=new Uint16Array(5);buffers[0].set(eligible[s][s]);
  function dfs(start,depth,mask){let buf=buffers[depth];top.fill(0);for(let d=0;d<A;d++){let f=0;for(let j=d*width;j<(d+1)*width;j++)f+=pc(buf[j]);if(f>top[4]){let k=4;while(k>0&&f>top[k-1]){top[k]=top[k-1];k--}top[k]=f}}let v=0;for(let j=0;j<5;j++){v+=top[j];total[mask*5+j]+=v}for(let t=start;t<L;t++)if(t!==k){let next=buffers[depth+1],m=eligible[s][G[t]];for(let j=0;j<B;j++)next[j]=buf[j]&m[j];dfs(t+1,depth+1,mask|(1<<t))}}
  dfs(0,0,1<<k)
 }
 let max=R(5).map(()=>0),witness=R(5).map(()=>0),maxNoFree=R(5).map(()=>0),byQ=R(L+1).map(()=>R(5).map(()=>0)),byQWitness=R(L+1).map(()=>R(5).map(()=>0));
 for(let m=1;m<sz;m++){let q=pc(m);for(let k=0;k<5;k++){let cap=total[m*5+k]+free[m];if(cap>max[k]){max[k]=cap;witness[k]=m}maxNoFree[k]=Math.max(maxNoFree[k],total[m*5+k]);if(cap>byQ[q][k]){byQ[q][k]=cap;byQWitness[q][k]=m}}}
 const decode=m=>G.filter((s,i)=>m&(1<<i));for(let k=0;k<5;k++)assert(direct(c,decode(witness[k])).caps[k]===max[k],"direct check");
 return {G,subsets:sz-1,max,witness:witness.map(decode),maxNoFree,byQ,byQWitness:byQWitness.map(x=>x.map(decode)),free,total}
 }
 function combine(c){let b=build(c),G=[R(14),R(15).map(i=>i+14)],h=G.map(x=>half(c,x,b)),out=R(5).map(k=>h[0].max[k]+h[1].max[k]);let qcaps=R(30).map(q=>R(5).map(k=>{let mx=0;for(let a=0;a<=14;a++){let b=q-a;if(b<0||b>15)continue;mx=Math.max(mx,h[0].byQ[a][k]+h[1].byQ[b][k])}return mx}));
 return {halves:h.map(({free,total,...rest})=>rest),out,qcaps}}
 let f=new Uint32Array(A),mins=R(5).map(()=>Infinity);for(let i=0;i<gp.length;i++){f[gp[i]]++;if(i>=N-1)f[gp[i-N+1]]--;if(i>=N-2){let a=Array.from(f).sort((a,b)=>b-a),s=0;for(let k=0;k<5;k++){s+=a[k];mins[k]=Math.min(mins[k],s)}}}
 const orig=combine(C);
 let seed=0x7349812;const rand=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n};const anchors=[3,9,18,25],r=R(4).map(()=>{let a=R(A);for(let i=A-1;i>0;i--){let j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}),p=gp.slice(18000,18000+N),cc=new Uint8Array(N);let s=0,prev=0;for(let i=0;i<N;i++){let d=r[s][p[i]];cc[i]=mod(prev+d);prev=cc[i];let j=anchors.indexOf(prev);if(j>=0)s=j}
 const ph=new Uint16Array(A);for(let i=1;i<p.length;i++)ph[p[i]]++;let cum=0,top=Array.from(ph).sort((a,b)=>b-a).slice(0,5).map(x=>cum+=x);const whole=direct(cc,anchors),left=direct(cc,anchors.filter(x=>x<14)),right=direct(cc,anchors.filter(x=>x>=14));assert(whole.caps.every((x,k)=>x>=top[k]&&x<=left.caps[k]+right.caps[k]),"plant and subset");
 return {N,mins,original:orig,plant:{anchors,top,whole,left,right}}
}
module.exports={run};
if(require.main===module){const fs=require("node:fs"),read=p=>fs.readFileSync(p,"utf8");console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/control/gibran_prophet_58585.txt")),null,2))}
