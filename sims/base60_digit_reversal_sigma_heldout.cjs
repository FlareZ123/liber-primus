"use strict";
/**
 * Source-cued base-60 character-reversal key test with an unknown, shared
 * 29-symbol outer alphabet and collision-triggered key skips.
 *
 * The authentic LP1 JPEG 05 embeds a hex payload whose CHARACTERS are
 * reversed before byte decoding. Apply the analogous operation to the
 * original LP2 32x8 two-character base-60 numeral cells: reverse digits
 * inside each numeral, optionally reverse cell order, then reduce mod 29.
 * Compare directly with raw 512 base-60 digits as a second literal reading.
 *
 * The first 240 GP runes of each of eight section bodies estimate sigma
 * and skip states. The next 240 are scored with sigma and source key frozen.
 * Positive controls plant independently held-out GP-English through exactly
 * this cipher. Shuffled-grid nulls use the same solver.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { inputs } = require("./grid_section_column_keys.cjs");
const { lp2 } = require("./outer_permutation_sha_probe.cjs");
const { words, flatten, training } = require("./outer_permutation_word_context.cjs");
const { evaluate } = require("./outer_permutation_pooled_holdout.cjs");
const { seededRandom, shuffledPermutation, encrypt } =
  require("./outer_permutation_assignment.cjs");

const ROOT=path.join(__dirname, "..");
const raw=JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/base60-grid.json"), "utf8"));
const ALPH=raw.alphabet;
assert.equal(ALPH.length, 60);
assert.equal(raw.rows.length, 32);
const CELLS=raw.rows.flat().map(cell => {
  assert.equal(cell.length, 2);
  const hi=ALPH.indexOf(cell[0]), lo=ALPH.indexOf(cell[1]);
  assert.ok(hi>=0 && hi<=4 && lo>=0 && lo<60);
  return [hi,lo];
});
assert.equal(CELLS.length,256);
const MOD=29,WIDTH=480,EXTRA=75,MAX=WIDTH+EXTRA;
const mod=x=>(x%MOD+MOD)%MOD;

/**
 * @param {number[][]} cells
 * @param {"digit-reversal"|"digit-stream"} mode
 */
function keySymbols(cells,mode) {
  if(mode==="digit-reversal")
    return cells.map(([hi,lo])=>mod(lo*60+hi));
  return cells.flat().map(mod);
}
/** @param {number[]} symbols @param {number} sign */
function sectionKeys(symbols,sign) {
  return Array.from({length:8},()=>Array.from({length:MAX},(_,i)=>
    mod(sign*symbols[i%symbols.length])));
}
/** @param {number[][]} cells @param {()=>number} random */
function shuffleCells(cells,random) {
  const v=cells.slice();
  for(let i=v.length-1;i>0;i--) {
    const j=Math.floor(random()*(i+1));
    [v[i],v[j]]=[v[j],v[i]];
  }
  return v;
}
/** @param {ReturnType<typeof evaluate>} recovered */
function slim(recovered) {
  return {trainPerRune:recovered.trainScorePerRune,
    heldPerRune:recovered.heldScorePerRune,
    initialization:recovered.seed};
}

const {groups}=inputs();
assert.equal(groups.length,8);
assert.ok(groups.every(group=>group.length>=WIDTH));
const orig=lp2();
const observed=groups.map(group=>group.slice(0,WIDTH));
const contexts=[], controlContexts=[];
let absolute=0;
for(const group of groups) {
  contexts.push(orig.classes.slice(absolute,absolute+WIDTH));
  absolute+=group.length;
}

const english=fs.readFileSync(
  path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8");
const englishWords=words(english);
const test=flatten(englishWords.slice(0,16000));
const model=training(flatten(englishWords.slice(16000,50000)));
assert.ok(test.values.length>=8*WIDTH);
for(let s=0;s<8;s++)controlContexts.push(test.classes.slice(s*WIDTH,(s+1)*WIDTH));

const rng=seededRandom(0x33015379);
const sigma=shuffledPermutation(Array.from({length:MOD},(_,i)=>i),rng);
const inverse=Array.from({length:MOD},(_,c)=>sigma.indexOf(c));
const nullRep=Number(process.env.LP2_BASE60_NULLS||"8");
assert.ok(Number.isInteger(nullRep)&&nullRep>=0&&nullRep<=500);

const result=[];
for(const spec of [
  {name:"reversed-digits",mode:"digit-reversal",reverse:false,sign:1},
  {name:"reversed-digits-and-cells",mode:"digit-reversal",reverse:true,sign:1},
  {name:"raw-512-digits",mode:"digit-stream",reverse:false,sign:1},
  {name:"reversed-digits-neg",mode:"digit-reversal",reverse:false,sign:-1},
  {name:"reversed-digits-and-cells-neg",mode:"digit-reversal",reverse:true,sign:-1},
  {name:"raw-512-digits-neg",mode:"digit-stream",reverse:false,sign:-1}
].filter(item => !process.env.LP2_BASE60_VARIANT ||
  item.name===process.env.LP2_BASE60_VARIANT)) {
  const cells=spec.reverse?CELLS.slice().reverse():CELLS;
  const symbols=keySymbols(cells,spec.mode);
  const keys=sectionKeys(symbols,spec.sign);
  const planted=[],truth=[];
  for(let s=0;s<8;s++) {
    const at=s*WIDTH;
    const p=test.values.slice(at,at+WIDTH);
    assert.equal(p.length,WIDTH);
    const e=encrypt(p,keys[s],sigma,rng,.81);
    planted.push(e.ciphertext);
    truth.push(p);
  }
  const control=evaluate(planted,controlContexts,keys,model);
  const matched=control.inverse.filter((x,i)=>x===inverse[i]).length;
  // Compare the heldout 240-rune tails of all eight independently planted
  // sections, without requiring any original plaintext for this control.
  let correct=0;
  for(let s=0;s<8;s++)for(let i=0;i<240;i++)
    if(control.decodes[s][i]===truth[s][240+i])correct++;
  const actual=evaluate(observed,contexts,keys,model);
  const nulls=[];
  for(let rep=0;rep<nullRep;rep++) {
    const shuffled=shuffleCells(cells,rng);
    const fake=sectionKeys(keySymbols(shuffled,spec.mode),spec.sign);
    nulls.push(evaluate(observed,contexts,fake,model).heldScorePerRune);
  }
  const empiricalP=(1+nulls.filter(x=>x>=actual.heldScorePerRune).length)/(nullRep+1);
  result.push({
    sourceReading:spec.name,keyPeriod:symbols.length,
    model:"8 section restarts, same 29-symbol key, one global unknown sigma, q=0.81",
    positive:{matchedAlphabetSymbols:matched,heldPlainAccuracy:correct/(8*240),
      ...slim(control)},
    original:{...slim(actual),firstSectionPreview:actual.decodes[0].slice(0,30)},
    shuffledCellNull:{replicates:nullRep,mean:nulls.length?
      nulls.reduce((a,b)=>a+b,0)/nulls.length:null,
      best:nulls.length?Math.max(...nulls):null,upperP:empiricalP}
  });
  console.log("SOURCE",JSON.stringify(result[result.length-1]));
}
console.log("FINAL",JSON.stringify({tested:result.length,results:result},null,2));
