"use strict";
const fs=require("node:fs");
function run(corpus,sources){
const map={"α":[24],"β":[17],"γ":[6],"δ":[23],"ε":[18],"ζ":[15],"η":[18],"θ":[2],"ι":[10],"κ":[5],"λ":[20],"μ":[19],"ν":[9],"ξ":[14],"ο":[3],"π":[13],"ρ":[4],"σ":[15],"ς":[15],"τ":[16],"υ":[1],"φ":[0],"χ":[5,8],"ψ":[13,15],"ω":[3]};
const m=x=>(x%29+29)%29, inv=Array.from({length:29},(_,x)=>{for(let y=1;y<29;y++)if(m(x*y)===1)return y;return 0});
const books=sources.map(s=>{let words=[];for(let l of s.content.split(/\r?\n/)){if(!/^\d+:\d+\s/.test(l))continue;let w=l.replace(/^\d+:\d+\s+/,"").replace(/\[\d+:\d+\]/g," ").trim().split(/\s+/);for(let x of w){let y=x.normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().replace(/[·.,;:!?()[\]'’\-]/g,"");if(!y)continue;if([...y].some(c=>!map[c]))throw Error("Unmapped "+y);words.push([...y].flatMap(c=>map[c]))}}return {p:s.p,sha:s.sha,P:words.flat()}});
const qset=[8,13],families=["add","affine"],clocks=["ordinary","Fhold"];
/** For known candidate plaintext, solve each phase's affine map exactly over GF29. */
function infer(P,at,C,q,fam,clock){
const x=new Int16Array(q).fill(-1),y=new Int16Array(q),A=new Int16Array(q).fill(fam==="add"?1:-1),B=new Int16Array(q).fill(-1);let j=0;
for(let i=0;i<C.length;i++){const p=P[at+i],c=C[i];if(clock==="Fhold"&&p===0){if(c!==0)return null;continue}const t=j++%q;
if(A[t]>=0){const b=m(c-A[t]*p);if(B[t]<0)B[t]=b;else if(B[t]!==b)return null;continue}
if(x[t]<0){x[t]=p;y[t]=c;continue}
if(x[t]===p){if(y[t]!==c)return null;continue}
const a=m((c-y[t])*inv[m(p-x[t])]);if(!a)return null;A[t]=a;B[t]=m(c-a*p)
}
return {A:Array.from(A),B:Array.from(B),j,x:Array.from(x),y:Array.from(y)};
}
function predict(P,at,key,q,clock){const C=[];let j=key.j;for(let i=80;i<160;i++){const p=P[at+i];if(clock==="Fhold"&&p===0){C.push(0);continue}const t=j++%q;if(key.A[t]<0||key.B[t]<0)return null;C.push(m(key.A[t]*p+key.B[t]))}return C}
function scan(C){const result=[];for(const q of qset)for(const fam of families)for(const clock of clocks){let prefix=0,under=0,complete=0,best=0,cand=[];for(let b=0;b<books.length;b++){const P=books[b].P;for(let i=0;i+160<=P.length;i++){let k=infer(P,i,C.slice(0,80),q,fam,clock);if(!k)continue;prefix++;const pred=predict(P,i,k,q,clock);if(!pred){under++;continue}const match=pred.reduce((s,x,i)=>s+(x===C[i+80]),0);best=Math.max(best,match);if(match===80)complete++;cand.push({b,i,k,match})}}result.push({q,fam,clock,prefix,under,complete,best,cand})}return result}
let seed=0x49424326;function ri(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return Math.floor((seed>>>0)/4294967296*n)}
let controls=[];for(const q of qset)for(const fam of families)for(const clock of clocks){let b=ri(books.length),P=books[b].P,at=ri(P.length-160),A=Array.from({length:q},()=>fam==="add"?1:1+ri(28)),B=Array.from({length:q},()=>ri(29)),C=[],j=0;for(let i=0;i<160;i++){const p=P[at+i];if(clock==="Fhold"&&p===0){C.push(0);continue}const t=j++%q;C.push(m(A[t]*p+B[t]))}const result=scan(C).find(x=>x.q===q&&x.fam===fam&&x.clock===clock);let truth=result.cand.find(c=>c.b===b&&c.i===at&&c.match===80&&c.k.A.every((v,i)=>v===A[i])&&c.k.B.every((v,i)=>v===B[i]));if(!truth||result.prefix!==1||result.complete!==1)throw Error("Control gate fail "+JSON.stringify({q,fam,clock,b,at,result}));controls.push({q,fam,clock,b,at,A,B,prefix:result.prefix,hold:80})}
const nulls=[];for(let n=0;n<4;n++){const C=Array.from({length:160},()=>ri(29));const result=scan(C);if(result.some(x=>x.prefix))throw Error("null prefix");nulls.push(result.map(x=>x.prefix))}
const C=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices??[]).slice(10279,10439);if(C.length!==160)throw Error("quote length");return {books:books.map(({p,sha,P})=>({p,sha,n:P.length})),placements:books.reduce((s,b)=>s+b.P.length-159,0),controls,nulls,original:scan(C)};
}
const src=[{"p":"JOH.txt","sha":"507a5a1a9e76e940d4b1365434dc343e68863bc5"},{"p":"AC.txt","sha":"0f0622229f8f8dd94515ec66cd8333ffe6787f13"},{"p":"RO.txt","sha":"59149159304ec3dff7d1c9fb8ddcfdbbb2c27120"}].map(s=>({...s,content:fs.readFileSync("resources/control/greek-stephens/"+s.p,"utf8")}));
console.log(JSON.stringify(run(JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8")),src),null,2));
