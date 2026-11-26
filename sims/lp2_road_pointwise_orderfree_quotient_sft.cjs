'use strict';
const fs=require('node:fs');
const path=require('node:path');
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/transcriptions/lp2-image-corrected.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/gibran_prophet_58585.txt"
];
function experiment(inputs) {
  const C=JSON.parse(inputs[0]), map=new Map(C.runes.map((x,i)=>[x,i])), seq=C.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
  const words=inputs[1].replace(/[/\s%]/g,"").split(/[-.&$§]/).map(x=>[...x].filter(c=>map.has(c)).map(c=>map.get(c))).filter(x=>x.length);
  let n=0,W=[];for(const a of words){if(n>=seq.length)break;W.push(a);n+=a.length}
  if(n!==12956||W.length!==2896||!W.flat().every((x,i)=>x===seq[i]))throw Error("canonical parse");
  const hist=a=>{const h=Array(29).fill(0);for(const x of a)h[x]++;return h};
  const sort=h=>h.slice().sort((a,b)=>b-a);
  const S=W.map(w=>w.reduce((a,i)=>a+C.prime[i],0));const pi=Array(Math.max(...S)+1).fill(0);let p=0;
  for(let i=2;i<pi.length;i++){let q=true;for(let d=2;d*d<=i;d++)if(i%d===0){q=false;break}if(q)p++;pi[i]=p}
  const fac=n=>{let a=[];for(let d=2;d*d<=n;d++)while(n%d===0){a.push(d);n/=d}if(n>1)a.push(n);return a};
  const reads={"sum":S.map(s=>s%29),"quotient":S.map(s=>Math.floor(s/29)%29),"digitsum":S.map(s=>[...String(s)].reduce((n,c)=>n+Number(c),0)%29),"pi":S.map(s=>pi[s]%29),"omega":S.map(s=>fac(s).length%29),"lpf":S.map(s=>(fac(s).at(-1)||1)%29),"primeidx":S.map(s=>Math.max(0,C.prime.indexOf(s))),"len*sum":S.map((s,i)=>s*W[i].length%29),"sum_noF":S.filter((s,i)=>!W[i].includes(0)).map(s=>s%29)};
  const tokens=C.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function encode(original){const clean=original.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const out=[];for(const w of clean.match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3}else if(w.startsWith("IO",i)){out.push(27);i+=2}else{const t=tokens.find(t=>w.startsWith(t.s,i));if(!t)throw Error("native register");out.push(t.i);i+=t.s.length}}}return out}
  const rows=Object.entries(reads).map(([name,a])=>({name,n:a.length,h:hist(a),sorted:sort(hist(a)),best:{}}));
  const donors=inputs.slice(2).map((r,i)=>({name:["Shakespeare","Emerson","Gibran"][i],arr:encode(r)}));
  for(const {name,arr} of donors){for(const size of [2896,2474]){const rs=rows.filter(r=>r.n===size);for(const r of rs)r.best[name]={distance:Infinity,start:-1,exact:0,windows:arr.length-size+1};const h=hist(arr.slice(0,size));for(let start=0;start+size<=arr.length;start++){const sorted=sort(h);for(const r of rs){let d=0;for(let i=0;i<29;i++)d+=Math.abs(sorted[i]-r.sorted[i]);d/=2;const b=r.best[name];if(d<b.distance){b.distance=d;b.start=start;b.nearest=sorted.slice()}if(!d)b.exact++}if(start+size<arr.length){h[arr[start]]--;h[arr[start+size]]++}}}}
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
  function solve(cipher,iterations=10000,restarts=12){
    const fit=cipher.slice(0,1448), hold=cipher.slice(1448), hh=hist(fit), rank=h=>Array.from({length:Q},(_,i)=>i).sort((a,b)=>h[b]-h[a]||a-b);
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
    if(Math.abs(score(decoded.slice(0,1448))-best/(1448-2))>1e-8)throw Error("incremental score mismatch");
    const inverse=Array(Q);bestKey.forEach((v,i)=>inverse[v]=i);if(!decoded.every((v,i)=>inverse[v]===cipher[i]))throw Error("replay");
    return {key:bestKey,fit:score(decoded.slice(0,1448)),hold:score(decoded.slice(1448)),decoded,head:decoded.slice(0,160).map(x=>C.translit[x]).join(""),replay:decoded.length};
  }
  // Positive controls: create a genuinely reversible carrier quotient using a
  // DP of possible sums, then shuffle the hidden alphabet with a fixed seed.
  // Only the projected symbol sequence is decoded; cover-word recovery is not claimed.
  const buckets=Array.from({length:Q},()=>null);
  let sums=new Map([[0,[]]]);
  for(let len=1;len<=9&&buckets.some(x=>x===null);len++){
    const next=new Map();
    for(const [s,w] of sums)for(let a=0;a<Q;a++){const t=s+C.prime[a];if(!next.has(t))next.set(t,[...w,a])}
    for(const [s,w] of next){const r=Math.floor(s/29)%29;if(buckets[r]===null)buckets[r]=w}
    sums=next;
  }
  if(buckets.some(x=>x===null))throw Error("carrier construction");
  const plants=[];
  for(const start of [12000,30000]){
    const plain=donors[2].arr.slice(start,start+2896), perm=shuffle(Array.from({length:Q},(_,i)=>i));
    const carriers=plain.map(x=>buckets[perm[x]]);
    const c=carriers.map(w=>Math.floor(w.reduce((s,x)=>s+C.prime[x],0)/29)%29);
    if(!c.every((v,i)=>v===perm[plain[i]]))throw Error("plant carrier");
    const r=solve(c);plants.push({start,fit:r.fit,hold:r.hold,plainFit:score(plain.slice(0,1448)),plainHold:score(plain.slice(1448)),fitCorrect:r.decoded.slice(0,1448).filter((x,i)=>x===plain[i]).length,holdCorrect:r.decoded.slice(1448).filter((x,i)=>x===plain[1448+i]).length,replay:r.replay,alphabetCorrect:r.key.filter((v,i)=>perm[v]===i).length});
  }
  // The original is scored only if both exact sender plants recover >=98% of heldout symbols.
  let original=null;
  if(plants.every(p=>p.holdCorrect>=Math.ceil(0.98*1448))){
    const r=solve(reads.quotient);
    original={key:r.key,fit:r.fit,hold:r.hold,head:r.head,replay:r.replay,decoded:r.decoded};
  }
  return {source:{words:W.length,runes:n,sourceLengths:donors.map(x=>({name:x.name,n:x.arr.length}))},histogram:rows,plantControl:plants,original,scope:"T2 pointwise reductions only; exact sorted-histogram lower bound over all donor windows and any permutation of the 29 labels or output order. Quotient constructive annealing conditional on intact output order, fit first half only."};
}
const out=experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8')));
console.log(JSON.stringify(out,null,2));
