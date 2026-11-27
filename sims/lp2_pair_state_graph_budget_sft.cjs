"use strict";
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-transcription.txt","resources/liber-primus/lp1-plaintext-reference.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
const read=p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8");
function main(raw,lp1,donors){
 const glyphs=[..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
 const names=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
 const tokens=names.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
 const rune=s=>[...s].map(c=>glyphs.indexOf(c)).filter(x=>x>=0);
 const native=s=>(s.toUpperCase().match(/[A-Z]+/g)||[]).flatMap(w=>{w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let a=[];while(w.length){let t=tokens.find(t=>w.startsWith(t[0]));if(!t)throw Error(w);a.push(t[1]);w=w.slice(t[0].length);}return a;});
 const pages=raw.split("%").slice(0,55).map(rune), original=pages.flat(),terminal=pages.slice(-2).flat();
 if(original.length!==12956||terminal.length!==308)throw Error("wrong original length");
 const blocks=(a,phase)=>{let b=[];for(let i=phase;i+1<a.length;i+=2)b.push(29*a[i]+a[i+1]);return b;};
 const ranks=arr=>{let m=new Map();for(const v of arr)m.set(v,(m.get(v)||0)+1);return [...m.values()].sort((a,b)=>b-a);};
 const profile=b=>{let edges=[],inside=0,seam=0;for(let i=0;i<b.length;i++){if(Math.floor(b[i]/29)===b[i]%29)inside++;if(i){edges.push(841*b[i-1]+b[i]);if(b[i-1]%29===Math.floor(b[i]/29))seam++;}}return {v:ranks(b),e:ranks(edges),inside,seam,n:b.length};};
 const pref=a=>{let s=[0];for(const x of a)s.push(s.at(-1)+x);return s;};
 const delta=(a,b,q)=>{const A=pref(a),B=pref(b);let d=0;for(let k=1;k<A.length;k++)d=Math.max(d,A[k]-B[Math.min(q*k,B.length-1)]);for(let k=1;k<B.length;k++)d=Math.max(d,B[k]-A[Math.min(q*k,A.length-1)]);return d;};
 function bound(a,b){let lo=1,hi=841;while(lo<hi){let q=(lo+hi)>>1;if(delta(a.v,b.v,q)||delta(a.e,b.e,q*q))lo=q+1;else hi=q;}const dv=delta(a.v,b.v,1),de=delta(a.e,b.e,1);return {q:lo,dv,de,exception:Math.max(dv,Math.ceil(de/2)),switchAtMin:delta(a.e,b.e,lo),switch8:delta(a.e,b.e,8),switch13:delta(a.e,b.e,13),switch29:delta(a.e,b.e,29),nativeInside:b.inside,nativeSeam:b.seam};}
 // Each interval is a partial one-to-one correspondence. Greedy maximum
 // prefix gives the exact minimal run count for independently private maps.
 function greedy(a,b){if(a.length!==b.length)throw Error("unaligned");let f=new Int16Array(841).fill(-1),g=new Int16Array(841).fill(-1),cuts=[];for(let i=0;i<a.length;i++){let x=a[i],y=b[i];if((f[x]!==-1&&f[x]!==y)||(g[y]!==-1&&g[y]!==x)){cuts.push(i);f.fill(-1);g.fill(-1);}f[x]=y;g[y]=x;}return cuts;}
 function dp(a,b){let n=a.length,d=Array(n+1).fill(n+1);d[0]=0;for(let i=0;i<n;i++){let f=new Map(),g=new Map();for(let j=i;j<n;j++){let x=a[j],y=b[j];if((f.has(x)&&f.get(x)!==y)||(g.has(y)&&g.get(y)!==x))break;f.set(x,y);g.set(y,x);d[j+1]=Math.min(d[j+1],d[i]+1);}}return d[n]-1;}
 const tapes=donors.map(([name,s])=>[name,native(s)]);
 const result={scopes:[],plants:[],greedyDPChecks:0};
 for(const [label,ct] of [["full",original],["terminal",terminal]]){
  for(const phase of [0,1]){
   const cb=blocks(ct,phase),A=profile(cb);const controls=[];
   for(const [name,t] of tapes){let rows=[];for(let at=0;at+ct.length<=t.length;at+=ct.length){let pb=blocks(t.slice(at,at+ct.length),phase),x=bound(A,profile(pb));const cuts=greedy(cb,pb);rows.push({at,...x,minAlignedSwitches:cuts.length,maxGreedyRun:Math.max(...cuts.concat(cb.length).map((v,i)=>v-(i?cuts[i-1]:0)))});}if(rows.length){let summary={name,windows:rows.length};for(let key of ["q","dv","de","exception","switchAtMin","switch8","switch13","switch29","nativeInside","nativeSeam","minAlignedSwitches","maxGreedyRun"]){summary[key]=[Math.min(...rows.map(x=>x[key])),Math.max(...rows.map(x=>x[key]))];}summary.minQWitness=rows.reduce((a,b)=>b.q<a.q?b:a);summary.minAlignedSwitchWitness=rows.reduce((a,b)=>b.minAlignedSwitches<a.minAlignedSwitches?b:a);const q8=rows.filter(x=>x.q<=8);summary.q8NotExcludedByStateCount=q8.length;summary.q8ConditionalSwitchMin=q8.length?Math.min(...q8.map(x=>x.switch8)):null;if(label==="full")summary.rows=rows;controls.push(summary);}}
   result.scopes.push({label,phase,n:A.n,distinct:[A.v.length,A.e.length],max:[A.v[0],A.e[0]],inside:A.inside,seam:A.seam,controls});
  }
 }
 const plain=blocks(native(lp1.split("\n").filter(l=>!l.startsWith("#")).join("\n")),0);
 let seed=0x7ae3201;const rnd=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;seed>>>=0;return seed%n;};
 for(let i=0;i<1000;i++){let n=1+rnd(25),a=Array.from({length:n},()=>rnd(5)),b=Array.from({length:n},()=>rnd(5));if(greedy(a,b).length!==dp(a,b))throw Error("greedy mismatch");result.greedyDPChecks++;}
 for(let q of [1,2,4,8,13,29]){
  let maps=[],inverses=[];for(let j=0;j<q;j++){let p=Array.from({length:841},(_,i)=>i);for(let i=840;i>0;i--){let k=rnd(i+1);[p[i],p[k]]=[p[k],p[i]];}maps.push(p);let inv=[];p.forEach((v,i)=>inv[v]=i);inverses.push(inv);}
  for(const mode of ["random","run37"]){
   let states=plain.map((_,i)=>mode==="random"?rnd(q):Math.floor(i/37)%q),sw=states.filter((v,i)=>i&&states[i-1]!==v).length;
   let encrypted=plain.map((v,i)=>maps[states[i]][v]);
   let x=bound(profile(encrypted),profile(plain)),actualExceptions=states.filter(x=>x!==0).length,greedySwitches=greedy(encrypted,plain).length;
   if(x.q>q||delta(profile(encrypted).e,profile(plain).e,q)>sw||x.exception>actualExceptions||greedySwitches>sw||encrypted.some((v,i)=>inverses[states[i]][v]!==plain[i]))throw Error("false rejection");
   result.plants.push({q,mode,blocks:plain.length,actualSwitches:sw,actualExceptions,qFloor:x.q,exceptionFloor:x.exception,switchFloor:delta(profile(encrypted).e,profile(plain).e,q),greedySwitches,oracleInverseCorrect:plain.length});
  }
 }
 return result;
}
console.log(JSON.stringify(main(read(paths[0]),read(paths[1]),paths.slice(2).map(p=>[p,read(p)])),null,2));
