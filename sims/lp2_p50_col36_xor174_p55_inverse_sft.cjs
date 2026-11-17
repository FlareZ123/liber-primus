"use strict";

/**
 * Two 2016- and p55-selected p50 cells identify original columns 3,6;
 * test their 13-row byte-XOR key as a real p55 inverse with optional
 * collision-qualified key rejection. Fixed, read-only original-source SFT.
 *
 * Run: node sims/lp2_p50_col36_xor174_p55_inverse_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encode, train} = require("./grid_keyskip_viterbi.cjs");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/lp2-transcription.txt").split("%");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
assert.match(signed, /\bseeks\b/i);
assert.match(signed, /\blies\b/i);
assert.equal(grid.alphabet.length, 60);
const digit = new Map(Array.from(grid.alphabet, (v,i) => [v,i]));
const rune = new Map(corpus.runes.map((r,i) => [r,i]));
const indexWord = (p) => p === 50 ? [] :
  transcription[p > 50 ? p - 1 : p]
    .replaceAll("/", "").replaceAll("\r","").replaceAll("\n","")
    .split(/[-.&$§,:!?]/u)
    .map((s) => (s.match(/[ᚠ-᛿]+/gu) || []).join(""))
    .filter(Boolean)
    .map((s) => Array.from(s, (r) => rune.get(r)));
const words = Array.from({length:58}, (_,p) => indexWord(p));
const roman = (v) => v.map((x) => x === null ? "~" : corpus.translit[x]).join("");
const sum = (v) => v.reduce((a,x) => a + corpus.prime[x], 0);
const location = (n) => ({page:n%58, word:Math.floor(n/58)});
const target = (n) => {
  const at = location(n);
  return {...at, runes:words[at.page][at.word] || null};
};
const page50 = grid.pages.find((p) => p.page === 50);
assert.equal(page50.rows, 13);
assert.equal(page50.cols, 8);
assert.equal(page50.tokens.length, 104);
assert.equal(page50.bytes.length, 104);
for (let i=0;i<104;i++)
  assert.equal(page50.bytes[i],
    60 * digit.get(page50.tokens[i][0]) + digit.get(page50.tokens[i][1]));

// The historical source text contains the exact word LIES, whose GP sum 224
// selects original table cell3 under the already provisional base58 address.
const lies = encode("LIES");
assert.equal(sum(lies),224);
assert.deepEqual(location(224), {page:50,word:3});
assert.equal(page50.tokens[3],"3D");
assert.equal(page50.bytes[3],193);

// Independently the original signed THE selects FOLD, then the p55 fold.
// The mirror-sum 398 selects table cell6.
assert.equal(sum(encode("THE")),72);
const fold = target(72);
assert.deepEqual([fold.page, fold.word, roman(fold.runes)],
  [14,1,"FOLD"]);
assert.equal(sum(fold.runes),171);
const sb = target(171);
assert.deepEqual([sb.page, sb.word, roman(sb.runes)],
  [55,2,"SB"]);
assert.equal(words[55].length,17);
assert.equal(roman(words[55][14]),"CEAIMCX");
const mirrorTotal = sum(sb.runes)+sum(words[55][14]);
assert.equal(mirrorTotal,398);
assert.deepEqual(location(mirrorTotal),{page:50,word:6});
assert.equal(page50.tokens[6],"1p");
assert.equal(page50.bytes[6],111);
assert.equal(193 ^ 111,174);
assert.equal(sum(target(253).runes),174);  // signed SEEKS -> p21:w4 MY
assert.equal(roman(target(253).runes),"MY");

// Alternate source-normalized 59-symbol table with the F-like character
// omitted changes the same two numeric cell values to 190 and 109.
const d59 = (token) => Array.from(token, (s) => digit.get(s) -
  Number(digit.get(s)>digit.get("f")));
assert.deepEqual(d59("3D"),[3,13]);
assert.deepEqual(d59("1p"),[1,50]);
assert.equal((59*3+13) ^ (59+50),211);

const xorColumns = (colA,colB) =>
  Array.from({length:13}, (_,i) =>
    page50.bytes[8*i+colA] ^ page50.bytes[8*i+colB]);
const originalBytes = xorColumns(3,6);
assert.deepEqual(originalBytes,
  [174,9,2,250,212,149,48,173,52,137,168,231,8]);
const key29 = originalBytes.map((b) => b % 29);
assert.equal(roman(key29),"FNTHENRMEADNGDEAH");
const sourceOtherPairs = [];
for(let a=0;a<8;a++)for(let b=a+1;b<8;b++) {
  const t=roman(xorColumns(a,b).map(x=>x%29));
  if(t.includes("THEN"))sourceOtherPairs.push([a,b]);
}
assert.deepEqual(sourceOtherPairs, [[3,6]]);
const reverseGP29 = roman(key29.slice().reverse());
assert.equal(reverseGP29, "HEADNGDEAMRNETHNF");
const reverseHeadPairs=[];
for(let a=0;a<8;a++)for(let b=a+1;b<8;b++) {
  const reversed=roman(xorColumns(a,b).map(x=>x%29).reverse());
  if(reversed.startsWith("HEAD"))reverseHeadPairs.push([a,b]);
}
assert.deepEqual(reverseHeadPairs, [[3,6]]);
// Independent, row-conditioned count for six EXACT PRESELECTED rune modules.
// Their locations/words were actually recognized retrospectively, so this
// is only a collision baseline and must not be called a discovery p-value.
const fixedRuneLocations=[[2,2],[3,18],[4,9],[10,23],[11,28],[12,8]];
const matchCounts = fixedRuneLocations.map(([row,expected]) => {
  let count=0;
  for(let a=0;a<8;a++)for(let b=a+1;b<8;b++)
    count+=Number((page50.bytes[8*row+a] ^ page50.bytes[8*row+b])%29===expected);
  return count;
});
assert.deepEqual(matchCounts,[1,2,3,2,1,2]);
const conditionalExactSixModuleChance=matchCounts.reduce((p,c)=>p*c/28,1);
assert.ok(Math.abs(conditionalExactSixModuleChance-4.9803865736215336e-8)<1e-17);
let firstRowMatches = 0, allMatches = 0;
for(let i=0;i<104;i++)for(let j=i+1;j<104;j++)
 if((page50.bytes[i]^page50.bytes[j])===174) {
   allMatches++;
   if(i<8&&j<8)firstRowMatches++;
 }
assert.equal(firstRowMatches,1);
assert.equal(allMatches,24);

// A distinct length-selected candidate is the p0 physical 13-rune red
// opening: MY=174 addresses p0:w3, whose location is black body text, so
// applying the 13-byte table operator to the red title is separately tentative.
assert.deepEqual(location(174),{page:0,word:3});
assert.equal(roman(words[0][3]),"FJOE");
const opening = corpus.pages[0].indices.slice(0,13);
assert.equal(opening.length,13);
assert.equal(roman(opening),"SHEOGMIAFSYENGC");
const redOpeningVariants = [];
for(const mapName of ["mod29","scaled29"])
 for(const order of ["forward","reverse"])
  for(const sign of [-1,1]) {
    const key = originalBytes.map(b=>mapName==="mod29"?b%29:Math.floor(b*29/256));
    if(order==="reverse")key.reverse();
    const plain = opening.map((c,i)=>(c+sign*key[i]+29)%29);
    redOpeningVariants.push({mapName,order,sign,
      first8:roman(plain.slice(0,8)),last5:roman(plain.slice(8))});
  }
assert.equal(redOpeningVariants.length,8);
assert.deepEqual(
 [redOpeningVariants[0].first8,redOpeningVariants[0].last5],
 ["SEATXYSHU","NGCAOEY"]);
const C = corpus.pages[55].indices;
assert.equal(C.length,76);
assert.equal(C.filter(v=>v===0).length,3);
assert.deepEqual(C.flatMap((x,i)=>i>0&&x===C[i-1]?[i]:[]),[59]);
const english = train(read("resources/control/shakespeare_first300k.txt").slice(0,200000));
const gpMod = (x) => (x % 29 + 29) % 29;
const keys = [
  {name:"mod29", symbols:key29},
  {name:"scaled29", symbols:originalBytes.map(x=>Math.floor(x*29/256))}
];
const base = corpus.pages[57].indices.slice(0,76);
const ll = (a,b,c) => a<0 ? english.unigram[c]
  : b<0 ? english.bigram[a*29+c]
  : english.trigram[(b*29+a)*29+c];
/** @param {(number|null)[]} values */
function ioc(values) {
 const ct=new Array(29).fill(0);
 for(const v of values)if(v!==null)ct[v]++;
 const n=ct.reduce((a,b)=>a+b,0);
 return ct.reduce((a,b)=>a+b*(b-1),0)/(n*(n-1));
}

