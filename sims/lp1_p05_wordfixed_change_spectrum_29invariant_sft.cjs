"use strict";
/**
 * The thirteen ORIGINAL LP1 p05 GP-prime-summed rune-word cells, together
 * with the source-visible 180-degree magic-square structure, force the
 * complete B1033 GF29 characteristic polynomial and ALL EVEN matrix powers.
 * Every one of the 29 possible free numeral residues has the same operator.
 * Read-only Windows 11 Node22 CommonJS SFT, built-in modules only.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const prime=new Map(gp.runes.map((r,i)=>[r,gp.prime[i]]));
assert.equal(prime.size,29);
assert.equal(gp.prime[0],2);
assert.equal(gp.prime[28],109);
const src=read("resources/transcriptions/lp1_wulfic_canonical.txt");
const anchor="272-138-";
assert.equal(src.indexOf(anchor),src.lastIndexOf(anchor));
const cells=src.slice(src.indexOf(anchor)).split(/\r?\n/).slice(0,5)
  .map(line=>line.replace(/\/$/,"").split("-"));
assert.deepEqual(cells.map(r=>r.length),[5,5,5,5,5]);
const mask=cells.map(row=>row.map(x=>/^\d+$/.test(x)?"0":"1").join(""));
assert.deepEqual(mask,["00100","11110","01101","01111","00100"]);
const countWord=mask.join("").split("1").length-1;
assert.equal(countWord,13);
const hist=read("resources/cicada2014-openpuff-magic-squares.txt")
  .trim().split(/\r?\n\s*\r?\n/).map(section=>
    section.trim().split(/\r?\n/).map(row=>row.trim().split(/\s+/).map(Number)));
assert.deepEqual(hist.map(s=>s.length),[5,7,5]);
const original=hist[2];
const S=original[0].reduce((a,b)=>a+b,0);
assert.equal(S,1033);
/** Literal GP rune-word cells from the physical source, with no key search. */
function val(r,c) {
  const text=cells[r][c];
  assert.ok(!/^\d+$/.test(text),"expected original rune word");
  let sum=0;
  for(const ch of text){
    assert.ok(prime.has(ch),"non-original GP rune");
    sum+=prime.get(ch);
  }
  return sum;
}
const wordValues=cells.map((row,r)=>row.map((cell,c)=>
  /^\d+$/.test(cell)?null:val(r,c)));
const sourceNums=cells.map((row,r)=>row.map((cell,c)=>
  /^\d+$/.test(cell)?Number(cell):wordValues[r][c]));
