'use strict';

/**
 * Source-quadratic GF(29^2) terminal 256 erasure candidate.
 *
 * Original signed 2013 BASE29 3301 -> 3QO determines
 *   H(X)=3+26X+24X^2, irreducible in GF(29).
 * Therefore in GF(841)=GF(29)[alpha]/(H),
 *   alpha^2=18+11alpha.
 *
 * Map the 256 original 32x8 grid *cell ordinals* q=0..255 to
 * field points q%29 + floor(q/29)*alpha. Treat 180 known original
 * p56 (authentically decrypted) + p57 (clear) GP29 runes as values
 * at the three inner rings. Unique degree<180 interpolation predicts
 * 76 withheld p55 outer values. Real GP29 symbols must lie in the
 * prime subfield [0..28], so any extended value fails decisively.
 * Every independent 8^3 original inner-ring route is tested.
 *
 * This is an exploratory decoder, NOT an author-selected mechanism.
 * The printed numeral *values* are source-pinned but NOT used as x.
 *
 * SFT: node sims/lp2_terminal256_gf841_source_erasure_sft.cjs
 * Windows Node22, CommonJS, no packages, file writes or networking.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {any} */
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const db = read('resources/liber-primus/lp2-corpus.json');
const source = read('resources/liber-primus/lp2-grid-256.json');
assert.equal(source.bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(source.bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
/** @param {number} n @returns {number} */
const mod = n => ((n % 29) + 29) % 29;
/** @param {number} u @param {number} v @returns {number} */
const add = (u, v) => mod(u%29+v%29)+29*mod(Math.floor(u/29)+Math.floor(v/29));
/** @param {number} u @returns {number} */
const neg = u => mod(-u%29)+29*mod(-Math.floor(u/29));
/** @param {number} u @param {number} v @returns {number} */
const sub = (u,v) => add(u,neg(v));
/** @param {number} u @param {number} v @returns {number} */
function mul(u,v) {
  const a=u%29,b=Math.floor(u/29),c=v%29,d=Math.floor(v/29);
  return mod(a*c+18*b*d)+29*mod(a*d+b*c+11*b*d);
}
const inverseScalar = new Array(29).fill(0);
for (let a=1;a<29;a++) for (let b=1;b<29;b++)
  if (a*b%29===1) inverseScalar[a]=b;
assert.ok(inverseScalar.slice(1).every(v=>v!==0));
/** @param {number} x @returns {number} */
function inverse(x) {
  const a=x%29,b=Math.floor(x/29);
  // conjugate(alpha)=11-alpha, norm(alpha)=11.
  const norm=mod(a*a+11*a*b+11*b*b);
  assert.ok(norm>0,'Nonzero field element must have nonzero norm');
  return mod((a+11*b)*inverseScalar[norm])+
    29*mod(-b*inverseScalar[norm]);
}
for(let x=1;x<841;x++)assert.equal(mul(x,inverse(x)),1);
assert.equal(mul(29,29),18+29*11); // alpha^2=18+11alpha
/** @param {number} x @param {number} exponent @returns {number} */
function pow(x,exponent) {
  let y=1,v=x;
  for(let n=exponent;n>0;n=Math.floor(n/2)) {
    if(n%2) y=mul(y,v);
    v=mul(v,v);
  }
  return y;
}
const rings=[];
for(let depth=0;depth<4;depth++) {
  const ring=[];
  for(let x=depth;x<=7-depth;x++)ring.push(8*depth+x);
  for(let y=depth+1;y<=31-depth;y++)ring.push(8*y+7-depth);
  for(let x=6-depth;x>=depth;x--)ring.push(8*(31-depth)+x);
  for(let y=30-depth;y>depth;y--)ring.push(8*y+depth);
  rings.push(ring);
}
assert.deepEqual(rings.map(r=>r.length),[76,68,60,52]);
assert.equal(new Set(rings.flat()).size,256);
const knots=rings.slice(1).flat();
const outer=rings[0];
const weights=knots.map((x,i)=>{
  let product=1;
  for(let j=0;j<knots.length;j++)if(i!==j)
    product=mul(product,sub(x,knots[j]));
  return inverse(product);
});
const extrapolate=outer.map(x=>{
  let product=1;
  for(const k of knots)product=mul(product,sub(x,k));
  const coefficients=knots.map((k,i)=>
    mul(mul(product,weights[i]),inverse(sub(x,k))));
  const checksum=coefficients.reduce((sum,c)=>add(sum,c),0);
  assert.equal(checksum,1,'Lagrange constant polynomial control');
  return coefficients;
});
/**
 * Evaluates 76 extrapolations for 180 values placed at original knot cells.
 * @param {number[]} valueAtKnot - 180 prime-subfield GP29 values in knots order
 * @returns {number[]} 76 full-field values (0..840)
 */
function predict(valueAtKnot) {
  assert.equal(valueAtKnot.length,180);
  return extrapolate.map(row=>{
    let acc=0;
    for(let i=0;i<180;i++) {
      const scalar=valueAtKnot[i];
      assert.ok(scalar>=0 && scalar<29);
      if(scalar===0)continue;
      const f=row[i];
      acc=add(acc,mod((f%29)*scalar)+29*mod(Math.floor(f/29)*scalar));
    }
    return acc;
  });
}
const corners=[[0,0],[0,7],[31,7],[31,0]];
const orientations=[[],[],[],[]];
for(let depth=1;depth<4;depth++) {
  for(let corner=0;corner<4;corner++)for(const dir of [-1,1]){
    const [cy,cx]=corners[corner];
    const y=Math.max(depth,Math.min(31-depth,cy));
    const x=Math.max(depth,Math.min(7-depth,cx));
    const ring=rings[depth];
    const at=ring.indexOf(8*y+x);
    assert.ok(at>=0);
    orientations[depth].push(ring.map((_,i)=>
      ring[(at+dir*i+2*ring.length)%ring.length]));
  }
}
for(const options of orientations.slice(1))assert.equal(options.length,8);
/** @param {number} count @returns {number[]} */
function primes(count) {
  const result=[];
  for(let n=2;result.length<count;n++){
    let prime=true;
    for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break;}
    if(prime)result.push(n);
  }
  return result;
}
const p56=db.pages[56].indices,p57=db.pages[57].indices;
assert.deepEqual([db.pages[55].indices.length,p56.length,p57.length],
  [76,85,95]);
const primeStream=primes(100);
let keyAt=0;
const decrypted56=p56.map((v,i)=>i===56?0:mod(v-(primeStream[keyAt++]-1)));
assert.equal(keyAt,84);
const register=[
  {name:'authenticated p56 clear + literal p57',values:decrypted56.concat(p57)},
  {name:'original p56 cipher + literal p57',values:p56.concat(p57)}
];
const outputs=[];
for(const known of register){
  assert.equal(known.values.length,180);
  const hist=Array(77).fill(0);
  let tested=0,max=0,best=null;
  for(let i=0;i<8;i++)for(let j=0;j<8;j++)for(let k=0;k<8;k++){
    const order=orientations[1][i].concat(orientations[2][j],orientations[3][k]);
    const at=Array(256).fill(-1);
    order.forEach((pos,n)=>{at[pos]=known.values[n];});
    const values=knots.map(pos=>at[pos]);
    const predicted=predict(values);
    const valid=predicted.filter(v=>v<29).length;
    hist[valid]++;
    tested++;
    if(valid>max){max=valid;best={orientations:[i,j,k],valid,predicted:predicted.slice(0,12)};}
  }
  assert.equal(tested,512);
  assert.equal(max,9);
  assert.equal(hist[76],0);
  outputs.push({register:known.name,orientationsTested:tested,
    maximumValidGP29Predictions:max, fullGP29Solutions:hist[76],
    histogram:hist.map((n,i)=>({valid:i,count:n})).filter(v=>v.count),
    best});
}

// Full 256-symbol *GP29-valued*, source-shaped positive plant. The norm
// x^30 and trace x^29+x from GF841 to GF29 are field polynomials of
// degrees30 and29, therefore automatically interpolable at degree<180.
const positive=Array.from({length:256},(_,pos)=>{
  const a=pos%29,b=Math.floor(pos/29);
  const norm=mod(a*a+11*a*b+11*b*b);
  const trace=mod(2*a+11*b);
  const original=mod(3*norm+7*trace+11);
  assert.equal(mul(pos,pow(pos,29)),norm);
  assert.equal(add(pos,pow(pos,29)),trace);
  return original;
});
const knownPlant=knots.map(pos=>positive[pos]);
const recoveredPlant=predict(knownPlant);
assert.deepEqual(recoveredPlant,outer.map(pos=>positive[pos]));
assert.ok(recoveredPlant.every(v=>v>=0&&v<29));
console.log(JSON.stringify({
  source:'Signed 2013 BASE29 3QO quadratic + 2014 256-cell original grid geometry',
  field:'GF(29^2) with alpha^2=18+11alpha; 841 total elements',
  interpolation:'unique degree<=179 through 180 known original inner positions',
  withheldOuterCells:76,knownOriginalTerminalRunes:180,
  actual:outputs,plantedGP29Success:recoveredPlant.length,
  status:'Original excluded: every route predicts GP29-invalid outer values',
  recoveredOriginalUnknownPlaintext:0
},null,2));
