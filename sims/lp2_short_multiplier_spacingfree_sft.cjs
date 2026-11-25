"use strict";
const fs=require("node:fs");
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp2-transcription.txt"];
function fastLattice(u,R,B,A){
 const M=R*B,dot=(v,w)=>v[0]*w[0]*R*R+v[1]*w[1]*A*A,nearest=(n,d)=>n<0n?-nearest(-n,d):(2n*n+d-1n)/(2n*d);
 let v=[1n,u%M],w=[0n,M];for(;;){if(dot(w,w)<dot(v,v))[v,w]=[w,v];const q=nearest(dot(v,w),dot(v,v));if(q===0n)break;w=[w[0]-q*v[0],w[1]-q*v[1]];}
 let D=v[0]*w[1]-v[1]*w[0];if(D<0n){w=w.map(x=>-x);D=-D;}
 const floor=(n,d)=>n>=0n?n/d:-((-n+d-1n)/d),ceil=(n,d)=>-floor(-n,d);
 const coeff=(x,y)=>{const a=x,b=x*(A-1n),c=y*(-R),d=y*(R-1n);return {lo:(a<b?a:b)+(c<d?c:d),hi:(a>b?a:b)+(c>d?c:d),slope:y*R};};
 const c1=coeff(w[1],-w[0]),c2=coeff(-v[1],v[0]);
 return (p)=>{
  const p1=c1.slope*p,l1=ceil(c1.lo+p1,D),h1=floor(c1.hi+p1,D);if(l1>h1)return [];
  const p2=c2.slope*p,l2=ceil(c2.lo+p2,D),h2=floor(c2.hi+p2,D);if(l2>h2)return [];
  const lo=(p-1n)*R,hi=(p+1n)*R-1n,out=[];
  function inner(c,f,g,low,high){let l=low,h=high;for(const [b,k,L,H] of [[c*f[0],g[0],1n,A-1n],[c*f[1],g[1],lo,hi]]){if(k===0n){if(b<L||b>H)return;continue;}const L2=k>0n?ceil(L-b,k):ceil(b-H,-k),H2=k>0n?floor(H-b,k):floor(b-L,-k);if(L2>l)l=L2;if(H2<h)h=H2;}for(let z=l;z<=h;z++)out.push(c*f[0]+z*g[0]);}
  if(h1-l1<=h2-l2){for(let c=l1;c<=h1;c++)inner(c,v,w,l2,h2);}else{for(let c=l2;c<=h2;c++)inner(c,w,v,l1,h1);}return out;
 };
}
function toy(){let cases=0;for(let A=2n;A<25n;A++)for(let R=1n;R<9n;R++)for(let B=2n;B<8n;B++){const u=(A*R*13n+5n)%(R*B),p=(R+A)%B,lo=(p-1n)*R,hi=(p+1n)*R-1n;const got=new Set(fastLattice(u,R,B,A)(p).map(String));const exp=new Set();for(let a=1n;a<A;a++){const y=a*u%(R*B);if([y,y-R*B,y+R*B].some(t=>t>=lo&&t<=hi))exp.add(String(a));}if(got.size!==exp.size||[...got].some(x=>!exp.has(x)))throw Error("toy mismatch");cases++;}return cases;}
function run(raw,spec) {
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const id=a=>String.fromCharCode(...a.map(x=>65+x)),nums=s=>Array.from(s,x=>x.charCodeAt(0)-65);
 const words=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(t=>[...t].map(x=>ix.get(x))).filter(w=>w.every(Number.isInteger));
 function word(w,alt=true){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));if(!q)throw Error(w);o.push(q.i);j+=q.t.length;}return o;}
 const hold=new Set(["0_koan_1","0_loss_of_divinity"]);
 const train=gold.sections.filter(s=>!hold.has(s.name)).map(s=>words(s.source_text));
 const types=new Set();for(const a of train)for(const w of a)types.add(id(w));for(const l of raw[2].split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+(\d+)$/i);if(m)for(const alt of [true,false])types.add(id(word(m[1],alt)));}
 const lex=Array.from({length:30},()=>[]);for(const w of types)if(w.length<30)lex[w.length].push(nums(w));
 const uni=new Float64Array(29),bi=new Float64Array(29**2),tri=new Float64Array(29**3);let total=0;for(const a of train){const t=a.flat();for(let i=0;i<t.length;i++){uni[t[i]]++;total++;if(i)bi[t[i-1]*29+t[i]]++;if(i>1)tri[(t[i-2]*29+t[i-1])*29+t[i]]++;}}
 const lm=new Float64Array(29**3);for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++){const p0=(uni[c]+0.5)/(total+14.5),p1=(bi[b*29+c]+8*p0)/(uni[b]+8),p2=(tri[(a*29+b)*29+c]+8*p1)/(bi[a*29+b]+8);lm[(a*29+b)*29+c]=Math.log(p2);}
 const score=t=>{let s=0;for(let i=2;i<t.length;i++)s+=lm[(t[i-2]*29+t[i-1])*29+t[i]];return s/Math.max(1,t.length-2);};
 const M=n=>29n**BigInt(n),mod=(x,m)=>(x%m+m)%m;
 function inv(a,m){let [r,s,t,u]=[m,a,0n,1n];while(s){const q=r/s;[r,s,t,u]=[s,r-q*s,u,t-q*u];}if(r!==1n)throw Error("nonunit "+a);return mod(t,m);}
 function int(a,orient){const v=orient==="BE"?a:a.slice().reverse();return v.reduce((n,x)=>n*29n+BigInt(x),0n);}
 function dig(v,n,orient){const a=Array(n);for(let i=0;i<n;i++){a[orient==="BE"?n-1-i:i]=Number(v%29n);v/=29n;}if(v)throw Error("overflow");return a;}
 function transform(a,k,orient,mode,decode){const m=M(a.length);const mul=(mode==="encMultiplier")===decode?inv(k,m):k;return dig(int(a,orient)*mul%m,a.length,orient);}
 function same(a,b){return a.length===b.length&&a.every((x,i)=>x===b[i]);}
 const fmt=t=>t.map(x=>gp.translit[x]).join(""),span=(a,lo,hi)=>a.filter(w=>w.start>=lo&&w.start+w.w.length<=hi);
 function wordScore(p,ws,base){let hit=0,all=0;for(const w of ws){all+=w.w.length;if(types.has(id(p.slice(w.start-base,w.start-base+w.w.length))))hit+=w.w.length;}return {hit,all};}
 function layout(a){let off=0;return a.map(w=>{const p={w,start:off};off+=w.length;return p;});}
 const W=[];let w=[];for(const c of raw[3].split("%").slice(0,55).join("%")){if(ix.has(c))w.push(ix.get(c));else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&w.length){W.push(w);w=[];}}if(w.length)W.push(w);
 const tape=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);if(W.length!==2896||tape.length!==12956||!same(W.flat(),tape))throw Error("source mismatch");
 
