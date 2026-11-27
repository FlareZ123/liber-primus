'use strict';
const fs=require('node:fs');
const experiment=function(corpus,native,gibran,shakespeare,emerson){
const n=29,W=13,mod=x=>(x%n+n)%n,prime=corpus.prime,C=corpus.pages.slice(0,3).flatMap(p=>p.indices),seed=C.slice(0,W),body=C.slice(W),fit=corpus.pages[0].indices.length-W;
const gm=new Map(corpus.translit.map((s,i)=>[s,i])),rm=new Map(corpus.runes.map((s,i)=>[s,i])),norm=lit=>{let D=[];for(let w of lit.toUpperCase().match(/[A-Z]+/g)){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");for(let i=0;i<w.length;){let q=w.slice(i,i+2);if(gm.has(q)){D.push(gm.get(q));i+=2}else D.push(gm.get(w[i++]));}}return D};
gibran=gibran.toUpperCase();let a=gibran.indexOf("ALMUSTAFA, THE CHOSEN");if(a>=0)gibran=gibran.slice(a);let b=gibran.indexOf("END OF THE PROJECT GUTENBERG");if(b>=0)gibran=gibran.slice(0,b);
const D=norm(gibran),train=[norm(shakespeare),norm(emerson),...native.sections.map(s=>[...s.source_text].filter(x=>rm.has(x)).map(x=>rm.get(x)))];
if(D.length!==48084||body.length!==716||fit!==249)throw Error("source");
let u=new Float64Array(n).fill(1),B=new Float64Array(n*n),T=new Float64Array(n*n*n);for(let P of train)for(let i=0;i<P.length;i++){u[P[i]]++;if(i)B[n*P[i-1]+P[i]]++;if(i>1)T[n*n*P[i-2]+n*P[i-1]+P[i]]++;}let U=u.reduce((x,y)=>x+y);for(let i=0;i<n;i++)u[i]/=U;for(let i=0;i<n;i++){let s=0;for(let j=0;j<n;j++)s+=B[n*i+j];for(let j=0;j<n;j++)B[n*i+j]=(B[n*i+j]+10*u[j])/(s+10)}for(let i=0;i<n*n;i++){let s=0;for(let j=0;j<n;j++)s+=T[n*i+j];for(let j=0;j<n;j++)T[n*i+j]=Math.log((T[n*i+j]+10*B[n*(i%n)+j])/(s+10))}
const score=(P,a,b)=>{let s=0;for(let i=Math.max(2,a);i<b;i++)s+=T[n*n*P[i-2]+n*P[i-1]+P[i]];return s/(b-Math.max(2,a))};
const chr=p=>String.fromCharCode(65+p),str=P=>P.map(chr).join(""),arr=s=>Array.from(s,x=>x.charCodeAt(0)-65),render=P=>P.map(p=>corpus.translit[p]).join(""),eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
const phi=s=>{let seen=0,k=1;for(let i=0;i<s.length;i++){let p=s.charCodeAt(i)-65;let factor=seen&(1<<p)?prime[p]:prime[p]-1;k=k*factor%n;seen|=1<<p;if(!k)break}return k};
const phiCheck=()=>{let count=Array(n).fill(0);for(let p of seed)count[p]++;let k=1n;for(let p=0;p<n;p++)if(count[p])k*=BigInt(prime[p]-1)*BigInt(prime[p])**BigInt(count[p]-1);if(Number(k%29n)!==phi(str(seed)))throw Error("phi");};phiCheck();
function encode(P,role,sign,hold,iv=seed){let state=str(iv),out=[],zeroShifts=0;for(let p of P){if(hold&&p===0){out.push(0);continue}let k=phi(state),c=mod(p+sign*k);if(k===0)zeroShifts++;out.push(c);state=state.slice(1)+chr(role==="plain"?p:c)}return {C:out,zeroShifts}}
function decode(C,role,sign,hold,truth=null,cap=1000000){let states=new Map([[str(seed)+"|",{state:str(seed),last:-1,prev:-1,score:0,out:"",count:1n,z:0}]]),deep=0,maxStates=1,trace=[],truthAlive=truth?true:null;
for(let i=0;i<C.length;i++){let c=C[i],next=new Map(),tp=truth?str(truth.slice(0,i+1)):null;let truePath=false;const emit=(q,p,k,h)=>{let state=h?q.state:q.state.slice(1)+chr(role==="plain"?p:c),out=q.out+chr(p),v=q.score+(q.prev<0?(q.last<0?Math.log(u[p]):Math.log(B[n*q.last+p])):T[n*n*q.prev+n*q.last+p]),key=state+"|"+chr(q.last)+chr(p),old=next.get(key),count=q.count+(old?old.count:0n),z=q.z+(!h&&k===0);if(!old||v>old.score)next.set(key,{state,last:p,prev:q.last,score:v,out,count,z});else old.count=count;if(tp&&out===tp)truePath=true};
for(let q of states.values()){let k=phi(q.state),p=mod(c-sign*k);if(hold&&c===0)emit(q,0,k,true);if(!hold||p!==0)emit(q,p,k,false)}
if(!next.size)return {status:"UNSAT",deep,deadAt:i,maxStates,trace,truthAlive};
if(next.size>cap)return {status:"UNKNOWN",deep,deadAt:i,maxStates:next.size,trace,truthAlive};
states=next;deep=i+1;maxStates=Math.max(maxStates,states.size);if(truth&&truthAlive&&!truePath)truthAlive=false;
if(deep===fit||deep===C.length)trace.push({deep,states:states.size,paths:([...states.values()].reduce((x,q)=>x+q.count,0n)).toString()});
}
let best=null;for(let q of states.values())if(!best||q.score>best.score)best=q;let P=arr(best.out),replay=eq(encode(P,role,sign,hold).C,C);if(!replay)throw Error("replay");return {status:"SAT",deep,maxStates,trace,truthAlive,accuracy:truth?P.reduce((x,p,i)=>x+(p===truth[i]),0):null,score:score(P,0,P.length),fit:score(P,0,fit),held:score(P,fit,P.length),zeroShifts:best.z,preview:render(P.slice(0,200)),replay};
}
let controls=[],original=[];for(let role of ["plain","cipher"])for(let sign of [-1,1])for(let hold of [false,true]){for(let i of [2001,12001]){let P=D.slice(i,i+body.length),x=encode(P,role,sign,hold),y=decode(x.C,role,sign,hold,P);controls.push({role,sign,hold,start:i,plantZeroShifts:x.zeroShifts,...y})}original.push({role,sign,hold,...decode(body,role,sign,hold)})}
return {seed,W,fit,body:body.length,controls,original};
};
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
console.log(JSON.stringify(experiment(...paths.map((p,i)=>i<2?JSON.parse(fs.readFileSync(p,'utf8')):fs.readFileSync(p,'utf8'))),null,2));