assert.deepEqual(sourceNums,original);
const a=(S-val(1,1)-val(2,2)-val(3,3))/2;
const d=(S-val(1,3)-val(2,2)-val(3,1))/2;
assert.ok(Number.isInteger(a)&&Number.isInteger(d));
const edge=S-(val(1,0)+val(1,1)+val(1,2)+val(1,3));
const twins=S-a-d-val(0,2);
assert.equal(val(0,2),val(4,2));
for(let j=0;j<4;j++)assert.equal(val(1,j),val(3,4-j));
assert.equal(a,272);
assert.equal(d,151);
assert.equal(edge,18);
assert.equal(twins,269);
/** Every source-consistent square from the ONE free printed numeral t. */
function make(t) {
  return [
    [a,t,val(0,2),twins-t,d],
    [val(1,0),val(1,1),val(1,2),val(1,3),edge],
    [val(2,4),val(2,1),val(2,2),val(2,1),val(2,4)],
    [edge,val(3,1),val(3,2),val(3,3),val(3,4)],
    [d,twins-t,val(4,2),t,a]
  ];
}
const originalT=Number(cells[0][1]);
assert.equal(originalT,138);
assert.equal(twins-originalT,131);
assert.deepEqual(make(originalT),original);
const n=5, p=29,mod=x=>(x%p+p)%p;
const I=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>Number(i===j)));
const J=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>Number(j===4-i)));
const U=Array.from({length:n},()=>Array(n).fill(1));
function multiply(A,B,reduced=false) {
  return A.map(row=>Array.from({length:B[0].length},(_,j)=>{
    const v=row.reduce((s,x,k)=>s+x*B[k][j],0);
    return reduced?mod(v):v;
  }));
}
function powmod(X,e) {
  let out=I,base=X.map(row=>row.map(mod));
  while(e){if(e%2)out=multiply(out,base,true);base=multiply(base,base,true);e=Math.floor(e/2);}
  return out;
}
const reduced=X=>X.map(row=>row.map(mod));
const mkOperator=(i,j,u)=>I.map((row,r)=>row.map((x,c)=>mod(i*x+j*J[r][c]+u*U[r][c])));
function checkMagic(X) {
  assert.deepEqual(X.map(r=>r.length),[5,5,5,5,5]);
  for(const r of X)assert.equal(r.reduce((a,b)=>a+b,0),S);
  for(let c=0;c<5;c++)assert.equal(X.reduce((a,r)=>a+r[c],0),S);
  assert.equal(X.reduce((a,r,i)=>a+r[i],0),S);
  assert.equal(X.reduce((a,r,i)=>a+r[4-i],0),S);
  for(let i=0;i<5;i++)for(let j=0;j<5;j++)assert.equal(X[i][j],X[4-i][4-j]);
  for(let i=0;i<5;i++)for(let j=0;j<5;j++)
    if(wordValues[i][j]!==null)assert.equal(X[i][j],wordValues[i][j]);
}
function charpoly29(X) {
  let curr=I,out=[1];
  for(let k=1;k<=n;k++) {
    const product=multiply(reduced(X),curr,true);
    const tr=product.reduce((s,row,i)=>s+row[i],0);
    const inv=Array.from({length:28},(_,i)=>i+1).find(v=>mod(v*k)===1);
    assert.ok(inv);
    const coeff=mod(-tr*inv);
    out.push(coeff);
    curr=product.map((row,i)=>row.map((x,j)=>mod(x+(i===j?coeff:0))));
  }
  return out;
}
const actualSquare=reduced(multiply(original,original));
assert.deepEqual(actualSquare,mkOperator(1,5,23));
const actualChar=charpoly29(original);
assert.deepEqual(actualChar,[1,11,27,7,5,26]);
const all=[];
for(let offset=0;offset<29;offset++){
  const t=originalT+offset,X=make(t);
  checkMagic(X);
  assert.ok(X.flat().every(v=>v>0));
  assert.deepEqual(reduced(multiply(X,X)),actualSquare);
  assert.deepEqual(powmod(X,14),J.map(row=>row.map(v=>mod(-v))));
  assert.deepEqual(charpoly29(X),actualChar);
  all.push(t);
}
const B0=make(originalT), B1=make(originalT+1);
const sq0=multiply(B0,B0),sq1=multiply(B1,B1);
const slope=sq1.map((row,i)=>row.map((value,j)=>value-sq0[i][j]));
assert.deepEqual(slope,I.map((row,i)=>row.map((x,j)=>348*(x-J[i][j]))));
assert.equal(348,12*29);
// B(t) differs as an original integer matrix, yet even powers are
// identical mod29 for every t residue under original word constraints.
assert.notDeepEqual(B0,B1);
assert.deepEqual(reduced(B1),reduced(make(originalT+1)));
console.log(JSON.stringify({
  source:"Original solved LP1 p05 13 rune words + 2014 independent B1033",
  wordMask:mask,wordValues:wordValues.flat().filter(x=>x!==null),
  sourceT:originalT,familyMinT:all[0],familyMaxT:all.at(-1),
  freeTwinSum:twins,frozenSourceRows:make(originalT),
  exactIntegerSquareDelta:"348*(I-J) per unit t = 12*29*(I-J)",
  frozenGF29Square:"I+5J+23U",
  frozenGF29Characteristic:[1,11,27,7,5,26],
  allPositiveMagicSquaresChecked:all.length,
  originalUnknownLP2PlaintextRecovered:false
},null,2));
console.log("PASS: thirteen original rune words force CHANGE spectrum independent of remaining numeral t");
