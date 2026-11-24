#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),path=require("node:path");
function experiment(c){
const q=29,Q=q*q,mod=x=>((x%q)+q)%q,add=(a,b)=>mod(a%q+b%q)+q*mod((a/q|0)+(b/q|0)),sub=(a,b)=>mod(a%q-b%q)+q*mod((a/q|0)-(b/q|0));
const mul=(a,b)=>{let x=a%q,y=a/q|0,z=b%q,w=b/q|0;return mod(x*z+8*y*w)+q*mod(x*w+y*z+3*y*w)};
const inv=a=>{for(let b=1;b<Q;b++)if(mul(a,b)===1)return b;throw Error("noninvertible")};
let state=0x0c1cada3;const rand=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;};
const P=Array.from({length:840},()=>rand()&255),K={a:445,b:127,d:713};function enc(P,K){let prev=0;return P.map(p=>prev=add(add(mul(K.a,p),mul(K.b,prev)),K.d))}
const C=enc(P,K),source=c.pages.slice(33,40).flatMap(p=>p.indices),orig=[];for(let i=0;i<source.length;i+=2)orig.push(source[i]*29+source[i+1]);
const residual=(C,b)=>C.map((v,i)=>sub(v,mul(b,i===0?0:C[i-1])));
function recover(C){let min=Q,bests=[],bs=[],keys=[];for(let b=0;b<Q;b++){const R=[...new Set(residual(C,b))];if(R.length<min){min=R.length;bests=[b]}else if(R.length===min)bests.push(b);if(R.length>256)continue;bs.push({b,distinct:R.length});for(let ai=1;ai<Q;ai++){const T=R.map(v=>mul(ai,v));for(let e=0;e<Q;e++){let j=0;while(j<T.length&&add(T[j],e)<256)j++;if(j===T.length){let a=inv(ai);keys.push({a,b,d:sub(0,mul(a,e))});}}}}return {min,bests,bs,keys};}
const cut=600,cr=recover(C.slice(0,cut));const decode=(C,K)=>residual(C,K.b).map(v=>mul(inv(K.a),sub(v,K.d)));
const correct=cr.keys.map(k=>{const p=decode(C,k);return{...k,heldoutOctets:p.slice(cut).filter(v=>v<256).length,heldoutMatches:p.slice(cut).filter((v,i)=>v===P[cut+i]).length}});
const rr=recover(orig.slice(0,cut));return{model:"GF(29²), u²=3u+8; high digit*u+low; C_i=aP_i+bC_(i-1)+d, C_(-1)=0",originalPairLength:orig.length,control:{K,train:cut,trainingDistinct:new Set(P.slice(0,cut)).size,minimumResidualDistinct:cr.min,bestFeedbacks:cr.bests,feedbackSurvivors:cr.bs,keys:correct},original:{train:cut,minimumResidualDistinct:rr.min,bestFeedbacks:rr.bests,feedbackSurvivors:rr.bs,keys:rr.keys,heldout:orig.length-cut}};
}
const c=JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources/liber-primus/lp2-corpus.json"),"utf8"));
const z=experiment(c);console.log(JSON.stringify(z,null,2));if(z.original.keys.length||!z.control.keys.some(k=>k.heldoutMatches===240))process.exitCode=1;
