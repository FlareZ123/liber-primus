"use strict";

/**
 * Original table inner180 ↔ authentic clear LP2 p56+p57 (85+95) byte-codebook
 * key-independent test. All 256 input bytes may have unrelated secret maps to
 * GP29. Equal original byte codes nevertheless must emit equal plaintext runes.
 *
 * This is strictly more permissive than an arbitrary fixed 29-entry lookup on
 * byte residues. It tests original row/column order, both directions and the
 * source-supported base59/base60 parses without fitting any unknown ciphertext.
 * The heldout plaintext is recovered only from genuinely solved p56/p57.
 * Windows Node.js 22 standalone reproducible, read-only SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname,"..");
const read = p => fs.readFileSync(path.join(ROOT,p),"utf8");
const table = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
assert.equal(table.rows.length,32);
assert.ok(table.rows.every(r=>r.length===8));

/** @param {number} count @returns {number[]} */
function firstPrimes(count){
  const result=[];
  for(let n=2;result.length<count;n++){
    let prime=true;
    for(let j=2;j*j<=n;j++)if(n%j===0){prime=false;break;}
    if(prime)result.push(n);
  }
  return result;
}
const primes=firstPrimes(90);
const p56=corpus.pages[56].indices;
assert.equal(p56.length,85);
assert.equal(p56[56],0,"one original transparent F at offset 56");
let consumed=0;
const clear56=p56.map((cipher,i)=>{
  if(i===56)return 0;
  const prime=primes[consumed++];
  return ((cipher-(prime-1))%29+29)%29;
});
assert.equal(consumed,84);
assert.equal(corpus.pages[57].indices.length,95);
const CLEAR=clear56.concat(corpus.pages[57].indices);
assert.equal(CLEAR.length,180);
assert.equal(CLEAR.slice(0,10).map(x=>corpus.translit[x]).join(""),"ANENDWITHIN");

/**
 * @param {number[]} flat Grid bytes in printed row-major order.
 * @param {boolean} columns Use printed 30x6 interior column order.
 * @returns {number[]}
 */
function inside(flat,columns){
  const output=[];
  if(columns){
    for(let c=1;c<=6;c++)for(let r=1;r<=30;r++)
      output.push(flat[8*r+c]);
  }else{
    for(let r=1;r<=30;r++)for(let c=1;c<=6;c++)
      output.push(flat[8*r+c]);
  }
  assert.equal(output.length,180);
  return output;
}
/**
 * The exact maximal consistency of any completely secret deterministic
 * 256-byte-to-29-rune lookup, with collisions counted once per byte value.
 * @param {number[]} bytes
 * @param {number[]} clear
 */
function exactCodebook(bytes,clear){
  assert.equal(bytes.length,clear.length);
  /** @type {Map<number,Map<number,number>>} */
  const histogram=new Map();
  const examples=new Map();
  let firstConflict=null;
  for(let i=0;i<bytes.length;i++){
    const b=bytes[i],p=clear[i];
    if(!histogram.has(b))histogram.set(b,new Map());
    const row=histogram.get(b);
    if(!firstConflict&&examples.has(b)&&examples.get(b).label!==p)
      firstConflict={byte:b,firstIndex:examples.get(b).index,
        firstPlain:examples.get(b).label,secondIndex:i,secondPlain:p};
    if(!examples.has(b))examples.set(b,{index:i,label:p});
    row.set(p,(row.get(p)||0)+1);
  }
  let highest=0;
  for(const row of histogram.values())
    highest+=Math.max(...row.values());
  return {distinctBytes:histogram.size,maxUnderAnySecret256Lookup:highest,
    forcedMismatches:clear.length-highest,firstConflict};
}
/**
 * Position-indexed arbitrary codebook f_group(byte) for source-visible group
 * clocks: physical manuscript page (10/13/9 original table rows), six
 * printed interior columns, or the thirty visible inner rows.
 * @param {number[]} cells Exact printed row-major table coordinates.
 * @param {number[]} bytes Full original 256-value table.
 * @param {"page"|"column"|"row"} grouping
 */
