'use strict';
/**
 * Original 255-scroll-word / 255-adjacent-rune / 76-perimeter book-code receiver.
 * An independently supplied next page contains exactly 255 GP29 runes.
 * Original p49–p51 32x8 perimeter's 76 bytes may index those 255 runes
 * (zero-based) and mix them with the 76 terminal p55 ciphertext runes.
 * The original solved p56 running-prime-totient decoder supplies a distinct
 * frozen second-stage rival.
 *
 * Single-file read-only test: node sims/lp2_scroll255_p8_p50rim_p55_bookcode_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'),'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'base60-grid.json'),'utf8'));
const trans = fs.readFileSync(path.join(root, 'lp2-transcription.txt'),'utf8');
const charMap = new Map(corpus.runes.map((symbol, i) => [symbol,i]));
const text = trans.split('%').slice(3,8).join('').replace(/[\n\/&$]/g,'');
const words = text.split(/[-.]/).map(part =>
  [...part].filter(ch=>charMap.has(ch)).map(ch=>charMap.get(ch))
).filter(w=>w.length>0);
assert.equal(words.length,255);
assert.equal(words.flat().length,1145);
assert.deepEqual(words.flat(),corpus.pages.slice(3,8).flatMap(p=>p.indices));
const p8=corpus.pages[8].indices;
const p55=corpus.pages[55].indices;
const p56=corpus.pages[56].indices;
const p57=corpus.pages[57].indices;
assert.deepEqual([p8.length,p55.length,p56.length,p57.length],[255,76,85,95]);
assert.deepEqual(grid.page_row_counts,[10,13,9]);
const rows=grid.byte_rows;
assert(rows.length===32&&rows.every(row=>row.length===8));
const rim=[
  ...rows[0],...rows.slice(1).map(row=>row[7]),
  ...rows[31].slice(0,7).reverse(),
  ...rows.slice(1,31).reverse().map(row=>row[0])
];
assert.equal(rim.length,76);
assert.equal(Math.max(...rim),254);
assert.deepEqual(rim.flatMap((x,i)=>x===0?[i]:[]),[52]);
assert.equal(new Set(rim).size,68);

/** @param {number} x @returns {number} */
const mod=(x)=>((x%29)+29)%29;
/** @param {number[]} symbols @returns {number} */
function ioc(symbols){
  const bins=new Int16Array(29);
  for(const value of symbols)bins[value]++;
  let numerator=0;for(const n of bins)numerator+=n*(n-1);
  return numerator/(symbols.length*(symbols.length-1));
}
/** @param {number[]} source @returns {string} */
const render=(source)=>source.map(v=>corpus.translit[v]).join('');
/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out=[];
  for(let n=2;out.length<count;n++){
    let prime=true;
    for(let divisor=2;divisor*divisor<=n;divisor++){
      if(n%divisor===0){prime=false;break;}
    }
    if(prime)out.push(n);
  }
  return out;
}
const primes=firstPrimes(90);
/** A literal input GP rune zero is the transparent F surrogate from original p56.
 * @param {number[]} source @returns {{plain:number[],used:number,skips:number[]}}
 */
function phiTransparent(source){
  let cursor=0;const skips=[];
  const plain=source.map((v,i)=>{
    if(v===0){skips.push(i);return 0;}
    return mod(v-(primes[cursor++]-1));
  });
  return {plain,used:cursor,skips};
}
// Authentic positive control, including p56's original F interruption.
const known=phiTransparent(p56);
assert.deepEqual(known.skips,[56]);
assert.equal(known.used,84);
assert.equal(render(known.plain),
  'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');
