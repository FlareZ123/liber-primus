// GEB worked Collatz orbit key test; run from repository root with Node.js.
"use strict";
const fs=require("node:fs");
function run(c,g,e){
const mod=n=>(n%29+29)%29;
const orbit=n=>{let a=[n];while(n!==1){n=n%2?3*n+1:n/2;a.push(n);}return a;};
const tr=c.translit;const tokens=tr.map((t,i)=>[t,i]).concat([["ING",21],["IO",27]]).sort((a,b)=>b[0].length-a[0].length);
function norm(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let j=0;j<w.length;){let t=tokens.find(x=>w.startsWith(x[0],j));if(!t)throw Error(w.slice(j));out.push(t[1]);j+=t[0].length;}}return out;}
const train=[...norm(g),...norm(e)];const a=Array(29*29).fill(0),b=Array(29**3).fill(0);for(let i=2;i<train.length;i++){let k=train[i-2]*29+train[i-1];a[k]++;b[k*29+train[i]]++;}
function score(p){let s=0;for(let i=2;i<p.length;i++){let k=p[i-2]*29+p[i-1];s+=Math.log((b[k*29+p[i]]+.5)/(a[k]+14.5));}return s/(p.length-2);}
function support(ct,ks,repeat=true){let m=new Map([[0,1n]]);let firstDead=null;for(let i=0;i<ct.length;i++){let next=new Map;for(let [j,n] of m){if(ct[i]===0)next.set(j,(next.get(j)||0n)+n);let k=repeat?ks[j%ks.length]:ks[j];if(k!==undefined&&mod(ct[i]-k)!==0)next.set(j+1,(next.get(j+1)||0n)+n);}m=next;if(!m.size){firstDead=i;break;}}return {firstDead,paths:[...m.values()].reduce((a,b)=>a+b,0n).toString()};}
const known=c.pages[57].indices;let ct=[],j=0;const controlK=orbit(15).slice(1,-1).map(mod);for(let p of known)ct.push(p===0?0:mod(p+controlK[j++%controlK.length]));
const control=support(ct,controlK);if(control.firstDead!==null)throw Error("plant failure");
const prime=[];for(let n=2;prime.length<85;n++)if(prime.every(p=>n%p!==0))prime.push(n);const p56=support(c.pages[56].indices,prime.map(x=>mod(x-1)),false);
let tests=[];
for(let seed of [15,27]){const pages=c.pages.filter(p=>p.page>=seed&&p.page<=(seed===15?22:32));const cipher=pages.flatMap(p=>p.indices);for(let [kind,seq] of [["worked-orbit",orbit(seed)],["interior",orbit(seed).slice(1,-1)]]){const ks=seq.map(mod);const plain=cipher.map((x,i)=>mod(x-ks[i%ks.length]));let held=plain.slice(pages[0].indices.length);tests.push({seed,kind,period:ks.length,chapterLength:cipher.length,key:ks,support:support(cipher,ks),ordinary:{prefix:plain.slice(0,40).map(i=>tr[i]).join(" "),score:score(plain),continuationScore:score(held)}});}}
return {trainLength:train.length,clearControlScore:score(known),syntheticFhold:control,originalP56:p56,orbits:[15,27].map(n=>({seed:n,length:orbit(n).length,max:Math.max(...orbit(n))})),tests};}
const load=p=>fs.readFileSync(p,"utf8");
console.log(JSON.stringify(run(JSON.parse(load("resources/liber-primus/lp2-corpus.json")),load("resources/control/gibran_prophet_58585.txt"),load("resources/control/emerson_essays_2944.txt")),null,2));
