'use strict';
/**
 * Source-derived red polynomial fixed points -> unique PGL2 and GL2
 * original p8 receiver test. No unknown fitted key or receiver offset.
 * Windows Node.js22, read-only SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const load = name => fs.readFileSync(path.join(root, name), 'utf8');
const gp = JSON.parse(load('lp2-corpus.json'));
const ink = JSON.parse(load('lp2-ink-annotations.json'));
const parts = load('lp2-transcription.txt').split('%');
const runes = new Map(gp.runes.map((c, i) => [c, i]));
const mod = x => (x % 29 + 29) % 29;
const mod4 = x => (x % 4 + 4) % 4;
/** @param {number} x @returns {number} */
function inv(x) {
  assert.notEqual(mod(x), 0);
  let z = 1;
  for (let i = 0; i < 27; i++) z = mod(z * x);
  return z;
}
const p7 = gp.pages[7].indices, p8 = gp.pages[8].indices, p9 = gp.pages[9].indices;
const red7 = ink.pages.find(p => p.page === 7).red_spans;
const red8 = ink.pages.find(p => p.page === 8).red_spans;
assert.deepEqual(red7.map(x => [x.start, x.length]), [[194, 14]]);
assert.deepEqual(red8.map(x => [x.start, x.length]), [[0, 12]]);
const product = xs => xs.reduce((a, b) => mod(a * b), 1);
/** @param {number[]} tape @param {number[]} sizes @returns {number[]} */
function wordProducts(tape, sizes) {
  const vals = [];
  let i = 0;
  for (const n of sizes) {
    vals.push(product(tape.slice(i, i + n)));
    i += n;
  }
  assert.equal(i, tape.length);
  return vals;
}
const coefficients = wordProducts(p7.slice(194), [2,4,3,2,3]);
const heading = wordProducts(p8.slice(0,12), [4,8]);
const evalPoly = (cs, x) => cs.reduceRight((a, b) => mod(a*x+b),0);
const deriv = coefficients.slice(1).map((c,i) => mod(c*(i+1)));
assert.deepEqual(coefficients, [11,26,8,15,2]);
assert.deepEqual(heading, [4,3]);
assert.deepEqual(heading.map(x => evalPoly(coefficients,x)), [4,3]);
const [u,v] = heading, lambda = evalPoly(deriv, u);
assert.equal(lambda,17);
assert.equal(p8[11],17);
assert.equal(mod(u*v*lambda),1);

// Unique PGL2 transformation with fixed u,v and derivative lambda at u:
// (T(x)-u)/(T(x)-v) = lambda * (x-u)/(x-v).
// We normalize so the matrix has eigenvalue one at (u,1).
const A=mod(u-lambda*v), B=mod((lambda-1)*u*v),
      C=mod(1-lambda), D=mod(lambda*u-v);
const matrix = [[A,B],[C,D]];
assert.deepEqual(matrix, [[11,18],[13,7]]);
assert.equal(mod(A*D-B*C),17);
assert.equal(mod(A+D),18);
const infinity=29;
const tMap=x=>{
  if(x===infinity)return mod(A*inv(C));
  const den=mod(C*x+D);
  return den===0?infinity:mod((A*x+B)*inv(den));
};
const mapping=Array.from({length:30},(_,x)=>tMap(x));
assert.equal(new Set(mapping).size,30);
assert.deepEqual(mapping.filter((y,i)=>i===y),[3,4]);
assert.equal(tMap(infinity),12);
assert.equal(mapping.indexOf(infinity),24);
/** @param {number} x @param {number} power @returns {number} */
function tPower(x,power) {
  for(let k=0;k<mod4(power);k++) x=tMap(x);
  return x;
}
for(let x=0;x<=29;x++){
  assert.equal(tMap(tMap(tMap(tMap(x)))),x);
  assert.equal(tPower(x,4),x);
}
const mPair = ([x,y]) => [mod(A*x+B*y),mod(C*x+D*y)];
/** @param {number[]} pair @param {number} power @returns {number[]} */
function mPower(pair,power){
  for(let k=0;k<mod4(power);k++)pair=mPair(pair);
  return pair;
}
for(let x=0;x<29;x++)for(let y=0;y<29;y++)
  assert.deepEqual(mPair(mPair(mPair(mPair([x,y])))),[x,y]);