/** @param {number[]} key @param {-1|1} sign @returns {number[]} */
const mix=(key,sign)=>p55.map((value,i)=>mod(value+sign*key[rim[i]]));
const p8Down=mix(p8,-1),p8Up=mix(p8,1);
assert.equal(ioc(p8Down),0.045263157894736845);
assert.equal(ioc(p8Up),0.04035087719298246);
const twiceDown=phiTransparent(p8Down),twiceUp=phiTransparent(p8Up);
assert.equal(ioc(twiceDown.plain),0.047719298245614036);
assert.equal(ioc(twiceUp.plain),0.036491228070175435);
// A source-native planted ciphertext must actually recover its known text,
// with transparent F positions. Prevent accidental ciphertext-F collisions.
const plantedPlain=[];
const firstStage=[];
let primeCursor=0;
for(let i=0;i<76;i++){
  if(i===19||i===43){plantedPlain.push(0);firstStage.push(0);continue;}
  const shift=primes[primeCursor++]-1;
  let value=1+(7*i+5)%28;
  while(mod(value+shift)===0)value=value%28+1;
  plantedPlain.push(value);
  firstStage.push(mod(value+shift));
}
const plantedCipher=firstStage.map((v,i)=>mod(v+p8[rim[i]]));
const plantedInner=plantedCipher.map((v,i)=>mod(v-p8[rim[i]]));
assert.deepEqual(plantedInner,firstStage);
assert.deepEqual(phiTransparent(plantedInner).plain,plantedPlain);
// More direct historical book-code receiver: ring index chooses a scroll word;
// each original p55 rune as 0-based character index would need to fit the word.
const outOfRange=p55.flatMap((selector,i)=>selector>=words[rim[i]].length?[i]:[]);
assert.equal(outOfRange.length,64);
// Alternative literal one-rune/word-count summaries, limited to two GP signs.
const summaries={
 'first-rune':rim.map(v=>words[v][0]),
 'last-rune':rim.map(v=>words[v].at(-1)),
 'rune-count':rim.map(v=>words[v].length),
 'sum-mod29':rim.map(v=>words[v].reduce((sum,x)=>sum+x,0)%29),
 'product-mod29':rim.map(v=>words[v].reduce((v,x)=>v*x%29,1))
};
const summaryScores=Object.entries(summaries).flatMap(([name,key])=>
 [-1,1].map(sign=>({name,sign,ioc:ioc(p55.map((v,i)=>mod(v+sign*key[i])))})));
assert.equal(Math.max(...summaryScores.map(r=>r.ioc)),0.04035087719298246);
// Familywise original-data control: 12,702 intact 255-symbol windows from
// the actual unknown ciphertext, scored with the same 76 rim addresses.
const all=corpus.pages.slice(0,56).flatMap(p=>p.indices);
assert.equal(all.length,12956);
const p8Absolute=corpus.pages.slice(0,8).reduce((sum,p)=>sum+p.indices.length,0);
assert.equal(p8Absolute,1874);
assert.deepEqual(all.slice(p8Absolute,p8Absolute+255),p8);
let counted=0,exceedDown=0,exceedUp=0;
for(let start=0;start+255<=all.length;start++){
  const binsDown=new Int16Array(29),binsUp=new Int16Array(29);
  for(let i=0;i<76;i++){
    const key=all[start+rim[i]];
    binsDown[mod(p55[i]-key)]++;
    binsUp[mod(p55[i]+key)]++;
  }
  let down=0,up=0;
  for(let j=0;j<29;j++){down+=binsDown[j]*(binsDown[j]-1);up+=binsUp[j]*(binsUp[j]-1);}
  if(down/(76*75)>=ioc(p8Down))exceedDown++;
  if(up/(76*75)>=ioc(p8Up))exceedUp++;
  counted++;
}
assert.deepEqual([counted,exceedDown,exceedUp],[12702,95,896]);
console.log(JSON.stringify({
 sources:'original p3-p7 255 complete scroll words; adjacent p8 255 runes; p49-p51 table 256 byte-like cells; p55 76 runes; solved p56',
 observedLengths:{scrollWords:words.length,p8:p8.length,table:rows.flat().length,outerRing:rim.length,p55:p55.length},
 perimeter:{zeroBasedValid:true,firstZeroPositionOneBased:53,largest:Math.max(...rim),distinctAddresses:new Set(rim).size},
 directIndexedBookCode:{invalidCharacterOffsetsOutOf76:outOfRange.length,sourceWordAdditiveControls:summaryScores},
 directRimPage8:{minus:{ioc:ioc(p8Down),preview:render(p8Down)},plus:{ioc:ioc(p8Up),preview:render(p8Up)}},
 solvedPrimeSecondLayer:{minus:{ioc:ioc(twiceDown.plain),skips:twiceDown.skips,preview:render(twiceDown.plain)},plus:{ioc:ioc(twiceUp.plain),skips:twiceUp.skips,preview:render(twiceUp.plain)}},
 original255WindowControls:{total:counted,downExceedances:exceedDown,plusExceedances:exceedUp,downEmpiricalFraction:exceedDown/counted},
 positiveControls:{p56RecoveredRunes:85,plantedTwoLayerRecoveredRunes:76},
 verdict:'No intelligible native GP29 plaintext or authenticated terminal key. The direct page8 index stream remains a conditional source-shaped intermediate.'
},null,2));
console.log('PASS complete original source-pinned p8/book-code/perimeter/p55 two-layer gate');
