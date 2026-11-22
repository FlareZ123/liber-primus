'use strict';
/**
 * Can the solved P56 prime-totient key recover an unknown 60-digit table
 * dictionary that independently predicts the P55 76-cell outer rim?
 *
 * Give each base60 numeral digit an arbitrary secret GP29 value. Compare
 * exact 84 source-confirmed key values against all one-digit and two-digit
 * linear dictionaries. Both source-visible table interior walks and both
 * natural transparent-F table clock treatments are tested.
 *
 * Keyless GF29 linear feasibility, rank and source-directed positive plants.
 * No ciphertext fit, language fit, phase search or free ciphertext mutation.
 * CJS Node22, no packages, Windows 11 compatible, read-only.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const grid=load('resources/liber-primus/lp2-grid-256.json');
const corpus=load('resources/liber-primus/lp2-corpus.json');
const mod=x=>((x%29)+29)%29;
assert.equal(crypto.createHash('sha256').update(Buffer.from(grid.bytes)).digest('hex'),
'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const tokens=grid.pages.flatMap(p=>p.tokens);
assert.equal(tokens.length,256);
const table=tokens.map(token=>{
 const h=grid.alphabet.indexOf(token[0]),l=grid.alphabet.indexOf(token[1]);
 assert.ok(h>=0&&l>=0&&h<=4&&l<=59);
 return [h,l];
});
function ring(depth){
 const out=[],top=depth,bottom=31-depth,left=depth,right=7-depth;
 for(let c=left;c<=right;c++)out.push(top*8+c);
 for(let r=top+1;r<=bottom;r++)out.push(r*8+right);
 for(let c=right-1;c>=left;c--)out.push(bottom*8+c);
 for(let r=bottom-1;r>top;r--)out.push(r*8+left);
 return out;
}
const row=[];
for(let i=1;i<31;i++)for(let j=1;j<7;j++)row.push(8*i+j);
const shell=[1,2,3].flatMap(ring);
assert.deepEqual([ring(0).length,row.length,shell.length],[76,180,180]);
function totientSteps(n){
 const out=[];
 for(let p=2;out.length<n;p++){
  let prime=true;
  for(let d=2;d*d<=p;d++)if(p%d===0){prime=false;break;}
  if(prime)out.push(mod(p-1));
 }
 return out;
}
const known=totientSteps(84);
const p56=corpus.pages[56].indices;
assert.equal(p56.length,85);
assert.equal(p56[56],0);
const p55=corpus.pages[55].indices;
assert.equal(p55.length,76);
/** @typedef {{name:string,variables:number, terms:(h:number,l:number)=>Array<[number,number]>}} Model */
/** @type {Model[]} */
const models=[
 {name:'one-unknown-per-low-digit',variables:60,terms:(h,l)=>[[l,1]]},
 {name:'one-unknown-per-high-digit',variables:5,terms:(h,l)=>[[h,1]]},
 {name:'same-60-entry-dictionary-sum',variables:60,
   terms:(h,l)=>[[h,1],[l,1]]},
 {name:'same-60-entry-dictionary-difference',variables:60,
   terms:(h,l)=>[[h,1],[l,-1]]},
 {name:'separate-high5-low60-dictionaries',variables:65,
   terms:(h,l)=>[[h,1],[5+l,1]]}
];
function inverse(x){
 for(let k=1;k<29;k++)if(mod(k*x)===1)return k;
 throw Error('zero noninvertible pivot');
}
/**
 * @param {number[][]} equations augmented matrix, each length variables+1
 * @param {number} variables
 * @returns {{rank:number,consistent:boolean,firstContradiction:number,
 * solution:number[],pivotCols:number[]}}
 */
