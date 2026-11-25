'use strict';
// Exact all-key necessary capacity bounds for fixed q8 BASE29 addition.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
const files=paths.map(p=>fs.readFileSync(path.join(root,p),'utf8'));
function main(corpus, texts){
 const assert=(ok,msg)=>{if(!ok)throw Error(msg||"assertion failed")};
 const mod=(x,b)=>((x%b)+b)%b;
 const q=8,b=29,regions=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 const tapes=regions.map(([lo,hi])=>corpus.pages.slice(lo,hi+1).flatMap(p=>p.indices));
 const full=tapes.flat();assert(full.length===12956);assert(tapes[8].length===308);
 const E=x=>+(x===18), rare=x=>+(x===11||x===12);
 /** For each phase, sort lower suffixes lexicographically, using a terminal symbol greater than every digit. Optimize all 29 current digits and all possible suffix thresholds independently. */
 function cutBound(a,q,b,score,sign){
  const n=a.length;const cmp=(i,j)=>{if(i===j)return 0;while(i<n&&j<n){if(a[i]!==a[j])return a[i]-a[j];i++;j++}return i===n?1:-1};
  let total=0;const phases=[];
  for(let p=0;p<q;p++){const ix=[];for(let i=p;i<n;i+=q)ix.push(i);ix.sort((i,j)=>cmp(i+1,j+1));let best=-Infinity;
   for(let k=0;k<b;k++){let z=0;for(const i of ix)z+=sign*score(mod(a[i]-k,b));best=Math.max(best,z);
    for(const i of ix){if(i===n-1)break;z+=sign*(score(mod(a[i]-k-1,b))-score(mod(a[i]-k,b)));best=Math.max(best,z)}
   }total+=best;phases.push(sign*best);
  }return {bound:sign*total,phases};
 }
 /** Exact optimization of a relaxed cycle of pair factors; lower-suffix comparison is resolved from the next digit when unequal, otherwise grant either borrow state. */
 function pairBound(a,q,b,score,sign){
  const matrices=Array.from({length:q},()=>new Int32Array(b*b));
  for(let i=0;i<a.length;i++){const M=matrices[i%q];for(let k=0;k<b;k++){const s0=sign*score(mod(a[i]-k,b)),s1=sign*score(mod(a[i]-k-1,b));for(let l=0;l<b;l++){M[k*b+l]+=i+1===a.length||a[i+1]>l?s0:a[i+1]<l?s1:Math.max(s0,s1)}}}
  let best=-Infinity,winner=null;
  for(let first=0;first<b;first++){let dp=Array(b).fill(-Infinity);dp[first]=0;let trace=[];
   for(let p=0;p<q-1;p++){let next=Array(b).fill(-Infinity),prev=Array(b).fill(-1);const M=matrices[p];for(let k=0;k<b;k++)for(let l=0;l<b;l++){const v=dp[k]+M[k*b+l];if(v>next[l]){next[l]=v;prev[l]=k}}trace.push(prev);dp=next}
   for(let last=0;last<b;last++){const z=dp[last]+matrices[q-1][last*b+first];if(z>best){best=z;winner=[last];for(let p=trace.length-1;p>=0;p--)winner.unshift(trace[p][winner[0]])}}
  }return {bound:sign*best,key:winner};
 }
 function enc(a,key,b){let carry=0,c=Array(a.length);for(let i=a.length-1;i>=0;i--){let z=a[i]+key[i%key.length]+carry;c[i]=z%b;carry=Math.floor(z/b)}return c}
 function dec(a,key,b){let borrow=0,p=Array(a.length);for(let i=a.length-1;i>=0;i--){let z=a[i]-key[i%key.length]-borrow;p[i]=mod(z,b);borrow=+(z<0)}return p}
 function calc(a){return {n:a.length,cutE:cutBound(a,q,b,E,1).bound,cutRare:cutBound(a,q,b,rare,-1).bound,pairE:pairBound(a,q,b,E,1).bound,pairRare:pairBound(a,q,b,rare,-1).bound}}
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(input,calibrated){const cleaned=input.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const out=[];for(const word of cleaned.match(/[A-Z]+/g)||[]){for(let i=0;i<word.length;){if(calibrated&&word.startsWith("ING",i)){out.push(21);i+=3;continue}if(calibrated&&word.startsWith("IO",i)){out.push(27);i+=2;continue}const t=tokens.find(t=>word.startsWith(t.s,i));assert(t);out.push(t.i);i+=t.s.length}}return out}
 const regs=texts.flatMap((s,i)=>[false,true].map(mode=>({source:i,mode,a:native(s,mode)})));
 assert(JSON.stringify(regs.map(t=>t.a.length))===JSON.stringify([63114,62492,218800,217106,324630,321327]),"control lengths");
 function controls(n){let minE=Infinity,maxRare=-Infinity,windows=0;for(const {a} of regs){let e=0,r=0;for(let i=0;i<n;i++){e+=E(a[i]);r+=rare(a[i])}for(let i=0;i+n<=a.length;i++){if(i){e+=E(a[i+n-1])-E(a[i-1]);r+=rare(a[i+n-1])-rare(a[i-1])}minE=Math.min(minE,e);maxRare=Math.max(maxRare,r);windows++}}return {minE,maxRare,windows}}
 let seed=3301;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed};
 let toys=0;for(const B of [3,4,5])for(const Q of [2,3,4])for(let t=0;t<12;t++){const a=Array.from({length:9+rng()%13},()=>rng()%B);const score=x=>+(x===1||x===2);let max=-1,min=Infinity;for(let k=0;k<B**Q;k++){let v=k,key=[];for(let j=0;j<Q;j++){key.push(v%B);v=Math.floor(v/B)}let p=dec(a,key,B);assert(enc(p,key,B).every((x,i)=>x===a[i]));let s=p.reduce((z,x)=>z+score(x),0);max=Math.max(max,s);min=Math.min(min,s)}assert(cutBound(a,Q,B,score,1).bound>=max);assert(cutBound(a,Q,B,score,-1).bound<=min);assert(pairBound(a,Q,B,score,1).bound>=max);assert(pairBound(a,Q,B,score,-1).bound<=min);toys++}
 let plants=[];for(let t=0;t<6;t++){const a=regs[t].a.slice(1000+t*137,1000+t*137+729),key=Array.from({length:8},()=>rng()%29),c=enc(a,key,b);assert(dec(c,key,b).every((x,i)=>x===a[i]));const bounds=calc(c),actualE=a.reduce((s,x)=>s+E(x),0),actualRare=a.reduce((s,x)=>s+rare(x),0);assert(bounds.cutE>=actualE&&bounds.pairE>=actualE&&bounds.cutRare<=actualRare&&bounds.pairRare<=actualRare);plants.push({source:t,n:a.length,actualE,actualRare,...bounds})}
 const results=tapes.map((a,i)=>({region:regions[i],...calc(a),...controls(a.length)}));
 const book={...calc(full),...controls(full.length)};const body={...calc(tapes[8].slice(9)),...controls(299)};
 assert(book.minE===1397&&book.maxRare===83&&book.windows===1129739);
 return {definition:"ordinary chapter-local periodic BASE29 integer addition, most-significant first, no F bypass",book,chapterPrivate:{cutE:results.reduce((s,x)=>s+x.cutE,0),cutRare:results.reduce((s,x)=>s+x.cutRare,0),pairE:results.reduce((s,x)=>s+x.pairE,0),pairRare:results.reduce((s,x)=>s+x.pairRare,0)},results,terminalBody:body,exhaustiveToyCases:toys,plants};
}
console.log(JSON.stringify(main(JSON.parse(files[0]),files.slice(1)),null,2));
