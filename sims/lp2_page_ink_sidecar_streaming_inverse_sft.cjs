"use strict";
/** Actual page-local ink sidecar ranks and streaming GP27/GP29 original inverse. */
function audit(tx,c,ink,grid,donor){
  const check=(x,m)=>{if(!x)throw Error(m)};
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const sum=a=>a.reduce((x,y)=>x+y,0);
  const choose=(n,k)=>{if(k<0||k>n)return 0n;let x=1n;for(let i=1;i<=Math.min(k,n-k);i++)x=x*BigInt(n-i+1)/BigInt(i);return x};
  const integer=(a,b)=>a.reduce((x,y)=>x*BigInt(b)+BigInt(y),0n);
  const digits=(x,b,n)=>{let a=Array(n);for(let i=n-1;i>=0;i--){a[i]=Number(x%BigInt(b));x/=BigInt(b)}check(x===0n,"digit width");return a};
  const bitlen=x=>x===0n?0:x.toString(2).length;
  const bits=x=>{const s=x.toString(2),k=Math.min(53,s.length);return s.length-k+Math.log2(parseInt(s.slice(0,k),2))};
  const colex=a=>a.reduce((r,x,i)=>r+choose(x,i+1),0n);
  function uncolex(r,n,k){
    check(r>=0n&&r<choose(n,k),"colex domain");
    const out=Array(k);let x=n-1;
    for(let i=k;i>=1;i--){while(choose(x,i)>r)x--;out[i-1]=x;r-=choose(x,i);x--}
    check(r===0n,"colex residual");return out;
  }
  function comp(a){
    const n=sum(a),k=a.length-1;let p=0;
    const bars=a.slice(0,-1).map((x,i)=>{p+=x;return p+i});
    const cap=choose(n+k,k);
    return {r:colex(bars),cap,decode:r=>{const b=uncolex(r,n+k,k);return Array.from({length:k+1},(_,i)=>(b[i]??n+k)-(i?b[i-1]+1:0))}};
  }
  function multi(a){
    const labels=[...new Set(a)].sort(),counts=labels.map(x=>a.filter(y=>y===x).length);
    let M=1n,n=a.length;for(const k of counts){M*=choose(n,k);n-=k}
    const cap=M;let r=0n,cs=[...counts];n=a.length;
    for(const x of a){const j=labels.indexOf(x);r+=M*BigInt(sum(cs.slice(0,j)))/BigInt(n);M=M*BigInt(cs[j])/BigInt(n);cs[j]--;n--}
    return {r,cap,decode:r=>{let n=a.length,M=cap,cs=[...counts],out=[];while(n){let found=false;for(let j=0;j<cs.length;j++){const w=M*BigInt(cs[j])/BigInt(n);if(r<w){out.push(labels[j]);M=w;cs[j]--;n--;found=true;break}r-=w}check(found,"multiset branch")}check(r===0n,"multiset residual");return out}};
  }
  function pack(parts){
    const cap=parts.reduce((s,x)=>s*x.cap,1n),r=parts.reduce((s,x)=>s*x.cap+x.r,0n);
    return {r,cap,decode:r=>{check(r>=0n&&r<cap,"mixed radix");const out=Array(parts.length);for(let i=parts.length-1;i>=0;i--){const p=parts[i];out[i]=p.decode(r%p.cap);r/=p.cap}return out}};
  }
  function redField(spans,n){
    if(!spans.length)return {r:0n,cap:1n,decode:()=>[]};
    const a=spans.map(x=>x.length),g=[];let end=0;for(const s of spans){check(s.start>=end&&s.start+s.length<=n,"red interval");g.push(s.start-end);end=s.start+s.length}g.push(n-end);
    const f=pack([comp(a.map(x=>x-1)),comp(g)]);
    return {r:f.r,cap:f.cap,decode:r=>{const [l,g]=f.decode(r);let p=0;return l.map((x,i)=>{p+=g[i];const o=[p,x+1];p+=x+1;return o})}};
  }
  function markField(marks,n){
    const k=marks.length,positions=marks.map((x,i)=>x[0]+i);
    check(positions.every((x,i)=>x>=0&&x<n+k&&(!i||x>positions[i-1])),"mark order");
    const labels=marks.map(x=>{check([10,13].includes(x[1])&&["black","red"].includes(x[2]),"mark identity");return (x[1]===13?2:0)+(x[2]==="red"?1:0)});
    const C=4n**BigInt(k),R=colex(positions)*C+integer(labels,4);
    return {r:R,cap:choose(n+k,k)*C,decode:r=>{const ids=digits(r%C,4,k),pos=uncolex(r/C,n+k,k);return pos.map((x,i)=>[x-i,ids[i]>=2?13:10,ids[i]%2?"red":"black"])}};
  }
  function fineField(g){
    const flags=g.map(x=>x.includes(".")),f=pack([multi(g.filter(x=>!x.includes("."))),multi(g.filter(x=>x.includes(".")))]);
    return {r:f.r,cap:f.cap,decode:r=>{const [a,b]=f.decode(r);let i=0,j=0;return flags.map(x=>x?b[j++]:a[i++])}};
  }
  function runeCoder(n,k){
    const dp=Array.from({length:n},()=>Array(k+1).fill(0n));dp[0][0]=1n;
    for(let t=1;t<n;t++)for(let j=0;j<=k;j++)dp[t][j]=28n*dp[t-1][j]+(j?dp[t-1][j-1]:0n);
    const M=29n*dp[n-1][k],width=(t,j,repeat)=>repeat?(j?dp[t][j-1]:0n):dp[t][j];
    return {M,rank:a=>{let r=BigInt(a[0])*dp[n-1][k],j=k;for(let i=1;i<n;i++){const p=a[i-1],x=a[i],t=n-1-i;for(let y=0;y<x;y++)r+=width(t,j,y===p);if(x===p)j--}check(j===0&&r<M,"rune rank");return r},
      unrank:r=>{check(r>=0n&&r<M,"rune domain");let a=[Number(r/dp[n-1][k])],j=k;r%=dp[n-1][k];for(let i=1;i<n;i++){const p=a[i-1],t=n-1-i;let found=false;for(let y=0;y<29;y++){let w=width(t,j,y===p);if(r<w){a.push(y);if(y===p)j--;found=true;break}r-=w}check(found,"rune branch")}check(j===0&&r===0n,"rune residual");return a}};
  }
  const ticks={4:[164,[19,14,10,7]],21:[36,[25,3,26]],35:[80,[13,18,16]],41:[218,[14,20,11,5]]};
  const frames=tx.split("%").slice(0,55).map((s,i)=>{
    const p=i<50?i:i+1,a=c.pages.find(x=>x.page===p).indices,n=a.length,b=s.match(/[\u16a0-\u16ff]/gu);
    check(b.length===n&&b.every((x,j)=>x===c.runes[a[j]]),"source alignment "+p);
    const g=s.split(/[\u16a0-\u16ff]/gu).slice(1,-1).map(g=>[...g].filter(x=>".-&$§".includes(x)).join("")).filter(Boolean);
    const d=ink.pages.find(x=>x.page===p)??{},spans=d.red_spans??[],marks=d.large_punctuation??[],tick=ticks[p];
    if(tick){const [off,word]=tick;check(same(a.slice(off-word.length+1,off+1),word),"original tick word "+p)}
    const side=pack([redField(spans,n),markField(marks,n),tick?{r:BigInt(tick[0]),cap:BigInt(n+1),decode:Number}:{r:0n,cap:1n,decode:()=>null},fineField(g)]);
    const sourceSide=[spans.map(x=>[x.start,x.length]),marks,tick?tick[0]:null,g];
    check(same(side.decode(side.r),sourceSide),"original side replay "+p);
    const k=a.slice(1).filter((x,j)=>x===a[j]).length,q=runeCoder(n,k),R=q.rank(a),M=q.M*side.cap,r=side.r*q.M+R;
    check(same(q.unrank(R),a),"rune replay "+p);
    return {p,a,n,k,q,side,sourceSide,M,r};
  });
  check(frames.length===55&&sum(frames.map(x=>x.n))===12956&&sum(frames.map(x=>x.k))===86,"original inventory");
  const native=donor.sections.flatMap(x=>[...x.source_text].map(y=>c.runes.indexOf(y)).filter(y=>y>=0));
  check(native.length===2979&&!native.includes(12)&&!native.includes(22),"native GP27");
  const tok=grid.pages.flatMap(x=>x.tokens),alpha=grid.alphabet;
  const grids=[60,59].map(radix=>{const a=radix===60?alpha:alpha.replace("f","");const b=tok.map(t=>a.indexOf(t[0])*radix+a.indexOf(t[1]));check(b.length===256&&b.every((x,i)=>x>=0&&x<=255&&(radix===59||x===grid.bytes[i])),"grid bytes");return {radix,seed:integer(b,256)}});
  const ceil=(a,b)=>a<=0n?0n:(a+b-1n)/b;
  const ioc=(a,q)=>{let h=Array(q).fill(0);for(const x of a)h[x]++;return sum(h.map(x=>x*(x-1)))/(a.length*(a.length-1))};
  const outputs=[];
  for(const A of [27,29]){
    const alphabet=Array.from({length:29},(_,i)=>i).filter(x=>A===29||![12,22].includes(x)),ref=native.map(x=>alphabet.indexOf(x));
    const h=Array(A).fill(1);for(const x of ref)h[x]++;
    const score=a=>sum(a.map(x=>Math.log(h[x]/(ref.length+A))))/a.length;
    const Ps=frames.map(x=>BigInt(A)**BigInt(x.n));
    const encode=(plaintext,s)=>{const out=[];for(let i=0;i<frames.length;i++){const f=frames[i],v=s*Ps[i]+integer(plaintext[i],A),r=v%f.M;s=v/f.M;out.push({r,runes:f.q.unrank(r%f.q.M),side:f.side.decode(r/f.q.M)})}return {out,terminal:s}};
    const inverse=(ranks,terminal)=>{let s=terminal;const plain=Array(frames.length);for(let i=frames.length-1;i>=0;i--){const v=s*frames[i].M+ranks[i];plain[i]=digits(v%Ps[i],A,frames[i].n);s=v/Ps[i]}return {plain,initial:s}};
    const plant=[];let off=0;for(const f of frames){plant.push(Array.from({length:f.n},(_,i)=>ref[(off+i)%ref.length]));off+=f.n}
    const e=encode(plant,3301n),d=inverse(e.out.map(x=>x.r),e.terminal);check(same(d.plain,plant)&&d.initial===3301n,"native plant");
    // Actual original side fields, no guessed sidecar.
    const ranks=frames.map(x=>x.r),orig=inverse(ranks,0n);
    const replay=encode(orig.plain,orig.initial);
    check(replay.terminal===0n&&replay.out.every((o,i)=>o.r===ranks[i]&&same(o.runes,frames[i].a)&&same(o.side,frames[i].sourceSide)),"full original replay");
    const p0=orig.plain.flat().slice(0,300),p16=orig.plain[frames.findIndex(x=>x.p===16)].slice(0,200),full=orig.plain.flat();
    const render=a=>a.map(x=>c.translit[alphabet[x]]).join(" ");
    const fits=grids.map(({radix,seed})=>{
      let lo=seed,hi=seed;
      for(let i=0;i<frames.length;i++){
        const f=frames[i],top=(hi+1n)*Ps[i]-1n-f.r;
        if(top<0n)return {radix,seedBits:bitlen(seed),firstContradiction:f.p};
        lo=ceil(lo*Ps[i]-f.r,f.M);hi=top/f.M;
        if(lo>hi)return {radix,seedBits:bitlen(seed),firstContradiction:f.p};
      }
      const z=inverse(ranks,lo);check(z.initial===seed,"literal seed interval exact");
      return {radix,seedBits:bitlen(seed),terminalAlternativesBits:bitlen(hi-lo+1n),minTerminalCandidateScore:score(z.plain.flat()),prefix:render(z.plain[0].slice(0,35))};
    });
    outputs.push({alphabet:A,originalMinimumInitialBits:bitlen(orig.initial),nativeControl:{runes:ref.length,ioc:ioc(ref,A),unigram:score(ref),plantRecovered:12956},original:{ioc:ioc(full,A),unigram:score(full),opening300:{ioc:ioc(p0,A),unigram:score(p0),prefix:render(p0.slice(0,40))},p16_200:{ioc:ioc(p16,A),unigram:score(p16),prefix:render(p16.slice(0,40))}},literalGrid:fits});
  }
  return {scope:{pages:55,runes:12956,repeats:86,inkSideCapacityBits:sum(frames.map(x=>bits(x.side.cap))),originalFieldsReplayed:55},outputs};
}
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8");
const inputs=["resources/transcriptions/lp2-image-corrected.txt","resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-ink-annotations.json","resources/liber-primus/lp2-grid-256.json","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(audit(read(inputs[0]),...inputs.slice(1).map(p=>JSON.parse(read(p)))),null,2));
