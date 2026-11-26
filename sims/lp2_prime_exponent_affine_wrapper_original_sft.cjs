'use strict';
const fs=require('node:fs');
const path=require('node:path');
function experiment(corpus,native,donorTexts){
  const M=29, N=12956, mod=x=>(x%M+M)%M;
  const assert=(x,m)=>{if(!x)throw Error(m)};
  const orig=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
  const split=corpus.pages.filter(p=>p.page<40).reduce((s,p)=>s+p.indices.length,0);
  assert(orig.length===N && split>0,"original corpus framing");
  const runeMap=new Map(corpus.runes.map((x,i)=>[x,i]));
  const nativeSeqs=native.sections.map(s=>[...s.source_text].filter(c=>runeMap.has(c)).map(c=>runeMap.get(c)));
  const unig=new Float64Array(29).fill(.5), big=new Float64Array(841).fill(.5), tri=new Float64Array(24389).fill(.5);
  for(const a of nativeSeqs){for(let i=0;i<a.length;i++){unig[a[i]]++;if(i>=1)big[a[i-1]*29+a[i]]++;if(i>=2)tri[(a[i-2]*29+a[i-1])*29+a[i]]++;}}
  const us=unig.reduce((s,x)=>s+x,0);const lu=Float64Array.from(unig,x=>Math.log(x/us));
  const lb=new Float64Array(841), lt=new Float64Array(24389);
  for(let i=0;i<29;i++){let n=0;for(let j=0;j<29;j++)n+=big[i*29+j];for(let j=0;j<29;j++)lb[i*29+j]=big[i*29+j]/n;}
  for(let ij=0;ij<841;ij++){let n=0;for(let k=0;k<29;k++)n+=tri[ij*29+k];for(let k=0;k<29;k++)lt[ij*29+k]=Math.log(.5*tri[ij*29+k]/n+.35*lb[(ij%29)*29+k]+.15*unig[k]/us);}
  const DIG=["TH","EO","NG","OE","AE","IA","EA"];
  const tokenMap=new Map(corpus.translit.map((x,i)=>[x,i]));
  function gpText(t){const out=[];for(const w of t.match(/[A-Za-z]+/g)||[]){const s=w.toUpperCase().replace(/QU/g,"CW").replace(/[KV]/g,"C").replace(/Z/g,"S");for(let i=0;i<s.length;){let token=s.startsWith("ING",i)?"NG":DIG.find(d=>s.startsWith(d,i))||s[i];let step=s.startsWith("ING",i)?3:token.length;assert(tokenMap.has(token),"GP token "+token);out.push(tokenMap.get(token));i+=step;}}return out;}
  const donors=donorTexts.map(gpText);
  function gcd(a,b){while(b){const t=a%b;a=b;b=t;}return a;}
  function inv(x,m){for(let y=1;y<m;y++)if(x*y%m===1)return y;throw Error("nonunit");}
  function pow(x,e){let z=1;while(e){if(e&1)z=z*x%29;x=x*x%29;e>>=1;}return z;}
  const powers=Array.from({length:28},(_,e)=>Uint8Array.from({length:29},(_,x)=>pow(x,e)));
  const inverseE=Array.from({length:28},(_,e)=>gcd(e,28)===1?inv(e,28):0);
  const sieve=new Uint8Array(250001), primes=[];
  for(let p=2;p<sieve.length&&primes.length<N;p++)if(!sieve[p]){if(gcd(p,28)===1)primes.push(p%28);if(p*p<sieve.length)for(let j=p*p;j<sieve.length;j+=p)sieve[j]=1;}
  assert(primes.length===N&&primes[0]===3,"prime clock");
  const laws=[{hold:false,reverse:false},{hold:true,reverse:false},{hold:false,reverse:true},{hold:true,reverse:true}];
  const inner=[];for(let a=1;a<29;a++)for(let b=0;b<29;b++)inner.push({a,b,map:Uint8Array.from({length:29},(_,z)=>mod(a*z+b)),scores:Float64Array.from({length:29},(_,z)=>lu[mod(a*z+b)])});
  const outer=[];for(let a=1;a<=14;a++)for(let b=0;b<29;b++)outer.push({a,b,map:Uint8Array.from({length:29},(_,c)=>mod(inv(a,29)*(c-b)))});
  function top2(f){let a=0,b=0;for(let j=0;j<29;j++){const v=f[j];if(v>=a){b=a;a=v;}else if(v>b)b=v;}return a+b;}
  function hist(a,start=0,end=a.length){const f=new Int32Array(29);for(let i=start;i<end;i++)f[a[i]]++;return f;}
  function decode(C,B,law){const out=new Uint8Array(C.length);let j=0;for(let i=0;i<C.length;i++){const z=B.map[C[i]], e=primes[j];out[i]=powers[law.reverse?e:inverseE[e]][z];if(!law.hold||z!==0)j++;}return out;}
  function encrypt(P,A,B,law){const out=new Uint8Array(P.length);const ai=inv(A.a,29);let j=0;for(let i=0;i<P.length;i++){const z=mod(ai*(P[i]-A.b)),e=primes[j];out[i]=mod(B.a*powers[law.reverse?inverseE[e]:e][z]+B.b);if(!law.hold||z!==0)j++;}return out;}
  const scoreTri=(a,start,end)=>{let s=0;for(let i=start;i<end;i++)s+=i<2?lu[a[i]]:lt[(a[i-2]*29+a[i-1])*29+a[i]];return s/(end-start);};
  function same(a,b){return a.length===b.length&&a.every((x,i)=>x===b[i]);}
  function search(C,truth=null){let best=null;const lawsOut=[];for(let l=0;l<laws.length;l++){const law=laws[l];let fullCap=0,heldCap=0,trainBest=-Infinity,heldBest=-Infinity, bestCapKey=null;const shortlist=[];const K=32;
    for(let bi=0;bi<outer.length;bi++){const B=outer[bi],z=decode(C,B,law),f=hist(z,0,split),h=hist(z,split),whole=f.map((x,j)=>x+h[j]);const cap=top2(whole);if(cap>fullCap){fullCap=cap;bestCapKey=[B.a,B.b];}heldCap=Math.max(heldCap,top2(h));
      for(let ai=0;ai<inner.length;ai++){const s=inner[ai].scores;let t=0,u=0;for(let j=0;j<29;j++){t+=s[j]*f[j];u+=s[j]*h[j];}trainBest=Math.max(trainBest,t);heldBest=Math.max(heldBest,u);if(shortlist.length<K||t>shortlist[shortlist.length-1].t){shortlist.push({ai,bi,t});shortlist.sort((x,y)=>y.t-x.t||x.bi-y.bi||x.ai-y.ai);if(shortlist.length>K)shortlist.pop();}}
    }
    let chosen=null;for(const q of shortlist){const A=inner[q.ai],B=outer[q.bi],z=decode(C,B,law),P=z.map(x=>A.map[x]),score=scoreTri(P,0,split);if(!chosen||score>chosen.score){chosen={a:A.a,b:A.b,outerA:B.a,outerB:B.b,law:l,score,heldScore:scoreTri(P,split,N),unigram:q.t/split,fullTop2:top2(hist(P)),heldTop2:top2(hist(P,split)),replay:same(encrypt(P,A,B,law),C),excerpt:[...P.slice(split,split+100)].map(x=>corpus.translit[x]).join(" "),accuracy:truth?P.reduce((s,x,i)=>s+(x===truth[i]),0):null};}}
    assert(chosen.replay,"original/plant replay");lawsOut.push({law:l,...law,fullTop2Cap:fullCap,heldTop2Cap:heldCap,capOuter:bestCapKey,allKeyBestTrainUnigram:trainBest/split,allKeyBestHeldUnigram:heldBest/(N-split),chosen});if(!best||chosen.score>best.score)best=chosen;
  }return {best,laws:lawsOut};}
  function windowFloor(t,n){assert(t.length>=n,"donor length");const f=hist(t,0,n);let min=top2(f),max=min,argmin=0;for(let i=n;i<t.length;i++){f[t[i-n]]--;f[t[i]]++;const v=top2(f);if(v<min){min=v;argmin=i-n+1;}max=Math.max(max,v);}return {windows:t.length-n+1,min,max,argmin};}
  const donorStats=donors.map((t,i)=>({donor:i,length:t.length,full:windowFloor(t,N),held:windowFloor(t,N-split)}));
  const original=search(orig);
  const controls=[];
  const specs=[{donor:0,start:10000,a:9,b:4,outerA:7,outerB:3,law:0},{donor:1,start:25000,a:17,b:18,outerA:13,outerB:21,law:1},{donor:2,start:7000,a:6,b:11,outerA:4,outerB:5,law:2},{donor:1,start:50000,a:23,b:27,outerA:11,outerB:19,law:3}];
  for(const s of specs){const P=Uint8Array.from(donors[s.donor].slice(s.start,s.start+N));assert(P.length===N,"plant length");const A={a:s.a,b:s.b},B={a:s.outerA,b:s.outerB},C=encrypt(P,A,B,laws[s.law]),r=search(C,P);controls.push({spec:s,selected:r.best,recovered:r.best.accuracy===N,truthTop2:top2(hist(P)),truthHeldTop2:top2(hist(P,split)),lawCaps:r.laws.map(x=>[x.fullTop2Cap,x.heldTop2Cap])});}
  return {N,split,held:N-split,clockFirst20:primes.slice(0,20),affineInput:inner.length,affineOutput:outer.length,allKeyRepresentations:inner.length*outer.length*laws.length,donorStats,original,controls,notes:"Output scale 1..14 is sufficient since every unit exponent is odd, and changing both outer and inverse-inner scales' signs yields the same decoder. For the concentration bound any fixed input permutation is allowed, not only affine. Trigram ranking is shortlisted from exact unigram optimization (32 per law), not an all-key trigram optimum."};
}
const root=path.resolve(__dirname,'..');
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const inputs=files.map(f=>fs.readFileSync(path.join(root,f),'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(inputs[0]),JSON.parse(inputs[1]),inputs.slice(2)),null,2));
