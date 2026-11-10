'use strict';
/**
 * Key-independent known-plaintext fingerprint for a proposed LP2 cipher in
 * which C[i] === C[i-1] iff the hidden GP plaintext token is EA (index 28).
 * Test exact contiguous excerpts from five independent stored source corpora.
 * Run from the repository root: node sims/ea_marker_source_fingerprint.cjs
 * This is a conditional attack; repeats have not been authenticated as EA.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const GP = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X',
  'S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
const RUNES = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const gpMap = new Map(GP.map((s,i)=>[s,i]));
const runeMap = new Map(RUNES.map((s,i)=>[s,i]));

/** @param {string} text Latin spelling with source word boundaries. */
function encode(text) {
  const out=[];
  for(let word of text.toUpperCase().match(/[A-Z]+/g)||[]) {
    word=word.replace(/QU/g,'CW').replace(/[QK]/g,'C')
      .replace(/V/g,'U').replace(/Z/g,'S');
    for(let i=0;i<word.length;) {
      const pair=gpMap.get(word.slice(i,i+2));
      if(pair!==undefined){out.push(pair);i+=2;}
      else {const val=gpMap.get(word[i]);assert.notEqual(val,undefined);
        out.push(val);i++;}
    }
  }
  return out;
}
/** @param {number[]} a Rune indices. */
function repeated(a) {
  const out=[];for(let i=1;i<a.length;i++)if(a[i]===a[i-1])out.push(i);
  return out;
}
/** @param {number[]} a GP rune indices. */
function ea(a) {
  const out=[];for(let i=0;i<a.length;i++)if(a[i]===28)out.push(i);
  return out;
}
/** @param {string} name @param {number[]} arr */
function source(name,arr) {
  const prefix=new Uint32Array(arr.length+1);
  for(let i=0;i<arr.length;i++)prefix[i+1]=prefix[i]+Number(arr[i]===28);
  return {name,arr,sites:ea(arr),prefix};
}
/**
 * Exact sparse EA-position cross-correlation over every valid offset.
 * @param {number[]} sites original ciphertext duplicate positions
 * @param {number} length original cipher-section rune count
 * @param {ReturnType<typeof source>} src independent candidate GP text
 */
function scan(sites,length,src,full=true) {
  if(src.arr.length<length)return null;
  const tally=new Uint8Array(src.arr.length-length+1);
  let best=0,bestOffset=0;
  for(const i of sites)for(const j of src.sites) {
    const o=j-i;
    if(o>=0&&o<tally.length) {
      const count=++tally[o];
      if(count>best){best=count;bestOffset=o;}
    }
  }
  if(!full)return {best};
  let mismatch=Infinity,mismatchOffset=-1,mismatchHits=-1;
  for(let o=0;o<tally.length;o++){
    const count=src.prefix[o+length]-src.prefix[o];
    const d=sites.length+count-2*tally[o];
    if(d<mismatch){mismatch=d;mismatchOffset=o;mismatchHits=tally[o];}
  }
  return {best,bestOffset,sourceEAAtBest:src.prefix[bestOffset+length]-src.prefix[bestOffset],
    minMarkerMismatch:mismatch,minMismatchOffset:mismatchOffset,
    minMismatchShared:mismatchHits};
}
/** Deterministic pseudo-random generator for matched controls. */
function rng(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}
function shuffled(n,k,random){
  const set=new Set();while(set.size<k)set.add(random()%n);
  return [...set];
}
/**
 * True-key positive: exactly reversible exclusion-rank GP-EA transducer.
 * The first original rune in each section is the transmitted IV.
 * @param {number[]} plain GP runes
 * @param {number} section key salt
 */
function plant(plain,section) {
  const cipher=new Array(plain.length);
  cipher[0]=(section*3+1)%29;
  for(let i=1;i<plain.length;i++){
    const key=(i*11+section*7)%28;
    cipher[i]=plain[i]===28?cipher[i-1]:
      (cipher[i-1]+1+(plain[i]+key)%28)%29;
    const decoded=cipher[i]===cipher[i-1]?28:
      ((cipher[i]-cipher[i-1]-1+29)%29-key+28)%28;
    assert.equal(decoded,plain[i]);
  }
  return cipher;
}

