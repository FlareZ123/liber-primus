"use strict";
/**
 * Exact source-native 9×9 Hill-key inverse using p32 interior on p33 body.
 * SFT: node sims/lp2_p32_inner9_p33_hill_inverse_sft.cjs
 * No adjustable key/alphabet/phase or unconstrained search.
 *
 * @module lp2_p32_inner9_p33_hill_inverse_sft
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const source=fs.readFileSync(path.join(root,"resources/liber-primus/lp2-transcription.txt"),"utf8");
const A=corpus.runes,P=corpus.prime,R=new Set(A);
const mod=x=>(x%29+29)%29;
/** @param {number} x @returns {number} */
function inverseScalar(x){
  assert.notEqual(mod(x),0);
  for(let n=1;n<29;n++)if(mod(x*n)===1)return n;
  throw Error("not a field invertible element");
}
/** @param {number[][]} m @returns {number[][]} */
const transpose=m=>m[0].map((_,i)=>m.map(row=>row[i]));
/** @param {number[][]} m @param {number[]} v @returns {number[]} */
function matMulVec(m,v){
  return m.map(row=>mod(row.reduce((sum,x,i)=>sum+x*v[i],0)));
}
/** @param {number[][]} m @returns {{det:number,rank:number,inverse:number[][]|null}} */
function invert(m){
  const n=m.length;
  assert.ok(m.every(row=>row.length===n));
  const x=m.map((row,i)=>[
    ...row.map(mod),...Array.from({length:n},(_,j)=>+(i===j))]);
  let rank=0,det=1;
  for(let i=0;i<n;i++){
    let row=rank;
    while(row<n&&x[row][i]===0)row++;
    if(row===n){det=0;continue}
    if(row!==rank){[x[row],x[rank]]=[x[rank],x[row]];det=mod(-det)}
    const pivot=x[rank][i];
    det=mod(det*pivot);
    const inv=inverseScalar(pivot);
    x[rank]=x[rank].map(v=>mod(v*inv));
    for(let j=0;j<n;j++)if(j!==rank){
      const factor=x[j][i];
      for(let k=0;k<2*n;k++)x[j][k]=mod(x[j][k]-factor*x[rank][k]);
    }
    rank++;
  }
  const out=rank===n?x.map(row=>row.slice(n)):null;
  if(out){
    for(let i=0;i<n;i++)assert.deepEqual(matMulVec(m,out.map(row=>row[i])),
      Array.from({length:n},(_,j)=>+(i===j)));
  }
  return {det,rank,inverse:out};
}
/** @param {number[]} x @returns {number} */
function ioc(x){
  const h=Array(29).fill(0);for(const v of x)h[v]++;
  return h.reduce((sum,v)=>sum+v*(v-1),0)/(x.length*(x.length-1));
}
/** @param {number[][]} inv @param {number[][]} ciphertext */
function decodeRows(inv,ciphertext){
  return ciphertext.map(v=>matMulVec(inv,v));
}
/** @param {number[][]} inv @param {number[][]} ciphertext */
function decodeCols(inv,ciphertext){
  return transpose(transpose(ciphertext).map(v=>matMulVec(inv,v)));
}
/** @param {number[]} nums @returns {string} */
const latin=nums=>nums.map(i=>corpus.translit[i]).join("");
/** @param {number[]} v @param {number[][]} m @returns {number[]} */
function rowMulVec(v,m){
  return Array.from({length:m.length},(_,j)=>
    mod(v.reduce((sum,x,i)=>sum+x*m[i][j],0)));
}
/** @param {number[][]} inv @param {number[][]} ciphertext @param {number[]} iv @param {"column"|"row"} orientation */
function decodeCbc(inv,ciphertext,iv,orientation){
  const plaintext=[];
  let previous=iv;
  for(const block of ciphertext){
    const delta=block.map((x,i)=>mod(x-previous[i]));
    plaintext.push(orientation==="column"
      ?matMulVec(inv,delta):rowMulVec(delta,inv));
    previous=block;
  }
  return plaintext;
}
/** @param {number[][]} key @param {number[][]} plaintext @param {number[]} iv @param {"column"|"row"} orientation */
function encodeCbc(key,plaintext,iv,orientation){
  const ciphertext=[];
  let previous=iv;
  for(const block of plaintext){
    const product=orientation==="column"
      ?matMulVec(key,block):rowMulVec(block,key);
    const current=product.map((x,i)=>mod(x+previous[i]));
    ciphertext.push(current);
    previous=current;
  }
  return ciphertext;
}

