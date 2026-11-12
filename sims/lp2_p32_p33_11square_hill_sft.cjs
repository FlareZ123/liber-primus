"use strict";
/**
 * Source-frozen p32 full 11x11 GP matrix -> p33's following text block.
 * Reproducer: node sims/lp2_p32_p33_11square_hill_sft.cjs
 *
 * The source-visible p32 121 runes form a square whose first row/column
 * prime sums equal the signed 2016 tree JPEG pixel dimensions 563/569.
 * The original next chapter p33 has a 91-rune introductory paragraph
 * and a second red heading, leaving a 123-rune body. This experiment
 * tests its first 121 runes as an 11x11 block. It neither optimizes key
 * coordinates nor searches offsets, matrices, or natural-language cribs.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const mod=x=>(x%29+29)%29;
const rowMatrix=(values,n)=>Array.from({length:n},(_,r)=>values.slice(r*n,(r+1)*n));
const transpose=A=>A[0].map((_,j)=>A.map(row=>row[j]));
const apply=(A,v)=>A.map(row=>mod(row.reduce((s,x,i)=>s+x*v[i],0)));
/** @param {number[][]} A @returns {{matrix:number[][], determinant:number}} */
function inverse(A){
  const n=A.length;
  assert(A.every(row=>row.length===n));
  const x=A.map((row,i)=>[...row,...Array.from({length:n},(_,j)=>+(i===j))]);
  let det=1;
  for(let i=0;i<n;i++){
    let p=i;
    while(p<n&&x[p][i]===0)p++;
    assert(p<n,"source matrix must be nonsingular");
    if(p!==i){[x[p],x[i]]=[x[i],x[p]];det=mod(-det);}
    det=mod(det*x[i][i]);
    let scale=1;
    while(mod(scale*x[i][i])!==1)scale++;
    x[i]=x[i].map(y=>mod(scale*y));
    for(let j=0;j<n;j++){
      if(j===i)continue;
      const f=x[j][i];
      for(let k=0;k<2*n;k++)x[j][k]=mod(x[j][k]-f*x[i][k]);
    }
  }
  const output=x.map(row=>row.slice(n));
  for(let j=0;j<n;j++)
    assert.deepEqual(apply(A,output.map(row=>row[j])),
      Array.from({length:n},(_,i)=>+(i===j)));
  return {matrix:output,determinant:det};
}
function ioc(seq){
  const h=Array(29).fill(0);
  for(const x of seq)h[x]++;
  return h.reduce((s,x)=>s+x*(x-1),0)/(seq.length*(seq.length-1));
}
function encode(plain){
  const tokens=corpus.translit.map((s,i)=>({s,i}))
    .sort((a,b)=>b.s.length-a.s.length);
  const words=(plain.toUpperCase().match(/[A-Z]+/g)||[]);
  const out=[];
  for(let w of words){
    w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
    for(let i=0;i<w.length;){
      const t=tokens.find(q=>w.startsWith(q.s,i));
      assert(t,"invalid native-GP token "+w.slice(i));
      out.push(t.i);i+=t.s.length;
    }
  }
  return out;
}
const p32=corpus.pages.find(p=>p.page===32).indices;
const p33=corpus.pages.find(p=>p.page===33).indices;
assert.deepEqual([p32.length,p33.length],[121,214]);
const source=rowMatrix(p32,11);
assert.equal(source[0].reduce((s,x)=>s+corpus.prime[x],0),563);
assert.equal(source.reduce((s,row)=>s+corpus.prime[row[0]],0),569);
const p33Body=p33.slice(91);
assert.equal(p33Body.length,123);
const encrypted=p33Body.slice(0,121);
const cBlocks=rowMatrix(encrypted,11);
const sourceMatrices={
  gpIndices:source,
  gpPrimesModulo29:source.map(row=>row.map(x=>corpus.prime[x]%29))
};
const known=encode("PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE").slice(0,121);
assert.equal(known.length,121);
const outputs=[];
let plantTrials=0;
for(const [key,matrix] of Object.entries(sourceMatrices)){
  const inv=inverse(matrix);
  for(const [operation,M] of Object.entries({original:matrix,inverse:inv.matrix})){
    for(const shape of ["row","column"]){
      for(const transposed of [false,true]){
        const K=transposed?transpose(M):M;
        const transform=(sequence)=>{
          const blocks=rowMatrix(sequence,11);
          const target=shape==="row"?blocks.map(v=>apply(K,v)):
            transpose(transpose(blocks).map(v=>apply(K,v)));
          return target.flat();
        };
        const readout=transform(encrypted);
        const plaintext=transform(known);
        const complement=operation==="original" ? inv.matrix : matrix;
        const restored=shape==="row"?
          rowMatrix(plaintext,11).map(v=>apply(transposed?transpose(complement):complement,v)).flat():
          transpose(transpose(rowMatrix(plaintext,11)).map(v=>apply(transposed?transpose(complement):complement,v))).flat();
        assert.deepEqual(restored,known);
        plantTrials++;
        outputs.push({
          sourceKey:key,operation,shape,transposed,
          determinant:inv.determinant,
          originalIoc:ioc(readout),
          prefix80:readout.slice(0,80).map(i=>corpus.translit[i]).join("")
        });
      }
    }
  }
}
outputs.sort((a,b)=>b.originalIoc-a.originalIoc);
assert.equal(plantTrials,16);
assert.ok(outputs[0].originalIoc<0.05);
assert.ok(ioc(known)>0.05);
console.log(JSON.stringify({
  scope:"Full p32 11x11 source-index/prime matrix, p33 after 91-rune divider; first 121 of 123 following body runes",
  sourcePage:32,targetPage:33,
  sourceSignedImageDimensions:[563,569],
  inputIoc:ioc(encrypted),nativeGpControlIoc:ioc(known),
  testedReversibleReadings:outputs.length,
  best:outputs[0],
  allIocs:outputs.map(x=>({key:x.sourceKey,operation:x.operation,shape:x.shape,transposed:x.transposed,ioc:x.originalIoc})),
  allNativePlantRoundTrips:plantTrials,
  trailingUnconsumedRunes:p33Body.slice(-2).map(i=>corpus.translit[i]).join(""),
  finding:"All direct source-key Hill-11 forms fail to reveal ordinary native-GP prose on the next chapter's first 121-rune block. No unknown-page plaintext or key recovered."
},null,2));