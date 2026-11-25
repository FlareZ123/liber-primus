"use strict";
/** GP28 page-framed enumerative carry: exact all-high-quotient, all-carry, page-private relabeling bound. */
function audit(c,donor,controls){
  const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
  const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  const sum=a=>a.reduce((x,y)=>x+y,0);
  const digits=(x,q,n)=>{const a=Array(n);for(let j=n-1;j>=0;j--){a[j]=Number(x%BigInt(q));x/=BigInt(q)}assert(x===0n,"digit width");return a};
  const integer=(a,q)=>a.reduce((x,y)=>x*BigInt(q)+BigInt(y),0n);
  const frames=c.pages.filter(x=>x.page<56&&x.indices.length).map(x=>({p:x.page,c:x.indices,n:x.indices.length,k:x.indices.slice(1).filter((y,i)=>y===x.indices[i]).length}));
  assert(frames.length===55&&sum(frames.map(x=>x.n))===12956&&sum(frames.map(x=>x.k))===86,"source totals");
  const native=donor.sections.flatMap(x=>[...x.source_text].map(y=>c.runes.indexOf(y)).filter(y=>y>=0));
  assert(native.length===2979&&!native.includes(22),"native GP28 mapping");
  const native28=native.map(x=>x-(x>22?1:0));
  function coder(n,k,exact,delta){
    const dp=Array.from({length:n},()=>Array(k+1).fill(0n));
    for(let i=0;i<=k;i++)dp[0][i]=!exact||i===0?1n:0n;
    for(let t=1;t<n;t++)for(let j=0;j<=k;j++)dp[t][j]=28n*dp[t-1][j]+(j?dp[t-1][j-1]:0n);
    const M=29n*dp[n-1][k];
    const opts=p=>Array.from({length:29},(_,i)=>delta?(p+i)%29:i);
    const width=(t,j,rep)=>rep?(j?dp[t][j-1]:0n):dp[t][j];
    function rank(a){
      assert(a.length===n,"rank length");let r=BigInt(a[0])*dp[n-1][k],j=k;
      for(let i=1;i<n;i++){const p=a[i-1],x=a[i],t=n-1-i;for(const y of opts(p)){if(y===x)break;r+=width(t,j,y===p)}
        if(x===p){assert(j>0,"repeat quota");j--}
      }
      assert((!exact||j===0)&&r<M,"rank valid");
      return r;
    }
    function unrank(r){
      assert(r>=0n&&r<M,"rank range");
      const a=[Number(r/dp[n-1][k])];r%=dp[n-1][k];let j=k;
      for(let i=1;i<n;i++){const p=a[i-1],t=n-1-i;let found=false;for(const y of opts(p)){const w=width(t,j,y===p);if(r<w){a.push(y);if(y===p)j--;found=true;break}r-=w}assert(found,"unrank branch")}
      assert(r===0n&&(!exact||j===0),"unrank end");return a;
    }
    return {M,rank,unrank};
  }
  const specs=[{exact:false,delta:false},{exact:false,delta:true},{exact:true,delta:false},{exact:true,delta:true}];
  const outputs=[];
  let cursor=0;
  const plant=frames.map(f=>{const a=Array.from({length:f.n},(_,i)=>native28[(cursor+i)%native28.length]);cursor+=f.n;return a});
  for(const spec of specs){
    const rows=frames.map(f=>{
      const q=coder(f.n,f.k,spec.exact,spec.delta),r=q.rank(f.c),t=f.n-1-f.k,P=28n**BigInt(f.n),T=28n**BigInt(t);
      assert(eq(q.unrank(r),f.c)&&q.M%T===0n,"original replay/divisibility p"+f.p);
      const tail=digits(r%T,28,t),counts=Array(28).fill(0);for(const x of tail)counts[x]++;
      counts.sort((a,b)=>b-a);
      return {...f,q,r,P,T,tail,top1:counts[0],top2:counts[0]+counts[1],free:f.n-t};
    });
    // Fully reversible planted streaming codec with an independent high-order side digit, not a fitted key.
    let s=3301n;const encoded=[];
    for(let i=0;i<rows.length;i++){const x=rows[i],M=17n*x.q.M,v=s*x.P+integer(plant[i],28),r=v%M;s=v/M;encoded.push({c:x.q.unrank(r%x.q.M),h:r/x.q.M});}
    for(let i=rows.length-1;i>=0;i--){const x=rows[i],M=17n*x.q.M,r=encoded[i].h*x.q.M+x.q.rank(encoded[i].c),v=s*M+r,p=digits(v%x.P,28,x.n);s=v/x.P;assert(eq(p,plant[i]),"plant inverse p"+x.p);const t=x.tail.length;assert(eq(p.slice(-t),digits((r%x.q.M)%x.T,28,t)),"plant all-carry suffix")}
    assert(s===3301n,"plant initial carry");
    outputs.push({spec,rows:rows.map(x=>({page:x.p,n:x.n,k:x.k,free:x.free,top1:x.top1,top2:x.top2})),fixed:sum(rows.map(x=>x.tail.length)),free:sum(rows.map(x=>x.free)),maxE:sum(rows.map(x=>x.top1+x.free)),maxTwo:sum(rows.map(x=>x.top2+x.free)),nativePlantRunes:12956});
  }
  const perPageFlexibleMaxE=sum(frames.map((_,i)=>Math.max(...outputs.map(x=>x.rows[i].top1+x.rows[i].free))));
  const perPageFlexibleMaxTwo=sum(frames.map((_,i)=>Math.max(...outputs.map(x=>x.rows[i].top2+x.rows[i].free))));
  const floor=controls.original.find(x=>x.name==="whole").literary;
  assert(floor.windows===1129739&&floor.minE===1397,"pinned independently frozen literary count floor");
  let toy=0;
  // Every actual small rank codeword in the two quota modes is a valid round-trip.
  for(const spec of specs)for(let k=0;k<=2;k++){const q=coder(3,k,spec.exact,spec.delta);for(let r=0n;r<q.M;r++)assert(q.rank(q.unrank(r))===r,"exhaustive rank toy");toy+=Number(q.M)}
  assert(perPageFlexibleMaxE<floor.minE,"original page-flexible negative");
  return {source:{pages:frames.length,runes:12956,repeats:86},control:{nativeRunes:native.length,plantRunes:12956,exhaustiveThreeRuneCodewords:toy,literaryWindows:floor.windows,minE:floor.minE},outputs,perPageFlexibleMaxE,perPageFlexibleMaxTwo};
}
const fs=require("node:fs"),path=require("node:path");
const read=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(audit(...["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","im-results/lp2-active28-porta-q8-gate-output.json"].map(read)),null,2));