function run(){
  const all=[...source].filter(ch=>R.has(ch)).map(ch=>A.indexOf(ch));
  assert.equal(all.length,13136);
  const originalP32=Array.from({length:11},(_,r)=>all.slice(7839+r*11,7839+(r+1)*11));
  const key=originalP32.slice(1,10).map(row=>row.slice(1,10));
  const originalP33=Array.from({length:9},(_,r)=>all.slice(7970+r*9,7979+r*9));
  assert.equal(originalP33.flat().length,81);
  const keyOptions=[
    {name:"GP-index matrix",matrix:key},
    {name:"GP-prime mod29 matrix",matrix:key.map(row=>row.map(x=>P[x]%29))}
  ];
  const outputs=[];
  for(const option of keyOptions){
    const variants=[
      {name:"K",matrix:option.matrix},
      {name:"K-transpose",matrix:transpose(option.matrix)}
    ];
    for(const v of variants){
      const p=invert(v.matrix);
      assert.equal(p.rank,9);
      const row=decodeRows(p.inverse,originalP33).flat();
      const column=decodeCols(p.inverse,originalP33).flat();
      outputs.push({key:option.name,convention:v.name,
        rank:p.rank,det:p.det,
        rows:{ioc:ioc(row),latin:latin(row)},
        columns:{ioc:ioc(column),latin:latin(column)}});
    }
  }
  const originalKey=invert(key);
  assert.equal(originalKey.det,28);

  // Source-red-ink CBC-Hill extension: p33 red spans [0,10) and [91,99)
  // concatenate to 18 symbols, then test the two source-sized 9-symbol IVs.
  const redSpans=[all.slice(7960,7970),all.slice(8051,8059)];
  assert.deepEqual(redSpans.map(x=>x.length),[10,8]);
  const red18=[...redSpans[0],...redSpans[1]];
  assert.equal(red18.length,18);
  const ivOptions=[
    {name:"red18-first9",iv:red18.slice(0,9)},
    {name:"red18-second9",iv:red18.slice(9,18)}
  ];
  const cbcOutputs=[];
  const cbcControls=[];
  const p57Plant=corpus.pages.find(page=>page.page===57).indices.slice(0,81);
  assert.equal(p57Plant.length,81);
  const p57Blocks=Array.from({length:9},(_,i)=>p57Plant.slice(i*9,i*9+9));
  for(const option of ivOptions){
    for(const orientation of ["column","row"]){
      const decoded=decodeCbc(originalKey.inverse,originalP33,option.iv,orientation).flat();
      cbcOutputs.push({iv:option.name,orientation,ioc:ioc(decoded),latin:latin(decoded)});
      const encryptedPlant=encodeCbc(key,p57Blocks,option.iv,orientation);
      const recoveredPlant=decodeCbc(originalKey.inverse,encryptedPlant,option.iv,orientation).flat();
      assert.deepEqual(recoveredPlant,p57Plant);
      cbcControls.push({iv:option.name,orientation,recovered:recoveredPlant.length});
    }
  }
  assert.deepEqual(cbcOutputs.map(x=>x.ioc.toFixed(8)),
    ["0.02932099","0.03148148","0.03179012","0.03055556"]);
  assert.equal(cbcControls.length,4);
  assert.equal(invert(originalP32).det,8);
  assert.equal(invert(originalP33).det,12);
  const cropDeterminants=Array.from({length:9},(_,k)=>{
    const row=(k/3)|0,col=k%3;
    const fragment=originalP32.slice(row,row+9).map(r=>r.slice(col,col+9));
    return {row,col,det:invert(fragment).det};
  });
  assert.deepEqual(cropDeterminants.map(x=>x.det),
    [20,25,25,27,28,21,24,12,16]);
  assert.equal(cropDeterminants.filter(x=>x.det===28).length,1);
  const report={source:"p32 inner 9x9 original GP-index key; adjacent p33 black body 9x9",
    originalKeyDetMod29:originalKey.det,
    original9x9CropsDeterminants:cropDeterminants,
    original11x11Det:8,originalP33BodyDet:12,
    originalP33BodyIoC:ioc(originalP33.flat()),
    outputs,
    redInkCbc:{
      redSpanLengths:redSpans.map(x=>x.length),
      ivOptions:ivOptions.map(x=>({name:x.name,latin:latin(x.iv)})),
      outputs:cbcOutputs,
      syntheticP57Roundtrips:cbcControls,
      sourceSelectedPlaintextRecovered:false
    },
    sourceSelectedPlaintextRecovered:false};
  assert.ok(outputs.every(r=>r.rows.ioc<0.04&&r.columns.ioc<0.04));
  console.log(JSON.stringify(report,null,2));
}
if(require.main===module)run();
module.exports={run,invert,matMulVec,decodeRows,decodeCols,decodeCbc,encodeCbc};
