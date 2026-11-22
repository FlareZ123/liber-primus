"use strict";

/**
 * Code-theoretic classification of the source-selected p50 H/G divisibility.
 *
 * This reads the 32x8 source table from base60-grid.json, in printed row-major order,
 * and checks equality with the older flattened lp2-grid-256.json copy. It tests the
 * original 256-byte p50 table modulo 29. It does not assume
 * that the factors define a historical cipher or that a codeword is plaintext.
 * The existing lp2_grid_dual_factor_error_corrector_sft.cjs separately tests
 * the 2014 transcription alternatives and historical 256-byte controls.
 *
 * Run: node sims/lp2_grid_hg_code_structure_sft.cjs
 * Read-only, Node.js 22 CommonJS, no dependencies or network.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");
const root = path.resolve(__dirname, "..");
const json = file => JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
const base60 = json("resources/liber-primus/base60-grid.json");
assert.equal(base60.byte_rows.length,32);
assert(base60.byte_rows.every(row=>row.length===8));
assert.equal(base60.rows.length,32);
assert(base60.rows.every(row=>row.length===8));
const original = base60.byte_rows.flat();
const sourceTokens = base60.rows.flat();
assert.equal(original.length,256);
assert.deepEqual([sourceTokens[45],sourceTokens[50],sourceTokens[246]],["1l","0l","3I"]);
assert.deepEqual([original[45],original[50],original[246]],[107,47,198]);
// The older flattened copy is retained only as an equality check, not as input.
assert.deepEqual(json("resources/liber-primus/lp2-grid-256.json").bytes,original);
const sourceSha256=createHash("sha256").update(Buffer.from(original)).digest("hex");
assert.equal(sourceSha256,
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const mod = n => (n%29+29)%29;
function inverse(n){for(let k=1;k<29;k++)if(mod(n*k)===1)return k;throw Error("zero");}
function polyMulLow(a,b){
  const out=Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)out[i+j]=mod(out[i+j]+a[i]*b[j]);
  return out;
}
function polyRemLow(input,factor){
  const a=input.map(mod),d=factor.length-1,unit=inverse(factor[d]);
  for(let k=a.length-1;k>=d;k--){
    const q=mod(a[k]*unit);
    if(q)for(let j=0;j<=d;j++)a[k-d+j]=mod(a[k-d+j]-q*factor[j]);
  }
  return Array.from({length:d},(_,i)=>mod(a[i]||0));
}
function polyPowLow(base,n,factor){
  let out=[1],a=base.slice();
  while(n>0){
    if(n&1)out=polyRemLow(polyMulLow(out,a),factor);
    a=polyRemLow(polyMulLow(a,a),factor);n=Math.floor(n/2);
  }
  return out;
}
function rankMod(matrix){
  const a=matrix.map(row=>row.map(mod)),m=a.length,n=a[0].length;let rank=0;
  for(let c=0;c<n;c++){
    let pivot=-1;for(let i=rank;i<m;i++)if(a[i][c]){pivot=i;break;}
    if(pivot<0)continue;[a[rank],a[pivot]]=[a[pivot],a[rank]];
    const iv=inverse(a[rank][c]);a[rank]=a[rank].map(v=>mod(v*iv));
    for(let i=0;i<m;i++)if(i!==rank&&a[i][c]){
      const q=a[i][c];for(let j=c;j<n;j++)a[i][j]=mod(a[i][j]-q*a[rank][j]);
    }
    rank++;if(rank===m)break;
  }
  return rank;
}
function detMod(matrix){
  const a=matrix.map(row=>row.map(mod)),n=a.length;let determinant=1;
  for(let c=0;c<n;c++){
    let pivot=-1;for(let i=c;i<n;i++)if(a[i][c]){pivot=i;break;}
    if(pivot<0)return 0;
    if(pivot!==c){[a[c],a[pivot]]=[a[pivot],a[c]];determinant=mod(-determinant);}
    const v=a[c][c];determinant=mod(determinant*v);const iv=inverse(v);
    for(let i=c+1;i<n;i++){
      const q=mod(a[i][c]*iv);for(let j=c;j<n;j++)a[i][j]=mod(a[i][j]-q*a[c][j]);
    }
  }
  return determinant;
}
function solveSquare(matrix,rhs){
  const n=matrix.length,a=matrix.map((row,i)=>[...row.map(mod),mod(rhs[i])]);
  for(let c=0;c<n;c++){
    let pivot=-1;for(let i=c;i<n;i++)if(a[i][c]){pivot=i;break;}
    if(pivot<0)throw Error("singular parity block");
    [a[c],a[pivot]]=[a[pivot],a[c]];const iv=inverse(a[c][c]);a[c]=a[c].map(v=>mod(v*iv));
    for(let i=0;i<n;i++)if(i!==c&&a[i][c]){
      const q=a[i][c];for(let j=c;j<=n;j++)a[i][j]=mod(a[i][j]-q*a[c][j]);
    }
  }
  return a.map(row=>row[n]);
}
function f2mul(a,b){return [mod(a[0]*b[0]+19*a[1]*b[1]),mod(a[0]*b[1]+a[1]*b[0])];}
function f2pow(a,n){let out=[1,0];while(n>0){if(n&1)out=f2mul(out,a);a=f2mul(a,a);n=Math.floor(n/2);}return out;}

// Source-derived ascending-power factors from the existing dual-factor SFT.
const H=[3,26,24];             // 3 + 26X + 24X^2
const G=[27,5,15];             // 27 + 5X + 15X^2
const F=polyMulLow(H,G);       // ascending powers
const Fmonic=F.map(v=>mod(v*inverse(F[4])));
assert.deepEqual(F,[23,21,11,17,12]);
assert.deepEqual(Fmonic,[14,9,13,28,1]);
assert.deepEqual(H.map(v=>mod(v*inverse(H[2]))),[11,18,1]); // X^2 - 11X + 11
assert.deepEqual(G.map(v=>mod(v*inverse(G[2]))),[25,10,1]); // (X+5)^2

// H is irreducible: its monic discriminant is 19, a non-square in GF(29).
const squares=new Set(Array.from({length:29},(_,i)=>mod(i*i)));
const discriminant=mod(18*18-4*11);
assert.equal(discriminant,19);assert(!squares.has(discriminant));
// alpha=(11+s)/2, s^2=19, is a root of H and has exact order 840.
const alpha=[20,15];
const alphaSquared=f2mul(alpha,alpha);
assert.deepEqual([mod(alphaSquared[0]+18*alpha[0]+11),mod(alphaSquared[1]+18*alpha[1])],[0,0]);
assert.deepEqual(f2pow(alpha,840),[1,0]);
for(const q of [2,3,5,7])assert.notDeepEqual(f2pow(alpha,840/q),[1,0]);
// G has a double root beta=24, whose field multiplicative order is 7.
assert.equal(mod(24**7),1);assert.notEqual(24,1);
const Gmonic=[25,10,1];
assert.deepEqual(polyPowLow([0,1],7,Gmonic),[23,16]);
assert.deepEqual(polyPowLow([0,1],29,Gmonic),[24,0]);
assert.deepEqual(polyPowLow([0,1],203,Gmonic),[1,0]);
assert.deepEqual(polyPowLow([0,1],840,Gmonic),[2,6]);

// In GF(29)[X]/(F), X has exact order lcm(840,7*29)=24,360.
assert.deepEqual(polyPowLow([0,1],24360,Fmonic),[1,0,0,0]);
for(const q of [2,3,5,7,29])assert.notDeepEqual(polyPowLow([0,1],24360/q,Fmonic),[1,0,0,0]);
// At length 256 the remainder is nonconstant, so F cannot divide X^256-lambda
// for any lambda in GF(29): this is not a length-256 cyclic/constacyclic code.
const x256Remainder=polyPowLow([0,1],256,Fmonic);
assert.deepEqual(x256Remainder,[3,13,3,19]);
assert(x256Remainder.slice(1).some(v=>v!==0));

// Original coefficient order is high-degree first; the syndrome columns are
// rem(X^(255-i),F), in basis 1,X,X^2,X^3.
const residues=original.map(mod);
assert.equal(residues[0],0); // 203 = 7*29: fixed-width leading zero residue.
assert.notEqual(residues[1],0);
const A_low=residues.slice().reverse();
assert.deepEqual(polyRemLow(A_low,Fmonic),[0,0,0,0]);
const columns=Array.from({length:256},(_,i)=>{
  const r=polyPowLow([0,1],255-i,Fmonic);return [...r,0,0,0].slice(0,4);
});
const parityMatrix=Array.from({length:4},(_,r)=>columns.map(c=>c[r]));
assert.equal(rankMod(parityMatrix),4);

// Many systematic parity blocks are equally valid; the source does not mark
// any four cells. Every four consecutive positions form a basis (253 choices).
const paritySetChecks=[
  {name:"first-four",positions:[0,1,2,3],determinant:1},
  {name:"last-four",positions:[252,253,254,255],determinant:1},
  {name:"four-corners",positions:[0,7,248,255],determinant:4},
  {name:"two-ends",positions:[0,1,254,255],determinant:13},
  {name:"another-consecutive-block",positions:[8,9,10,11],determinant:24}
];
for(const item of paritySetChecks){
  const matrix=parityMatrix.map(row=>item.positions.map(i=>row[i]));
  assert.equal(detMod(matrix),item.determinant);
}
let consecutiveFourPositionSets=0;
for(let start=0;start<=252;start++)
  if(detMod(parityMatrix.map(row=>row.slice(start,start+4)))!==0)consecutiveFourPositionSets++;
assert.equal(consecutiveFourPositionSets,253);
const rhs=Array.from({length:4},(_,r)=>mod(-residues.slice(0,252).reduce((sum,v,i)=>sum+parityMatrix[r][i]*v,0)));
const suffixSolution=solveSquare(parityMatrix.map(row=>row.slice(252,256)),rhs);
assert.deepEqual(suffixSolution,[6,7,15,22]);
assert.deepEqual(suffixSolution,residues.slice(252));

// The parity-check matrix has 7,168 unique nonzero single-residue syndromes.
// A three-term kernel witness proves d<=3, hence the code is [256,252,3]_29.
const singleResidueSyndromes=new Set();
for(let i=0;i<256;i++)for(let delta=1;delta<29;delta++)
  singleResidueSyndromes.add(columns[i].map(v=>mod(v*delta)).join(","));
assert.equal(singleResidueSyndromes.size,256*28);
const weightThree=Array(26).fill(0);weightThree[0]=1;weightThree[20]=25;weightThree[25]=22;
assert.deepEqual(polyRemLow(weightThree,Fmonic),[0,0,0,0]);

// Wrong source-native readings do not divide the original table.
// Inputs below are low-to-high coefficient arrays.
const wrongFactors={
  reversedH:polyRemLow(A_low,[24,26,3]),
  reversedG:polyRemLow(A_low,[15,5,27]),
  p3RedTriad:polyRemLow(A_low,[13,23,2]),
  BASE29_1033_as_high_to_low:polyRemLow(A_low,[18,6,1]),
  BASE29_1033_reversed:polyRemLow(A_low,[1,6,18])
};
for(const r of Object.values(wrongFactors))assert(r.some(v=>v!==0));
assert.deepEqual(wrongFactors,{
  reversedH:[6,1],reversedG:[22,19],p3RedTriad:[18,26],
  BASE29_1033_as_high_to_low:[11,3],BASE29_1033_reversed:[3,24]
});

console.log(JSON.stringify({
  source:{file:"resources/liber-primus/base60-grid.json",shape:"32x8",sha256:sourceSha256,caseGlyphs:[{index:45,token:"1l",byte:107},{index:50,token:"0l",byte:47},{index:246,token:"3I",byte:198}],flattenedCopyMatches:true},
  factors:{H,G,F,Fmonic},
  fieldStructure:{HDiscriminant:discriminant,HRootOrder:840,GDoubleRoot:24,
    GComponentOrder:203,orderOfXModuloF:24360},
  length256Remainder:x256Remainder,
  code:{field:"GF(29)",length:256,dimension:252,minimumDistance:3,
    parityCheckRank:4,singleResidueSyndromes:singleResidueSyndromes.size,
    byteScope:"residues only; adding 29 to a byte is invisible"},
  systematic:{validConsecutiveFourPositionSets:consecutiveFourPositionSets,
    exampleDeterminants:paritySetChecks,lastFourResidues:suffixSolution,
    sourceSelectedParityPositions:false},
  wrongFactorRemainders:wrongFactors,
  sourceSelectedMessageFrame:false,
  plaintextOrKeyRecovered:false
},null,2));
