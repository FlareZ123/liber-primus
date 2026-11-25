"use strict";
function experiment(raw){
const route=[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12],tokens="F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" ").sort((a,b)=>b.length-a.length);
function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]).map(w=>{let n=0;for(let j=0;j<w.length;){const v=w.startsWith("ING",j)?"ING":w.startsWith("IO",j)?"IO":tokens.find(x=>w.startsWith(x,j));if(!v)throw Error("unmapped "+w);j+=v.length;n++}return n})}
const body=raw[0].split("%").slice(15,23).join("").replace(/[/\s]/g,"").match(/\p{Script=Runic}+/gu).map(w=>w.length);if(body.slice(0,5).reduce((a,b)=>a+b)!==20)throw Error("rubric");body.splice(0,5);const n=body.reduce((a,b)=>a+b);if(n!==1883)throw Error("chapter size "+n);
function mask(l){const m=Array(l.reduce((a,b)=>a+b,0)).fill(0);let k=0;for(const x of l){k+=x;m[k-1]=1}return m}
function lengths(m){const l=[];let k=0;for(const x of m){k++;if(x){l.push(k);k=0}}if(k)throw Error("bad end");return l}
function perm(m,p,inv){const o=m.slice();for(let b=0;b<m.length-1;b+=16){const len=Math.min(16,m.length-1-b),q=p.filter(x=>x<len);for(let i=0;i<len;i++){if(inv)o[b+q[i]]=m[b+i];else o[b+i]=m[b+q[i]]}}return o}
const donors=raw.slice(1).map(native),bins=20,B=x=>Math.min(x,bins)-1;const un=Array(bins).fill(.5),bi=Array.from({length:bins},()=>Array(bins).fill(.5));for(const a of donors){const t=a.slice(0,Math.floor(a.length*.8));for(let j=0;j<t.length;j++){un[B(t[j])]++;if(j)bi[B(t[j-1])][B(t[j])]++}}
const sum=a=>a.reduce((x,y)=>x+y,0),probs=a=>a.map(x=>x/sum(a)),u=probs(un),v=bi.map(probs);
function score(l){return {groups:l.length,ones:l.filter(x=>x===1).length,long:l.filter(x=>x>=10).length,max:Math.max(...l),unigram:l.reduce((s,x)=>s+Math.log(u[B(x)]),0)/l.length,bigram:l.slice(1).reduce((s,x,i)=>s+Math.log(v[B(l[i])][B(x)]),0)/(l.length-1)}}
let state=2724;function rng(){state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296}
const controls=[];for(let d=0;d<donors.length;d++){const a=donors[d],start=Math.floor(a.length*.8);let used=0;for(let i=start;i<a.length&&used<12;i+=100){const l=[];let rem=n,j=i;while(j<a.length&&rem>0){const x=Math.min(a[j++],rem);l.push(x);rem-=x}if(rem||Math.abs(l.length-body.length)>body.length*.05)continue;const m=mask(l),dirs=[false,true].map(enc=>{const scrambled=perm(m,route,enc),restored=perm(scrambled,route,!enc);if(restored.some((x,i)=>x!==m[i]))throw Error("plant inverse");return {scrambled:score(lengths(scrambled)),restored:score(lengths(restored))}});controls.push({donor:d,start:i,...score(l),dirs});used++}}
if(controls.length<12)throw Error("insufficient controls "+controls.length);
const quantile=(a,q)=>a.slice().sort((x,y)=>x-y)[Math.floor((a.length-1)*q)];
const floors={unigram:quantile(controls.map(x=>x.unigram),.05),bigram:quantile(controls.map(x=>x.bigram),.05)};
const original=mask(body),baseline=score(body),results=[false,true].map(inv=>{const m=perm(original,route,inv);if(perm(m,route,!inv).some((x,i)=>x!==original[i]))throw Error("round trip");return {inv,...score(lengths(m))}});
const nulls=[];for(let i=0;i<1000;i++){const p=Array.from({length:16},(_,i)=>i);for(let j=15;j>0;j--){const k=Math.floor(rng()*(j+1));[p[j],p[k]]=[p[k],p[j]]}const s=score(lengths(perm(original,p,false)));nulls.push(s)}
for(const x of results){x.unigramGain=x.unigram-baseline.unigram;x.bigramGain=x.bigram-baseline.bigram;x.nullP=(1+nulls.filter(y=>y.bigram>=x.bigram).length)/1001;x.pass=x.unigram>=floors.unigram&&x.bigram>=floors.bigram&&x.bigramGain>0&&x.nullP<=.025}
return {n,baseline,route,controls,floors,results,nullQuantiles:[.05,.5,.95,.975].map(q=>({q,unigram:quantile(nulls.map(x=>x.unigram),q),bigram:quantile(nulls.map(x=>x.bigram),q)})),gate:"both native 5th percentile floors, positive bigram gain, direction-adjusted one-sided p<=.025",roundTrips:controls.length*2};}
const fs=require("node:fs");
const paths=["resources/transcriptions/lp2-image-corrected.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
