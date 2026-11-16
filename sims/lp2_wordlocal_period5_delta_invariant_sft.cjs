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
const support=report=>Object.values(report.byLength).reduce((sum,x)=>sum+x.supported,0);
assert.equal(support(plant5),815);
console.log(JSON.stringify({
  scope:"all 12956 source runes, 2896 original printed words",
  originalByLength:source.byLength,
  long10Plus:{n:109,supported:0},
  sourceNativeFivePeriodPlant:{n:815,supported:support(plant5)},
  sixPeriodWrongMechanismControl:{n:815,supported:support(plant6)},
  lexiconSignatures:signatures.size,
  spuriousOriginalMatches:source.examples,
  conclusion:"No original 10+ rune word matches the complete GP29 phase-five additive difference invariant under the pinned English register. No plaintext recovered."
},null,2));
