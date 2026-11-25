"use strict";
const fs=require("node:fs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json"];
const cuts=[0,3,8,15,23,27,33,40,54,56];
const mod=x=>(x%29+29)%29;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const assert=(v,m)=>{if(!v)throw Error(m)};
const cmp=(a,b)=>a<b?-1:a>b?1:0;
/** Stable LF mapping and cycle decomposition; keys must share a total order. */
function lf(keys){const order=keys.map((_,i)=>i).sort((i,j)=>cmp(keys[i],keys[j])||i-j),p=[];order.forEach((i,j)=>p[i]=j);let seen=new Set(),cs=[];for(let i=0;i<p.length;i++){if(seen.has(i))continue;let j=i,c=[];do{seen.add(j);c.push(j);j=p[j]}while(j!==i);cs.push(c)}return {p,cs}}
function cyclicForward(gs,key){let a=gs.map(key),n=a.length,rows=a.map((_,i)=>i).sort((i,j)=>{for(let k=0;k<n;k++){let d=cmp(a[(i+k)%n],a[(j+k)%n]);if(d)return d}return i-j});return {last:rows.map(i=>gs[(i+n-1)%n]),primary:rows.indexOf(0)}}
function cyclicInverse(gs,key,row){let {p}=lf(gs.map(key)),out=Array(gs.length);for(let i=gs.length-1;i>=0;i--){out[i]=gs[row];row=p[row]}return out}
/** @param {number[]} a */
function lyndon(a){let out=[],i=0;while(i<a.length){let j=i+1,k=i;while(j<a.length&&a[k]<=a[j]){k=a[k]<a[j]?i:k+1;j++}let d=j-k;while(i<=k){out.push(a.slice(i,i+d));i+=d}}return out}
function lex(a,b){for(let i=0;i<Math.min(a.length,b.length);i++)if(a[i]!==b[i])return a[i]-b[i];return a.length-b.length}
/** @param {number[]} a */
function bbwt(a){const rows=[];for(const f of lyndon(a))for(let i=0;i<f.length;i++)rows.push({f,i});rows.sort((a,b)=>{for(let k=0;k<a.f.length+b.f.length;k++){let d=a.f[(a.i+k)%a.f.length]-b.f[(b.i+k)%b.f.length];if(d)return d}return 0});return rows.map(({f,i})=>f[(i+f.length-1)%f.length])}
/** @param {number[]} L */
function unbbwt(L){let {cs}=lf(L),factors=[];for(const c of cs){let f=c.map(i=>L[i]).reverse(),min=f;for(let k=1;k<f.length;k++){let r=f.slice(k).concat(f.slice(0,k));if(lex(r,min)<0)min=r}factors.push(min)}factors.sort((a,b)=>-lex(a,b));return {tape:factors.flat(),lengths:factors.map(f=>f.length)}}
function experiment(raw){
const A=JSON.parse(raw[0]),B=JSON.parse(raw[2]),ix=new Map(A.runes.map((r,i)=>[r,i]));
let groups=[],w=[],sep="";for(const c of raw[1]){if(ix.has(c)){if(w.length&&/[-.&]/u.test(sep)){groups.push(w);w=[]}w.push(ix.get(c));sep=""}else sep+=c}if(w.length)groups.push(w);
const target=A.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
assert(same(groups.flat().slice(0,target.length),target),"source mismatch");
let n=0,orig=[];for(const w of groups){if(n>=target.length)break;assert(n+w.length<=target.length,"clipped");orig.push(w);n+=w.length}
assert(n===12956&&orig.length===2896,"counts");
const blocks=[];for(let i=0;i<9;i++){let lo=A.pages.filter(p=>p.page<cuts[i]).reduce((s,p)=>s+p.indices.length,0),hi=A.pages.filter(p=>p.page<cuts[i+1]).reduce((s,p)=>s+p.indices.length,0),g=[],o=0;for(const w of orig){if(o>=lo&&o+w.length<=hi)g.push(w);else assert(!(o<hi&&o+w.length>lo),"clipped chapter");o+=w.length}blocks.push({lo:cuts[i],hi:cuts[i+1]-1,g,L:target.slice(lo,hi)})}blocks.push({lo:0,hi:55,g:orig,L:target});
const keys={lex:w=>w.map(x=>String.fromCharCode(65+x)).join(""),primeSum:w=>w.reduce((a,x)=>a+A.prime[x],0),primeProduct:w=>w.reduce((a,x)=>a*BigInt(A.prime[x]),1n)};
const controls=B.sections.map(s=>({name:s.name,g:s.source_text.match(/[\u16a0-\u16ff]+/gu).map(w=>[...w].map(c=>ix.get(c)))}));
const groupControls=[],groupOriginal=[];
for(const [m,key] of Object.entries(keys)){for(const s of controls){const f=cyclicForward(s.g,key),c=lf(f.last.map(key)).cs,r=cyclicInverse(f.last,key,f.primary);assert(c.length===1&&same(r,s.g)&&same(cyclicForward(r,key).last,f.last),"group control "+m+" "+s.name);groupControls.push({m,name:s.name,n:s.g.length})}for(const b of blocks){const cs=lf(b.g.map(key)).cs,cycles=cs.map(c=>c.length).sort((a,b)=>a-b);assert(cycles[0]!==cycles.at(-1),"unexpected equal length: investigate");groupOriginal.push({lo:b.lo,hi:b.hi,m,n:b.g.length,cycles})}}
const K=[];for(let n=2;K.length<13000;n++){let p=true;for(let d=2;d*d<=n;d++)if(n%d===0){p=false;break}if(p)K.push((n-1)%29)}
const enc=p=>{let j=0;return p.map(x=>x===0?0:mod(x+K[j++]))};
/** Exact reachable hold-count states at each observed symbol; no language heuristic. */
function reachable(c){let row=new Uint8Array(c.length+2),z=0;row[0]=1;for(let i=0;i<c.length;i++){let any=0,v=c[i];if(v===0){for(let h=z+1;h>=0;h--){row[h]=((h<=z&&row[h]&&K[i-h]!==0)||(h>0&&row[h-1]))?1:0;any|=row[h]}z++}else{for(let h=0;h<=z;h++){if(row[h]&&K[i-h]===v)row[h]=0;any|=row[h]}}if(!any)return i}return c.length}
let toys=0;for(let n=1;n<=7;n++)for(let z=0;z<3**n;z++){let q=z,a=Array.from({length:n},()=>{let v=q%3;q=Math.floor(q/3);return v});assert(same(unbbwt(bbwt(a)).tape,a),"toy inverse");assert(same(bbwt(unbbwt(a).tape),a),"toy replay");toys++}
const bbControls=[];for(const s of controls){let p=s.g.flat(),c=enc(p),L=bbwt(c),r=unbbwt(L);assert(same(r.tape,c)&&same(bbwt(r.tape),L)&&reachable(r.tape)===c.length,"BBWT control "+s.name);bbControls.push({name:s.name,n:p.length,factors:r.lengths})}
assert(same(enc(controls.find(s=>s.name==="p56_an_end").g.flat()),A.pages[56].indices),"authentic p56 replay");
const bbOriginal=blocks.map(b=>{const r=unbbwt(b.L);assert(same(bbwt(r.tape),b.L),"original BBWT replay");return {lo:b.lo,hi:b.hi,n:b.L.length,factors:r.lengths,reachable:reachable(r.tape)}});

// Complete-group BBWT, sorting by the whole encrypted GP29 token.
// Compress the finite token order into integer ranks without changing comparisons.
function groupTransform(gs,inverse){const keys=gs.map(keysFn),dict=Array.from(new Set(keys)).sort(),map=new Map(dict.map((x,i)=>[x,i])),ranks=keys.map(k=>map.get(k));const a=inverse?unbbwt(ranks).tape:bbwt(ranks);return a.map(i=>[...dict[i]].map(c=>c.charCodeAt(0)-65))}
const keysFn=keys.lex;
function groupEncrypt(gs){let j=0;return gs.map(w=>w.map(x=>x===0?0:mod(x+K[j++])))}
const groupBBControls=controls.map(s=>{const c=groupEncrypt(s.g),L=groupTransform(c,false),r=groupTransform(L,true);assert(same(r,c)&&same(groupTransform(r,false),L)&&reachable(r.flat())===r.flat().length,"group BBWT control");return {name:s.name,groups:s.g.length,runes:s.g.flat().length}});
const groupBBOriginal=blocks.map(b=>{const r=groupTransform(b.g,true);assert(same(groupTransform(r,false),b.g),"group BBWT replay");return {lo:b.lo,hi:b.hi,groups:b.g.length,runes:r.flat().length,reachable:reachable(r.flat())}});

return {groupControls,groupOriginal,toys,bbControls,bbOriginal,groupBBControls,groupBBOriginal}}
if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
module.exports={experiment,bbwt,unbbwt};
