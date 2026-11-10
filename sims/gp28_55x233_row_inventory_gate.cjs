"use strict";
/**
 * Exact 55x233 row-symbol-inventory invariant under arbitrary independent
 * per-row 28-way substitutions AND arbitrary 233-position row permutations.
 *
 * Source original: 55 physical IV glyphs plus 86 repeated glyph steps removed
 * leaves 12815 = 55*233 28-label nonzero step digits. For any row r,
 * row-symbol pair collision count is invariant under S_r ∈ Sym(28) and
 * π_r ∈ Sym(233), independently for EACH row.
 *
 * Exhaust every contiguous GP28 window of the checked-in author-control books.
 * Generate fully inverted, full-original-shape hidden-key positives.
 * Scoped original-input exclusion; no genuine LP2 plaintext recovered.
 *
 * Node 18+, CommonJS. Run: node sims/gp28_55x233_row_inventory_gate.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {toGematria}=require("./previous_cipher_sbox_invariant.cjs");
const root=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const pages=JSON.parse(read("resources/liber-primus/lp2-corpus.json"))
  .pages.filter(p=>p.page<=55&&p.indices.length);
assert.equal(pages.length,55);
const original=pages.flatMap(p=>p.indices),channel=[];
let repeats=0;
for(const p of pages)for(let i=1;i<p.indices.length;i++){
 const d=(p.indices[i]-p.indices[i-1]+29)%29;
 if(d===0)repeats++;else channel.push(d-1);
}
assert.equal(original.length,12956);
assert.equal(repeats,86);
assert.equal(channel.length,55*233);

const WIDTH=233,ROWS=55,POOL=ROWS*WIDTH*(WIDTH-1)/2;
assert.equal(POOL,1486540);
/**
 * Every unordered pair of equal labels within a 233-symbol row. Invariant
 * under independent row-specific rune relabeling and 233-place permutation.
 * @param {number[]} stream
 * @returns {number}
 */
function pooledRows(stream) {
 assert.equal(stream.length,ROWS*WIDTH);
 let hits=0;
 for(let r=0;r<ROWS;r++) {
  const cnt=new Uint16Array(28);
  for(let i=0;i<WIDTH;i++) {
   const x=stream[r*WIDTH+i];assert(x>=0&&x<28);
   hits+=cnt[x]++;
  }
 }
 return hits;
}

/**
 * Streaming collision inventory for every 233-symbol block of reference.
 * One-pass update counts pair collisions with each removed/added rune.
 * @param {number[]} source
 * @returns {Uint16Array}
 */
function everyBlock(source){
 const len=source.length-WIDTH+1;
 const inventory=new Uint16Array(len),cnt=new Uint16Array(28);
 let score=0;
 for(let j=0;j<WIDTH;j++){score+=cnt[source[j]];cnt[source[j]]++;}
 inventory[0]=score;
 for(let start=1;start<len;start++){
  const old=source[start-1],fresh=source[start+WIDTH-1];
  cnt[old]--;score-=cnt[old];score+=cnt[fresh];cnt[fresh]++;
  inventory[start]=score;
 }
 return inventory;
}

/**
 * Exhaust every original-sized literal GP28 reference passage, no subsamples.
 * @param {number[]} source
 */