function groupedCodebook(cells,bytes,grouping){
  assert.equal(cells.length,CLEAR.length);
  const hist=new Map();
  for(let j=0;j<cells.length;j++){
    const cell=cells[j],r=Math.floor(cell/8),c=cell%8;
    const group=grouping==="page"?(r<10?0:r<23?1:2):
      grouping==="column"?c:r;
    const key=group+":"+bytes[cell];
    if(!hist.has(key))hist.set(key,new Map());
    const pair=hist.get(key),p=CLEAR[j];
    pair.set(p,(pair.get(p)||0)+1);
  }
  let ceiling=0;
  for(const counts of hist.values())ceiling+=Math.max(...counts.values());
  return {distinctGroupedCodes:hist.size,maxMatches:ceiling,
    forcedMismatches:CLEAR.length-ceiling};
}
/** @param {boolean} columns Original 30x6 interior scan coordinates. */
function interiorCells(columns){
  const list=[];
  if(columns){for(let c=1;c<=6;c++)for(let r=1;r<=30;r++)list.push(r*8+c);}
  else{for(let r=1;r<=30;r++)for(let c=1;c<=6;c++)list.push(r*8+c);}
  assert.equal(list.length,180);
  return list;
}
const possible=[];
for(const basis of [60,59]){
  const alphabet=basis===60?table.alphabet:table.alphabet.replace("f","");
  assert.equal(alphabet.length,basis);
  const bytes=table.rows.flat().map(token=>{
    assert.equal(token.length,2);
    const high=alphabet.indexOf(token[0]),low=alphabet.indexOf(token[1]);
    assert.ok(high>=0&&low>=0,token);
    const value=basis*high+low;
    assert.ok(value>=0&&value<=255,token);
    return value;
  });
  assert.equal(bytes.length,256);
  for(const columns of [false,true])for(const reverse of [false,true]){
    const source=inside(bytes,columns);
    if(reverse)source.reverse();
    const result=exactCodebook(source,CLEAR);
    const cells=interiorCells(columns);
    if(reverse)cells.reverse();
    possible.push({basis,order:columns?"column":"row",
      direction:reverse?"reverse":"printed",...result,
      phaseByOriginalPage:groupedCodebook(cells,bytes,"page"),
      phaseByInteriorColumn:groupedCodebook(cells,bytes,"column"),
      phaseByInteriorRow:groupedCodebook(cells,bytes,"row")});
  }
}
const expected=[133,131,132,131];
for(let i=0;i<possible.length;i++)
  assert.equal(possible[i].maxUnderAnySecret256Lookup,expected[i%4]);
assert.ok(possible.every(x=>x.forcedMismatches>=47));
assert.deepEqual(possible.slice(0,4).map(x=>x.phaseByOriginalPage.maxMatches),[165,166,165,166]);
assert.deepEqual(possible.slice(0,4).map(x=>x.phaseByInteriorColumn.maxMatches),[172,174,173,172]);
assert.ok(possible.every(x=>x.phaseByInteriorRow.maxMatches===180));
assert.equal(new Set(possible.map(x=>x.distinctBytes)).size,1);
assert.equal(possible[0].distinctBytes,127);

// Heldout authentic native-GP positive: 180 original clear symbols are
// deliberately encoded as distinct source byte codes, no fitted plaintext.
const nativeCodes=CLEAR.map(p=>5+7*p);
const known=exactCodebook(nativeCodes,CLEAR);
assert.equal(known.maxUnderAnySecret256Lookup,180);
assert.equal(known.forcedMismatches,0);
const lookup=new Map(nativeCodes.map((value,i)=>[value,CLEAR[i]]));
const recovered=nativeCodes.map(v=>lookup.get(v));
assert.deepEqual(recovered,CLEAR);

console.log(JSON.stringify({
  experiment:"Full 256-input secret byte codebook against original inner180 and 180 native known plaintext",
  originalTable:"p49-p51 32x8",originalSolvedTarget:"p56 85+p57 95 GP29",
  original:possible,
  plantedNative:{gpRunes:180,exactRecoveries:180,distinctCodes:known.distinctBytes},
  conclusion:"Stationary byte→GP29 lookup forces at least47/180 contradictions; even independently keyed original manuscript pages force at least14, and individual printed columns at least6. A 30-row lookup fits vacuously with 180 distinct (row,byte) codes, without predicting p55."
},null,2));
