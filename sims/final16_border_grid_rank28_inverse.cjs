'use strict';
/**
 * Source-locked alternative to the previously tested final-16 AES128 direct GP
 * model: decode physical LP2 pages 40..55 using 16 source-grid 16-byte keys,
 * a predecessor-exclusion GP28 plaintext rank and explicit repeat marker 28.
 * Include both original table transcription editions and documented base59/60 readings.
 * This is a hypothesis, not the identified historical cipher.
 * Run: node sims/final16_border_grid_rank28_inverse.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {readSquare, clockwiseSpiral} = require('./fibonacci_prime_spiral.cjs');
const {encode} = require('./grid_keyskip_viterbi.cjs');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const alternateGrid = require('../resources/liber-primus/base60-grid.json');
const pages = corpus.pages.filter(p => p.page >= 40 && p.page <= 55);
const lengths = pages.map(p => p.indices.length);
const original = pages.flatMap(p => p.indices);
assert.equal(pages.length, 16);
assert.equal(lengths[10], 0);
assert.equal(original.length, 3316);
assert.equal(grid.bytes.length, 256);
const mod = (n, q) => (n % q + q) % q;
const sourceSquare = readSquare();
const rowNumbers = sourceSquare.flat();
const spiralNumbers = clockwiseSpiral().map(([r,c]) => sourceSquare[r][c]);
assert.equal(rowNumbers.length, 16);
assert.equal(spiralNumbers.length, 16);
const originalAlphabet = alternateGrid.alphabet;
const radix59Alphabet = originalAlphabet.replace('f','');
assert.equal(originalAlphabet.length,60);
assert.equal(radix59Alphabet.length,59);
const correctedTokens = grid.pages.flatMap(p=>p.tokens);
const alternateTokens = alternateGrid.rows.flat();
const decodeTokens = (tokens,alphabet) => {
  assert.equal(tokens.length,256);
  const values = tokens.map(token => {
    assert.equal(token.length,2);
    const a=alphabet.indexOf(token[0]),b=alphabet.indexOf(token[1]);
    assert.ok(a>=0&&b>=0);
    const value=alphabet.length*a+b;
    assert.ok(value>=0&&value<=255);
    return value;
  });
  return Buffer.from(values);
};
const tableVariants = {
  'corrected-base60': Buffer.from(grid.bytes),
  'alternate-base60': Buffer.from(alternateGrid.byte_rows.flat()),
  'corrected-base59': decodeTokens(correctedTokens,radix59Alphabet),
  'alternate-base59': decodeTokens(alternateTokens,radix59Alphabet)
};
assert.deepEqual(tableVariants['corrected-base60'],decodeTokens(correctedTokens,originalAlphabet));
assert.deepEqual(tableVariants['alternate-base60'],decodeTokens(alternateTokens,originalAlphabet));
const layouts={};
for(const [variant,data] of Object.entries(tableVariants)) {
  const transposed=Buffer.from(Array.from({length:8},(_,c) =>
    Array.from({length:32},(_,r)=>data[8*r+c])).flat());
  layouts[variant+'-row-major']=Array.from({length:16},(_,i)=>data.subarray(i*16,i*16+16));
  layouts[variant+'-column-major']=Array.from({length:16},(_,i)=>transposed.subarray(i*16,i*16+16));
}
const sourceIv = v => {
  const b = Buffer.alloc(16);
  b.writeUInt16BE(v,0);
  return b;
};
const ivs = {
  zero: Array.from({length:16},()=>Buffer.alloc(16)),
  'square-row': rowNumbers.map(sourceIv),
  'square-spiral': spiralNumbers.map(sourceIv),
  'prime-row': rowNumbers.map(x => sourceIv(Math.abs(3301-x))),
  'prime-spiral': spiralNumbers.map(x => sourceIv(Math.abs(3301-x)))
};
/** @param {Buffer} key @param {Buffer} iv @param {number} count */
function aesPad(key,iv,count) {
  const cipher = crypto.createCipheriv('aes-128-ctr',key,iv);
  return Buffer.concat([cipher.update(Buffer.alloc(count)),cipher.final()]);
}
const modes = [];
for (const [layout,keys] of Object.entries(layouts))
  for (const [ivName,vectors] of Object.entries(ivs))
    for (const rankOrder of ['cyclic','sorted'])
      for (const reducer of ['mod','scaled'])
        for (const sign of [-1,1])
          for (const advanceMarker of [false,true]) {
            const pads = keys.map((key,i)=>aesPad(key,vectors[i],lengths[i]));
            modes.push({layout,ivName,rankOrder,reducer,sign,advanceMarker,pads});
          }
