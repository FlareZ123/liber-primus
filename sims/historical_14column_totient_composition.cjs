"use strict";
/**
 * Source-fixed historical two-layer original-LP2 inverse.
 *
 * Recovered Cicada 2014 column-14 permutation combined with the actual
 * LP2 p56 consecutive-prime totient cipher, including exhaustive visible-F
 * literal/nonconsuming interpretations. Both possible layer orders and
 * the genuine column permutation or its exact inverse are tested.
 *
 * Every physical page resets the fixed 14-position block and the p56 key.
 * No original-LP2 source data select an extra prime offset or new key.
 *
 * Source-native controls: actual 85-rune "AN END" decrypt, and a hidden
 * Shakespeare GP29 plaintext encrypted with the frozen two-layer model.
 * Node.js 22, CommonJS, built-in modules only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {
  rowPermute, decodeFMask, primeTotients,
  trainNativeGP, languageScore, exhaustLiteralF
} = require("./historical_solve_path_transfer.cjs");
const {plaintextWords} = require("./authentic_decryption_regression.cjs");

const ROOT=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(ROOT,file),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length);
const keyOriginal=[2,8,9,1,12,13,11,4,5,7,3,0,6,10];
const keyInverse=keyOriginal.map((_,i)=>keyOriginal.indexOf(i));
assert.equal(pages.length,55);
assert.equal(pages.reduce((n,p)=>n+p.indices.length,0),12956);
assert.deepEqual([...keyOriginal].sort((a,b)=>a-b),
  Array.from({length:14},(_,i)=>i));
const keys=primeTotients(Math.max(...corpus.pages.map(p=>p.indices.length)));
const model=trainNativeGP(read("resources/control/emerson_essays_2944.txt"));
const F=0;
const MOD=x=>(x%29+29)%29;
const hash=xs=>crypto.createHash("sha256").update(Buffer.from(xs)).digest("hex");
const ROUTES=[
  {orderName:"historical-decode",order:keyOriginal,stage:"column-first"},
  {orderName:"historical-encode",order:keyInverse,stage:"column-first"},
  {orderName:"historical-decode",order:keyOriginal,stage:"totient-first"},
  {orderName:"historical-encode",order:keyInverse,stage:"totient-first"}
];

/**
 * Enumerate all observable-F literal/nonconsuming masks. When the column
 * permutation is first, the source F sites are in permuted cipher order.
 * When the totient is first, the source F sites precede the permutation.
 * @param {number[]} cipher
 * @param {{orderName:string,order:number[],stage:string}} route
 */
function fit(cipher,route) {
  const input=route.stage==="column-first"?
    rowPermute(cipher,route.order):cipher;
  const fPositions=input.flatMap((v,i)=>v===F?[i]:[]);
  assert.ok(fPositions.length<=20);
  let best={score:-Infinity,mask:-1,plain:null,consumed:-1};
  const total=2**fPositions.length;
  for(let mask=0;mask<total;mask++) {
    const result=decodeFMask(input,fPositions,mask,keys);
    const plain=route.stage==="totient-first"?
      rowPermute(result.plaintext,route.order):result.plaintext;
    const score=languageScore(plain,model);
    if(score>best.score)best={
      score,mask,plain,consumed:result.consumed
    };
  }
  return {
    route:route.orderName+"/"+route.stage,
    visibleFCount:fPositions.length,
    tried:total,
    score:best.score,
    mask:best.mask,
    plain:best.plain,
    preview:best.plain.slice(0,64).map(x=>corpus.translit[x]).join(""),
    reencodesExactly:forwardReencrypt(best.plain,cipher,route,best.mask,fPositions)
  };
}

/**
 * Validate the full original source cipher is exactly reproduced under
 * the inverse transformation and the selected literal-F mask. This asserts
 * implementation correctness, not that the key was historically used.
 */
function forwardReencrypt(plain,cipher,route,mask,fPositions) {
  const before=route.stage==="totient-first"?
    rowPermute(plain,route.order===keyOriginal?keyInverse:keyOriginal):plain;
  const marks=new Set(fPositions.filter((_,j)=>(mask>>j)&1));
  const out=[];
  let k=0;
  for(let i=0;i<before.length;i++){
    if(marks.has(i)){ assert.equal(before[i],F);out.push(F);}
    else out.push(MOD(before[i]+keys[k++]));
  }
  const actual=route.stage==="column-first"?
    rowPermute(out,route.order===keyOriginal?keyInverse:keyOriginal):out;
  assert.deepEqual(actual,cipher);
  return true;
}

/** Actual published solved cipher, independent of guessed column use. */
function authenticControl(){
  const p56=corpus.pages.find(p=>p.page===56).indices;
  const text="AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE";
  const known=plaintextWords(text).flat();
  assert.equal(p56.length,85);
  assert.equal(known.length,85);
  const result=exhaustLiteralF(p56,keys,model,known);
  assert.equal(result.correctMask,8);
  assert.equal(result.exactMatches,1);
  assert.equal(result.rankOfKnownPlain,1);
  return {runes:85,correctMask:8,score:result.correctScore};
}

/** Hidden-key native-GP positive, same glyph count as authentic p0. */
function plantedControl(){
  const source=read("resources/control/shakespeare_first300k.txt");
  const plain=plaintextWords(source.slice(200000,260000)).flat().slice(0,262);
  assert.equal(plain.length,262);
  const middle=plain.map((x,i)=>MOD(x+keys[i]));
  const cipher=rowPermute(middle,keyInverse);
  assert.deepEqual(rowPermute(cipher,keyOriginal),middle);
  const options=ROUTES.map(route=>fit(cipher,route));
  const correct=options.find(o=>o.route==="historical-decode/column-first");
  assert.ok(correct);
  assert.deepEqual(correct.plain,plain);
  assert.equal(correct.mask,0);
  return {
    originalRunesRecovered:262,
    source:"separate Shakespeare heldout span, 2014 historic decode + p56 totients",
    recoveredTrueModel:correct.route,
    recoveredTrueMask:correct.mask,
    trueScore:correct.score,
    bestScoring:options.slice().sort((a,b)=>b.score-a.score)[0].route,
    exactSourceRoundtrip:true
  };
}
function main(){
  const solved=authenticControl();
  const plant=plantedControl();
  const rows=[];
  let examined=0;
  for(const p of pages)for(const route of ROUTES){
    const fitted=fit(p.indices,route);
    rows.push({page:p.page,length:p.indices.length,
      ...fitted,sha256:hash(fitted.plain)});
    examined+=fitted.tried;
  }
  rows.sort((a,b)=>b.score-a.score);
  const report={
    classification:"Source-frozen two-historical-clue inverse; unconfirmed original plaintext",
    historicalColumnPermutation:keyOriginal,
    layerOrders:["column-first","totient-first"],
    controls:{solved,plant},
    evaluated:{pages:pages.length,runes:12956,routesPerPage:4,
      literalFCompleteMasks:examined},
    bestOriginalTen:rows.slice(0,10).map(({plain,...rest})=>rest),
    originalPagesAtLeastSolvedScore:rows.filter(r=>r.score>=solved.score).length,
    worstOriginalScore:rows[rows.length-1].score,
    provenance:"Historical 2014 recovered 14-column order and authentic LP2 solved-p56 prime-totient/visible-F cipher; combining the operations is an unproven hypothesis.",
    limitations:"Source page-reset rule, layer order and F masks are trial choices; no independently specified original-LP2 key or transformed plaintext is claimed."
  };
  console.log(JSON.stringify(report,null,2));
  return report;
}
if(require.main===module)main();
module.exports={main,fit};
