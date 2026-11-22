'use strict';

/**
 * Original pp55–57 76+180 ring alignment vs the 32x8 numeric grid.
 * SFT: node sims/lp2_terminal256_rowaffine_source_gate_sft.cjs
 *
 * Negative is all-key, all 8 source-corner/direction traversals:
 * every stationary affine 8x8 GF(29) row map grid-row -> terminal plaintext
 * is inconsistent on original independently solved p56/p57 symbols.
 *
 * Positive plant builds a synthetic 32x8 input using an invertible circulant
 * affine row map with 8 unknown taps and a shared bias. It keeps all 180
 * independently solved p56/p57 native-GP symbols at their original positions
 * and plants 76 LP1 native-GP runes. The 180 known characters alone recover
 * the entire transform and the 76 planted unknowns exactly.
 *
 * Original print-table base60 byte interpretation and ring association are
 * hypotheses, not creator-authenticated instructions.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const printed=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-grid-256.json'),'utf8'));
assert.equal(printed.bytes.length,256);
const grid=printed.bytes.map(x=>x%29);
const tokens=corpus.translit.map((token,index)=>({token,index})).sort((a,b)=>b.token.length-a.token.length);
const mod=n=>((n%29)+29)%29;

/** @param {string} s */
function gp(s){
  const txt=s.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out=[];
  for(const word of txt.match(/[A-Z]+/g)||[]){
    for(let i=0;i<word.length;){
      const token=tokens.find(t=>word.startsWith(t.token,i));
      assert(token,'Unknown GP token: '+word.slice(i));
      out.push(token.index);
      i+=token.token.length;
    }
  }
  return out;
}
const c56=corpus.pages.find(p=>p.page===56).indices;
const p56=gp('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE');
const p57=corpus.pages.find(p=>p.page===57).indices;
assert.equal(c56.length,85);
assert.equal(p56.length,85);
assert.equal(p57.length,95);
const primes=[];
for(let n=2;primes.length<90;n++){
  let prime=true;
  for(let k=2;k*k<=n;k++)if(n%k===0){prime=false;break;}
  if(prime)primes.push(n);
}
let keyPos=0;
const originalDecryption=c56.map((c,i)=>{
  if(i===56){assert.equal(c,0);return 0;}
  return mod(c-(primes[keyPos++]-1));
});
assert.deepEqual(originalDecryption,p56,'Actual p56 phi(prime) regression');
const solved=p56.concat(p57),TOTAL=256;
assert.equal(solved.length,180);

/** @param {number} layer */
function clockwise(layer){
  const top=layer,bottom=31-layer,left=layer,right=7-layer;
  const out=[];
  for(let col=left;col<=right;col++)out.push(8*top+col);
  for(let row=top+1;row<=bottom;row++)out.push(8*row+right);
  for(let col=right-1;col>=left;col--)out.push(8*bottom+col);
  for(let row=bottom-1;row>top;row--)out.push(8*row+left);
  return out;
}

/** @param {number} corner @param {'cw'|'ccw'} direction */
function order(corner,direction){
  const out=[];
  for(let layer=0;layer<4;layer++){
    const ring=clockwise(layer);
    const choices=[
      8*layer+layer,
      8*layer+(7-layer),
      8*(31-layer)+(7-layer),
      8*(31-layer)+layer
    ];
    const at=ring.indexOf(choices[corner]);
    assert(at>=0);
    const step=direction==='cw'?1:-1;
    for(let j=0;j<ring.length;j++)
      out.push(ring[modIndex(at+step*j,ring.length)]);
  }
  assert.equal(out.length,TOTAL);
  assert.equal(new Set(out).size,TOTAL);
  return out;
}
const modIndex=(n,m)=>((n%m)+m)%m;

/**
 * Exact modular RREF. Width is the number of independent coefficients.
 * An inconsistent equation has all-zero coefficient part and a nonzero RHS.
 * @param {number[][]} equations Rows of width+1 finite-field values.
 * @param {number} width
 */
function solve(equations,width){
  assert(equations.length>0);
  const A=equations.map(row=>{
    assert.equal(row.length,width+1);
    return row.map(mod);
  });
  const pivots=[];
  let rr=0;
  for(let cc=0;cc<width&&rr<A.length;cc++){
    let pivot=rr;
    while(pivot<A.length&&A[pivot][cc]===0)pivot++;
    if(pivot===A.length)continue;
    [A[rr],A[pivot]]=[A[pivot],A[rr]];
    let inverse=1;
    while(mod(A[rr][cc]*inverse)!==1)inverse++;
    for(let j=cc;j<=width;j++)A[rr][j]=mod(A[rr][j]*inverse);
    for(let row=0;row<A.length;row++){
      if(row===rr||A[row][cc]===0)continue;
      const factor=A[row][cc];
      for(let j=cc;j<=width;j++)
        A[row][j]=mod(A[row][j]-factor*A[rr][j]);
    }
    pivots.push(cc);
    rr++;
  }
  const bad=A.findIndex(row=>row.slice(0,width).every(x=>x===0)&&row[width]!==0);
  const coeff=Array(width).fill(0);
  for(let i=0;i<pivots.length;i++)coeff[pivots[i]]=A[i][width];
  return {rank:pivots.length,augmentedRank:pivots.length+(bad<0?0:1),
    consistent:bad<0,coeff};
}

/** @param {number[]} perm Source ring permutation */
function knownAt(perm){
  const vals=new Map();
  for(let i=0;i<solved.length;i++)
    vals.set(perm[i+76],solved[i]);
  assert.equal(vals.size,180);
  return vals;
}

