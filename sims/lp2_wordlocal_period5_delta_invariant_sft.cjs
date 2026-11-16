"use strict";
/**
 * Original-LP2 key-independent test of arbitrary per-word 5-period additive keys.
 * Windows 11 / Node 22: node sims/lp2_wordlocal_period5_delta_invariant_sft.cjs
 *
 * If C[j] = (P[j] + K[j mod 5]) mod 29 then for j >= 5
 * C[j]-C[j-5] = P[j]-P[j-5] (mod 29), regardless of the secret key.
 * A fresh independent five-rune key is allowed for every printed word.
 * This does not test nonadditive, shuffled, stateful or resegmented ciphers.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root,p),"utf8").replace(/\r\n/g,"\n");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const original = read("resources/liber-primus/lp2-transcription.txt");
const lexicon = read("resources/control/english_wordfreq_textblob.txt");
const runeIndex = new Map(corpus.runes.map((r,i)=>[r,i]));
const tokens = corpus.translit.map((token,index)=>({token,index})).sort((a,b)=>b.token.length-a.token.length);
const mod29 = x => (x%29+29)%29;
/** @returns {number[][]} */
function printedWords() {
  const chunks=original.split("%");
  assert.equal(chunks.length,57);
  const out=[];let cur=[];
  for(const ch of chunks.slice(0,55).join("%")) {
    const ix=runeIndex.get(ch);
    if(ix!==undefined)cur.push(ix);
    else if("-.$&§".includes(ch)&&cur.length){out.push(cur);cur=[];}
  }
  if(cur.length)out.push(cur);
  assert.equal(out.length,2896);
  assert.equal(out.flat().length,12956);
  assert.deepEqual(out.flat(),corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices));
  return out;
}
/** @param {string} text @returns {number[]|null} */
function toGP(text) {
  const s=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const out=[];
  for(let j=0;j<s.length;) {
    if(s.startsWith("ING",j)){out.push(21);j+=3;continue;}
    if(s.startsWith("IO",j)){out.push(27);j+=2;continue;}
    const t=tokens.find(t=>s.startsWith(t.token,j));
    if(!t)return null;
    out.push(t.index);j+=t.token.length;
  }
  return out;
}
/** @param {number[]} w @returns {string} */
function signature(w){return w.slice(5).map((v,j)=>mod29(v-w[j])).join(",");}
function dictionary() {
  const signatures=new Map(),byLength=new Map();
  for(const row of lexicon.split("\n")) {
    const m=/^([a-z]+)\s+\d+$/.exec(row);
    if(!m)continue;
    const gp=toGP(m[1]);
    if(!gp||gp.length<6)continue;
    const k=gp.length+":"+signature(gp);
    if(!signatures.has(k))signatures.set(k,[]);
    signatures.get(k).push(m[1]);
    if(!byLength.has(gp.length))byLength.set(gp.length,[]);
    byLength.get(gp.length).push(gp);
  }
  return {signatures,byLength};
}
/** @param {number[][]} words @param {Map<string,string[]>} lookup */
function classify(words,lookup){
  const counts=new Map(),examples=[];
  for(let i=0;i<words.length;i++){
    const w=words[i];if(w.length<6)continue;
    const hits=lookup.get(w.length+":"+signature(w))||[];
    const item=counts.get(w.length)||{n:0,supported:0,unique:0,candidates:0};
    item.n++;item.candidates+=hits.length;
    if(hits.length)item.supported++;
    if(hits.length===1)item.unique++;
    counts.set(w.length,item);
    if(w.length>=9&&hits.length&&examples.length<6)
      examples.push({originalWordIndex:i,runes:w.length,hits:hits.slice(0,5)});
  }
  return {byLength:Object.fromEntries([...counts].sort((a,b)=>a[0]-b[0])),examples};
}
/** @param {number[][]} words @param {Map<number,number[][]>} pool @param {number} period */
function encryptPlant(words,pool,period){
  return words.filter(w=>w.length>=6).map((w,i)=>{
    const eligible=pool.get(w.length);
    assert.ok(eligible?.length,"missing GP lexicon length "+w.length);
    const plain=eligible[(31*i+7)%eligible.length];
    const key=Array.from({length:period},(_,j)=>mod29(3+7*i+11*j));
    return plain.map((p,j)=>mod29(p+key[j%period]));
  });
}
const words=printedWords();
const {signatures,byLength}=dictionary();
const source=classify(words,signatures);
const expected=[
  [6,256,256],[7,216,207],[8,156,24],[9,78,1],[10,52,0],
  [11,32,0],[12,18,0],[13,4,0],[14,3,0]
];
for(const [length,n,supported] of expected)
  assert.deepEqual([source.byLength[length]?.n,source.byLength[length]?.supported],
    [n,supported],"source-original length "+length);
