'use strict';
/**
 * Source-frozen terminal 32x8 inverse gate: unrestricted row-local PGL(2,29)
 * and a systematic 30x6 -> 32x8 bivariate product code over GF(29^2).
 * Uses the exact original LP2 terminal ciphertext and authenticated p56 decryption.
 * No key or unknown plaintext is claimed.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} p @returns {any} */
const read = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const db = read('resources/liber-primus/lp2-corpus.json');
const table = read('resources/liber-primus/lp2-grid-256.json');
const [p55, cipher56, clear57] = [55, 56, 57].map(i => db.pages[i].indices);
assert.deepEqual([p55.length, cipher56.length, clear57.length, table.bytes.length], [76,85,95,256]);
/** @param {number} x @returns {number} */
const mod = x => (x % 29 + 29) % 29;
/** @param {number} n @returns {number[]} */
function primes(n) {
  const out = [];
  for (let x = 2; out.length < n; x++) {
    if (out.every(p => p*p > x || x%p !== 0)) out.push(x);
  }
  return out;
}
const ps = primes(100);
let pindex = 0;
const plain56 = cipher56.map((c,i) => i===56 ? 0 : mod(c - (ps[pindex++]-1)));
assert.equal(pindex,84);
const expected56 = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
/** @param {string} text @returns {number[]} */
function gpEncode(text) {
  const tokens = db.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  const result=[];
  for(const word of text.split(' ')) {
    for(let offset=0; offset<word.length;) {
      const t=tokens.find(x=>word.startsWith(x.s,offset));
      assert(t, 'Unknown GP token at '+word.slice(offset));
      result.push(t.i);
      offset+=t.s.length;
    }
  }
  return result;
}
assert.deepEqual(plain56,gpEncode(expected56));
const known180 = plain56.concat(clear57);
const corners=[[0,0],[0,7],[31,7],[31,0]];
/** @type {number[][]} */
const rings=[];
for(let d=0; d<4; d++) {
  const r=[];
  for(let x=d; x<=7-d; x++) r.push(8*d+x);
  for(let y=d+1; y<=31-d; y++) r.push(8*y+7-d);
  for(let x=6-d; x>=d; x--) r.push(8*(31-d)+x);
  for(let y=30-d; y>d; y--) r.push(8*y+d);
  rings.push(r);
}
assert.deepEqual(rings.map(x=>x.length),[76,68,60,52]);
/** @param {number} corner @param {number} direction @returns {number[]} */
function ringPath(corner,direction) {
  const [cy,cx]=corners[corner];
  const path=rings.flatMap((ring,d)=>{
    const y=Math.max(d,Math.min(31-d,cy));
    const x=Math.max(d,Math.min(7-d,cx));
    const start=ring.indexOf(8*y+x);
    return ring.map((_,j)=>ring[(start+direction*j+ring.length*2)%ring.length]);
  });
  assert.equal(new Set(path).size,256);
  return path;
}
const inverses=Array(29).fill(0);
for(let x=1;x<29;x++) for(let y=1;y<29;y++) if(x*y%29===1) inverses[x]=y;
assert(inverses.slice(1).every(x=>x>0));
/** @type {number[][]} */
const fractionalMaps=[];
for(let a=1;a<29;a++) for(let b=0;b<29;b++) fractionalMaps.push([a,b,0,1]);
for(let d=0;d<29;d++) for(let a=0;a<29;a++) for(let b=0;b<29;b++)
  if(mod(a*d-b)!==0) fractionalMaps.push([a,b,1,d]);
assert.equal(fractionalMaps.length,24360);
/**
 * Max exact PGL(2,29) agreement on six simultaneously known row cells.
 * Undefined source fractions count as mismatches.
 * @param {number[]} B
 * @param {number[]} P
 * @returns {number}
 */
