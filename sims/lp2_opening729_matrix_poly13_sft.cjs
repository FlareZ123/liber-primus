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
 


const N=27,D=13,Id=Uint8Array.from({length:729},(_,i)=>i%28===0?1:0),mod29=x=>(x%29+29)%29;
function mul(A,B){const C=new Uint8Array(729);for(let i=0;i<N;i++)for(let j=0;j<N;j++){let z=0;for(let k=0;k<N;k++)z+=A[i*N+k]*B[k*N+j];C[i*N+j]=z%29;}return C;}
function power(A,e){let r=Id;for(;e;e>>=1n,A=mul(A,A))if(e&1n)r=mul(r,A);return r;}
const shift=(A,k)=>Uint8Array.from(A,(x,i)=>mod29(x+k*Id[i])),scale=(A,k)=>Uint8Array.from(A,x=>mod29(k*x));
const reflect=A=>Uint8Array.from(A,(_,i)=>A[(26-Math.floor(i/27))*27+i%27]);
function invert(A){const n=A.length,a=A.map((r,i)=>[...r,...Array.from({length:n},(_,j)=>i===j?1:0)]);for(let i=0;i<n;i++){const j=a.findIndex((r,k)=>k>=i&&r[i]!==0);if(j<0)return null;[a[i],a[j]]=[a[j],a[i]];const z=Number(inv(BigInt(a[i][i]),29n));a[i]=a[i].map(x=>x*z%29);for(let j=0;j<n;j++)if(j!==i){const z=a[j][i];a[j]=a[j].map((x,k)=>mod29(x-z*a[i][k]));}}return a.map(r=>r.slice(n));}
function dot(a,b){let z=0;for(let j=0;j<a.length;j++)z+=a[j]*b[j];return z%29;}
const {name,flip=false}=spec;let C,G,Ptrue,key,fitN=262;
if(name==="p0-2"){C=Uint8Array.from(tape.slice(0,729));G=layout(W).filter(w=>w.start+w.w.length<=729);}
else{const sec=gold.sections.find(x=>x.name===name),ww=words(sec.source_text),i=name==="0_koan_1"?143:67,a=[...ww.slice(i),...ww.slice(0,i)];Ptrue=Uint8Array.from(a.flat().slice(0,729));G=layout(a).filter(w=>w.start+w.w.length<=729);const order=name==="0_koan_1"?8948001124188974025360n:105280501585190501232597819292755591720n;const u=5,v=7,w=1,k=11,base=scale(shift(Ptrue,-w),Number(inv(BigInt(u),29n)));C=shift(power(base,inv(BigInt(k),order)),-v);if(!same(Array.from(shift(scale(power(shift(C,v),BigInt(k)),u),w)),Array.from(Ptrue)))throw Error("bad plant");key={u,v,w,k};}
if(flip&&Ptrue)throw Error("plant reflection not needed");
const A=flip?reflect(C):C,basis=[Id];for(let i=1;i<D;i++)basis.push(mul(basis.at(-1),A));const V=basis.map(b=>flip?reflect(b):b);
const H=Array.from({length:729},(_,i)=>V.map(b=>b[i])),Hi=invert(H.slice(0,D));if(!Hi)return {name,flip,rankDeficient:true};const J=Array.from({length:D},(_,j)=>Hi.map(r=>r[j])),L=H.map(r=>Uint8Array.from(J,q=>dot(r,q)));
if(L.slice(0,D).some((r,i)=>r.some((x,j)=>x!==(i===j?1:0))))throw Error("inverse");
const [l,m,l3,l4]=G.slice(0,4).map(w=>w.w.length);if(l+m!==13)throw Error("rubric");const n=l3+l4,S3=new Set(lex[l3].map(w=>id(w))),S4=new Set(lex[l4].map(w=>id(w)));
const left=lex[l].map(w=>({w,v:Uint8Array.from(L.slice(13,13+n),r=>dot(r.slice(0,l),w))})),right=lex[m].map(w=>({w,v:Uint8Array.from(L.slice(13,13+n),r=>dot(r.slice(l),w))}));
const fws=span(G,13,fitN),hws=span(G,fitN,729),v=new Uint8Array(n);let pairs=0,third=0,fourth=0,best=null;
const start=Date.now();for(const a of left)for(const b of right){pairs++;for(let i=0;i<l3;i++)v[i]=(a.v[i]+b.v[i])%29;if(!S3.has(id(v.slice(0,l3))))continue;third++;for(let i=l3;i<n;i++)v[i]=(a.v[i]+b.v[i])%29;if(!S4.has(id(v.slice(l3))))continue;fourth++;const rub=[...a.w,...b.w],P=L.slice(0,fitN).map(r=>dot(r,rub)),q=wordScore(P,fws,0),z=score(P.slice(13));if(!best||q.hit>best.hit||q.hit===best.hit&&z>best.z)best={rub,hit:q.hit,all:q.all,z};}
let out=null;if(best){const P=L.map(r=>dot(r,best.rub)),H=wordScore(P,hws,0),coef=Hi.map(r=>dot(r,best.rub));if(!same(P,Array.from({length:729},(_,i)=>dot(V.map(b=>b[i]),coef))))throw Error("replay");out={coefficients:coef,fitHit:best.hit,fitTotal:best.all,fitScore:best.z,holdHit:H.hit,holdTotal:H.all,holdScore:score(P.slice(fitN)),head:G.slice(0,12).map(w=>fmt(P.slice(w.start,w.start+w.w.length))).join(" "),exact:Ptrue?P.filter((x,i)=>x===Ptrue[i]).length:undefined};}
return {name,flip,lengths:[l,m,l3,l4],key,pairs,third,fourth,best:out,ms:Date.now()-start};
}

const specs=[{"name":"p0-2"},{"name":"p0-2","flip":true},{"name":"0_koan_1"},{"name":"0_loss_of_divinity"}];
const raw=files.map(p=>fs.readFileSync(p,"utf8"));
for(const spec of specs)console.log(JSON.stringify(run(raw,spec)));
