'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
function experiment(d){
const mod=x=>(x%29+29)%29, inv=x=>{for(let i=1;i<29;i++)if(mod(x*i)===1)return i;throw Error("singular")};
function solve(X,Y){const n=X[0].length,m=Y[0].length,R=X.map((x,i)=>x.concat(Y[i]).map(mod));let rank=0;for(let j=0;j<n;j++){let k=R.findIndex((r,i)=>i>=rank&&r[j]!==0);if(k<0)continue;[R[k],R[rank]]=[R[rank],R[k]];R[rank]=R[rank].map(v=>mod(v*inv(R[rank][j])));for(let i=0;i<R.length;i++)if(i!==rank){const f=R[i][j];R[i]=R[i].map((v,l)=>mod(v-f*R[rank][l]))}rank++}const inconsistent=R.some(r=>r.slice(0,n).every(x=>!x)&&r.slice(n).some(x=>x));return {rank,inconsistent,W:rank===n&&!inconsistent?R.slice(0,n).map(r=>r.slice(n)):null}}
const apply=(x,W)=>W[0].map((_,j)=>mod(x.reduce((s,v,i)=>s+v*W[i][j],0))), eye=n=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>+(i===j)));
const lex=d.translit.slice().sort((a,b)=>b.length-a.length);function enc(s){return s.split(" ").flatMap(w=>{w=w.replaceAll("ING","NG").replaceAll("IO","IA").replaceAll("K","C").replaceAll("V","U");const a=[];while(w){let t=lex.find(t=>w.startsWith(t));if(!t)throw Error(w);a.push(d.translit.indexOf(t));w=w.slice(t.length)}return a})}
const original=d.pages[55].indices, tail=enc("THE TOTIENT FUNCTION IS SACRED ALL THINGS");
const phrases=["ENLIGHTENMENT AWAITS THOSE","MULTIBRANCHED AWAITS THOSE"];
function fit(cipher,crib){if(crib.length!==53||cipher.length!==76)throw Error("length");const x=[],y=[];for(let i=26;i<=71;i+=5){x.push(cipher.slice(i,i+5).concat(cipher.slice(i-5,i)));y.push(crib.slice(i-23,i-18))}const {rank,inconsistent,W}=solve(x,y);if(!W)return {rank,inconsistent};const a=W.slice(0,5),aRank=solve(a,eye(5)).rank;const predicted=apply(cipher.slice(21,26).concat(cipher.slice(16,21)),W).slice(2);const expected=crib.slice(0,3);const matches=predicted.filter((v,i)=>v===expected[i]).length;const withheld=[];for(let i=6;i<=21;i+=5)withheld.push(...apply(cipher.slice(i,i+5).concat(cipher.slice(i-5,i)),W));return {rank,inconsistent,aRank,predicted,expected,matches,W,withheld,withheldTranslit:withheld.map(i=>d.translit[i]).join(" ")}}
const cases=phrases.map(phrase=>({phrase,...fit(original,enc(phrase).concat(tail))}));let seed=0x12a55;const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%29};const native=d.pages[57].indices.slice(0,76);const plants=[];for(let trial=0;trial<3;trial++){let a,ai;do{a=Array.from({length:5},()=>Array.from({length:5},rnd));ai=solve(a,eye(5)).W}while(!ai);const b=Array.from({length:5},()=>Array.from({length:5},rnd)),cipher=[rnd()];let prev=Array.from({length:5},rnd);for(let i=1;i<76;i+=5){const bx=apply(prev,b),p=native.slice(i,i+5).map((v,j)=>mod(v-bx[j]));prev=apply(p,ai);cipher.push(...prev)}const result=fit(cipher,native.slice(23));plants.push({rank:result.rank,aRank:result.aRank,partialMatches:result.matches,keyExact:JSON.stringify(result.W)===JSON.stringify(a.concat(b)),prefixExact:JSON.stringify(result.withheld)===JSON.stringify(native.slice(6,26))})}
return {cases,plants,tail,cribLengths:phrases.map(p=>enc(p).length)}
}
const d=JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'));
const out=experiment(d);
assert.ok(out.cases.every(x=>x.rank===10&&x.aRank===5&&x.matches===0));
assert.ok(out.plants.every(x=>x.keyExact&&x.prefixExact&&x.partialMatches===3));
console.log(JSON.stringify(out,null,2));
