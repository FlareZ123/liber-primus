'use strict';
const fs=require('node:fs');
function run(a,s) {
const mod=(x,m)=>(x%m+m)%m;
const rmap=new Map(a.runes.map((r,i)=>[r,i]));
const native=s.sections.map(x=>({name:x.name,p:[...x.source_text].filter(r=>rmap.has(r)).map(r=>rmap.get(r))}));
const p57=s.sections.find(x=>x.name==="p57_parable"),P=native.find(x=>x.name==="p57_parable").p;
const sums=p57.source_text.split(/[⁜⁘]/).map(x=>[...x].filter(r=>rmap.has(r)).reduce((v,r)=>v+a.prime[rmap.get(r)],0)).filter(Boolean);
const prime=n=>n>=2&&Array.from({length:Math.max(0,Math.floor(Math.sqrt(n))-1)},(_,i)=>i+2).every(d=>n%d);
const Q=Array.from({length:sums[3]-sums[2]+1},(_,i)=>sums[2]+i).filter(prime);
if(sums.join()!=="449,1259,1031,1229"||Q.length!==29||P.length!==95)throw Error("source mismatch");
const K=Q.map(q=>mod(q-1,29)),R=Q.map(q=>mod(q-1,28));
const mono=new Float64Array(29).fill(.5),bi=Array.from({length:29},()=>new Float64Array(29).fill(.5));
for(const n of native.filter(x=>x.name!=="p57_parable"))for(let i=0;i<n.p.length;i++){mono[n.p[i]]++;if(i)bi[n.p[i-1]][n.p[i]]++}
const total=mono.reduce((a,b)=>a+b,0),log=(p,q)=>q===-1?Math.log(mono[p]/total):Math.log((bi[q][p]+8*mono[p]/total)/(bi[q].reduce((a,b)=>a+b,0)+8));
const score=p=>p.reduce((z,v,i)=>z+log(v,i?p[i-1]:-1),0)/p.length;
function fhold(C,phase,sign){let states=new Map([[phase*30+29,{j:phase,last:-1,v:0,trace:[]}]]);for(let i=0;i<C.length;i++){const ns=new Map();for(const t of states.values()){const add=(p,j)=>{const id=j*30+p,v=t.v+log(p,t.last),old=ns.get(id);if(!old||old.v<v)ns.set(id,{j,last:p,v,trace:[...t.trace,p]})};if(!C[i])add(0,t.j);const p=mod(C[i]-sign*K[t.j],29);if(p)add(p,(t.j+1)%29)}states=ns;if(!states.size)return {prefix:i,complete:false}}
const b=[...states.values()].sort((a,b)=>b.v-a.v)[0];return {prefix:C.length,complete:true,score:b.v/C.length,trace:b.trace}}
function rank(C,phase,sign){let j=phase;return C.slice(1).map((c,i)=>{const d=mod(c-C[i],29);if(!d)return 0;const p=1+mod(d-1-sign*R[j],28);j=(j+1)%29;return p})}
function rankenc(p,iv,phase,sign){const c=[iv];let j=phase;for(const v of p){let d=0;if(v){d=1+mod(v-1+sign*R[j],28);j=(j+1)%29}c.push(mod(c[c.length-1]+d,29))}return c}
const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55],[55,55]];
const results=ranges.map(([lo,hi])=>{const C=a.pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices);let legalPrefix=0,complete=0,best={score:-Infinity},bestRank={score:-Infinity};for(const sign of [1,-1])for(let phase=0;phase<29;phase++){const ordinary=C.map((c,i)=>mod(c-sign*K[(phase+i)%29],29)),o=score(ordinary);if(o>best.score)best={score:o,phase,sign,clock:"ordinary"};const f=fhold(C,phase,sign);legalPrefix=Math.max(legalPrefix,f.prefix);if(f.complete){complete++;if(f.score>best.score)best={score:f.score,phase,sign,clock:"Fhold"}}const p=rank(C,phase,sign),v=score(p);if(rankenc(p,C[0],phase,sign).join()!==C.join())throw Error("rank replay");if(v>bestRank.score)bestRank={score:v,phase,sign}}return {lo,hi,n:C.length,legalPrefix,complete,best,bestRank}});
let j=0;const fc=P.map(p=>{if(!p)return 0;const c=mod(p+K[j],29);j=(j+1)%29;return c});
const fh=fhold(fc,0,1);const rc=rankenc(P,7,11,1);let bestControl={score:-Infinity};for(const sign of [1,-1])for(let phase=0;phase<29;phase++){const p=rank(rc,phase,sign),v=score(p);if(v>bestControl.score)bestControl={score:v,phase,sign,correct:p.filter((x,i)=>x===P[i]).length}}
return {sums,Q,K,R,distinct:new Set(K).size,nativeScore:score(P),results,controls:{Fhold:fh.trace.filter((x,i)=>x===P[i]).length,rank:bestControl}};
}
const a=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8')),s=JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8'));
console.log(JSON.stringify(run(a,s),null,2));
