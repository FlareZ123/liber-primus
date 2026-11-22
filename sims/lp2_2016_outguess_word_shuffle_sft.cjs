"use strict";
/**
 * Test the conditional 2016 signed-word PRNG readout as a reversible
 * OutGuess ARC4 Fisher-Yates permutation of complete LP2 rune words.
 *
 * Conditional candidate inputs: the authentic 2016 signed sentence and
 * the 13-rune remainder from an unconfirmed line:character mapping.
 * The OutGuess ARC4 implementation is historical, but its use as a
 * Fisher-Yates word-shuffle generator, seed derivation and parameters are
 * candidate conventions, not source-selected LP2 instructions.
 *
 * This is a bounded proposal, not an authenticated LP2 cipher instruction.
 * Run: node sims/lp2_2016_outguess_word_shuffle_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
assert.match(signed,
  /Its words are the map,\s*their\s+meaning is the road,\s*and their numbers are the direction\./i);
const lineSource = read("resources/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((r,i)=>[r,i]));
const lines = lineSource.split("%").slice(0,55)
  .flatMap(page=>page.replaceAll("/","").split(/\r?\n/u)
    .filter(s=>s.trim()).map(s=>[...s].filter(r=>runeIndex.has(r))));
const alphabet = corpus.translit.map((token,i)=>({token,i}))
  .sort((a,b)=>b.token.length-a.token.length);

/** @param {string} source @returns {number[]} */
function gp(source) {
  let s = source.toUpperCase().replace(/[VKZQ]/g,letter=>
    ({V:"U",K:"C",Z:"S",Q:"C"})[letter]);
  const result=[];
  while(s) {
    const t=alphabet.find(({token})=>s.startsWith(token));
    assert.ok(t, "Unencodable GP text: "+s);
    result.push(t.i);
    s=s.slice(t.token.length);
  }
  return result;
}
const sentence="Its words are the map their meaning is the road and their numbers are the direction";
const sourceWords=sentence.split(" ");
assert.equal(sourceWords.length,16);
const directed=sourceWords.map(word=>{
  const sum=gp(word).reduce((n,i)=>n+corpus.prime[i],0);
  const q=Math.floor(sum/29),r=sum%29;
  assert.ok(lines[r] && lines[r][q], "Published line:rune coordinate out of bounds");
  return runeIndex.get(lines[r][q]);
});
assert.equal(directed.map(x=>corpus.translit[x]).join(""),
  "LCBPPRNGNGPARRTHBPC");
assert.equal(directed.slice(4,7).map(x=>corpus.translit[x]).join(""),"PRNG");
const remainder=directed.filter((_,i)=>i<4||i>6);
const wordSeed=remainder.map(i=>corpus.translit[i]).join("");
const numberSeed=remainder.reduce((a,b)=>a*29n+BigInt(b),0n).toString();
assert.equal(wordSeed,"LCBPNGPARRTHBPC");
assert.equal(numberSeed,"7144649572585460758");

const parsed=parseSharedCorpus();
const wordLengths=parsed.words.map(w=>w.length);
assert.equal(wordLengths.length,2896);
assert.equal(parsed.runeCount,12956);
const book=[wordLengths.map((_,i)=>i)];
const pages=Array.from({length:55},()=>[]);
parsed.words.forEach((w,i)=>pages[w.startPage].push(i));
assert.equal(pages.flat().length,wordLengths.length);

/**
 * Historical OutGuess ARC4 initialization, with MD5 role separation.
 * Mirrors OutGuess arc4_initkey and arc4_getbyte source, as documented
 * by sims/2016_prng_linechar_source_gate.cjs.
 * @param {string} password
 * @param {string} role
 * @returns {()=>number}
 */
function outguessBytes(password,role) {
  const digest=createHash("md5").update(role+password,"ascii").digest();
  const state=Uint8Array.from({length:256},(_,i)=>i);
  let i=255,j=0;
  for(let k=0;k<256;k++) {
    i=(i+1)&255;
    const si=state[i];
    j=(j+si+digest[k%16])&255;
    [state[i],state[j]]=[state[j],state[i]];
  }
  return ()=>{
    i=(i+1)&255;
    const si=state[i];
    j=(j+si)&255;
    const sj=state[j];
    state[i]=sj;state[j]=si;
    return state[(si+sj)&255];
  };
}

/**
 * Four successive historical ARC4 bytes form a 32-bit draw.
 * Two explicit byte orders are tested; the source does not select one.
 * @param {()=>number} nextByte
 * @param {"be"|"le"} order
 * @returns {number}
 */
function nextWord(nextByte,order) {
  const b=[nextByte(),nextByte(),nextByte(),nextByte()];
  return order==="be"
    ? ((b[0]<<24)|(b[1]<<16)|(b[2]<<8)|b[3])>>>0
    : ((b[3]<<24)|(b[2]<<16)|(b[1]<<8)|b[0])>>>0;
}

