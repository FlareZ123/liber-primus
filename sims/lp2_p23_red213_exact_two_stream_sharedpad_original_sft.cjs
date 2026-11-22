'use strict';
/**
 * Exact key-free overlap obstruction for TWO independently source-defined
 * 213-GP29-rune channels: physical p23 entire page, all red ink runes on
 * unsolved pp0–55. Original source complete-word boundaries preserved.
 *
 * Hypothesis: the two *ciphertexts* were produced using one arbitrary
 * position-wise GP29 additive pad, either same or opposite sign.
 * Then original C0-C1=P0-P1 or C0+C1=P0+P1, with an unknown pad eliminated.
 *
 * Every original pair of overlapping complete printed words must have
 * at least one English-GP29 dictionary pair satisfying the exact relation.
 * A SINGLE impossible pair excludes the whole-page two-English-stream
 * shared pad, even with 29 free pad values at every position.
 *
 * Windows Node22 CJS, no dependencies/no writes. Original-source SFT.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
/** @param {string} file */
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const c=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const runeIndex=new Map(c.runes.map((r,i)=>[r,i]));
const letters=c.translit.map((text,i)=>({text,i}))
  .sort((x,y)=>y.text.length-x.text.length);
/** @param {string} w */
function gp(w){
  const text=w.toUpperCase().replace(/[KVZQ]/g,ch=>
    ({K:'C',V:'U',Z:'S',Q:'C'})[ch]);
  const r=[];
  for(let i=0;i<text.length;){
    const t=letters.find(v=>text.startsWith(v.text,i));
    if(t){r.push(t.i);i+=t.text.length;} else i++;
  }
  return r;
}
const dictionary=new Map();
let rows=0;
for(const line of read('resources/control/english_wordfreq_textblob.txt').split('\n')){
  const m=/^([a-z]+) (\d+)$/.exec(line.trim());
  if(!m)continue;
  rows++;
  const tokens=gp(m[1]);
  if(!dictionary.has(tokens.length))dictionary.set(tokens.length,new Map());
  dictionary.get(tokens.length).set(tokens.join(','),tokens);
}
assert.equal(rows,29157);
const allWords=Array.from(dictionary.values()).reduce((n,m)=>n+m.size,0);
assert.equal(allWords,29061);
const options=new Map([...dictionary].map(([length,words])=>
  [length,[...words.values()]]));

/* Give every runic symbol in the authoritative transcription its true
 * printed-word id; '/', page-boundary and newline are not delimiters. */
const symbols=[],ids=[];
let wordId=0;
for(const char of read('resources/liber-primus/lp2-transcription.txt')){
  if(runeIndex.has(char)){symbols.push(runeIndex.get(char));ids.push(wordId);}
  else if(char==='-'||char==='.')wordId++;
}
const original=c.pages.slice(0,56).flatMap(p=>p.indices);
assert.equal(original.length,12956);
assert.deepEqual(symbols.slice(0,original.length),original);
const offsets=[0];
for(const page of c.pages)offsets.push(offsets.at(-1)+page.indices.length);
const p23=c.pages[23].indices;
assert.equal(p23.length,213);
const aGlobal=Array.from({length:213},(_,i)=>offsets[23]+i);
const bGlobal=c.pages.slice(0,56).flatMap(page=>
  (ink.pages.find(p=>p.page===page.page)?.red_spans||[])
  .flatMap(span=>{
    const positions=Array.from({length:span.length},(_,j)=>
      offsets[page.page]+span.start+j);
    assert.deepEqual(
      positions.map(pos=>c.runes[original[pos]]).join(''),span.runes);
    return positions;
  }));
assert.equal(bGlobal.length,213);
const red=bGlobal.map(pos=>original[pos]);

/**
 * Retain original complete printed words inside one entire channel,
 * with original index and exact original word IDs. No boundary inventions.
 * @param {number[]} chosen
 */
function complete(chosen){
  const words=[];
  for(let i=0;i<chosen.length;){
    const id=ids[chosen[i]],start=i;
    while(i+1<chosen.length && ids[chosen[i+1]]===id)i++;
    const end=i;
    if(ids.indexOf(id)===chosen[start] &&
      ids.lastIndexOf(id)===chosen[end]){
      words.push({start,length:end-start+1,sourceId:id});
    }
    i++;
  }
  return words;
}
const first=complete(aGlobal),second=complete(bGlobal);
assert.equal(first.length,45);
assert.equal(second.length,50);
assert.equal(first.reduce((a,w)=>a+w.length,0),209); // p23 has four edge-crossing page fragments
assert.equal(second.reduce((a,w)=>a+w.length,0),213);
const overlaps=[];
for(const a of first)for(const b of second){
  const begin=Math.max(a.start,b.start);
  const end=Math.min(a.start+a.length,b.start+b.length);
  if(begin<end)overlaps.push({a,b,begin,end});
}
assert.equal(overlaps.length,83);
assert.equal(overlaps.filter(x=>x.end-x.begin>=2).length,59);
assert.equal(Math.max(...overlaps.map(x=>x.end-x.begin)),8);
const mod=x=>(x%29+29)%29;
/**
 * Exact existence of two native GP29 words of these source word lengths
 * under one shared pad (unknown and eliminated), for specified sign.
 * @param {number[]} ca @param {number[]} cb
 * @param {{a:{start:number,length:number},b:{start:number,length:number},begin:number,end:number}} overlap
 * @param {'same'|'opposite'} sign
 */