assert.equal(modes.length, 640);
function digit(pad,at,base,reducer) {
  const b = pad[at];
  assert.notEqual(b,undefined);
  return reducer==='scaled' ? Math.floor(base*b/256) : b%base;
}
function glyphToRank(c,prev,order) {
  assert.notEqual(c,prev);
  return order==='cyclic' ? mod(c-prev-1,29) : (c<prev?c:c-1);
}
function rankToGlyph(rank,prev,order) {
  assert.ok(rank>=0&&rank<28);
  return order==='cyclic' ? mod(prev+1+rank,29) : (rank<prev?rank:rank+1);
}
/**
 * direction=+1 decodes source cipher, -1 re-encodes plaintext.
 * Marker 28 on noninitial plaintext positions has a unique ciphertext repeat.
 * The first rune of every physical page uses a direct GP29 map.
 * @param {number[]} input
 * @param {typeof modes[number]} mode
 * @param {number} direction
 */
function transform(input,mode,direction) {
  assert.equal(input.length,original.length);
  const output=[];
  let pos=0;
  for (let page=0;page<pages.length;page++) {
    const pad=mode.pads[page];
    const n=lengths[page];
    let clock=0, previousCipher=-1;
    for (let j=0;j<n;j++) {
      const value=input[pos++];
      if (j===0) {
        const shift=digit(pad,clock++,29,mode.reducer);
        const converted=mod(value-direction*mode.sign*shift,29);
        output.push(converted);
        previousCipher=direction===1?value:converted;
      } else if (direction===1) {
        if (value===previousCipher) {
          output.push(28);
          if (mode.advanceMarker) clock++;
        } else {
          const rank=glyphToRank(value,previousCipher,mode.rankOrder);
          output.push(mod(rank-mode.sign*digit(pad,clock++,28,mode.reducer),28));
        }
        previousCipher=value;
      } else {
        if (value===28) {
          output.push(previousCipher);
          if (mode.advanceMarker) clock++;
        } else {
          const rank=mod(value+mode.sign*digit(pad,clock++,28,mode.reducer),28);
          previousCipher=rankToGlyph(rank,previousCipher,mode.rankOrder);
          output.push(previousCipher);
        }
      }
    }
  }
  assert.equal(pos,input.length);
  assert.equal(output.length,input.length);
  return output;
}
const ref=fs.readFileSync(path.join(__dirname,'..','resources/control/shakespeare_first300k.txt'),'utf8');
const trainRef=encode(ref.slice(0,190000));
const trueRef=encode(ref.slice(240000)).slice(0,original.length);
assert.equal(trueRef.length,original.length);
const histogram=Array(29).fill(0.5);
for(const x of trainRef)histogram[x]++;
const normalizer=trainRef.length+29*0.5;
const logp=histogram.map(x=>Math.log(x/normalizer));
const score=xs=>xs.reduce((v,x)=>v+logp[x],0)/xs.length;
const ioc=xs=>{
  const h=Array(29).fill(0);
  for(const x of xs)h[x]++;
  return h.reduce((v,n)=>v+n*(n-1),0)/(xs.length*(xs.length-1));
};
const cutoff=lengths.slice(0,4).reduce((a,b)=>a+b,0);
assert.equal(cutoff,1050);
function search(data) {
  return modes.map(mode=>{
    const decoded=transform(data,mode,1);
    const tr=decoded.slice(0,cutoff),hold=decoded.slice(cutoff);
    return {mode,train:score(tr),heldout:score(hold),trainIoc:ioc(tr),
      heldoutIoc:ioc(hold),prefix:decoded.slice(0,40).map(i=>corpus.translit[i]).join(''),
      decoded};
  }).sort((a,b)=>b.train-a.train);
}
const display=r=>({mode:{layout:r.mode.layout,iv:r.mode.ivName,rankOrder:r.mode.rankOrder,
  reducer:r.mode.reducer,sign:r.mode.sign,advanceMarker:r.mode.advanceMarker},
  train:r.train,heldout:r.heldout,trainIoc:r.trainIoc,heldoutIoc:r.heldoutIoc,prefix:r.prefix});
