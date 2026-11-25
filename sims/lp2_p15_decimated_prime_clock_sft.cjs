'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(gp,gold){
 const assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29,idx=new Map(gp.runes.map((x,i)=>[x,i]));
 const native=gold.sections.map(s=>({name:s.name,p:[...s.source_text].filter(x=>idx.has(x)).map(x=>idx.get(x))}));
 const original=gp.pages.filter(p=>p.page>=16&&p.page<=22).flatMap(p=>p.indices), primes=[];
 for(let n=2;primes.length<16*(original.length+1);n++){let prime=true;for(const p of primes){if(p*p>n)break;if(n%p===0){prime=false;break}}if(prime)primes.push(n);}
 const key=(j,r,s)=>mod(primes[s*j+r-1]-1);
 function enc(p,r,s,j=0){return p.map(x=>x?mod(x+key(j++,r,s)):0);}
 const p56=native.find(x=>x.name==="p56_an_end").p;assert(enc(p56,1,1).join()===gp.pages.find(x=>x.page===56).indices.join(),"p56 replay");
 function reach(c,r,s=16,start=0){
  let js=new Set([start]),last=0,peak=1;
  for(let i=0;i<c.length;i++){const next=new Set(),x=c[i];for(const j of js){if(!x)next.add(j);if(mod(x-key(j,r,s)))next.add(j+1);}if(!next.size)return {lane:r,legalPrefix:last,states:0,peak,end:[]};js=next;last=i+1;peak=Math.max(peak,js.size);}
  return {lane:r,legalPrefix:last,states:js.size,peak,end:[...js].sort((a,b)=>a-b)};
 }
 function decoder(c,r,s,name,starts=[0]){
  const uni=new Uint32Array(29),bi=new Map(),tri=new Map(),ctx=new Map();let total=0;
  for(const t of native)if(t.name!==name){for(let i=0;i<t.p.length;i++){const x=t.p[i];uni[x]++;total++;if(i>0){const a=t.p[i-1]*29+x;bi.set(a,(bi.get(a)||0)+1);}if(i>1){const a=t.p[i-2]*29+t.p[i-1];ctx.set(a,(ctx.get(a)||0)+1);tri.set(a*29+x,(tri.get(a*29+x)||0)+1);}}}
  const score=(p,x)=>{const base=(uni[x]+1)/(total+29);if(!p.length)return Math.log(base);const b=p.at(-1),bb=((bi.get(b*29+x)||0)+5*base)/(uni[b]+5);if(p.length===1)return Math.log(bb);const a=p.at(-2)*29+b;return Math.log(((tri.get(a*29+x)||0)+5*bb)/((ctx.get(a)||0)+5));};
  let states=new Map(starts.map(j=>[String(j),{j,p:[],score:0}]));
  for(const x of c){const next=new Map();for(const t of states.values()){function put(p,j){const v=t.score+score(t.p,p),a=t.p.concat(p),k=j+":"+a.slice(-2).join(),o=next.get(k);if(!o||v>o.score)next.set(k,{j,p:a,score:v});}if(!x)put(0,t.j);const p=mod(x-key(t.j,r,s));if(p)put(p,t.j+1);}states=next;if(!states.size)return null;}
  return [...states.values()].sort((a,b)=>b.score-a.score)[0];
 }
 const prefix=864, lanes=Array.from({length:16},(_,i)=>i+1);
 const origRows=lanes.map(r=>reach(original.slice(0,prefix),r));
 const surviving=origRows.filter(x=>x.states>0);
 const controlSpecs=[["0_koan_1",3,450],["0_loss_of_divinity",11,450],["0_welcome",16,360]];
 const controls=controlSpecs.map(([name,lane,n])=>{
  const p=native.find(x=>x.name===name).p,c=enc(p,lane,16),rows=lanes.map(r=>reach(c.slice(0,n),r));
  const legal=rows.filter(x=>x.states>0);const ranked=legal.map(x=>({lane:x.lane,fit:decoder(c.slice(0,n),x.lane,16,name)})).filter(x=>x.fit).sort((a,b)=>b.fit.score-a.fit.score);
  const winner=ranked[0],frozen=decoder(c.slice(n),winner.lane,16,name,[winner.fit.j]);
  const pred=frozen?.p||[], full=winner.fit.p.concat(pred);
  return {name,lane,fit:n,held:c.length-n,visibleZeros:c.filter(x=>x===0).length,trueF:p.filter(x=>x===0).length,surviving:legal.map(x=>x.lane),winner:winner.lane,fitHits:winner.fit.p.filter((x,i)=>x===p[i]).length,heldHits:pred.filter((x,i)=>x===p[n+i]).length,replay:full.length===p.length&&enc(full,winner.lane,16).join()===c.join(),ranked:ranked.map(x=>({lane:x.lane,score:x.fit.score/n}))};
 });
 const continuation=surviving.map(x=>({lane:x.lane,result:reach(original.slice(prefix),x.lane,16,x.end[0]),allReach:x.end.map(j=>reach(original.slice(prefix),x.lane,16,j))}));
 return {p56Replay:p56.length,originalLength:original.length,originalPrefix:prefix,origRows,controls,continuation};
}
const inputs=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"].map(p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8')));
console.log(JSON.stringify(experiment(...inputs),null,2));
