"use strict";
const fs=require("node:fs");
const run=function run(inputs){
const gp=JSON.parse(inputs[0]),S="F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" "),m=x=>(x%29+29)%29,supp=1-.664/3.448,lnN=Math.log(supp/28),lnR=Math.log(1-supp);
const tokens=S.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);
function encode(s){let a=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");while(w){const t=tokens.find(x=>w.startsWith(x[0]));if(!t)throw Error(w);a.push(t[1]);w=w.slice(t[0].length)}}return a}
function body(t){return t.split(/\*\*\* END OF/i)[0].replace(/^.*?\*\*\* START OF[^\n]*\n/is,"")}
const train=inputs.slice(1,3).map(x=>encode(body(x))),test=encode(body(inputs[3]));
const counts=Array.from({length:6},()=>new Map()),totals=Array.from({length:6},()=>new Map()),pow=Array.from({length:7},(_,i)=>29**i);for(let a of train)for(let i=0;i<a.length;i++){let key=a[i];for(let n=0;n<6&&n<=i;n++){if(n)key+=a[i-n]*pow[n];counts[n].set(key,(counts[n].get(key)||0)+1);let ctx=Math.floor(key/29);totals[n].set(ctx,(totals[n].get(ctx)||0)+1)}}
const T=train.reduce((n,x)=>n+x.length,0);function lp(ctx,n,p,order){let q=((counts[0].get(p)||0)+.5)/(T+14.5);for(let d=1;d<=Math.min(order-1,n);d++){let c=ctx%pow[d],v=totals[d].get(c)||0,w=[0,10,10,8,4,2][d];q=((counts[d].get(c*29+p)||0)+w*q)/(v+w)}return Math.log(q)}
function edge(C,K){return C.map((c,i)=>{let prev=C[i-1],e=[{end:i+1,p:m(c-K[i]),w:i&&c===prev?lnR:0}];if(i&&c!==prev){let p=m(prev-K[i]),w=0;for(let j=i;j<C.length;j++){let x=m(p+K[j]);if(x===C[j]){e.push({end:j+1,p,w:w+(x===C[j-1]?lnR:0)});break}if(x!==C[j-1]||C[j]===C[j-1])break;w+=lnN}}return e})}
function dec(C,K,order=6){let E=edge(C,K),D=Array.from({length:C.length+1},()=>new Map());D[0].set("0:0",{v:0,c:0,n:0});let states=0;for(let i=0;i<C.length;i++){states=Math.max(states,D[i].size);for(let s of D[i].values())for(let e of E[i]){let n=Math.min(order-1,s.n+1),c=(s.c*29+e.p)%pow[order-1],k=n+":"+c,v=s.v+e.w+lp(s.c,s.n,e.p,order),old=D[e.end].get(k);if(!old||v>old.v)D[e.end].set(k,{v,c,n,prev:s,p:e.p,i,j:e.end})}}let best=[...D.at(-1).values()].reduce((a,b)=>a.v>b.v?a:b),joint=best.v,events=[];while(best.prev){events.push(best);best=best.prev}events.reverse();let P=[],ctx=0,n=0,ll=0;for(let e of events){P.push(e.p);ll+=lp(ctx,n,e.p,order);ctx=(ctx*29+e.p)%pow[order-1];n=Math.min(order-1,n+1);for(let i=e.i;i<e.j-1;i++)if(m(e.p+K[i])!==C[i-1]||C[i]===C[i-1])throw Error("null replay");if(m(e.p+K[e.j-1])!==C[e.j-1])throw Error("real replay")}return {P,joint,ll:ll/P.length,nulls:C.length-P.length,states}}
let seed=0x2739c9ab;function ri(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return Math.floor((seed>>>0)/4294967296*n)}
function en(P,K){let C=[],N=[];for(let p of P)while(true){let i=C.length,c=m(p+K[i]);if(i&&c===C[i-1]&&ri(1e6)/1e6<supp){let z=ri(28);if(z>=c)z++;C.push(z);N.push(i)}else{C.push(c);break}}return {C,N}}
function edit(a,b){let d=Array.from({length:b.length+1},(_,i)=>i);for(let i=0;i<a.length;i++){let q=[i+1];for(let j=0;j<b.length;j++)q.push(Math.min(d[j+1]+1,q[j]+1,d[j]+(a[i]!==b[j])));d=q}return d.at(-1)}
function row(d,P){return {pos:d.P.reduce((n,x,i)=>n+(x===P[i]),0)/P.length,edit:edit(d.P,P),ll:d.ll,nulls:d.nulls,states:d.states}}

function posterior(C,K,order=4,knownLength=null){
 const E=edge(C,K),D=Array.from({length:C.length+1},()=>new Map()), logadd=(a,b)=>a===-Infinity?b:b===-Infinity?a:Math.max(a,b)+Math.log1p(Math.exp(-Math.abs(a-b)));
 const root={a:0,b:-Infinity,c:0,n:0,t:0,out:[]};D[0].set("0:0:0",root);
 for(let i=0;i<C.length;i++)for(const s of D[i].values())for(const e of E[i]){
  let t=s.t+1;if(knownLength!==null&&t>knownLength)continue;
  let n=Math.min(order-1,s.n+1),c=(s.c*29+e.p)%pow[order-1],k=t+":"+n+":"+c,w=e.w+lp(s.c,s.n,e.p,order),v=D[e.end].get(k);
  if(!v){v={a:-Infinity,b:-Infinity,c,n,t,out:[]};D[e.end].set(k,v)}v.a=logadd(v.a,s.a+w);s.out.push({v,w,e});
 }
 let Z=-Infinity;for(const s of D.at(-1).values())if(knownLength===null||s.t===knownLength){s.b=0;Z=logadd(Z,s.a)}
 if(!Number.isFinite(Z))return null;
 const marg=Array.from({length:C.length},()=>new Float64Array(29)),len=new Float64Array(C.length+1);
 for(const s of D.at(-1).values())if(s.b===0)len[s.t]+=Math.exp(s.a-Z);
 for(let i=C.length-1;i>=0;i--)for(const s of D[i].values())for(const {v,w,e} of s.out){s.b=logadd(s.b,w+v.b);marg[s.t][e.p]+=Math.exp(s.a+w+v.b-Z)}
 if(Math.abs(root.b-Z)>1e-8)throw Error("posterior normalization");
 const T=Array.from({length:C.length+1},()=>new Map());T[0].set(0,{v:0,t:0});let states=0;
 for(let i=0;i<C.length;i++){states=Math.max(states,D[i].size);for(const s of T[i].values())for(const e of E[i]){let t=s.t+1;if(knownLength!==null&&t>knownLength)continue;let v=s.v+marg[s.t][e.p],old=T[e.end].get(t);if(!old||v>old.v)T[e.end].set(t,{v,t,prev:s,e,i})}}
 let best=null;for(const s of T.at(-1).values())if((knownLength===null||s.t===knownLength)&&(!best||s.v>best.v))best=s;
 let ev=[],value=best.v;while(best.prev){ev.push(best);best=best.prev}ev.reverse();
 const P=ev.map(s=>s.e.p);for(const {i,e} of ev){for(let j=i;j<e.end-1;j++)if(m(e.p+K[j])!==C[j-1]||C[j]===C[j-1])throw Error("bad MBR null");if(m(e.p+K[e.end-1])!==C[e.end-1])throw Error("bad MBR real")}
 let ctx=0,n=0,ll=0;for(const p of P){ll+=lp(ctx,n,p,order);ctx=(ctx*29+p)%pow[order-1];n=Math.min(order-1,n+1)}
 return {P,ll:ll/P.length,states,nulls:C.length-P.length,expectedMatches:value,modeLength:len.indexOf(Math.max(...len)),lengthProbability:len[P.length]};
}

const native=JSON.parse(inputs[4]),map=new Map(native.runes.map((r,i)=>[r,i])),seqs=native.sections.map(s=>[s.name,[...s.source_text].filter(r=>map.has(r)).map(r=>map.get(r))]).filter(s=>s[1].length>=100);
seed=0x4b5281af;
const control=[];for(let i=0;i<120;i++){let kind=i<80?"native":"Gibran",length=120+ri(241),chosen=kind==="native"?seqs[ri(seqs.length)]:["Gibran",test],L=Math.min(length,chosen[1].length),at=ri(chosen[1].length-L+1),P=chosen[1].slice(at,at+L),K=Array.from({length:1200},()=>ri(29)),{C,N}=en(P,K),W=Array.from({length:C.length},()=>ri(29));let d=dec(C,K,4),q=posterior(C,K,4),oracle=posterior(C,K,4,L),wrong=posterior(C,W,4);control.push({kind,name:chosen[0],L,at,trueNulls:N.length,map:row(d,P),mbr:row(q,P),knownLength:row(oracle,P),wrongLL:wrong.ll,modeLength:q.modeLength,chosenLength:q.P.length,lengthProbability:q.lengthProbability})}
const groups={};for(const kind of ["native","Gibran","all"]){let c=control.filter(x=>kind==="all"||x.kind===kind);groups[kind]={n:c.length,maxWrong:Math.max(...c.map(x=>x.wrongLL))};for(const k of ["map","mbr","knownLength"]){let a=c.map(x=>x[k]);groups[kind][k]={pass:a.filter(x=>x.pos>=.85).length,exact:a.filter(x=>x.edit===0).length,meanPos:a.reduce((n,x)=>n+x.pos,0)/a.length,meanEdit:a.reduce((n,x)=>n+x.edit,0)/a.length,minLL:Math.min(...a.map(x=>x.ll)),maxStates:Math.max(...a.map(x=>x.states))}}}
return {groups,control,method:"exact posterior on legal event DAG with augmented output length; maximum expected positional matches over legal paths; no true length used except labelled oracle"};

};
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
