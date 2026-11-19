"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const signed=fs.readFileSync(path.join(root,"resources/historical/cicada2016-4gq25-outguess.asc"),"utf8");

/** @param {number} value */
function mod(value){return ((value%29)+29)%29;}
/** @param {number} x @param {number} y */
function H(x,y){return[mod(x-y),mod(x+y)];}
/** @param {number[]} values */
function shell(values){
 const out=[];
 for(let left=0,right=values.length-1;left<right;left++,right--)out.push(...H(values[left],values[right]));
 if(values.length%2)out.push(values[(values.length-1)/2]);
 return out;
}

const match=signed.match(/7A35090F/u);
assert.ok(match);
const keyId=match[0];
const nibbles=[...keyId].map(ch=>parseInt(ch,16));
assert.deepEqual(nibbles,[7,10,3,5,0,9,0,15]);
const hShell=shell(nibbles);
assert.deepEqual(hShell,[21,22,10,10,23,12,5,5]);

// Frozen source-derived state. It is independently reconstructed from the
// authenticated signed-word positions and therefore is not fitted here.
const state={p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3,q:4};
const fields=Object.entries(state);

// Bounded issue grammar:
// complexity0: direct state fields and visibly supplied key-ID constants;
// complexity1: state +/-1;
// complexity2: pairwise state +, -, * modulo29.
const expressions=[];
for(const [name,value] of fields)expressions.push({name,value,complexity:0,kind:"field"});
for(const value of [0,1,28,7,10,3,5,9,15]){
 expressions.push({name:"const("+value+")",value,complexity:0,kind:"constant"});
}
for(const [name,value] of fields){
 expressions.push({name:name+"+1",value:mod(value+1),complexity:1,kind:"offset"});
 expressions.push({name:name+"-1",value:mod(value-1),complexity:1,kind:"offset"});
}
for(let i=0;i<fields.length;i++){
 const [leftName,leftValue]=fields[i];
 for(let j=0;j<fields.length;j++){
  const [rightName,rightValue]=fields[j];
  if(i<j){
   expressions.push({name:leftName+"+"+rightName,value:mod(leftValue+rightValue),complexity:2,kind:"pair"});
   expressions.push({name:leftName+"*"+rightName,value:mod(leftValue*rightValue),complexity:2,kind:"pair"});
  }
  if(i!==j){
   expressions.push({name:leftName+"-"+rightName,value:mod(leftValue-rightValue),complexity:2,kind:"pair"});
  }
 }
}
assert.equal(expressions.length,180);

const byValue=new Map();
for(const expression of expressions){
 if(!byValue.has(expression.value))byValue.set(expression.value,[]);
 byValue.get(expression.value).push(expression);
}

const uniqueShellValues=[21,22,10,23,12,5];
const counts=uniqueShellValues.map(value=>({
 value,
 expressions:byValue.get(value),
 count:byValue.get(value).length,
 minComplexity:Math.min(...byValue.get(value).map(x=>x.complexity)),
}));
for(const row of counts){
 row.minimal=row.expressions.filter(x=>x.complexity===row.minComplexity);
 row.minimalCount=row.minimal.length;
}
assert.deepEqual(counts.map(x=>[x.value,x.count,x.minComplexity,x.minimalCount]),[
 [21,4,2,4],
 [22,4,1,1],
 [10,7,0,1],
 [23,4,0,1],
 [12,6,2,6],
 [5,8,0,2],
]);

const multiply=values=>values.reduce((a,b)=>a*b,1);
const completeTemplates=multiply(counts.map(x=>x.count));
const minimumComplexityTemplates=multiply(counts.map(x=>x.minimalCount));
assert.equal(completeTemplates,21504);
assert.equal(minimumComplexityTemplates,48);

const published=[
 ["p-K",21],["p-1",22],["K*g",10],["p",23],["K*a",12],["g",5],
];
for(const [name,value] of published){
 assert.ok((byValue.get(value)||[]).some(x=>x.name===name));
}

// The published K*g choice at shell value10 loses to the literal key-ID
// constant under coordinate-wise minimum complexity, showing that complexity
// alone cannot source-select the intended-looking state label.
const ten=counts.find(x=>x.value===10);
assert.deepEqual(ten.minimal.map(x=>x.name),["const(10)"]);
assert.ok(ten.expressions.some(x=>x.name==="K*g"));

// No ciphertext holdout is opened because the issue requires a complete
// source-visible ordered template first, and at least 48 equally minimal
// templates survive the declared grammar.
console.log(JSON.stringify({
 status:"PASS",
 classification:
  "Director #1786 negative template-selection gate. The authentic 7A35090F H shell is fixed, but the bounded state-expression grammar admits 21,504 complete ordered symbolic templates over its six distinct values. Restricting every coordinate to minimum grammar complexity still leaves 48 templates, and the published K*g label at shell value10 is not minimum-complexity because literal key-ID constant10 is available. No source-visible rule selects one complete ordered template, so the receiver holdout remains sealed.",
 keyId,nibbles,hShell,
 grammar:{expressions:expressions.length,fields:Object.keys(state),completeTemplates,minimumComplexityTemplates},
 counts:counts.map(x=>({
  value:x.value,count:x.count,minComplexity:x.minComplexity,minimalCount:x.minimalCount,
  minimal:x.minimal.map(y=>y.name),
  expressions:x.expressions.map(y=>y.name),
 })),
 publishedTemplate:published.map(([name,value])=>({name,value})),
 holdout:"SEALED: no unique complete source-visible template",
},null,2));
