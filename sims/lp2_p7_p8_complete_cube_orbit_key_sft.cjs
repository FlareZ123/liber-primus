"use strict";
/**
 * One frozen p7 -> p8-p14 source-key candidate, using the full GF(29)
 * cubing orbit. Windows Node 22 SFT:
 * node sims/lp2_p7_p8_complete_cube_orbit_key_sft.cjs
 * All ciphertext positions remain in source order and consume the key.
 */
const assert=require("node:assert/strict");
const gp=require("../resources/liber-primus/lp2-corpus.json");
const ink=require("../resources/liber-primus/lp2-ink-annotations.json");
const mod=x=>((x%29)+29)%29;
/** @param {number} x @param {number} e @returns {number} */
function pow(x,e){let z=1;while(e>0){if(e%2)z=mod(z*x);x=mod(x*x);e=Math.floor(e/2);}return z;}
/** @param {number[]} a @returns {number} */
function ioc(a){const h=new Uint32Array(29);for(const x of a)h[x]++;return h.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));}
/** @param {number[]} a @returns {string} */
const spell=a=>a.map(i=>gp.translit[i]).join("");
const red7=ink.pages.find(p=>p.page===7).red_spans[0];
const red8=ink.pages.find(p=>p.page===8).red_spans[0];
assert.deepEqual([red7.start,red7.length],[194,14]);
assert.deepEqual([red8.start,red8.length],[0,12]);
const r7=gp.pages[7].indices.slice(194,208);
const r8=gp.pages[8].indices.slice(0,12);
assert.equal(r7.map(i=>gp.runes[i]).join(""),red7.runes);
assert.equal(r8.map(i=>gp.runes[i]).join(""),red8.runes);
let pos=0;
const products=[2,4,3,2,3].map(n=>{
 const v=r7.slice(pos,pos+n).reduce((s,x)=>mod(s*x),1);
 pos+=n;return v;
});
assert.deepEqual(products,[11,26,8,15,2]);
assert.deepEqual(r8.slice(0,4),[14,10,14,19]);
const orbit=[products.at(-1)];
for(let j=0;j<5;j++)orbit.push(pow(orbit.at(-1),3));
assert.deepEqual(orbit,[2,8,19,15,11,26]);
assert.equal(pow(orbit.at(-1),3),orbit[0]);
assert.deepEqual([...products,r8[3]].sort((a,b)=>a-b),[...orbit].sort((a,b)=>a-b));
const cipher=gp.pages.slice(8,15).flatMap(p=>p.indices);
const native=gp.pages[57].indices;
assert.equal(cipher.length,1729);assert.equal(native.length,95);
/** @typedef {{name:string,de:(v:number,k:number)=>number,en:(v:number,k:number)=>number}} CipherMap */
/** @type {CipherMap[]} */
const maps=[
 {name:"C-K",de:(c,k)=>mod(c-k),en:(p,k)=>mod(p+k)},
 {name:"C+K",de:(c,k)=>mod(c+k),en:(p,k)=>mod(p-k)},
 {name:"root(C-K)",de:(c,k)=>pow(mod(c-k),19),en:(p,k)=>mod(pow(p,3)+k)},
 {name:"root(C+K)",de:(c,k)=>pow(mod(c+k),19),en:(p,k)=>mod(pow(p,3)-k)},
 {name:"root(C)-K",de:(c,k)=>mod(pow(c,19)-k),en:(p,k)=>pow(mod(p+k),3)},
 {name:"root(C)+K",de:(c,k)=>mod(pow(c,19)+k),en:(p,k)=>pow(mod(p-k),3)},
 {name:"C/K",de:(c,k)=>mod(c*pow(k,27)),en:(p,k)=>mod(p*k)},
 {name:"C*K",de:(c,k)=>mod(c*k),en:(p,k)=>mod(p*pow(k,27))},
 {name:"root(C/K)",de:(c,k)=>pow(mod(c*pow(k,27)),19),en:(p,k)=>mod(pow(p,3)*k)},
 {name:"root(C*K)",de:(c,k)=>pow(mod(c*k),19),en:(p,k)=>mod(pow(p,3)*pow(k,27))}
];
/** @param {number[]} a @param {CipherMap} map @param {"de"|"en"} dir */
const apply=(a,map,dir)=>a.map((v,i)=>map[dir](v,orbit[i%6]));
const result=maps.map(map=>{
 const decoded=apply(cipher,map,"de");
 assert.deepEqual(apply(decoded,map,"en"),cipher);
 assert.deepEqual(apply(apply(native,map,"en"),map,"de"),native);
 return {map:map.name,ioc:ioc(decoded),first100:spell(decoded.slice(0,100))};
});
assert(result.every(x=>x.ioc<.037));
assert(ioc(native)>.06);
console.log(JSON.stringify({source:"p7 five red words, p8 red M19, original p8-p14",
 products,missingOrbitVertexFromP8:r8[3],orbit,
 originalLength:cipher.length,originalIOC:ioc(cipher),
 solvedP57IOC:ioc(native),allExactReplays:true,
 allNativeP57Positives:true,
 recoveredPlaintext:false,results:result},null,2));


