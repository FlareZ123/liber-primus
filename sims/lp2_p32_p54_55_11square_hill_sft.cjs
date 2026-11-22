"use strict";
/**
 * Original p32 11-square as a finite-field matrix key for the 308-rune
 * p54+p55 terminal chapter, selected by the source tree artwork echo.
 * Node 22 CommonJS, no external dependencies or file writes.
 * Run: node sims/lp2_p32_p54_55_11square_hill_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,"..",
  "resources","liber-primus","lp2-corpus.json"),"utf8"));
const mod=x=>(x%29+29)%29;
const square=(a,n)=>Array.from({length:n},(_,i)=>a.slice(i*n,i*n+n));
const transpose=A=>A[0].map((_,j)=>A.map(row=>row[j]));
const apply=(A,v)=>A.map(row=>mod(row.reduce((s,x,i)=>s+x*v[i],0)));
/** @param {number[][]} A @returns {number[][]} */
function invert(A){
  const n=A.length,x=A.map((row,i)=>[...row,...Array.from({length:n},(_,j)=>+(j===i))]);
  for(let k=0;k<n;k++){
    let p=k;while(p<n&&!x[p][k])p++;assert(p<n,"matrix singular");
    [x[k],x[p]]=[x[p],x[k]];
    let scale=1;while(mod(scale*x[k][k])!==1)scale++;
    x[k]=x[k].map(v=>mod(scale*v));
    for(let i=0;i<n;i++)if(i!==k){
      const f=x[i][k];for(let j=0;j<2*n;j++)x[i][j]=mod(x[i][j]-f*x[k][j]);
    }
  }
  return x.map(row=>row.slice(n));
}
/**
 * Each row form consumes contiguous length-11 blocks.
 * Column form reshapes row-major into 11 rows of width n/11 and applies
 * the same 11-square key to each vertical eleven-rune column.
 * @param {number[][]} K @param {number[]} input
 * @param {"row"|"column"} shape @returns {number[]}
 */
function transform(K,input,shape){
  const width=input.length/11;assert(Number.isInteger(width));
  if(shape==="row")return Array.from({length:width},(_,j)=>
    apply(K,input.slice(j*11,j*11+11))).flat();
  const rows=square(input,width),out=Array.from({length:11},()=>Array(width));
  for(let j=0;j<width;j++){
    const y=apply(K,rows.map(row=>row[j]));
    for(let k=0;k<11;k++)out[k][j]=y[k];
  }
  return out.flat();
}
/** @param {number[]} a @returns {number} */
function ioc(a){
  const hist=Array(29).fill(0);
  for(const i of a)hist[i]++;
  return hist.reduce((s,v)=>s+v*(v-1),0)/(a.length*(a.length-1));
}
function main(){
  const p=n=>corpus.pages.find(x=>x.page===n).indices;
  const root=p(32),target=[...p(54),...p(55)],native=p(57);
  assert.deepEqual([root.length,p(54).length,p(55).length,target.length,native.length],
    [121,232,76,308,95]);
  const source=square(root,11);
  assert.equal(source[0].reduce((s,i)=>s+corpus.prime[i],0),563);
  assert.equal(source.reduce((s,row)=>s+corpus.prime[row[0]],0),569);
  const matrices={
    gpIndex:source,
    gpPrimeMod29:source.map(row=>row.map(i=>corpus.prime[i]%29))
  };
  const known=Array.from({length:176},(_,i)=>native[i%native.length]);
  assert.ok(ioc(known)>0.05); // original solved p57 plain GP sequence
  const outputs=[];let plants=0;
  for(const [sourceKey,rawKey] of Object.entries(matrices)){
    const inverted=invert(rawKey);
    for(const [operation,M] of Object.entries({original:rawKey,inverse:inverted})){
      const complementary=operation==="original"?inverted:rawKey;
      for(const transposed of [false,true]){
        const K=transposed?transpose(M):M;
        const Ki=transposed?transpose(complementary):complementary;
        for(const shape of ["row","column"]){
          const decoded=transform(K,target,shape);
          const encryptedPlant=transform(K,known,shape);
          assert.deepEqual(transform(Ki,encryptedPlant,shape),known);
          plants++;
          outputs.push({sourceKey,operation,transposed,shape,
            ioc:ioc(decoded),head:decoded.slice(0,50)
              .map(i=>corpus.translit[i]).join(" ")});
        }
      }
    }
  }
  outputs.sort((a,b)=>b.ioc-a.ioc);
  assert.equal(plants,16);
  assert.ok(outputs[0].ioc<0.04);
  assert.ok(ioc(target)<0.04);
  console.log(JSON.stringify({sourcePage32:121,sourceImagePrimeSums:[563,569],
    targetPages:[54,55],targetLength:308,shape:"28x11 or 11x28",
    inputIoc:ioc(target),knownP57PlantIoc:ioc(known),plants,
    highestIoc:outputs[0],all:outputs.map(({sourceKey,operation,transposed,shape,ioc})=>
      ({sourceKey,operation,transposed,shape,ioc})),
    finding:"No native-GP plaintext among all 16 direct source-matrix operations."
  },null,2));
}
if(require.main===module)main();
module.exports={invert,transform,ioc};
