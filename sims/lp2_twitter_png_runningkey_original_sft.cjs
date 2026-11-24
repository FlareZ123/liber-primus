'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const c=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const n=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const key=Array.from(Buffer.from(read('resources/historical/cicada2013-twitter-decoded.png.b64'),'base64'),x=>x%29);
const all=c.pages.slice(0,56).flatMap(p=>p.indices).slice(13), m=x=>(x+29)%29;
assert.equal(key.length,15330);assert.equal(all.length,12943);
const sec=n.sections.map(s=>({name:s.name,p:[...s.source_text].map(x=>c.runes.indexOf(x)).filter(x=>x>=0)}));
const counts=new Float64Array(29**3).fill(.1),tot=new Float64Array(29**2).fill(2.9);
for(const {name,p} of sec)if(!['0_loss_of_divinity','p57_parable'].includes(name))for(let i=2;i<p.length;i++){const j=p[i-2]*29+p[i-1];counts[j*29+p[i]]++;tot[j]++;}
const lp=counts.map((x,i)=>Math.log(x/tot[Math.floor(i/29)]));
function score(p){let a=0;for(let i=2;i<p.length;i++)a+=lp[(p[i-2]*29+p[i-1])*29+p[i]];return a/(p.length-2);}
function ordinary(a,o,s){return a.map((x,i)=>m(x-s*key[o+i]));}
function ordinaryBest(a){let best=null;for(const s of [1,-1])for(let o=0;o+a.length<=key.length;o++){const sc=score(ordinary(a,o,s));if(!best||sc>best.score)best={o,s,score:sc};}return best;}
/** All legal latent plaintext-F paths; no language pruning. */
function reach(a,o,s){let js=[o],i=0;for(const v of a){const next=new Set();for(const j of js){if(v===0)next.add(j);if(j<key.length&&m(v-s*key[j])!==0)next.add(j+1);}if(!next.size)break;js=[...next];i++;}return {n:i,js};}
/** MAP conditional trigram path, exact merging by key position and last two plaintext runes. */
function vit(a,o,s){let states=new Map([[o*900+899,{j:o,a:29,b:29,score:0,path:''}]]);for(let i=0;i<a.length;i++){const v=a[i],next=new Map();function add(st,p,j){const score=st.score+(i>=2?lp[(st.a*29+st.b)*29+p]:0),id=j*900+st.b*30+p;if(!next.has(id)||next.get(id).score<score)next.set(id,{j,a:st.b,b:p,score,path:st.path+String.fromCharCode(65+p)});}for(const st of states.values()){if(v===0)add(st,0,st.j);if(st.j<key.length){const p=m(v-s*key[st.j]);if(p!==0)add(st,p,st.j+1);}}if(!next.size)return null;states=next;}let best=null;for(const st of states.values())if(!best||st.score>best.score)best=st;return best;}
const stats=[];
for(const s of [1,-1]){let best=0,bestO=[],live249=0,live716=0;for(let o=0;o<key.length;o++){const n=reach(all.slice(0,716),o,s).n;if(n>=249)live249++;if(n===716)live716++;if(n>best){best=n;bestO=[o];}else if(n===best)bestO.push(o);}stats.push({s,best,bestO,live249,live716});}
assert.deepEqual(stats,[{s:1,best:716,bestO:[8004,11799,14434],live249:1100,live716:3},{s:-1,best:698,bestO:[263,264,265],live249:1149,live716:0}]);
const candidates=stats[0].bestO.map(o=>{const re=reach(all,o,1),v=vit(all.slice(0,716),o,1);return {o,reach:re.n,end:re.js,score:v.score/714,opening:[...v.path.slice(0,60)].map(x=>c.translit[x.charCodeAt(0)-65]).join(' ')};});
assert.deepEqual(candidates.map(x=>x.reach),[761,732,824]);
const ob=ordinaryBest(all.slice(0,249));assert.deepEqual([ob.o,ob.s],[2806,1]);
const ordinaryHeld=score(ordinary(all.slice(249,716),ob.o+249,ob.s));
const donor=sec.find(x=>x.name==='0_loss_of_divinity').p;
const oc=donor.map((p,i)=>m(p-key[1103+i]));
const ocb=ordinaryBest(oc.slice(0,249));assert.deepEqual([ocb.o,ocb.s],[1103,-1]);
assert.deepEqual(ordinary(oc.slice(249),ocb.o+249,ocb.s),donor.slice(249));
let j=1103;const cipher=donor.map(p=>p===0?0:m(p-key[j++]));
let best=null,legal=0;
for(const s of [1,-1])for(let o=0;o<key.length;o++){if(reach(cipher.slice(0,249),o,s).n!==249)continue;legal++;const v=vit(cipher.slice(0,249),o,s);if(!best||v.score>best.score)best={o,s,score:v.score};}
const full=vit(cipher,best.o,best.s);assert.ok(full);
const match=[...full.path].reduce((n,x,i)=>n+(x.charCodeAt(0)-65===donor[i]),0),withheld=[...full.path.slice(249)].reduce((n,x,i)=>n+(x.charCodeAt(0)-65===donor[i+249]),0);
assert.equal(legal,9076);assert.deepEqual([best.o,best.s,match,withheld],[1104,-1,729,506]);
assert.equal(reach(cipher,1103,-1).n,755);
console.log(JSON.stringify({stats,candidates,ordinary:{...ob,held:ordinaryHeld},control:{ordinary:ocb,legal,best,match,withheld,n:donor.length,score:full.score/(donor.length-2),native:score(donor),p57:score(sec.find(x=>x.name==='p57_parable').p)}},null,2));
