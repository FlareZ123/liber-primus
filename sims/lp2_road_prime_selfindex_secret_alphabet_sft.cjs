'use strict';
const fs=require('node:fs'), path=require('node:path');
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
/** @param {string[]} inputs */
function experiment(inputs){
  const C=JSON.parse(inputs[0]), map=new Map(C.runes.map((x,i)=>[x,i])), seq=C.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
  const words=inputs[1].replace(/[/\s%]/g,"").split(/[-.&$§]/).map(x=>[...x].filter(c=>map.has(c)).map(c=>map.get(c))).filter(x=>x.length);
  let n=0,W=[];for(const a of words){if(n>=seq.length)break;W.push(a);n+=a.length}
  if(n!==12956||W.length!==2896||!W.flat().every((x,i)=>x===seq[i]))throw Error("canonical parse");
  const hist=a=>{const h=Array(29).fill(0);for(const x of a)h[x]++;return h};
  const sort=h=>h.slice().sort((a,b)=>b-a);
  const S=W.map(w=>w.reduce((a,i)=>a+C.prime[i],0));const pi=Array(Math.max(...S)+1).fill(0);let p=0;
  for(let i=2;i<pi.length;i++){let q=true;for(let d=2;d*d<=i;d++)if(i%d===0){q=false;break}if(q)p++;pi[i]=p}
  const fac=n=>{let a=[];for(let d=2;d*d<=n;d++)while(n%d===0){a.push(d);n/=d}if(n>1)a.push(n);return a};
  const tokens=C.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function encode(original){const clean=original.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const out=[];for(const w of clean.match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3}else if(w.startsWith("IO",i)){out.push(27);i+=2}else{const t=tokens.find(t=>w.startsWith(t.s,i));if(!t)throw Error("native register");out.push(t.i);i+=t.s.length}}}return out}
  const donors=inputs.slice(2).map((r,i)=>({name:["Shakespeare","Emerson","Gibran"][i],arr:encode(r)}));
  // Train ONLY on Shakespeare + Emerson; Gibran is the independent native plant.
  const Q=29, SIZE=Q**3, counts=new Float64Array(SIZE), trainingHist=Array(Q).fill(0);
  const idx=(a,b,c)=>(a*Q+b)*Q+c;
  for(const {arr} of donors.slice(0,2)){for(const x of arr)trainingHist[x]++;for(let i=2;i<arr.length;i++)counts[idx(arr[i-2],arr[i-1],arr[i])]++}
  const total=counts.reduce((a,b)=>a+b,0)+0.1*SIZE;
  const log=Float64Array.from(counts,x=>Math.log((x+0.1)/total));
  function score(a){let z=0;for(let i=2;i<a.length;i++)z+=log[idx(a[i-2],a[i-1],a[i])];return z/(a.length-2)}
  let state=3301;
  function rand(){state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296}
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function solve(cipher,iterations=12000,restarts=16){
    const split=Math.floor(cipher.length*0.65);
    const fit=cipher.slice(0,split), hold=cipher.slice(split), hh=hist(fit), rank=h=>Array.from({length:Q},(_,i)=>i).sort((a,b)=>h[b]-h[a]||a-b);
    const freqKey=Array(Q);rank(hh).forEach((v,i)=>freqKey[v]=rank(trainingHist)[i]);
    const tc=new Map();for(let i=2;i<fit.length;i++){const k=idx(fit[i-2],fit[i-1],fit[i]);tc.set(k,(tc.get(k)||0)+1)}
    const trip=[...tc].map(([v,cnt])=>({a:Math.floor(v/(Q*Q)),b:Math.floor(v/Q)%Q,c:v%Q,cnt}));
    const aff=Array.from({length:Q},()=>[]);for(let i=0;i<trip.length;i++){const t=trip[i];for(const x of new Set([t.a,t.b,t.c]))aff[x].push(i)}
    const val=(t,key)=>t.cnt*log[idx(key[t.a],key[t.b],key[t.c])];
    let best=-Infinity,bestKey=null;const visited=new Int32Array(trip.length);let stamp=0;
    for(let restart=0;restart<restarts;restart++){
      const key=freqKey.slice();
      if(restart>0){for(let k=0;k<3+restart;k++){const a=Math.floor(rand()*Q),b=Math.floor(rand()*Q);[key[a],key[b]]=[key[b],key[a]]}}
      let current=trip.reduce((z,t)=>z+val(t,key),0);
      if(current>best){best=current;bestKey=key.slice()}
      for(let it=0;it<iterations;it++){
        const a=Math.floor(rand()*Q),b=Math.floor(rand()*Q);if(a===b)continue;
        let old=0,newV=0;stamp++;for(const j of aff[a]){visited[j]=stamp;old+=val(trip[j],key)}for(const j of aff[b])if(visited[j]!==stamp)old+=val(trip[j],key);
        [key[a],key[b]]=[key[b],key[a]];
        for(const j of aff[a])newV+=val(trip[j],key);for(const j of aff[b])if(visited[j]!==stamp)newV+=val(trip[j],key);
        const delta=newV-old,temp=18*Math.pow(0.08/18,it/(iterations-1));
        if(delta>=0||rand()<Math.exp(delta/temp)){current+=delta;if(current>best){best=current;bestKey=key.slice()}}
        else [key[a],key[b]]=[key[b],key[a]];
      }
    }
    const decoded=cipher.map(c=>bestKey[c]);
    if(Math.abs(score(decoded.slice(0,split))-best/(split-2))>1e-8)throw Error("incremental score mismatch");
    const inverse=Array(Q);bestKey.forEach((v,i)=>inverse[v]=i);if(!decoded.every((v,i)=>inverse[v]===cipher[i]))throw Error("replay");
    return {key:bestKey,fit:score(decoded.slice(0,split)),hold:score(decoded.slice(split)),split,decoded,head:decoded.slice(0,160).map(x=>C.translit[x]).join(""),replay:decoded.length};
  }

  // Source-selected predicate: prime GP sum; direction = zero-based sum mod
  // printed-group length. A hidden common alphabet is the distinct extension.
  const isPrime=s=>s>=2&&pi[s]>pi[s-1];
  const extract=words=>words.flatMap(w=>{const s=w.reduce((a,x)=>a+C.prime[x],0);return isPrime(s)?[w[s%w.length]]:[]});
  const originalTape=extract(W), N=originalTape.length;
  const target=sort(hist(originalTape));
  const distance=(a,b)=>a.reduce((z,v,i)=>z+Math.abs(v-b[i]),0)/2;
  const bounds=donors.map(({name,arr})=>{const h=hist(arr.slice(0,N));let best=Infinity,start=-1,exact=0;
    for(let i=0;i+N<=arr.length;i++){const d=distance(sort(h),target);if(d<best){best=d;start=i}if(d===0)exact++;if(i+N<arr.length){h[arr[i]]--;h[arr[i+N]]++}}
    return {name,best,start,exact,windows:arr.length-N+1}});
  // Independent carrier plants. Pick random 4-rune covers conditional on the
  // extraction rule, and composite covers at all nonselected positions.
  const buckets=Array.from({length:29},()=>[]);const fillers=[];
  for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++)for(let d=0;d<29;d++){const w=[a,b,c,d],s=w.reduce((z,x)=>z+C.prime[x],0);if(isPrime(s)){if(buckets[w[s%4]].length<256)buckets[w[s%4]].push(w)}else if(fillers.length<256)fillers.push(w)}
  if(buckets.some(x=>!x.length))throw Error("incomplete carrier");
  const plants=[];
  for(const start of [12000,30000,45000]){
    const plain=donors[2].arr.slice(start,start+N);if(plain.length!==N)throw Error("short plant");
    const perm=shuffle(Array.from({length:Q},(_,i)=>i));
    const covers=[];for(const x of plain){covers.push(fillers[Math.floor(rand()*fillers.length)],buckets[perm[x]][Math.floor(rand()*buckets[perm[x]].length)])}
    const c=extract(covers);if(c.length!==N||!c.every((x,i)=>x===perm[plain[i]]))throw Error("plant extraction");
    const r=solve(c);
    plants.push({start,fit:r.fit,hold:r.hold,fitCorrect:r.decoded.slice(0,r.split).filter((x,i)=>x===plain[i]).length,holdCorrect:r.decoded.slice(r.split).filter((x,i)=>x===plain[r.split+i]).length,split:r.split,held:N-r.split,alphabetCorrect:r.key.filter((v,i)=>perm[v]===i).length,replay:r.replay});
  }
  // Score original only after at least two independent plants pass 95% exact
  // withheld rune recovery; no tuning of the source selector or score.
  const passed=plants.filter(p=>p.holdCorrect>=Math.ceil(.95*p.held)).length>=2;
  let original=null;
  if(passed){const r=solve(originalTape);original={...r,transliterated:r.decoded.map(x=>C.translit[x]).join("")}}
  return {N,groups:W.length,runes:n,selectedFraction:N/W.length,observedHistogram:hist(originalTape),bounds,plants,passed,original,scope:"T3 prime-selected self-indexed projected channel with common hidden GP29 bijection, arbitrary output order allowed only in histogram gate; not full cipher inverse."};

}
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'))),null,2));
