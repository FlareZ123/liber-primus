'use strict';
/**
 * Original p15 Fibonacci-prime spiral as source-selected global LP2 rune addresses.
 * SFT: node sims/lp2_p15_global_spiral_way_source_sft.cjs
 * All input read from the committed canonical corpus. No external packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));

const square = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820],
];
const spiralCells = [
  [1,1], [1,2], [2,2], [2,1], [2,0], [1,0], [0,0], [0,1],
  [0,2], [0,3], [1,3], [2,3], [3,3], [3,2], [3,1], [3,0],
];
const addresses = spiralCells.map(([row,col]) => square[row][col]);
assert.deepEqual(addresses, [
  3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516
]);

const unknown = corpus.pages.filter(page => page.page >= 0 && page.page <= 55);
const tape = unknown.flatMap(page => page.indices.map((value,local) => ({
  value, page: page.page, local
})));
assert.equal(tape.length, 12956);
const at = index => tape[index];
const gp = values => values.map(v => corpus.translit[v]).join(' ');
const all = addresses.map(i => at(i).value);
const black = all.slice(1);
assert.equal(gp(black), 'W A Y L U M U L H T G AE B U M');
assert.equal(gp(all), 'OE W A Y L U M U L H T G AE B U M');
assert.deepEqual(addresses.slice(1,4).map(i => [at(i).page,at(i).local]),
  [[13,104],[13,102],[13,100]]);

/**
 * Historical GP29 Vigenere relation; signed input controls which direction is
 * decryption. An F-transparency rival mirrors the authenticated LP1 convention.
 * @param {number[]} source
 * @param {number[]} key
 * @param {number} sign
 * @param {boolean} transparentF
 * @returns {number[]}
 */
function transform(source,key,sign,transparentF) {
  let clock=0;
  return source.map(cipher => {
    if(transparentF && cipher === 0) return 0;
    const plain = (cipher + sign*key[clock%key.length] + 29)%29;
    clock++;
    return plain;
  });
}

/**
 * @param {number[]} values
 * @returns {{ioc:number,top5:number}}
 */
function summarize(values) {
  const counts=Array(29).fill(0);
  for(const v of values) counts[v]++;
  const ioc=counts.reduce((sum,count)=>sum+count*(count-1),0)/
    (values.length*(values.length-1));
  const top5=counts.sort((a,b)=>b-a).slice(0,5).reduce((a,b)=>a+b,0);
  return {ioc,top5};
}

const targets = {
  p15_after_red9: corpus.pages[15].indices.slice(9),
  p16_to_p21: corpus.pages.slice(16,22).flatMap(p => p.indices),
  p15_to_p21: corpus.pages.slice(15,22).flatMap(p => p.indices),
};
console.log('original 16 printed spiral addresses:',addresses.join(','));
for(let i=0;i<addresses.length;i++) {
  const pos=at(addresses[i]);
  console.log('spiral',i,'printed',addresses[i],
    'original_global_zero_based',addresses[i],
    'original_page',pos.page,'page_local_zero_based',pos.local,
    'GP',corpus.translit[pos.value]);
}
console.log('16-value source rune read:',gp(all));
console.log('15 non-red source rune read:',gp(black));
const waypoint=black.slice(0,3), tail=black.slice(3);
for(const sign of [-1,1]) {
  console.log('WAY-key on remaining 12, sign',sign,
    gp(transform(tail,waypoint,sign,false)));
}
for(const [keyName,key] of Object.entries({black15:black,red16:all})) {
  for(const [targetName,cipher] of Object.entries(targets)) {
    for(const transparentF of [false,true]) {
      for(const sign of [-1,1]) {
        const result=transform(cipher,key,sign,transparentF);
        assert.deepEqual(transform(result,key,-sign,transparentF)
          .filter((_,i) => !transparentF || cipher[i]!==0),
          cipher.filter((_,i) => !transparentF || cipher[i]!==0));
        const stat=summarize(result);
        console.log(keyName,targetName,'Ftransparent',transparentF,
          'sign',sign,'n',cipher.length,'ioc',stat.ioc.toFixed(9),
          'top5',stat.top5,'first40',gp(result.slice(0,40)));
      }
    }
  }
}
console.log('PASS exact original address and full inverse controls');
