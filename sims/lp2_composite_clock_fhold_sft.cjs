'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
/** @param {any} gp @param {any} gold */
function experiment(gp,gold){
 const mod=x=>(x%29+29)%29,idx=new Map(gp.runes.map((x,i)=>[x,i]));
 const native=gold.sections.map(s=>({name:s.name,p:[...s.source_text].filter(x=>idx.has(x)).map(x=>idx.get(x))}));
 const ranges=[[0,2],[3,7],[8,14],[15,22],[23,27],[28,32],[33,39],[40,53],[54,55]];
 const primes=[],composites=[];
 for(let n=2;Math.min(primes.length,composites.length)<4000;n++){let prime=true;for(const p of primes){if(p*p>n)break;if(n%p===0){prime=false;break}}(prime?primes:composites).push(n);}
 const key=(seq,j,sign)=>mod(sign*(seq[j]-1));
 function enc(p,seq,sign){let j=0;return p.map(x=>x?mod(x+key(seq,j++,sign)):0);}
 function reach(c,seq,sign){let js=new Map([[0,1n]]),peak=1;for(let i=0;i<c.length;i++){const next=new Map(),x=c[i];const add=(j,n)=>next.set(j,(next.get(j)||0n)+n);for(const [j,n] of js){if(!x)add(j,n);if(mod(x-key(seq,j,sign)))add(j+1,n);}if(!next.size)return {legalPrefix:i,peak,paths:"0",states:0,contradiction:x,previous:[...js.keys()]};js=next;peak=Math.max(peak,js.size);}return {legalPrefix:c.length,peak,states:js.size,paths:[...js.values()].reduce((a,b)=>a+b,0n).toString(),end:[...js.keys()]};}
 function decoder(c,seq,sign,name){
 const uni=new Uint32Array(29),bi=new Uint32Array(29*29),bc=new Uint32Array(29),tri=new Uint32Array(29**3),tc=new Uint32Array(29**2);let total=0;
 for(const t of native)if(t.name!==name)for(let i=0;i<t.p.length;i++){const x=t.p[i];uni[x]++;total++;if(i){const b=t.p[i-1];bi[b*29+x]++;bc[b]++;}if(i>1){const z=t.p[i-2]*29+t.p[i-1];tri[z*29+x]++;tc[z]++;}}
 const score=(p,x)=>{const u=(uni[x]+1)/(total+29);if(!p.length)return Math.log(u);const b=p.at(-1),bb=(bi[b*29+x]+5*u)/(bc[b]+5);if(p.length===1)return Math.log(bb);const a=p.at(-2)*29+b;return Math.log((tri[a*29+x]+5*bb)/(tc[a]+5));};
 let states=new Map([["0:",{j:0,p:[],score:0}]]);
 for(const x of c){const next=new Map();for(const t of states.values()){function put(p,j){const v=t.score+score(t.p,p),a=t.p.concat(p),k=j+":"+a.slice(-2).join(),o=next.get(k);if(!o||v>o.score)next.set(k,{j,p:a,score:v});}if(!x)put(0,t.j);const p=mod(x-key(seq,t.j,sign));if(p)put(p,t.j+1);}states=next;if(!states.size)return null;}return [...states.values()].sort((a,b)=>b.score-a.score)[0];
 }
 const p56=native.find(x=>x.name==="p56_an_end").p,c56=gp.pages.find(x=>x.page===56).indices;assert.equal(enc(p56,primes,1).join(),c56.join(),"p56 replay");const p56Reach=reach(c56,primes,1);
 const rows=ranges.map(([a,b])=>{const c=gp.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices);return {range:[a,b],length:c.length,plus:reach(c,composites,1),minus:reach(c,composites,-1)};});
 assert.equal(rows.reduce((n,x)=>n+x.length,0),12956,"chapter lengths");
 const controls=[["0_koan_1",1],["0_loss_of_divinity",-1],["0_welcome",1],["p57_parable",-1]].map(([name,sign])=>{const p=native.find(x=>x.name===name).p,c=enc(p,composites,sign),support=reach(c,composites,sign),rival=reach(c,composites,-sign),out=decoder(c,composites,sign,name);assert.ok(support.states>0,"plant support");assert.ok(out&&enc(out.p,composites,sign).join()===c.join(),"plant replay");return {name,sign,length:p.length,trueF:p.filter(x=>!x).length,visibleZeros:c.filter(x=>!x).length,support,rival,hits:out.p.filter((x,i)=>x===p[i]).length,replay:true};});
 return {firstComposite:composites.slice(0,12),p56Replay:p56.length,p56Reach,rows,controls};
}
if(require.main===module){
 const inputs=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"].map(p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8')));
 console.log(JSON.stringify(experiment(...inputs),null,2));
}
module.exports={experiment};
