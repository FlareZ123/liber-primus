'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-grid-256.json","resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
function experiment(raw){
const g=JSON.parse(raw[0]),c=JSON.parse(raw[1]),n=JSON.parse(raw[2]),mod=x=>(x%29+29)%29,check=(x,m)=>{if(!x)throw Error(m)},C=c.pages[55].indices,T=g.pages[0].tokens,remove=new Set([1,18,35,52]);
check(C.length===76&&T.length===80,"source size");
const invShear=i=>mod10(Math.floor(i/8)+2*(i%8-1))*8+i%8;
function mod10(x){return (x%10+10)%10}
const sh=Array.from({length:80},(_,i)=>(i+20)%80).map(invShear).filter(i=>!remove.has(i));
const spiral=[];let row=2,col=3,step=1,dir=0;const dirs=[[-1,0],[0,1],[1,0],[0,-1]],seen=new Set();
function add(){if(row>=0&&row<10&&col>=0&&col<8){const i=invShear(row*8+col);if(!remove.has(i)&&!seen.has(i)){seen.add(i);spiral.push(i)}}}add();
while(spiral.length<76){for(let j=0;j<2;j++){const [dr,dc]=dirs[dir++%4];for(let k=0;k<step;k++){row+=dr;col+=dc;add()}}step++;check(step<40,"spiral")}
check(new Set(sh).size===76&&new Set(spiral).size===76,"permutations");
const primes=[];for(let i=2;primes.length<300;i++){let ok=true;for(let j=2;j*j<=i;j++)if(i%j===0){ok=false;break}if(ok)primes.push(i)}
function encrypt(P,K,sign){let j=0;return P.map(p=>p===0?0:mod(p+sign*K[j++%K.length]))}
function inverse(C,K,sign){let states=[{j:0,p:[]}];for(let i=0;i<C.length;i++){const next=[];for(const s of states){if(C[i]===0)next.push({j:s.j,p:[...s.p,0]});const p=mod(C[i]-sign*K[s.j%K.length]);if(p!==0)next.push({j:s.j+1,p:[...s.p,p]})}states=next;if(!states.length)return {deadAt:i,paths:[]}}for(const s of states)check(encrypt(s.p,K,sign).join(",")===C.join(","),"roundtrip");return {deadAt:null,paths:states}}
const solved=n.sections.map(s=>({name:s.name,p:[...s.source_text].filter(x=>c.runes.includes(x)).map(x=>c.runes.indexOf(x))}));
const controls=solved.filter(s=>["0_welcome","0_koan_1"].includes(s.name)).map(s=>({...s,p:s.p.slice(0,76)}));check(controls.every(s=>s.p.length===76),"controls length");
const train=solved.filter(s=>!controls.some(z=>z.name===s.name));
const counts=new Map(),ctx=new Map();for(const s of train)for(let i=2;i<s.p.length;i++){const a=s.p.slice(i-2,i).join(","),b=a+","+s.p[i];counts.set(b,(counts.get(b)||0)+1);ctx.set(a,(ctx.get(a)||0)+1)}
function score(p){let z=0;for(let i=2;i<p.length;i++){const a=p.slice(i-2,i).join(","),b=a+","+p[i];z+=Math.log((1+(counts.get(b)||0))/(29+(ctx.get(a)||0)))}return z/(p.length-2)}
const rows=[];
for(const [radix,A] of [["base60",g.alphabet],["base59",g.alphabet.replace("f","")]]){const V=T.map(t=>A.length*A.indexOf(t[0])+A.indexOf(t[1]));for(const [name,order,fn] of [["shear",sh,x=>x],["spiral",spiral,x=>x],["shear-prime-totient",sh,x=>primes[x-1]-1],["line-circle",[1,18,35,52,51],x=>x],["circle-line",[51,1,18,35,52],x=>x],["reversed-line-circle",[52,35,18,1,51],x=>x]]){const K=order.map(i=>mod(fn(V[i])));for(const sign of [1,-1]){const r=inverse(C,K,sign);const positive=controls.map(s=>{const cp=encrypt(s.p,K,sign),p=inverse(cp,K,sign).paths;check(p.some(x=>x.p.join(",")===s.p.join(",")),"planted native control");return {name:s.name,paths:p.length,score:score(s.p)}});rows.push({radix,name,sign,deadAt:r.deadAt,paths:r.paths.map(s=>({consumed:s.j,score:score(s.p),text:s.p.map(i=>c.translit[i]).join(" "),indices:s.p})),positive})}}}
return {cipherF:C.flatMap((x,i)=>x===0?[i]:[]),shearOrder:sh,spiralOrder:spiral,training:train.map(s=>s.name),rows}
}
console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'))),null,2));
