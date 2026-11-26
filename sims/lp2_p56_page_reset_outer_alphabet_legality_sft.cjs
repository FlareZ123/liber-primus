'use strict';
// Exact legal-path/all-different gate for a shared arbitrary outer relabeling
// of the authentic p56 prime-minus-one literal-F mechanism, page resets.
// Also covers a common conjugated GP29 alphabet (z=F), by rank translation.
// No word register, phase-offset search, or plaintext scoring.
const assert=require('node:assert/strict');
function run(gp,solved,limit=100000){
 const N=29,ALL=(1<<N)-1,bit=i=>1<<i,pop=x=>{let n=0;while(x){x&=x-1;n++;}return n;},each=(x,fn)=>{while(x){const b=x&-x;x^=b;fn(31-Math.clz32(b));}};
 const primes=[];for(let v=2;primes.length<300;v++){let good=true;for(const p of primes){if(p*p>v)break;if(v%p===0){good=false;break;}}if(good)primes.push(v);}
 const K=primes.map(x=>(x-1)%N),rmap=new Map(gp.runes.map((x,i)=>[x,i]));
 const pages=gp.pages.filter(p=>p.page<56&&p.indices.length).map(p=>p.indices);
 assert.equal(pages.length,55);assert.equal(pages.flat().length,12956);
 const native=solved.sections.map(s=>[...s.source_text].filter(c=>rmap.has(c)).map(c=>rmap.get(c)));
 function enc(p,pi){let j=0;return p.map(x=>x===0?pi[0]:pi[(x+K[j++])%N]);}
 const identity=Array.from({length:N},(_,i)=>i);assert.deepEqual(enc(native[7],identity),gp.pages[56].indices);
 function matching(dom){
  const mate=new Int8Array(N).fill(-1);
  function aug(c,seen){let d=dom[c];while(d){let b=d&-d;d^=b;let k=31-Math.clz32(b);if(seen[k])continue;seen[k]=1;if(mate[k]<0||aug(mate[k],seen)){mate[k]=c;return true;}}return false;}
  let size=0;for(let c=0;c<N;c++)size+=aug(c,new Uint8Array(N));
  let witness=null;
  if(size<N){
   const used=new Uint8Array(N);for(const c of mate)if(c>=0)used[c]=1;
   let vars=0,ranks=0;for(let c=0;c<N;c++)if(!used[c])vars|=bit(c);
   let old=-1;while(old!==vars){old=vars;each(vars,c=>{ranks|=dom[c]});each(ranks,k=>{if(mate[k]>=0)vars|=bit(mate[k]);});}
   witness={symbols:[],ranks:[]};each(vars,c=>witness.symbols.push(c));each(ranks,k=>witness.ranks.push(k));assert(witness.symbols.length>witness.ranks.length);
  }
  return {size,mate,witness};
 }
 // All-different generalized arc consistency: in a complete matching,
 // an alternate edge belongs to some perfect matching iff it is on an
 // alternating cycle. Transitive closure on 29 variables is sufficient.
 function alldiff(d){
  const m=matching(d);if(m.size<N)return false;
  const reach=new Int32Array(N);
  for(let c=0;c<N;c++){reach[c]=bit(c);each(d[c],k=>{reach[c]|=bit(m.mate[k]);});}
  for(let i=0;i<N;i++)for(let c=0;c<N;c++)if(reach[c]&bit(i))reach[c]|=reach[i];
  for(let c=0;c<N;c++){let allowed=0;each(d[c],k=>{if(reach[m.mate[k]]&bit(c))allowed|=bit(k);});d[c]=allowed;}
  return true;
 }
 function makePage(c,z){
  const marks=[];for(let i=0;i<c.length;i++)if(c[i]===z)marks.push(i);
  const out=[];
  for(let e=0;e<=marks.length;e++){
   const lo=e?marks[e-1]+1:0,hi=e<marks.length?marks[e]:c.length,row=[];
   for(let h=0;h<=e;h++){
    const a=new Int32Array(N).fill(ALL);
    for(let i=lo;i<hi;i++)a[c[i]]&=~bit(K[i-h]);
    row.push({a,consume:e===marks.length||K[hi-h]!==0});
   }out.push(row);
  }return out;
 }
 function prefix(c,z,d){let n=0;for(let i=0;i<c.length&&c[i]!==z;i++){d[c[i]]&=~bit(K[i]);n++;}return n;}
 // For each number of holds and each symbol, retain the union of ranks
 // possible along some relaxed prefix path. Intersect along an edge,
 // union at a merge. Dropping joint consistency is only a relaxation.
 // On a singleton assignment it is the exact reachability DP.
 function pageFilter(page,d){
  let cur=[d];
  for(let e=0;e<page.length;e++){
   const next=Array(e+2).fill(null);
   for(let h=0;h<cur.length;h++){
    const src=cur[h];if(!src)continue;const row=page[e][h],a=new Int32Array(N);let ok=true;
    for(let c=0;c<N;c++){a[c]=src[c]&row.a[c];if(!a[c]){ok=false;break;}}
    if(!ok)continue;
    function add(j){if(!next[j])next[j]=a.slice();else for(let c=0;c<N;c++)next[j][c]|=a[c];}
    if(row.consume)add(h);if(e+1<page.length)add(h+1);
   }if(!next.some(x=>x))return false;cur=next;
  }
  const union=new Int32Array(N);for(const v of cur)if(v)for(let c=0;c<N;c++)union[c]|=v[c];
  for(let c=0;c<N;c++){d[c]&=union[c];if(!d[c])return false;}
  return true;
 }
 function legal(c,z,rank){let cur=new Set([0]);for(const x of c){const next=new Set();for(const j of cur){if(x===z)next.add(j);if(rank[x]!==K[j])next.add(j+1);}cur=next;if(!cur.size)return false;}return true;}
 function solve(corpus,z,budget=limit,truth=null){
  const d=new Int32Array(N).fill(ALL^1);d[z]=1;
  let prefixCount=0;for(const c of corpus)prefixCount+=prefix(c,z,d);
  const pre=matching(d);
  const stats={z,prefixCount,prefixMatch:pre.size,prefixWitness:pre.witness,nodes:0,rounds:0,pageCalls:0,rootDomains:null,solution:null,exhausted:false,capped:false,rootFailure:null};
  if(pre.size<N){stats.exhausted=true;stats.rootFailure='prefix Hall';return stats;}
  const p=corpus.map(c=>makePage(c,z));
  function prop(a){
   for(;;){stats.rounds++;let before=a.reduce((s,x)=>s+pop(x),0);
    if(!alldiff(a))return 'all-different';
    for(let i=0;i<p.length;i++){stats.pageCalls++;if(!pageFilter(p[i],a))return 'page '+i;}
    if(a.reduce((s,x)=>s+pop(x),0)===before)return null;
   }
  }
  if(truth){assert(d.every((x,c)=>x&bit(truth[c])));const copy=d.slice();assert.equal(prop(copy),null);assert(copy.every((x,c)=>x&bit(truth[c])));}
  const fail=prop(d);if(fail){stats.rootFailure=fail;stats.exhausted=true;return stats;}
  stats.rootDomains=Array.from(d,x=>pop(x));
  function dfs(a){
   if(stats.nodes>=budget){stats.capped=true;return false;}stats.nodes++;
   const f=prop(a);if(f)return false;
   let pick=-1,count=N+1;for(let c=0;c<N;c++){let n=pop(a[c]);if(n>1&&n<count){count=n;pick=c;}}
   if(pick<0){const rank=Array.from(a,x=>31-Math.clz32(x));assert.equal(new Set(rank).size,N);assert(corpus.every(c=>legal(c,z,rank)));stats.solution=rank;return true;}
   let m=a[pick];while(m){const b=m&-m;m^=b;const child=a.slice();child[pick]=b;if(dfs(child))return true;if(stats.capped)return false;}return false;
  }
  dfs(d);stats.exhausted=!stats.solution&&!stats.capped;return stats;
 }
 // Authentic control with no inferred key and two hidden outer maps
 // using actual native sections repeated across the exact page geometry.
 const tape=native.flat();let rng=0x26a10f47;const rnd=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;};
 function perm(){const a=identity.slice();for(let i=N-1;i;i--){let j=rnd()%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
 const controls=[];
 for(let s=0;s<2;s++){
  let pi=perm(),rank=Array.from({length:N},(_,i)=>pi.indexOf(i)),off=s*173;
  const pl=pages.map(c=>{const p=Array.from({length:c.length},()=>tape[(off++)%tape.length]);return p;});
  const ct=pl.map(p=>enc(p,pi));assert(ct.every(c=>legal(c,pi[0],rank)));
  const st=solve(ct,pi[0],limit,rank);
  assert(st.solution||st.capped);if(st.solution)assert(ct.every(c=>legal(c,pi[0],st.solution)));
  controls.push({...st,actualRank:rank,exact:st.solution?.every((x,i)=>x===rank[i])??false});
 }
 const originals=identity.map(z=>solve(pages,z,limit));
 return {model:'shared outer permutation of authentic prime-minus-one literal-F cipher, physical-page reset; conjugation fixing F is z=0 subset',p56Replay:85,controls,originals};
}
if(typeof module!=='undefined')module.exports=run;
if(typeof require!=='undefined'&&require.main===module){const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));console.log(JSON.stringify(run(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));}
