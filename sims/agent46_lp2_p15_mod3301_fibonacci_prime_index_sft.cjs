"use strict";
const fs=require("node:fs");
function experiment(corpus,control){
 const mod=x=>(x%29+29)%29;
 const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const check=(x,s)=>{if(!x)throw Error(s)};
 const primes=[];for(let n=2;primes.length<3301;n++){let ok=true;for(const p of primes){if(p*p>n)break;if(n%p===0){ok=false;break}}if(ok)primes.push(n)}
 const ord=[0];let a=1,b=2;do{ord.push(a);[a,b]=[b,(a+b)%3301]}while(a!==1||b!==2);
 const period=ord.length-1;
 const key=ord.map(x=>mod(Math.abs(3301-primes[x])));
 const cells=[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516];
 check(eq(ord.slice(0,16).map(x=>Math.abs(3301-primes[x])),cells),"grid");
 const K=(phase,j)=>phase===0&&j===0?key[0]:key[1+((phase+j-1)%period+period)%period];
 function send(p,phase,sign,hold){let j=0;return p.map(x=>hold&&x===0?0:mod(x+sign*K(phase,j++)))}
 function inverse(c,phase,sign){
   let h=new Map([[0,null]]), peak=1;
   for(let i=0;i<c.length;i++){
    const next=new Map();
    for(const [n,prev] of h){
     const p=mod(c[i]-sign*K(phase,i-n));
     if(p!==0&&!next.has(n))next.set(n,{prev,p});
     if(c[i]===0&&!next.has(n+1))next.set(n+1,{prev,p:0});
    }
    if(!next.size)return {prefix:i,peak,endStates:0};
    h=next;peak=Math.max(peak,h.size);
   }
   const [n,node]=h.entries().next().value;const p=[];for(let z=node;z;z=z.prev)p.push(z.p);p.reverse();
   check(eq(send(p,phase,sign,true),c),"replay");
   return {prefix:c.length,peak,endStates:h.size,exampleHolds:n,example:p};
 }
 function ioc(p){const f=Array(29).fill(0);for(const v of p)f[v]++;return f.reduce((s,x)=>s+x*(x-1),0)/(p.length*(p.length-1))}
 const raw=corpus.pages.slice(16,56).flatMap(x=>x.indices);
 const head=corpus.pages[15].indices.slice(20);
 const joined=head.concat(raw);
 check(raw.length===9194&&head.length===139,"source lengths");
 const native=[];const terms=corpus.translit.map((s,i)=>({s,i})).sort((x,y)=>y.s.length-x.s.length);
 for(const w0 of control.toUpperCase().match(/[A-Z]+/g)||[]){const w=w0.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){native.push(21);i+=3;continue}if(w.startsWith("IO",i)){native.push(27);i+=2;continue}const m=terms.find(t=>w.startsWith(t.s,i));check(m,"native token");native.push(m.i);i+=m.s.length}}
 check(native.length>=joined.length,"native length");
 const scores=[],plants=[],allPhase=[];
 for(const [label,c] of [["p15:20-p55",joined],["p16-p55",raw]]){
  const heldOffset=(label.startsWith("p15")?139:0)+corpus.pages.slice(16,40).flatMap(x=>x.indices).length;
  const trainLen=(label.startsWith("p15")?139:0)+1613;
  for(const phase of [0,16])for(const sign of [1,-1]){
   const v=inverse(c,phase,sign);
   const p=c.map((x,i)=>mod(x-sign*K(phase,i)));
   check(eq(send(p,phase,sign,false),c),"ordinary replay");
   scores.push({label,phase,sign,hold:{...v,example:v.example?.slice(0,60)},ordinary:{train:ioc(p.slice(0,trainLen)),held:ioc(p.slice(heldOffset,heldOffset+3008)),all:ioc(p),first80:p.slice(0,80).map(x=>corpus.translit[x]).join(" ")}});
   const truth=native.slice(500,500+c.length);
   const plant=send(truth,phase,sign,true),z=inverse(plant,phase,sign);
   check(z.prefix===plant.length,"plant feasibility");
   plants.push({label,phase,sign,heldStates:z.endStates,firstWitnessMatches:z.example.filter((x,i)=>x===truth[i]).length,length:truth.length,nativeTrain:ioc(truth.slice(0,trainLen)),nativeHeld:ioc(truth.slice(heldOffset,heldOffset+3008))});
  }
  for(const sign of [1,-1]){
   let best=0,bestPhases=[],complete=0;
   for(let phase=1;phase<=period;phase++){
    const z=inverse(c,phase,sign);if(z.prefix===c.length)complete++;
    if(z.prefix>best){best=z.prefix;bestPhases=[phase]}else if(z.prefix===best)bestPhases.push(phase);
   }
   allPhase.push({label,sign,period,complete,best,bestPhases});
  }
 }
 return {period,first16:key.slice(0,16),firstWrapOrdinal:ord.findIndex((x,i)=>i>1&&x<ord[i-1]),scores,plants,allPhase};
}
const c=require("../resources/liber-primus/lp2-corpus.json");
const t=fs.readFileSync(require("node:path").join(__dirname,"../resources/control/gibran_prophet_58585.txt"),"utf8").split(/\r?\n/).slice(0,1600).join("\n");
console.log(JSON.stringify(experiment(c,t),null,2));