/** @param {number[]} input @param {number[]} key
 * @param {1|-1} sign decode P=C+sign*K
 * @param {number} mask one physical F bit per occurrence
 * @param {boolean} collisions permit max 8 source-qualified skipped keys
 */
function inverse(input,key,sign,mask,collisions) {
  let states=[{clock:0,prev2:-1,prev1:-1,lastC:-1,skips:0,plain:[],score:0}];
  let fIndex=0;
  for(const c of input) {
    if(c===0) {
      const drop=Boolean((mask>>fIndex)&1);
      fIndex++;
      if(drop) {
        states=states.map(s=>({...s,plain:[...s.plain,null]}));
        continue;
      }
    }
    const out=[];
    for(const s of states) {
      for(let extra=0;extra<=(collisions?1:0);extra++) {
        if(s.skips+extra>8)continue;
        const p=gpMod(c+sign*key[(s.clock+extra)%13]);
        if(extra) {
          if(s.lastC<0)continue;
          // The discarded key must have produced previous accepted C
          // for the SAME candidate plaintext p.
          if(gpMod(p-sign*key[s.clock%13])!==s.lastC)continue;
        }
        out.push({
          clock:s.clock+1+extra,
          prev2:s.prev1,prev1:p,lastC:c,
          skips:s.skips+extra,
          plain:[...s.plain,p],
          score:s.score + ll(s.prev1,s.prev2,p)-3.5*extra
        });
      }
    }
    assert.ok(out.length,"no legal GP29 inverse path");
    states=out;
  }
  states.sort((a,b)=>b.score-a.score);
  const best=states[0];
  return {
    score:best.score/best.plain.filter(v=>v!==null).length,
    ioc:ioc(best.plain),skips:best.skips,possiblePaths:states.length,
    full:roman(best.plain),plain:best.plain
  };
}
const variants=[];
for(const k of keys)
 for(const sign of [-1,1])
  for(let mask=0;mask<8;mask++) {
   const direct=inverse(C,k.symbols,sign,mask,false);
   const skip=inverse(C,k.symbols,sign,mask,true);
   variants.push({key:k.name,sign,mask,
     direct:{score:direct.score,ioc:direct.ioc,preview:direct.full},
     collision:{score:skip.score,ioc:skip.ioc,skips:skip.skips,
       paths:skip.possiblePaths,preview:skip.full}});
  }
