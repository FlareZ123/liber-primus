'use strict';
// Source-only original LP2 layered spiral + prime-minus-one F-hold inverse.
// Run from repository root: node sims/lp2_p15_spiral_prime_fhold_allorigin_sft.cjs
const fs = require('node:fs');
const path = require('node:path');
function experiment(A,B){
  const assert=(x,m)=>{if(!x)throw Error(m)};
  const same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  const mod=x=>(x%29+29)%29;
  const perm=[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12], inv=perm.map((_,i)=>perm.indexOf(i));
  const reorder=(xs,p,lead=0)=>{const y=xs.slice();for(let i=lead;i+16<=xs.length;i+=16)for(let j=0;j<16;j++)y[i+j]=xs[i+p[j]];return y};
  const K=[];for(let n=2;K.length<6000;n++){let prime=true;for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break}if(prime)K.push((n-1)%29)}
  const native=s=>[...s.source_text].map(c=>A.runes.indexOf(c)).filter(x=>x>=0);
  const enc=(p,o)=>{let j=o;return p.map(x=>x===0?0:mod(x+K[j++]))};
  const known=native(B.sections.find(s=>s.name==="p56_an_end"));assert(same(enc(known,0),A.pages[56].indices),"authentic p56");
  const raw=A.pages.slice(15,23).flatMap((p,i)=>i===0?p.indices.slice(20):p.indices);assert(raw.length===1883,"original length");
  const train=928;
  // h = number of literal plaintext-F holds in the first i ciphertext positions.
  const reach=(c,o)=>{let row=new Uint8Array(c.length+2), z=0;row[0]=1;for(let i=0;i<c.length;i++){const v=c[i];let any=0;if(v===0){for(let h=z+1;h>=0;h--){const consume=h<=z&&row[h]&&K[o+i-h]!==0;const hold=h>0&&row[h-1];row[h]=consume||hold?1:0;any|=row[h]}z++}else{for(let h=0;h<=z;h++){if(row[h]&&K[o+i-h]===v)row[h]=0;any|=row[h]}}if(!any)return {n:i,states:0}}return {n:c.length,states:row.reduce((s,x)=>s+x,0)}};
  const sweep=(c,cut)=>{let trainOrigins=[],fullOrigins=[],max=0,best=[];for(let o=0;o<=3301;o++){const q=reach(c,o);if(q.n>=cut)trainOrigins.push(o);if(q.n===c.length)fullOrigins.push({o,states:q.states});if(q.n>max){max=q.n;best=[o]}else if(q.n===max)best.push(o)}return {trainOrigins,fullOrigins,max,best}};
  const summarize=s=>({trainCount:s.trainOrigins.length,fullCount:s.fullOrigins.length,max:s.max,best:s.best,fullOrigins:s.fullOrigins});
  const phases=[];for(const [name,p,q] of [["spiral",perm,inv],["inverse",inv,perm]])for(let lead=0;lead<16;lead++){
    const c=reorder(raw,p,lead),cut=lead+Math.floor((train-lead)/16)*16;assert(same(reorder(c,q,lead),raw),"original outer replay");
    phases.push({name,lead,cut,...summarize(sweep(c,cut))});
  }
  const baseline=summarize(sweep(raw,train));
  const donorNames=["0_koan_1","0_loss_of_divinity","jpg107-167","jpg229"];
  const donor=B.sections.filter(s=>donorNames.includes(s.name)).flatMap(native).slice(0,raw.length);
  assert(donor.length===raw.length,"donor length");
  // Separate native language prior. Backoff bigram; no donor sections in training.
  const u=new Float64Array(29).fill(.5), b=Array.from({length:30},()=>new Float64Array(29)), n=new Float64Array(30);
  for(const s of B.sections.filter(s=>!donorNames.includes(s.name))){let last=29;for(const p of native(s)){u[p]++;b[last][p]++;n[last]++;last=p}}
  const total=u.reduce((s,x)=>s+x,0), logp=b.map((row,l)=>Array.from(row,(x,p)=>Math.log((x+5*u[p]/total)/(n[l]+5))));
  const decode=(c,o)=>{let states=new Map([[29,{h:0,last:29,score:0,prev:null,p:null}]]);for(let i=0;i<c.length;i++){const out=new Map();const add=(prev,p,h)=>{const score=prev.score+logp[prev.last][p],key=h*30+p,old=out.get(key);if(!old||score>old.score)out.set(key,{h,last:p,score,prev,p})};for(const s of states.values()){if(c[i]===0)add(s,0,s.h+1);const p=mod(c[i]-K[o+i-s.h]);if(p!==0)add(s,p,s.h)}if(!out.size)return null;states=out}let best=null;for(const s of states.values())if(!best||s.score>best.score)best=s;const score=best.score,p=[];while(best.prev){p.push(best.p);best=best.prev}p.reverse();assert(same(enc(p,o),c),"exact inner replay");return {p,score}};
  const plants=[0,133,1033,3301].map((o,i)=>{const p=i%2?inv:perm,q=i%2?perm:inv,lead=i*5;const outer=reorder(enc(donor,o),q,lead),c=reorder(outer,p,lead),cut=lead+Math.floor((train-lead)/16)*16;
    assert(same(c,enc(donor,o)),"plant outer replay");const s=sweep(c,cut);assert(reach(c,o).n===raw.length,"plant true state");
    const ranked=s.trainOrigins.map(origin=>({origin,score:decode(c.slice(0,cut),origin).score})).sort((a,b)=>b.score-a.score||a.origin-b.origin);
    const chosen=ranked[0].origin, recovered=decode(c,chosen);
    if(recovered)assert(same(reorder(enc(recovered.p,chosen),q,lead),outer),"full plant replay");
    return {origin:o,lead,cut,...summarize(s),chosen,legal:!!recovered,correct:recovered?recovered.p.filter((v,j)=>v===donor[j]).length:null,withheldCorrect:recovered?recovered.p.slice(cut).filter((v,j)=>v===donor[j+cut]).length:null,withheldLength:raw.length-cut};
  });
  return {rawLength:raw.length,train,originalZeros:raw.filter(x=>x===0).length,knownP56:known.length,baseline,phases,plants};
}
const root = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
console.log(JSON.stringify(experiment(read('resources/liber-primus/lp2-corpus.json'), read('resources/external/relikd-solved-gp29-native-v1.json')), null, 2));