assert.equal(words.filter(w=>w.length>=6).length,815);
assert.equal(words.filter(w=>w.length>=10).length,109);
const plant5=classify(encryptPlant(words,byLength,5),signatures);
const plant6=classify(encryptPlant(words,byLength,6),signatures);

/**
 * Corrected source-native Beowulf is a separately pinned Old English control.
 * Its concatenated 48,012-rune GP29 string is split at its 10,885 original
 * word lengths, using the fixture's explicit base29 alphabet.
 */
function oldEnglishBeowulfSignatures() {
  const oe=JSON.parse(read("resources/control/beowulf_oe_gp_profile_corrected.json"));
  const alphabet=oe.positiveControlAlphabet;
  const out=new Map();
  let position=0;
  for(const length of oe.allSourceGpWordLengths){
    const word=Array.from(oe.sourceGpBase29.slice(position,position+length),
      ch=>alphabet.indexOf(ch));
    position+=length;
    assert.ok(word.every(x=>x>=0&&x<29));
    if(length<6)continue;
    const key=length+":"+signature(word);
    if(!out.has(key))out.set(key,[]);
    out.get(key).push("BEOWULF");
  }
  assert.equal(position,48012);
  assert.equal(oe.allSourceGpWordLengths.length,10885);
  return out;
}
const oldEnglish=classify(words,oldEnglishBeowulfSignatures());
const oldExpected=[[6,256],[7,71],[8,1],[9,0],[10,0],
  [11,0],[12,0],[13,0],[14,0]];
for(const [length,supported] of oldExpected)
  assert.equal(oldEnglish.byLength[length]?.supported,supported,
    "corrected Old English source register at length "+length);


/** Independently pinned Vulgate GP29 word spellings, 39,835 source words. */
function latinVulgateSignatures() {
  const alphabet="0123456789ABCDEFGHIJKLMNOPQRS";
  const latin=read("resources/control/latin-vulgate-gp-wholewords.txt")
    .split(/\r?\n/).filter(line=>/^[0-9A-S]+$/.test(line));
  assert.equal(latin.length,39835);
  const signatures=new Map();
  for(const line of latin){
    const word=Array.from(line,ch=>alphabet.indexOf(ch));
    if(word.length<6)continue;
    const key=word.length+":"+signature(word);
    if(!signatures.has(key))signatures.set(key,[]);
    signatures.get(key).push("VULGATE");
  }
  return signatures;
}
const latin=classify(words,latinVulgateSignatures());
const latinExpected=[[6,256],[7,124],[8,4],[9,1],
  [10,0],[11,0],[12,0],[13,0],[14,0]];
for(const [length,supported] of latinExpected)
  assert.equal(latin.byLength[length]?.supported,supported,
    "source-native Vulgate control at length "+length);


/**
 * Natural Atbash/ROT interpretation: every printed word may choose five
 * independent +/- orientations and five independent additive shifts.
 *
 * C[j] = sign[j%5] * P[j] + key[j%5] mod29.
 * At a fixed phase the fifth-lag difference vector is preserved up to a
 * single sign, so canonicalizing it under whole-vector negation eliminates
 * ALL 2^5 sign choices and all 29^5 secret shifts, independently per word.
 * A phase with two differences must use the same sign for both.
 *
 * @param {number[]} word
 * @returns {string}
 */
