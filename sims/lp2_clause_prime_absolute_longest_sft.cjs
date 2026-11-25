'use strict';
const fs=require('node:fs'),path=require('node:path');
const load=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'));
function longest(gp,gold,gate){
 const C=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),mod=x=>(x%29+29)%29,assert=(v,m)=>{if(!v)throw Error(m)},rmap=new Map(gp.runes.map((r,i)=>[r,i]));
 const target=gate.rows.slice().sort((a,b)=>Math.min(...a.results.map(x=>x.starts))-Math.min(...b.results.map(x=>x.starts))||a.start-b.start)[0];
 assert(target.start===7153&&target.end===7447,"preselected minimum-reachability target");
 const cipher=C.slice(target.start,target.end),bound=gate.scope.bound,cap=bound+cipher.length+2;
 const sieve=new Uint8Array(300000);sieve.fill(1,2);for(let n=2;n*n<sieve.length;n++)if(sieve[n])for(let k=n*n;k<sieve.length;k+=n)sieve[k]=0;
 const primes=[];for(let n=2;n<sieve.length&&primes.length<cap;n++)if(sieve[n])primes.push(n);
 const names=["0_welcome","0_koan_1"];const native=gold.sections.map(s=>({name:s.name,p:[...s.source_text].filter(c=>rmap.has(c)).map(c=>rmap.get(c))}));
 const counts=Array.from({length:30},()=>Array(29).fill(.5));
 for(const s of native.filter(x=>!names.includes(x.name)&&x.name!=="0_wisdom")){let last=29;for(const p of s.p){counts[last][p]++;last=p}}
 const lm=counts.map(row=>{const n=row.reduce((a,b)=>a+b,0);return row.map(x=>Math.log(x/n))});
 const score=p=>p.reduce((z,x,i)=>z+lm[i?p[i-1]:29][x],0)/p.length;
 const fmt=p=>p.map(x=>gp.translit[x]).join(" ");
 const all=(1n<<BigInt(cap))-1n,startMask=(1n<<BigInt(bound+1))-1n;
 function analyze(c,sign,truth=null,truthStart=null){
  const forbid=Array(29).fill(0n);for(let j=0;j<cap;j++)forbid[mod(sign*(primes[j]-1))]|=1n<<BigInt(j);const masks=forbid.map(x=>all^x);
  let legal=all;for(let i=c.length-1;i>=0;i--)legal=((legal>>1n)&masks[c[i]])|(c[i]===0?legal:0n);legal&=startMask;
  const starts=[];for(let b=legal;b;b&=b-1n)starts.push((b&-b).toString(2).length-1);
  let best=null,totalPaths=0n,truthLegal=false;const top=[];
  for(const origin of starts){
   let f=new Map([[origin*30+29,{j:origin,last:29,z:0,p:[],ways:1n}]]);
   for(const x of c){const n=new Map();for(const q of f.values()){const ops=[];if(x===0)ops.push([0,q.j]);const p=mod(x-sign*(primes[q.j]-1));if(p!==0)ops.push([p,q.j+1]);for(const [p,j] of ops){const k=j*30+p,z=q.z+lm[q.last][p],old=n.get(k);if(!old)n.set(k,{j,last:p,z,p:q.p.concat(p),ways:q.ways});else{old.ways+=q.ways;if(z>old.z){old.z=z;old.p=q.p.concat(p)}}}}f=n}
   assert(f.size,"legal start");let local=null;for(const q of f.values()){totalPaths+=q.ways;if(!local||q.z>local.z)local=q}const rec={origin,end:local.j,score:local.z/c.length,p:local.p};let j=origin;const replay=rec.p.map(x=>x===0?0:mod(x+sign*(primes[j++]-1)));assert(j===rec.end&&replay.join()===c.join(),"replay");
   top.push({origin,end:rec.end,score:rec.score,eo:rec.p.filter(x=>x===12||x===22).length});if(!best||rec.score>best.score)best=rec;
   if(truth&&origin===truthStart)truthLegal=true;
  }
  top.sort((a,b)=>b.score-a.score);return {starts:starts.length,totalPaths:totalPaths.toString(),best:{...best,text:fmt(best.p),eo:best.p.filter(x=>x===12||x===22).length},top:top.slice(0,10),truthLegal,truthRecovered:truth?best.p.filter((x,i)=>x===truth[i]).length:null};
 }
 const original=[1,-1].map(sign=>({sign,...analyze(cipher,sign)}));for(const o of original)assert(o.starts===target.results.find(x=>x.sign===o.sign).starts,"start count");
 const controls=[];for(const [i,name] of names.entries()){const p=native.find(x=>x.name===name).p.slice(10,10+cipher.length);assert(p.length===cipher.length,"control length");for(const sign of [1,-1]){const origin=[1033,3301][i];let j=origin;const c=p.map(x=>x===0?0:mod(x+sign*(primes[j++]-1)));const res=analyze(c,sign,p,origin);assert(res.truthLegal,"native origin");controls.push({name,sign,origin,trueScore:score(p),...res})}}
 const windowFloors=names.map(name=>{const p=native.find(x=>x.name===name).p;const values=[];for(let i=0;i+cipher.length<=p.length;i++)values.push(score(p.slice(i,i+cipher.length)));return {name,windows:values.length,min:Math.min(...values),max:Math.max(...values)}});
 return {target,model:{train:native.filter(x=>!names.includes(x.name)&&x.name!=="0_wisdom").map(x=>x.name),alpha:.5,heldout:names},original,controls,windowFloors};
}
console.log(JSON.stringify(longest(load("resources/liber-primus/lp2-corpus.json"),load("resources/external/relikd-solved-gp29-native-v1.json"),load("im-results/lp2-clause-prime-absolute-origin-output.json")),null,2));
