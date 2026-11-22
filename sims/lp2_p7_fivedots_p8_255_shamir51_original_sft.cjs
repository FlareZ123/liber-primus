'use strict';
/**
 * An original-source, bounded five-dot Shamir recipient: full p8 255 runes
 * grouped as 51 x 5 blocks or five x 51 lanes, decoded at the p7 black-dot
 * coordinate ranks or five original red-word GP-index products over GF(29).
 * Windows Node.js 22 CJS, self-contained original corpus, read-only.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
const p7=corpus.pages.find(p=>p.page===7).indices;
const p8=corpus.pages.find(p=>p.page===8).indices;
const p57=corpus.pages.find(p=>p.page===57).indices;
assert.deepEqual([p7.length,p8.length,p57.length],[208,255,95]);
assert.deepEqual(p7.slice(194),[23,3,22,16,2,25,5,7,11,14,28,6,28,19]);
const mod=x=>((x%29)+29)%29;
/** @param {number} x @returns {number} */
const inverse=x=>{for(let y=1;y<29;y++)if(mod(x*y)===1)return y;throw Error('GF29 inverse undefined');};
/** @param {number[]} xs @returns {number[]} */
function weights(xs){
  assert.equal(new Set(xs).size,5);
  return xs.map((x,i)=>xs.reduce((v,y,j)=>j===i?v:mod(v*mod(-y)*inverse(mod(x-y))),1));
}
const redWords=[[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]];
const products=redWords.map(w=>mod(w.reduce((v,x)=>v*x,1)));
assert.deepEqual(products,[11,26,8,15,2]);
const coordinates={
  'horizontal-dot-ranks':[1,2,3,4,5],
  'vertical-dot-ranks':[3,5,1,4,2],
  'red-word-products':products,
};
const expectedWeights={
  'horizontal-dot-ranks':[5,19,10,24,1],
  'vertical-dot-ranks':[10,1,5,24,19],
  'red-word-products':[6,14,20,3,16],
};
for(const [name,xs] of Object.entries(coordinates)){
  const w=weights(xs);
  assert.deepEqual(w,expectedWeights[name]);
  for(let degree=0;degree<=4;degree++){
    const actual=mod(w.reduce((s,v,i)=>s+v*Math.pow(xs[i],degree),0));
    assert.equal(actual,degree===0?1:0);
  }
}
/** @param {number[]} tape @param {number[]} w @param {boolean} interleaved @returns {number[]} */
function recover(tape,w,interleaved){
  assert.equal(tape.length,255);
  const out=[];
  for(let j=0;j<51;j++){
    const sample=Array.from({length:5},(_,i)=>tape[interleaved?i*51+j:j*5+i]);
    out.push(mod(sample.reduce((s,y,i)=>s+w[i]*y,0)));
  }
  return out;
}
/** @param {number[]} a @returns {number} */
function ioc(a){
  const counts=Array(29).fill(0);
  for(const x of a)counts[x]++;
  return counts.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1));
}
const expected=[
  ['horizontal-dot-ranks',false,0.03686274509803922],
  ['horizontal-dot-ranks',true,0.03137254901960784],
  ['vertical-dot-ranks',false,0.02823529411764706],
  ['vertical-dot-ranks',true,0.03607843137254902],
  ['red-word-products',false,0.03529411764705882],
  ['red-word-products',true,0.03137254901960784],
];
const clear=p57.slice(0,51);
assert(ioc(clear)>0.05);
for(const [name,interleaved,expectedIoc] of expected){
  const xs=coordinates[name],w=weights(xs);
  const actual=recover(p8,w,interleaved);
  assert(Math.abs(ioc(actual)-expectedIoc)<1e-14);
  // For an unknown synthetic polynomial, the five x-coordinate evaluations
  // must recover the exact original solved-GP constant term at every site.
  const plant=Array(255).fill(0);
  for(let j=0;j<51;j++){
    const coeff=[clear[j],(j+7)%29,(3*j+11)%29,(5*j+13)%29,(7*j+17)%29];
    for(let i=0;i<5;i++){
      let value=0;
      for(let k=4;k>=0;k--)value=mod(value*xs[i]+coeff[k]);
      plant[interleaved?i*51+j:j*5+i]=value;
    }
  }
  assert.deepEqual(recover(plant,w,interleaved),clear);
  const translit=actual.map(x=>corpus.translit[x]).join('');
  console.log(`${name}, ${interleaved?'five contiguous 51-rune lanes':'51 consecutive five-rune blocks'}, IoC=${ioc(actual).toFixed(9)} 51/51 native plant, original=${translit}`);
}
console.log('PASS: six source p7 five-dot/red-word coordinates × p8 complete255 Shamir-to-51 direct recipients; authentic GP-native quartic plants');
