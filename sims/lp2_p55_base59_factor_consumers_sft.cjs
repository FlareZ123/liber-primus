"use strict";
const fs=require("node:fs"),path=require("node:path");
function study(c){const p=25049452499506949n,q=494114755650988709396898675903506495573679579533633450389n,N=p*q,e=65537n;
const digits=x=>{let a=[];while(x){a.push(Number(x%29n));x/=29n;}return a.reverse()};
function exact(C,K){let cur=new Map([[0,{n:1n,prev:null}]]);for(let i=0;i<C.length;i++){let next=new Map();for(const [j,v] of cur){const add=(k,p)=>{let old=next.get(k);if(old)old.n+=v.n;else next.set(k,{n:v.n,prev:v,p});};if(C[i]===0)add(j,0);let P=(C[i]-K[j%K.length]+29)%29;if(P!==0)add(j+1,P);}if(!next.size)return {dead:i};cur=next;}let v=cur.values().next().value,plain=[];while(v.prev){plain.push(v.p);v=v.prev;}return {paths:String([...cur.values()].reduce((s,v)=>s+v.n,0n)),ends:[...cur.keys()],onePlain:plain.reverse().map(x=>c.translit[x]).join("")};}
const groups=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]],keyres=[p,q].map(x=>({factor:String(x),key:digits(x),cases:[...groups,[55,55],[56,56]].map(([a,b])=>({scope:`p${a}-${b}`,...exact(c.pages.slice(a,b+1).flatMap(p=>p.indices??[]),digits(x))}))}));
let w=0,t=1n;while(t<N){w++;t*=29n;}const val=a=>a.reduce((n,x)=>n*29n+BigInt(x),0n);
function eg(a,b){if(!b)return [a,1n,0n];let [g,x,y]=eg(b,a%b);return[g,y,x-a/b*y];}
let phi=(p-1n)*(q-1n),d=(eg(e,phi)[1]%phi+phi)%phi;
function pow(a,b,m){let r=1n;while(b){if(b&1n)r=r*a%m;b>>=1n;a=a*a%m;}return r;}
function pkcs(x){const h=x.toString(16).padStart(62,"0"),bytes=h.match(/../g).map(t=>parseInt(t,16));return bytes[0]===0&&bytes[1]===2&&bytes.slice(2).indexOf(0)>=8;}
const rsa=groups.map(([a,b])=>{let s=c.pages.slice(a,b+1).flatMap(p=>p.indices??[]),blocks=[];for(let i=0;i+w<=s.length;i+=w)blocks.push(val(s.slice(i,i+w)));const valid=blocks.filter(x=>x<N),plain=valid.map(x=>pow(x,d,N));if(plain.some((x,i)=>pow(x,e,N)!==valid[i]))throw Error("RSA replay");return {scope:`p${a}-${b}`,length:s.length,blocks:blocks.length,remainder:s.length%w,bad:blocks.length-valid.length,pkcs:plain.filter(pkcs).length};});
return {keyres,width:w,rsa,capacity:String(t)};}
const c=JSON.parse(fs.readFileSync(path.join(__dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"));console.log(JSON.stringify(study(c),null,2));