function allSourceWindows(source){
 const len=channel.length,windows=source.length-len+1;
 assert(windows>=1);
 const every=everyBlock(source);
 let min=Infinity,max=-Infinity,minSourceOffset=-1,minTies=0;
 let atOrBelowOriginal=0;
 const obs=pooledRows(channel);
 for(let offset=0;offset<windows;offset++){
  let count=0;
  for(let r=0;r<ROWS;r++)count+=every[offset+r*WIDTH];
  if(count<min){min=count;minSourceOffset=offset;minTies=1}
  else if(count===min)minTies++;
  if(count>max)max=count;
  if(count<=obs)atOrBelowOriginal++;
 }
 return {windows,min,minRate:min/POOL,minSourceOffset,minTies,
  max,maxRate:max/POOL,atOrBelowOriginal};
}
const refs={
 Shakespeare:toGematria(read("resources/control/shakespeare_first300k.txt")).filter(x=>x!==28),
 Gibran:toGematria(read("resources/control/gibran_prophet_58585.txt")).filter(x=>x!==28)
};
assert.equal(refs.Shakespeare.length,217167);
assert.equal(refs.Gibran.length,62508);
/** @param {number} seed */
function random(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
/** @param {number[]} order @param {()=>number} next */
function shuffle(order,next){for(let i=order.length-1;i>0;i--){let j=next()%(i+1);[order[i],order[j]]=[order[j],order[i]]}}
/**
 * @param {number[]} text GP28 normalized source
 */
function plant(text){
 const rng=random(0x33015523);
 const plain=text.slice(1000,1000+channel.length);
 assert.equal(plain.length,12815);
 const masked=new Array(channel.length),table=[],positions=[];
 for(let r=0;r<ROWS;r++){
  const label=Array.from({length:28},(_,i)=>i);
  const order=Array.from({length:WIDTH},(_,i)=>i);
  shuffle(label,rng);shuffle(order,rng);
  for(let j=0;j<WIDTH;j++)masked[r*WIDTH+j]=label[plain[r*WIDTH+order[j]]];
  table.push(label);positions.push(order);
 }
 assert.equal(pooledRows(masked),pooledRows(plain));
 const printed=[],startC=[];
 let clock=0;
 for(const page of pages){
  let previous=(page.page*7+3)%29;
  const chars=[previous];
  for(let i=1;i<page.indices.length;i++){
   if(page.indices[i]!==page.indices[i-1]){
    previous=(previous+masked[clock++]+1)%29;
   }
   chars.push(previous);
  }
  printed.push(chars);
 }
 assert.equal(clock,channel.length);
 assert.equal(printed.reduce((n,a)=>n+a.length,0),12956);
 let markerCount=0;
 const remasked=[];
 for(let p=0;p<pages.length;p++){
  const x=printed[p],sourcePage=pages[p].indices;
  for(let j=1;j<x.length;j++){
   const d=(x[j]-x[j-1]+29)%29;
   if(sourcePage[j]===sourcePage[j-1]){assert.equal(d,0);markerCount++}
   else{assert(d>0);remasked.push(d-1)}
  }
 }
 assert.equal(markerCount,86);assert.deepEqual(remasked,masked);
 const decoded=new Array(channel.length);
 for(let r=0;r<ROWS;r++){
  const inverse=new Array(28);
  for(let j=0;j<28;j++)inverse[table[r][j]]=j;
  for(let j=0;j<WIDTH;j++)
   decoded[r*WIDTH+positions[r][j]]=inverse[remasked[r*WIDTH+j]];
 }
 assert.deepEqual(decoded,plain);
 return {sourceGP28:plain.length,independentSecretRowSubstitutions:55,
  independentSecretRowPermutations:55,
  reconstructedOriginalSourceShape:12956,
  exactLiteralMarkerSites:markerCount,
  decodedSourceSymbols:decoded.length,
  invariantHits:pooledRows(remasked)};
}
function main(){
 const originalHits=pooledRows(channel),source={};
 for(const [name,text] of Object.entries(refs))
  source[name]={sourceGP28:text.length,...allSourceWindows(text),
    fullyInvertedNativePlant:plant(text)};
 assert.equal(originalHits,53310);
 assert(source.Shakespeare.min>originalHits&&source.Gibran.min>originalHits);
 return {status:"Key-invariant 55x233 row alphabet AND row transposition finite source exclusion",
  original:{runes:original.length,pageIVs:55,adjacentRepeatMarkers:86,
    GP28Steps:channel.length,rows:ROWS,columns:WIDTH,
    unorderedSymbolPairsAcrossRows:POOL,equalSymbolPairs:originalHits,
    withinRowIndexOfCoincidence:originalHits/POOL},
  source,claim:"No 12,815-GP28-rune literal source window from these two references reproduces the original under ANY 55 independent row substitutions and row permutations.",
  limitation:"Conditional on physical-IV and doublet omission and literal GP28 source windows laid row-major. Does not cover row mixing, symbol-position-dependent substitutions, unrecognized binary or non-GP plaintext, source editing, author-original text, or keyed state evolving inside a row."};
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+"\n");
module.exports={pooledRows,everyBlock,allSourceWindows,plant,main};
