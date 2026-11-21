'use strict';
/**
 * Independently selected LP2 red-factor composition gives a 243-rune quotient.
 * Original-cipher finite gate for the newly available 9x27 receiver:
 * - nine natural 27-period additive chapter pads;
 * - source-signed HELLO=LIBER=243, original first chapter 729=3x243
 *   and two natural three-share alignments;
 * - 3x3 GF29 Hill registers formed by each 27-value chapter-key row.
 *
 * No unknown key fitting, no invented plaintext. All operations are reversible
 * on native GP29 planted controls. Original tests use only pinned input files.
 * Run: node sims/lp2_p50_redHG_nonic_q243_original_receivers_sft.cjs
 * Node.js 22 / Windows 11 / CommonJS, no external dependencies.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
/** @param {string} file */
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const table=read('resources/liber-primus/lp2-grid-256.json').bytes;
const corpus=read('resources/liber-primus/lp2-corpus.json');
const mod=x=>(x%29+29)%29;
assert.equal(table.length,256);
assert.equal(corpus.translit.length,29);
/** @param {number[]} a @param {number[]} b */
function multiply(a,b) {
  const p=Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)
    p[i+j]=mod(p[i+j]+a[i]*b[j]);
  return p;
}
const factors={
  p23:[23,6,10],p39:[27,5,15],
  nonic:[11,15,0,9,1,5,10,20,12,1]
};
const divisor=multiply(multiply(factors.p23,factors.p39),factors.nonic);
assert.deepEqual(divisor,[16,8,27,13,20,11,17,11,21,0,21,18,26,5]);
const inverseScalar=x=> {
  const y=Array.from({length:29},(_,i)=>i).find(v=>mod(x*v)===1);
  assert.notEqual(y,undefined,'zero divisor');
  return y;
};
/** @param {number[]} source high-degree first GF29 digits
 * @param {number[]} poly ascending GF29 coefficients */
function divide(source,poly) {
  const work=source.map(mod),key=[];
  const a=inverseScalar(poly[poly.length-1]);
  for(let i=0;i<=source.length-poly.length;i++) {
    const t=mod(a*work[i]);
    key.push(t);
    for(let k=0;k<poly.length;k++)
      work[i+k]=mod(work[i+k]-t*poly[poly.length-1-k]);
  }
  return {quotient:key,remainder:work.slice(-(poly.length-1))};
}
const {quotient:q,remainder}=divide(table,divisor);
assert.equal(q.length,243);
assert.deepEqual(remainder,Array(13).fill(0));
const reconstruct=multiply(q.slice().reverse(),divisor).reverse();
assert.deepEqual(reconstruct,table.map(mod));
const rows=Array.from({length:9},(_,i)=>q.slice(i*27,(i+1)*27));
assert.deepEqual(rows.map(v=>new Set(v).size),
  [17,18,16,15,19,17,16,19,18]);
/** @param {number[]} a */
function ioc(a) {
  const h=new Uint32Array(29);
  for(const x of a)h[x]++;
  return h.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1));
}
const chapters=[
  [0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]
];
const chapterCipher=chapters.map(([lo,hi])=>
  corpus.pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices));
assert.deepEqual(chapterCipher.map(v=>v.length),
  [729,1145,1729,1903,1021,1433,1680,3008,308]);
const additive=[];
for(let ch=0;ch<9;ch++)for(const sign of [-1,1])
for(const reverse of [false,true]) {
  const key=reverse?rows[ch].slice().reverse():rows[ch];
  const decoded=chapterCipher[ch].map((x,i)=>mod(x+sign*key[i%27]));
  assert.deepEqual(decoded.map((x,i)=>mod(x-sign*key[i%27])),
    chapterCipher[ch]);
  additive.push({ch,sign,reverse,ioc:ioc(decoded)});
}
assert.equal(additive.length,36);
assert(additive.every(x=>x.ioc<.045));