/** @param {number[]} x 256 table residues @param {Map<number,number>} known @param {number} col */
function columnEquations(x,known,col){
  return Array.from({length:30},(_,i)=>{
    const row=i+1;
    return [...x.slice(8*row,8*row+8),1,known.get(8*row+col)];
  });
}
const summary=[];
for(let corner=0;corner<4;corner++)
for(const direction of ['cw','ccw']){
  const perm=order(corner,direction);
  const known=knownAt(perm);
  const perColumn=[];
  for(let col=1;col<=6;col++){
    const equations=columnEquations(grid,known,col);
    const full=solve(equations,9),short=solve(equations.slice(0,11),9);
    assert.equal(full.rank,9);
    assert.equal(full.augmentedRank,10);
    assert.equal(short.augmentedRank,10);
    perColumn.push({column:col,rank:full.rank,augmentedRank:full.augmentedRank});
  }
  summary.push({corner:['TL','TR','BR','BL'][corner],direction,perColumn});
}
assert.equal(summary.length,8);

// Positive control: one invertible 8x8 circulant row transformation.
// p56/p57 are exact authentic plaintext in the plant, not invented text.
// GP-native p55 is an LP1 solved A WARNING passage.
const native55=gp('BELIEVE NOTHING FROM THIS BOOK EXCEPT WHAT YOU KNOW TO BE TRUE TEST THE KNOWLEDGE FIND YOUR TRUTH EXPERIENCE YOUR DEATH DO NOT EDIT OR CHANGE THIS BOOK OR THE MESSAGE CONTAINED WITHIN').slice(0,76);
assert.equal(native55.length,76);
const expected=native55.concat(solved),perm=order(0,'cw');
const target=Array(TOTAL).fill(0);
for(let i=0;i<TOTAL;i++)target[perm[i]]=expected[i];
const taps=[1,2,0,0,0,0,0,0],bias=4;
/** @param {number[]} input */
function encodeRow(input){
  return Array.from({length:8},(_,col)=>mod(bias+
    taps.reduce((total,t,k)=>total+t*input[modIndex(col-k,8)],0)));
}
/** @param {number[]} desired */
function invertRow(desired){
  const rows=Array.from({length:8},(_,col)=>{
    const weights=Array.from({length:8},(_,key)=>taps[modIndex(col-key,8)]);
    return [...weights,mod(desired[col]-bias)];
  });
  const found=solve(rows,8);
  assert.equal(found.rank,8);
  assert(found.consistent);
  assert.deepEqual(encodeRow(found.coeff),desired);
  return found.coeff;
}
const planted=[];
for(let row=0;row<32;row++){
  const output=target.slice(8*row,8*row+8);
  planted.push(...invertRow(output));
}
assert.equal(planted.length,TOTAL);
const control=knownAt(perm);
const equations=[];
for(const [cell,value] of control){
  const row=Math.floor(cell/8),col=cell%8;
  const features=Array.from({length:8},(_,k)=>planted[8*row+modIndex(col-k,8)]);
  equations.push([...features,1,value]);
}
const recoveredKey=solve(equations,9);
assert.equal(recoveredKey.rank,9);
assert(recoveredKey.consistent);
assert.deepEqual(recoveredKey.coeff,[...taps,bias]);
const predicted=Array(TOTAL).fill(0);
for(let row=0;row<32;row++){
  for(let col=0;col<8;col++){
    let value=recoveredKey.coeff[8];
    for(let k=0;k<8;k++)
      value+=recoveredKey.coeff[k]*planted[8*row+modIndex(col-k,8)];
    predicted[row*8+col]=mod(value);
  }
}
assert.deepEqual(predicted,target);
const recoveredPlain=perm.map(cell=>predicted[cell]);
assert.deepEqual(recoveredPlain,expected);
assert.deepEqual(recoveredPlain.slice(76),solved);
const wrongTaps=[2,1,0,0,0,0,0,0];
const wrong=planted.map((_,id)=>{
  const row=Math.floor(id/8),col=id%8;
  return mod(bias+wrongTaps.reduce((s,t,k)=>s+t*planted[8*row+modIndex(col-k,8)],0));
});
const wrongMatches=wrong.filter((v,i)=>v===target[i]).length;
assert(wrongMatches<30);

console.log(JSON.stringify({
  result:'PASS: all-key original terminal grid row-affine test',
  originalCipherRunes:{p55:76,p56:85,p57:95},
  originalP56ExactPrimeTotient:85,
  originalObservedKnown:180,
  keyFamily:'arbitrary stationary 8x8 affine GF29 matrix + 8 independent biases, source grid row -> terminal rune row',
  orientations:summary.length,
  rejectedInnerColumns:summary.reduce((n,x)=>n+x.perColumn.length,0),
  minimumCertificate:'first 11 middle physical grid rows already give rank9 / augmented rank10 for all 48 tests',
  orientationSummary:summary.map(x=>({
    start:x.corner,direction:x.direction,
    rank:x.perColumn.map(y=>y.rank),
    augmented:x.perColumn.map(y=>y.augmentedRank)
  })),
  positivePlant:{
    keyTaps:recoveredKey.coeff,
    recoveredUnknownRunes:recoveredPlain.slice(0,76).length,
    exactMatchedFullSourceShape:recoveredPlain.length,
    wrongKernelMatches:wrongMatches
  },
  decryptsOriginalP55:false
},null,2));