function signedSignature(word) {
  const phaseSignatures=[];
  for(let phase=0;phase<5;phase++){
    const delta=[];
    for(let j=phase+5;j<word.length;j+=5)delta.push(mod29(word[j]-word[j-5]));
    const positive=delta.join("."),negative=delta.map(x=>mod29(-x)).join(".");
    phaseSignatures.push(positive<negative?positive:negative);
  }
  return phaseSignatures.join("/");
}
/** @param {Map<string,number>} index @param {number[]} word */
function addSignedWord(index,word){
  if(word.length<6)return;
  const key=word.length+":"+signedSignature(word);
  index.set(key,(index.get(key)||0)+1);
}
function signedLexiconIndices(){
  const modern=new Map(),oldEnglish=new Map(),latin=new Map();
  for(const line of lexicon.split("\n")){
    const m=/^([a-z]+)\s+\d+$/.exec(line);
    if(m){const word=toGP(m[1]);if(word)addSignedWord(modern,word);}
  }
  const oe=JSON.parse(read("resources/control/beowulf_oe_gp_profile_corrected.json"));
  let cursor=0;
  for(const length of oe.allSourceGpWordLengths){
    const word=Array.from(oe.sourceGpBase29.slice(cursor,cursor+length),
      ch=>oe.positiveControlAlphabet.indexOf(ch));
    cursor+=length;
    addSignedWord(oldEnglish,word);
  }
  assert.equal(cursor,48012);
  const alphabet="0123456789ABCDEFGHIJKLMNOPQRS";
  const vulgate=read("resources/control/latin-vulgate-gp-wholewords.txt")
    .split(/\r?\n/).filter(line=>/^[0-9A-S]+$/.test(line));
  assert.equal(vulgate.length,39835);
  for(const line of vulgate)
    addSignedWord(latin,Array.from(line,ch=>alphabet.indexOf(ch)));
  return {modern,oldEnglish,latin};
}
/** @param {number[][]} originals @param {Map<string,number>} dictionary */
function signedMatches(originals,dictionary){
  const counts=new Map();
  for(const w of originals.filter(w=>w.length>=6)){
    const r=counts.get(w.length)||{n:0,supported:0};
    r.n++;
    if(dictionary.has(w.length+":"+signedSignature(w)))r.supported++;
    counts.set(w.length,r);
  }
  return Object.fromEntries([...counts].sort((a,b)=>a[0]-b[0]));
}
/** @param {number[][]} original @param {Map<number,number[][]>} pools */
function signedPositive(original,pools){
  return original.filter(w=>w.length>=6).map((w,i)=>{
    const available=pools.get(w.length);
    assert.ok(available?.length);
    const plaintext=available[(31*i+7)%available.length];
    return plaintext.map((p,j)=>{
      const phase=j%5;
      const sign=(i+phase)%2===0?1:-1;
      return mod29(sign*p+3+7*i+11*phase);
    });
  });
}
const signedDict=signedLexiconIndices();
const oriented={
  modern:signedMatches(words,signedDict.modern),
  oldEnglish:signedMatches(words,signedDict.oldEnglish),
  latin:signedMatches(words,signedDict.latin)
};
const orientedExpected={
  modern:[[6,256],[7,216],[8,100],[9,6]],
  oldEnglish:[[6,256],[7,159],[8,4],[9,0]],
  latin:[[6,256],[7,200],[8,46],[9,2]]
};
for(const [source,required] of Object.entries(orientedExpected)){
  for(const [length,supported] of required)
    assert.equal(oriented[source][length]?.supported,supported,
      "signed Atbash/ROT "+source+" source length "+length);
  for(const length of [10,11,12,13,14])
    assert.equal(oriented[source][length]?.supported,0,
      "no long period-five signed/affine match for "+source+" "+length);
}
const signedPlant=signedMatches(signedPositive(words,byLength),signedDict.modern);
assert.equal(Object.values(signedPlant).reduce((s,row)=>s+row.supported,0),815);

const support=report=>Object.values(report.byLength).reduce((sum,x)=>sum+x.supported,0);
assert.equal(support(plant5),815);
console.log(JSON.stringify({
  scope:"all 12956 source runes, 2896 original printed words",
  originalByLength:source.byLength,
  oldEnglishBeowulfByLength:oldEnglish.byLength,
  latinVulgateByLength:latin.byLength,
  signedShiftOrAtbashByLength:oriented,
  signedPhaseFiveNativePlant:{n:815,supported:815},
  long10Plus:{n:109,supported:0},
  sourceNativeFivePeriodPlant:{n:815,supported:support(plant5)},
  sixPeriodWrongMechanismControl:{n:815,supported:support(plant6)},
  lexiconSignatures:signatures.size,
  spuriousOriginalMatches:source.examples,
  conclusion:"No original 10+ rune word matches the complete GP29 phase-five additive difference invariant under the pinned English register. No plaintext recovered."
},null,2));