const original=chapterCipher[0];
assert.equal(original.length,3*243);
const forms=[
  ['shamir123',[3,-3,1]],
  ['sum',[1,1,1]],
  ['alternating',[1,-1,1]],
  ['difference',[1,-1,0]],
  ['addfirst',[1,1,0]],
  ['third',[0,0,1]]
];
const shares=[];
for(const layout of ['consecutive','interleaved']) {
  const a=layout==='consecutive'
    ? [0,1,2].map(i=>original.slice(i*243,(i+1)*243))
    : [0,1,2].map(i=>original.filter((_,j)=>j%3===i));
  for(const [form,coeff] of forms)for(const sign of [-1,0,1]) {
    const values=q.map((key,i)=>mod(
      coeff[0]*a[0][i]+coeff[1]*a[1][i]+coeff[2]*a[2][i]+sign*key));
    shares.push({layout,form,sign,ioc:ioc(values)});
  }
}
assert.equal(shares.length,36);
assert(shares.every(x=>x.ioc<.045));
/** @param {number[]} m 3x3 row-major */
function determinant(m) {
  return mod(m[0]*(m[4]*m[8]-m[5]*m[7])
    -m[1]*(m[3]*m[8]-m[5]*m[6])
    +m[2]*(m[3]*m[7]-m[4]*m[6]));
}
/** @param {number[]} m 3x3 row-major */
function matrixInverse(m) {
  const a=Array.from({length:3},(_,i)=>[
    ...m.slice(i*3,i*3+3),
    ...Array.from({length:3},(_,j)=>Number(i===j))
  ]);
  for(let k=0;k<3;k++) {
    const pivot=Array.from({length:3-k},(_,j)=>j+k)
      .find(i=>a[i][k]!==0);
    assert.notEqual(pivot,undefined,'noninvertible matrix');
    [a[k],a[pivot]]=[a[pivot],a[k]];
    const inv=inverseScalar(a[k][k]);
    for(let j=0;j<6;j++)a[k][j]=mod(a[k][j]*inv);
    for(let i=0;i<3;i++)if(i!==k) {
      const factor=a[i][k];
      for(let j=0;j<6;j++)a[i][j]=mod(a[i][j]-factor*a[k][j]);
    }
  }
  return a.flatMap(row=>row.slice(3));
}
/** @param {number[]} a @param {number[]} b 3x3 matrices */
function matrixMultiply(a,b) {
  const out=Array(9).fill(0);
  for(let i=0;i<3;i++)for(let j=0;j<3;j++)for(let k=0;k<3;k++)
    out[i*3+j]=mod(out[i*3+j]+a[i*3+k]*b[k*3+j]);
  return out;
}
/** @param {number[]} m @param {number[]} v 3x3 times 3x1 */
function apply(m,v) {
  return Array.from({length:3},(_,i)=>
    mod(m[3*i]*v[0]+m[3*i+1]*v[1]+m[3*i+2]*v[2]));
}
const matrices=rows.map(row=>Array.from({length:3},(_,j)=>
  row.slice(9*j,9*(j+1))));
const determinants=matrices.map(row=>row.map(determinant));
assert.deepEqual(determinants,[
  [2,24,1],[26,3,16],[21,26,8],[21,18,11],
  [16,2,18],[3,19,13],[1,20,25],[12,8,10],[16,10,21]
]);
const planted=corpus.pages.find(p=>p.page===57).indices.slice(0,93);
assert.equal(planted.length,93);
let positiveBlocks=0;
for(const row of matrices)for(const matrix of row) {
  const inverse=matrixInverse(matrix);
  for(let i=0;i+2<planted.length;i+=3) {
    const plain=planted.slice(i,i+3);
    assert.deepEqual(apply(inverse,apply(matrix,plain)),plain);
    positiveBlocks++;
  }
}
assert.equal(positiveBlocks,837);
const hill=[];
for(let ch=0;ch<9;ch++)for(const mode of
['cycle','composite','reverse-composite']) {
  const ms=matrices[ch];
  const keys=mode==='cycle'?ms:
    [((row)=>row.slice(1).reduce((x,y)=>matrixMultiply(x,y),row[0]))
      (mode==='composite'?ms:ms.slice().reverse())];
  const inverses=keys.map(matrixInverse);
  const ciphertext=chapterCipher[ch],plain=[];
  for(let i=0;i+2<ciphertext.length;i+=3) {
    plain.push(...apply(inverses[(i/3)%inverses.length],
      ciphertext.slice(i,i+3)));
  }
  hill.push({ch,mode,len:plain.length,ioc:ioc(plain)});
}
assert.equal(hill.length,27);
assert(hill.every(x=>x.ioc<.045));

