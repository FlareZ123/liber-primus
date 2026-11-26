'use strict';
// Agent9: MTF rank-phase capacity, read-only Node22 CommonJS.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
function experiment(inputs){
const corpus=JSON.parse(inputs[0]), C=corpus.pages.slice(0,56).flatMap(p=>p.indices), N=C.length;
const check=(ok,msg)=>{if(!ok)throw Error(msg)};
check(N===12956&&corpus.pages[50].indices.length===0,"original source");
const tokens=corpus.translit.map((t,i)=>[t,i]).sort((a,b)=>b[0].length-a[0].length);
function gp(t){t=t.toUpperCase().replaceAll("V","U").replaceAll("K","C");const o=[];for(let i=0;i<t.length;){const x=tokens.find(([v])=>t.startsWith(v,i));if(x){o.push(x[1]);i+=x[0].length}else i++}return o}
const cr=gp(inputs.slice(1,4).join("\n")),raw=inputs[4],bl=gp(raw.slice(raw.indexOf("THE ARGUMENT"),raw.indexOf("*** END OF THIS PROJECT GUTENBERG EBOOK")));
check(cr.length===21611&&bl.length===18631,"donor registers");
const ds=[cr.slice(0,N),cr.slice(4327,4327+N),cr.slice(8655,8655+N),bl.slice(0,N),bl.slice(5675,5675+N)];
const primes=[];for(let n=2;primes.length<N;n++){let ok=true;for(const p of primes){if(p*p>n)break;if(n%p===0){ok=false;break}}if(ok)primes.push(n)}
const pages=corpus.pages.slice(0,56),cum=[0];for(const p of pages)cum.push(cum.at(-1)+p.indices.length);
const cuts=[0,3,8,15,23,27,33,40,54,56].map(i=>cum[i]);
const identity=Array.from({length:29},(_,i)=>i), secret=identity.map(i=>(7*i+3)%29);
const mod=x=>((x%29)+29)%29;
/** @param {number[]} x @param {string} mode @param {number[]} initial @param {boolean} masked */
function mtf(x,mode,initial=identity,masked=true){const L=initial.slice(),seen=new Set();let j=0;return x.map(p=>{const v=mode==="plain"?p:mode==="hold"&&p===0?0:(p+primes[j++]-1)%29;const k=L.indexOf(v);L.splice(k,1);L.unshift(v);const z=masked&&!seen.has(v)?-1:k;seen.add(v);return z})}
function inverseRanks(ranks,initial){const L=initial.slice();return ranks.map(k=>{const v=L[k];L.splice(k,1);L.unshift(v);return v})}
function frames(x,spans,fn){return spans.slice(1).flatMap((e,j)=>fn(x.slice(spans[j],e)))}
function diff(x){return x.map((v,i)=>i===0?-1:mod(v-x[i-1]))}
/** Per-segment and phase counts, optionally pool phases across segments. */
function hists(x,q,spans,shared){const result=Array.from({length:shared?1:spans.length-1},()=>new Uint32Array(q*29));for(let j=1;j<spans.length;j++){const s=spans[j-1],e=spans[j],h=result[shared?0:j-1];for(let i=s;i<e;i++)if(x[i]>=0)h[((i-s)%q)*29+x[i]]++}return result}
function pairs(h){let n=0;for(const v of h)n+=v*(v-1)/2;return n}
/** Exact sum of per-(segment,phase) lower bounds; and maximum local excess over observed zero counts. */
function zeroTest(d,o,q){let total=0,obs=0,max=0;for(let s=0;s<d.length;s++)for(let phase=0;phase<q;phase++){let min=Infinity;for(let v=0;v<29;v++)min=Math.min(min,d[s][phase*29+v]);const z=o[s][phase*29];total+=min;obs+=z;max=Math.max(max,min-z)}return {total,obs,max}}
const output={N,cuts,donorLengths:[cr.length,bl.length],modes:["plain","prime","hold"],controls:[],runs:[]};
// Real literary controls, unknown initial list and non-affine per-phase maps. The entire rank-to-delta receiver is invertible.
// For the hold variant only the known intermediate is recovered; F ambiguity is intentionally not resolved by this gate.
for(const mode of output.modes){const p=ds[0],q=13,known=mtf(p,mode,identity,true),ranks=mtf(p,mode,secret,false),perm=Array.from({length:q},(_,k)=>identity.map(i=>mod((i*7+3+k))));for(const row of perm)[row[0],row[17]]=[row[17],row[0]];
check(known.every((v,i)=>v===-1||v===ranks[i]),"first-access invariant");let c=11;const enc=ranks.map((v,i)=>c=mod(c+perm[i%q][v]));const recovered=enc.map((v,i)=>perm[i%q].indexOf(mod(v-(i?enc[i-1]:11))));check(recovered.every((v,i)=>v===ranks[i]),"rank replay");const s=inverseRanks(recovered,secret);let j=0;check(s.every((v,i)=>v===(mode==="plain"?p[i]:mode==="hold"&&p[i]===0?0:(p[i]+primes[j++]-1)%29)),"intermediate replay");const observed=hists(diff(enc),q,[0,N],false),d=hists(known,q,[0,N],false);check(zeroTest(d,observed,q).max===0,"true phase key wrongly excluded");check(d.reduce((n,h)=>n+pairs(h),0)<=observed.reduce((n,h)=>n+pairs(h),0),"true pair gate");output.controls.push({mode,q,exactRanks:N,exactIntermediate:N,firstAccesses:known.filter(v=>v<0).length})}
for(const [frame,spans,shared] of [["global",[0,N],false],["chapter-private",cuts,false],["chapter-shared",cuts,true]]){const delta=frames(C,spans,diff);const zeros=delta.filter(v=>v===0).length;const controls={};for(const mode of output.modes)controls[mode]=ds.map(x=>frames(x,spans,t=>mtf(t,mode)));
const rows=[];for(let q=1;q<=256;q++){const o=hists(delta,q,spans,shared),direct=hists(C,q,spans,shared),oPairs=o.reduce((n,h)=>n+pairs(h),0),directPairs=direct.reduce((n,h)=>n+pairs(h),0),m={};for(const mode of output.modes){const d=controls[mode].map(x=>hists(x,q,spans,shared));const z=d.map(h=>zeroTest(h,o,q));m[mode]={pairMin:Math.min(...d.map(h=>h.reduce((n,h)=>n+pairs(h),0))),zeroMin:Math.min(...z.map(v=>v.total)),zeroMax:Math.max(...z.map(v=>v.total)),localDeficitMin:Math.min(...z.map(v=>v.max)),localDeficitMax:Math.max(...z.map(v=>v.max)),donorsExcludedByLocal:z.filter(v=>v.max>0).length}}rows.push({q,oPairs,directPairs,...m})}
function summary(predicate){const good=rows.filter(predicate).map(x=>x.q);return {count:good.length,firstMiss:rows.find(x=>!predicate(x))?.q??null,lastPass:good.at(-1)??null,passing:good}}
output.runs.push({frame,zeros,plainDelta:summary(x=>x.plain.pairMin>x.oPairs),plainDirect:summary(x=>x.plain.pairMin>x.directPairs),primeZeroTotal:summary(x=>x.prime.zeroMin>zeros),holdZeroTotal:summary(x=>x.hold.zeroMin>zeros),primeZeroLocal:summary(x=>x.prime.localDeficitMin>0),holdZeroLocal:summary(x=>x.hold.localDeficitMin>0),minPairGap:Math.min(...rows.map(x=>x.plain.pairMin-x.oPairs)),rows})}
return output}
const inputs=["resources/liber-primus/lp2-corpus.json","resources/external/2013-book-of-law-I.txt","resources/external/2013-book-of-law-II.txt","resources/external/2013-book-of-law-III.txt","resources/external/cicada2012-blake-marriage-gutenberg45315.txt"];
console.log(JSON.stringify(experiment(inputs.map(p=>fs.readFileSync(path.join(root,p),'utf8'))),null,2));
