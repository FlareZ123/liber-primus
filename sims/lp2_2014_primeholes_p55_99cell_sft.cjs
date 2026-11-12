'use strict';
/**
 * Source-exact 2014 magic squares as a lossless 99-cell p55/dot mask.
 * Keep all 25 cells of the 3301-sum square, including central prime 809.
 * In the following two 1033-sum squares, reserve precisely their prime
 * entries as holes (17+6 = 23). Place 76 p55 runes in remaining cells.
 * This is a structural original-source hypothesis, not an LP2 decryption.
 *
 * Two bounded followups: raw square-value and phi(value) mod29 additive keys,
 * each across exactly 76 original runes. No phase/sign/order fitting.
 *
 * Run: node sims/lp2_2014_primeholes_p55_99cell_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
/** @param {string} name @returns {string} */
function read(name){return fs.readFileSync(path.join(root,name),'utf8');}
const db=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript=read('resources/liber-primus/lp2-transcription.txt');
const squares=read('resources/cicada2014-openpuff-magic-squares.txt').trim()
  .split(/\r?\n\s*\r?\n/).map(t=>t.trim().split(/\r?\n/)
    .map(row=>row.trim().split(/\s+/).map(Number)));
const original=db.pages.find(p=>p.page===55).indices;
const originalWords=transcript.split('%')[54].replace(/\/\s*/g,'')
  .match(/[\u16A0-\u16FF]+/gu)||[];