const m=11,A=M(8),B=M(m),set=new Set();for(const w of types)for(let i=0;i+m<=w.length;i++)set.add(w.slice(i,i+m));for(const a of train){const t=id(a.flat());for(let i=0;i+m<=t.length;i++)set.add(t.slice(i,i+m));}
const {name,orient,lo,hi}=spec,fragments=[...set].map(x=>int(nums(x),orient));let C,Ptrue,key;
if(name==="p0-2")C=tape.slice(0,729);else if(name==="p54body-55")C=tape.slice(12657);else {const sec=gold.sections.find(x=>x.name===name);Ptrue=words(sec.source_text).flat();key=name==="0_koan_1"?402723200677n:345678912347n;C=transform(Ptrue,key,orient,"decMultiplier",false);}
const ci=int(C,orient),n=C.length,keys=new Map(),start=Date.now();let approxCount=0,exactCount=0;
for(let i=lo;i+m<=hi;i++){const d=orient==="BE"?n-i-m:i,D=M(d),R=M(Math.min(d,8)),T=D/R,u=(ci%(D*B))/T,enumerate=fastLattice(u,R,B,A);for(const p of fragments){for(const k of enumerate(p)){approxCount++;if(k%29n===0n||(k*ci/D)%B!==p)continue;exactCount++;keys.set(k,(keys.get(k)||0)+1);}}}
let best=null,maxSupport=0;for(const [k,support] of keys){if(support>maxSupport)maxSupport=support;const P=transform(C,k,orient,"decMultiplier",true),fit=score(P.slice(lo,hi));if(!best||fit>best.fit)best={key:k.toString(),fit,support,P};}
if(best){const H=lo===0?best.P.slice(hi):best.P.slice(0,lo);best.hold=score(H);best.exact=Ptrue?best.P.filter((x,i)=>x===Ptrue[i]).length:undefined;best.head=fmt(best.P.slice(0,60));if(!same(transform(best.P,BigInt(best.key),orient,"decMultiplier",false),C))throw Error("replay");delete best.P;}
return {name,orient,n,lo,hi,fragments:fragments.length,approxCount,exactCount,keys:keys.size,maxSupport,trueKey:key?.toString(),trueSupport:key?keys.get(key):undefined,best,elapsedMs:Date.now()-start};}
const specs=[{"name":"p0-2","orient":"BE","lo":0,"hi":262},{"name":"p54body-55","orient":"BE","lo":0,"hi":223},{"name":"0_koan_1","orient":"BE","lo":390,"hi":780},{"name":"0_loss_of_divinity","orient":"BE","lo":0,"hi":377},{"name":"p0-2","orient":"LE","lo":0,"hi":262},{"name":"p54body-55","orient":"LE","lo":0,"hi":223},{"name":"0_koan_1","orient":"LE","lo":390,"hi":780},{"name":"0_loss_of_divinity","orient":"LE","lo":0,"hi":377}];
const raw=files.map(p=>fs.readFileSync(p,"utf8"));
console.log(JSON.stringify({toy:toy(),runs:specs.map(x=>run(raw,x))},null,2));
