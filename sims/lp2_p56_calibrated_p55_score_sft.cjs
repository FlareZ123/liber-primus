"use strict";
const fs=require("node:fs");const path=require("node:path");
function score(c,gibran,emerson,lp1){
 const id=Array.from({length:29},(_,i)=>i),tok=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),mod=x=>(x%29+29)%29;
 function gp(text){let P=[];for(let w of text.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){P.push(21);i+=3;continue}if(w.startsWith("IO",i)){P.push(27);i+=2;continue}let t=tok.find(x=>w.startsWith(x.s,i));if(!t){i++;continue}P.push(t.i);i+=t.s.length}}return P}
 function model(text){let cnt=new Int32Array(29**4),pre=new Int32Array(29**3),P=gp(text);for(let i=3;i<P.length;i++){let k=(P[i-3]*29+P[i-2])*29+P[i-1];cnt[k*29+P[i]]++;pre[k]++}return {N:P.length-3,score(P,a=3,b=P.length){let s=0;for(let i=Math.max(3,a);i<b;i++){let k=(P[i-3]*29+P[i-2])*29+P[i-1];s+=Math.log((cnt[k*29+P[i]]+.25)/(pre[k]+.25*29))}return s/(b-Math.max(3,a))}}}
 const models=[model(gibran),model(emerson)],results=models.map(s=>({N:s.N,bestFull:null,bestPrefix:null,ties:0}));let sh=[];for(let x=2;sh.length<76;x++){let yes=true;for(let d=2;d*d<=x;d++)if(x%d===0){yes=false;break}if(yes)sh.push((x-1)%29)}
 const R=c.pages[55].indices.map((x,i)=>mod(x-sh[i])),labels=[11,12,21,22,25,27,28],resid=[0,11,12,22,25,27,28];
 function perm(a,fn){if(!a.length){fn([]);return}for(let i=0;i<a.length;i++)perm(a.slice(0,i).concat(a.slice(i+1)),p=>fn([a[i],...p]))}
 let total=0;perm(labels,v=>{let inv=id.slice();inv[21]=0;resid.forEach((x,i)=>inv[x]=v[i]);let P=R.map(x=>inv[x]);total++;models.forEach((m,i)=>{const z=results[i],full=m.score(P),prefix=m.score(P,3,50),holdout=m.score(P,50),row={full,prefix,holdout,plain:P.map(x=>c.translit[x]).join(" "),inverse:inv};if(!z.bestFull||full>z.bestFull.full)z.bestFull=row;if(!z.bestPrefix||prefix>z.bestPrefix.prefix+1e-12){z.bestPrefix=row;z.ties=1}else if(Math.abs(prefix-z.bestPrefix.prefix)<1e-12)z.ties++})});
 const native=gp(lp1.split("### 56")[0].split("\n").filter(l=>l.trim()&&l===l.toUpperCase()&&/[A-Z]/.test(l)&&!/^[#\[]/.test(l)).join(" "));
 const windows=[];for(let i=0;i+76<=native.length;i+=76){let P=native.slice(i,i+76);windows.push(models.map(m=>({full:m.score(P),holdout:m.score(P,50)})))}
 const ranges=models.map((m,i)=>({n:windows.length,minFull:Math.min(...windows.map(w=>w[i].full)),maxFull:Math.max(...windows.map(w=>w[i].full)),minHoldout:Math.min(...windows.map(w=>w[i].holdout)),maxHoldout:Math.max(...windows.map(w=>w[i].holdout))}));
 return {total,results,ranges};
}
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
console.log(JSON.stringify(score(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/control/gibran_prophet_58585.txt"),read("resources/control/emerson_essays_2944.txt"),read("resources/liber-primus/lp1-plaintext-reference.txt")),null,2));
