"use strict";
const fs=require("node:fs");
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp2-transcription.txt"];
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
 


const N=27,D=27,Id=Uint8Array.from({length:729},(_,i)=>i%28===0?1:0),mod29=x=>(x%29+29)%29;
function mul(A,B){const C=new Uint8Array(729);for(let i=0;i<N;i++)for(let j=0;j<N;j++){let z=0;for(let k=0;k<N;k++)z+=A[i*N+k]*B[k*N+j];C[i*N+j]=z%29;}return C;}
function power(A,e){let r=Id;for(;e;e>>=1n,A=mul(A,A))if(e&1n)r=mul(r,A);return r;}
const shift=(A,k)=>Uint8Array.from(A,(x,i)=>mod29(x+k*Id[i])),scale=(A,k)=>Uint8Array.from(A,x=>mod29(k*x));
const reflect=A=>Uint8Array.from(A,(_,i)=>A[(26-Math.floor(i/27))*27+i%27]);
function invert(A){const n=A.length,a=A.map((r,i)=>[...r,...Array.from({length:n},(_,j)=>i===j?1:0)]);for(let i=0;i<n;i++){const j=a.findIndex((r,k)=>k>=i&&r[i]!==0);if(j<0)return null;[a[i],a[j]]=[a[j],a[i]];const z=Number(inv(BigInt(a[i][i]),29n));a[i]=a[i].map(x=>x*z%29);for(let j=0;j<n;j++)if(j!==i){const z=a[j][i];a[j]=a[j].map((x,k)=>mod29(x-z*a[i][k]));}}return a.map(r=>r.slice(n));}
function dot(a,b){let z=0;for(let j=0;j<a.length;j++)z+=a[j]*b[j];return z%29;}

const {name,flip=false}=spec;let C,G,Ptrue,fitN=262;
if(name==="p0-2"){C=Uint8Array.from(tape.slice(0,729));G=layout(W).filter(w=>w.start+w.w.length<=729);}
else{const sec=gold.sections.find(x=>x.name===name),ww=words(sec.source_text),i=name==="0_koan_1"?143:67,a=[...ww.slice(i),...ww.slice(0,i)];Ptrue=Uint8Array.from(a.flat().slice(0,729));G=layout(a).filter(w=>w.start+w.w.length<=729);C=power(Ptrue,11n);}
const A=flip?reflect(C):C,basis=[Id];for(let i=1;i<D;i++)basis.push(mul(basis.at(-1),A));const V=basis.map(b=>flip?reflect(b):b),H=Array.from({length:729},(_,i)=>V.map(b=>b[i]));
const anchors=span(G,0,fitN).filter(w=>!Ptrue||types.has(id(w.w))).sort((a,b)=>b.w.length-a.w.length||a.start-b.start).slice(0,3);
const pos=anchors.flatMap(w=>Array.from({length:w.w.length},(_,i)=>w.start+i)),m=pos.length,chosen=[],piv=[],R=[];
for(let i=0;i<m;i++){const v=H[pos[i]].slice();for(let k=0;k<R.length;k++){const a=v[piv[k]];for(let j=0;j<D;j++)v[j]=mod29(v[j]-a*R[k][j]);}const p=v.findIndex(Boolean);if(p<0)continue;const z=Number(inv(BigInt(v[p]),29n));R.push(v.map(a=>a*z%29));piv.push(p);chosen.push(i);}
if(chosen.length!==D)return {name,flip,anchors:anchors.map(w=>[w.start,w.w.length]),rank:chosen.length};
const Hi=invert(chosen.map(i=>H[pos[i]])),J=Array.from({length:m},(_,i)=>chosen.includes(i)?Hi.map(row=>row[chosen.indexOf(i)]):null),L=H.map(r=>Uint8Array.from(J,q=>q?dot(r,q):0));
const rest=Array.from({length:m},(_,i)=>i).filter(i=>!chosen.includes(i)),K=rest.map(i=>Uint8Array.from(L[pos[i]],(x,j)=>mod29(x-(i===j?1:0))));
if(!rest.length||29**rest.length>Number.MAX_SAFE_INTEGER)throw Error("syndrome width");
let off=0;const domains=anchors.map(w=>{const n=w.w.length,o=off;off+=n;const b=K.map(r=>r.slice(o,o+n)),p=L.slice(0,fitN).map(r=>r.slice(o,o+n));return lex[n].map(w=>({w,s:Uint8Array.from(b,r=>dot(r,w)),p:Uint8Array.from(p,r=>dot(r,w))}));});
const enc=s=>s.reduce((z,x)=>z*29+x,0),index=new Map();for(const x of domains[2]){const k=enc(x.s);let a=index.get(k);if(!a)index.set(k,a=[]);a.push(x);}
const fws=span(G,0,fitN).filter(w=>!anchors.includes(w)),hws=span(G,fitN,729),n=rest.length,v=new Uint8Array(fitN);let pairs=0,keys=0,best=null;const start=Date.now();
for(const a of domains[0])for(const b of domains[1]){pairs++;let k=0;for(let i=0;i<n;i++)k=k*29+((58-a.s[i]-b.s[i])%29);const cset=index.get(k);if(!cset)continue;for(const c of cset){keys++;for(let i=0;i<fitN;i++)v[i]=(a.p[i]+b.p[i]+c.p[i])%29;const q=wordScore(v,fws,0),z=score(v);if(!best||q.hit>best.hit||q.hit===best.hit&&z>best.z)best={r:[...a.w,...b.w,...c.w],hit:q.hit,all:q.all,z};}}
let out=null;if(best){const P=L.map(r=>dot(r,best.r)),Hh=wordScore(P,hws,0),coef=Hi.map(r=>dot(r,chosen.map(i=>best.r[i])));if(!same(P,Array.from({length:729},(_,i)=>dot(V.map(b=>b[i]),coef))))throw Error("replay");if(!same(pos.map(i=>P[i]),best.r))throw Error("anchor");const decoded=flip?reflect(P):Uint8Array.from(P);if(!same(Array.from(mul(decoded,A)),Array.from(mul(A,decoded))))throw Error("noncommuting");out={coefficients:coef,fitHit:best.hit,fitTotal:best.all,fitScore:best.z,holdHit:Hh.hit,holdTotal:Hh.all,holdScore:score(P.slice(fitN)),head:G.slice(0,12).map(w=>fmt(P.slice(w.start,w.start+w.w.length))).join(" "),exact:Ptrue?P.filter((x,i)=>x===Ptrue[i]).length:undefined};}
return {name,flip,rank:D,anchors:anchors.map(w=>[w.start,w.w.length]),domains:domains.map(x=>x.length),checks:rest.length,pairs,keys,best:out,ms:Date.now()-start};
}

const specs=[{"name":"p0-2"},{"name":"p0-2","flip":true},{"name":"0_koan_1"},{"name":"0_loss_of_divinity"}];
const raw=files.map(p=>fs.readFileSync(p,"utf8"));
for(const spec of specs)console.log(JSON.stringify(run(raw,spec)));
