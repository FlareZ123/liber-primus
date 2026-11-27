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
 const pages=raw.split("%").slice(0,55).map(rune), original=pages.flat();
 if(original.length!==12956)throw Error("wrong original length");
 const blocks=(a,phase)=>{let b=[];for(let i=phase;i+1<a.length;i+=2)b.push(29*a[i]+a[i+1]);return b;};
 const ranks=arr=>{let m=new Map();for(const v of arr)m.set(v,(m.get(v)||0)+1);return [...m.values()].sort((a,b)=>b-a);};
 const profile=b=>{let edges=[],inside=0,seam=0;for(let i=0;i<b.length;i++){if(Math.floor(b[i]/29)===b[i]%29)inside++;if(i){edges.push(841*b[i-1]+b[i]);if(b[i-1]%29===Math.floor(b[i]/29))seam++;}}return {v:ranks(b),e:ranks(edges),inside,seam,n:b.length};};
 const pref=a=>{let s=[0];for(const x of a)s.push(s.at(-1)+x);return s;};
 const delta=(a,b,q)=>{const A=pref(a),B=pref(b);let d=0;for(let k=1;k<A.length;k++)d=Math.max(d,A[k]-B[Math.min(q*k,B.length-1)]);for(let k=1;k<B.length;k++)d=Math.max(d,B[k]-A[Math.min(q*k,A.length-1)]);return d;};
 const bound=(a,b)=>{let lo=1,hi=841;while(lo<hi){let q=(lo+hi)>>1;if(delta(a.v,b.v,q)||delta(a.e,b.e,q*q))lo=q+1;else hi=q;}const dv=delta(a.v,b.v,1),de=delta(a.e,b.e,1);return {q:lo,dv,de,exception:Math.max(dv,Math.ceil(de/2),Math.abs(a.inside-b.inside),Math.ceil(Math.abs(a.seam-b.seam)/2)),switchAtMin:delta(a.e,b.e,lo),switch8:delta(a.e,b.e,8),switch13:delta(a.e,b.e,13),switch29:delta(a.e,b.e,29),nativeInside:b.inside,nativeSeam:b.seam};};
 // Adjacent-rune equality itself is not invariant under arbitrary F; do NOT
 // use the final two raw equality terms in the dominant-map exception bound.
 const exactBound=(a,b)=>{const x=bound(a,b);x.exception=Math.max(x.dv,Math.ceil(x.de/2));return x;};
 const tapes=donors.map(([name,s])=>[name,native(s)]);
 const result={scopes:[],plants:[]};
 for(const [label,ct] of [["full",original],["terminal",pages.slice(-2).flat()]]){
  for(const phase of [0,1]){
   const A=profile(blocks(ct,phase));const controls=[];
   for(const [name,t] of tapes){let rows=[];for(let at=0;at+ct.length<=t.length;at+=ct.length){let x=exactBound(A,profile(blocks(t.slice(at,at+ct.length),phase)));rows.push({at,...x});}if(rows.length){let summary={name,windows:rows.length};for(let key of ["q","dv","de","exception","switchAtMin","switch8","switch13","switch29","nativeInside","nativeSeam"]){summary[key]=[Math.min(...rows.map(x=>x[key])),Math.max(...rows.map(x=>x[key]))];}summary.minQWitness=rows.reduce((a,b)=>b.q<a.q?b:a);controls.push(summary);}}
   result.scopes.push({label,phase,n:A.n,distinct:[A.v.length,A.e.length],max:[A.v[0],A.e[0]],inside:A.inside,seam:A.seam,controls});
  }
 }
 // Native LP1 plaintext is a separate positive-control donor, not a source
 // selector. Strip editor comments and page headings beginning with #.
 const plain=blocks(native(lp1.split("\n").filter(l=>!l.startsWith("#")).join("\n")),0);
 let seed=0x7ae3201;const rnd=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
 for(let q of [1,2,4,8,13,29]){
  let maps=[];for(let j=0;j<q;j++){let p=Array.from({length:841},(_,i)=>i);for(let i=840;i>0;i--){let k=rnd(i+1);[p[i],p[k]]=[p[k],p[i]];}maps.push(p);}
  let states=plain.map(()=>rnd(q)),sw=states.filter((v,i)=>i&&states[i-1]!==v).length;
  let encrypted=plain.map((v,i)=>maps[states[i]][v]);
  let x=exactBound(profile(encrypted),profile(plain));
  if(x.q>q||delta(profile(encrypted).e,profile(plain).e,q)>sw)throw Error("false rejection");
  let actualExceptions=states.filter(x=>x!==0).length;
  if(x.exception>actualExceptions)throw Error("exception bound false rejection");
  result.plants.push({q,blocks:plain.length,actualSwitches:sw,actualExceptions,qFloor:x.q,exceptionFloor:x.exception,switchFloor:delta(profile(encrypted).e,profile(plain).e,q)});
 }
 return result;
}
console.log(JSON.stringify(main(read(paths[0]),read(paths[1]),paths.slice(2).map(p=>[p,read(p)])),null,2));
