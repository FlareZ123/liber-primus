"use strict";
/**
 * Exact original-cipher two-long-word gate for a p6/p7 11-column 28-row
 * GF(29) rotating additive key. No red11 key assumption or linguistic
 * frequency fitting: each independently source-printed 12-rune word
 * determines ALL 11 secret residues if it is a registered plaintext word.
 *
 * Cipher family C[11*r+j]=(P[11*r+j]+2^r*K[j]) mod29, any K in GF29^11.
 * Original source: original physical p6 offsets82..195 plus p7 offsets0..193.
 * Source-selected row count: 308=11*28. Source root2 has order28 mod29.
 *
 * Windows Node22 SFT:
 * node sims/lp2_p6p7_28cycle_secret11_two12word_sft.cjs
 *
 * Read-only, deterministic, CommonJS, no external dependencies or network.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {encodeSourceNativeGP}=require("./lp2_native_gp_source_orthography_sft.cjs");
const ROOT=path.resolve(__dirname,"..");
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
/** @param {number} n @returns {number} */
const mod=n=>(n%29+29)%29;
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const trans=read("resources/liber-primus/lp2-transcription.txt").split("%");
const runeIndex=new Map(gp.runes.map((r,i)=>[r,i]));
const page=n=>gp.pages.find(p=>p.page===n).indices;
const red11=page(6).slice(71,82);
const source=page(6).slice(82).concat(page(7).slice(0,194));
assert.equal(red11.length,11);
assert.equal(source.length,308);
const powers=Array.from({length:28},(_,r)=>mod(2**r));
assert.equal(new Set(powers).size,28);
assert.equal(mod(2*powers[27]),1);
const inverse=Array.from({length:29},(_,x)=>{
  if(x===0)return 0;
  for(let y=1;y<29;y++)if(mod(x*y)===1)return y;
  throw Error("No GF29 inverse");
});
/** @type {{site:number,indices:number[]}[]} */
const words=[];
let runes=[],current=[];
const close=()=>{
  if(current.length)words.push({site:current[0].site,indices:current.map(x=>x.value)});
  current=[];
};
for(const physical of [6,7]) {
  let offset=0;
  const actual=[];
  for(const glyph of trans[physical]) {
    if(runeIndex.has(glyph)) {
      const value=runeIndex.get(glyph);
      actual.push(value);
      if((physical===6&&offset>=82)||(physical===7&&offset<194)) {
        current.push({site:runes.length,value});
        runes.push(value);
      } else close();
      offset++;
    } else if("-&.§".includes(glyph)) {
      close();
    }
    // Physical line-break "/", newline and "%" page join are transparent.
  }
  assert.deepEqual(actual,page(physical));
}
close();
assert.deepEqual(runes,source);
assert.equal(words.length,70);
assert.deepEqual(words.filter(w=>w.indices.length===12).map(w=>w.site),[165,293]);
assert.equal(Math.max(...words.map(w=>w.indices.length)),12);

/**
 * Exactly determine any column's secret residue from a supplied plaintext
 * symbol and original rune position. When the 12th rune revisits the first
 * column a row later, inconsistent candidates are rejected algebraically.
 * @param {number[]} cipher
 * @param {number[]} plain
 * @param {number} start
 * @returns {number[]|null}
 */
function inferKey(cipher,plain,start) {
  assert.equal(plain.length,12);
  const key=Array(11).fill(-1);
  for(let i=0;i<plain.length;i++) {
    const loc=start+i, r=Math.floor(loc/11), col=loc%11;
    const proposed=mod(inverse[powers[r]]*(cipher[loc]-plain[i]));
    if(key[col]>=0&&key[col]!==proposed)return null;
    key[col]=proposed;
  }
  assert(key.every(k=>k>=0&&k<29));
  return key;
}
/**
 * @param {number[]} clear
 * @param {number[]} key
 * @returns {number[]}
 */
function encrypt(clear,key) {
  assert.equal(clear.length,308);
  assert.equal(key.length,11);
  return clear.map((x,i)=>mod(x+powers[Math.floor(i/11)]*key[i%11]));
}
/**
 * @param {number[]} cipher
 * @param {number[]} key
 * @returns {number[]}
 */
function decrypt(cipher,key) {
  assert.equal(cipher.length,308);
  assert.equal(key.length,11);
  return cipher.map((x,i)=>mod(x-powers[Math.floor(i/11)]*key[i%11]));
}
const textblob=read("resources/control/english_wordfreq_textblob.txt")
  .split(/\r?\n/).filter(line=>/^[A-Za-z]+\s+\d+$/.test(line))
  .map(line=>line.split(/\s+/)[0]);
