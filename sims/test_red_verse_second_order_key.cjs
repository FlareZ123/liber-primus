'use strict';

/**
 * Planted positive for LP2 p53 second-order affine-key inversion.
 * Tests all 55 ways to corrupt two of the 11 fixed anchor rune positions.
 */
const assert = require('node:assert/strict');
const {source,dictionary,infer,keyStream} = require('./red_verse_second_order_key.cjs');
const mod = n => (n%29+29)%29;
const src=source(),dict=dictionary();
assert.equal(src.cipher.length,51);
assert.ok(dict.anchors.length>1200);
const coefficients={a:7,b:4,c:3};
const full=new Int8Array(51);
full[0]=9;
full[1]=11;
for(let i=2;i<full.length;i++)
  full[i]=mod(coefficients.a*full[i-1]+coefficients.b*full[i-2]+coefficients.c);
const actual=Array.from(full.slice(13,24));
const anchor=dict.anchors.find(w=>w.values.length===11);
assert.ok(anchor);
const encrypted=anchor.values.map((p,i)=>mod(p+actual[i]));
const rerun=encrypted.map((c,i)=>mod(c-anchor.values[i]));
assert.deepEqual(rerun,actual);
let tests=0, recovered=0, totalHits=0;
const verify = (errors) => {
  let found=false;
  infer(errors, hit=>{
    totalHits++;
    if(hit.a===coefficients.a&&hit.b===coefficients.b&&hit.c===coefficients.c&&
      hit.keys.every((k,i)=>k===actual[i])) {
      found=true;
      const reconstructed=keyStream(hit,13,51);
      assert.deepEqual(Array.from(reconstructed),Array.from(full));
    }
  });
  tests++;
  if(found)recovered++;
  assert.ok(found,'True key not recovered in corruption pattern '+JSON.stringify(errors));
};
verify(actual);
for(let i=0;i<11;i++) {
  const one=actual.slice();
  one[i]=mod(one[i]+1);
  verify(one);
}
for(let i=0;i<11;i++)for(let j=i+1;j<11;j++) {
  const two=actual.slice();
  two[i]=mod(two[i]+1);
  two[j]=mod(two[j]+2);
  verify(two);
}
assert.equal(tests,67);
assert.equal(recovered,tests);
console.log(JSON.stringify({
  control:'Known affine second-order key, exact GP dictionary anchor, exhaustive two-symbol corruption coverage',
  key:{...coefficients,initial:[9,11]},
  anchor:anchor.english,anchorRunes:11,
  alterations:'Each pair of 11 anchor positions, plus every single and zero edit',
  cases:tests,recovered,totalHits
},null,2));
