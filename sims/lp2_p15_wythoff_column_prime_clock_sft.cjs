'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(gp,gold){
 const assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29;
 const idx=new Map(gp.runes.map((x,i)=>[x,i]));
 const native=gold.sections.map(s=>({name:s.name,p:[...s.source_text].filter(x=>idx.has(x)).map(x=>idx.get(x))}));
 const page=n=>gp.pages.find(p=>p.page===n).indices;
 const original=page(15).slice(20).concat(...Array.from({length:7},(_,i)=>page(16+i)));
 const N=original.length+1;
 function isqrt(n){let x=BigInt(Math.floor(Math.sqrt(Number(n))));while((x+1n)**2n<=n)x++;while(x*x>n)x--;return x;}
 const lower=n=>Number((BigInt(n)+isqrt(5n*BigInt(n)**2n))/2n);
 const ranks=[1,...Array.from({length:N},(_,i)=>lower(i+1)+i+1)];
 const fib=[0,1,2];while(fib.length<16)fib.push(fib.at(-1)+fib.at(-2));
 const primes=[];for(let x=2;primes.length<=Math.max(...ranks,988);x++){let ok=true;for(const p of primes){if(p*p>x)break;if(x%p===0){ok=false;break;}}if(ok)primes.push(x);}
 const grid=[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516];
 assert(grid.every((v,i)=>v===Math.abs(3301-primes[fib[i]])),"original grid");
 assert(ranks.slice(0,10).join()==="1,2,5,7,10,13,15,18,20,23","historical upper Wythoff with zero prefix");
 const schedules={ordinary:primes.slice(0,N).map(p=>mod(p-1)),grid:ranks.map(k=>mod(Math.abs(3301-primes[k-1]))),totient:ranks.map(k=>mod(primes[k-1]-1))};
 function enc(p,k,sign,hold){let j=0;return p.map(x=>hold&&x===0?0:mod(x+sign*k[j++]));}
 const solved=native.find(t=>t.name==="p56_an_end").p;
 assert(enc(solved,schedules.ordinary,1,true).join()===page(56).join(),"genuine p56");
 function reach(c,k,sign){let s=new Set([0]),peak=1;for(let i=0;i<c.length;i++){const next=new Set();for(const j of s){if(c[i]===0)next.add(j);if(mod(c[i]-sign*k[j])!==0)next.add(j+1);}if(!next.size)return {prefix:i,end:0,peak};s=next;peak=Math.max(peak,s.size);}return {prefix:c.length,end:s.size,peak};}
 function lm(exclude){const uni=new Float64Array(29),bi=new Float64Array(841),tr=new Float64Array(24389),bc=new Float64Array(29),tc=new Float64Array(841);let total=0;
  for(const {name,p} of native)if(!exclude.includes(name))for(let i=0;i<p.length;i++){const x=p[i];uni[x]++;total++;if(i){const b=p[i-1];bi[b*29+x]++;bc[b]++;}if(i>1){const a=p[i-2]*29+p[i-1];tr[a*29+x]++;tc[a]++;}}
  return (a,b,x)=>{const u=(uni[x]+1)/(total+29);if(b<0)return Math.log(u);const v=(bi[b*29+x]+5*u)/(bc[b]+5);if(a<0)return Math.log(v);const h=a*29+b;return Math.log((tr[h*29+x]+5*v)/(tc[h]+5));};}
 const score=(p,f)=>p.reduce((sum,x,i)=>sum+f(p[i-2]??-1,p[i-1]??-1,x),0)/p.length;
 function decode(c,k,sign,f){let states=new Map([["0,-1,-1",{j:0,a:-1,b:-1,p:[],score:0}]]);for(const x of c){const next=new Map();for(const t of states.values()){const put=(v,j)=>{const key=`${j},${t.b},${v}`,s=t.score+f(t.a,t.b,v);if(s>(next.get(key)?.score??-Infinity))next.set(key,{j,a:t.b,b:v,p:t.p.concat(v),score:s});};if(x===0)put(0,t.j);const v=mod(x-sign*k[t.j]);if(v!==0)put(v,t.j+1);}states=next;if(!states.size)return null;}return [...states.values()].sort((a,b)=>b.score-a.score)[0];}
 const fit=original.length-page(22).length, f=lm(["p56_an_end","p57_parable"]);
 const controls=[];
 for(const name of ["p57_parable","0_welcome","0_koan_1"]){const p=native.find(t=>t.name===name).p;const l=lm([name]);for(const schedule of ["grid","totient"]){const k=schedules[schedule];const c=enc(p,k,1,true);const d=decode(c,k,1,l);assert(d&&enc(d.p,k,1,true).join()===c.join(),"plant replay");controls.push({name,schedule,n:p.length,exact:d.p.filter((x,i)=>x===p[i]).length,reach:reach(c,k,1),score:d.score/p.length,truthScore:score(p,l)});}}
 const results=[];for(const schedule of ["grid","totient"]){const k=schedules[schedule];for(const sign of [1,-1]){const p=original.map((x,i)=>mod(x-sign*k[i]));assert(enc(p,k,sign,false).join()===original.join(),"ordinary replay");const a=reach(original,k,sign);const d=a.end?decode(original,k,sign,f):null;results.push({schedule,sign,hold:a,ordinaryFit:score(p.slice(0,fit),f),ordinaryHeld:score(p.slice(fit),f),ordinaryOpening:p.slice(0,80).map(x=>gp.translit[x]).join(""),ordinaryHeldOpening:p.slice(fit,fit+50).map(x=>gp.translit[x]).join(""),holdMean:d?d.score/original.length:null,holdOpening:d?d.p.slice(0,80).map(x=>gp.translit[x]).join(""):null});}}
 return {sourceGrid:grid,firstRanks:ranks.slice(0,16),firstGridKeys:schedules.grid.slice(0,16),originalLength:original.length,fit,held:original.length-fit,p56Replay:solved.length,nativeHeldScores:["p56_an_end","p57_parable"].map(name=>[name,score(native.find(t=>t.name===name).p,f)]),controls,results};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(experiment(...paths.map(p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8')))),null,2));
