"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function research(gp,lp1,lit){
 const mod=(x,q)=>(x%q+q)%q;
 const alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ .'";
 function normalize(s){s=s.toUpperCase().replace(/[’‘]/g,"'").replace(/[^A-Z .']/g," ").replace(/(^|[^A-Z])'|'(?![A-Z])/g,"$1 ").replace(/\s+/g," ").replace(/ +\./g,".").replace(/\.+/g,".").replace(/\.(?=[A-Z])/g,". ").replace(/(^| )\./g,"$1").replace(/\s+/g," ").trim();let out=[];for(const ch of s){const c=alphabet.indexOf(ch),a=out.at(-1);if(c>=0&&(!out.length?c<26:a<26||a===26&&c<26||a===27&&c===26||a===28&&c<26))out.push(c)}return out}
 const sources=[normalize(lp1.split(/\r?\n/).filter(l=>/^[A-Z][A-Z ,;.!?'"’‘:\-]*$/.test(l.trim())).join(" ")),...lit.map(normalize)];
 function minimum(a,n){if(a.length<n)return null;let v=0;for(let i=0;i<n;i++)v+=a[i]===26;let min=v,max=v,arg=0;for(let i=n;i<a.length;i++){v+=(a[i]===26)-(a[i-n]===26);if(v<min){min=v;arg=i-n+1}if(v>max)max=v}return {min,max,arg,windows:a.length-n+1}}
 function bound(C,q){
  const h=new Int32Array(q*29);for(let i=0;i<C.length;i++)h[(i%q)*29+C[i]]++;
  let ordinary=0;for(let r=0;r<q;r++){let v=0;for(let c=0;c<29;c++)v=Math.max(v,h[r*29+c]);ordinary+=v}
  // For each phase r and output rune c independently, maximize its
  // frequency at that consuming phase over every visible-zero hold mask.
  // dp[r*q+s] = best count given total held count s mod q.
  const phaseBest=new Int32Array(q),matrix=[];
  for(let c=0;c<29;c++){
   const dp=new Int32Array(q*q).fill(-1000000);
   for(let r=0;r<q;r++)dp[r*q]=0;
   for(let i=0;i<C.length;i++){
    const x=C[i],p=i%q;
    if(x===0){
     for(let r=0;r<q;r++){
      const base=r*q,t=mod(p-r,q);let prev=dp[base+q-1];
      for(let s=0;s<q;s++){const old=dp[base+s];dp[base+s]=Math.max(old+(c===0&&s===t?1:0),prev);prev=old}
     }
    }else if(x===c){for(let r=0;r<q;r++)dp[r*q+mod(p-r,q)]++}
   }
   const vals=[];for(let r=0;r<q;r++){let best=0;for(let s=0;s<q;s++)best=Math.max(best,dp[r*q+s]);phaseBest[r]=Math.max(phaseBest[r],best);vals.push(best)}matrix.push(vals)
  }
  const latent=phaseBest.reduce((a,b)=>a+b,0);
  if(latent<ordinary)throw Error("hold relaxation below no-hold");
  return {q,ordinary,latent,matrix};
 }
 let seed=0x2cc01529;const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
 let toyChecks=0;
 for(let j=0;j<40;j++){
  let C=Array.from({length:12},()=>rand()%4);
  const zeros=C.flatMap((x,i)=>x===0?[i]:[]);
  for(let q=1;q<=5;q++){
   const got=bound(C,q),best=Array.from({length:29},()=>Array(q).fill(0));let joint=0;
   for(let mask=0;mask<2**zeros.length;mask++){
    let phase=0,z=0,h=Array.from({length:q},()=>Array(29).fill(0));
    for(let i=0;i<C.length;i++){if(C[i]===0&&((mask>>z++)&1))continue;h[phase][C[i]]++;phase=(phase+1)%q}
    joint=Math.max(joint,h.reduce((s,row)=>s+Math.max(...row),0));
    for(let r=0;r<q;r++)for(let c=0;c<29;c++)best[c][r]=Math.max(best[c][r],h[r][c]);
   }
   if(JSON.stringify(best)!==JSON.stringify(got.matrix)||joint>got.latent)throw Error("toy mask mismatch");toyChecks++;
  }
 }
 const plants=[];
 for(const q of [8,13,29])for(const hold of [false,true]){
  const p=sources[3].slice(3000+q*20,4000+q*20),maps=Array.from({length:q},()=>{const a=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){const j=rand()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a});
  let phase=0;const C=p.map(x=>{if(hold&&x===5)return 0;const y=maps[phase][x];phase=(phase+1)%q;return y});
  const spaces=p.filter(x=>x===26).length,b=bound(C,q);
  if((hold?b.latent:b.ordinary)<spaces)throw Error("plant failed");
  plants.push({q,hold,n:p.length,spaces,ordinary:b.ordinary,latent:b.latent,held:p.filter(x=>hold&&x===5).length});
 }
 const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55],[0,55]];
 const original=chapters.map(([a,b])=>{
  const C=gp.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices),mins=sources.map(s=>minimum(s,C.length));let min=Math.min(...mins.filter(Boolean).map(x=>x.min));
  const caps=Array.from({length:32},(_,i)=>{const z=bound(C,i+1);return {q:z.q,ordinary:z.ordinary,latent:z.latent}});
  return {a,b,n:C.length,zeros:C.filter(x=>x===0).length,mins,min,caps,ordinaryRejected:caps.filter(x=>x.ordinary<min).map(x=>x.q),latentRejected:caps.filter(x=>x.latent<min).map(x=>x.q)};
 });
 return {sources:sources.map(s=>({length:s.length,spaces:s.filter(x=>x===26).length})),toyChecks,plants,original};
}
const inputs=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp1-plaintext-reference.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
const [gp,lp1,...lit]=inputs.map(read);
console.log(JSON.stringify(research(JSON.parse(gp),lp1,lit),null,2));
