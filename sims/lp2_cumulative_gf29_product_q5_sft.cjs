"use strict";
/** Cumulative GF29 product with exclusive literal F, five-consuming-phase exact maximum likelihood. */
function experiment(gp, texts) {
  const N=29,M=28,Q=5,iv=2, check=(v,m)=>{if(!v)throw Error(m)};
  const mod=x=>(x%N+N)%N;
  const inv=Array.from({length:N},(_,x)=>x?Array.from({length:M},(_,i)=>i+1).find(y=>mod(x*y)===1):0);
  const alphabet=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  /** @param {string} text @returns {number[]} */
  function encode(text) {
    const clean=text.replace(/^#.*$/gm," ").toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/Q/g,"C");
    return (clean.match(/[A-Z]+/g)||[]).flatMap(w=>{const out=[];for(let i=0;i<w.length;){const x=alphabet.find(a=>w.startsWith(a.s,i));check(x,`Unknown GP word ${w}`);out.push(x.i);i+=x.s.length}return out});
  }
  const native=texts.map(encode), train=native[1], uni=new Float64Array(N).fill(.5),bi=new Float64Array(N*N),tri=new Float64Array(N*N*N),bt=new Float64Array(N),tt=new Float64Array(N*N);
  for(let i=0;i<train.length;i++){uni[train[i]]++;if(i>=1){bi[train[i-1]*N+train[i]]++;bt[train[i-1]]++}if(i>=2){tri[(train[i-2]*N+train[i-1])*N+train[i]]++;tt[train[i-2]*N+train[i-1]]++}}
  const total=uni.reduce((a,b)=>a+b,0),lm=new Float64Array(N*N*N);
  for(let a=0;a<N;a++)for(let b=0;b<N;b++)for(let c=0;c<N;c++){const back=(bi[b*N+c]+20*uni[c]/total)/(bt[b]+20);lm[(a*N+b)*N+c]=Math.log((tri[(a*N+b)*N+c]+35*back)/(tt[a*N+b]+35))}
  const score=(p,start,end)=>{let s=0,n=0;for(let i=Math.max(2,start);i<end;i++){s+=lm[(p[i-2]*N+p[i-1])*N+p[i]];n++}return s/n};
  /** @param {number[]} p @param {number[]} k @returns {number[]} */
  function forward(p,k){let state=iv,t=0;return p.map(x=>{if(x===0)return 0;state=mod(state*k[t%Q]*x);t++;return state})}
  /** @param {number[]} c */
  function ratios(c){let state=iv,t=0;return c.map(x=>{if(x===0)return {d:0,t:-1};const d=mod(x*inv[state]);state=x;return {d,t:t++%Q}})}
  /** @param {{d:number,t:number}[]} z @param {number[]} k */
  function decode(z,k){return z.map(({d,t})=>d?mod(d*inv[k[t]]):0)}
  const equal=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  const idx=(a,b,c)=>(a*M+b)*M+c, lookup=Array.from({length:N},(_,d)=>Array.from({length:M},(_,k)=>mod(d*inv[k+1])));
  /** Exact max-sum over five consuming phases using preaggregated order-2 LM factors. */
  function fit(z,n){
    const f=Array.from({length:Q},()=>new Float64Array(M*M*M));let constant=0;
    for(let i=2;i<n;i++){
      const x=z.slice(i-2,i+1);let j=-1;for(const u of x)if(u.d)j=u.t;
      if(j<0){constant+=lm[0];continue}
      const slots=x.map(u=>u.d?(u.t-j+Q)%Q===0?2:(u.t-j+Q)%Q===Q-1?1:0:-1);
      check(x.every((u,k)=>!u.d||[(j+Q-2)%Q,(j+Q-1)%Q,j][slots[k]]===u.t),"Invalid factor phase");
      for(let a=0;a<M;a++)for(let b=0;b<M;b++)for(let c=0;c<M;c++){
        const ks=[a,b,c], p=x.map((u,k)=>slots[k]<0?0:lookup[u.d][ks[slots[k]]]);
        f[j][idx(a,b,c)]+=lm[(p[0]*N+p[1])*N+p[2]];
      }
    }
    let best=-Infinity,second=-Infinity,key=null,count=0;
    for(let a=0;a<M;a++)for(let b=0;b<M;b++)for(let c=0;c<M;c++)for(let d=0;d<M;d++){
      const base=f[2][idx(a,b,c)]+f[3][idx(b,c,d)];
      for(let e=0;e<M;e++){
        const s=constant+base+f[4][idx(c,d,e)]+f[0][idx(d,e,a)]+f[1][idx(e,a,b)];count++;
        if(s>best){second=best;best=s;key=[a+1,b+1,c+1,d+1,e+1]}else if(s>second)second=s;
      }
    }
    check(Math.abs(best/(n-2)-score(decode(z,key),0,n))<1e-9,"Factor score mismatch");
    return {key,count,fit:best/(n-2),margin:best-second};
  }
  const p7=gp.pages.find(p=>p.page===7).indices.slice(194,208);
  const lengths=[2,4,3,2,3];let off=0;const sourceKey=lengths.map(n=>{const k=p7.slice(off,off+n).reduce((a,b)=>mod(a*b),1);off+=n;return k});
  check(equal(sourceKey,[11,26,8,15,2]),"Source products changed");
  const pages=gp.pages.filter(p=>p.page>=8&&p.page<=14), cipher=pages.flatMap(p=>p.indices), split=pages[0].indices.length;
  check(split===255&&cipher.length===1729,"Source receiver changed");
  const z=ratios(cipher), direct=decode(z,sourceKey), learned=fit(z,split), guess=decode(z,learned.key);
  check(equal(forward(direct,sourceKey),cipher)&&equal(forward(guess,learned.key),cipher),"Original replay failed");
  const render=p=>p.map(x=>gp.translit[x]).join(" ");
  const original={split,n:cipher.length,sourceKey,direct:{fit:score(direct,0,split),holdout:score(direct,split,cipher.length),preview:render(direct.slice(0,100))},learned:{...learned,holdout:score(guess,split,cipher.length),preview:render(guess.slice(split,split+100))},originalF:cipher.filter(x=>x===0).length};
  const plants=[{donor:0,offset:10000,key:[4,19,7,27,13]},{donor:2,offset:30000,key:[21,6,14,9,2]}].map(({donor,offset,key})=>{
    const p=native[donor].slice(offset,offset+cipher.length),c=forward(p,key),r=ratios(c),learned=fit(r,split),d=decode(r,learned.key);
    check(equal(forward(d,learned.key),c)&&equal(decode(r,key),p),"Plant replay failed");
    return {donor,offset,key,learned,holdout:score(d,split,d.length),exactKey:equal(key,learned.key),exactFit:d.slice(0,split).filter((x,i)=>x===p[i]).length,exactHoldout:d.slice(split).filter((x,i)=>x===p[split+i]).length};
  });
  const all=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
  function window(a,n,target){let count=0,min=Infinity,max=-1,matches=0;for(let i=0;i<a.length;i++){count+=+(a[i]===0);if(i>=n)count-=+(a[i-n]===0);if(i>=n-1){min=Math.min(min,count);max=Math.max(max,count);matches+=+(count===target)}}return {nativeRunes:a.length,windows:a.length-n+1,min,max,matches}}
  const originalF=all.filter(x=>x===0).length,allF={length:all.length,originalF,windows:native.map(a=>window(a,all.length,originalF)),chapterWindows:native.map(a=>window(a,cipher.length,original.originalF))};
  return {original,plants,allF};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.join(__dirname,"..");const read=p=>fs.readFileSync(path.join(root,p),"utf8");const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];console.log(JSON.stringify(experiment(JSON.parse(read(paths[0])),paths.slice(1).map(read)),null,2));}
module.exports={experiment};