const receiver={
  blackAndCarried: p8.slice(12).concat(p9[0]),
  allAndCarried: p8.concat(p9[0])
};
assert.equal(receiver.blackAndCarried.length,244);
assert.equal(receiver.allAndCarried.length,256);
const ioc = tape => {
  const counts=Array(29).fill(0);
  tape.forEach(x=>{if(x!==infinity) counts[x]++});
  const n=counts.reduce((a,b)=>a+b,0);
  return counts.reduce((a,b)=>a+b*(b-1),0)/(n*(n-1));
};
const tests=[];
for(const [name,tape]of Object.entries(receiver)){
  for(let k=1;k<=3;k++){
    const out=[];
    for(let i=0;i<tape.length;i+=2)out.push(...mPower(tape.slice(i,i+2),k));
    tests.push({name,method:'hill-constant',power:k,ioc:ioc(out),special:0});
  }
  for(let dir of [-1,1])for(let phase=0;phase<4;phase++){
    const out=[];
    for(let i=0;i<tape.length;i+=2)
      out.push(...mPower(tape.slice(i,i+2),dir*(i/2+phase)));
    tests.push({name,method:'hill-period4',dir,phase,ioc:ioc(out),special:0});
    const projected=tape.map((x,i)=>tPower(x,dir*(i+phase)));
    tests.push({name,method:'projective-period4',dir,phase,
      ioc:ioc(projected),special:projected.filter(x=>x===infinity).length});
  }
}
assert.equal(tests.length,38);
assert.equal(tests.filter(x=>x.ioc>=0.05).length,0);
const methodMax={
  hillConstant:Math.max(...tests.filter(x=>x.method==='hill-constant').map(x=>x.ioc)),
  hillPeriod4:Math.max(...tests.filter(x=>x.method==='hill-period4').map(x=>x.ioc)),
  projectivePeriod4:Math.max(...tests.filter(x=>x.method==='projective-period4').map(x=>x.ioc))
};
assert(Math.abs(methodMax.hillConstant-0.03673345476624165)<1e-12);
assert(Math.abs(methodMax.projectivePeriod4-0.036414565826330535)<1e-12);
const sample=Array.from({length:244},(_,i)=>(i*7+13)%29);
const hillEnc=[];
for(let i=0;i<sample.length;i+=2)
  hillEnc.push(...mPower(sample.slice(i,i+2),1));
const hillDec=[];
for(let i=0;i<hillEnc.length;i+=2)
  hillDec.push(...mPower(hillEnc.slice(i,i+2),3));
assert.deepEqual(hillDec,sample);
const pglEnc=sample.map((x,i)=>tPower(x,i));
const pglDec=pglEnc.map((x,i)=>tPower(x,-i));
assert.deepEqual(pglDec,sample);

// Independent source-only 242 black scroll-word products to
// 242 page-contained black p8 runes, grouped in twos under the same
// source-derived Hill matrix: this actually tests a complete receiver.
const redMap = new Map(ink.pages.map(p=>[p.page,new Set(
  (p.red_spans||[]).flatMap(s=>
    Array.from({length:s.length},(_,k)=>s.start+k)))]));
/** @type {{p:number,start:number,values:number[],allBlack:boolean}[]} */
const sourceWords=[];
let word=[];
for(let p=3;p<=7;p++){
  let pos=0;
  for(const ch of parts[p]){
    if(runes.has(ch)) {
      word.push({page:p,off:pos,val:runes.get(ch),
        red:redMap.get(p)?.has(pos)||false});
      pos++;
    }else if((ch==='-'||ch==='.')&&word.length){
      sourceWords.push({p:word[0].page,start:word[0].off,
        values:word.map(c=>c.val),
        allBlack:word.every(c=>!c.red)});
      word=[];
    }
  }
  assert.equal(pos,gp.pages[p].indices.length);
}
assert.equal(word.length,0);
assert.equal(sourceWords.length,255);
const blackWords=sourceWords.filter(w=>w.allBlack);
assert.equal(blackWords.length,242);
const blackHash=blackWords.map(w=>product(w.values));
const blackTarget=p8.slice(12,254);
assert.equal(blackTarget.length,242);
const sourceHashScreens=[];
for(let k=0;k<4;k++)for(let dir of [-1,1]){
  const plain=[];
  for(let i=0;i<242;i+=2)
    plain.push(...mPower(blackHash.slice(i,i+2),dir*(i/2+k)));
  const matches=plain.filter((v,i)=>v===blackTarget[i]).length;
  sourceHashScreens.push({phase:k,dir,matches});
}
assert.equal(Math.max(...sourceHashScreens.map(x=>x.matches)),14);
assert.equal(blackHash.filter(x=>x===0).length,26);
assert.equal(blackTarget.filter(x=>x===0).length,8);
console.log('LP2_P7_P8_POLYNOMIAL_PGL_HILL_ORIGINAL ' + JSON.stringify({
  sourceCoefficients:coefficients,headerRoots:heading,
  derivativeAtFirstRoot:lambda,uniqueMatrix:matrix,
  matrixDeterminant:mod(A*D-B*C),
  matrixOrder:4,projectiveOrder:4,
  projectiveInfinityTo:tMap(infinity),projectiveFinitePole:mapping.indexOf(infinity),
  originalFullRegisterLength:receiver.allAndCarried.length,
  originalBlackRegisterLength:receiver.blackAndCarried.length,
  baselineFullIoC:ioc(receiver.allAndCarried),
  baselineBlackIoC:ioc(receiver.blackAndCarried),
  sourceFixedCompleteReceiverModels:tests.length,
  sourceFixedModelMaximumIoC:methodMax,
  sourceFixedModelNativeIoCOver05:0,
  originalBlackSourceWords:blackWords.length,
  originalWordProductZeroCount:blackHash.filter(x=>x===0).length,
  originalBlackTargetZeros:blackTarget.filter(x=>x===0).length,
  bestGP0ProductHill242ExactMatches:Math.max(...sourceHashScreens.map(x=>x.matches)),
  intactOriginalRunePlaintextRecovered:false
}));