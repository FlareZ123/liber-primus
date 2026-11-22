"use strict";

/**
 * Original p15 has 16 numerical cells and the immediately following six
 * p16..21 printed pages have exactly 15 full-stop marks, yielding 16
 * punctuation-separated *fragments*. They are NOT 16 whole sentences:
 * the initial and final groups continue over p15 and p22 boundaries.
 *
 * Test the source-motivated one-secret-GP29-per-fragment interpretation
 * against untouched original ciphertext, with every one of the 16
 * secret tables allowed ANY permutation independently of all others.
 * Exact rank envelope works for every such key, not a fitted cipher.
 *
 * Node22 Windows CommonJS:
 * node sims/lp2_p15_16punctuation_units_allsecret_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {encodeSourceNativeGP}=require("./lp2_native_gp_source_orthography_sft.cjs");
const read=file=>fs.readFileSync(path.resolve(__dirname,"..",file),"utf8")
  .replace(/\r\n/g,"\n");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length);
const original=pages.flatMap(p=>p.indices);
assert.equal(original.length,12956);
const index=new Map(corpus.runes.map((r,i)=>[r,i]));
const fullPrinted=read("resources/liber-primus/lp2-transcription.txt");
const pageTexts=fullPrinted.split("%");
const runicPattern=new RegExp("["+corpus.runes.join("")+"]+","gu");
const words=(pageTexts.slice(0,55).join("").replace(/\/\n/g,"")
  .replace(/[\n%]/g,"").match(runicPattern)||[])
  .map(w=>Array.from(w,r=>index.get(r)));
assert.equal(words.length,2896);
assert.deepEqual(words.flat(),original);
const regionPages=pages.filter(p=>p.page>=16&&p.page<=21);
const region=regionPages.flatMap(p=>p.indices);
assert.equal(region.length,1613);
const physicalText=pageTexts.slice(16,22).join("");
const fragments=[[]];
for(const c of physicalText){
  if(index.has(c))fragments.at(-1).push(index.get(c));
  else if(c===".")fragments.push([]);
}
assert.equal(fragments.length,16);
assert.deepEqual(fragments.flat(),region);
assert.deepEqual(fragments.map(a=>a.length),
  [87,35,123,86,41,14,48,50,127,115,121,105,69,184,375,33]);
const topSizes=[1,2,3,5,8];
function topK(input,k){
  const count=new Uint16Array(29);
  for(const c of input)count[c]++;
  return Array.from(count).sort((a,b)=>b-a).slice(0,k)
    .reduce((a,b)=>a+b,0);
}
const bound=Object.fromEntries(topSizes.map(k=>[
  k,fragments.reduce((n,p)=>n+topK(p,k),0)
]));
assert.deepEqual(bound,{1:112,2:212,3:305,5:475,8:707});
/** For every secret per-fragment permutation, recovered GP top-k <=bound. */
function secretCapacityInvariant(cipherPieces,plaintext){
  const sizes=Object.fromEntries(topSizes.map(k=>[
    k,cipherPieces.reduce((n,p)=>n+topK(p,k),0)
  ]));
  for(const k of topSizes)
    assert(topK(plaintext,k)<=sizes[k],
      "secret-permutation capacity on planted text");
}
const gpTranslit=corpus.translit.map((name,i)=>({name,i}))
  .sort((a,b)=>b.name.length-a.name.length);
let seed=0x15153301;
function rnd(n){
  seed^=seed<<13; seed^=seed>>>17; seed^=seed<<5;
  return(seed>>>0)%n;
}
function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j=rnd(i+1);[arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}
function poolFor(file){
  const raw=read(file);
  const eligible=file.includes("latin-vulgate")
    ?raw.split("\n").filter(x=>!x.trimStart().startsWith("#")).join(" ")
    :raw;
  const pool=new Map();
  for(const w of eligible.match(/[A-Za-z]+/g)||[]){
    const r=encodeSourceNativeGP(w);
    if(!pool.has(r.length))pool.set(r.length,[]);
    pool.get(r.length).push(r);
  }
  for(const w of words)assert(pool.has(w.length));
  return pool;
}
function donor(pool){
  const result=[];
  for(const word of words){
    const list=pool.get(word.length);
    result.push(...list[rnd(list.length)]);
  }
  assert.equal(result.length,original.length);
  return result;
}
/** Every original punctuation cut retained within the same 1613 runes. */
const start=pages.filter(p=>p.page<16).reduce((s,p)=>s+p.indices.length,0);
assert.deepEqual(original.slice(start,start+region.length),region);
function splitAtOriginalSentences(plain){
  const parts=[],lengths=fragments.map(p=>p.length);
  let at=0;
  for(const len of lengths){parts.push(plain.slice(at,at+len));at+=len;}
  assert.equal(at,plain.length);
  return parts;
}
function positiveSecretPlant(native){
  const parts=splitAtOriginalSentences(native);
  const tables=Array.from({length:16},()=>
    shuffle(Array.from({length:29},(_,i)=>i)));
  const inverse=tables.map(table=>{
    const row=Array(29);table.forEach((c,p)=>{row[c]=p;});
    assert.equal(new Set(row).size,29);return row;
  });
  const encrypted=parts.map((p,i)=>p.map(c=>tables[i][c]));
  const recovered=encrypted.map((p,i)=>p.map(c=>inverse[i][c]));
  assert.deepEqual(recovered,parts);
  assert.deepEqual(recovered.flat(),native);
  secretCapacityInvariant(encrypted,native);
  return {recovered:runeCount(native),boundTop5:encrypted.reduce(
    (sum,p)=>sum+topK(p,5),0),actualGPtop5:topK(native,5)};
}
function runeCount(s){return s.length;}
const controls=[
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Latin Vulgate","resources/control/latin-vulgate-latin26-wholewords.txt"]
];
const tested=[],planted={};
for(const [name,file] of controls){
  const pool=poolFor(file);
  let min1=Infinity,max1=0,min5=Infinity,max5=0;
  for(let i=0;i<60;i++){
    const native=donor(pool).slice(start,start+region.length);
    const top1=topK(native,1),top5=topK(native,5);
    min1=Math.min(min1,top1);max1=Math.max(max1,top1);
    min5=Math.min(min5,top5);max5=Math.max(max5,top5);
    assert(top1>bound[1]&&top5>bound[5],
      "source-native GP text must violate original all-secret capacity");
    if(name==="Gibran"&&i===0)planted[name]=positiveSecretPlant(native);
  }
  tested.push({name,trials:60,GPtop1:[min1,max1],GPtop5:[min5,max5],
    atOrBelowOriginalBound:0});
}
if(require.main===module)console.log(JSON.stringify({
  status:"exact one-secret-alphabet-per-punctuation-fragment conditional original exclusion",
  sourceFact:"p15 has 16 printed cells; physical p16..21 has 15 periods",
  scopeWarning:"16 punctuation fragments are not 16 complete sentences; the first and last continue into adjacent physical pages",
  originalRuneCount:region.length,
  originalPunctuationFragments:fragments.map(p=>p.length),
  allSecretGP29TopKCapacity:bound,
  nativeWordLengthMatchedControls:tested,
  plantedGenuineGP29SecretAlphabetPositive:planted,
  missingAuthoredClue:"source does not say one square cell selects one independent alphabet per punctuation fragment"
},null,2));
module.exports={topK,secretCapacityInvariant};