function run() {
  const sections=read('resources/lp2-transcription.txt').split('$')
    .map(s=>[...s].filter(c=>runeMap.has(c)).map(c=>runeMap.get(c)))
    .filter(a=>a.length).slice(0,8);
  const lens=[729,1145,1738,1894,1021,1433,1680,3316];
  assert.deepEqual(sections.map(a=>a.length),lens);
  const sites=sections.map(repeated);
  assert.deepEqual(sites.map(s=>s.length),[4,6,9,10,11,13,12,21]);
  assert.equal(sites.flat().length,86);
  const srcPaths=[
    'resources/control/shakespeare_first300k.txt',
    'resources/control/gibran_prophet_58585.txt',
    'resources/control/emerson_essays_2944.txt',
    'resources/liber-primus/lp1-plaintext-reference.txt'
  ];
  const sources=srcPaths.map(p=>{
    let txt=read(p);
    if(p.includes('lp1-plaintext-reference'))
      txt=txt.split(/\r?\n/).filter(x=>!/^\s*(#|\[)/.test(x)).join(' ');
    return source(path.basename(p),encode(txt));
  });
  sources.push(source('latin-vulgate-heldout-gp',
    JSON.parse(read('resources/control/latin-vulgate-heldout-gp.json')).runes));

  const rows=[];
  for(let section=0;section<8;section++)for(const src of sources){
    const result=scan(sites[section],lens[section],src);
    if(result)rows.push({section,source:src.name,sectionRunes:lens[section],
      originalMarkers:sites[section].length,...result});
  }
  rows.sort((a,b)=>b.best-a.best||a.minMarkerMismatch-b.minMarkerMismatch);
  const observed=rows[0].best;
  const random=rng(0x41ea3301), counts=new Map();
  let equalsOrExceeds=0;
  const trials=300;
  for(let trial=0;trial<trials;trial++){
    let maximum=0;
    for(let i=0;i<8;i++){
      const candidate=shuffled(lens[i],sites[i].length,random);
      for(const src of sources){
        const ans=scan(candidate,lens[i],src,false);
        if(ans&&ans.best>maximum)maximum=ans.best;
      }
    }
    counts.set(maximum,(counts.get(maximum)||0)+1);
    if(maximum>=observed)equalsOrExceeds++;
  }

  const controls=[];
  let decoded=0;
  for(let i=0;i<8;i++){
    let offset=3000+19000*i;
    while(sources[0].arr[offset]===28)offset++;
    const plain=sources[0].arr.slice(offset,offset+lens[i]);
    const marked=repeated(plant(plain,i));
    const test=scan(marked,lens[i],sources[0]);
    assert.equal(test.best,marked.length);
    assert.equal(test.minMarkerMismatch,0);
    decoded+=plain.length-1;
    controls.push({section:i,sourceStart:offset,transparentEAs:marked.length,
      allEARecovered:true,sourceWindowFound:true});
  }
  const result={
    classification:'Conditional EA-marker source attack; no original plaintext recovered',
    sourceLengths:sources.map(s=>({name:s.name,GPtokens:s.arr.length,EA:s.sites.length})),
    original:{sections:lens,markers:sites.map(s=>s.length),
      maximumMatchAcrossAllSourcesAndSections:observed,
      topAlignments:rows.slice(0,10),
      bestHammingBySection:lens.map((_,i)=>{
        const row=rows.filter(x=>x.section===i)
          .sort((a,b)=>a.minMarkerMismatch-b.minMarkerMismatch)[0];
        return {section:i,source:row.source,
          mismatchedMarkerSites:row.minMarkerMismatch};
      })},
    matchedNull:{seed:'0x41ea3301',trials,matchedSectionsAndEventCounts:true,
      maxima:Object.fromEntries([...counts].sort((a,b)=>a[0]-b[0])),
      equalsOrExceeds,addOneUpperTail:(equalsOrExceeds+1)/(trials+1)},
    trueKeyPlantedPositive:{exactlyRecoveredNonIVSymbols:decoded,controls},
    scope:'Only exact contiguous GP-tokenized excerpts in these five finite sources; different text, changed spelling, edits, transformed runes, or different marker semantics remain open.'
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)run();
module.exports={encode,repeated,ea,source,scan,plant,run};
