"use strict";
/** #2606: exact q2..32 hidden-F collision bounds (q8/q13 covered by #2521). */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
function run(gp,raw,sourceBlobShas){
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error(w);out.push(t.i);w=w.slice(t.s.length)}}return out}
 function stats(a,q){let r=0,b=0;for(let d=q;d<=3*q;d+=q)for(let i=d;i<a.length;i++)if(a[i]===a[i-d]){r++;if(i>d&&a[i-1]===a[i-d-1])b++}return [r,b]}
 function bounds(C,q){const D=3*q+1;let S=new Map([["",[0,0,0,0]]]),peak=1;for(const c of C){const T=new Map(),z=String.fromCharCode(c);function merge(h,a,r,b){let o=T.get(h);if(o){o[0]=Math.min(o[0],a[0]+r);o[1]=Math.max(o[1],a[1]+r);o[2]=Math.min(o[2],a[2]+b);o[3]=Math.max(o[3],a[3]+b)}else T.set(h,[a[0]+r,a[1]+r,a[2]+b,a[3]+b])}for(const [h,a] of S){if(c===0)merge(h,a,0,0);let r=0,b=0;for(let d=q;d<=3*q;d+=q)if(h.length>=d&&h.charCodeAt(h.length-d)===c){r++;if(h.length>d&&h.charCodeAt(h.length-1)===h.charCodeAt(h.length-d-1))b++}merge((h+z).slice(-D),a,r,b)}S=T;peak=Math.max(peak,S.size)}let a=[Infinity,-Infinity,Infinity,-Infinity];for(const b of S.values()){a[0]=Math.min(a[0],b[0]);a[1]=Math.max(a[1],b[1]);a[2]=Math.min(a[2],b[2]);a[3]=Math.max(a[3],b[3])}return {rune:[a[0],a[1]],bigram:[a[2],a[3]],peak}}
 let seed=0x2606f;const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
 const C=gp.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices),P=raw.map(native),n=C.length,F=C.filter(x=>x===0).length;assert(n===3008&&F===125,"source shape");
 let toyCases=0;for(let t=0;t<24;t++){const c=Array.from({length:14},()=>rng()%4),zs=c.flatMap((v,i)=>v===0?[i]:[]),q=2+rng()%3,g=[];for(let m=0;m<(1<<zs.length);m++){const skip=new Set(zs.filter((_,i)=>(m>>i)&1));g.push(stats(c.filter((_,i)=>!skip.has(i)),q))}const bo=bounds(c,q);for(let j=0;j<2;j++){const vals=g.map(x=>x[j]);assert([Math.min(...vals),Math.max(...vals)].join()===(j?bo.bigram:bo.rune).join(),"toy DP")};toyCases++}
 const plants=[];
 for(const [j,q,p,nPlant] of [[0,2,2,3008],[1,17,17,3008],[2,32,16,1200],[0,30,15,1200]]){
   const start=Math.floor(P[j].length*(q+7)/49),plain=P[j].slice(start,start+nPlant),K=Array.from({length:p},()=>rng()%29);let k=0;const cipher=plain.map(x=>x===0?0:(x+K[k++%p])%29);const pa=plain.filter(x=>x!==0),ca=cipher.filter((_,i)=>plain[i]!==0);const actual=stats(pa,q),cipherStats=stats(ca,q);assert(actual.join()===cipherStats.join(),"active phase invariant");const bo=bounds(cipher,q);assert(actual[0]>=bo.rune[0]&&actual[0]<=bo.rune[1]&&actual[1]>=bo.bigram[0]&&actual[1]<=bo.bigram[1],"unknown-key plant inside gate");plants.push({source:j,q,primitive:p,n:plain.length,start,key:K,holds:plain.length-pa.length,cipherFs:cipher.filter(x=>x===0).length,actual,bounds:bo})
 }
 const controls=P.flatMap((p,j)=>Array.from({length:32},(_,i)=>{const start=Math.round(i*(p.length-n)/31),w=p.slice(start,start+n),a=w.filter(x=>x!==0);return {j,i,start,H:n-a.length,a}}));
 const results=[];
 for(let q=2;q<=32;q++){if(q===8||q===13)continue;const bo=bounds(C,q),cs=controls.map(({a,...p})=>({...p,stats:stats(a,q)}));const pass=cs.filter(x=>x.H<=F&&x.stats[0]>=bo.rune[0]&&x.stats[0]<=bo.rune[1]&&x.stats[1]>=bo.bigram[0]&&x.stats[1]<=bo.bigram[1]);const min=[Math.min(...cs.map(x=>x.stats[0])),Math.min(...cs.map(x=>x.stats[1]))];const maxRate=[bo.rune[1]/(3*(n-F)-6*q),bo.bigram[1]/(3*(n-F)-6*q-3)];const minNativeRate=[Math.min(...cs.map(x=>x.stats[0]/(3*(n-x.H)-6*q))),Math.min(...cs.map(x=>x.stats[1]/(3*(n-x.H)-6*q-3)))];results.push({q,bounds:bo,min,pass:pass.length,possible:pass,maxRate,minNativeRate,controls:cs})}
 return {sourceBlobShas,n,F,toyCases,plants,results};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const raw=files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
const blobShas=raw.map(x=>crypto.createHash("sha1").update("blob "+Buffer.byteLength(x)+"\0").update(x).digest("hex"));
console.log(JSON.stringify(run(JSON.parse(raw[0]),raw.slice(1),blobShas),null,2));