function run() {
  const results=search(original);
  for(const r of results) assert.deepEqual(transform(r.decoded,r.mode,-1),original);
  const trueMode=modes.find(m=>m.layout==='corrected-base60-column-major'&&m.ivName==='square-spiral'&&
    m.rankOrder==='sorted'&&m.reducer==='scaled'&&m.sign===-1&&!m.advanceMarker);
  assert.ok(trueMode);
  const plant=transform(trueRef,trueMode,-1);
  const recovered=transform(plant,trueMode,1);
  assert.deepEqual(recovered,trueRef);
  assert.deepEqual(transform(recovered,trueMode,-1),plant);
  const plantRanking=search(plant);
  const rank=plantRanking.findIndex(x=>x.mode===trueMode)+1;
  assert.equal(rank,1,'Source-native true key must rank first in independent plant');
  // The correct rank28 null is intrinsically biased toward a high IoC:
  // fixed adjacent-repeat markers all map to GP symbol 28, the other
  // noninitial positions to ranks 0..27, and page initials to GP29.
  const holdPages=pages.slice(4).filter(p=>p.indices.length);
  const markerCount=holdPages.reduce((s,p)=>s+p.indices.slice(1).filter((x,i)=>x===p.indices[i]).length,0);
  const starts=holdPages.length;
  const N=original.length-cutoff;
  const ordinary=N-markerCount-starts;
  const conditionalIoc=(
    markerCount*(markerCount-1)+
    2*markerCount*starts/29+
    starts*(starts-1)/29+
    2*starts*ordinary/29+
    ordinary*(ordinary-1)/28
  )/(N*(N-1));
  const avg28=logp.slice(0,28).reduce((s,x)=>s+x,0)/28;
  const avg29=logp.reduce((s,x)=>s+x,0)/29;
  const var28=logp.slice(0,28).reduce((s,x)=>s+(x-avg28)**2,0)/28;
  const conditionalGPScore=(ordinary*avg28+starts*avg29+markerCount*logp[28])/N;
  const conditionalGPScoreStd=Math.sqrt(ordinary*var28+starts*(
    logp.reduce((s,x)=>s+(x-avg29)**2,0)/29))/N;
  const output={
    nullCalibration:{conditionalOnMarkers:markerCount,pageInitials:starts,
      ordinaryRank28:ordinary,originalHeldoutRunes:N,
      expectedIoc:conditionalIoc,observedIoc:results[0].heldoutIoc,
      expectedUnigramLL:conditionalGPScore,
      observedUnigramLL:results[0].heldout,
      sigmaUnigramLL:conditionalGPScoreStd,
      observedZ:(results[0].heldout-conditionalGPScore)/conditionalGPScoreStd,
      caution:'Analytic iid uniform conditional-rank null, not a familywise original-key p-value.'},
    hypothesis:'16-page decorated block maps the 256 printed bytes into 16 page-specific AES-128 keys; evolving predecessor-exclusion GP28 rank and repeat marker 28.',
    sourcePages:'LP2 physical 40..55',originalRunes:3316,gridBytes:256,
    tableVariants:Object.keys(tableVariants),
    emptyPage:50,markerCount:pages.reduce((s,p)=>s+p.indices.slice(1).filter((x,i)=>x===p.indices[i]).length,0),
    modes:modes.length,trainPages:'40..43',heldoutPages:'44..55',
    original:{rawIoc:ioc(original),rawHeldoutScore:score(original.slice(cutoff)),
      topThree:results.slice(0,3).map(display),frozenHeldout:display(results[0])},
    plant:{trueMode:display(plantRanking[0]).mode,trueModeRank:rank,
      fullRecovered:recovered.length,fullReencrypted:plant.length,
      sourceHeldout:score(trueRef.slice(cutoff)),rankedHeldout:plantRanking[0].heldout}
  };
  console.log(JSON.stringify(output,null,2));
  return output;
}
if (require.main===module)run();
module.exports={transform,run,search};
