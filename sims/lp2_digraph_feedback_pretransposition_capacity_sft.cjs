'use strict';
// Run: node sims/lp2_digraph_feedback_pretransposition_capacity_sft.cjs
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt","im-results/lp2-digraph-arbitrary-bijection-linear-feedback-output.json","im-results/lp2-digraph-periodic-feedback-q4-output.json","im-results/lp2-digraph-periodic-feedback-q13-output.json"];
const inputs=paths.map(p=>{const b=fs.readFileSync(path.join(__dirname,'..',p));return {path:p,sha:crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),content:b.toString('utf8')}});
function experiment(inputs){
 const d=JSON.parse(inputs[0].content),M=29,B=841,assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%M+M)%M;
 const previous=JSON.parse(inputs[4].content),q4=JSON.parse(inputs[5].content),q13=JSON.parse(inputs[6].content);
 for(const x of [previous,q4,q13])assert(x.sourceBlobs[0]===inputs[0].sha,"previous source pin");
 const tokens=d.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
 function encode(s){const out=[];for(const w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){const [t,j]=w.startsWith("ING",i)?["ING",21]:w.startsWith("IO",i)?["IO",27]:tokens.find(([t])=>w.startsWith(t,i));out.push(j);i+=t.length}}return out}
 // Agent36's projective collision method, reusing published maxima for already tested source frames.
 const projection=Array.from({length:B},(_,r)=>Uint8Array.from({length:30},(_,t)=>t===29?r%29:(Math.floor(r/29)+(r%29)*t)%29));
 const diff=Array.from({length:29},(_,x)=>Uint8Array.from({length:29},(_,y)=>mod(x-y)));
 const scale=Array.from({length:29},(_,x)=>{let inv=0;for(let i=1;i<29;i++)if(x*i%29===1)inv=i;return Uint8Array.from({length:29},(_,y)=>inv*y%29)});
 function residual(b,a,c){const h=new Uint32Array(B);let score=0;for(let i=1;i<b.length;i++){const x=Math.floor(b[i-1]/29),y=b[i-1]%29,z=29*mod(Math.floor(b[i]/29)-Math.floor(a/29)*x-a%29*y)+mod(b[i]%29-Math.floor(c/29)*x-c%29*y);score+=h[z]++}return {score,h}}
 function blocks(a,phase){const b=[];for(let i=phase;i+1<a.length;i+=2)b.push(29*a[i]+a[i+1]);return b}
 function search(b){const n=b.length-1,x=Uint8Array.from(b,v=>Math.floor(v/29)),y=Uint8Array.from(b,v=>v%29),w=Array.from({length:30},()=>new Uint32Array(B));let constant=0;
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const dx=diff[x[i]][x[j]],dy=diff[y[i]][y[j]],ex=diff[x[i+1]][x[j+1]],ey=diff[y[i+1]][y[j+1]];if(!dx&&!dy){if(!ex&&!ey)constant++;continue}const s=scale[dx||dy],dir=dx?s[dy]:29;w[dir][29*s[ex]+s[ey]]++}
  let score=-1,key=[],ties=0;
  for(let a=0;a<B;a++){const p=projection[a];for(let c=0;c<B;c++){const q=projection[c];let v=constant;for(let t=0;t<30;t++)v+=w[t][29*p[t]+q[t]];if(v>score){score=v;key=[a,c];ties=1}else if(v===score)ties++}}
  assert(residual(b,...key).score===score,"exact direct winner");return {n,score,key,ties};
 }
 // Exact minimum ordered collisions among m nonnegative integer bins summing to n.
 function bal(n,m){if(m===0)return n===0?0:Infinity;const q=Math.floor(n/m),r=n%m;return m*q*(q-1)+2*q*r}
 // Exact largest top-k total possible over all histograms satisfying total n and Q ceiling.
 function bound(n,Q,k){const a=k*k,b=2*k*(29-k),c=(29-k)**2;let best=-1,witness=null;
  for(let z=0;z<=n;z++){const rem=n-z,lim=Q-bal(z,a);if(lim<0)continue;
   const q=Math.floor(rem/(b+c)),r=rem%(b+c);let lo=q*b+Math.min(r,b),hi=rem;
   if(bal(lo,b)+bal(rem-lo,c)>lim)continue;
   while(lo<hi){const m=Math.ceil((lo+hi)/2);if(bal(m,b)+bal(rem-m,c)<=lim)lo=m;else hi=m-1}
   if(2*z+lo>best){best=2*z+lo;witness=[z,lo,rem-lo]}
  }
  assert(witness!==null&&bal(witness[0],a)+bal(witness[1],b)+bal(witness[2],c)<=Q,"attainable balanced groups");return best;
 }
 // Verify exact maximization against direct enumeration in small nontrivial instances.
 for(const n of [11,40,100])for(const Q of [0,2,18,150])for(const k of [1,5,14,28]){let b=-1;for(let z=0;z<=n;z++)for(let y=0;y<=n-z;y++)if(bal(z,k*k)+bal(y,2*k*(29-k))+bal(n-z-y,(29-k)**2)<=Q)b=Math.max(b,2*z+y);assert(bound(n,Q,k)===b,"exact integer optimizer")}
 function cap(N,ls){const free=N-2*ls.reduce((s,x)=>s+x.n,0);assert(free>=0,"free runes");return Array.from({length:28},(_,i)=>free+ls.reduce((s,x)=>s+bound(x.n,2*x.score,i+1),0))}
 function merge(cs){return cs[0].map((_,i)=>Math.max(...cs.map(x=>x[i])))}
 function ranked(a){const h=new Int32Array(M);for(const x of a)h[x]++;h.sort().reverse();let s=0;return Array.from(h,v=>s+=v)}
 function scan(a,n,caps){const h=new Int32Array(M),rank=Array.from({length:M},(_,i)=>i),pos=new Int32Array(M);for(let i=0;i<n;i++)h[a[i]]++;
  rank.sort((x,y)=>h[y]-h[x]);rank.forEach((v,i)=>pos[v]=i);
  function move(x,delta){h[x]+=delta;let i=pos[x];if(delta>0){while(i>0&&h[x]>h[rank[i-1]]){const y=rank[i-1];rank[i]=y;pos[y]=i;i--}}else{while(i<M-1&&h[x]<h[rank[i+1]]){const y=rank[i+1];rank[i]=y;pos[y]=i;i++}}rank[i]=x;pos[x]=i}
  const out=caps.map(()=>({minMaxExcess:Infinity,at:-1,passes:0})),minRank=Array(28).fill(Infinity);let top=new Int32Array(M);
  for(let i=0;i+n<=a.length;i++){let s=0;for(let k=0;k<M;k++)top[k]=s+=h[rank[k]];
   for(let k=0;k<28;k++)minRank[k]=Math.min(minRank[k],top[k]);
   for(let j=0;j<caps.length;j++){let e=0;for(let k=0;k<28;k++)e=Math.max(e,top[k]-caps[j][k]);if(e<out[j].minMaxExcess){out[j].minMaxExcess=e;out[j].at=i}if(e===0)out[j].passes++}
   if(i===0||i+n===a.length||i%65536===0)assert(top.every((v,k)=>v===ranked(a.slice(i,i+n))[k]),"rolling rank");
   if(i+n<a.length&&a[i]!==a[i+n]){move(a[i],-1);move(a[i+n],1)}
  }return {windows:a.length-n+1,minRank,cases:out};
 }
 const donors=inputs.slice(1,4).map(x=>({name:x.path,a:encode(x.content)})),N=12956;
 const chapterN=[729,1145,1729,1903,1021,1433,1680,3008,308];
 const chapterCaps=previous.chapters.map((x,i)=>merge(x.phases.map(v=>cap(chapterN[i],[v]))));
 const fullCaps=[merge(previous.full.map(v=>cap(N,[v]))),merge(q4.result.map(v=>cap(N,v.ls))),merge(q13.result.map(v=>cap(N,v.ls))),chapterCaps[0].map((_,i)=>chapterCaps.reduce((s,v)=>s+v[i],0))];
 const full={N,names:["global-q1","global-q4","global-q13","chapter-private-q1"],caps:fullCaps,refs:donors.map(({name,a})=>({name,...scan(a,N,fullCaps)}))};
 const a=d.pages.slice(40,54).flatMap(x=>x.indices).slice(8);assert(a.length===3000,"black body");
 const bodyMax=[0,1].map(phase=>({phase,...search(blocks(a,phase))})),bodyCaps=merge(bodyMax.map(v=>cap(a.length,[v])));
 const body={N:a.length,maxima:bodyMax,caps:bodyCaps,refs:donors.map(({name,a})=>({name,...scan(a,3000,[bodyCaps])}))};
 function plant(P,seed,key){let x=seed>>>0;function next(){x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}function perm(n){const p=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=next()%(i+1);[p[i],p[j]]=[p[j],p[i]]}return p}
  const order=perm(P.length),sh=order.map(i=>P[i]),b=blocks(sh,0),pi=perm(B),inv=Array(B);pi.forEach((v,i)=>inv[v]=i);const C=[pi[b[0]]];
  for(let i=1;i<b.length;i++){const x=Math.floor(C[i-1]/29),y=C[i-1]%29,z=pi[b[i]];C.push(29*mod(Math.floor(z/29)+Math.floor(key[0]/29)*x+key[0]%29*y)+mod(z%29+Math.floor(key[1]/29)*x+key[1]%29*y))}
  const fit=search(C),truth=residual(C,...key),u=cap(P.length,[{n:C.length-1,score:truth.score}]),rank=ranked(P);assert(rank.slice(0,28).every((v,i)=>v<=u[i]),"planted bound");
  const back=[...sh.slice(0,2)];for(let i=1;i<C.length;i++){const x=Math.floor(C[i-1]/29),y=C[i-1]%29,z=29*mod(Math.floor(C[i]/29)-Math.floor(key[0]/29)*x-key[0]%29*y)+mod(C[i]%29-Math.floor(key[1]/29)*x-key[1]%29*y),p=inv[z];back.push(Math.floor(p/29),p%29)}
  const out=Array(P.length);order.forEach((v,i)=>out[v]=back[i]);assert(out.every((v,i)=>v===P[i]),"known full key replay");return {seed,key,fit,truthQ:2*truth.score,n:P.length,top8:rank[7],cap8:u[7],exactRecovered:out.length};
 }
 return {inputs:inputs.map(({path,sha})=>({path,sha})),full,body,plants:[plant(donors[0].a.slice(333,3333),0x402911,[137,722]),plant(donors[1].a.slice(444,3444),0x402912,[612,48])]};
}
console.log(JSON.stringify(experiment(inputs),null,2));