function compatible(ca,cb,overlap,sign){
  const {a,b,begin,end}=overlap;
  const wordsA=options.get(a.length)||[],wordsB=options.get(b.length)||[];
  const bProjection=new Set();
  for(const w of wordsB)
    bProjection.add(w.slice(begin-b.start,end-b.start).join(','));
  const needed=Array(end-begin);
  for(const w of wordsA){
    for(let pos=begin;pos<end;pos++){
      const val=mod(ca[pos]+(sign==='same'?-cb[pos]:cb[pos]));
      needed[pos-begin]=sign==='same'
        ?mod(w[pos-a.start]-val):mod(val-w[pos-a.start]);
    }
    if(bProjection.has(needed.join(',')))return true;
  }
  return false;
}
/** @param {number[]} ca @param {number[]} cb */
function count(ca,cb){
  const outcomes={};
  for(const sign of ['same','opposite']){
    const misses=overlaps.filter(o=>!compatible(ca,cb,o,sign));
    outcomes[sign]={
      impossibleWordPairs:misses.length,
      firstMissing:misses.length ? {
        sourceP23WordId:misses[0].a.sourceId,
        sourceRedWordId:misses[0].b.sourceId,
        p23Length:misses[0].a.length,
        redLength:misses[0].b.length,
        overlap:[misses[0].begin,misses[0].end],
        overlapRunes:misses[0].end-misses[0].begin
      }:null,
      worstOverlap:Math.max(0,...misses.map(x=>x.end-x.begin))
    };
  }
  return outcomes;
}
const tested=count(p23,red);
assert.ok(tested.same.impossibleWordPairs>=1);
assert.ok(tested.opposite.impossibleWordPairs>=1);

/* Matched pad control with independently selected real dictionary GP
 * words placed at every true original word interval, exactly preserving
 * original printed source boundaries and no fitted original ciphertext. */
let state=0x33011234;
function rand(n){state=(Math.imul(state,1664525)+1013904223)>>>0;return state%n;}
/** @param {{start:number,length:number}[]} layout */
function plantedPlain(layout){
  const v=Array(213).fill(0);
  for(const w of layout){
    const candidates=options.get(w.length);
    assert.ok(candidates?.length);
    const chosen=candidates[rand(candidates.length)];
    v.splice(w.start,w.length,...chosen);
  }
  return v;
}
const pa=plantedPlain(first),pb=plantedPlain(second);
assert.equal(pa.length,213);
assert.equal(pb.length,213);
const key=Array.from({length:213},()=>rand(29));
const wrong=Array.from({length:213},()=>rand(29));
const matchedSame=count(pa.map((x,i)=>mod(x+key[i])),
  pb.map((x,i)=>mod(x+key[i])));
const matchedOpposite=count(pa.map((x,i)=>mod(x+key[i])),
  pb.map((x,i)=>mod(x-key[i])));
const mismatched=count(pa.map((x,i)=>mod(x+key[i])),
  pb.map((x,i)=>mod(x+wrong[i])));
assert.equal(matchedSame.same.impossibleWordPairs,0);
assert.equal(matchedOpposite.opposite.impossibleWordPairs,0);
assert.ok(mismatched.same.impossibleWordPairs>0);
console.log(JSON.stringify({
  name:'Entire original p23 cipher213 vs all original unsolved red rune213',
  original:{p23Runes:p23.length,redRunes:red.length,
    p23CompleteWords:first.length,redCompleteWords:second.length,
    originalCompleteWordRuneCoverage:[209,213],
    overlappingWordPairs:overlaps.length,
    overlapsAtLeast2:overlaps.filter(x=>x.end-x.begin>=2).length,
    greatestOverlap:8},
  lexicon:{rows,distinctGpWords:allWords},
  model:'One arbitrary secret GP29 additive key at every aligned original glyph; both signs, original word boundaries. Exact local lexicon-pair incompatibility.',
  originalResults:tested,
  nativeMatchedPadControls:{same:matchedSame.same,
    opposite:matchedOpposite.opposite},
  independentPadNegativeControl:mismatched.same,
  conclusion:'Both 213-rune source channels cannot be complete native-dictionary GP29 prose under one position-wise shared additive pad. The GF257 source-syndrome coincidences remain algebraic only.'
},null,2));
