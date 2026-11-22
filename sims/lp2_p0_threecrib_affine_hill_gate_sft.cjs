"use strict";

/**
 * Three-crib affine Hill gate over GF(29).
 *
 * Tests fixed block sizes 2, 3 and 4 under:
 *   C_block = A * P_block + b (mod 29)
 * with and without b, using both island-reset and absolute/global block
 * alignment.  Every fully known block from EPIPHANY SEEKS, THE ROAD and
 * THE DEVOTED is charged.  All tested families are inconsistent.
 */

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const p0=corpus.pages.find(p=>p.page===0).indices;
const gpTokens=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);

function gp(text){
  const n=text.toUpperCase().replace(/QU/g,"CW").replace(/K/g,"C").replace(/V/g,"U").replace(/Q/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");
  const out=[];
  for(let i=0;i<n.length;){
    const t=gpTokens.find(x=>n.startsWith(x.symbol,i));
    assert.ok(t);
    out.push(t.value);
    i+=t.symbol.length;
  }
  return out;
}
const mod=x=>((x%29)+29)%29;
function inv(x){
  x=mod(x);
  for(let y=1;y<29;y++) if(mod(x*y)===1) return y;
  throw new Error("noninvertible");
}

/** @returns {{consistent:boolean,rank:number}} */
function solve(M,y,nvars){
  const A=M.map((row,i)=>row.map(mod).concat([mod(y[i])]));
  let r=0;
  for(let c=0;c<nvars&&r<A.length;c++){
    let pivot=r;
    while(pivot<A.length&&A[pivot][c]===0)pivot++;
    if(pivot===A.length)continue;
    [A[r],A[pivot]]=[A[pivot],A[r]];
    const scale=inv(A[r][c]);
    for(let j=c;j<=nvars;j++)A[r][j]=mod(A[r][j]*scale);
    for(let i=0;i<A.length;i++){
      if(i===r||A[i][c]===0)continue;
      const q=A[i][c];
      for(let j=c;j<=nvars;j++)A[i][j]=mod(A[i][j]-q*A[r][j]);
    }
    r++;
  }
  for(let i=r;i<A.length;i++){
    if(A[i].slice(0,nvars).every(v=>v===0)&&A[i][nvars]!==0){
      return{consistent:false,rank:r};
    }
  }
  return{consistent:true,rank:r};
}

const islands=[
  {phrase:"EPIPHANY SEEKS",start:0},
  {phrase:"THE ROAD",start:103},
  {phrase:"THE DEVOTED",start:235},
].map(x=>({...x,P:gp(x.phrase)}));
for(const island of islands){
  island.C=p0.slice(island.start,island.start+island.P.length);
}

/** @param {number} n @param {boolean} affine @param {"reset"|"global"} mode */
function gate(n,affine,mode){
  const blocks=[];
  for(const island of islands){
    if(mode==="reset"){
      for(let j=0;j+n<=island.P.length;j+=n){
        blocks.push({P:island.P.slice(j,j+n),C:island.C.slice(j,j+n)});
      }
    }else{
      for(let j=0;j+n<=island.P.length;j++){
        if((island.start+j)%n===0){
          blocks.push({P:island.P.slice(j,j+n),C:island.C.slice(j,j+n)});
        }
      }
    }
  }
  const nvars=n+(affine?1:0);
  const coordinates=[];
  for(let output=0;output<n;output++){
    const M=blocks.map(block=>block.P.concat(affine?[1]:[]));
    const y=blocks.map(block=>block.C[output]);
    coordinates.push(solve(M,y,nvars));
  }
  return{
    n,affine,mode,blocks:blocks.length,
    consistent:coordinates.every(row=>row.consistent),
    coordinates,
  };
}

const rows=[];
for(const n of [2,3,4]){
  for(const affine of [false,true]){
    for(const mode of ["reset","global"])rows.push(gate(n,affine,mode));
  }
}
assert.equal(rows.length,12);
assert.ok(rows.every(row=>row.consistent===false));

console.log(JSON.stringify({
  status:"PASS: affine Hill GF(29) block sizes2-4 fail all three recovered p0 islands under reset and global alignment",
  rows,
},null,2));