const controlTexts=[
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
];
const englishNames=new Set(textblob.map(s=>s.toUpperCase()));
for(const file of controlTexts)
  for(const token of read(file).match(/[A-Za-z]+/g)||[])
    englishNames.add(token.toUpperCase());
const english=[...englishNames].map(word=>({
  word,runes:encodeSourceNativeGP(word),source:"English"
})).filter(w=>w.runes.length===12);
assert.equal(english.length,872);
const latinAlpha="0123456789ABCDEFGHIJKLMNOPQRS";
const latin=read("resources/control/latin-vulgate-gp-wholewords.txt")
  .split(/\r?\n/).filter(w=>/^[0-9A-S]{12}$/.test(w))
  .map(w=>({word:w,runes:[...w].map(c=>latinAlpha.indexOf(c)),
    source:"Latin Vulgate"}));
assert.equal(latin.length,453);
const oe=JSON.parse(read("resources/control/beowulf_oe_gp_profile_corrected.json"));
let offset=0;
const oldEnglish=[];
for(const length of oe.allSourceGpWordLengths) {
  if(length===12) {
    const word=oe.sourceGpBase29.slice(offset,offset+length);
    oldEnglish.push({word,source:"Old English Beowulf",
      runes:[...word].map(c=>oe.positiveControlAlphabet.indexOf(c))});
  }
  offset+=length;
}
assert.equal(offset,48012);
assert.equal(oldEnglish.length,2);
const candidates=[...english,...latin,...oldEnglish];
assert.equal(candidates.length,1327);
const first=words.find(w=>w.site===165),second=words.find(w=>w.site===293);
assert.equal(first.indices.length,12);
assert.equal(second.indices.length,12);
const matching=(cipher,site)=>candidates.flatMap(x=>{
  const key=inferKey(cipher,x.runes,site);
  return key===null?[]:[{word:x.word,source:x.source,key}];
});
const candidatesA=matching(source,first.site);
const candidatesB=matching(source,second.site);
assert.equal(candidatesA.length,30);
assert.equal(candidatesB.length,98);
const fromA=new Map();
for(const entry of candidatesA) {
  const id=entry.key.join(",");
  if(!fromA.has(id))fromA.set(id,[]);
  fromA.get(id).push(entry);
}
const common=[];
for(const entry of candidatesB)
  for(const earlier of fromA.get(entry.key.join(","))||[])
    common.push({early:earlier.word,late:entry.word,key:entry.key});
assert.equal(common.length,0);
assert.equal(fromA.size,23);
assert.equal(new Set(candidatesB.map(x=>x.key.join(","))).size,72);

/**
 * Additional equally source-typed 28-cycle readings:
 *  - reading from the opposite end of the primitive-root orbit
 *  - the literal 308 runes serialized as 11 contiguous 28-rune columns
 * Each native word imposes one or more exact secret column residues.
 * @param {number[]} ciphertext
 * @param {number[]} plain
 * @param {number} start
 * @param {"row"|"column"} order
 * @param {1|-1} polarity
 * @returns {number[]|null}
 */
function inferVariant(ciphertext,plain,start,order,polarity) {
  assert.equal(plain.length,12);
  const key=Array(11).fill(-1);
  for(let i=0;i<plain.length;i++) {
    const location=start+i;
    const row=order==="row"?Math.floor(location/11):location%28;
    const col=order==="row"?location%11:Math.floor(location/28);
    const exponent=((polarity*row)%28+28)%28;
    const candidate=mod(inverse[powers[exponent]]*
      (ciphertext[location]-plain[i]));
    if(key[col]>=0&&key[col]!==candidate)return null;
    key[col]=candidate;
  }
  return key;
}
function variantCandidateKeys(ciphertext,start,order,polarity) {
  return candidates.flatMap(x=>{
    const key=inferVariant(ciphertext,x.runes,start,order,polarity);
    return key===null?[]:[{word:x.word,source:x.source,key}];
  });
}
const variants=[];
for(const order of ["row","column"])
  for(const polarity of /** @type {(1|-1)[]} */([1,-1])) {
    const left=variantCandidateKeys(source,first.site,order,polarity);
    const right=variantCandidateKeys(source,second.site,order,polarity);
    const leftKeys=new Set(left.map(x=>x.key.join(",")));
    const shared=right.filter(x=>leftKeys.has(x.key.join(","))).length;
    const details={order,polarity,firstWordViable:left.length,
      secondWordViable:right.length,
      common11ColumnKeys:shared};
    variants.push(details);
  }
assert.deepEqual(variants,[
  {order:"row",polarity:1,firstWordViable:30,
    secondWordViable:98,common11ColumnKeys:0},
  {order:"row",polarity:-1,firstWordViable:34,
    secondWordViable:50,common11ColumnKeys:0},
  {order:"column",polarity:1,firstWordViable:0,
    secondWordViable:0,common11ColumnKeys:0},
  {order:"column",polarity:-1,firstWordViable:0,
    secondWordViable:0,common11ColumnKeys:0}
]);
// No column-major candidate survives even one registered 12-rune
// word. The row-major first/last printed words independently determine
// all 11 residues, and no complete vectors agree.