function eliminate(equations,variables){
 const M=equations.map(row=>row.slice());
 const pivots=[];let r=0;
 for(let col=0;col<variables&&r<M.length;col++){
  let p=r;
  while(p<M.length&&M[p][col]===0)p++;
  if(p===M.length)continue;
  [M[r],M[p]]=[M[p],M[r]];
  const scale=inverse(M[r][col]);
  for(let k=col;k<=variables;k++)M[r][k]=mod(M[r][k]*scale);
  for(let i=0;i<M.length;i++){
   if(i===r||M[i][col]===0)continue;
   const f=M[i][col];
   for(let k=col;k<=variables;k++)M[i][k]=mod(M[i][k]-f*M[r][k]);
  }
  pivots.push(col);r++;
 }
 const conflict=M.findIndex(row=>row[variables]!==0&&row.slice(0,variables).every(x=>x===0));
 const solution=Array(variables).fill(0);
 for(let i=0;i<r;i++)solution[pivots[i]]=M[i][variables];
 return {rank:r,consistent:conflict<0,firstContradiction:conflict,
   solution,pivotCols:pivots};
}
/** @param {Model} model @param {Array<[number,number]>} pairs @param {number[]} y */
function solve(model,pairs,y){
 const A=pairs.map(([h,l],i)=>{
  const r=Array(model.variables+1).fill(0);
  for(const [col,coef] of model.terms(h,l))r[col]=mod(r[col]+coef);
  r[model.variables]=y[i];
  return r;
 });
 return eliminate(A,model.variables);
}
/** @param {Model} model @param {[number,number]} pair @param {number[]} secret */
function evalModel(model,pair,secret){
 return mod(model.terms(...pair).reduce((v,[i,c])=>v+c*secret[i],0));
}
const output=[];
for(const [walk,positions] of Object.entries({row,shell})){
 for(const clock of ['transparent-f-keeps-table-cell','transparent-f-skips-table-cell']){
  const indices=[];
  for(let rune=0,k=0;rune<85;rune++){
   if(rune===56)continue;
   indices.push(positions[clock==='transparent-f-keeps-table-cell'?rune:k++]);
  }
  assert.equal(indices.length,84);
  const pairs=indices.map(i=>table[i]);
  for(const model of models){
   const fit=solve(model,pairs,known);
   const synthSecret=Array.from({length:model.variables},
     (_,i)=>mod(7+3*i+5*i*i));
   const target=pairs.map(pair=>evalModel(model,pair,synthSecret));
   const positive=solve(model,pairs,target);
   assert.ok(positive.consistent,'synthetic positive must be consistent');
   assert.ok(pairs.every((pair,i)=>evalModel(model,pair,positive.solution)===target[i]),
     'synthetic recovered observed steps must match exact native source');
   let provenRimCount=0;
   if(fit.consistent){
    // A rim symbol is fixed if its linear row is in the observed equation row span:
    // Append the rim row as a zero-output homogeneous equation. It raises rank
    // only when that row is genuinely unconstrained by solved-p56 observations.
    const template=pairs.map(pair=>{
     const rr=Array(model.variables+1).fill(0);
     for(const [id,coeff] of model.terms(...pair))rr[id]=mod(rr[id]+coeff);
     return rr;
    });
    for(const index of ring(0)){
     const rr=Array(model.variables+1).fill(0);
     for(const [id,coeff] of model.terms(...table[index]))rr[id]=mod(rr[id]+coeff);
     if(eliminate(template.concat([rr]),model.variables).rank===fit.rank)provenRimCount++;
    }
   }
   output.push({walk,clock,model:model.name,equations:84,
     unknownValues:model.variables,rank:fit.rank,freeValues:model.variables-fit.rank,
     consistent:fit.consistent,contradictoryEquationRow:fit.firstContradiction,
     rimSymbolsKeyPredictable:provenRimCount,positivePlant:true});
  }
 }
}
assert.equal(output.length,20);
console.log(JSON.stringify({
 source:{gridTokens:256,knownP56UnmaskedPrimeTotientKeySteps:84,
   p55Rim:76, sourceP56TransparentFOffset:56},
 results:output,consistentCount:output.filter(o=>o.consistent).length,
 decision:output.some(o=>o.consistent&&o.rimSymbolsKeyPredictable>=70)?
  'Strong candidate for source-selected P55 rim key; inspect exact original recovered plaintext':
  'No exact 84-key-step 60-digit table dictionary uniquely predicts the P55 rim',
 caution:'Pure keyless linear GF29 feasibility. Absence of a consistent linear digit dictionary cannot reject nonlinear or key-private uses of p50. Consistent equations alone would require a direct original p55 plaintext.'
},null,2));