/**
 * A different source-selected consumer: p8's 243 black runes are precisely
 * 3^5. Each of the five p7 red word-products selects one ternary axis.
 * Sample three points along that axis by successive cubing (or root19),
 * then perform the GF29 Vandermonde inverse. Earlier numeric-step and
 * linear-point tensor tests did not test these particular cube orbits.
 * This is a secret-sharing interpretation, not an authenticated instruction.
 */
/** @param {number[][]} matrix @returns {number[][]} */
function inverse3(matrix) {
  const rows=matrix.map((row,i)=>row.map(mod).concat(
    Array.from({length:3},(_,j)=>Number(i===j))));
  for(let col=0;col<3;col++) {
    let pivot=col;
    while(pivot<3 && rows[pivot][col]===0)pivot++;
    assert(pivot<3,"distinct cubing orbit samples");
    [rows[col],rows[pivot]]=[rows[pivot],rows[col]];
    const reciprocal=pow(rows[col][col],27);
    for(let k=col;k<6;k++)rows[col][k]=mod(rows[col][k]*reciprocal);
    for(let r=0;r<3;r++)if(r!==col) {
      const factor=rows[r][col];
      for(let k=col;k<6;k++)rows[r][k]=mod(rows[r][k]-factor*rows[col][k]);
    }
  }
  return rows.map(row=>row.slice(3));
}
/** @param {number[][]} matrix @returns {number[][]} */
const transpose=matrix=>matrix.map((row,i)=>row.map((_,j)=>matrix[j][i]));
/**
 * @param {number[]} runes exactly 3^5 symbols
 * @param {number[][][]} matrices one 3x3 matrix per source-product axis
 * @returns {number[]}
 */
function fiveAxisTransform(runes,matrices) {
  assert.equal(runes.length,243);
  let output=runes.slice();
  for(let axis=0;axis<5;axis++) {
    const prior=output.slice(),step=3**axis;
    for(let pos=0;pos<243;pos++) {
      if(Math.floor(pos/step)%3!==0)continue;
      const input=[prior[pos],prior[pos+step],prior[pos+2*step]];
      for(let row=0;row<3;row++)output[pos+row*step]=mod(
        matrices[axis][row].reduce((sum,c,i)=>sum+c*input[i],0));
    }
  }
  return output;
}
const redLength=12,black=gp.pages[8].indices.slice(redLength);
assert.equal(black.length,3**5);
const tensorResults=[];
for(const exponent of [3,19]) {
  const samplePoints=products.map(x=>[
    x,pow(x,exponent),pow(pow(x,exponent),exponent)]);
  const matrices=samplePoints.map(samples=>samples.map(
    x=>[1,x,mod(x*x)]));
  for(const mode of ["inverse","direct","transpose-inverse","transpose-direct"]) {
    const operation=matrices.map(m=>{
      const base=mode.includes("inverse")?inverse3(m):m;
      return mode.startsWith("transpose")?transpose(base):base;
    });
    const reverse=operation.map(inverse3);
    // Axis maps commute, so applying the inverse in forward order is exact.
    const candidate=fiveAxisTransform(black,operation);
    assert.deepEqual(fiveAxisTransform(candidate,reverse),black);
    const positive=[...native,...native,...native.slice(0,53)];
    assert.equal(positive.length,243);
    assert.deepEqual(fiveAxisTransform(fiveAxisTransform(positive,reverse),
      operation),positive);
    const measured={exponent,mode,samplePoints,ioc:ioc(candidate),
      first100:spell(candidate.slice(0,100))};
    assert(measured.ioc<.037);
    tensorResults.push(measured);
  }
}
assert.equal(tensorResults.length,8);
console.log(JSON.stringify({test:"p7 cubing-orbit GF29 three-point five-axis p8 black",
 originalP8Body:243,cubeOrbit:orbit,sourceProducts:products,
 originalBodyIOC:ioc(black),solvedP57IOC:ioc(native),
 exactOriginalRoundTrips:8,syntheticNativeRecoveries:8,
 recoveredUnknownPlaintext:false,tensorResults},null,2));