function bestFractional(B,P) {
  let best=0;
  for(const [a,b,c,d] of fractionalMaps) {
    let n=0;
    for(let i=0;i<B.length;i++) {
      const denominator=mod(c*B[i]+d);
      if(denominator!==0 && mod((a*B[i]+b)*inverses[denominator])===P[i]) n++;
    }
    if(n>best) best=n;
  }
  return best;
}
/** @param {number[]} path @param {number[]} known @returns {number[][]} */
function knownGrid(path,known) {
  const grid=Array.from({length:32},()=>Array(8).fill(null));
  for(let i=0;i<180;i++){
    const cell=path[i+76];
    grid[Math.floor(cell/8)][cell%8]=known[i];
  }
  for(let y=1;y<=30;y++) for(let x=1;x<=6;x++) assert(Number.isInteger(grid[y][x]));
  return grid;
}
const mobius=[];
for(let corner=0;corner<4;corner++)for(const direction of [-1,1]) {
  const path=ringPath(corner,direction);
  const out=knownGrid(path,known180);
  let matches=0,fullRows=0,maximum=0;
  for(let row=1;row<=30;row++) {
    const bytes=table.bytes.slice(8*row+1,8*row+7).map(x=>x%29);
    const best=bestFractional(bytes,out[row].slice(1,7));
    matches+=best;
    if(best===6) fullRows++;
    maximum=Math.max(maximum,best);
  }
  mobius.push({corner,direction,matches,fullRows,maximum});
}
assert.deepEqual(mobius.map(x=>x.matches),[99,96,99,98,100,94,98,99]);
assert(mobius.every(x=>x.fullRows===0));
// Row-wise Möbius positive control: each row is separately keyed by its index;
// its complete output must admit all six original positions simultaneously.
for(let row=1;row<=30;row++) {
  const B=table.bytes.slice(8*row+1,8*row+7).map(x=>x%29);
  const a=1+(row%28), b=row%29;
  const P=B.map(x=>mod(a*x+b));
  assert.equal(bestFractional(B,P),6);
}
/** @param {number} a @param {number} b @returns {number} */
const elem=(a,b)=>mod(a)+29*mod(b);
/** @param {number} x @param {number} y @returns {number} */
const add=(x,y)=>elem(x%29+y%29,Math.floor(x/29)+Math.floor(y/29));
/** @param {number} x @param {number} y @returns {number} */
const sub=(x,y)=>elem(x%29-y%29,Math.floor(x/29)-Math.floor(y/29));
/** @param {number} x @param {number} y @returns {number} */
function mul(x,y) {
  const [a,b,c,d]=[x%29,Math.floor(x/29),y%29,Math.floor(y/29)];
  return elem(a*c+8*b*d,a*d+b*c+3*b*d);
}
/** @param {number} x @param {number} n @returns {number} */
function pow(x,n) {
  let a=1;
  while(n) {
    if(n%2) a=mul(a,x);
    x=mul(x,x); n=Math.floor(n/2);
  }
  return a;
}
/** @param {number} a @param {number} b @returns {number} */
const div=(a,b)=>mul(a,pow(b,839));
const g=elem(19,13);
assert.equal(pow(g,840),1);
for(const k of [420,280,168]) assert.notEqual(pow(g,k),1);
const xx=Array.from({length:8},(_,i)=>pow(g,i));
const yy=Array.from({length:32},(_,i)=>pow(g,i));
assert.equal(new Set(xx).size,8);
assert.equal(new Set(yy).size,32);
/** @param {number[]} points @param {number} z @returns {number[]} */
function lagrange(points,z) {
  return points.map((p,i)=>points.reduce((a,q,j)=>i===j ? a : mul(a,div(sub(z,q),sub(p,q))),1));
}
const xWeights=[lagrange(xx.slice(1,7),xx[0]),lagrange(xx.slice(1,7),xx[7])];
const yWeights=[lagrange(yy.slice(1,31),yy[0]),lagrange(yy.slice(1,31),yy[31])];
/** @param {number[]} ws @param {number[]} vals @returns {number} */
const dot=(ws,vals)=>ws.reduce((v,w,i)=>add(v,mul(w,vals[i])),0);
/**
 * Exact bivariate systematic erasure completion from the 30x6 interior.
 * The output may lie in GF(841) rather than the GF29 rune subfield.
 * @param {number[]} path
 * @param {number[]} interior
 * @returns {number[]}
 */