/** @param {number} length @param {()=>number} draw @param {"be"|"le"} order */
function permutation(length,draw,order) {
  const indices=Array.from({length},(_,i)=>i);
  for(let i=length-1;i>0;i--) {
    const j=nextWord(draw,order)%(i+1);
    [indices[i],indices[j]]=[indices[j],indices[i]];
  }
  return indices;
}

/**
 * Full-word shuffle and its exact inverse; page boundaries are labels
 * only. No rune symbols or word lengths are changed.
 * @param {number[]} input
 * @param {number[][]} groups
 * @param {string} password
 * @param {string} role
 * @param {"be"|"le"} order
 * @param {boolean} reset
 * @param {"forward"|"inverse"} direction
 * @returns {number[]}
 */
function transform(input,groups,password,role,order,reset,direction) {
  const out=input.slice();
  const globalDraw=outguessBytes(password,role);
  for(const group of groups) {
    const draw=reset?outguessBytes(password,role):globalDraw;
    const p=permutation(group.length,draw,order);
    for(let i=0;i<group.length;i++) {
      if(direction==="forward")out[group[i]]=input[group[p[i]]];
      else out[group[p[i]]]=input[group[i]];
    }
  }
  return out;
}

/** @param {number[]} lengths @returns {number} */
function association(lengths) {
  const observed=Array.from({length:3},()=>[0,0,0]);
  const row=[0,0,0],column=[0,0,0];
  const cls=x=>x<=2?0:x<=5?1:2;
  for(let i=1;i<lengths.length;i++) {
    const x=cls(lengths[i-1]),y=cls(lengths[i]);
    observed[x][y]++;row[x]++;column[y]++;
  }
  let chi=0;
  for(let i=0;i<3;i++)for(let j=0;j<3;j++) {
    const expected=row[i]*column[j]/(lengths.length-1);
    chi+=(observed[i][j]-expected)**2/expected;
  }
  return chi;
}

const configurations=[];
for(const [role,passwordLabel,password] of [
  ["Encryption","GP-latin",wordSeed],["Encryption","decimal",numberSeed],
  ["Seeding","GP-latin",wordSeed],["Seeding","decimal",numberSeed]
])for(const groupMode of ["book","page-continuous","page-reset"])
  for(const order of ["be","le"])
    for(const direction of ["forward","inverse"]) {
      const groups=groupMode==="book"?book:pages;
      const reset=groupMode==="page-reset";
      configurations.push({role,passwordLabel,password,groupMode,order,
        reset,direction,groups});
    }
assert.equal(configurations.length,48);

const original=configurations.map(x=>({
  role:x.role,password:x.passwordLabel,scope:x.groupMode,
  order:x.order,direction:x.direction,
  chi:association(transform(wordLengths,x.groups,x.password,
    x.role,x.order,x.reset,x.direction))
})).sort((a,b)=>b.chi-a.chi);
assert.ok(Math.abs(association(wordLengths)-3.949446088360591)<1e-9);
assert.ok(Math.abs(original[0].chi-10.36390434213642)<1e-9);
assert.deepEqual(original.slice(0,1).map(x=>[
  x.role,x.password,x.scope,x.order,x.direction
]),[["Seeding","decimal","book","be","forward"]]);

// Real native-GP word-length plant, never used to select the original key.
// It proves the proposed inverse can recover an unknown seeded word order.
const source=read("resources/control/shakespeare_first300k.txt");
const native=Array.from(source.matchAll(/[A-Za-z]+/g),
  match=>gp(match[0]).length).slice(0,wordLengths.length);
assert.equal(native.length,2896);
const planted=transform(native,book,wordSeed,"Encryption","be",false,"forward");
const restored=transform(planted,book,wordSeed,"Encryption","be",false,"inverse");
assert.deepEqual(restored,native);
const sourceAssociation=association(native);
assert.ok(sourceAssociation>15);
assert.ok(association(planted)<sourceAssociation);

const output={
  source:"conditional 2016 line:character candidate seed; original 2,896 whole rune words",
  decodedLineCharacterTokens:directed.map(x=>corpus.translit[x]).join(""),
  conditionalSeed:{literal:wordSeed,decimal:numberSeed},
  originalWordCount:wordLengths.length,originalRuneCount:parsed.runeCount,
  originalChi:association(wordLengths),tested:original.length,
  originalBest:original.slice(0,12),
  strongestOriginalChi:original[0].chi,
  planted:{sourceChi:sourceAssociation,cipherChi:association(planted),
    recoveredChi:association(restored),exactLengths:restored.length},
  conclusion:"Under the unconfirmed 13-rune candidate seed, none of 48 tested OutGuess ARC4 word-permutation configurations improves the measured 3x3 adjacent short/medium/long word-length association. This is not a rune-level plaintext test and does not exclude other OutGuess permutations."
};
console.log(JSON.stringify(output,null,2));
