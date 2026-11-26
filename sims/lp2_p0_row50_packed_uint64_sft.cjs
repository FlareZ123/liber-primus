#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
/**
 * Exact fixed-row receiver for the p50 physical 13-by-8 panel.
 * @param {{pages: Array<{page:number,indices:number[]}>,translit:string[]}} corpus
 * @param {{alphabet:string,pages:Array<{page:number,tokens:string[]}>}} grid
 */
function experiment(corpus,grid){
 const limit=29n**13n, U64=2n**64n, mod=(x,m)=>(x%m+m)%m;
 const opening=corpus.pages.slice(0,3).flatMap(p=>p.indices);
 const rows=Array.from({length:55},(_,i)=>opening.slice(14+13*i,27+13*i));
 const row=rows[49].map(BigInt);
 if(opening.length!==729||row.join(",")!=="20,11,11,5,20,7,28,23,1,23,12,28,14")throw Error("Unexpected source partition");
 const sums=rows.map(r=>r.reduce((s,v)=>s+v,0)), tokens=grid.pages.find(p=>p.page===50).tokens;
 if(tokens.length!==104)throw Error("Unexpected panel");
 function decodeTokens(tokens,radix){
   let alphabet=radix===60?grid.alphabet:grid.alphabet.replace("f","");
   let bytes=tokens.map(t=>radix*alphabet.indexOf(t[0])+alphabet.indexOf(t[1]));
   if(bytes.some(v=>v<0||v>255))throw Error("invalid byte");
   return bytes;
 }
 function invOdd(a,m){let r=m,s=0n,t=1n,b=mod(a,m);while(b){let q=r/b;[r,b]=[b,r-q*b];[s,t]=[t,s-q*t]}if(r!==1n)throw Error("nonunit");return mod(s,m)}
 const matrix=sign=>Array.from({length:13},(_,i)=>Array.from({length:13},(_,j)=>row[((sign*(i-j))%13+13)%13]));
 function invert(a,m){const n=a.length,z=a.map((r,i)=>r.map(x=>mod(x,m)).concat(Array.from({length:n},(_,j)=>BigInt(i===j))));for(let k=0;k<n;k++){let p=z.findIndex((r,i)=>i>=k&&r[k]%2n===1n);if(p<0)throw Error("singular mod 2");[z[k],z[p]]=[z[p],z[k]];let v=invOdd(z[k][k],m);z[k]=z[k].map(x=>mod(x*v,m));for(let i=0;i<n;i++)if(i!==k){let f=z[i][k];z[i]=z[i].map((x,j)=>mod(x-f*z[k][j],m))}}return z.map(r=>r.slice(n))}
 const multiply=(a,x,m)=>a.map(r=>mod(r.reduce((s,v,j)=>s+v*x[j],0n),m));
 const toInteger=(a,order)=> (order==="BE"?a:[...a].reverse()).reduce((v,d)=>(v<<8n)+BigInt(d),0n);
 function toBytes(n,order){const a=Array.from({length:8},(_,j)=>Number((n>>BigInt(8*(7-j)))&255n));return order==="BE"?a:a.reverse()}
 function packGP(a){return a.reduce((s,d)=>s*29n+BigInt(d),0n)}
 function unpackGP(n){let a=Array(13);for(let i=12;i>=0;i--){a[i]=Number(n%29n);n/=29n}if(n)throw Error("outside BASE29^13");return a}
 const plain=Array.from({length:169},(_,i)=>corpus.pages[57].indices[i%corpus.pages[57].indices.length]);
 const plant=Array.from({length:13},(_,i)=>packGP(plain.slice(13*i,13*i+13)));
 function operate(bytes,a,mode,order){let x=Array.from({length:13},(_,i)=>bytes.slice(i*8,(i+1)*8));if(mode==="uint64"){return multiply(a,x.map(v=>toInteger(v,order)),U64).flatMap(n=>toBytes(n,order))}let cols=Array.from({length:8},(_,j)=>multiply(a,x.map(r=>BigInt(r[j])),256n));return x.flatMap((_,i)=>cols.map(c=>Number(c[i])))}
 const results=[], controls=[];
 for(let sign of [1,-1])for(let mode of ["uint64","byte-lanes"]){let m=mode==="uint64"?U64:256n,a=matrix(sign),iv=invert(a,m);
   for(let j=0;j<13;j++){const u=Array.from({length:13},(_,i)=>BigInt(i===j));if(multiply(iv,multiply(a,u,m),m).join()!==u.join())throw Error("inverse mismatch")}
   for(let order of ["BE","LE"]){let pb=plant.flatMap(n=>toBytes(n,order));let ct=operate(pb,a,mode,order),re=operate(ct,iv,mode,order);if(re.join()!==pb.join())throw Error("plant mismatch");let recovered=Array.from({length:13},(_,i)=>unpackGP(toInteger(re.slice(8*i,8*i+8),order))).flat();if(recovered.join()!==plain.join())throw Error("GP plant mismatch");controls.push({mode,order,sign,recovered:169});
     for(let radix of [60,59]){let bytes=decodeTokens(tokens,radix);let decoded=operate(bytes,iv,mode,order);if(operate(decoded,a,mode,order).join()!==bytes.join())throw Error("original replay mismatch");let vals=Array.from({length:13},(_,i)=>toInteger(decoded.slice(8*i,8*i+8),order));let valid=vals.map(n=>n<limit);let direct=Array.from({length:13},(_,i)=>toInteger(bytes.slice(8*i,8*i+8),order)<limit);
       results.push({radix,mode,order,sign,packedLegal:valid.filter(Boolean).length,invalidRows:valid.flatMap((v,i)=>v?[]:[i+1]),directLegal:direct.filter(Boolean).length,printable:decoded.filter(v=>v>=32&&v<=126).length,gpOrdinalBytes:decoded.filter(v=>v<29).length,hex:decoded.map(v=>v.toString(16).padStart(2,"0")).join(""),roundtrip:104,plain:valid.every(Boolean)?vals.flatMap(unpackGP).map(v=>corpus.translit[v]).join(" "):null});
   }}}
 const header=grid.pages.find(p=>p.page===49).tokens[0];
 const headerCheck=[60,59].map(radix=>{const value=decodeTokens([header],radix)[0];return {radix,header,value,matchingOpeningRows:sums.flatMap((v,i)=>v===value?[i+1]:[]),pageLocalHeaders:grid.pages.map(p=>({page:p.page,rowSum:sums[p.page-1],header:p.tokens[0],value:decodeTokens([p.tokens[0]],radix)[0]}))}});
 return {sourcePartition:opening.length,row:row.map(Number),rowSums:sums,headerCheck,packedLimit:limit.toString(),fraction:Number(limit)/Number(U64),controls,results};
}
const root = path.join(__dirname,'..');
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
console.log(JSON.stringify(experiment(read('resources/liber-primus/lp2-corpus.json'),read('resources/liber-primus/lp2-grid-256.json')),null,2));
