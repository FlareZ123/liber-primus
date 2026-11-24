"use strict";
/** #2641: exact progressive q8 hidden-F all-key collision gate. */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
function run(gp,raw,sourceBlobShas){
 const assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29;
 const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error(w);out.push(t.i);w=w.slice(t.s.length)}}return out}
 function stats(a,q,d){let R=0,B=0;for(let k=1;k<=3;k++){const lag=k*q,z=mod(k*d);for(let i=lag;i<a.length;i++)if(mod(a[i]-a[i-lag])===z){R++;if(i>lag&&mod(a[i-1]-a[i-lag-1])===z)B++}}return [R,B]}
 function bounds(C,q,d){const D=3*q+1,z=[0,mod(d),mod(2*d),mod(3*d)];let S=new Map([["",[0,0,0,0]]]),peak=1;for(const c of C){const T=new Map(),v=String.fromCharCode(c);function merge(h,a,r,b){const o=T.get(h);if(o){o[0]=Math.min(o[0],a[0]+r);o[1]=Math.max(o[1],a[1]+r);o[2]=Math.min(o[2],a[2]+b);o[3]=Math.max(o[3],a[3]+b)}else T.set(h,[a[0]+r,a[1]+r,a[2]+b,a[3]+b])}for(const [h,a] of S){if(c===0)merge(h,a,0,0);let r=0,b=0;for(let k=1;k<=3;k++){const lag=k*q;if(h.length>=lag&&mod(c-h.charCodeAt(h.length-lag))===z[k]){r++;if(h.length>lag&&mod(h.charCodeAt(h.length-1)-h.charCodeAt(h.length-lag-1))===z[k])b++}}merge((h+v).slice(-D),a,r,b)}S=T;peak=Math.max(peak,S.size)}const a=[Infinity,-Infinity,Infinity,-Infinity];for(const b of S.values()){a[0]=Math.min(a[0],b[0]);a[1]=Math.max(a[1],b[1]);a[2]=Math.min(a[2],b[2]);a[3]=Math.max(a[3],b[3])}return {rune:[a[0],a[1]],bigram:[a[2],a[3]],peak}}
 let seed=0x2641f;const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
 let toyCases=0;for(let t=0;t<32;t++){const c=Array.from({length:16},()=>rng()%5),zs=c.flatMap((v,i)=>v===0?[i]:[]),q=2+rng()%3,d=1+rng()%28,g=[];for(let m=0;m<(1<<zs.length);m++){const skip=new Set(zs.filter((_,i)=>(m>>i)&1));g.push(stats(c.filter((_,i)=>!skip.has(i)),q,d))}const bo=bounds(c,q,d);for(let j=0;j<2;j++){const vals=g.map(x=>x[j]);assert([Math.min(...vals),Math.max(...vals)].join()===(j?bo.bigram:bo.rune).join(),"toy DP")};toyCases++}
 const C=gp.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices),P=raw.map(native),n=C.length,F=C.filter(x=>x===0).length;assert(n===3008&&F===125,"source shape");const q=8;
 const plants=[];
 for(const [j,d,start,origin] of [[0,1,10000,0],[1,17,23000,3],[2,28,4000,7]]){
   const plain=P[j].slice(start,start+n),K=Array.from({length:q},()=>rng()%29);let k=origin;const cipher=plain.map(x=>x===0?0:mod(x+K[k%q]+d*Math.floor(k++/q)));const pa=plain.filter(x=>x!==0),ca=cipher.filter((_,i)=>plain[i]!==0);const actual=stats(pa,q,0),cipherStats=stats(ca,q,d);assert(actual.join()===cipherStats.join(),"progressive active invariant");const bo=bounds(cipher,q,d);assert(actual[0]>=bo.rune[0]&&actual[0]<=bo.rune[1]&&actual[1]>=bo.bigram[0]&&actual[1]<=bo.bigram[1],"plant inside gate");plants.push({source:j,d,start,origin,K,n:plain.length,holds:plain.length-pa.length,cipherFs:cipher.filter(x=>x===0).length,actual,bounds:bo})
 }
 const controls=P.flatMap((p,j)=>Array.from({length:32},(_,i)=>{const start=Math.round(i*(p.length-n)/31),w=p.slice(start,start+n),a=w.filter(x=>x!==0);return {j,i,start,H:n-a.length,stats:stats(a,q,0)}}));
 const min=[Math.min(...controls.map(x=>x.stats[0])),Math.min(...controls.map(x=>x.stats[1]))],minNativeRate=[Math.min(...controls.map(x=>x.stats[0]/(3*(n-x.H)-6*q))),Math.min(...controls.map(x=>x.stats[1]/(3*(n-x.H)-6*q-3)))];
 const results=[];
 for(let d=1;d<=28;d++){const bo=bounds(C,q,d),pass=controls.filter(x=>x.H<=F&&x.stats[0]>=bo.rune[0]&&x.stats[0]<=bo.rune[1]&&x.stats[1]>=bo.bigram[0]&&x.stats[1]<=bo.bigram[1]);const maxRate=[bo.rune[1]/(3*(n-F)-6*q),bo.bigram[1]/(3*(n-F)-6*q-3)];results.push({d,bounds:bo,pass:pass.length,possible:pass,maxRate})}
 return {sourceBlobShas,n,F,q,toyCases,plants,min,minNativeRate,controls,results};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const raw=files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
const blobShas=raw.map(x=>crypto.createHash("sha1").update("blob "+Buffer.byteLength(x)+"\0").update(x).digest("hex"));
console.log(JSON.stringify(run(JSON.parse(raw[0]),raw.slice(1),blobShas),null,2));