/** @param {number[]} digits GP29 digit sequence high-first */
function base29Bytes(digits) {
  const n=digits.reduce((v,d)=>29n*v+BigInt(d),0n);
  const raw=n.toString(16);
  return Buffer.from(raw.length%2===0?raw:'0'+raw,'hex');
}
const serialized=[
  ['forward',base29Bytes(q)],
  ['reversed',base29Bytes(q.slice().reverse())]
];
assert.deepEqual(serialized.map(([orientation,bytes])=>
  [orientation,bytes.length,bytes.toString('hex').slice(0,16)]),[
  ['forward',147,'a317cde6ad3e4487'],
  ['reversed',148,'04784d98400af3a0']
]);
const binaryReadouts=serialized.map(([orientation,bytes])=>{
  const printable=[...bytes].filter(b=>b>=32&&b<=126).length;
  const knownMagic=['1f8b08','425a68','89504e47','504b0304',
    '25504446','7f454c46','504b0506'].some(sig=>
      bytes.toString('hex').startsWith(sig));
  const oldOpenPgpCompressed=bytes[0]===0xa3
    &&[0,1,2,3].includes(bytes[1]);
  assert(!knownMagic&&!oldOpenPgpCompressed);
  return {orientation,byteLength:bytes.length,
    first16Hex:bytes.subarray(0,16).toString('hex'),
    printable,knownFileMagic:false,oldOpenPgpCompressed:false};
});

const bitLengths=rows.map(row=>
  row.reduce((x,k)=>29n*x+BigInt(k),0n).toString(2).length);
assert.deepEqual(bitLengths,[127,130,131,131,128,130,130,131,131]);
/** @param {Array<{ioc:number}>} rows */
function range(rows) {
  return [Math.min(...rows.map(r=>r.ioc)),
    Math.max(...rows.map(r=>r.ioc))];
}
const result={
  status:'No unknown LP2 plaintext, key, or cipher inverse recovered',
  source:'Original p50 table and original p0..55 rune sequence',
  redFactor:{p23:factors.p23,p39:factors.p39,nonic:factors.nonic,
    degree13Divisor:divisor,zeroRemainder:remainder.every(x=>x===0),
    quotient:q.length,chapterRows:rows.length,
    rowDistinct:rows.map(v=>new Set(v).size),
    quotientIoC:ioc(q),rowBase29Bits:bitLengths,
    directBASE29Binary:binaryReadouts},
  chapterAdditive:{tested:additive.length,IoCRange:range(additive)},
  firstChapterShares:{original:729,quotient:243,models:shares.length,
    IoCRange:range(shares),
    best:shares.reduce((a,b)=>a.ioc>b.ioc?a:b)},
  threeByThreeHill:{determinants,models:hill.length,
    IoCRange:range(hill),positiveNativeBlocks:positiveBlocks},
  decision:'These finite source-conditioned readouts stay near uniform. '+
    'An independently authored selector is required before trying further '+
    'moduli, key-derivation functions, phases or nonlinear receivers.'
};
assert(Math.abs(result.redFactor.quotientIoC-.03489439853076217)<1e-12);
assert(Math.abs(result.firstChapterShares.best.ioc-.03632282420161208)<1e-12);
console.log(JSON.stringify(result,null,2));
