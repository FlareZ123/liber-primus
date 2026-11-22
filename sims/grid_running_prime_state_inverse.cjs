"use strict";
/**
 * Source-fixed, causal GP-prime-state/256-grid rank cipher.
 *
 * Key state q is the sum of published ciphertext glyph GP prime values
 * modulo 32 since an independently declared reset. The output key byte is
 * the original grid[q+phase mod 32][column], with column either the eight
 * printed text sections or the uninterrupted rune clock modulo eight.
 *
 * Every non-EA plaintext rune is encrypted via a 28-choice predecessor-
 * excluding rank; GP EA (28) repeats the previous printed glyph. The first
 * rune of each physical page is passed through as a known initial state.
 * The whole construction is reversible without plaintext feedback.
 *
 * This finite exact-original test searches only public source-defined modes
 * (4 resets x 2 column clocks x 2 byte mappings x 2 signs x 2 rank
 * conventions x 32 phases = 2048) and selects train IoC on p0..27,
 * with untouched p28..55 IoC. English-GP planted controls and roundtrips
 * distinguish a working inverse from a chance selected statistic.
 *
 * Run: node sims/grid_running_prime_state_inverse.cjs
 * Node 22 CommonJS, no third-party packages, no files written.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const GP = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const GRID = JSON.parse(read("resources/liber-primus/base60-grid.json")).byte_rows;
const TEXT = read("resources/lp2-transcription.txt").split("%").slice(0, 55).join("%");
const BY_RUNE = new Map(GP.runes.map((x, i) => [x, i]));
assert.equal(GRID.length, 32);
assert.ok(GRID.every(row => row.length === 8 &&
  row.every(value => Number.isInteger(value) && value >= 0 && value < 256)));

/**
 * Parse canonical words: % and / and whitespace preserve an open word.
 * @returns {{glyph:number,page:number,section:number,word:number}[]}
 */
function originalRows() {
  const out = [];
  let page=0, section=0, word=0, inWord=false;
  for (const ch of TEXT) {
    const glyph = BY_RUNE.get(ch);
    if (glyph !== undefined) {
      out.push({glyph,page:page >= 50 ? page + 1 : page,section,word});
      inWord=true;
    } else if(ch === "%") {
      page++;
    } else if(ch === "$") {
      if(inWord){word++;inWord=false;}
      section++;
    } else if(ch === "/" || /\s/u.test(ch)) {
      // Printed line or page wraps do not delimit words.
    } else if(inWord) {
      word++;
      inWord=false;
    }
  }
  if(inWord) word++;
  assert.equal(out.length, 12956);
  assert.equal(word, 2896);
  assert.equal(section, 8);
  assert.deepEqual(out.map(x => x.glyph), GP.pages.filter(p =>
    p.page < 56 && p.indices.length).flatMap(p => p.indices));
  return out;
}
const ORIGINAL = originalRows();
const MODES=[];
for(const reset of ["book","page","section","word"])
for(const column of ["section","rune-clock"])
for(const mapping of ["mod28","scaled28"])
for(const sign of [-1,1])
for(const rank of ["cyclic","sorted"])
for(let phase=0;phase<32;phase++)
  MODES.push({reset,column,mapping,sign,rank,phase});
assert.equal(MODES.length,2048);
const mod=(value,modulus)=>((value%modulus)+modulus)%modulus;

/** @param {typeof MODES[number]} mode */
function key(mode,position,state) {
  const q=mod(state+mode.phase,32);
  const col=mode.column==="section"?ORIGINAL[position].section:position%8;
  const byte=GRID[q][col];
  return mode.mapping==="mod28"?byte%28:Math.floor(byte*28/256);
}
/** @param {typeof MODES[number]} mode @param {number} position */
function resetKey(mode,position) {
  const row=ORIGINAL[position];
  return mode.reset==="book"?0:row[mode.reset];
}
/**
 * A ciphertext -> plaintext inverse; mode is public and frozen.
 * @param {number[]} ciphertext
 * @param {typeof MODES[number]} mode
 */
function decrypt(ciphertext,mode) {
  assert.equal(ciphertext.length,ORIGINAL.length);
  const out=new Array(ciphertext.length);
  let state=0,group=-1,previous=-1,previousPage=-1;
  for(let i=0;i<ciphertext.length;i++) {
    const item=ORIGINAL[i],current=ciphertext[i],g=resetKey(mode,i);
    if(g!==group){state=0;group=g;}
    if(item.page!==previousPage)previous=-1;
    if(previous<0)out[i]=current;
    else if(current===previous)out[i]=28;
    else {
      const r=mode.rank==="cyclic"?mod(current-previous-1,29):
        current-Number(current>previous);
      out[i]=mod(r-mode.sign*key(mode,i,state),28);
    }
    previous=current;previousPage=item.page;
    state=(state+GP.prime[current])%32;
  }
  return out;
}
/**
 * A plaintext -> ciphertext forward encoder, strictly causal.
 * @param {number[]} plaintext
 * @param {typeof MODES[number]} mode
 */
