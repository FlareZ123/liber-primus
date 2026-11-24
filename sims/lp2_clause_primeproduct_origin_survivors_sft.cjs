'use strict';
const fs=require('node:fs'),path=require('node:path');
function exhaustSurvivors(corpus,transcript,gold){
 const M=3301,mod=x=>(x%29+29)%29,idx=new Map(corpus.runes.map((r,i)=>[r,i]));
 const C=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),periods=[],tape=[],groups=[];let pos=0,groupStart=0;
 for(const ch of transcript.split("%").slice(0,55).join("%")){
   if(idx.has(ch)){tape.push(idx.get(ch));pos++;}
   else if(ch==="."||ch==="-"||ch==="&"||ch==="$"){if(pos>groupStart){groups.push([groupStart,pos]);groupStart=pos;}if(ch==="."&&periods.at(-1)!==pos)periods.push(pos);}
 }
 if(pos>groupStart)groups.push([groupStart,pos]);
 if(pos!==12956||periods.length!==173||!tape.every((x,i)=>x===C[i]))throw Error("source");
 const primes=[];for(let n=2;primes.length<M+C.length;n++){let ok=true;for(const p of primes){if(p*p>n)break;if(n%p===0){ok=false;break;}}if(ok)primes.push(n);}
 const K=primes.map(p=>(p-1)%29),gp=corpus.prime;
 const native=gold.sections.map(s=>({name:s.name,clauses:s.source_text.split("⁜").slice(1).join("⁜").split("⁘").map(t=>[...t].filter(x=>idx.has(x)).map(x=>idx.get(x))).filter(x=>x.length)}));
 function model(exclude){const ct=Array.from({length:30},()=>Array(29).fill(.5));for(const s of native)if(s.name!==exclude)for(const p of s.clauses){let last=29;for(const x of p){ct[last][x]++;last=x;}}return ct.map(row=>{const z=row.reduce((a,b)=>a+b);return row.map(x=>Math.log(x/z));});}
 function score(p,m){let v=0;for(const cl of p){let last=29;for(const x of cl){v+=m[last][x];last=x;}}return v;}
 const nativeRare=native.map(s=>({name:s.name,n:s.clauses.flat().length,rare:s.clauses.flat().filter(x=>x===12||x===22).length,score:score(s.clauses,model(s.name))/s.clauses.flat().length}));
 const vocabulary=new Set();for(const s of gold.sections)for(const w of s.source_text.split(/[^ᚠ-ᛠ]+/u)){const p=[...w].map(x=>idx.get(x));if(p.length&&p.every(Number.isInteger))vocabulary.add(p.join(","));}
 function clause(c,s){
   const result=[],p=[];
   function dfs(i,j,sum){
     if(i===c.length){result.push({s:s*sum%M,p:[...p]});return;}
     if(c[i]===0){p.push(0);dfs(i+1,j,(sum+gp[0])%M);p.pop();}
     const x=mod(c[i]-K[j]);if(x!==0){p.push(x);dfs(i+1,j+1,(sum+gp[x])%M);p.pop();}
   }
   dfs(0,s,0);return result;
 }
 const result=[];
 for(const [page,start,end,expected] of [[0,13,729,466],[54,12657,12956,8]]){
   const cuts=[start,...periods.filter(x=>x>start&&x<=end)],cs=cuts.slice(1).map((x,i)=>C.slice(cuts[i],x));
   if(cuts.at(-1)!==end)throw Error("incomplete");
   let paths=Array.from({length:M},(_,s)=>({seed:s,s,p:[]}));
   for(const c of cs){const cache=new Map(),next=[];for(const x of paths){if(!cache.has(x.s))cache.set(x.s,clause(c,x.s));for(const y of cache.get(x.s))next.push({seed:x.seed,s:y.s,p:[...x.p,y.p]});}paths=next;}
   if(paths.length!==expected)throw Error("all-path count mismatch");
   const m=model(null),localGroups=groups.filter(([a,b])=>a>=start&&b<=end&&b-a>=5);
   const rows=paths.map(x=>{
     let s=x.seed;for(let i=0;i<x.p.length;i++){let j=s,sum=0;const c=x.p[i].map(z=>{sum=(sum+gp[z])%M;return z===0?0:mod(z+K[j++]);});if(c.join()!==cs[i].join())throw Error("replay");s=s*sum%M;}
     if(s!==x.s)throw Error("state replay");
     const p=x.p.flat(),freq=Array(29).fill(0);for(const z of p)freq[z]++;
     const matches=localGroups.filter(([a,b])=>vocabulary.has(p.slice(a-start,b-start).join(","))).length;
     return {seed:x.seed,next:x.s,score:score(x.p,m)/p.length,rare:freq[12]+freq[22],ioc:freq.reduce((a,n)=>a+n*(n-1),0)/(p.length*(p.length-1)),nativeLongGroupMatches:matches,text:x.p.map(cl=>cl.map(z=>corpus.translit[z]).join("")).join(". ")};
   });
   rows.sort((a,b)=>b.score-a.score);
   result.push({page,start,end,completePaths:rows.length,distinctInitialSeeds:new Set(rows.map(x=>x.seed)).size,longGroups:localGroups.length,minRare:Math.min(...rows.map(x=>x.rare)),maxIoc:Math.max(...rows.map(x=>x.ioc)),maxNativeLongGroupMatches:Math.max(...rows.map(x=>x.nativeLongGroupMatches)),best:rows.slice(0,3),minRareCandidate:rows.reduce((a,b)=>a.rare<=b.rare?a:b)});
 }
 return {nativeRare,vocabularySize:vocabulary.size,result};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json"];
const a=paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(exhaustSurvivors(JSON.parse(a[0]),a[1],JSON.parse(a[2])),null,2));
