'use strict';
/**
 * Original p0–2 27×27 outer-ring, red13 / seven-by-thirteen consumer.
 * Human-visible clue: first 13 of 104 clockwise outer-ring runes are
 * the actual red p0 heading; the remaining 91 permit seven 13-rune rows.
 * Tests historical columnar and additive GP29 operations, with exact
 * p57-native planted forward/inverse controls. Windows Node.js 22, CJS.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const gp = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
assert.deepEqual(gp.pages.slice(0,3).map(p=>p.indices.length),[262,266,201]);
const source = gp.pages.slice(0,3).flatMap(p=>p.indices);
assert.equal(source.length,729);
const heading = source.slice(0,13);
assert.deepEqual(heading,[15,8,18,3,6,19,27,0,15,26,18,21,5]);
const coords=[];
for(let x=0;x<27;x++) coords.push(x);
for(let y=1;y<27;y++) coords.push(y*27+26);
for(let x=25;x>=0;x--) coords.push(26*27+x);
for(let y=25;y>=1;y--) coords.push(y*27);
assert.equal(coords.length,104);
assert.equal(new Set(coords).size,104);
const ring=coords.map(i=>source[i]);
assert.deepEqual(ring.slice(0,13),heading);
const target=ring.slice(13);
assert.equal(target.length,91);
const known=gp.pages[57].indices.slice(0,91);
assert.equal(known.length,91);
/** @param {number[]} a @returns {number} */
function ioc(a){
  const counts=Array(29).fill(0);
  for(const x of a){assert(Number.isInteger(x)&&x>=0&&x<29);counts[x]++;}
  return counts.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} a @param {number[]} cols @param {string} mode */
function permute(a,cols,mode){
  const out=Array(91);let n=0;
  for(const col of cols)for(let row=0;row<7;row++){
    if(mode==='read')out[n++]=a[13*row+col];
    else out[13*row+col]=a[n++];
  }
  assert.equal(n,91);return out;
}
/** @param {number[]} a @param {number[]} key @param {number} sign */
function shift(a,key,sign){
  return a.map((x,i)=>(x+sign*key[i%13]+290)%29);
}
const asc=[...heading.keys()].sort((a,b)=>heading[a]-heading[b]||a-b);
const desc=asc.slice().reverse();
const keys={
  runeIndex:heading,
  gpPrime:heading.map(i=>gp.prime[i]%29),
  gpTotient:heading.map(i=>(gp.prime[i]-1)%29)
};
const results=[];
for(const [orderName,order] of [['ascending',asc],['descending',desc]]){
  for(const mode of ['read','fill'])for(const [keyName,key] of Object.entries(keys)){
    const inverse=mode==='read'?'fill':'read';
    for(const sign of [-1,1])for(const stage of ['permuteFirst','shiftFirst']){
      const decode=c=>stage==='permuteFirst'
        ?shift(permute(c,order,mode),key,sign)
        :permute(shift(c,key,sign),order,mode);
      const encode=p=>stage==='permuteFirst'
        ?permute(shift(p,key,-sign),order,inverse)
        :shift(permute(p,order,inverse),key,-sign);
      assert.deepEqual(decode(encode(known)),known);
      const result=decode(target);
      assert.deepEqual(encode(result),target);
      results.push({orderName,mode,keyName,sign,stage,
        ioc:ioc(result),prefix:result.slice(0,24).map(i=>gp.translit[i]).join(' ')});
    }
  }
}
assert.equal(results.length,48);
results.sort((a,b)=>b.ioc-a.ioc);
assert(Math.abs(results[0].ioc-0.04053724053724054)<1e-12);
assert(Math.abs(ioc(known)-0.06031746031746032)<1e-12);
console.log(JSON.stringify({
  originalChapterRunes:729,outerRing:104,heading:13,postHeading:91,
  sourceIoc:ioc(target),tested:results.length,best:results[0],
  solvedP57First91Ioc:ioc(known),knownExactNativeInverse:48,
  recoveredUnknownPlaintext:false,
  scope:'Only the fixed title-keyed 13-column and additive outer-ring consumer'
},null,2));
