"use strict";

/**
 * One-file original LP2 known-text retrieval from intact printed word lengths.
 * Original word runs are never edited or plaintext-filled during the real test.
 * All 5 frozen source registers are already checked into resources/control.
 * Node.js 22, CommonJS, no network/CLI arguments.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus,physicalLP2Page} = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname,"..");
const read = rel => fs.readFileSync(path.join(ROOT,rel),"utf8");
const GP_PAIRS = new Set(["TH","NG","EO","OE","AE","IA","EA"]);
const SEED_LEN = 7, N_SHUFFLES = 400;
const windows = [];

function gpLength(token) {
  const text = token.toUpperCase().replace(/K/g,"C")
    .replace(/Q/g,"CW").replace(/V/g,"U").replace(/Z/g,"S");
  let n=0;
  for(let i=0;i<text.length;i++,n++) {
    if(text.slice(i,i+3)==="ING")i+=2;
    else if(GP_PAIRS.has(text.slice(i,i+2)))i++;
  }
  return n;
}

function tokenize(source) {
  const words=source.match(/[A-Za-z]+/g)||[];
  return {tokens:words,lengths:words.map(gpLength)};
}

const original = parseSharedCorpus();
assert.equal(original.words.length,2896);
assert.equal(original.crossPageWords,32);
const orig=original.words.map(w=>w.length);
const originalChapters = original.words.map(w=>{
  const p=physicalLP2Page(w.startPage);
  return p<3?0:p<8?1:p<15?2:p<23?3:p<27?4:p<33?5:p<40?6:p<54?7:8;
});
const chapters=Array.from({length:9},()=>[]);
for(let i=0;i<orig.length;i++)chapters[originalChapters[i]].push(i);
assert(chapters.every(x=>x.length>0));

const sources=[
  ["gibran",tokenize(read("resources/control/gibran_prophet_58585.txt"))],
  ["emerson",tokenize(read("resources/control/emerson_essays_2944.txt"))],
  ["shakespeare",tokenize(read("resources/control/shakespeare_first300k.txt"))],
  ["vulgate",{
    tokens:null,
    lengths:read("resources/control/latin-vulgate-gp-wholewords.txt")
      .split(/\r?\n/).filter(line=>/^[0-9A-S]+$/.test(line)).map(s=>s.length)
  }],
  ["beowulf",{
    tokens:null,
    lengths:JSON.parse(read("resources/control/beowulf_oe_gp_profile_corrected.json"))
      .allSourceGpWordLengths
  }]
].map(([name, data])=>({name,...data}));
const totals=Object.fromEntries(sources.map(s=>[s.name,s.lengths.length]));
assert.deepEqual(totals,{gibran:15733,emerson:77932,shakespeare:55407,vulgate:39835,beowulf:10885});

function key(a,pos){return a.slice(pos,pos+SEED_LEN).join(",");}
const lookup=new Map();
sources.forEach((s,sourceIndex)=>{
  const lens=s.lengths;
  for(let j=0;j+SEED_LEN<=lens.length;j++){
    const k=key(lens,j);
    let v=lookup.get(k);
    if(!v){v=[];lookup.set(k,v);}
    v.push([sourceIndex,j]);
  }
});

function search(arr, track=false) {
  let best=0,hits=0;
  const leaders=[];
  for(let i=0;i+SEED_LEN<=arr.length;i++){
    const bound=originalChapters[i];
    if(originalChapters[i+SEED_LEN-1]!==bound)continue;
    const positions=lookup.get(key(arr,i));
    if(!positions)continue;
    for(const [sourceIndex,j] of positions) {
      hits++;
      const control=sources[sourceIndex].lengths;
      let left=0,right=SEED_LEN;
      while(i-left>0&&j-left>0&&originalChapters[i-left-1]===bound&&
            arr[i-left-1]===control[j-left-1])left++;
      while(i+right<arr.length&&j+right<control.length&&
            originalChapters[i+right]===bound&&
            arr[i+right]===control[j+right])right++;
      const total=left+right;
      if(total>=best && track){
        if(total>best)leaders.length=0;
        if(leaders.length<25)leaders.push({
          original_word_index:i-left,
          physical_page:physicalLP2Page(original.words[i-left].startPage),
          source:sources[sourceIndex].name,
          source_word_index:j-left,
          matching_word_lengths:total,
          original_lengths:arr.slice(i-left,i+right),
          matching_source_words:sources[sourceIndex].tokens?.slice(j-left,j+right).join(" ")||null
        });
      }
      if(total>best)best=total;
    }
  }
  return {best,seed_candidates:hits,leaders};
}

// Sanity: fully correct underlying source stream should match itself, including
// paragraph-independent source positions. Independent planted control.
const seeded=orig.slice();
const plantIndex=chapters[0][5];
const plantSourceStart=1234,plantN=22;
seeded.splice(plantIndex,plantN,...sources[0].lengths.slice(plantSourceStart,plantSourceStart+plantN));
const planted=search(seeded);
assert(planted.best>=plantN);
const actual=search(orig,true);
let state=0x33013381;
function random(){
  state^=state<<13;state^=state>>>17;state^=state<<5;
  return (state>>>0)/4294967296;
}
const nullLongest=[];
for(let rep=0;rep<N_SHUFFLES;rep++){
  const perm=orig.slice();
  for(const group of chapters){
    const sample=group.map(i=>perm[i]);
    for(let k=sample.length-1;k>0;k--){
      const j=Math.floor(random()*(k+1));
      [sample[k],sample[j]]=[sample[j],sample[k]];
    }
    group.forEach((idx,k)=>{perm[idx]=sample[k];});
  }
  nullLongest.push(search(perm).best);
}

const tail=nullLongest.filter(x=>x>=actual.best).length;
const histogram=Object.fromEntries([...new Set(nullLongest)].sort((a,b)=>a-b)
  .map(k=>[k,nullLongest.filter(n=>n===k).length]));
const out={
  contract:{
    originalRuneCount:12956,originalCompleteWords:orig.length,
    originalPageSpanningWords:32,nineOriginalChapterCounts:chapters.map(x=>x.length),
    exactSeedLength:SEED_LEN,sourceLens:totals,
    languageRegister:"Cicada GP text length with ING and GP two-letter runes; K->C, Q->CW, V->U, Z->S",
    boundaries:"Original printed word breaks preserved through line/page wraps; source passage contiguous in original forward reading order",
    search:"every 7-gram seed and exact maximal contiguous extension, chapters never crossed",
    null:"400 original-nine-chapter-length-histogram preserving word-order shuffles",
    seed:"0x33013381",
    positiveControl:"22 exact original-source Gibran GP word lengths planted in chapter 0"
  },
  original:actual,
  native_positive_control:{planted:plantN,best_match:planted.best},
  chapterwise_null:{
    replicates:N_SHUFFLES,ge_real:tail,oneSidedP:(tail+1)/(N_SHUFFLES+1),
    median:nullLongest.slice().sort((a,b)=>a-b)[N_SHUFFLES/2],
    min:Math.min(...nullLongest),max:Math.max(...nullLongest),
    histogram
  },
  unknownPlaintextRecovered:actual.best>=15? "CANDIDATE TEXT MATCH REQUIRES EXACT CIPHER TEST":"NONE"
};
console.log(JSON.stringify(out,null,2));
