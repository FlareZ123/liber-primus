"use strict";
/** Exact BigInt cardinality comparison for punctuation-class side channels.
 * Conditional universal GP29 input domain; no inference of author intent.
 * Run: node sims/lp2_no_repeat_punctuation_identity_capacity_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const read = p => fs.readFileSync(path.resolve(__dirname,"..",p),"utf8");
function audit(tx,c,ink){
  const check=(x,m)=>{if(!x)throw Error(m)};
  const choose=(n,k)=>{if(k<0||k>n)return 0n;let a=1n;for(let i=1;i<=Math.min(k,n-k);i++)a=a*BigInt(n-i+1)/BigInt(i);return a};
  const multi=counts=>{let n=counts.reduce((s,x)=>s+x,0),a=1n;for(const x of counts){a*=choose(n,x);n-=x}return a};
  const prod=arr=>arr.reduce((a,b)=>a*b,1n),sum=arr=>arr.reduce((a,b)=>a+b,0);
  const log=x=>{const s=x.toString(2),b=Math.min(53,s.length);return s.length-1+Math.log2(Number.parseInt(s.slice(0,b),2)/2**(b-1))};
  const bits=(a,b)=>{const q=(a+b-1n)/b;return q<=1n?0:(q-1n).toString(2).length};
  const merge=arr=>{const h={};for(const a of arr)for(const [k,v] of Object.entries(a))h[k]=(h[k]??0)+v;return h};
  const fine=h=>prod([false,true].map(dot=>multi(Object.entries(h).filter(([k])=>k.includes(".")===dot).map(([,v])=>v))));
  const count=(q,heads,t,k)=>BigInt(q)**BigInt(heads)*Array.from({length:k+1},(_,j)=>choose(t,j)*BigInt(q-1)**BigInt(t-j)).reduce((a,b)=>a+b,0n);
  const pages=tx.split("%").slice(0,55).map((s,i)=>{
    const p=i<50?i:i+1,a=c.pages.find(x=>x.page===p).indices,b=s.match(/[\u16a0-\u16ff]/gu);
    check(b.length===a.length&&b.every((x,j)=>x===c.runes[a[j]]),"rune mismatch "+p);
    const h={};for(const g of s.split(/[\u16a0-\u16ff]/gu).slice(1,-1).map(g=>[...g].filter(x=>".-&$§".includes(x)).join("")).filter(Boolean))h[g]=(h[g]??0)+1;
    const d=ink.pages.find(x=>x.page===p)??{},red=sum((d.red_spans??[]).map(x=>x.length)),spans=(d.red_spans??[]).length,marks=(d.large_punctuation??[]).length;
    return {p,n:a.length,k:a.slice(1).filter((x,j)=>x===a[j]).length,h,red,spans,marks};
  });
  const n=sum(pages.map(x=>x.n)),t=n-pages.length,k=sum(pages.map(x=>x.k)),h=merge(pages.map(x=>x.h)),red=sum(pages.map(x=>x.red)),spans=sum(pages.map(x=>x.spans)),marks=sum(pages.map(x=>x.marks));
  check(n===12956&&t===12901&&k===86&&red===213&&spans===16&&marks===31,"source totals");
  const U=29n**BigInt(n),G=count(29,pages.length,t,k),P=prod(pages.map(p=>count(29,1,p.n-1,p.k))),I=2n**BigInt(red+2*marks),B=2n**BigInt(spans+2*marks),L=2n**55n;
  const FG=fine(h),FP=prod(pages.map(p=>fine(p.h))),TG=multi(Object.values(h)),TP=prod(pages.map(p=>multi(Object.values(p.h))));
  const scenarios=[
    ["global fine labels, designated red sites",G*FG*I],
    ["global fine labels, span-level ink plus 55 binary line residuals",G*FG*B*L],
    ["page quotas, per-page fine label counts, generous ink",P*FP*I],
    ["page quotas, per-page fine labels, generous ink plus 55 binary line residuals",P*FP*I*L],
    ["global quota, joint recovery of arbitrary same-inventory fine labels, generous ink",G*I],
    ["global quota, joint label recovery, generous ink plus 55 binary line residuals",G*I*L],
    ["page quotas, joint label recovery, generous ink plus 55 binary line residuals",P*I*L]
  ].map(([name,C])=>({name,deficitBits:log(U)-log(C),additionalBinaryBits:bits(U,C),impossible:C<U}));
  const perPage=pages.map(p=>{const u=29n**BigInt(p.n),g=count(29,1,p.n-1,p.k),i=2n**BigInt(p.red+2*p.marks),fineC=g*i*fine(p.h),fullC=g*i*multi(Object.values(p.h));return {page:p.p,fineBits:bits(u,fineC),allTypeBits:bits(u,fullC)}});
  const toys=[];for(let len=2;len<=6;len++)for(let quota=0;quota<len;quota++){let observed=0n;for(let x=0;x<3**len;x++){let v=x,prev=-1,repeats=0;for(let j=0;j<len;j++){const a=v%3;v=Math.floor(v/3);if(a===prev)repeats++;prev=a}if(repeats<=quota)observed++}check(observed===count(3,1,len-1,quota),"toy count");toys.push([len,quota])}
  check(FG>0n&&FP>0n&&FG>=FP&&TG>=TP&&TG>=FG&&TP>=FP,"carrier monotonicity");
  check(scenarios[0].impossible===false&&scenarios.slice(1,5).every(s=>s.impossible),"expected gate");
  return {source:{n,t,k,h,red,spans,marks},carrierBits:{globalFine:log(FG),perPageFine:log(FP),globalAllTypes:log(TG),perPageAllTypes:log(TP)},sourceDeficitBits:{global:log(U)-log(G),pageQuotas:log(U)-log(P)},scenarios,perPage:{fineFailures:perPage.filter(x=>x.fineBits).map(x=>x.page),allTypeFailures:perPage.filter(x=>x.allTypeBits).map(x=>x.page),fineIndependentExtraBits:sum(perPage.map(x=>x.fineBits)),allTypeIndependentExtraBits:sum(perPage.map(x=>x.allTypeBits))},toyCounts:toys.length};
}
console.log(JSON.stringify(audit(read("resources/transcriptions/lp2-image-corrected.txt"), JSON.parse(read("resources/liber-primus/lp2-corpus.json")), JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"))),null,2));
