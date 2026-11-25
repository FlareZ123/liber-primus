"use strict";
const fs=require("node:fs"),path=require("node:path");
function run(A,G){
 const mod=x=>(x%29+29)%29,w=A.prime,W=Math.max(...w),max=3301+299*W+1,sieve=new Uint8Array(600000);sieve.fill(1,2);for(let p=2;p*p<sieve.length;p++)if(sieve[p])for(let j=p*p;j<sieve.length;j+=p)sieve[j]=0;
 const K=Uint8Array.from(Array.from(sieve.keys()).filter(i=>sieve[i]).map(p=>(p-1)%29));if(K.length<=max)throw Error("prime bound");
 const tape=A.pages[54].indices.slice(9).concat(A.pages[55].indices);if(tape.length!==299)throw Error("body");
 const idx=new Map(A.runes.map((x,i)=>[x,i]));
 function encode(P,j){return P.map(p=>{if(!p)return 0;let c=mod(p+K[j]);j+=w[p];return c})}
 function lm(ex){let z=new Float64Array(30*30*29).fill(.1);for(const s of G.sections){if(s.name===ex)continue;let a=29,b=29;for(const c of s.source_text){if(!idx.has(c))continue;let p=idx.get(c);z[(a*30+b)*29+p]++;a=b;b=p}}for(let i=0;i<z.length;i+=29){let t=0;for(let p=0;p<29;p++)t+=z[i+p];for(let p=0;p<29;p++)z[i+p]=Math.log(z[i+p]/t)}return z}
 function backward(C){let D=new Uint8Array(max+1);D.fill(1);for(let i=C.length-1;i>=0;i--){let N=new Uint8Array(max+1),bound=3301+i*W;for(let j=0;j<=bound;j++){let p=mod(C[i]-K[j]);N[j]=Number((C[i]===0&&D[j])||(p!==0&&D[j+w[p]]))}D=N}return Array.from({length:3302},(_,i)=>i).filter(i=>D[i])}
 function fit(C,model,originList,initial){let dp=initial?new Map([[initial.id,{score:0,node:null,origin:initial.origin}]]):new Map(originList.map(o=>[o*900+899,{score:0,node:null,origin:o}]));for(let i=0;i<C.length;i++){let next=new Map();for(const [id,v] of dp){let j=Math.floor(id/900),a=Math.floor(id%900/30),b=id%30,p=mod(C[i]-K[j]);function put(x,k){let key=k*900+b*30+x,z=v.score+model[(a*30+b)*29+x];if(!next.has(key)||next.get(key).score<z)next.set(key,{score:z,origin:v.origin,node:{p:x,prev:v.node}})}if(C[i]===0)put(0,j);if(p!==0)put(p,j+w[p]);}dp=next;if(!dp.size)break}
 let best=null;for(const [id,v] of dp)if(!best||v.score>best.score)best={id,...v};return best}
 function unpack(n){let out=[];for(;n;n=n.prev)out.push(n.p);return out.reverse()}
 function trial(C,ex,truth,origin){const cut=223,pre=C.slice(0,cut),model=lm(ex),origins=backward(pre),f=fit(pre,model,origins);if(!f)return {prefixOrigins:origins.length};let best=fit(C.slice(cut),model,[],f);
 const prefix=unpack(f.node),suffix=best?unpack(best.node):[],P=prefix.concat(suffix);const fullOrigins=backward(C);return {prefixOrigins:origins.length,fullOrigins,selected:f.origin,hidden:origin,boundary:Math.floor(f.id/900),prefixScore:f.score/cut,holdoutScore:best?best.score/(C.length-cut):null,correctPrefix:truth?prefix.filter((x,i)=>x===truth[i]).length:null,correctHeld:truth?suffix.filter((x,i)=>x===truth[i+cut]).length:null,complete:P.length===C.length,replay:P.length===C.length&&encode(P,f.origin).every((x,i)=>x===C[i]),readout:P.map(p=>A.translit[p]).join("")}
 }
 const controls=[["0_welcome",1147],["0_loss_of_divinity",2089]].map(([n,o])=>{let P=Array.from(G.sections.find(x=>x.name===n).source_text).filter(x=>idx.has(x)).map(x=>idx.get(x)).slice(0,299);if(P.length!==299)throw Error("plant length");let t=trial(encode(P,o),n,P,o);return {name:n,...t}});
 const original=trial(tape,null,null,null);
 return {controls,original}
}
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(run(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
