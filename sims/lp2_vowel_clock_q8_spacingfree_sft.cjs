"use strict";
const fs=require("node:fs");
function experiment(gp,nativeData,raw,options={}){
 const V=new Set(["A","E","I","O","U","Y","AE","EA","EO","IO"].map(x=>gp.translit.indexOf(x)).filter(x=>x>=0));
 const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error(w);out.push(t.i);w=w.slice(t.s.length)}}return out}
 const B=29,H=B**3,HM=H*B;const un=new Uint32Array(B),bi=new Uint32Array(B**2),tri=new Uint32Array(B**3),qua=new Uint32Array(B**4),five=new Uint16Array(B**5),den=new Uint32Array(B**4);
 for(const a of raw.map(native)){let h=0;for(let i=0;i<a.length;i++){const p=a[i];un[p]++;if(i>=1)bi[(h%B)*B+p]++;if(i>=2)tri[(h%(B**2))*B+p]++;if(i>=3)qua[(h%H)*B+p]++;if(i>=4){five[h*B+p]++;den[h]++}h=(h*B+p)%HM}}
 function blend(count,lower,strength){const out=new Float32Array(count.length);for(let i=0;i<count.length;i+=B){let n=0;for(let p=0;p<B;p++)n+=count[i+p];for(let p=0;p<B;p++){const prior=lower[(i+p)%lower.length];out[i+p]=(count[i+p]+strength*prior)/(n+strength)}}return out}
 const pu=blend(un,new Float32Array(B).fill(1/B),B),pb=blend(bi,pu,8),pt=blend(tri,pb,12),pq=blend(qua,pt,16);const log4=new Float32Array(qua.length);for(let i=0;i<log4.length;i++)log4[i]=Math.log(pq[i]);const log5=new Float32Array(five.length);for(let h=0;h<HM;h++)for(let p=0;p<B;p++)log5[h*B+p]=Math.log((five[h*B+p]+24*pq[(h%H)*B+p])/(den[h]+24));
 const score=(h,len,p)=>len>=4?log5[h*B+p]:len===3?log4[h*B+p]:Math.log(len===2?pt[h*B+p]:len===1?pb[h*B+p]:pu[p]);
 const pow=Array.from({length:8},(_,i)=>B**i),mod=x=>(x+29)%29,phase=(q,p)=>(q+(V.has(p)?1:0))%8;
 const code=k=>k.reduce((s,x,i)=>s+x*pow[i],0),keyOf=k=>pow.map(p=>Math.floor(k/p)%29),rotate=(k,j)=>k.slice(j).concat(k.slice(0,j)),canon=k=>Math.min(...Array.from({length:8},(_,i)=>code(rotate(k,i))));
 function enc(p,key,q=0){return p.map(x=>{const c=x?mod(x+key[q]):0;q=phase(q,x);return c})}
 function search(c,width=30000){let states=[{k:0,n:0,q:0,h:0,s:0}];for(let i=0;i<c.length;i++){const x=c[i],a=[];let cutoff=-Infinity;function trim(){a.sort((a,b)=>b.s-a.s);const seen=new Set();let j=0;for(const z of a){const id=z.k+":"+z.n+":"+z.q+":"+z.h;if(seen.has(id))continue;seen.add(id);a[j++]=z;if(j===width)break}a.length=j;cutoff=j===width?a[j-1].s:-Infinity}function push(z,p,k,n){const s=z.s+score(z.h,Math.min(i,4),p);if(s<cutoff)return;const q=phase(z.q,p),h=(z.h*29+p)%HM;a.push({k,n,q,h,s});if(a.length>=width*3)trim()}
 for(const z of states){if(x===0)push(z,0,z.k,z.n);if(z.q<z.n){const p=mod(x-Math.floor(z.k/pow[z.q])%29);if(p)push(z,p,z.k,z.n)}else for(let p=1;p<29;p++)push(z,p,z.k+mod(x-p)*pow[z.q],z.n+1)}
 trim();states=a;if(!states.length)break;}
 const keys=new Set();for(const z of states){if(z.n===8)keys.add(canon(keyOf(z.k)));if(keys.size===64)break}return [...keys]}
 function decode(c,key,start={q:0,h:0,len:0}){let states=new Map([[start.q*HM+start.h,{q:start.q,h:start.h,s:0,path:""}]]);for(let i=0;i<c.length;i++){const x=c[i],next=new Map();for(const z of states.values()){const y=mod(x-key[z.q]);for(const p of x===0?(y?[0,y]:[0]):y?[y]:[]){const q=phase(z.q,p),h=(z.h*29+p)%HM,s=z.s+score(z.h,Math.min(start.len+i,4),p),id=q*HM+h;if(!next.has(id)||s>next.get(id).s)next.set(id,{q,h,s,path:z.path+String.fromCharCode(65+p)})}}states=next;if(!states.size)return null}let best=null;for(const z of states.values())if(!best||z.s>best.s)best=z;return {key,p:[...best.path].map(x=>x.charCodeAt(0)-65),s:best.s,end:{q:best.q,h:best.h,len:start.len+c.length}}}
 const mp=new Map(gp.runes.map((x,i)=>[x,i]));const sec=nativeData.sections.map(x=>[...x.source_text].filter(v=>mp.has(v)).map(v=>mp.get(v)));
 const offsets=[0,32,64,96,128],width=30000,window=104,split=232;
 function solve(c,truth=null,key=null){const prefix=c.slice(0,split),keys=new Set(),anchors=[];for(const offset of offsets){const a=search(prefix.slice(offset,offset+window),width);for(const k of a)keys.add(k);anchors.push({offset,keys:a.length,containsTrue:key?a.includes(canon(key)):null})}
 const fits=[];for(const k of keys)for(let j=0;j<8;j++){const d=decode(prefix,rotate(keyOf(k),j));if(d)fits.push(d)}fits.sort((a,b)=>b.s-a.s);const best=fits[0]||null;if(!best)return {anchors,keys:keys.size,validFits:0};const held=decode(c.slice(split),best.key,best.end);const matches=(a,b)=>a?.filter((x,i)=>x===b[i]).length??0;return {anchors,keys:keys.size,validFits:fits.length,key:best.key,score:best.s,runner:fits[1]?.s,prefixMatch:truth?matches(best.p,truth.slice(0,split)):null,prefixReplay:enc(best.p,best.key).join()===prefix.join(),heldMatch:truth&&held?matches(held.p,truth.slice(split)):null,heldLength:held?.p.length,heldReplay:held?enc(held.p,best.key,best.end.q).join()===c.slice(split).join():false,heldScore:held?.s,exactKey:key?best.key.join()===key.join():null,prefix:best.p.map(i=>gp.translit[i]).join(""),held:held?.p.map(i=>gp.translit[i]).join("")}}
 const plants=[{p:sec[1].slice(0,308),key:[4,17,9,23,1,25,8,12]},{p:sec[5].slice(0,308),key:[7,15,2,21,5,27,11,19]}].map(({p,key})=>solve(enc(p,key),p,key));
 const gate=plants.every(p=>p.exactKey&&p.prefixMatch===232&&p.heldMatch===76&&p.prefixReplay&&p.heldReplay);
 const original=gate&&!options.controlsOnly?solve(gp.pages.filter(p=>p.page>=54&&p.page<=55).flatMap(p=>p.indices)):null;
 return {vowels:[...V].sort((a,b)=>a-b),width,window,offsets,plants,gate,original};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
if(require.main===module){const r=files.map(p=>fs.readFileSync(p,"utf8"));console.log(JSON.stringify(experiment(JSON.parse(r[0]),JSON.parse(r[1]),r.slice(2),{controlsOnly:process.argv.includes("--controls-only")}),null,2));}
module.exports={experiment,files};