assert.deepEqual(squares.map(s=>s.length),[5,7,5]);
assert.deepEqual(squares.map(s=>s[0].reduce((a,b)=>a+b,0)),[3301,1033,1033]);
assert(squares.every(s=>s.every(row=>row.length===s.length)));
assert.deepEqual(originalWords.map(w=>[...w].length),
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.deepEqual(originalWords.flatMap(w=>[...w].map(r=>db.runes.indexOf(r))),original);
assert.equal(original.length,76);
/** @param {number} n @returns {boolean} */
function prime(n){if(n<2)return false;for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true;}
/** @param {number} n @returns {number} */
function phi(n){
  let remaining=n,answer=n;
  for(let d=2;d*d<=remaining;d++)if(remaining%d===0){
    while(remaining%d===0)remaining/=d;
    answer-=answer/d;
  }
  if(remaining>1)answer-=answer/remaining;
  return Math.round(answer);
}
const cells=squares.flatMap((s,square)=>
  s.flatMap((row,r)=>row.map((value,c)=>({
    square,r,c,value,prime:prime(value),
    hole:square>0&&prime(value)
  }))));
const primesBySquare=squares.map((_,i)=>cells.filter(cell=>cell.square===i&&cell.prime).length);
const holes=cells.filter(cell=>cell.hole),filled=cells.filter(cell=>!cell.hole);
assert.deepEqual(primesBySquare,[1,17,6]);
assert.deepEqual(holes.map(h=>h.square).reduce((a,v)=>(a[v-1]++,a),[0,0]),[17,6]);
assert.equal(holes.length,23);
assert.equal(filled.length,76);
assert.equal(cells.length,99);
assert.deepEqual(filled.slice(0,25).map(c=>c.square),Array(25).fill(0));
assert.equal(filled.find(c=>c.square===0&&c.r===2&&c.c===2).value,809);
assert.deepEqual([filled.filter(c=>c.square===0).length,
  filled.filter(c=>c.square===1).length,
  filled.filter(c=>c.square===2).length],[25,32,19]);
// Exact lossless transport without assigning rune symbols to the printed dots.
const mapped=cells.map(cell=>cell.hole?null:original.shift());
assert.equal(original.length,0);
const reconstructed=mapped.filter(x=>x!==null);
const ciphertext=db.pages.find(p=>p.page===55).indices;
assert.deepEqual(reconstructed,ciphertext);
/** @param {number[]} stream @param {(n:number)=>number} f @returns {number[]} */
function decode(stream,f){
  return stream.map((c,i)=>(c-f(filled[i].value)%29+29)%29);
}
/** @param {number[]} stream @param {(n:number)=>number} f @returns {number[]} */
function encode(stream,f){
  return stream.map((p,i)=>(p+f(filled[i].value)%29)%29);
}
const raw=decode(ciphertext,n=>n),totient=decode(ciphertext,phi);
assert.deepEqual(encode(raw,n=>n),ciphertext);
assert.deepEqual(encode(totient,phi),ciphertext);
// Long genuine GP-native planted plaintext for the exact source-selected
// 76-cell mask. Encrypt, decode and re-encrypt in the same original geometry.
const native=read('resources/control/shakespeare_first300k.txt');
const token=db.translit.map((name,i)=>({name,i}))
  .sort((a,b)=>b.name.length-a.name.length);
/** @param {string} data @returns {number[]} */
function gp(data){
  const out=[];
  const words=data.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S').match(/[A-Z]+/g)||[];
  for(const w of words)for(let j=0;j<w.length;){
    const t=token.find(x=>w.startsWith(x.name,j));
    assert(t,'Unmapped native source '+w.slice(j));out.push(t.i);j+=t.name.length;
  }
  return out;
}
const plant=gp(native).slice(1000,1076);
assert.equal(plant.length,76);
for(const f of [n=>n,phi]){
  const encrypted=encode(plant,f);
  assert.deepEqual(decode(encrypted,f),plant);
  assert.deepEqual(encode(decode(encrypted,f),f),encrypted);
}
const gibran=gp(read('resources/control/gibran_prophet_58585.txt'));
const shakespeare=gp(native);
const emerson=gp(read('resources/control/emerson_essays_2944.txt'));
assert.deepEqual([gibran.length,shakespeare.length,emerson.length],
  [63114,218800,324630]);
const tri=new Map(),bi=new Map();
for(let i=2;i<gibran.length;i++){
  const t=gibran.slice(i-2,i+1).join(',');
  const b=gibran.slice(i-2,i).join(',');
  tri.set(t,(tri.get(t)||0)+1);bi.set(b,(bi.get(b)||0)+1);
}
/** @param {number[]} a @returns {number} */
function score(a){
  let sum=0;
  for(let i=2;i<a.length;i++){
    const t=a.slice(i-2,i+1).join(','),b=a.slice(i-2,i).join(',');
    sum+=Math.log(((tri.get(t)||0)+.05)/((bi.get(b)||0)+29*.05));
  }
  return sum/(a.length-2);
}
/** @param {number[]} a @returns {number[]} */
function controlScores(a){
  return Array.from({length:150},(_,i)=>{
    const j=Math.floor(i*(a.length-76)/149);
    return score(a.slice(j,j+76));
  });
}
const controls=controlScores(shakespeare).concat(controlScores(emerson)).sort((a,b)=>a-b);
const rawScore=score(raw),totientScore=score(totient),cipherScore=score(ciphertext);
assert(rawScore<controls[0]&&totientScore<controls[0]&&cipherScore<controls[0]);
/** @param {number[]} seq @returns {string} */
function tokensAsPrintedWords(seq){
  let index=0;
  return originalWords.map(w=>{
    const n=[...w].length;
    const v=seq.slice(index,index+n);index+=n;
    return v.map(x=>db.translit[x]).join(' ');
  }).join(' | ');
}
if(require.main===module)console.log(JSON.stringify({
  status:'PASS',classification:'source-frozen 99-cell layout candidate; two direct key consumers negative',
  originalSquares:[5,7,5],
  squareRowSums:[3301,1033,1033],
  primeEntriesPerSquare:primesBySquare,
  rule:'3301 square all25 + composite cells of both 1033 squares; prime cells of latter become 23 blank positions',
  filledBySquare:[25,32,19],holesBySquare:[0,17,6],
  fixedHoleCells:holes.map(c=>({square:c.square+1,row:c.r+1,col:c.c+1,sourceValue:c.value})),
  p55ExactSourceRunePlacement:reconstructed.length,
  original76ExactReencryption:true,
  native76CipherPlant:true,
  independentNativeScoreRange:{
    samples:controls.length,min:controls[0],median:controls[150],max:controls.at(-1)},
  gibranTrigramMeanLogScores:{cipher:cipherScore,rawShift:rawScore,phiShift:totientScore},
  decodedOriginal:{
    rawShift:tokensAsPrintedWords(raw),
    phiShift:tokensAsPrintedWords(totient)
  },
  missing:'No creator-selected prime-hole placement or key/inverse instruction; no plaintext recovered'
},null,2));
module.exports={prime,phi,decode,encode};