// Native GP positive control in the same 308-rune original-source geometry.
const planted=encodeSourceNativeGP(read(controlTexts[0])).slice(1000,1308);
const earlyWord=encodeSourceNativeGP("COMPANIONSHIP");
const lateWord=encodeSourceNativeGP("ACQUAINTANCE");
assert.equal(earlyWord.length,12);
assert.equal(lateWord.length,12);
planted.splice(first.site,12,...earlyWord);
planted.splice(second.site,12,...lateWord);
assert.equal(planted.length,308);
const plantedCipher=encrypt(planted,red11);
assert.deepEqual(decrypt(plantedCipher,red11),planted);
assert.deepEqual(inferKey(plantedCipher,earlyWord,first.site),red11);
assert.deepEqual(inferKey(plantedCipher,lateWord,second.site),red11);
const plantA=matching(plantedCipher,first.site);
const plantB=matching(plantedCipher,second.site);
const plantKeys=new Set(plantA.map(x=>x.key.join(",")));
assert(plantB.some(x=>plantKeys.has(x.key.join(",")) &&
  x.key.join(",")===red11.join(",") && x.word==="ACQUAINTANCE"));
for(const variant of variants) {
  const {order,polarity}=variant;
  const plantedCipherVariant=planted.map((p,position)=>{
    const r=order==="row"?Math.floor(position/11):position%28;
    const c=order==="row"?position%11:Math.floor(position/28);
    const power=powers[((polarity*r)%28+28)%28];
    return mod(p+red11[c]*power);
  });
  const decrypted=plantedCipherVariant.map((c,position)=>{
    const r=order==="row"?Math.floor(position/11):position%28;
    const j=order==="row"?position%11:Math.floor(position/28);
    return mod(c-powers[((polarity*r)%28+28)%28]*red11[j]);
  });
  assert.deepEqual(decrypted,planted);
  for(const [word,site] of [[earlyWord,first.site],[lateWord,second.site]]) {
    const inferred=inferVariant(plantedCipherVariant,word,site,order,polarity);
    assert(inferred!==null);
    assert(inferred.every((v,i)=>v<0||v===red11[i]));
  }
}

/**
 * A second source-selected candidate is the multiplicative (DH) log2
 * alphabet over GF(29)^*. To retain all 29 manuscript glyphs, reserve
 * any ONE GP rune E for the ciphertext zero. All other 28 runes are
 * ranked 0..27 in GP order with E removed and mapped bijectively to
 * powers of 2. Every possible E in 0..28 is independently tested.
 * No status is assigned to the reserved rune by reading candidate
 * plaintext, so the family of 29 reserved-rune choices is complete.
 *
 * C[loc]=0 iff P[loc]=E.
 * C[loc]=2^(compressed(P)+sign*row+K[col]) mod29 otherwise.
 * K consists of 11 arbitrary residues modulo 28.
 */
const mod28=x=>(x%28+28)%28;
const log2=Array(29).fill(-1);
for(let r=0;r<28;r++) {
  assert.equal(log2[powers[r]],-1);
  log2[powers[r]]=r;
}
assert.deepEqual(log2.slice(1).slice().sort((a,b)=>a-b),
  Array.from({length:28},(_,i)=>i));
/**
 * @param {number[]} plaintext
 * @param {number} start
 * @param {number} escape one of all 29 reserved source rune IDs
 * @param {"row"|"column"} order
 * @param {1|-1} sign
 * @param {number[]} ciphertext
 * @returns {number[]|null}
 */
function inferLogKey(plaintext,start,escape,order,sign,ciphertext=source) {
  assert.equal(plaintext.length,12);
  const key=Array(11).fill(-1);
  for(let i=0;i<12;i++) {
    const at=start+i,p=plaintext[i],c=ciphertext[at];
    if((p===escape)!==(c===0))return null;
    if(c===0)continue;
    const row=order==="row"?Math.floor(at/11):at%28;
    const col=order==="row"?at%11:Math.floor(at/28);
    const compressed=p-Number(p>escape);
    const proposed=mod28(log2[c]-compressed-sign*row);
    if(key[col]!==-1&&key[col]!==proposed)return null;
    key[col]=proposed;
  }
  return key;
}
/** @param {number[]} values @param {number[]} key
 *  @param {number} escape @param {"row"|"column"} order
 *  @param {1|-1} sign
 *  @returns {number[]}
 */
