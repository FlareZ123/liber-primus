'use strict';
// Run from repository root with Node.js 22: node sims/lp2_p50_rank8_prime_fhold_original_sft.cjs
const fs=require('node:fs');
const path=require('node:path');
function experiment(A,G,B){
 const assert=(x,m)=>{if(!x)throw Error(m)},same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]),mod=x=>(x%29+29)%29;
 const tokens=G.pages.flatMap(p=>p.tokens),alphabet=G.alphabet,decodeTable=(radix,abc)=>tokens.map(t=>radix*abc.indexOf(t[0])+abc.indexOf(t[1]));
 const V60=decodeTable(60,alphabet),V59=decodeTable(59,alphabet.replace("f",""));
 assert(same(V60,G.bytes),"canonical bytes");
 const orders=v=>Array.from({length:32},(_,r)=>Array.from({length:8},(_,i)=>i).sort((a,b)=>v[8*r+a]-v[8*r+b]));
 const perms=orders(V60),inv=perms.map(p=>p.map((_,i)=>p.indexOf(i)));
 assert(JSON.stringify(perms)===JSON.stringify(orders(V59)),"radix-invariant row order");
 assert(perms.every((p,r)=>new Set(V60.slice(8*r,8*r+8)).size===8),"each row distinct");
 const reorder=(x,ps)=>{assert(x.length%8===0,"full rows");return x.map((_,i)=>x[(i&~7)+ps[Math.floor(i/8)%32][i%8]])};
 const K=[];for(let n=2;K.length<4000;n++){let ok=true;for(let d=2;d*d<=n;d++)if(n%d===0){ok=false;break}if(ok)K.push((n-1)%29)}
 const native=s=>[...s.source_text].map(c=>A.runes.indexOf(c)).filter(x=>x>=0);
 const enc=(p,o)=>{let j=o;return p.map(x=>x===0?0:mod(x+K[j++]))};
 const real=native(B.sections.find(s=>s.name==="p56_an_end"));assert(same(enc(real,0),A.pages[56].indices),"authentic p56 replay");
 const raw=A.pages.slice(51,54).flatMap(p=>p.indices).slice(0,512);assert(raw.length===512,"two full table cycles");
 const reach=(c,o)=>{let row=new Uint8Array(c.length+2);row[0]=1;let z=0;for(let i=0;i<c.length;i++){let any=0,v=c[i];if(v===0){for(let h=z+1;h>=0;h--){row[h]=+(!!((h<=z&&row[h]&&K[o+i-h]!==0)||(h>0&&row[h-1])));any|=row[h]}z++}else{for(let h=0;h<=z;h++){if(row[h]&&K[o+i-h]===v)row[h]=0;any|=row[h]}}if(!any)return i}return c.length};
 const sweep=c=>{let prefix=[],full=[],max=0,best=[];for(let o=0;o<=3301;o++){const n=reach(c,o);if(n>=256)prefix.push(o);if(n===512)full.push(o);if(n>max){max=n;best=[o]}else if(n===max)best.push(o)}return {prefix,full,max,best}};
 const donorNames=["0_koan_1","0_loss_of_divinity"],counts=Array.from({length:30},()=>new Float64Array(29).fill(.5));
 for(const s of B.sections.filter(s=>!donorNames.includes(s.name))){let last=29;for(const p of native(s)){counts[last][p]++;last=p}}
 const lp=counts.map(row=>{const t=row.reduce((a,b)=>a+b,0);return Array.from(row,x=>Math.log(x/t))});
 const bestPath=(c,o)=>{let states=new Map([[29,{h:0,last:29,score:0,prev:null}]]);for(let i=0;i<c.length;i++){let next=new Map();const add=(s,p,h)=>{let score=s.score+lp[s.last][p],id=30*h+p,old=next.get(id);if(!old||score>old.score)next.set(id,{h,last:p,score,prev:s})};for(const s of states.values()){if(c[i]===0)add(s,0,s.h+1);const p=mod(c[i]-K[o+i-s.h]);if(p!==0)add(s,p,s.h)}if(!next.size)return null;states=next}let s=[...states.values()].reduce((a,b)=>a.score>b.score?a:b),score=s.score,p=[];while(s.prev){p.push(s.last);s=s.prev}p.reverse();assert(same(enc(p,o),c),"inner replay");return {p,score}};
 const cases=[["baseline",null,null],["rank",perms,inv],["inverse-rank",inv,perms]];
 const orig=cases.map(([name,p,q])=>{const c=p?reorder(raw,p):raw;if(p)assert(same(reorder(c,q),raw),"outer replay");const s=sweep(c);const ranked=s.prefix.map(o=>({o,score:bestPath(c.slice(0,256),o).score})).sort((a,b)=>b.score-a.score||a.o-b.o);const chosen=ranked[0],decoded=chosen?bestPath(c,chosen.o):null;
 return {name,...s,chosen:chosen??null,decoded:decoded?{score:decoded.score/512,text:decoded.p.map(x=>A.translit[x]).join("")}:null,allFullTexts:s.full.map(o=>{const d=bestPath(c,o);return {o,score:d.score/512,preview:d.p.slice(0,80).map(x=>A.translit[x]).join("")}})}});
 const plants=donorNames.map((n,i)=>{const donor=native(B.sections.find(s=>s.name===n)).slice(0,512),o=[133,1033][i],p=i?inv:perms,q=i?perms:inv,cipher=reorder(enc(donor,o),q),c=reorder(cipher,p);assert(same(c,enc(donor,o)),"plant outer");const s=sweep(c);assert(s.full.includes(o),"planted true origin retained");const ranked=s.prefix.map(o=>({o,score:bestPath(c.slice(0,256),o).score})).sort((a,b)=>b.score-a.score||a.o-b.o);const chosen=ranked[0].o,d=bestPath(c,chosen);if(d)assert(same(reorder(enc(d.p,chosen),q),cipher),"complete planted replay");return {n,origin:o,chosen,prefixCount:s.prefix.length,fullCount:s.full.length,correct:d?d.p.filter((x,j)=>x===donor[j]).length:null,withheldCorrect:d?d.p.slice(256).filter((x,j)=>x===donor[j+256]).length:null}});
 return {rawLength:raw.length,zeroCount:raw.filter(x=>x===0).length,perms,orig,plants,p56:real.length};
}
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
console.log(JSON.stringify(experiment(read('resources/liber-primus/lp2-corpus.json'),read('resources/liber-primus/lp2-grid-256.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
