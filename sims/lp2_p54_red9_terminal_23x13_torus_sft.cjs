'use strict';
// Exact cyclic 3x3 GF29 deconvolution on original 299-rune p54+p55 terminal.
const assert=require('node:assert/strict');
const fs=require('node:fs'), path=require('node:path');
const d=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
/** @param {number} page @returns {number[]} */
function original(page){const p=d.pages.find(x=>x.page===page);assert.ok(p);return p.indices;}
/** @param {number} x @returns {number} */
function mod(x){return (x%29+29)%29;}
/** @param {number} x @returns {number} */
function inv(x){for(let k=1;k<29;k++)if(mod(k*x)===1)return k;throw Error('singular pivot');}
/** @param {number} rows @param {number} cols @param {number[]} key @returns {Uint16Array[]} */
function matrix(rows,cols,key){
 const n=rows*cols,A=Array.from({length:n},()=>new Uint16Array(n));
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)
  for(let y=0;y<3;y++)for(let x=0;x<3;x++){
   const dst=r*cols+c,src=((r+y-1+rows)%rows)*cols+(c+x-1+cols)%cols;
   A[dst][src]=mod(A[dst][src]+key[y*3+x]);
  }
 return A;
}
/** @param {Uint16Array[]} A @param {number[]} plain @returns {number[]} */
function apply(A,plain){
 return A.map(row=>{let sum=0;for(let j=0;j<plain.length;j++)sum+=row[j]*plain[j];return mod(sum);});
}
/** @param {Uint16Array[]} A @param {number[]} ciphertext @returns {{rank:number,plaintext:number[],valid:boolean}} */
function solve(A,ciphertext){
 const n=A.length,t=A.map((r,i)=>{const v=new Uint16Array(n+1);v.set(r);v[n]=ciphertext[i];return v;});
 const pivots=[];let rank=0;
 for(let col=0;col<n;col++){
  let p=rank;while(p<n&&t[p][col]===0)p++;if(p===n)continue;
  [t[rank],t[p]]=[t[p],t[rank]];
  const row=t[rank],scale=inv(row[col]);
  for(let j=col;j<=n;j++)row[j]=mod(row[j]*scale);
  for(let i=0;i<n;i++)if(i!==rank){
   const k=t[i][col];if(!k)continue;
   for(let j=col;j<=n;j++)t[i][j]=mod(t[i][j]-k*row[j]);
  }
  pivots.push(col);rank++;if(rank===n)break;
 }
 const plaintext=Array(n).fill(0);
 for(let k=0;k<rank;k++)plaintext[pivots[k]]=t[k][n];
 return {rank,plaintext,valid:t.slice(rank).every(row=>row[n]===0)};
}
/** @param {number[]} text @returns {number} */
function ioc(text){
 const f=Array(29).fill(0);for(const x of text)f[x]++;
 return f.reduce((s,n)=>s+n*(n-1),0)/(text.length*(text.length-1));
}
const p54=original(54),p55=original(55),p57=original(57),key=[24,19,21,23,27,2,14,10,19];
assert.deepEqual([p54.length,p55.length,p57.length],[232,76,95]);
assert.deepEqual(p54.slice(0,9),key);
const C=p54.slice(9).concat(p55);
assert.equal(C.length,299);
const plant=Array.from({length:299},(_,i)=>p57[i%p57.length]);
const results=[];
for(const [r,c] of [[23,13],[13,23]]){
 const A=matrix(r,c,key),x=solve(A,C),synthetic=apply(A,plant),y=solve(A,synthetic);
 assert.equal(x.rank,299);assert.ok(x.valid);
 assert.deepEqual(apply(A,x.plaintext),C);
 assert.equal(y.rank,299);assert.deepEqual(y.plaintext,plant);
 assert.deepEqual(apply(A,y.plaintext),synthetic);
 results.push({shape:r+'x'+c,rank:x.rank,ioc:ioc(x.plaintext),
  first60:x.plaintext.slice(0,60).map(i=>d.translit[i]).join(' '),
  roundtrip:'299/299',nativeGPPlant:'299/299'});
}
assert.ok(Math.abs(results[0].ioc-0.0351282799488227)<1e-12);
assert.ok(Math.abs(results[1].ioc-0.03418554016744854)<1e-12);
console.log(JSON.stringify({key,originalLengths:[9,223,76],
 independentClearP57IoC:ioc(p57),results,
 conclusion:'Two exact invertible original ciphers, neither reveals unknown prose or an authored algorithm'},null,2));
