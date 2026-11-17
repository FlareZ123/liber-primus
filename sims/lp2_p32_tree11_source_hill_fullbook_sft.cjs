"use strict";
/**
 * Source-anchored original p32 tree 11x11 Hill matrix inverse on all LP2.
 *
 * A hypothetical row-major 11x11 reshape of the 121 runes printed
 * in six ordinary prose lines has row/column GP-prime sums 563/569,
 * matching the 2016 JPEG dimensions. The printed page is NOT an
 * 11x11 grid; the reshape is an unverified cipher-key hypothesis.
 * This numeric matrix has determinant 8
 * mod29 and is invertible. Test its direct forward/inverse and transposed
 * maps against all original unknown pages, with page/book block clocks.
 * Genuine independent native-GP controls must encrypt/decrypt exactly.
 *
 * Run: node sims/lp2_p32_tree11_source_hill_fullbook_sft.cjs
 * Windows 11, Node.js 22, CommonJS; built-in modules only.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const data=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=data.pages.filter(p=>p.page<=55&&p.indices.length);
const nativeText=read("resources/control/gibran_prophet_58585.txt");
const N=11,MOD=29,mod=x=>(x%MOD+MOD)%MOD;
assert.equal(pages.length,55);
assert.equal(pages.flatMap(p=>p.indices).length,12956);
const tree=data.pages.find(p=>p.page===32).indices;
assert.equal(tree.length,N*N);
const M=Array.from({length:N},(_,i)=>tree.slice(i*N,(i+1)*N));
const dimensions=[M[0].reduce((s,i)=>s+data.prime[i],0),
  M.reduce((s,row)=>s+data.prime[row[0]],0)];
assert.deepEqual(dimensions,[563,569]);
assert.equal((dimensions[0]+dimensions[1])/2,566);

/** @param {number[][]} matrix */
function inverse(matrix){
  const a=matrix.map((row,i)=>[...row,...Array.from({length:N},(_,j)=>Number(j===i))]);
  let determinant=1;
  for(let j=0;j<N;j++){
    let pivot=j;
    while(pivot<N&&!a[pivot][j])pivot++;
    assert.ok(pivot<N);
    if(pivot!==j){[a[j],a[pivot]]=[a[pivot],a[j]];determinant=mod(-determinant);}
    const f=a[j][j];
    determinant=mod(determinant*f);
    const fi=Array.from({length:28},(_,i)=>i+1).find(i=>mod(i*f)===1);
    assert.ok(fi);
    a[j]=a[j].map(v=>mod(v*fi));
    for(let i=0;i<N;i++)if(i!==j){
      const s=a[i][j];
      a[i]=a[i].map((v,k)=>mod(v-s*a[j][k]));
    }
  }
  return {matrix:a.map(r=>r.slice(N)),determinant};
}
const MI=inverse(M);
assert.equal(MI.determinant,8);
const transpose=A=>A[0].map((_,i)=>A.map(row=>row[i]));
/** @param {number[][]} A @param {number[][]} B */
function product(A,B){
  return A.map(row=>Array.from({length:N},(_,j)=>mod(
    row.reduce((s,v,k)=>s+v*B[k][j],0))));
}
const eye=Array.from({length:N},(_,i)=>Array.from({length:N},(_,j)=>Number(i===j)));
assert.deepEqual(product(M,MI.matrix),eye);
assert.deepEqual(product(MI.matrix,M),eye);

/** @param {number[]} symbols @param {number[][]} matrix */
function apply(symbols,matrix){
  const out=[];
  for(let j=0;j+N<=symbols.length;j+=N)
    for(let i=0;i<N;i++){
      let val=0;
      for(let k=0;k<N;k++)val+=matrix[i][k]*symbols[j+k];
      out.push(mod(val));
    }
  return out;
}
/** @param {number[]} symbols */
function ioc(symbols){
  const h=new Uint32Array(29);
  for(const i of symbols)h[i]++;
  return h.reduce((s,k)=>s+k*(k-1),0)/(symbols.length*(symbols.length-1));
}
const symbols=new Map(data.translit.map((s,i)=>[s,i]));
/** @param {string} text @returns {number[]} */
function toGp(text){
  const result=[];
  for(let word of text.toUpperCase().match(/[A-Z]+/g)||[]){
    word=word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S");
    for(let j=0;j<word.length;){
      const pair=symbols.get(word.slice(j,j+2));
      if(pair!==undefined){result.push(pair);j+=2;}
      else{const one=symbols.get(word[j]);j++;
        if(one!==undefined)result.push(one);}
    }
  }
  return result;
}
const english=toGp(nativeText);
assert.ok(english.length>13000);
const knownP57=data.pages.find(p=>p.page===57).indices;
assert.equal(knownP57.length,95);
const sourceStreams=[pages.flatMap(p=>p.indices),pages.map(p=>p.indices)];
const result=[];
for(const [orientation,key,inv] of [
  ["normal",M,MI.matrix],
  ["transposed",transpose(M),transpose(MI.matrix)]
]){
  assert.deepEqual(product(key,inv),eye);
  for(const [direction,decode,encode] of [
    ["forward",key,inv],
    ["inverse",inv,key]
  ]){
    const plant=english.slice(1200,1200+12947);
    const cy=apply(plant,encode);
    assert.deepEqual(apply(cy,decode),plant);
    const p57=knownP57.slice(0,88);
    assert.deepEqual(apply(apply(p57,encode),decode),p57);
    assert.ok(ioc(plant)>0.048);
    for(const clock of ["book","page"]){
      const raw=clock==="book"?[sourceStreams[0]]:sourceStreams[1];
      const decoded=raw.flatMap(page=>apply(page,decode));
      const obs=ioc(decoded);
      assert.ok(obs>0.032&&obs<0.04);
      result.push({orientation,direction,clock,
        originalRunes:decoded.length,originalIoC:obs,
        independentEnglishPlantIoC:ioc(plant),
        positiveControl:"full exact GP29 roundtrip",solvedP57Plant:"88/88",
        firstOriginalSymbols:decoded.slice(0,24).map(i=>data.translit[i]).join("")});
    }
  }
}
console.log(JSON.stringify({
  result:"No GP-English plaintext recovered from any direct source-tree 11x11 Hill inversion on original LP2",
  source:{page:32,runes:tree.length,dimensions,determinant:MI.determinant,modulus:29},
  tests:result,scope:"Only direct matrix block operations, four maps and two native block-reset clocks. Does not rule out two-layer fractionation, secret matrices or other consumers."
},null,2));
