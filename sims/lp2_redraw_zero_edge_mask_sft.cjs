"use strict";
// Ciphertext-only zero-edge mask reconstruction for collision-only periodic redraw.
// No GP language model or printed separators used in likelihood.
function run(co,native,gibran){
const m=x=>(x+58)%29;
let st=0x1249b072;
function rng(){st^=st<<13;st^=st>>>17;st^=st<<5;return (st>>>0)/4294967296}
function rand(n){return Math.floor(rng()*n)}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){let j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function canonical(a){return Array.from({length:a.length},(_,i)=>a.slice(i).concat(a.slice(0,i)).join(",")).sort()[0]}
function key(q,z){let k;do{k=Array.from({length:q},()=>rand(29));for(let i=0;i<z;i++)k[2*i+1]=k[2*i]}while(k.filter((x,i)=>x===k[(i+1)%q]).length!==z);return k}
function diff(k){return k.map((x,i)=>m(k[(i+1)%k.length]-x))}
function emit(p,k,supp){let j=rand(k.length),prev=-1,skips=0,c=[];for(let x of p){let y=m(x+k[j]);j=(j+1)%k.length;if(y===prev&&rng()<supp){y=m(x+k[j]);j=(j+1)%k.length;skips++}c.push(y);prev=y}return {d:c.slice(1).map((x,i)=>m(x-c[i])),skips}}
function score(d,D,supp){let q=D.length,a=new Float64Array(q).fill(1/q),b=new Float64Array(q),ls=0,base=0,counts=Array(29).fill(0);for(let x of D)counts[x]++;for(let x of d){let direct=x===0?1-supp:1,den=direct+supp*counts[x]/q;if(!den)return {ll:-Infinity,excess:-Infinity};base+=Math.log(den);b.fill(0);for(let j=0;j<q;j++){b[(j+1)%q]+=a[j]*direct;if(x===D[j])b[(j+2)%q]+=a[j]*supp}let z=0;for(let v of b)z+=v;if(!z)return {ll:-Infinity,excess:-Infinity};ls+=Math.log(z);for(let j=0;j<q;j++)b[j]/=z;[a,b]=[b,a]}return {ll:ls,excess:ls-base}}
function gp(s){const g=new Map(co.runes.map((x,i)=>[x,i]));return [...s].filter(x=>g.has(x)).map(x=>g.get(x))}
function english(s){let a=s.toUpperCase().replace(/[^A-Z]+/g," ").replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");let out=[];for(let i=0;i<a.length;){if(a[i]===" "){i++;continue}let v=co.translit.indexOf(a.slice(i,i+2));if(v>=0){out.push(v);i+=2}else{v=co.translit.indexOf(a[i++]);if(v>=0)out.push(v)}}return out}
function gate(p,q,z,supp,name){let k=key(q,z),D=diff(k),e=emit(p,k,supp),ds=e.d,cut=Math.floor(ds.length*2/3),fit=ds.slice(0,cut),hold=ds.slice(cut),truth=score(fit,D,supp),truthH=score(hold,D,supp),nulls=[],seen=new Set([canonical(D)]);for(let j=0;j<5000&&nulls.length<256;j++){let S=shuffle(D),id=canonical(S);if(seen.has(id))continue;seen.add(id);nulls.push({D:S,fit:score(fit,S,supp).excess,hold:score(hold,S,supp).excess})}let betterFit=nulls.filter(x=>x.fit>=truth.excess-1e-10).length,betterHold=nulls.filter(x=>x.hold>=truthH.excess-1e-10).length;let best=nulls.reduce((a,b)=>a.fit>b.fit?a:b);return {name,q,z,supp,n:p.length,key:k,D,skips:e.skips,repeats:ds.filter(x=>x===0).length,truthFit:truth,truthHold:truthH,permutations:nulls.length,betterFit,betterHold,bestDecoy:best,d:ds,cut}}
function masks(q){let result=[];for(let mask=0;mask<(1<<q);mask++){let a=Array.from({length:q},(_,i)=>(mask>>i)&1),z=a.reduce((x,y)=>x+y,0);if(z===q-1||a.join(",")!==canonical(a))continue;result.push(a)}return result}
// Ratio to independent Bernoulli(1/29). For nonrepeat use weight 1 + s*(1-Z)/28,
// for repeat use weight 1-s + s*Z. These are transition weights, not pointwise sums.
function maskScore(d,Z,s,initial){const q=Z.length;let a=initial?Float64Array.from(initial):new Float64Array(q).fill(1/q),b=new Float64Array(q),ll=0,scale=s/28;
const j1=Array.from({length:q},(_,j)=>(j+1)%q),j2=Array.from({length:q},(_,j)=>(j+2)%q);
for(let i=0;i<d.length;i++){let x=d[i],rep=x===0;b.fill(0);if(rep){for(let j=0;j<q;j++){b[j1[j]]+=a[j]*(1-s);if(Z[j])b[j2[j]]+=a[j]*s}}else{for(let j=0;j<q;j++){b[j1[j]]+=a[j];if(!Z[j])b[j2[j]]+=a[j]*scale}}let z=0;if(rep||i===d.length-1||(i&255)===255){for(let j=0;j<q;j++)z+=b[j];if(z===0)return {ll:-Infinity,phase:null};ll+=Math.log(z);for(let j=0;j<q;j++)b[j]/=z}[a,b]=[b,a]}
return {ll,phase:Array.from(a)}}
function iid(d,r){let n=d.filter(x=>x===0).length;return (n?n*Math.log(r*29):0)+(d.length-n? (d.length-n)*Math.log((1-r)*29/28):0)}
const catalog=[8,13].flatMap(q=>masks(q).flatMap(Z=>[0.8,1].map(s=>({q,Z,s}))));
function blind(d,cut,truth){let tr=d.slice(0,cut),ho=d.slice(cut),r=tr.filter(x=>x===0).length/tr.length;let candidates=catalog.map(x=>({...x,...maskScore(tr,x.Z,x.s)})).sort((a,b)=>b.ll-a.ll);
let a=candidates[0],h=maskScore(ho,a.Z,a.s,a.phase),truthFit=truth?candidates.find(x=>x.q===truth.q&&x.s===truth.supp&&x.Z.join(",")===canonical(truth.D.map(v=>+(v===0)))):null;
let tie=candidates.filter(x=>x.ll>=a.ll-1e-10).length;
let rank=truthFit?1+candidates.filter(x=>x.ll>truthFit.ll+1e-10).length:null;
return {cut,held:ho.length,trainingRepeats:tr.filter(x=>x===0).length,heldRepeats:ho.filter(x=>x===0).length,catalog:catalog.length,best:{q:a.q,Z:a.Z,s:a.s,fitLL:a.ll,fitVsIID:a.ll-iid(tr,r),heldLL:h.ll,heldVsIID:h.ll-iid(ho,r),tie},truthRank:rank,truthFit:truthFit?{ll:truthFit.ll,heldVsIID:maskScore(ho,truthFit.Z,truthFit.s,truthFit.phase).ll-iid(ho,r)}:null,top10:candidates.slice(0,10).map(({q,Z,s,ll})=>({q,Z,s,ll}))}}
const nativeP=native.sections.flatMap(s=>gp(s.source_text)),longP=english(gibran),controls=[];
for(let q of [8,13])for(let supp of [0.8,1]){let z=supp===1?(q===8?2:3):0;for(let [name,p] of [["uniform",Array.from({length:12956},()=>rand(29))],["native",nativeP],["gibran",longP.slice(2000,14956)]]){let a=gate(p,q,z,supp,name);a.mask=blind(a.d,a.cut,a);delete a.d;controls.push(a)}}
const c=co.pages.slice(0,56).flatMap(p=>p.indices),d=c.slice(1).map((x,i)=>m(x-c[i]));
if(c.length!==12956||d.filter(x=>x===0).length!==86)throw Error("unexpected original corpus");
const cut=co.pages.slice(0,40).flatMap(p=>p.indices).length-1;
let original=blind(d,cut,null);
return {nativeLength:nativeP.length,gibranLength:longP.length,maskCatalog:catalog.length,controls,original};
}
if(typeof module!=="undefined"){module.exports=run;if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,"..");const read=p=>fs.readFileSync(path.join(root,p),"utf8");console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/control/gibran_prophet_58585.txt")),null,2));}}
