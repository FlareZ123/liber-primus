'use strict';
// Read-only Node 22 SFT. No cipher key fit; conditional checksum-register inference.
const fs=require('node:fs'),path=require('node:path');
function experiment(raw){
 const gp=JSON.parse(raw[0]),grid=JSON.parse(raw[2]),gold=JSON.parse(raw[3]),ix=new Map(gp.runes.map((x,i)=>[x,i]));
 const check=(x,m)=>{if(!x)throw Error(m)},same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),mod=x=>(x%29+29)%29,id=w=>String.fromCharCode(...w);
 const primes=[];for(let n=2;primes.length<3340;n++)if(primes.every(p=>p*p>n||n%p))primes.push(n);
 const shift=primes.map(p=>(p-1)%29);
 check(same(primes.slice(0,29),gp.prime),"GP chart primes");
 const words=[];let pending=[];for(const part of raw[1].split("%").slice(3,8))for(const ch of part){if(ix.has(ch))pending.push(ix.get(ch));else if("-.".includes(ch)&&pending.length){words.push(pending);pending=[]}}if(pending.length)words.push(pending);
 const c=gp.pages[8].indices;check(words.length===255&&c.length===255&&same(words.flat(),gp.pages.slice(3,8).flatMap(p=>p.indices)),"source register");
 const taps=words.slice(-5).map(w=>w.reduce((v,x)=>v*x%29,1));check(same(taps,[11,26,8,15,2]),"red taps");
 const digits=grid.alphabet.replace("f",""),bytes=grid.pages.flatMap(p=>p.tokens).map(t=>59*digits.indexOf(t[0])+digits.indexOf(t[1]));check(bytes.length===256&&bytes.every(v=>v>=0&&v<=251),"radix59");
 let s=[taps[4]%4,0,0,0];function mul(a,b){let v=0;for(let k=0;k<2;k++){if((b>>>k)&1)v^=a;a<<=1;if(a&4)a^=7}return v}
 const addresses=[];const h=c.map(v=>{const a=s.reduce((x,y)=>4*x+y,0);addresses.push(a);const out=(v+bytes[a])%29;const z=s.reduce((x,y,j)=>x^mul(y,taps[j]%4),0);s=[...s.slice(1),z];return out});check(new Set(addresses).size===255&&!addresses.includes(0),"orbit");check(same([[47,240],[48,231],[235,236],[88,179]].map(([i,j])=>[h[i],h[j]]),[[20,20],[8,8],[2,2],[9,9]]),"four conditional collisions");
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function runeWords(t){return [...t.matchAll(/[\u16a0-\u16ff]+/gu)].map(m=>[...m[0]].map(x=>ix.get(x)))}
 function spell(word,alt){const w=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S"),p=[];for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!v)throw Error("unknown token "+w);p.push(v.i);j+=v.t.length}return p}
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>spell(w,true))}
 const donors=raw.slice(4,7).map(native),training=donors.map(w=>w.slice(0,Math.floor(w.length*.8)));
 for(const g of gold.sections)if(!["0_welcome","jpg107-167"].includes(g.name))training.push(runeWords(g.source_text));
 const vocab=new Map(training.flat().filter(w=>w.length<=24).map(w=>[id(w),w]));check(vocab.size===10842,"narrow vocabulary");
 for(const line of raw[7].split(/\r?\n/)){const match=/^([a-z]+) (\d+)$/.exec(line);if(match)for(const alt of [false,true]){const p=spell(match[1],alt);if(p.length<=24)vocab.set(id(p),p)}}for(let i=0;i<29;i++)vocab.set(id([i]),[i]);check(vocab.size===35944,"broad vocabulary");
 const byLength=new Map;for(const p of vocab.values()){if(!byLength.has(p.length))byLength.set(p.length,[]);byLength.get(p.length).push(p)}
 const train=training.flat();
 const freq=new Map;for(const w of train)freq.set(id(w),(freq.get(id(w))||0)+1);
 const tests=[["index-sum",w=>w.reduce((a,x)=>(a+x)%29,0)],["index-prod",w=>w.reduce((a,x)=>a*x%29,1)],["prime-sum",w=>w.reduce((a,x)=>(a+gp.prime[x])%29,0)],["prime-prod",w=>w.reduce((a,x)=>a*gp.prime[x]%29,1)]];
 /** @param {number[][]} a square integer cost matrix */
 function hungarian(a){let n=a.length,u=Array(n+1).fill(0),v=Array(n+1).fill(0),p=Array(n+1).fill(0),way=Array(n+1).fill(0);for(let i=1;i<=n;i++){p[0]=i;let j0=0,minv=Array(n+1).fill(Infinity),used=Array(n+1).fill(false);do{used[j0]=true;let i0=p[j0],delta=Infinity,j1=0;for(let j=1;j<=n;j++)if(!used[j]){let cur=a[i0-1][j-1]-u[i0]-v[j];if(cur<minv[j]){minv[j]=cur;way[j]=j0}if(minv[j]<delta){delta=minv[j];j1=j}}for(let j=0;j<=n;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta}else minv[j]-=delta;j0=j1}while(p[j0]!==0);do{let j1=way[j0];p[j0]=p[j1];j0=j1}while(j0)}let map=Array(n);for(let j=1;j<=n;j++)map[p[j]-1]=j-1;check(new Set(map).size===n&&a.every((row,i)=>row.every((x,j)=>u[i+1]+v[j+1]<=x))&&map.every((j,i)=>u[i+1]+v[j+1]===a[i][j]),"integer assignment dual");return map}
 const lens=words.map(w=>w.length),pools=donors.map(d=>{const a=Array.from({length:25},()=>[]);for(const w of d.slice(Math.floor(d.length*.8)))if(w.length<=24)a[w.length].push(w);return a});
 let seed=0x33012842;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 const sampled=[];for(let d=0;d<3;d++)for(let t=0;t<128;t++){const ws=lens.map(L=>{check(pools[d][L].length,"heldout length pool");return pools[d][L][rng()%pools[d][L].length]});const perm=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){const j=rng()%(i+1);[perm[i],perm[j]]=[perm[j],perm[i]]}sampled.push({d,t,ws,perm})}
 const nulls=Array.from({length:384},()=>lens.map(()=>rng()%29));
 function stats(x){return {n:x.length,min:Math.min(...x),mean:x.reduce((a,b)=>a+b,0)/x.length,max:Math.max(...x)}}
 const output={source:{lengthHistogram:Object.fromEntries([...new Set(lens)].sort((a,b)=>a-b).map(L=>[L,lens.filter(x=>x===L).length])),donorPoolSizes:pools.map(a=>a.map(x=>x.length))},vocab:vocab.size,results:[]};
 for(const [name,f]of tests){
   const counts=Array.from({length:25},()=>Array(29).fill(.5)),tot=Array(25).fill(14.5);
   for(const w of train)if(w.length<=24){counts[w.length][f(w)]++;tot[w.length]++}
   const ll=counts.map((a,L)=>a.map(v=>Math.log(v/tot[L]*29))),scale=1e6;
   const dict=Array.from({length:25},()=>Array.from({length:29},()=>[]));for(const w of vocab.values())dict[w.length][f(w)].push(w);
   for(const row of dict)for(const a of row)a.sort((u,v)=>(freq.get(id(v))||0)-(freq.get(id(u))||0)||id(u).localeCompare(id(v)));
   function score(y,perm=null,idx=lens.map((_,j)=>j)){return idx.reduce((a,j)=>a+ll[lens[j]][perm?perm[y[j]]:y[j]],0)}
   function best(y,idx=lens.map((_,j)=>j)){const m=Array.from({length:29},()=>Array(29).fill(0));for(const i of idx)for(let j=0;j<29;j++)m[y[i]][j]-=Math.round(ll[lens[i]][j]*scale);const p=hungarian(m);const val=score(y,p,idx);return {score:val,upper:val+idx.length/scale,perm:p}}
   function coverage(y,perm){let n=0,single=0,total=0;const candidates=y.map((x,i)=>dict[lens[i]][perm?perm[x]:x]);for(const a of candidates){if(a.length)n++;if(a.length===1)single++;total+=a.length}return {covered:n,unique:single,meanCandidates:total/y.length}}
   function maxCoverage(y){const m=Array.from({length:29},()=>Array(29).fill(0));for(let i=0;i<y.length;i++)for(let j=0;j<29;j++)m[y[i]][j]-=Number(dict[lens[i]][j].length>0);const p=hungarian(m);return coverage(y,p)}
   function fitPredict(y){const even=lens.map((_,i)=>i).filter(i=>!(i&1)),odd=lens.map((_,i)=>i).filter(i=>i&1),a=best(y,even),b=best(y,odd);return score(y,a.perm,odd)+score(y,b.perm,even)}
   const actual=[["raw",c],["conditional-corrected",h]].map(([label,y])=>({label,direct:score(y),optimized:best(y),directCoverage:coverage(y),maxCoverage:maxCoverage(y),crossfit:fitPredict(y)}));
   const controls=sampled.map(({d,t,ws,perm})=>{const truth=ws.map(f),y=truth.map(x=>perm[x]),fit=best(y);let recovered=0,knownMapWordTop1=0;for(let j=0;j<255;j++){if(fit.perm[y[j]]===truth[j])recovered++;if(dict[lens[j]][truth[j]].length&&same(dict[lens[j]][truth[j]][0],ws[j]))knownMapWordTop1++}check(fit.upper+1e-9>=score(truth),"true assignment exceeds certified bound");return {d,t,truth:score(truth),optimized:fit.score,crossfit:fitPredict(y),recovered,knownMapWordTop1}});
   const random=nulls.map(y=>({optimized:best(y).score,crossfit:fitPredict(y)}));
   output.results.push({name,actual,controls:{truth:stats(controls.map(x=>x.truth)),optimized:stats(controls.map(x=>x.optimized)),crossfit:stats(controls.map(x=>x.crossfit)),recovered:stats(controls.map(x=>x.recovered)),knownMapWordTop1:stats(controls.map(x=>x.knownMapWordTop1)),byDonor:[0,1,2].map(d=>stats(controls.filter(x=>x.d===d).map(x=>x.truth)))},nulls:{optimized:stats(random.map(x=>x.optimized)),crossfit:stats(random.map(x=>x.crossfit))},controlRaw:controls,randomRaw:random});
 }
 return output
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/liber-primus/lp2-grid-256.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
