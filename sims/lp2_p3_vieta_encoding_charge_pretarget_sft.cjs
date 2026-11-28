'use strict';
// Director #3418 — p3 GF(29²) Vieta encoding charge before p33 target inspection.
// This PRETARGET producer reads only the already-published p3 field and the
// upstream p54→p40 chapter descriptor route. It NEVER imports p33 runes.
const assert=require('node:assert/strict');
const mod=x=>((x%29)+29)%29;
const inv2=15; // 2*15 = 1 mod29
const p3Marker=[13,23,2]; // printed red triad: 13+23*u+2*u²=0
const pair54=[19,27],pair40=[27,3]; // (SUM,PRODUCT), source-fixed route order
// 13+23u+2u²=0, normalized u²=3u+8.
const field={uSquare:[8,3],frobeniusU:[3,28]};
const eq=(x,y)=>x[0]===y[0]&&x[1]===y[1];
const plus=(x,y)=>[mod(x[0]+y[0]),mod(x[1]+y[1])];
const minus=(x,y)=>[mod(x[0]-y[0]),mod(x[1]-y[1])];
const mul=(x,y)=>[mod(x[0]*y[0]+8*x[1]*y[1]),mod(x[0]*y[1]+x[1]*y[0]+3*x[1]*y[1])];
const base=x=>[mod(x),0];
const format=x=>x.join(',');
const roots=(S,P,sumSign,productSign)=>{
 const out=[];
 for(let a=0;a<29;a++)for(let b=0;b<29;b++){
  const x=[a,b],value=plus(minus(mul(x,x),mul(base(sumSign*S),x)),base(productSign*P));
  if(eq(value,[0,0]))out.push(x);
 }
 assert.equal(out.length,2,'quadratic must split with distinct roots in GF29 squared');
 return out.sort((u,v)=>u[0]-v[0]||u[1]-v[1]);
};
assert.deepEqual(field.uSquare,[8,3]);
assert.deepEqual(plus(plus(base(13),mul(base(23),[0,1])),mul(base(2),mul([0,1],[0,1]))),[0,0]);
assert.deepEqual(mul(field.frobeniusU,field.frobeniusU),plus(mul(base(3),field.frobeniusU),base(8)));
const result=[];
for(const swap of [false,true])for(const sumSign of [1,-1])for(const productSign of [1,-1]){
 const [S54,P54]=swap?pair54.slice().reverse():pair54;
 const [S40,P40]=swap?pair40.slice().reverse():pair40;
 const D54=mod(S54*S54-4*productSign*P54);
 const D40=mod(S40*S40-4*productSign*P40);
 const r54=roots(S54,P54,sumSign,productSign);
 const r40=roots(S40,P40,sumSign,productSign);
 const equalDiscriminant=D54===D40;
 let shift=null,predictionRaw=null,translationReplays=false,conjugateInvariant=false;
 if(equalDiscriminant){
   shift=mod(sumSign*(S40-S54)*inv2);
   const moved=r54.map(x=>plus(x,base(shift))).sort((u,v)=>u[0]-v[0]||u[1]-v[1]);
   translationReplays=JSON.stringify(moved)===JSON.stringify(r40);
   assert(translationReplays);
   // One more identical shift, using the same source-only encoding convention.
   const Snext=mod(S40+sumSign*2*shift);
   const Pnext=mod(productSign*(productSign*P40+shift*sumSign*S40+shift*shift));
   // Turn back into the *raw* descriptor pair; undo any swap.
   predictionRaw=swap?[Pnext,Snext]:[Snext,Pnext];
   const conjugate=x=>[mod(x[0]+3*x[1]),mod(-x[1])];
   const conjAfter=r54.map(conjugate).map(x=>plus(x,base(shift))).sort((u,v)=>u[0]-v[0]||u[1]-v[1]);
   const afterConj=r40.map(conjugate).sort((u,v)=>u[0]-v[0]||u[1]-v[1]);
   conjugateInvariant=JSON.stringify(conjAfter)===JSON.stringify(afterConj);
   assert(conjugateInvariant);
 }
 result.push({swap,sumSign,productSign,discriminants:[D54,D40],equalDiscriminant,
   sourceStateShift:shift,roots54:r54,roots40:r40,translationReplays,conjugateInvariant,
   nextRawSumProduct:predictionRaw});
}
assert.equal(result.length,8);
const survivor=result.filter(x=>x.equalDiscriminant);
assert.equal(survivor.length,2);
assert.deepEqual(survivor.map(x=>x.sourceStateShift),[4,25]);
assert.deepEqual(survivor.map(x=>x.nextRawSumProduct),[[6,11],[6,11]]);
const report={schema:1,classification:'SOURCE-ONLY PRETARGET FINITE QUADRATIC ENCODING CHARGE; NOT PLAINTEXT',
 p3Marker,p3Field:field,route:{p54:pair54,p40:pair40},variants:result,
 multiplicity:{labeledQuadratics:8,equalDiscriminant:2,quadraticPlusFrobeniusPresentations:16,
  equalDiscriminantPlusFrobenius:4,distinctSurvivorRawPredictions:1},
 result:'Only unswapped, positive-P polynomials allow a pure translation; both sum signs and either p3 conjugate basis survive and predict the identical raw pair. No source-visible operand distinguishes their sign/basis roles.'};
console.log(JSON.stringify(report));
