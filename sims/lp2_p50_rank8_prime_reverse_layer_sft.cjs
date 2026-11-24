'use strict';
// Run from repository root: node sims/lp2_p50_rank8_prime_reverse_layer_sft.cjs
const fs=require('node:fs');
const path=require('node:path');
function reverseLayer(A,G,B){
 const assert=(x,m)=>{if(!x)throw Error(m)},same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]),mod=x=>(x%29+29)%29;
 const perms=Array.from({length:32},(_,r)=>Array.from({length:8},(_,i)=>i).sort((a,b)=>G.bytes[8*r+a]-G.bytes[8*r+b])),inv=perms.map(p=>p.map((_,i)=>p.indexOf(i)));
 const reorder=(x,ps,offset=0)=>{assert(x.length%8===0&&offset%8===0,"full rows");return x.map((_,i)=>x[(i&~7)+ps[Math.floor((offset+i)/8)%32][i%8]])};
 const K=[];for(let n=2;K.length<4000;n++){let ok=true;for(let d=2;d*d<=n;d++)if(n%d===0){ok=false;break}if(ok)K.push((n-1)%29)}
 const native=s=>[...s.source_text].map(c=>A.runes.indexOf(c)).filter(x=>x>=0);
 const enc=(p,o)=>{let j=o;return p.map(x=>x===0?0:mod(x+K[j++]))};
 const real=native(B.sections.find(s=>s.name==="p56_an_end"));assert(same(enc(real,0),A.pages[56].indices),"actual p56");
 const raw=A.pages.slice(51,54).flatMap(p=>p.indices).slice(0,512),donorNames=["0_koan_1","0_loss_of_divinity"],counts=Array.from({length:30},()=>new Float64Array(29).fill(.5));
 for(const s of B.sections.filter(s=>!donorNames.includes(s.name))){let last=29;for(const p of native(s)){counts[last][p]++;last=p}}
 const lp=counts.map(row=>{const t=row.reduce((a,b)=>a+b,0);return Array.from(row,x=>Math.log(x/t))});
 const score=(p,last=29)=>{let total=0;for(const x of p){total+=lp[last][x];last=x}return total};
 const enumerate=(c,o,visit)=>{let p=new Uint8Array(c.length),count=0;function walk(i,j){if(i===c.length){count++;visit(Array.from(p),j);return}let v=c[i],x=mod(v-K[j]);if(v===0){p[i]=0;walk(i+1,j)}if(x!==0){p[i]=x;walk(i+1,j+1)}}walk(0,o);return count};
 const reach=(c,o)=>{let row=new Uint8Array(c.length+2);row[0]=1;let z=0;for(let i=0;i<c.length;i++){let any=0,v=c[i];if(v===0){for(let h=z+1;h>=0;h--){row[h]=+(!!((h<=z&&row[h]&&K[o+i-h]!==0)||(h>0&&row[h-1])));any|=row[h]}z++}else{for(let h=0;h<=z;h++){if(row[h]&&K[o+i-h]===v)row[h]=0;any|=row[h]}}if(!any)return false}return true};
 const preview=p=>p.map(x=>A.translit[x]).join("");
 const fit=(c,p,q)=>{let best=null,origins=0,paths=0;const head=c.slice(0,256),tail=c.slice(256);for(let o=0;o<=3301;o++){if(!reach(head,o))continue;origins++;paths+=enumerate(head,o,(u,j)=>{const v=reorder(u,p),s=score(v);if(!best||s>best.score)best={o,j,p:v,score:s}})}
 let hold=null,continuations=0;if(best){continuations=enumerate(tail,best.j,u=>{const v=reorder(u,p,256),s=score(v,best.p.at(-1));if(!hold||s>hold.score)hold={p:v,score:s}})}
 if(hold)assert(same(enc(reorder(best.p.concat(hold.p),q),best.o),c),"frozen prefix full replay");
 return {origins,paths,chosen:best?{origin:best.o,endClock:best.j,score:best.score/256,p:best.p}:null,continuations,hold:hold?{score:hold.score/256,p:hold.p}:null}};
 const orig=[["rank",perms,inv],["inverse-rank",inv,perms]].map(([name,p,q])=>{let fullOrigins=[],fullPaths=0,best=null;for(let o=0;o<=3301;o++){if(!reach(raw,o))continue;fullOrigins.push(o);fullPaths+=enumerate(raw,o,u=>{const v=reorder(u,p),s=score(v);if(!best||s>best.score){assert(same(enc(reorder(v,q),o),raw),"original replay");best={o,score:s,p:v}}})}const f=fit(raw,p,q);return {name,fullOrigins,fullPaths,best:best?{origin:best.o,score:best.score/512,text:preview(best.p),indices:best.p}:null,prefix:{origins:f.origins,paths:f.paths,chosen:f.chosen?{origin:f.chosen.origin,endClock:f.chosen.endClock,score:f.chosen.score,preview:preview(f.chosen.p)}:null,continuations:f.continuations,hold:f.hold?{score:f.hold.score,preview:preview(f.hold.p)}:null}}});
 const plants=donorNames.map((n,i)=>{let p=i?inv:perms,q=i?perms:inv,o=[133,1033][i],donor=native(B.sections.find(s=>s.name===n)).slice(0,512),c=enc(reorder(donor,q),o),f=fit(c,p,q);return {n,origin:o,chosen:f.chosen?.origin,origins:f.origins,paths:f.paths,continuations:f.continuations,prefixCorrect:f.chosen?.p.filter((v,i)=>v===donor[i]).length,withheldCorrect:f.hold?.p.filter((v,i)=>v===donor[i+256]).length??null,heldoutScore:f.hold?.score??null}});
 return {orig,plants,rawLength:raw.length};
}
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
console.log(JSON.stringify(reverseLayer(read('resources/liber-primus/lp2-corpus.json'),read('resources/liber-primus/lp2-grid-256.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
