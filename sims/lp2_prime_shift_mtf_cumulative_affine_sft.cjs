/**
 * Agent15, 26 Nov 2026: cumulative affine-labelled MTF after GP29 prime shift.
 * Run from repository root: node sims/lp2_prime_shift_mtf_cumulative_affine_sft.cjs
 * All-consuming, continuous, initial C=0; no claim of native F semantics.
 */
const fs=require('node:fs');
function experiment(corpus, solved, donorTexts) {
  const assert=(b,m)=>{if(!b)throw Error(m)};
  const mod=x=>((x%29)+29)%29;
  const id=()=>Array.from({length:29},(_,i)=>i);
  const equal=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
  const cipher=corpus.pages.slice(0,56).flatMap(p=>p.indices);
  const fit=corpus.pages.slice(0,40).reduce((n,p)=>n+p.indices.length,0);
  const end=corpus.pages.slice(0,54).reduce((n,p)=>n+p.indices.length,0);
  assert(cipher.length===12956 && fit===9640 && end-fit===3008,"source cuts");
  const k=[];
  for(let n=2;k.length<cipher.length;n++) {
    let yes=true;
    for(let d=2;d*d<=n;d++) if(n%d===0){yes=false;break}
    if(yes)k.push((n-1)%29);
  }
  const sections=solved.sections.map(s=>({name:s.name,p:[...s.source_text].map(x=>corpus.runes.indexOf(x)).filter(x=>x>=0)}));
  const counts=Array(29).fill(.5);let total=14.5;
  for(const s of sections)for(const x of s.p){counts[x]++;total++}
  const logfreq=counts.map(v=>Math.log(v/total));
  const tri=Array(29**3).fill(.5), ctx=Array(29**2).fill(14.5);
  for(const s of sections)for(let i=2;i<s.p.length;i++){let q=29*s.p[i-2]+s.p[i-1];tri[29*q+s.p[i]]++;ctx[q]++}
  const trigrams=tri.map((v,i)=>Math.log(v/ctx[Math.floor(i/29)]));
  function score(p,lo,hi){let l=0,t=0;for(let i=lo;i<hi;i++){l+=logfreq[p[i]];if(i>=lo+2)t+=trigrams[841*p[i-2]+29*p[i-1]+p[i]]}return{unigram:l/(hi-lo),trigram:t/(hi-lo-2)}}
  function hist(p,lo=0,hi=p.length){const h=Array(29).fill(0);for(let i=lo;i<hi;i++)h[p[i]]++;return h}
  function stats(p,lo=0,hi=p.length){const h=hist(p,lo,hi),n=hi-lo;return{max:Math.max(...h),ioc:h.reduce((s,x)=>s+x*(x-1),0)/(n*(n-1)),...score(p,lo,hi)}}
  function tokenize(t) {
    const tokens=corpus.translit.map((x,i)=>[x,i]).concat([["ING",21],["IO",27]]).sort((a,b)=>b[0].length-a[0].length);
    const out=[];
    const body=t.slice(t.indexOf("*** START OF")>=0?t.indexOf("*** START OF"):0,t.indexOf("*** END OF")>=0?t.indexOf("*** END OF"):undefined);
    for(let w of body.toUpperCase().match(/[A-Z]+/g)||[]) {
      w=w.replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
      for(let i=0;i<w.length;){const m=tokens.find(([s])=>w.startsWith(s,i));if(m){out.push(m[1]);i+=m[0].length}else i++}
    }
    return out;
  }
  const donors=donorTexts.map(tokenize);
  assert(donors.every(p=>p.length>=cipher.length+20000),"control source too short");
  function inv(a){for(let i=1;i<29;i++)if(a*i%29===1)return i;throw Error("nonunit")}
  function encode(p,a,b,pi) {
    const list=pi.slice(),c=[];let prev=0,ai=inv(a);
    for(let i=0;i<p.length;i++){const s=mod(p[i]+k[i]),r=list.indexOf(s);assert(r>=0,"missing symbol");list.splice(r,1);list.unshift(s);prev=mod(prev+ai*(r-b));c.push(prev)}
    return c;
  }
  function abstractDecode(c,a,b) {
    const z=new Uint8Array(c.length),list=id();let prev=0;
    for(let i=0;i<c.length;i++){const r=mod(a*(c[i]-prev)+b),s=list[r];prev=c[i];z[i]=s;list.splice(r,1);list.unshift(s)}
    return z;
  }
  function decode(z,pi){return Array.from(z,(x,i)=>mod(pi[x]-k[i]))}
  function weights(z,lo,hi) {
    const W=Array.from({length:29},()=>Array(29).fill(0));
    for(let i=lo;i<hi;i++)W[z[i]][k[i]]++;
    return W;
  }
  function assignment(W) {
    // Hungarian algorithm for square maximum-weight assignment.
    const n=W.length,u=Array(n+1).fill(0),v=Array(n+1).fill(0),p=Array(n+1).fill(0),way=Array(n+1).fill(0);
    for(let i=1;i<=n;i++){
      p[0]=i;let j0=0;const minv=Array(n+1).fill(Infinity),used=Array(n+1).fill(false);
      do {
        used[j0]=true;const i0=p[j0];let delta=Infinity,j1=0;
        for(let j=1;j<=n;j++)if(!used[j]){
          const cur=-W[i0-1][j-1]-u[i0]-v[j];
          if(cur<minv[j]){minv[j]=cur;way[j]=j0}
          if(minv[j]<delta){delta=minv[j];j1=j}
        }
        for(let j=0;j<=n;j++){if(used[j]){u[p[j]]+=delta;v[j]-=delta}else minv[j]-=delta}
        j0=j1;
      }while(p[j0]!==0);
      do{const j1=way[j0];p[j0]=p[j1];j0=j1}while(j0!==0);
    }
    const pi=Array(n);for(let j=1;j<=n;j++)pi[p[j]-1]=j-1;
    return{pi,value:pi.reduce((s,x,i)=>s+W[i][x],0)};
  }
  function exhaustive(c,bound) {
    let best=null,ceiling=-1,ceilingAt=null;
    for(let a=1;a<29;a++)for(let b=0;b<29;b++){
      const z=abstractDecode(c,a,b);
      const W=weights(z,1,fit); // Ignore first rune: unknown IV only changes labeling of later ranks.
      const L=W.map(row=>id().map(x=>row.reduce((s,n,j)=>s+n*logfreq[mod(x-j)],0)));
      const m=assignment(L);
      if(!best||m.value>best.value)best={a,b,pi:m.pi,value:m.value};
      if(bound){
        const H=weights(z,fit,end),h=assignment(H);
        if(h.value>ceiling){ceiling=h.value;ceilingAt={a,b,pi:h.pi}}
      }
    }
    const z=abstractDecode(c,best.a,best.b),p=decode(z,best.pi);
    assert(equal(encode(p,best.a,best.b,best.pi),c),"original forward replay");
    return{...best,fit:stats(p,1,fit),held:stats(p,fit,end),full:stats(p),heldCeiling:bound?ceiling:null,ceilingAt,plaintext:p};
  }
  function donorFloor(p,n){
    const h=hist(p,0,n);let floor=Math.max(...h);
    for(let i=n;i<p.length;i++){h[p[i-n]]--;h[p[i]]++;floor=Math.min(floor,Math.max(...h))}
    return {n,windows:p.length-n+1,minimumMax:floor};
  }
  function permutation(seed){const p=id();let s=seed>>>0;for(let i=28;i>0;i--){s^=s<<13;s^=s>>>17;s^=s<<5;const j=(s>>>0)%(i+1);[p[i],p[j]]=[p[j],p[i]]}return p}
  const tiny=[[3,1,2],[0,4,2],[5,0,1]];
  assert(assignment(tiny).value===11,"Hungarian toy optimum");
  const plants=[];
  for(let j=0;j<donors.length;j++){
    const p=donors[j].slice(10000+5000*j,10000+5000*j+cipher.length),a=[5,13,27][j],b=[7,17,24][j],pi=permutation([811,1937,2851][j]);
    const c=encode(p,a,b,pi),r=exhaustive(c,false);
    plants.push({donor:j,truth:{a,b,pi},recovered:{a:r.a,b:r.b,pi:r.pi},allCorrect:r.plaintext.filter((x,i)=>x===p[i]).length,heldCorrect:r.plaintext.slice(fit,end).filter((x,i)=>x===p[fit+i]).length,fit:r.fit,held:r.held});
  }
  const original=exhaustive(cipher,true);
  const floors=donors.map(p=>donorFloor(p,end-fit));
  const heldCandidate=decode(abstractDecode(cipher,original.ceilingAt.a,original.ceilingAt.b),original.ceilingAt.pi);
  assert(hist(heldCandidate,fit,end)[0]===original.heldCeiling,"bound witness");
  return {model:"Cumulative affine-labeled MTF of prime-minus-one shifted GP29 plaintext; consuming all symbols; continuous",n:cipher.length,fit:[1,fit],held:[fit,end],rankMaps:812,primeClock:"first prime 2, one shift per symbol",donorLengths:donors.map(p=>p.length),nativeSections:sections.map(s=>({name:s.name,n:s.p.length})),plants,original:{...original,plaintext:original.plaintext.map(x=>corpus.runes[x]).join(""),preview:original.plaintext.slice(0,160).map(x=>corpus.translit[x]).join("")},floors};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
const files=paths.map(p=>fs.readFileSync(p,'utf8'));
const data=experiment(JSON.parse(files[0]),JSON.parse(files[1]),files.slice(2));
console.log(JSON.stringify(data,null,2));
