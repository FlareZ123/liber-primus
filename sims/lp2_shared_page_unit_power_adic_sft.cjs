'use strict';
const fs=require('node:fs');
function experiment(corpus,native){
 const N=20,W=16,p=29n,mod=(a,m)=>(a%m+m)%m,order=j=>28n*p**BigInt(j-1),big=a=>a.reduceRight((s,d)=>p*s+BigInt(d),0n),digits=(x,j)=>Array.from({length:j},()=>{let d=Number(x%p);x/=p;return d});
 const gcd=(a,b)=>b?gcd(b,a%b):a;
 function inv(a,m){let [x,y,u,v]=[mod(a,m),m,1n,0n];while(y){let q=x/y;[x,y,u,v]=[y,x-q*y,v,u-q*v]}if(x!==1n)throw Error("nonunit exponent");return mod(u,m)}
 function pow(a,e,m){let z=1n;a%=m;while(e){if(e&1n)z=z*a%m;a=a*a%m;e>>=1n}return z}
 function valuation(x,j){let v=0;while(v<j&&x%p===0n){x/=p;v++}return {v,u:x}}
 function transform(x,e,j){const {v,u}=valuation(x,j);return v===j?0n:p**BigInt(v)*pow(u,e,p**BigInt(j-v))}
 const secs=native.sections.map(s=>({name:s.name,a:[...s.source_text].map(x=>native.runes.indexOf(x)).filter(x=>x>=0)}));
 const isDonor=s=>["0_koan_1","0_loss_of_divinity"].includes(s.name);
 function model(rev){const u=Array(29).fill(1),b=Array(841).fill(.5),t=Array(24389).fill(.25);for(const s of secs.filter(s=>!isDonor(s))){const a=rev?[...s.a].reverse():s.a;for(let i=0;i<a.length;i++){u[a[i]]++;if(i)b[a[i-1]*29+a[i]]++;if(i>1)t[(a[i-2]*29+a[i-1])*29+a[i]]++}}const us=u.reduce((a,b)=>a+b),bs=Array(29).fill(0),ts=Array(841).fill(0);for(let i=0;i<841;i++)bs[i/29|0]+=b[i];for(let i=0;i<24389;i++)ts[i/29|0]+=t[i];return {u:u.map(x=>Math.log(x/us)),b:b.map((x,i)=>Math.log(.8*x/bs[i/29|0]+.2*u[i%29]/us)),t:t.map((x,i)=>{let a=i/29|0,c=i%29,prev=a%29;return Math.log(.6*x/ts[a]+.3*b[prev*29+c]/bs[prev]+.1*u[c]/us)})}}
 function last(a,l){const j=a.length-1;return j===0?l.u[a[0]]:j===1?l.b[a[0]*29+a[1]]:l.t[(a[j-2]*29+a[j-1])*29+a[j]]}
 function score(A,l){let s=0,k=0;for(const a of A)for(let j=1;j<=a.length;j++){s+=last(a.slice(Math.max(0,j-3),j),l);k++}return s/k}
 function recover(C,l,truth){const X=C.map(big),fit=X.filter((_,i)=>i%4!==3),held=X.filter((_,i)=>i%4===3);let beam=[{e:0n,s:0}],trace=[];
 for(let j=1;j<=N;j++){const m=p**BigInt(j),step=j===1?1n:order(j-1),ks=Array.from({length:j===1?28:29},(_,i)=>BigInt(i)),next=[];
 for(const state of beam){const base=fit.map(x=>transform(x,state.e,j));const factors=fit.map(x=>{const {v,u}=valuation(x,j);if(v===j)return 0n;const q=p**BigInt(j-v);return pow(u,step,q)});let vals=[...base];for(const k of ks){const e=state.e+k*step;if(gcd(e,order(j))===1n){let s=state.s;for(const x of vals)s+=last(digits(x,j),l);next.push({e,s})}vals=vals.map((x,i)=>x*factors[i]%m)}}
 next.sort((a,b)=>b.s-a.s);beam=next.slice(0,W);if(!beam.length)throw Error("empty");trace.push({j,fit:beam[0].s/(fit.length*j),truthRetained:truth===null?null:beam.some(z=>z.e===mod(truth,order(j)))})}
 const e=beam[0].e,ei=inv(e,order(N)),P=X.map(x=>digits(transform(x,e,N),N)),replay=P.every((a,i)=>transform(big(a),ei,N)===X[i]);if(!replay)throw Error("roundtrip");
 return {e:String(e),fit:score(P.filter((_,i)=>i%4!==3),l),held:score(P.filter((_,i)=>i%4===3),l),replay,trace,P};
 }
 const pages=corpus.pages.slice(0,56).filter(s=>s.indices.length>=N),donors=secs.filter(isDonor).flatMap(s=>Array.from({length:Math.floor(s.a.length/N)},(_,i)=>s.a.slice(i*N,(i+1)*N))).slice(0,pages.length);
 if(pages.length!==55||donors.length!==55)throw Error("page/control count");
 // Exhaustively verify on mod 29^2, including every nonunit and zero.
 for(const e of [3n,1033n,3301n])for(let x=0n;x<p*p;x++)if(transform(transform(x,e,2),inv(e,order(2)),2)!==x)throw Error("exhaustive replay");
 const out={N,W,fitPages:pages.filter((_,i)=>i%4!==3).map(s=>s.page),heldPages:pages.filter((_,i)=>i%4===3).map(s=>s.page),original:[],plants:[],fixed:[],literalObstruction:[]};
 for(const rev of [false,true]){const orient=a=>rev?[...a].reverse():a,l=model(rev),C=pages.map(s=>orient(s.indices).slice(0,N)),D=donors.map(orient),o=recover(C,l,null),{P,...rest}=o;
 out.original.push({rev,...rest,sample:P.slice(0,5).map((a,i)=>({page:pages[i].page,text:orient(a).map(v=>corpus.translit[v]).join(" ")}))});
 let e=rev?123456789876543210123456789n:9876543212345678987654321n;while(gcd(e,order(N))!==1n)e++;const truth=mod(e,order(N)),plant=D.map(a=>digits(transform(big(a),inv(e,order(N)),N),N)),q=recover(plant,l,truth),{P:PP,...rr}=q;
 out.plants.push({rev,expected:String(truth),...rr,correct:PP.reduce((s,a,i)=>s+a.filter((v,j)=>v===D[i][j]).length,0),total:55*N});
 const all=pages.map(s=>orient(s.indices));out.literalObstruction.push({rev,valuationOne:all.map((a,i)=>({p:pages[i].page,v:valuation(big(a),a.length).v})).filter(a=>a.v===1).map(a=>a.p)});
 for(const k of [3n,1033n,3301n])for(const inverse of [false,true]){const P=all.map(a=>{const j=a.length,e=inverse?inv(k,order(j)):k,ei=inv(e,order(j)),x=big(a),y=transform(x,e,j);if(transform(y,ei,j)!==x)throw Error("full replay");return digits(y,j)});out.fixed.push({rev,k:String(k),inverse,fit:score(P.filter((_,i)=>i%4!==3),l),held:score(P.filter((_,i)=>i%4===3),l),sample:orient(P[0].slice(0,40)).map(v=>corpus.translit[v]).join(" "),replay:true})}
 }
 return out;
}
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json')),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json'))),null,2));
