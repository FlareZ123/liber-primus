'use strict';
const fs=require('node:fs');
const paths=["resources/transcriptions/lp2-image-corrected.txt","resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/external/blake-marriage-1906-gutenberg45315.txt","im-results/lp2-wholeword-state-count-output.json"];
function main(inputs){
 const R="ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ";
 const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
 const runs=s=>s.match(new RegExp("["+R+"]+","gu"))||[];
 let physical=0,offset=0,tape="",positions=[],pageTape={};
 for(const ch of inputs[0]){if(ch==="%"){physical++;continue}if(ch==="/"||/\s/u.test(ch))continue;tape+=ch;const page=physical+(physical>=50?1:0);positions.push({page,offset});if(R.includes(ch)){(pageTape[page]??=[]).push(R.indexOf(ch));offset++}}
 for(const p of JSON.parse(inputs[1]).pages)assert(JSON.stringify(pageTape[p.page]||[])===JSON.stringify(p.indices),"page "+p.page);
 const groups=[...tape.matchAll(new RegExp("["+R+"]+","gu"))].map(m=>({w:m[0],...positions[m.index],endPage:positions[m.index+m[0].length-1].page})).filter(g=>g.page<56);
 assert(groups.length===2896&&groups.reduce((a,g)=>a+g.w.length,0)===12956&&groups.filter(g=>g.page!==g.endPage).length===32,"source counts");
 const cuts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956],expected=[158,255,383,437,224,326,378,669,66];
 const scopes=[{name:"all",words:groups.map(g=>g.w)},...expected.map((n,i)=>({name:"chapter"+i,words:groups.filter(g=>g.offset>=cuts[i]&&g.offset<cuts[i+1]).map(g=>g.w)}))];
 assert(scopes.slice(1).every((s,i)=>s.words.length===expected[i]),"chapter counts");
 const dict=new Map(["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"].map((x,i)=>[x,R[i]]));
 function gp(w){return [...w.toUpperCase().replace(/['’]/g,"").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").matchAll(/ING|TH|EO|NG|OE|AE|IA|EA|[A-Z]/g)].map(m=>dict.get(m[0]==="ING"?"NG":m[0])).join("")}
 function english(s){const start=s.search(/\*\*\* START OF/i);if(start>=0)s=s.slice(s.indexOf("\n",start)+1);const end=s.search(/\*\*\* END OF/i);if(end>=0)s=s.slice(0,end);return (s.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)||[]).map(gp)}
 function counts(words){const c=new Map();for(const w of words)c.set(w,(c.get(w)||0)+1);return c}
 function target(words){const c=counts(words),a=[...c.values()].sort((a,b)=>b-a),needed=new Int32Array(words.length+1);let j=0,n=0;
  for(const f of a){j++;for(let k=0;k<f;k++)needed[++n]=j}
  return {c,N:words.length,D:c.size,E:words.length-c.size,P:a.reduce((s,f)=>s+f*(f-1)/2,0),needed}
 }

 // The earlier all-window arbitrary-state bounds are valid lower bounds here.
 const previous=JSON.parse(inputs[7]);
 const native=JSON.parse(inputs[2]).sections.map(s=>({name:s.name,words:runs(s.source_text)}));
 const donors=[...native,{name:"solved-concatenated-descriptive",words:native.flatMap(s=>s.words)},...["Emerson","Gibran","Shakespeare","Blake"].map((name,i)=>({name,words:english(inputs[i+3])}))];
 const donorByName=new Map(donors.map(d=>[d.name,d]));
 const hist=words=>{const h=new Int32Array(words.length+1);for(const f of counts(words).values())h[f]++;return h;};
 const maxIndex=h=>{for(let i=h.length-1;i>=1;i--)if(h[i])return i;return 0;};
 /** @param {Int32Array} h Plain word-frequency histogram. @param {number[]} target Cipher frequency histogram. @param {number} q Maximum used synonyms. */
 function solve(h,target,q){
  const max=maxIndex(h),M=target.length-1,rem=target.slice(),opts=Array.from({length:max+1},()=>[]),forced=[],selected=[],memoForced=new Set(),memoOptional=new Set();
  let nodes=0;
  for(let f=1;f<=max;f++)if(h[f]){
   for(let k=Math.min(f,q);k>=Math.ceil(f/M);k--){
    const lo=Math.floor(f/k),hi=f%k,b=Array(M+1).fill(0);b[lo]=k-hi;if(hi)b[lo+1]=hi;
    if(b.slice(2).every((x,i)=>x<=target[i+2]))opts[f].push({f,k,b});
   }
   if(!opts[f].length)return null;
   if(f>q)for(let j=0;j<h[f];j++)forced.push(f);
  }
  forced.sort((a,b)=>b-a);
  const residual=h.slice();for(const f of forced)residual[f]--;
  const suffix=Array(forced.length+1).fill(0);
  for(let i=forced.length-1;i>=0;i--)suffix[i]=suffix[i+1]+forced[i]-opts[forced[i]][0].k;
  const fits=b=>b.slice(2).every((x,i)=>x<=rem[i+2]);
  const change=(b,sign)=>{for(let j=2;j<=M;j++)rem[j]+=sign*b[j];};
  const empty=()=>rem.slice(2).every(x=>x===0);
  const mass=()=>rem.slice(2).reduce((n,x,i)=>n+x*(i+1),0);
  function optional(){
   nodes++;
   if(empty())return true;
   // A cheap constructive exact shortcut: use individual equal-sized plaintext types.
   if(rem.slice(2).every((x,i)=>x<=(residual[i+2]||0))){
    for(let f=2;f<=M;f++)for(let j=0;j<rem[f];j++)selected.push({f,k:1});
    return true;
   }
   let t=M;while(t>=2&&!rem[t])t--;
   const key=rem.slice(2).join(",")+"|"+Array.from(residual).join(",");
   if(memoOptional.has(key))return false;
   // Every solution must assign this required size-t bin to some remaining type.
   for(let f=t;f<=max;f++)if(residual[f])for(const o of opts[f])if(o.b[t]&&fits(o.b)){
    residual[f]--;change(o.b,-1);selected.push({f,k:o.k});
    if(optional())return true;
    selected.pop();change(o.b,1);residual[f]++;
   }
   memoOptional.add(key);return false;
  }
  function force(i){
   nodes++;
   if(i===forced.length)return optional();
   if(mass()<suffix[i])return false;
   const key=i+"|"+rem.slice(2).join(",");
   if(memoForced.has(key))return false;
   const f=forced[i];
   for(const o of opts[f])if(fits(o.b)){
    change(o.b,-1);selected.push({f,k:o.k});
    if(force(i+1))return true;
    selected.pop();change(o.b,1);
   }
   memoForced.add(key);return false;
  }
  if(!force(0))return null;
  const left=h.slice(),actual=Array(M+1).fill(0),byFrequency={};let maxUsed=0;
  for(const {f,k}of selected){left[f]--;assert(left[f]>=0,"type overdraw");const lo=Math.floor(f/k),hi=f%k;actual[lo]+=k-hi;if(hi)actual[lo+1]+=hi;maxUsed=Math.max(maxUsed,k);byFrequency[f+":"+k]=(byFrequency[f+":"+k]||0)+1;}
  for(let f=1;f<=max;f++)if(left[f]){assert(f<=q,"forced type unassigned");actual[1]+=f*left[f];maxUsed=Math.max(maxUsed,f);byFrequency[f+":"+f]=(byFrequency[f+":"+f]||0)+left[f];}
  assert(actual.slice(1).join(",")===target.slice(1).join(","),"occupancy mismatch "+actual+" vs "+target);
  return{maxUsed,byFrequency,nodes};
 }
 function cipherTarget(words){const h=hist(words);return Array.from(h.slice(0,maxIndex(h)+1));}
 function witness(P,C,q){
  const T=cipherTarget(C),H=hist(P),w=solve(H,T,q);if(!w)return null;
  const byFrequency={};for(const [key,num]of Object.entries(w.byFrequency)){const[f,k]=key.split(":").map(Number);for(let j=0;j<num;j++)(byFrequency[f]??=[]).push(k);}
  const buckets=Array.from({length:T.length},()=>[]);for(const[c,f]of counts(C))buckets[f].push(c);
  const maps=new Map(),next=new Map();for(const[p,f]of counts(P)){const k=byFrequency[f].pop(),lo=Math.floor(f/k),hi=f%k,codes=[];for(let j=0;j<k;j++){const c=buckets[lo+(j<hi?1:0)].pop();assert(c!==undefined,"code bin");codes.push(c);}maps.set(p,codes);next.set(p,0);}
  const generated=P.map(p=>{const a=maps.get(p),j=next.get(p);next.set(p,(j+1)%a.length);return a[j];});
  const c0=counts(C),c1=counts(generated);assert(c0.size===c1.size&&[...c0].every(([c,f])=>c1.get(c)===f),"cyclic generated multiset");
  return {...w,exactGeneratedMultiset:generated.length,distinctCodewords:c0.size};
 }
 // Necessary cheap lower bound, not a new unrestricted state search.
 function lowerOK(h,q,T){let e=0,pairs=0,Et=0,Pt=0;for(let j=2;j<T.length;j++){Et+=(j-1)*T[j];Pt+=j*(j-1)*T[j]/2;}
  for(let f=q+1;f<h.length;f++)if(h[f]){const a=Math.floor(f/q),b=f%q;e+=(f-q)*h[f];pairs+=(q*a*(a-1)/2+a*b)*h[f];if(e>Et||pairs>Pt||a>=T.length)return false;}return true;}
 // Slide only when the previously proven lower-bound witness location fails.
 function scan(d,s,q,skip=-1){const n=s.words.length,c=new Map(),h=new Int32Array(n+1),T=cipherTarget(s.words);let attempted=0;
  function update(w,x){const a=c.get(w)||0,b=a+x;if(a)h[a]--;if(b){h[b]++;c.set(w,b);}else c.delete(w);}
  for(let j=0;j<n;j++)update(d.words[j],1);
  for(let j=0;j+n<=d.words.length;j++){if(j){update(d.words[j-1],-1);update(d.words[j+n-1],1);}if(j===skip||!lowerOK(h,q,T))continue;attempted++;
   if(solve(h,T,q))return {start:j,attempted,witness:witness(d.words.slice(j,j+n),s.words,q)};}
  return{start:null,attempted};}
 function minimum(s,rows){const eligible=rows.filter(d=>d.windows>0).sort((a,b)=>a.min-b.min),lower=eligible[0].min,attempts=[];
  for(let q=lower;q<=s.words.length;q++){
   for(const row of eligible){if(row.min>q)break;const d=donorByName.get(row.name),a=row.firstMinStart,first=witness(d.words.slice(a,a+s.words.length),s.words,q);
    if(first)return {lower,minimum:q,donor:d.name,start:a,attempts,witness:first};
    const b=scan(d,s,q,a);attempts.push({q,donor:d.name,exactTested:b.attempted+1});if(b.start!==null)return {lower,minimum:q,donor:d.name,start:b.start,attempts,witness:b.witness};
   }
  }throw Error("no balanced witness");}
 // Full-book contiguous donor split across private chapter codebooks.
 function jointWitness(d,start,q){let off=start,out=[];for(const s of scopes.slice(1)){const w=witness(d.words.slice(off,off+s.words.length),s.words,q);if(!w)return null;out.push(w);off+=s.words.length;}return out;}
 function jointMinimum(){const rows=previous.jointChapterPrivateContiguousSource.slice().sort((a,b)=>a.min-b.min),lower=rows[0].min,attempts=[];
  for(let q=lower;q<=2896;q++)for(const row of rows){if(row.min>q)break;const d=donorByName.get(row.name),first=jointWitness(d,row.firstMinStart,q);
    if(first)return{lower,minimum:q,donor:d.name,start:row.firstMinStart,attempts,witnesses:first};
    // A sliding per-chapter excess/pair prefilter; exact occupancy is evaluated only when all nine pass.
    const ss=scopes.slice(1),T=ss.map(s=>cipherTarget(s.words)),maps=ss.map(()=>new Map()),H=ss.map(s=>new Int32Array(s.words.length+1)),starts=[];let z=0,attempted=0;
    function update(k,w,x){const a=maps[k].get(w)||0,b=a+x;if(a)H[k][a]--;if(b){H[k][b]++;maps[k].set(w,b);}else maps[k].delete(w);}
    for(let k=0;k<ss.length;k++){starts.push(z);for(let j=0;j<ss[k].words.length;j++)update(k,d.words[z+j],1);z+=ss[k].words.length;}
    for(let i=0;i+2896<=d.words.length;i++){
     if(i)for(let k=0;k<ss.length;k++){update(k,d.words[i-1+starts[k]],-1);update(k,d.words[i-1+starts[k]+ss[k].words.length],1);}
     if(i===row.firstMinStart||H.some((h,k)=>!lowerOK(h,q,T[k])))continue;attempted++;
     if(H.every((h,k)=>solve(h,T[k],q))){const ws=jointWitness(d,i,q);assert(ws,"joint reconstruction");attempts.push({q,donor:d.name,exactTested:attempted+1});return{lower,minimum:q,donor:d.name,start:i,attempts,witnesses:ws};}
    }
    attempts.push({q,donor:d.name,exactTested:attempted+1});
   }throw Error("no joint witness");}
 // Independent positive cyclic plants and brute-force tiny occupancy comparisons.
 let seed=0x2937ba1a;const rng=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*n);};
 let plants=0,bruteTests=0;
 for(let j=0;j<256;j++){
  const n=20+rng(100),q=1+rng(12),P=Array.from({length:n},()=>String(rng(1+Math.floor(n/3)))),map=new Map(),next=new Map();
  for(const [p,f]of counts(P)){const k=1+rng(Math.min(f,q));map.set(p,Array.from({length:k},(_,i)=>p+":"+i));next.set(p,0);}
  const C=P.map(p=>{const a=map.get(p),i=next.get(p);next.set(p,(i+1)%a.length);return a[i];});
  assert(witness(P,C,q),"cyclic plant lost");plants++;
 }
 assert(solve(Int32Array.from([0,0,0,0,0,0,1]),[0,0,1,0,1],6)===null,"unbalanced 4+2 negative");
 // Brute force all allocations for small independently generated plaintext/cipher partitions.
 function brute(freq,T,q,i=0,acc=Array(T.length).fill(0)){if(i===freq.length)return acc.slice(1).join(",")===T.slice(1).join(",");
  const f=freq[i];for(let k=1;k<=Math.min(q,f);k++){const a=Math.floor(f/k),b=f%k;if(a>=T.length||b&&a+1>=T.length)continue;const x=acc.slice();x[a]+=k-b;if(b)x[a+1]+=b;if(x.every((v,j)=>v<=T[j])&&brute(freq,T,q,i+1,x))return true;}return false;}
 for(let j=0;j<256;j++){const n=3+rng(12),P=Array.from({length:n},()=>String(rng(1+rng(5)))),C=Array.from({length:n},()=>String(rng(1+rng(5)))),q=1+rng(6),H=hist(P),T=cipherTarget(C),truth=brute([...counts(P).values()],T,q);assert(Boolean(solve(H,T,q))===truth,"brute mismatch");bruteTests++;}
 const results=scopes.map((s,i)=>({name:s.name,n:s.words.length,target:cipherTarget(s.words),...minimum(s,previous.scopes[i].donors)}));
 const joint=jointMinimum();
 return{source:{groups:2896,runes:12956,carries:32},plants,bruteTests,negative:"single six-frequency plaintext word cannot produce 4+2 balanced bins",results,joint};
}

console.log(JSON.stringify(main(paths.map(p=>fs.readFileSync(p,'utf8'))),null,2));
