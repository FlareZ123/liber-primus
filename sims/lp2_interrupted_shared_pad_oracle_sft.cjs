"use strict";
const fs=require("node:fs"),path=require("node:path");
function run(corpus,native,donorTexts,q=0){
 const L=64,H=4,plantL=80,mod=x=>(x+29)%29;
 const assert=(x,m)=>{if(!x)throw Error(m)};
 let seed=(912411^Math.imul(q+1,0x9e3779b9))>>>0;
 const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0},rand=n=>rng()%n;
 const rm=new Map(corpus.runes.map((x,i)=>[x,i])),ids=s=>[...s].filter(x=>rm.has(x)).map(x=>rm.get(x));
 const enc=a=>String.fromCharCode(...a.map(x=>65+x)),dec=s=>[...s].map(x=>x.charCodeAt(0)-65);
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function latin(s){return (s.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>{w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");let a=[];while(w.length){let t=tokens.find(t=>w.startsWith(t.s));if(!t)throw Error(w);a.push(t.i);w=w.slice(t.s.length)}return a})}
 const solved=native.sections.map(s=>({name:s.name,words:(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(ids)}));
 const pairs=[["0_koan_1","0_welcome"],["0_loss_of_divinity","jpg107-167"],["jpg107-167","0_welcome"],["0_koan_1","0_loss_of_divinity"]],names=pairs[q];
 const by=new Map(),cache=new Map();
 for(const w of [...donorTexts.flatMap(latin),...solved.filter(s=>!names.includes(s.name)).flatMap(s=>s.words)]){let m=by.get(w.length);if(!m)by.set(w.length,m=new Map());let s=enc(w);m.set(s,(m.get(s)||0)+1)}
 const totals=new Map([...by].map(([n,m])=>[n,[...m.values()].reduce((a,b)=>a+b,0)]));
 function frag(n,pat){
   let key=n+"/"+pat;if(cache.has(key))return cache.get(key);
   let map=new Map(),mass=0;
   for(const [s,v] of by.get(n)||[]){let t="",ok=true;for(let i=0;i<pat.length;i++){if(pat[i]==="0"){if(s[i]!=="A"){ok=false;break}}else{if(s[i]==="A"){ok=false;break}t+=s[i]}}if(ok){map.set(t,(map.get(t)||0)+v);mass+=v}}
   const strings=[...map.keys()],f={strings,weights:Float64Array.from(strings,s=>map.get(s)/mass),logmass:mass?Math.log(mass/totals.get(n)):-Infinity};
   cache.set(key,f);return f;
 }
 function tape(words){const offsets=[];let i=0;for(const w of words){offsets.push(i);i+=w.length}return {words,offsets,c:Uint8Array.from(words.flat())}}
 function views(t,wi){
  const out=[];
  function extend(j,k,h,g,indices,held,mass){
    if(k===L){out.push({start:t.offsets[wi],g,indices,held,h,mass});return}
    if(j===t.words.length||t.c.length-t.offsets[j]<L-k)return;
    let n=t.words[j].length,base=t.offsets[j];
    function word(z,cnt,nh,pat,ix,hx){
     if(z===n||k+cnt===L){
      let f=frag(n,pat);if(!f.strings.length)return;
      extend(j+1,k+cnt,h+nh,cnt?[...g,{lo:k,hi:k+cnt,f}]:g,[...indices,...ix],[...held,...hx],mass+f.logmass);return;
     }
     word(z+1,cnt+1,nh,pat+"1",[...ix,base+z],hx);
     if(t.c[base+z]===0&&h+nh<H)word(z+1,cnt,nh+1,pat+"0",ix,[...hx,base+z]);
    }
    word(0,0,0,"",[],[]);
  }
  extend(wi,0,0,[],[],[],0);return out;
 }
 function score(A,B,c1,c2,trace=false){
  const d=Uint8Array.from({length:L},(_,k)=>mod(c1[A.indices[k]]-c2[B.indices[k]]));
  const pa=new Int16Array(L).fill(-1),pb=new Int16Array(L).fill(-1);
  let ll=A.mass+B.mass,logMAP=A.mass+B.mass;
  const state=(g,side)=>({g,side,w:g.f.weights.slice(),...(trace?{best:Float64Array.from(g.f.weights,Math.log),children:[]}:{})});
  function back(s,k){(s.side?pb:pa).set(dec(s.g.f.strings[k]),s.g.lo);for(const c of s.children)back(c.s,c.arg[k])}
  function msg(a,b,lo,hi){
   let m=hi-lo,oa=lo-a.g.lo,ob=lo-b.g.lo,table=new Map(),shift=Uint8Array.from({length:m},(_,k)=>a.side?d[lo+k]:mod(-d[lo+k]));
   for(let i=0;i<a.w.length;i++){if(!a.w[i])continue;let s=a.g.f.strings[i],k="",ok=true;for(let z=0;z<m;z++){let v=(s.charCodeAt(oa+z)-65+shift[z])%29;if(!v){ok=false;break}k+=String.fromCharCode(65+v)}if(!ok)continue;let e=table.get(k);if(!e){e={sum:0,best:-Infinity,arg:-1};table.set(k,e)}e.sum+=a.w[i];if(trace&&a.best[i]>e.best){e.best=a.best[i];e.arg=i}}
   let sum=0,arg=trace?new Int32Array(b.w.length).fill(-1):null;
   for(let i=0;i<b.w.length;i++){let e=table.get(b.g.f.strings[i].slice(ob,ob+m));b.w[i]*=e?.sum||0;sum+=b.w[i];if(trace){b.best[i]+=e?.best??-Infinity;if(e)arg[i]=e.arg}}
   if(!sum)return false;for(let i=0;i<b.w.length;i++)b.w[i]/=sum;ll+=Math.log(sum);if(trace)b.children.push({s:a,arg});return true;
  }
  function complete(b){if(trace){let best=-Infinity,k=-1;for(let i=0;i<b.w.length;i++)if(b.best[i]>best){best=b.best[i];k=i}assert(k>=0,"trace");back(b,k);logMAP+=best}}
  let i=0,j=0,a=state(A.g[0],0),b=state(B.g[0],1);
  while(i<A.g.length&&j<B.g.length){let lo=Math.max(a.g.lo,b.g.lo),hi=Math.min(a.g.hi,b.g.hi);if(a.g.hi<=b.g.hi){if(!msg(a,b,lo,hi))return null;if(a.g.hi===b.g.hi){complete(b);j++;if(j<B.g.length)b=state(B.g[j],1)}i++;if(i<A.g.length)a=state(A.g[i],0)}else{if(!msg(b,a,lo,hi))return null;j++;if(j<B.g.length)b=state(B.g[j],1)}}
  const llr=ll+L*Math.log(29);if(!trace)return {llr};
  let key=Array.from(pa,(v,k)=>mod(c1[A.indices[k]]-v));for(let k=0;k<L;k++)assert(pa[k]>0&&pb[k]>0&&(pa[k]+key[k])%29===c1[A.indices[k]]&&(pb[k]+key[k])%29===c2[B.indices[k]],"replay");for(const v of A.held)assert(c1[v]===0,"hold");for(const v of B.held)assert(c2[v]===0,"hold");
  return {llr,logMAP,key,pa:[...pa],pb:[...pb],indicesA:A.indices,indicesB:B.indices,heldA:A.held,heldB:B.held};
 }
 function pick(t){
  let out=[];
  for(let j=0;j<t.words.length;j++){let i=t.offsets[j],k=0,h=0,ok=true,pos=[];
   for(let z=i;z<t.c.length&&k<plantL;z++){if(t.c[z]){pos.push(z);k++}else if(k<L)h++}
   if(k<plantL||h<1||h>H)continue;
   for(let a=j;a<t.words.length&&t.offsets[a]<=pos.at(-1);a++){let w=t.words[a];if(!by.get(w.length)?.has(enc(w))){ok=false;break}}
   if(ok)out.push({i,j,pos,h});
  }return out;
 }
 function plant(t1,t2,a,b,shared){
  const encrypt=t=>{let k=new Int16Array(t.c.length).fill(-1),c=Uint8Array.from(t.c,(p,i)=>{if(!p)return 0;k[i]=rand(29);return (p+k[i])%29});return {...t,c,k}};
  let A=encrypt(t1),B=encrypt(t2);
  for(let k=0;k<plantL;k++){let i=a.pos[k],j=b.pos[k],v=rand(29);A.k[i]=v;B.k[j]=shared?v:rand(29);A.c[i]=(t1.c[i]+A.k[i])%29;B.c[j]=(t2.c[j]+B.k[j])%29}
  return {A,B};
 }
 let t1=tape(solved.find(s=>s.name===names[0]).words),t2=tape(solved.find(s=>s.name===names[1]).words),a=pick(t1),b=pick(t2);
 if(!a.length||!b.length)return {q,names,eligible:[a.length,b.length]};
 let x=a[rand(a.length)],y=b[rand(b.length)],results=[];
 for(const shared of [true,false]){let {A,B}=plant(t1,t2,x,y,shared),v1=views(A,x.j),v2=views(B,y.j),best=null,feasible=0;
  for(const u of v1)for(const v of v2){if(!u.h&&!v.h)continue;let s=score(u,v,A.c,B.c);if(s){feasible++;if(!best||s.llr>best.llr)best={u,v,llr:s.llr}}}
  let r=best?score(best.u,best.v,A.c,B.c,true):null,alignment=0,key=0;
  if(r){let map=new Map(x.pos.map((v,i)=>[v,i]));for(let k=0;k<L;k++){let z=map.get(r.indicesA[k]);if(z!==undefined&&r.indicesB[k]===y.pos[z]){alignment++;if(r.key[k]===A.k[r.indicesA[k]]&&r.key[k]===B.k[r.indicesB[k]])key++}}}
  results.push({shared,views:[v1.length,v2.length],feasible,best:r?{llr:r.llr,alignment,key,holds:[r.heldA.length,r.heldB.length],indicesA:r.indicesA,indicesB:r.indicesB}:null});
 }
 return {q,names,eligible:[a.length,b.length],starts:[x.i,y.i],holds:[x.h,y.h],results};
}
module.exports={run};
if(require.main===module){const root=path.resolve(__dirname,".."),paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];const [cj,nj,...donors]=paths.map(p=>fs.readFileSync(path.join(root,p),"utf8"));console.log(JSON.stringify(run(JSON.parse(cj),JSON.parse(nj),donors,+(process.argv[2]||0)),null,2))}