const ranked=variants.slice().sort((a,b)=>b.collision.score-a.collision.score);
const direct=variants.slice().sort((a,b)=>b.direct.score-a.direct.score);
const baseline = (() => {
  let score=0;
  for(let i=0;i<base.length;i++)
    score+=ll(i?base[i-1]:-1,i>1?base[i-2]:-1,base[i]);
  return {perRune:score/base.length,ioc:ioc(base)};
})();
// This detects a complete native English recovery, not a high score induced
// by scanning variant and skip alternatives on only 76 symbols.
assert.ok(ranked[0].collision.score < baseline.perRune);
assert.ok(direct[0].direct.score < baseline.perRune);

// Positive planted GP29 native text: the chosen recurring-13 key is real,
// and 1-2 collision rejection events are generated by the same precise rule.
const positiveKey=keys[0].symbols;
let cursor=0,previous=-1,skipped=0;
const plant=[];
for(const p of base) {
  let c=gpMod(p+positiveKey[cursor%13]);
  if(previous>=0 && c===previous) {
    cursor++;
    skipped++;
    c=gpMod(p+positiveKey[cursor%13]);
  }
  plant.push(c);
  previous=c;
  cursor++;
}
const positive=inverse(plant,positiveKey,-1,0,true);
const recovered=positive.plain.filter((p,i)=>p===base[i]).length;
assert.ok(skipped>0,"the authentic-text source-shaped plant had no collisions");
assert.ok(recovered>=70,"collision-aware inverse failed native GP29 positive");
console.log(JSON.stringify({
  type:"source-constrained page50 XOR column key attempt",
  original: {
    sourceIndices:[3,6],cells:["3D","1p"],bytes:[193,111],
    XOR:174,MYprimeSum:174,radix59XOR:211,
    matchedSourcePairsInFirstRow:firstRowMatches,
    matchedPairsIn13rows:allMatches,
    rowCount:13,xor13:originalBytes,GP29Key:roman(key29),
    oneTHENpairAmong28:sourceOtherPairs,
    oneReverseHEADpairAmong28:reverseHeadPairs,
    reversedGP29:reverseGP29,
    rowConditionedPosthocSixModuleCollision:conditionalExactSixModuleChance
  },
  originalP0Red13: {
    sourceHeading:roman(opening),alignedOriginalVariants:redOpeningVariants,
    lengthOnlySelectsHeading:true,
    sourceMYactualAddress:"physical p0 word3 FJOE, not red heading"
  },
  originalP55: {
    runes:C.length,directCandidates:variants.length,
    bestDirect:direct[0],bestCollision:ranked[0],
    nativeP57Control:baseline
  },
  positive:{plantedRejects:skipped,recoveredOf76:recovered,
    inferredSkips:positive.skips,inferredScore:positive.score},
  conclusion:"Conditional XOR checksum survives; no verified original LP2 plaintext"
},null,2));
