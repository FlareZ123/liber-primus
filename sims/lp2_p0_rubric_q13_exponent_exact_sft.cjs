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
 

const gcd=(a,b)=>{while(b)[a,b]=[b,a%b];return a;};
const pow=(a,e,m)=>{let y=1n;for(a%=m;e;e>>=1n,a=a*a%m)if(e&1n)y=y*a%m;return y;};
const phi=n=>28n*M(n-1);
function dlog(m){
 const N=M(m),order=phi(m),g=2n;if(pow(g,order/2n,N)===1n||pow(g,order/7n,N)===1n||(m>1&&pow(g,order/29n,N)===1n))throw Error("generator");
 const stages=[];let step=1n;
 for(let k=1;k<=m;k++){const modk=M(k),count=k===1?28:29,basis=pow(g,step,N),table=new Map();let x=1n;
 for(let j=0;j<count;j++){const a=x%modk;if(table.has(a))throw Error("bad stage");table.set(a,{j:BigInt(j),factor:inv(x,N)});x=x*basis%N;}
 stages.push({modk,step,table});step*=BigInt(count);}
 return x=>{let e=0n,y=x%N;for(const z of stages){const a=z.table.get(y%z.modk);if(!a)throw Error("not unit");e+=a.j*z.step;y=y*a.factor%N;}if(y!==1n||pow(g,e,N)!==x%N)throw Error("log replay");return e;};
}
function solveLinear(a,b,m,limit){const g=gcd(a,m);if(b%g)return [];const p=m/g;if(p===1n)throw Error("unbounded exponent anchor");const lo=(b/g)*inv(a/g,p)%p,out=[];for(let k=lo||p;k<limit;k+=p)if(gcd(k,28n*29n)===1n)out.push(k);return out;}
function ptransform(C,e,orient,mode,decode){const n=C.length,mm=M(n),v=int(C,orient);if(v%29n===0n)throw Error("whole register nonunit");const d=(mode==="encExponent")===decode?inv(e,phi(n)):e;return dig(pow(v,d,mm),n,orient);}

const {name,mode}=spec,orient="LE",A=M(13),Q=M(13),lg=dlog(13);let C,G,Ptrue,key,fitN;
if(name==="p0-2"){C=tape.slice(0,729);G=layout(W).filter(w=>w.start+w.w.length<=729);fitN=262;}
else{const sec=gold.sections.find(x=>x.name===name),ww=words(sec.source_text),i=name==="0_koan_1"?143:67,a=ww.slice(i);Ptrue=a.flat();G=layout(a);key=name==="0_koan_1"?7217839402186763921n:3159172617452389631n;while(gcd(key,812n)!==1n)key++;C=ptransform(Ptrue,key,orient,mode,false);fitN=Math.min(262,Math.floor(C.length/2));}
const lengths=G.slice(0,4).map(w=>w.w.length),[l,m,l3,l4]=lengths,n=l+m+l3+l4,B=M(l),R=M(m),T=M(n),H=phi(13),cl=lg(int(C.slice(0,13),orient)),g=gcd(cl,H),order=H/g,q=phi(l)/g,ot=phi(n)/g;
if(l+m!==13||2*l<13||3*l<n||g%29n===0n||phi(l)%g!==0n||ot>order*order||(order*order)%ot!==0n)throw Error("scope");
const ci=int(C.slice(0,n),orient),delta=pow(ci,q,T)-1n,delta2=delta*delta%T,clInv=inv(cl/g,order),t=(pow(2n,phi(l),Q)-1n)/B,ti=inv(t,R);
const L1=lex[l].map(w=>int(w,orient)).filter(p=>p%29n!==0n),L2=lex[m].map(w=>int(w,orient)),S3=new Set(lex[l3].map(w=>int(w,orient))),S4=new Set(lex[l4].map(w=>int(w,orient)));
const M3=M(l3),keys=new Set();let pairs=0,eligible=0,third=0,fourth=0,checked=0;const unit=x=>x%2n!==0n&&x%7n!==0n&&x%29n!==0n;
const start=Date.now();
for(const p1 of L1){
 const lp=lg(p1);if(lp%g)continue;const db=lp/g*clInv%order,lo=db%q,base=pow(ci,lo,T),alpha=inv(p1%R,R)*ti%R*clInv%R;
 const ds=[];for(const p2 of L2){pairs++;const d0=(db+q*(p2*alpha%R))%order;if(d0%29n!==0n&&(order%2n!==0n||d0%2n!==0n)&&(order%7n!==0n||d0%7n!==0n))ds.push(d0);}
 const test=(k,d)=>{checked++;const j=(d-lo)/q;const p=base*(1n+j*delta+(j*(j-1n)/2n)*delta2)%T;if(checked<2&&p%Q!==pow(ci,d,Q))throw Error("binomial");const tail=p/Q;if(!S3.has(tail%M3))return;third++;if(!S4.has(tail/M3))return;fourth++;keys.add(k);};
 eligible+=ds.length;
 if(mode==="decExponent"){for(const d0 of ds)for(let k=d0;k<A;k+=order)if(unit(k))test(k,k);}
 else if(ds.length){const pre=[1n];for(const d of ds)pre.push(pre.at(-1)*d%order);let a=inv(pre.at(-1),order);for(let i=ds.length-1;i>=0;i--){const d=ds[i],e0=a*pre[i]%order;a=a*d%order;for(let k=e0;k<A;k+=order)if(unit(k)){const dd=mod(d*(2n-k*d),ot);test(k,dd);}}}
}
const fitmod=M(fitN),ph=phi(fitN),cf=int(C.slice(0,fitN),orient),fws=span(G,13,fitN),hws=span(G,fitN,C.length),powers=[];for(let b=cf,i=0;i<ph.toString(2).length;i++,b=b*b%fitmod)powers.push(b);
let best=null;for(const k of keys){let d=mode==="encExponent"?inv(k,ph):k,p=1n;for(let j=0;d;d>>=1n,j++)if(d&1n)p=p*powers[j]%fitmod;const P=dig(p,fitN,orient),q=wordScore(P,fws,0),z=score(P.slice(13));if(!best||q.hit>best.hit||q.hit===best.hit&&z>best.z)best={k,hit:q.hit,all:q.all,z};}
let out=null;if(best){const P=ptransform(C,best.k,orient,mode,true),H=wordScore(P,hws,0);if(!same(ptransform(P,best.k,orient,mode,false),C))throw Error("replay");out={key:best.k.toString(),fitHit:best.hit,fitTotal:best.all,fitScore:best.z,holdHit:H.hit,holdTotal:H.all,holdScore:score(P.slice(fitN)),head:G.slice(0,12).map(w=>fmt(P.slice(w.start,w.start+w.w.length))).join(" "),exact:Ptrue?P.filter((x,i)=>x===Ptrue[i]).length:undefined};}
return {name,mode,lengths,n:C.length,fitN,trueKey:key?.toString(),g:g.toString(),pairs,eligible,checked,third,fourth,keys:keys.size,best:out,ms:Date.now()-start};
}

const specs=[{"mode":"decExponent","name":"p0-2"},{"mode":"decExponent","name":"0_koan_1"},{"mode":"decExponent","name":"0_loss_of_divinity"},{"mode":"encExponent","name":"p0-2"},{"mode":"encExponent","name":"0_koan_1"},{"mode":"encExponent","name":"0_loss_of_divinity"}];
const raw=files.map(p=>fs.readFileSync(p,"utf8"));
for(const spec of specs)console.log(JSON.stringify(run(raw,spec)));
