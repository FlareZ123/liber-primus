'use strict';
const fs=require('node:fs');
const path=require('node:path');
function run(corpus,native,prior){
  const N=12956, M=29, split=9640, assert=(x,m)=>{if(!x)throw Error(m)};
  const C=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);assert(C.length===N&&prior.split===split,"frame");
  const units=[1,3,5,9,11,13,15,17,19,23,25,27];
  function inv(e){return units.find(d=>e*d%28===1);}
  function pow(x,e){let z=1;while(e){if(e&1)z=z*x%29;x=x*x%29;e>>=1;}return z;}
  const powers=Array.from({length:28},(_,e)=>Uint8Array.from({length:29},(_,x)=>pow(x,e)));
  const seen=new Set(),reps=[],allPairs=[];
  for(let x=0;x<29;x++)for(let y=x+1;y<29;y++){allPairs.push([x,y]);const k=29*x+y;if(seen.has(k))continue;for(const e of units){const a=powers[e][x],b=powers[e][y];seen.add(29*Math.min(a,b)+Math.max(a,b));}reps.push([x,y]);}
  assert(seen.size===406&&reps.length===51,"pair orbit quotient");
  const sieve=new Uint8Array(250001),primes=[];for(let p=2;p<sieve.length&&primes.length<N;p++)if(!sieve[p]){if(units.includes(p%28))primes.push(p%28);if(p*p<sieve.length)for(let j=p*p;j<sieve.length;j+=p)sieve[j]=1;}
  assert(primes.length===N,"clock");
  const invPrimes=primes.map(inv);
  // Hungarian minimization of negative integer weights; return exact maximizing permutation.
  function assign(W,n){
    const u=new Int32Array(n+1),v=new Int32Array(n+1),p=new Int32Array(n+1),way=new Int32Array(n+1);
    const minv=new Int32Array(n+1),used=new Uint8Array(n+1);
    for(let i=1;i<=n;i++){p[0]=i;minv.fill(1000000000);used.fill(0);let j0=0;
      do{used[j0]=1;const i0=p[j0];let delta=1000000000,j1=0;
        for(let j=1;j<=n;j++)if(!used[j]){const cur=-W[(i0-1)*n+j-1]-u[i0]-v[j];if(cur<minv[j]){minv[j]=cur;way[j]=j0;}if(minv[j]<delta){delta=minv[j];j1=j;}}
        for(let j=0;j<=n;j++){if(used[j]){u[p[j]]+=delta;v[j]-=delta;}else minv[j]-=delta;}j0=j1;
      }while(p[j0]!==0);
      do{const j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0!==0);
    }
    const map=new Int32Array(n);for(let j=1;j<=n;j++)map[p[j]-1]=j-1;
    let value=0,dual=0;for(let i=0;i<n;i++){value+=W[i*n+map[i]];dual-=u[i+1]+v[i+1];}
    // Integer dual certificate, not merely a heuristic matching.
    assert(value===dual,"assignment primal/dual objective");
    for(let i=0;i<n;i++)for(let j=0;j<n;j++)assert(u[i+1]+v[j+1]<=-W[i*n+j],"assignment dual feasibility");
    return {value,map};
  }
  function brute(W,n){let best=-Infinity;function rec(i,mask,s){if(i===n){best=Math.max(best,s);return;}for(let j=0;j<n;j++)if(!(mask>>j&1))rec(i+1,mask|1<<j,s+W[i*n+j]);}rec(0,0,0);return best;}
  let seed=0x2917;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
  for(let n=1;n<=7;n++)for(let k=0;k<16;k++){const W=Int32Array.from({length:n*n},()=>rng()%101-50);assert(assign(W,n).value===brute(W,n),"brute assignment control");}
  const pairMasks=pair=>Array.from({length:29},(_,z)=>units.filter(e=>powers[e][z]===pair[0]||powers[e][z]===pair[1]));
  const maskReps=reps.map(pair=>({pair,masks:pairMasks(pair)}));
  const masksAll=allPairs.map(pair=>({pair,masks:pairMasks(pair)}));
  function histPhases(tape,cut,hold,reverse,c0){
    let clock=0;const full=new Int32Array(29*28),held=new Int32Array(29*28),seq=reverse?primes:invPrimes;
    for(let i=0;i<tape.length;i++){const c=tape[i],e=seq[clock];full[c*28+e]++;if(i>=cut)held[c*28+e]++;if(!hold||c!==c0)clock++;}
    return {full,held};
  }
  function maxCap(tape,cut,hold,reverse,all=false){
    let fullBest={value:-1},heldBest={value:-1},assignments=0;
    const rowChoices=hold?Array.from({length:29},(_,i)=>i):[-1],pairs=all?masksAll:maskReps;
    for(const c0 of rowChoices){
      const h=histPhases(tape,cut,hold,reverse,c0),rows=Array.from({length:29},(_,i)=>i).filter(i=>i!==c0),cols=Array.from({length:29},(_,i)=>i).filter(i=>!hold||i!==0),n=rows.length;
      for(const {pair,masks} of pairs){
        const F=new Int32Array(n*n),H=new Int32Array(n*n);
        for(let j=0;j<n;j++){const es=masks[cols[j]];if(!es.length)continue;for(let i=0;i<n;i++){const base=rows[i]*28;let f=0,g=0;for(const e of es){f+=h.full[base+e];g+=h.held[base+e];}F[i*n+j]=f;H[i*n+j]=g;}}
        const fa=assign(F,n),ha=assign(H,n);assignments+=2;
        const fixed=hold&&pair.includes(0);let f0=0,h0=0;if(fixed){for(const e of units){f0+=h.full[c0*28+e];h0+=h.held[c0*28+e];}}
        const save=(a,add)=>{const map=Array(29).fill(-1);if(hold)map[c0]=0;for(let i=0;i<n;i++)map[rows[i]]=cols[a.map[i]];return {value:a.value+add,pair,c0,map};};
        if(fa.value+f0>fullBest.value)fullBest=save(fa,f0);
        if(ha.value+h0>heldBest.value)heldBest=save(ha,h0);
      }
    }
    function check(w,start){assert(new Set(w.map).size===29,"outer bijection");let clock=0,score=0;const f=Array(29).fill(0),seq=reverse?primes:invPrimes;for(let i=0;i<tape.length;i++){const c=tape[i],z=w.map[c],x=powers[seq[clock]][z];if(i>=start){f[x]++;if(w.pair.includes(x))score++;}if(!hold||z!==0)clock++;}assert(score===w.value,"assignment witness replay");const sorted=f.sort((a,b)=>b-a);assert(sorted[0]+sorted[1]===w.value,"pair optimum equals actual top2");}
    check(fullBest,0);check(heldBest,cut);
    return {hold,reverse,full:fullBest,held:heldBest,assignments};
  }
  const original=[];for(const hold of [false,true])for(const reverse of [false,true])original.push(maxCap(C,split,hold,reverse));
  const runeMap=new Map(corpus.runes.map((x,i)=>[x,i]));const P=native.sections.find(s=>s.name==="0_koan_1").source_text.split("").filter(x=>runeMap.has(x)).map(x=>runeMap.get(x));
  function perm(){const a=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){const j=rng()%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
  function top2(a,start){const f=Array(29).fill(0);for(let i=start;i<a.length;i++)f[a[i]]++;f.sort((a,b)=>b-a);return f[0]+f[1];}
  const plants=[];
  for(const hold of [false,true]){const reverse=hold,A=perm(),B=perm(),cut=Math.floor(P.length*2/3),ct=[];let clock=0;for(const x of P){const z=A[x],e=(reverse?invPrimes:primes)[clock];ct.push(B[powers[e][z]]);if(!hold||z!==0)clock++;}
    const r=maxCap(ct,cut,hold,reverse);const truthFull=top2(P,0),truthHeld=top2(P,cut);assert(r.full.value>=truthFull&&r.held.value>=truthHeld,"arbitrary-permutation positive cap");plants.push({hold,reverse,length:P.length,cut,truthFull,truthHeld,fullCap:r.full.value,heldCap:r.held.value,truthInput:A,truthOutput:B});}
  // Independent exhaustive 406-pair comparison for both clocks; short deterministic original-derived prefix.
  const quotients=[];for(const hold of [false,true]){const t=C.slice(0,96),q=maxCap(t,61,hold,false),a=maxCap(t,61,hold,false,true);assert(q.full.value===a.full.value&&q.held.value===a.held.value,"all pairs quotient");quotients.push({hold,full:q.full.value,held:q.held.value,representativeAssignments:q.assignments,allPairAssignments:a.assignments});}
  const floorFull=Math.min(...prior.donorStats.map(x=>x.full.min)),floorHeld=Math.min(...prior.donorStats.map(x=>x.held.min));
  assert(original.every(x=>x.full.value<floorFull&&x.held.value<floorHeld),"finite donor exclusion");
  return {N,split,held:N-split,representatives:reps,pairCount:seen.size,original,plants,quotients,bruteAssignmentControls:112,donorFloorFull:floorFull,donorFloorHeld:floorHeld,donorFullWindows:prior.donorStats.reduce((s,x)=>s+x.full.windows,0),donorHeldWindows:prior.donorStats.reduce((s,x)=>s+x.held.windows,0),decision:"Exact all fixed input/output permutations, arbitrary phase-zero relocation and both global clocks at prime origin zero, under the stated public unit-prime exponent schedule; finite donor concentration exclusion only."};
}
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
console.log(JSON.stringify(run(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json'),read('im-results/lp2-prime-exponent-affine-wrapper-output.json')),null,2));