function encrypt(plaintext,mode) {
  assert.equal(plaintext.length,ORIGINAL.length);
  const result=new Array(plaintext.length);
  let state=0,group=-1,previous=-1,previousPage=-1;
  for(let i=0;i<plaintext.length;i++) {
    const item=ORIGINAL[i],value=plaintext[i],g=resetKey(mode,i);
    if(g!==group){state=0;group=g;}
    if(item.page!==previousPage)previous=-1;
    let current;
    if(previous<0)current=value;
    else if(value===28)current=previous;
    else {
      const r=mod(value+mode.sign*key(mode,i,state),28);
      current=mode.rank==="cyclic"?(previous+r+1)%29:
        r+Number(r>=previous);
    }
    result[i]=current;
    previous=current;previousPage=item.page;
    state=(state+GP.prime[current])%32;
  }
  return result;
}
/** @param {number[]} values */
function ioc(values) {
  const count=new Uint32Array(28);
  for(const x of values)if(x>=0&&x<28)count[x]++;
  const n=count.reduce((s,x)=>s+x,0);
  return count.reduce((s,x)=>s+x*(x-1),0)/(n*(n-1));
}
/** @param {number[]} ciphertext @param {typeof MODES[number]} mode */
function quality(ciphertext,mode) {
  const freq=[new Uint32Array(28),new Uint32Array(28)];
  const n=[0,0];
  let state=0,group=-1,previous=-1,previousPage=-1;
  for(let i=0;i<ciphertext.length;i++) {
    const item=ORIGINAL[i],current=ciphertext[i],g=resetKey(mode,i);
    if(g!==group){state=0;group=g;}
    if(item.page!==previousPage)previous=-1;
    if(previous>=0&&current!==previous) {
      const rank=mode.rank==="cyclic"?mod(current-previous-1,29):
        current-Number(current>previous);
      const value=mod(rank-mode.sign*key(mode,i,state),28);
      const half=item.page<28?0:1;
      freq[half][value]++;n[half]++;
    }
    previous=current;previousPage=item.page;
    state=(state+GP.prime[current])%32;
  }
  return [0,1].map(h=>freq[h].reduce((s,x)=>s+x*(x-1),0)/
    (n[h]*(n[h]-1)));
}
/** @param {number[]} ciphertext */
function scan(ciphertext) {
  const rows=MODES.map(mode=>{
    const [train,heldout]=quality(ciphertext,mode);
    return {...mode,train,heldout};
  }).sort((a,b)=>b.train-a.train);
  return {winningTraining:rows[0],
    strongestHeldoutAfterSelection:[...rows].sort((a,b)=>b.heldout-a.heldout)[0],
    topTraining:rows.slice(0,5)};
}
/** @param {string} source */
function encode(source) {
  const tokens=GP.translit.map((t,i)=>({t,i}))
    .sort((a,b)=>b.t.length-a.t.length);
  const out=[];
  for(let word of source.toUpperCase().match(/[A-Z]+/g)||[]){
    word=word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
    const buffer=[];
    for(let i=0;i<word.length;){
      const entry=tokens.find(t=>word.startsWith(t.t,i));
      if(!entry){buffer.length=0;break;}
      buffer.push(entry.i);
      i+=entry.t.length;
    }
    out.push(...buffer);
  }
  return out;
}
function run(){
  const original=ORIGINAL.map(x=>x.glyph);
  const source=encode(read("resources/control/shakespeare_first300k.txt"));
  assert.ok(source.length>=original.length);
  const plaintext=source.slice(0,original.length);
  const trueMode={reset:"section",column:"section",mapping:"mod28",
    sign:1,rank:"cyclic",phase:15};
  const plant=encrypt(plaintext,trueMode);
  const restored=decrypt(plant,trueMode);
  assert.deepEqual(restored,plaintext);
  assert.deepEqual(encrypt(restored,trueMode),plant);
  const plantedScan=scan(plant),originalScan=scan(original);
  const observed=decrypt(original,originalScan.winningTraining);
  assert.deepEqual(encrypt(observed,originalScan.winningTraining),original);
  const controlScore=quality(plant,trueMode);
  assert.ok(controlScore[0]>0.05&&controlScore[1]>0.05,
    "Source-native plant must exhibit plaintext concentration");
  assert.ok(originalScan.winningTraining.heldout<0.04,
    "No genuine heldout original IoC above 0.04; investigate if failure");
  return {
    family:"causal GP-prime-running-sum grid state in a reversible 28-rank GP codec",
    hypotheses:MODES.length,
    source:"original 32x8 base60 grid; original 12,956 GP cipher runes",
    original:{
      exactRoundtrip:original.length,
      ...originalScan
    },
    positive:{
      intended:trueMode,
      exactRecovered:restored.filter((x,i)=>x===plaintext[i]).length,
      count:plaintext.length,
      trueModeSourceIoC:controlScore,
      selected:plantedScan.winningTraining,
      selectedIntendedKey:JSON.stringify(plantedScan.winningTraining,
        Object.keys(trueMode))===JSON.stringify(trueMode)
    },
    conclusion:"No original GP-English decipherment. This new nonperiodic source-key family stays near the uniform-28 heldout baseline."
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={decrypt,encrypt,quality,scan,run};
