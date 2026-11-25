"use strict";
const fs=require("node:fs"),path=require("node:path");
function run(A,H,G){
 const mod=x=>(x%29+29)%29,idx=new Map(A.runes.map((r,i)=>[r,i])),key="FIRFUMFERENFE".split("").map(c=>A.translit.indexOf(c));let clock=0,holds=[];
 function page(n,clear){let P=[],skip=false;for(const c of H.originals.find(p=>p.page===n).runic_text){if(c===":"){skip=true;continue}if(!idx.has(c))continue;let v=idx.get(c);if(clear)P.push(v);else if(skip){if(v!==0)throw Error("hold");holds.push([n,P.length]);P.push(v)}else P.push(mod(v-key[clock++%13]));skip=false}return P}
 const parts=[page("107",false),page("167",false),page("229",true)],K=parts.flat();if(K.length!==408||clock!==317||JSON.stringify(holds)!=='[["107",49],["107",58]]')throw Error("source");
 const C=A.pages.slice(0,56).flatMap(p=>p.indices),k=C.map((_,i)=>K[i%K.length]);if(C.length!==12956)throw Error("target");
 function arithmetic(X,Y,sign,incoming=0){let out=Array(X.length),carry=incoming;for(let i=X.length-1;i>=0;i--){let v=X[i]+sign*Y[i]+carry;out[i]=mod(v);carry=(v-out[i])/29}return {out,carry}}
 const P=arithmetic(C,k,-1).out;const replay=arithmetic(P,k,1).out.every((v,i)=>v===C[i]);if(!replay)throw Error("replay");
 const ordinary=C.map((v,i)=>mod(v-k[i])),ioc=p=>{let f=Array(29).fill(0);for(let v of p)f[v]++;return f.reduce((s,n)=>s+n*(n-1),0)/(p.length*(p.length-1))};
 const model=new Float64Array(30*30*29).fill(.1);for(const s of G.sections){let a=29,b=29;for(const r of s.source_text){if(!idx.has(r))continue;let p=idx.get(r);model[(a*30+b)*29+p]++;a=b;b=p}}for(let i=0;i<model.length;i+=29){let sum=0;for(let j=0;j<29;j++)sum+=model[i+j];for(let j=0;j<29;j++)model[i+j]=Math.log(model[i+j]/sum)}
 function score(p){let a=29,b=29,s=0;for(let v of p){s+=model[(a*30+b)*29+v];a=b;b=v}return s/p.length}
 const start=n=>A.pages.slice(0,n).reduce((x,p)=>x+p.indices.length,0);
 const windows=[[0,55],[16,21],[40,53],[54,55]].map(([a,b])=>{let lo=start(a),hi=start(b+1),p=P.slice(lo,hi),o=ordinary.slice(lo,hi);return {a,b,n:p.length,ioc:ioc(p),score:score(p),digitwiseIoc:ioc(o),digitwiseScore:score(o),changed:p.filter((v,i)=>v!==o[i]).length,preview:p.slice(0,100).map(x=>A.translit[x]).join("")}});
 // Seam before p22: suffix alone determines borrow; two prefix branches computed without suffix.
 const split=start(22),suffix=arithmetic(C.slice(split),k.slice(split),-1),prefix0=arithmetic(C.slice(0,split),k.slice(0,split),-1,0).out,prefix1=arithmetic(C.slice(0,split),k.slice(0,split),-1,-1).out;
 const picked=suffix.carry===0?prefix0:prefix1;if(picked.concat(suffix.out).some((v,i)=>v!==P[i]))throw Error("seam");
 const controls=[];for(const name of ["p56_an_end","p57_parable"]){let plain=[...G.sections.find(s=>s.name===name).source_text].filter(r=>idx.has(r)).map(r=>idx.get(r)),ks=plain.map((_,i)=>K[i%408]),ct=arithmetic(plain,ks,1).out,dec=arithmetic(ct,ks,-1).out;controls.push({name,n:plain.length,recovered:dec.filter((x,i)=>x===plain[i]).length,ordinaryErrors:ct.filter((v,i)=>mod(v-ks[i])!==plain[i]).length});}
 return {keyLength:K.length,sourceLengths:parts.map(x=>x.length),replay,windows,seam:{split,borrow:suffix.carry,prefixDifference:prefix0.filter((v,i)=>v!==prefix1[i]).length,branch0Score:score(prefix0),branch1Score:score(prefix1),frozenByCiphertext:true},controls,full:P};
}
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(run(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/2014-onion6-seven-rune-pages.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