function encryptLog(values,key,escape,order,sign) {
  return values.map((p,at)=>{
    if(p===escape)return 0;
    const row=order==="row"?Math.floor(at/11):at%28;
    const col=order==="row"?at%11:Math.floor(at/28);
    return powers[mod28(p-Number(p>escape)+sign*row+key[col])];
  });
}
/** @param {number[]} values @param {number[]} key
 *  @param {number} escape @param {"row"|"column"} order
 *  @param {1|-1} sign
 *  @returns {number[]}
 */
function decryptLog(values,key,escape,order,sign) {
  return values.map((c,at)=>{
    if(c===0)return escape;
    const row=order==="row"?Math.floor(at/11):at%28;
    const col=order==="row"?at%11:Math.floor(at/28);
    const compressed=mod28(log2[c]-sign*row-key[col]);
    return compressed>=escape?compressed+1:compressed;
  });
}
assert.deepEqual(source.flatMap((value,i)=>value===0?[i]:[]),[42,74,138]);
const logVariants=[];
const plantedLogKey=red11.map(x=>x%28);
for(const order of ["row","column"])
  for(const sign of /** @type {(1|-1)[]} */([-1,1])) {
    let individualFirst=0,individualSecond=0,common=0;
    let maxPerEscape=0;
    for(let escape=0;escape<29;escape++) {
      const firstKeys=new Set();
      let perEscape=0;
      for(const candidate of candidates) {
        const inferred=inferLogKey(candidate.runes,first.site,escape,order,sign);
        if(inferred!==null) {
          individualFirst++;
          firstKeys.add(inferred.join(","));
        }
      }
      for(const candidate of candidates) {
        const inferred=inferLogKey(candidate.runes,second.site,escape,order,sign);
        if(inferred!==null) {
          individualSecond++;
          if(firstKeys.has(inferred.join(","))) {common++;perEscape++;}
        }
      }
      maxPerEscape=Math.max(maxPerEscape,perEscape);
      // Every synthetic GP rune, including reserved zero, must survive.
      const literal=encryptLog(planted,plantedLogKey,escape,order,sign);
      assert.deepEqual(decryptLog(literal,plantedLogKey,escape,order,sign),
        planted);
      if(!earlyWord.includes(escape)&&!lateWord.includes(escape)) {
        assert.deepEqual(inferLogKey(earlyWord,first.site,escape,order,sign,
          literal).filter(x=>x!==-1),
          plantedLogKey.filter((x,j)=>order==="row"||
            j===Math.floor(first.site/28)||
            j===Math.floor((first.site+11)/28)));
        const q=inferLogKey(lateWord,second.site,escape,order,sign,literal);
        assert(q!==null);
        assert(q.every((v,j)=>v===-1||v===plantedLogKey[j]));
      }
    }
    logVariants.push({order,sign,escapeChoices:29,
      viableFirstWordsAcrossEscapes:individualFirst,
      viableSecondWordsAcrossEscapes:individualSecond,
      sharedKeysAcrossAllEscapes:common,maxWithinOneEscape:maxPerEscape});
  }
assert.deepEqual(logVariants.map(x=>[
  x.viableFirstWordsAcrossEscapes,x.viableSecondWordsAcrossEscapes,
  x.sharedKeysAcrossAllEscapes]),
  [[1462,797,0],[489,922,0],[0,0,0],[0,0,0]]);
console.log(JSON.stringify({
  decision:"Finite source-native lexicon exclusion of the entire secret 11-column root2 additive family",
  originalSource:"p6[82..195]+p7[0..193]",
  printedWords:words.length,originalRunes:source.length,
  longWords:[{start:165,length:12},{start:293,length:12}],
  keyFamily:"all 29^11 GP29 cyclic additive keys; also all 29 escape choices and 28^11 log2-residue keys",
  fieldPower:"2^row mod29, row0..27",
  lexiconTypes:{english:english.length,latin:latin.length,
    oldEnglish:oldEnglish.length,total:candidates.length},
  originalFirstWordViable:candidatesA.length,
  originalSecondWordViable:candidatesB.length,
  inferredFirstKeys:fromA.size,
  inferredSecondKeys:new Set(candidatesB.map(x=>x.key.join(","))).size,
  commonCompleteKeyVectors:common.length,
  four28CycleVariantTests:variants,
  allReservedSymbolLog2Variants:logVariants,
  positive:{secretKey:red11,earlyWord:"COMPANIONSHIP",
    lateWord:"ACQUAINTANCE",exactOriginalSizeForwardInverse:true,
    bothLongWordKeysRecovered:true,commonPlantKey:true},
  conclusion:"No source-registered two-long-word plaintext pair can share even one secret key in the row-major 28-cycle families; column-chunk families fail even one original long word. Other source languages, nonnative spelling, changed word boundaries and other ciphers remain open. No original unknown plaintext recovered."
},null,2));