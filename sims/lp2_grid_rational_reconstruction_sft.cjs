'use strict';
// Exact rational reconstruction from a byte prefix; no denominator enumeration.
const fs=require('node:fs'),path=require('node:path');
function run(grid){
const B=256n,Q=1n<<512n,L=129,assert=(x,m)=>{if(!x)throw Error(m)};
function bytes(a,q,n){const out=[];for(let i=0;i<n;i++){a*=B;out.push(Number(a/q));a%=q}return out}
function recover(a){const den=B**BigInt(a.length);const N=a.reduce((v,d)=>v*B+BigInt(d),0n);
let n=2n*N+1n,d=2n*den,p0=0n,p1=1n,q0=1n,q1=0n;const out=[];let last=0n;
assert(den>2n*Q*Q,"precision bound");
while(d){const t=n/d,p=t*p1+p0,q=t*q1+q0;if(q>Q)break;last=q;if(N*q<=p*den&&p*den<(N+1n)*q)out.push({p:p.toString(),q:q.toString()});[p0,p1,q0,q1]=[p1,p,q1,q];[n,d]=[d,n%d]}
assert(out.length<=1,"uniqueness");return {candidates:out,lastDenominatorBits:last.toString(2).length}}
function test(a){const fit=recover(a.slice(0,L));return {...fit,validation:fit.candidates.map(({p,q})=>{const pred=bytes(BigInt(p),BigInt(q),a.length);return {p,q,fit:pred.slice(0,L).every((v,i)=>v===a[i]),holdoutCorrect:pred.slice(L).filter((v,i)=>v===a[L+i]).length}})}}
const controls=[];
const gcd=(a,b)=>{while(b)[a,b]=[b,a%b];return a};
for(let [p,q] of [[3299n,3301n],[1n,1n<<511n],[(1n<<510n)+3n,(1n<<511n)+1n],[0n,1n]]){const d=gcd(p,q);p/=d;q/=d;const a=bytes(p,q,256),t=test(a);assert(t.validation.length===1&&t.validation[0].p===p.toString()&&t.validation[0].q===q.toString()&&t.validation[0].holdoutCorrect===127,"control failed");controls.push({denominatorBits:q.toString(2).length,...t})}
const tokens=grid.pages.flatMap(p=>p.tokens),alphabet=grid.alphabet;assert(tokens.length===256,"source shape");
const scans=[];
for(const radix of [59,60]){const alpha=radix===59?alphabet.replace("f",""):alphabet;const a=tokens.map(t=>{const x=alpha.indexOf(t[0]),y=alpha.indexOf(t[1]);assert(x>=0&&y>=0,"alphabet");return radix*x+y});assert(a.every(x=>x>=0&&x<=255),"byte");if(radix===60)assert(a.join()===grid.pages.flatMap(p=>p.bytes).join(),"canonical byte read");
for(const axis of ["row","col"])for(const dr of [1,-1])for(const dc of [1,-1]){const rows=Array.from({length:32},(_,i)=>dr===1?i:31-i),cols=Array.from({length:8},(_,i)=>dc===1?i:7-i),read=axis==="row"?rows.flatMap(i=>cols.map(j=>a[8*i+j])):cols.flatMap(j=>rows.map(i=>a[8*i+j]));scans.push({radix,axis,dr,dc,...test(read)})}}
return {fitBytes:L,withheldBytes:256-L,denominatorLimit:Q.toString(),controls,scans}
}
console.log(JSON.stringify(run(JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-grid-256.json'),'utf8'))),null,2));
