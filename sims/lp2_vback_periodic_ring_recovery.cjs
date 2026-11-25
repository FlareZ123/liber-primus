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

function backEncrypt(P,K){let C=[],J=[],R=[],j=0;for(let p of P){let before=j;while(j>0&&C.length&&m(p+K(j))===C.at(-1)&&ri(1e6)/1e6<supp)j--;R.push(before-j);J.push(j);C.push(m(p+K(j++)))}return {C,J,R}}
function backDecode(C,key,{beam=100,order=4,phase=null,start=null,offset=0}={}){
 let D=new Map(),states=0,pruned=0;
 if(start){let x={...start,v:0,prev:null};D.set(x.phase+":"+x.j+":"+x.n+":"+x.c,x)}
 else for(let ph=0;ph<(phase===null?key.length:1);ph++){let a=phase??ph;D.set(a+":0:0:0",{v:0,j:0,c:0,n:0,phase:a})}
 for(let i=0;i<C.length;i++){
  let next=new Map(),prev=i?C[i-1]:offset;
  if(!i&&!start)prev=-1;
  const cache=new Map();
  for(let s of D.values()){
   let ck=s.phase+":"+s.j,es=cache.get(ck);
   if(!es){let K=j=>key[(j+s.phase)%key.length],p=m(C[i]-K(s.j)),can=prev>=0&&C[i]===prev&&s.j>0;
    es=[{p,j:s.j+1,w:can?lnR:0,d:0}];
    if(prev>=0&&s.j>0){
     p=m(prev-K(s.j));let w=0;
     for(let j=s.j-1;j>=0;j--){w+=Math.log(supp);let c=m(p+K(j));if(c===C[i])es.push({p,j:j+1,w:w+(j>0&&c===prev?lnR:0),d:s.j-j});if(c!==prev||j===0)break}
    }cache.set(ck,es)
   }
   for(let e of es){let n=Math.min(order-1,s.n+1),c=(s.c*29+e.p)%pow[order-1],k=s.phase+":"+e.j+":"+n+":"+c,v=s.v+e.w+lp(s.c,s.n,e.p,order),old=next.get(k);if(!old||v>old.v)next.set(k,{v,j:e.j,n,c,phase:s.phase,prev:s,p:e.p,d:e.d})}
  }
  states=Math.max(states,next.size);if(next.size>beam){pruned++;let a=[...next].sort((a,b)=>b[1].v-a[1].v).slice(0,beam);next=new Map(a)}D=next;
 }
 let best=[...D.values()].reduce((a,b)=>a.v>b.v?a:b),last={j:best.j,n:best.n,c:best.c,phase:best.phase},v=best.v,ev=[];
 while(best.prev){ev.push(best);best=best.prev}ev.reverse();let P=ev.map(x=>x.p),R=ev.map(x=>x.d),cursor=start?.j??0,ctx=start?.c??0,n=start?.n??0,ll=0,phaseOut=last.phase;
 for(let i=0;i<C.length;i++){let p=P[i],prev=i?C[i-1]:start?offset:-1;for(let d=0;d<R[i];d++){if(cursor===0||m(p+key[(cursor+phaseOut)%key.length])!==prev)throw Error("backstep replay rejection");cursor--}if(m(p+key[(cursor+phaseOut)%key.length])!==C[i])throw Error("backstep replay emission");cursor++;ll+=lp(ctx,n,p,order);ctx=(ctx*29+p)%pow[order-1];n=Math.min(order-1,n+1)}
 if(cursor!==last.j)throw Error("cursor replay");
 return {P,R,phase:phaseOut,last,joint:v/C.length,ll:ll/C.length,states,pruned};
}
function canon(K){let s=K.join(","),best=K;for(let i=1;i<K.length;i++){let a=K.slice(i).concat(K.slice(0,i)),t=a.join(",");if(t<s){s=t;best=a}}return {s,key:best}}
const lp2=Float64Array.from({length:29*29},(_,i)=>lp(Math.floor(i/29),1,i%29,2)),lp1=Float64Array.from({length:29},(_,i)=>lp(0,0,i,1));
function ring(C,q,top=3){
 let F=Array.from({length:q},()=>new Float64Array(841));
 for(let i=1;i<C.length;i++){let f=F[(i-1)%q],c=C[i-1],d=C[i];for(let a=0;a<29;a++){let u=m(c-a)*29;for(let b=0;b<29;b++)f[a*29+b]+=lp2[u+m(d-b)]}}
 for(let a=0;a<29;a++)for(let b=0;b<29;b++)F[0][a*29+b]+=lp1[m(C[0]-a)];
 const cand=[];
 for(let a0=0;a0<29;a0++){let v=new Float64Array(29);v.fill(-Infinity);v[a0]=0;let B=[];
  for(let ph=0;ph<q-1;ph++){let w=new Float64Array(29),bck=new Int8Array(29);w.fill(-Infinity);let f=F[ph];for(let a=0;a<29;a++){let h=v[a];for(let b=0;b<29;b++){let s=h+f[a*29+b];if(s>w[b]){w[b]=s;bck[b]=a}}}v=w;B.push(bck)}
  for(let a=0;a<29;a++){let s=v[a]+F[q-1][a*29+a0];let K=[a];for(let j=B.length-1;j>=0;j--)K.push(B[j][K.at(-1)]);K.reverse();cand.push({K,s:s/C.length})}
 }
 cand.sort((a,b)=>b.s-a.s);return cand.slice(0,top)
}
function nominate(C,q){let keys=new Map();for(let n of [64,96])for(let i=0;i+n<=C.length;i+=16)for(let {K,s} of ring(C.slice(i,i+n),q,3)){let z=canon(K),old=keys.get(z.s);if(!old)keys.set(z.s,{key:z.key,s,hits:1});else{old.hits++;old.s=Math.max(old.s,s)}}return [...keys.values()].sort((a,b)=>b.hits-a.hits||b.s-a.s)}
const native=JSON.parse(inputs[4]),map=new Map(native.runes.map((r,i)=>[r,i])),ns=native.sections.map(s=>[s.name,[...s.source_text].filter(r=>map.has(r)).map(r=>map.get(r))]);
seed=0x31bacc88;
const control=[];
for(let i=0;i<20;i++){
 let q=i<12?8:13,L=729+i*13,at=ri(test.length-L),P=test.slice(at,at+L),K=Array.from({length:q},()=>ri(29)),{C,J,R}=backEncrypt(P,j=>K[j%q]),dev=480,nominations=nominate(C.slice(0,dev),q),target=canon(K).s,rank=nominations.findIndex(x=>canon(x.key).s===target),W=Array.from({length:q},()=>ri(29)),known=backDecode(C,K,{beam:256,phase:0}),wrong=backDecode(C,W,{beam:64});
 let fit=nominations.slice(0,20).map(c=>({key:c.key,fit:backDecode(C.slice(0,dev),c.key,{beam:64})})).sort((a,b)=>b.fit.joint-a.fit.joint),winner=fit[0],held=backDecode(C.slice(dev),winner.key,{beam:256,start:winner.fit.last,offset:C[dev-1]});
 control.push({q,L,at,key:K,backsteps:R.reduce((a,b)=>a+b,0),nominationRank:rank<0?null:rank+1,nominated:nominations.length,trueFit:rank>=0&&rank<20?fit.findIndex(x=>canon(x.key).s===target)+1:null,correctKey:canon(winner.key).s===target,known:row(known,P),wrongLL:wrong.ll,prefix:row(winner.fit,P.slice(0,dev)),held:row(held,P.slice(dev)),winnerKey:winner.key,heldJoint:held.joint});
}
return {supp,train:train.map(x=>x.length),control,method:"periodic known-key backstep beam; exact cyclic bigram maximization on 64/96 ordinary windows, top3 nominations per window, rank distinct cyclic keys by hits then score, top20 prefix fits; frozen key/cursor/context holdout"};

};
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
