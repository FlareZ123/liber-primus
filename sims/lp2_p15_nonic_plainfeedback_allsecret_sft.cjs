'use strict';

/**
 * Source-table nonic, original p15-22, arbitrary plaintext-feedback key.
 * Entirely unknown eleven-state GF29 register; original singleton A/I/O
 * test under all 29 feedback multipliers, both original factor directions.
 * No third-party libraries, no file writes. Node 22 CommonJS, Windows.
 *
 * Cipher: C[i] = P[i] + alpha*P[i-1] + K[i] + beta (mod29).
 * K is a degree-nine recurrence whose complete original grid factor and
 * reciprocal are source-pinned. Its initial nine values are all secret.
 * For alpha!=0, even P[-1] is an unrestricted unknown (eleventh variable
 * gamma=alpha*P[-1]). For alpha=0 this extra variable is redundant.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {parseLP2Words} = require('./lp2_word_pages.cjs');

const root = path.resolve(__dirname, '..');
/** @param {string} name */
const sourceText = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(sourceText('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(sourceText('resources/liber-primus/lp2-grid-256.json'));
const wordSource = parseLP2Words(sourceText('resources/liber-primus/lp2-transcription.txt'));
/** @param {number} x */
const mod = x => (x % 29 + 29) % 29;
/** @param {number[]} a @param {number[]} b */
const dot = (a,b) => mod(a.reduce((s,x,j) => s + x*b[j], 0));
const n = 9;
const nonic = [1,12,20,10,5,1,9,0,15,11];
const reciprocal = [1,4,0,14,8,11,22,15,9,8];
const AIO = [24,10,3];
assert.deepEqual(nonic.slice().reverse().map(x => mod(x*8)), reciprocal);
assert.equal(crypto.createHash('sha256')
  .update(Buffer.from(grid.bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const polynomial = grid.bytes.slice().reverse().map(x => x%29);
const ascending = nonic.slice().reverse();
for (let i=polynomial.length-1;i>=n;i--) {
  const term=polynomial[i];
  for(let j=0;j<=n;j++)
    polynomial[i-n+j]=mod(polynomial[i-n+j]-term*ascending[j]);
}
assert.deepEqual(polynomial.slice(0,n), Array(n).fill(0));

const all = corpus.pages.filter(p => p.page<=55).flatMap(p => p.indices);
assert.equal(all.length,12956);
assert.equal(wordSource.words.length,2896);
assert.equal(wordSource.runeCount,12956);
const start = corpus.pages.filter(p => p.page<15)
  .reduce((s,p)=>s+p.indices.length,0)+9;
const end = corpus.pages.filter(p => p.page<23)
  .reduce((s,p)=>s+p.indices.length,0);
const C = all.slice(start,end);
assert.equal(C.length,1894);
const singles=[];
let position=0;
for(const word of wordSource.words) {
  if(word.length===1 && position>=start && position<end)
    singles.push(position-start);
  position+=word.length;
}
assert.equal(position,12956);
assert.deepEqual(singles,[126,171,269,394,530,536,564,605,621,746,
  862,1021,1087,1139,1182,1641,1707,1724]);

/** @param {number} x */
function inverseScalar(x) {
  for(let a=1;a<29;a++)if(mod(a*x)===1)return a;
  throw new Error('noninvertible scalar');
}
/** @param {number[][]} input */
function inverseMatrix(input) {
  const d=input.length;
  const a=input.map((row,i)=>[...row,
    ...Array.from({length:d},(_,j)=>+(i===j))]);
  for(let j=0;j<d;j++) {
    let k=j;
    while(k<d && a[k][j]===0)k++;
    assert.ok(k<d,'source singleton-anchor matrix is singular');
    [a[k],a[j]]=[a[j],a[k]];
    const inv=inverseScalar(a[j][j]);
    for(let h=j;h<2*d;h++)a[j][h]=mod(a[j][h]*inv);
    for(let i=0;i<d;i++)if(i!==j) {
      const factor=a[i][j];
      for(let h=j;h<2*d;h++)
        a[i][h]=mod(a[i][h]-factor*a[j][h]);
    }
  }
  return a.map(row=>row.slice(d));
}
/** @param {number[]} factor @param {number} length */
function keyRows(factor,length) {
  const v=Array.from({length:n},(_,i)=>
    Array.from({length:n},(_,j)=>+(i===j)));
  for(let i=n;i<length;i++) {
    const row=Array(n).fill(0);
    for(let j=1;j<=n;j++)for(let k=0;k<n;k++)
      row[k]=mod(row[k]-factor[j]*v[i-j][k]);
    v.push(row);
  }
  return v;
}
/**
 * P[i] = z[i] + u[i] dot theta.
 * theta = [K0..K8, beta, gamma], gamma=alpha*P[-1].
 * For alpha=0, gamma has no effect on these 18 positive offsets and is
 * correctly removed as the eleventh unknown.
 * @param {number[]} cipher
 * @param {number[][]} rows
 * @param {number} alpha
 */
function eliminate(cipher,rows,alpha) {
  let z=0;
  let u=Array(11).fill(0);
  const singletonSet=new Set(singles);
  const source=[];
  for(let i=0;i<cipher.length;i++) {
    z=mod(cipher[i]-alpha*z);
    u=u.map((x,j)=>mod(-alpha*x-(j<9?rows[i][j]:j===9?1:0)));
    if(i===0)u[10]=28;
    if(singletonSet.has(i))source.push({index:i,z,coeff:u.slice()});
  }
  assert.equal(source.length,18);
  const d=alpha===0?10:11;
  const anchor=source.slice(0,d);
  const held=source.slice(d);
  const inverse=inverseMatrix(anchor.map(x=>x.coeff.slice(0,d)));
  const weights=held.map(point=>
    Array.from({length:d},(_,j)=>mod(
      point.coeff.slice(0,d).reduce((s,x,k)=>s+x*inverse[k][j],0))));
  const constants=held.map((point,t)=>
    mod(point.z-weights[t].reduce((s,x,j)=>s+x*anchor[j].z,0)));
  return {d,anchor,held,inverse,weights,constants};
}
/**
 * Exactly cover all secret seeds/offset/initial plain for a frozen alpha.
 * @param {number[]} cipher
 * @param {number[][]} rows
 * @param {number} alpha
 */
function recover(cipher,rows,alpha) {
  const m=eliminate(cipher,rows,alpha);
  const candidates=3**m.d;
  const solutions=[];
  let maxConsecutiveMatches=0;
  for(let mask=0;mask<candidates;mask++) {
    let number=mask;
    const plain=Array(m.d);
    for(let j=0;j<m.d;j++) {
      plain[j]=AIO[number%3];
      number=Math.floor(number/3);
    }
    let matches=m.d;
    for(let t=0;t<m.held.length;t++) {
      const p=mod(m.constants[t]+dot(m.weights[t],plain));
      if(!AIO.includes(p))break;
      matches++;
    }
    maxConsecutiveMatches=Math.max(maxConsecutiveMatches,matches);
    if(matches!==18)continue;
    const v=plain.map((p,j)=>mod(p-m.anchor[j].z));
    const theta=m.inverse.map(row=>dot(row,v));
    solutions.push({mask,theta});
  }
  return {alpha,candidates,maxConsecutiveMatches,solutions};
}
/**
 * @param {number[]} cipher
 * @param {number[][]} rows
 * @param {number} alpha
 * @param {number[]} theta
 */
function decrypt(cipher,rows,alpha,theta) {
  const seed=theta.slice(0,9);
  const beta=theta[9];
  const gamma=alpha===0?0:theta[10];
  let prev=alpha===0?0:mod(gamma*inverseScalar(alpha));
  return cipher.map((c,i)=>{
    const p=mod(c-alpha*prev-dot(rows[i],seed)-beta);
    prev=p;
    return p;
  });
}
/**
 * @param {number[]} plain
 * @param {number[][]} rows
 * @param {number} alpha
 * @param {number[]} seed
 * @param {number} beta
 * @param {number} previousPlain
 */
function encrypt(plain,rows,alpha,seed,beta,previousPlain) {
  let prev=previousPlain;
  return plain.map((p,i)=>{
    const c=mod(p+alpha*prev+dot(rows[i],seed)+beta);
    prev=p;
    return c;
  });
}
/** @param {number[]} a */
function ioc(a) {
  const h=Array(29).fill(0);
  a.forEach(v=>h[v]++);
  return h.reduce((s,v)=>s+v*(v-1),0)/(a.length*(a.length-1));
}
const native=corpus.pages.find(p=>p.page===57).indices;
assert.equal(native.length,95);
const plantedSeed=[4,1,7,2,9,5,11,3,6];
let total=0;
for(const [direction,factor] of [
  ['forward',nonic],['reciprocal',reciprocal]
]) {
  const rows=keyRows(factor,C.length);
  const positive=Array.from({length:C.length},(_,i)=>native[i%native.length]);
  singles.forEach((at,i)=>{positive[at]=AIO[i%3];});
  const planted=encrypt(positive,rows,13,plantedSeed,24,7);
  const plantedResults=recover(planted,rows,13);
  const plantedKey=[...plantedSeed,24,mod(13*7)];
  const found=plantedResults.solutions.filter(s=>
    s.theta.length===11 && s.theta.every((v,i)=>v===plantedKey[i]));
  assert.ok(found.length===1,'actual planted hidden state must be recovered');
  assert.deepEqual(decrypt(planted,rows,13,found[0].theta),positive);
  assert.deepEqual(encrypt(decrypt(planted,rows,13,found[0].theta),
    rows,13,plantedSeed,24,7),planted);

  let candidates=0;
  const originalSolutions=[];
  for(let alpha=0;alpha<29;alpha++) {
    const checked=recover(C,rows,alpha);
    candidates+=checked.candidates;
    for(const s of checked.solutions)
      originalSolutions.push({alpha,theta:s.theta});
  }
  assert.equal(candidates,5019165);
  const expected=direction==='forward'?0:1;
  assert.equal(originalSolutions.length,expected);
  if(direction==='reciprocal') {
    const s=originalSolutions[0];
    assert.equal(s.alpha,20);
    assert.deepEqual(s.theta,[9,12,7,15,2,9,10,0,1,18,24]);
    const p=decrypt(C,rows,s.alpha,s.theta);
    assert.equal(p.length,1894);
    assert.ok(Math.abs(ioc(p)-0.03450214791224938)<1e-12);
    assert.deepEqual(singles.map(i=>p[i]).every(x=>AIO.includes(x)),true);
    assert.deepEqual(encrypt(p,rows,20,s.theta.slice(0,9),18,7),C);
    console.log('Original singleton-only survivor: alpha=20, beta=18,',
      'initial nine-state key [9,12,7,15,2,9,10,0,1], prior P=7.');
    console.log('Survivor all-body GP29 IoC',ioc(p).toFixed(11),
      'versus unmodified body',ioc(C).toFixed(11),'; no native GP prose.');
    console.log('Original survivor first 50 rune transliterations:',
      p.slice(0,50).map(x=>corpus.translit[x]).join('.'));
  }
  total+=candidates;
  console.log(direction, 'complete-source exhaustive plain-feedback trial:',
    candidates, 'alpha-conditioned secret candidates,',
    originalSolutions.length, 'complete singleton-compatible keys');
  console.log(direction, 'positive: original-shape solved-p57 native GP',
    positive.length+'/'+positive.length, 'recovered from authentic hidden state');
}
assert.equal(total,10038330);
console.log('No authenticated original unknown text or author-selected key recovered.');