function completeOuter(path,interior) {
  const grid=knownGrid(path,interior);
  for(let y=1;y<=30;y++) {
    const row=grid[y].slice(1,7);
    grid[y][0]=dot(xWeights[0],row);
    grid[y][7]=dot(xWeights[1],row);
  }
  for(let x=0;x<8;x++) {
    const col=grid.slice(1,31).map(row=>row[x]);
    grid[0][x]=dot(yWeights[0],col);
    grid[31][x]=dot(yWeights[1],col);
  }
  return path.slice(0,76).map(cell=>grid[Math.floor(cell/8)][cell%8]);
}
/** @param {number} x @returns {number} */
const trace=x=>mod(2*(x%29)+3*Math.floor(x/29));
/** @param {number} x @returns {number} */
const norm=x=>mod((x%29)**2+3*(x%29)*Math.floor(x/29)+21*Math.floor(x/29)**2);
const projections={real:x=>x%29,imag:x=>Math.floor(x/29),trace,norm};
// Positive bivariate degree (2,2) field polynomial: every border value is
// uniquely generated by the 180 known interior symbols and matched exactly.
const coeffs=[[5,2,17],[20,11,31],[41,23,46]];
/** @param {number} row @param {number} col @returns {number} */
function planted(row,col) {
  let value=0;
  for(let i=0;i<3;i++)for(let j=0;j<3;j++) value=add(value,mul(coeffs[i][j],mul(pow(yy[row],i),pow(xx[col],j))));
  return value;
}
const plantPath=ringPath(2,-1);
const plantInterior=plantPath.slice(76).map(cell=>planted(Math.floor(cell/8),cell%8));
const plantExterior=plantPath.slice(0,76).map(cell=>planted(Math.floor(cell/8),cell%8));
assert.deepEqual(completeOuter(plantPath,plantInterior),plantExterior);
const product=[];
for(const target of [['solved',known180],['printed',cipher56.concat(clear57)]]) {
  const [name,inner]=target;
  for(let corner=0;corner<4;corner++)for(const direction of [-1,1]) {
    const path=ringPath(corner,direction);
    const outer=completeOuter(path,inner);
    const literal=outer.filter(x=>x<29).length;
    const outputs={};
    for(const [label,project] of Object.entries(projections)) {
      const runes=outer.map(project);
      const hist=Array(29).fill(0);for(const x of runes) hist[x]++;
      outputs[label]={
        ciphertextMatches:runes.filter((v,i)=>v===p55[i]).length,
        ioc:hist.reduce((v,n)=>v+n*(n-1),0)/(76*75)
      };
    }
    product.push({target:name,corner,direction,literal,outputs});
  }
}
assert(product.every(x=>x.literal<=7));
assert(product.every(x=>Object.values(x.outputs).every(y=>y.ciphertextMatches<=6)));
const bestProduct=product.flatMap(x=>Object.entries(x.outputs).map(([projection,v])=>({target:x.target,corner:x.corner,direction:x.direction,projection,...v}))).sort((a,b)=>b.ioc-a.ioc)[0];
assert.equal(bestProduct.ioc,0.04421052631578947);
console.log(JSON.stringify({classification:'bounded original source negative; zero unknown plaintext',
  p55:76,solved180:known180.length,fieldGenerator:g,mobius,mobiusPlant:'30/30 rows exact',
  productCode:{testedOriginalLayouts:product.length,subfieldMaximum:Math.max(...product.map(x=>x.literal)),
    positivePlant:'76/76',bestOutput:bestProduct,layouts:product}},null,2));
