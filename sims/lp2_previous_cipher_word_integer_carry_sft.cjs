"use strict";
const fs=require("node:fs"),path=require("node:path");
function run(A,T,G){
 const idx=new Map(A.runes.map((r,i)=>[r,i])),mod=(x,m)=>(x%m+m)%m,val=p=>p.reduce((x,y)=>29n*x+BigInt(y),0n),pow=n=>29n**BigInt(n);
 function digits(v,n){let p=Array(n);for(let i=n-1;i>=0;i--){p[i]=Number(v%29n);v/=29n}return p}
 const pages=T.split("%");pages.splice(50,0,"");let words=[],p=[],s,e,off=0;function finish(){if(p.length){words.push({p,s,e,off});off+=p.length;p=[]}}
 for(let i=0;i<56;i++)for(let c of pages[i]){if(idx.has(c)){if(!p.length)s=i;p.push(idx.get(c));e=i}else if(c!=="/"&&!/\s/u.test(c))finish()}finish();
 if(words.length!==2896||off!==12956||words.flatMap(x=>x.p).join(",")!==A.pages.slice(0,56).flatMap(p=>p.indices).join(","))throw Error("source");
 function encode(P,iv){let prev=iv;return P.map(p=>{let v=mod(val(p)+prev,pow(p.length));prev=v;return digits(v,p.length)})}
 function inverse(C,iv){let prev=iv;return C.map(c=>{let p=digits(mod(val(c)-prev,pow(c.length)),c.length);prev=val(c);return p})}
 const native=G.sections.map(x=>({name:x.name,words:x.source_text.split(/[^\u16a0-\u16ff]+/u).filter(Boolean).map(w=>Array.from(w).map(c=>idx.get(c)))}));
 const controls=[["0_welcome",3301n],["0_koan_1",798716n]].map(([name,iv])=>{let P=native.find(s=>s.name===name).words.slice(0,80),C=encode(P,iv),R=inverse(C,iv);if(R.flat().join(",")!==P.flat().join(","))throw Error("native");return {name,words:P.length,n:P.flat().length,leadingZeroCipher:C.filter(p=>p[0]===0).length,recovered:R.flat().length}});
 // explicit zero digit control
 const Z=[[0,0,3],[0],[1,2,0,0],[0,1]],Cz=encode(Z,27n);if(inverse(Cz,27n).flat().join(",")!==Z.flat().join(","))throw Error("leading zeros");
 const dict=new Set(native.flatMap(x=>x.words).map(p=>p.join(","))),ranges=[[0,2],[15,22],[54,55]],titles=[13,20,9];
 const original=ranges.map(([a,b],z)=>{let start=A.pages.slice(0,a).reduce((n,p)=>n+p.indices.length,0)+titles[z],W=words.filter(w=>w.off>=start&&w.s<=b);if(W[0].off!==start)throw Error("body");let C=W.map(w=>w.p),P=inverse(C.slice(1),val(C[0])),replay=encode(P,val(C[0])).flat().join(",")===C.slice(1).flat().join(",");if(!replay)throw Error("replay");return {a,b,words:P.length,n:P.flat().length,nativeHits:P.filter(w=>dict.has(w.join(","))).length,p55Groups:z===2?W.slice(1).map((w,i)=>w.e===55?P[i].map(v=>A.translit[v]).join(""):null).filter(Boolean):null,readout:P.map(w=>w.map(i=>A.translit[i]).join("")).join(" ")}});
 return {controls,leadingZeroControl:Cz,original}
}
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/transcriptions/lp2-image-corrected.txt"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"))),null,2));
