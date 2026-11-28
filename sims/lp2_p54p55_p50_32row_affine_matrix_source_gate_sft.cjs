#!/usr/bin/env node
'use strict';
/* Source-exact p54->p55 32x7 against p49->p51 32x8, registered at native row0.
 * Key-independent all-affine GF29 rank gate and finite historical 7x7 Hill+table.
 * No fitted plaintext, source-key search, row shifts, padding or unknown-rune edits.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const source=read('resources/cicada2014-openpuff-magic-squares.txt')
 .trim().split(/\r?\n\s*\r?\n/).map(s=>s.trim().split(/\r?\n/).map(t=>t.trim().split(/\s+/).map(Number)));
const P=29,mod=x=>(x%P+P)%P,orig=n=>gp.pages.find(p=>p.page===n).indices;
const P54=orig(54),P55=orig(55),P57=orig(57);
assert.deepEqual([P54.length,P55.length,P57.length],[232,76,95]);
const C=P54.slice(9).concat(P55[0]);
assert.equal(C.length,224);
const rows=Array.from({length:32},(_,i)=>C.slice(i*7,i*7+7));
assert.equal(rows.length,32);
const tokens=grid.pages.flatMap(p=>p.tokens);
assert.equal(tokens.length,256);
const gridRows=Array.from({length:32},(_,i)=>tokens.slice(i*8,i*8+8));
function rank(A){
 const a=A.map(r=>r.map(mod)),r=a.length,c=a[0].length;
 let pivotRow=0;
 for(let col=0;col<c&&pivotRow<r;col++){
  let p=pivotRow;while(p<r&&a[p][col]===0)p++;
  if(p===r)continue;
  [a[p],a[pivotRow]]=[a[pivotRow],a[p]];
  const inv=Array.from({length:28},(_,k)=>k+1)
   .find(k=>mod(k*a[pivotRow][col])===1);
  a[pivotRow]=a[pivotRow].map(v=>mod(v*inv));
  for(let i=pivotRow+1;i<r;i++){
   const f=a[i][col];
   a[i]=a[i].map((v,j)=>mod(v-f*a[pivotRow][j]));
  }
  pivotRow++;
 }
 return pivotRow;
}
function values(representation){
 let alpha=representation==='base59'?grid.alphabet.replace('f',''):grid.alphabet;
 const radix=representation==='base59'?59:60;
 return gridRows.map(r=>r.map(t=>{
  const a=alpha.indexOf(t[0]),b=alpha.indexOf(t[1]);
  assert(a>=0&&b>=0,'valid original grid digit for '+representation);
  if(representation==='first_digit')return a;
  if(representation==='second_digit')return b;
  return a*radix+b;
 }));
}
const rankGates=[];
for(const repr of ['base60','base59','first_digit','second_digit']){
 const x=values(repr);
 for(const affine of [false,true]){
  const X=x.map(r=>affine?[...r,1]:r),r0=rank(X),outputs=[];
  for(let col=0;col<7;col++){
   const augmented=X.map((r,i)=>[...r,rows[i][col]]);
   const r1=rank(augmented);
   outputs.push({col,rank_increase:r1-r0});
  }
  rankGates.push({repr,affine,regressor_rank:r0,
   dependent_columns:outputs.filter(x=>x.rank_increase===0).length,
   output_rank_increases:outputs.map(x=>x.rank_increase)});
 }
}
assert(rankGates.every(r=>r.dependent_columns===0));
const M=source[1].map(row=>row.map(mod));
assert.equal(M.length,7);
function invert(A){
 const n=A.length;
 const aug=A.map((r,i)=>r.concat(Array.from({length:n},(_,j)=>+(i===j))));
 for(let col=0;col<n;col++){
  let r=col;while(r<n&&!aug[r][col])r++;
  assert(r<n);[aug[col],aug[r]]=[aug[r],aug[col]];
  const fac=Array.from({length:28},(_,i)=>i+1)
   .find(i=>mod(i*aug[col][col])===1);
  aug[col]=aug[col].map(x=>mod(x*fac));
  for(let t=0;t<n;t++)if(t!==col){
   const k=aug[t][col];
   aug[t]=aug[t].map((x,i)=>mod(x-k*aug[col][i]));
  }
 }
 return aug.map(r=>r.slice(n));
}
const Mi=invert(M);
function hill(data,matrix,orient){
 const out=[];
 for(let b=0;b<data.length;b+=7)
  for(let i=0;i<7;i++){
   let val=0;
   for(let k=0;k<7;k++)
    val+=data[b+k]*(orient==='row'?matrix[k][i]:matrix[i][k]);
   out.push(mod(val));
  }
 return out;
}
function ioc(x){
 const f=Array(29).fill(0);x.forEach(t=>f[t]++);
 return f.reduce((s,n)=>s+n*(n-1),0)/(x.length*(x.length-1));
}
const bytes=values('base60');
// p40's already fixed p50 cell43 sits in column3; remove exactly that lane
// to get a source-shaped seven-lane transport, without selecting a best lane.
const key=bytes.flatMap(row=>row.filter((_,col)=>col!==3).map(mod));
assert.equal(key.length,224);
const direct=[];
for(const orientation of ['row','column'])
 for(const order of ['subtract_then_hill','hill_then_subtract'])
  for(const sign of [-1,1]){
   let decoded=order==='subtract_then_hill'
    ?hill(C.map((c,i)=>mod(c+sign*key[i])),Mi,orientation)
    :hill(C,Mi,orientation).map((c,i)=>mod(c+sign*key[i]));
   // Exact original reencryption, no fitted plaintext.
   let back=order==='subtract_then_hill'
    ?hill(decoded,M,orientation).map((x,i)=>mod(x-sign*key[i]))
    :hill(decoded.map((x,i)=>mod(x-sign*key[i])),M,orientation);
   assert.deepEqual(back,C);
   // Independent positive control: original known p57 runes carried under
   // this very orientation/key with the same 224-rune page shape.
   const plant=Array.from({length:224},(_,i)=>P57[i%P57.length]);
   let encoded=order==='subtract_then_hill'
    ?hill(plant,M,orientation).map((x,i)=>mod(x-sign*key[i]))
    :hill(plant.map((x,i)=>mod(x-sign*key[i])),M,orientation);
   let rec=order==='subtract_then_hill'
    ?hill(encoded.map((c,i)=>mod(c+sign*key[i])),Mi,orientation)
    :hill(encoded,Mi,orientation).map((c,i)=>mod(c+sign*key[i]));
   assert.deepEqual(rec,plant);
   direct.push({orientation,order,sign,
    ioc:ioc(decoded),first_35:decoded.slice(0,35).map(x=>gp.translit[x]).join(' '),
    last_14:decoded.slice(-14).map(x=>gp.translit[x]).join(' '),
    forward_inverse_original:true,p57_positive_plant:true});
  }
const finiteDiff=[];
for(const representation of ['base59','base60']){
 const rr=values(representation);
 const steps=rr.flatMap(row=>row.slice(1).map((x,j)=>mod(x-row[j])));
 assert.equal(steps.length,224);
 const exact=C.filter((v,i)=>v===steps[i]).length;
 const inverse=C.filter((v,i)=>v===mod(-steps[i])).length;
 finiteDiff.push({representation,forward_exact_of_224:exact,
  reversed_exact_of_224:inverse});
}
console.log(JSON.stringify({
 classification:'exact 32x8 to 32x7 source-registered all-affine negative; no unknown plaintext',
 original_partition:{p54_red:9,p54_black:223,p55_carry:1,p55_tail:75},
 grid_shape:[32,8],target_shape:[32,7],
 all_affine_GF29_rank_gates:rankGates,
 lane3_deleted_source7x7_Hill_consumers:direct,
 p50_eight_to_seven_row_differences:finiteDiff,
 baselines:{source_p54_ioc:ioc(P54),source_p55_ioc:ioc(P55),
  solved_p57_ioc:ioc(P57)}
},null,2));
