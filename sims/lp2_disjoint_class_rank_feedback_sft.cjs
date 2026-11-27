"use strict";
const fs=require("node:fs");
function experiment(g,n){
const mod=(a,b)=>(a%b+b)%b,B=29;
const v=new Set(["A","E","I","O","U","Y","AE","EA","EO","IO"].map(x=>g.translit.indexOf(x)).filter(x=>x>=0));
const G=[Array.from(v).sort((a,b)=>a-b),Array.from({length:29},(_,i)=>i).filter(i=>!v.has(i))],N=G.map(x=>x.length),cls=p=>v.has(p)?0:1;
const rank=Array.from({length:29},(_,p)=>G[cls(p)].indexOf(p));
const mp=new Map(g.runes.map((x,i)=>[x,i])),native=n.sections.map(x=>[...x.source_text].filter(y=>mp.has(y)).map(y=>mp.get(y)));
const pages=(a,b)=>g.pages.filter(x=>x.page>=a&&x.page<=b).flatMap(x=>x.indices);
function enc(p,k,phaseOnly=false){let c=0,q=1;return p.map(x=>{let b=cls(x),d=(b?N[0]:0)+mod(rank[x]-k[q*2+b],N[b]);c=phaseOnly?d:mod(c+d,29);q=b;return c})}
function prep(c){let last=0,q=1;return c.map(x=>{let d=mod(x-last,29),b=d<N[0]?0:1,a=[q*2+b,d-(b?N[0]:0)];last=x;q=b;return a})}
function decode(t,k){return t.map(([j,d])=>G[j%2][(d+k[j])%N[j%2]])}
function model(sections){let u=new Float64Array(29),bi=new Float64Array(29**2),tr=new Float64Array(29**3);for(const a of sections)for(let i=0;i<a.length;i++){u[a[i]]++;if(i)bi[a[i-1]*29+a[i]]++;if(i>1)tr[(a[i-2]*29+a[i-1])*29+a[i]]++}let total=u.reduce((a,b)=>a+b,0),pu=u.map(x=>(x+1)/(total+29));function blend(a,lower,w){const p=new Float64Array(a.length);for(let j=0;j<a.length;j+=29){let s=0;for(let x=0;x<29;x++)s+=a[j+x];for(let x=0;x<29;x++)p[j+x]=(a[j+x]+w*lower[(j+x)%lower.length])/(s+w)}return p}let pb=blend(bi,pu,8),pt=blend(tr,pb,12);return {u:pu.map(Math.log),b:pb.map(Math.log),t:pt.map(Math.log)}}
function score(p,m,from=0,to=p.length){let s=0;for(let i=from;i<to;i++)s+=i>1?m.t[(p[i-2]*29+p[i-1])*29+p[i]]:i?m.b[p[i-1]*29+p[i]]:m.u[p[i]];return s}
function stats(c){let hist=new Array(29).fill(0),eq=0;for(let i=0;i<c.length;i++){hist[c[i]]++;if(i&&c[i]===c[i-1])eq++}return {n:c.length,eq,ioc:hist.reduce((s,x)=>s+x*(x-1),0)/(c.length*(c.length-1)),hist}}
function trace(t){let a=t.map(([j])=>j%2),s=[0,0],tr=[0,0,0,0];for(let i=0;i<a.length;i++){s[a[i]]++;if(i)tr[a[i-1]*2+a[i]]++}return {counts:s,pairs:tr}}
function fit(c,m,split){const t=prep(c),prefix=t.slice(0,split),p=new Uint8Array(split);let best=null,runner=-Infinity,keys=0;for(let a=0;a<N[0];a++)for(let b=0;b<N[1];b++)for(let d=0;d<N[0];d++)for(let e=0;e<N[1];e++){let k=[a,b,d,e];for(let i=0;i<split;i++){let [j,x]=prefix[i];p[i]=G[j%2][(x+k[j])%N[j%2]]}let s=score(p,m);keys++;if(!best||s>best.s){runner=best?.s??-Infinity;best={k,s}}else if(s>runner)runner=s}let out=decode(t,best.k);return {key:best.k,keys,fitNats:best.s/split,runnerGap:best.s-runner,heldNats:score(out,m,split)/(out.length-split),replay:enc(out,best.k).join()===c.join(),prefix:out.slice(0,split).map(x=>g.translit[x]).join(""),held:out.slice(split).map(x=>g.translit[x]).join(""),out,trace:trace(t),cipherStats:stats(c)}}
const exactBijections=(()=>{let count=0;for(let q=0;q<2;q++)for(let c=0;c<29;c++)for(let a=0;a<N[0];a++)for(let b=0;b<N[1];b++){const k=[a,b,a,b];let seen=new Set();for(let p=0;p<29;p++){let z=cls(p),d=(z?N[0]:0)+mod(rank[p]-k[q*2+z],N[z]),y=mod(c+d,29);seen.add(y);let dd=mod(y-c,29),zz=dd<N[0]?0:1,pp=G[zz][(dd-(zz?N[0]:0)+k[q*2+zz])%N[zz]];if(pp!==p||zz!==z)throw Error("inverse")}if(seen.size!==29)throw Error("collision");count++}return count})();
const planted=[{name:"WELCOME",ids:[1],p:native[1].slice(0,308),split:232,k:[3,7,6,11]},{name:"KOAN",ids:[3],p:native[3].slice(0,308),split:232,k:[8,12,3,4]},{name:"AN END + PARABLE",ids:[7,8],p:native[7].concat(native[8]),split:85,k:[6,2,8,14]}];
const plants=planted.map(({name,ids,p,split,k})=>{const c=enc(p,k),m=model(native.filter((_,i)=>!ids.includes(i))),f=fit(c,m,split);const prefixMatch=f.out.slice(0,split).filter((x,i)=>x===p[i]).length,heldMatch=f.out.slice(split).filter((x,i)=>x===p[i+split]).length;delete f.out;return {name,n:p.length,split,trueKey:k,exactKey:k.join()===f.key.join(),prefixMatch,heldMatch,trueHeldNats:score(p,m,split)/(p.length-split),nativeStats:stats(p),phaseOnlyStats:stats(enc(p,k,true)),noClassStateStats:stats(enc(p,[k[0],k[1],k[0],k[1]])),...f}});
const gate=plants.every(x=>x.exactKey&&x.prefixMatch===x.split&&x.heldMatch===x.n-x.split&&x.replay);
const original=[];if(gate){const m=model(native);for(const [name,c,split] of [["p54–55",pages(54,55),pages(54,54).length],["p40–53",pages(40,53),pages(40,46).length]]){const f=fit(c,m,split);delete f.out;f.prefix=f.prefix.slice(0,240);f.held=f.held.slice(0,240);original.push({name,split,...f})}}
const book=pages(0,55),bookTrace=trace(prep(book));
return {partition:G,domain:N[0]**2*N[1]**2,exactBijections,plants,gate,original,bookStats:stats(book),bookTrace,nativeTraces:native.map((p,i)=>({name:n.sections[i].name,...trace(prep(enc(p,[0,0,0,0])))}))};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];if(require.main===module) console.log(JSON.stringify(experiment(...files.map(p=>JSON.parse(fs.readFileSync(p,"utf8")))),null,2));module.exports={experiment,files};
