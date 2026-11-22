'use strict';
/**
 * Three unambiguous source counts converge on LP2 physical p40..55:
 * 16 consecutive physical pages, 16 numbers in the p15 4x4 prime/Fibonacci
 * square, and 256 printed p49..51 grid bytes = 16 AES-128 key blocks.
 *
 * Test original 16-page, page-local AES-128-CTR streams with the grid's
 * sixteen 16-byte keys and the square's values as optional page IVs.
 * Model selection is confined to pages 40..43, all later pages untouched.
 * This is a finite hypothesis; number-count equality is postselected.
 * Node.js 22/CommonJS, no third-party libraries or file writes.
 *
 * @module final16_grid_square_pagekeys
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {readSquare,clockwiseSpiral}=require('./fibonacci_prime_spiral.cjs');
const {encode}=require('./grid_keyskip_viterbi.cjs');
const ROOT=path.join(__dirname,'..');
const corpus=require('../resources/liber-primus/lp2-corpus.json');
const table=require('../resources/liber-primus/lp2-grid-256.json');
const pages=corpus.pages.filter(p=>p.page>=40&&p.page<=55);
const real=pages.flatMap(p=>p.indices);
const LENGTHS=pages.map(p=>p.indices.length);
assert.equal(pages.length,16);
assert.equal(real.length,3316);
assert.equal(LENGTHS[10],0,'p50 is numeric-only and consumes an unused page key');
assert.equal(table.bytes.length,256);

const square=readSquare();
const rowNumbers=square.flat();
const spiralNumbers=clockwiseSpiral().map(([r,c])=>square[r][c]);
const fullGrid=Buffer.from(table.bytes);
const columnGrid=Buffer.from(Array.from({length:8},(_,c)=>
  Array.from({length:32},(_,r)=>table.bytes[8*r+c])).flat());
const keys={
  'printed-grid-row-major':Array.from({length:16},(_,i)=>fullGrid.subarray(16*i,16*(i+1))),
  'printed-grid-column-major':Array.from({length:16},(_,i)=>columnGrid.subarray(16*i,16*(i+1)))
};
for(const v of Object.values(keys))assert.equal(v.length,16);
for(const v of Object.values(keys))assert.ok(v.every(k=>k.length===16));
/** @param {number} v */
function sourceIv(v) {
  const out=Buffer.alloc(16);
  out.writeUInt16BE(v,0);
  return out;
}
const ivs={
  zero:Array.from({length:16},()=>Buffer.alloc(16)),
  'square-printed-values':rowNumbers.map(sourceIv),
  'square-spiral-values':spiralNumbers.map(sourceIv),
  'square-printed-primes':rowNumbers.map(x=>sourceIv(Math.abs(3301-x))),
  'square-spiral-primes':spiralNumbers.map(x=>sourceIv(Math.abs(3301-x)))
};
const mod=x=>(x%29+29)%29;
/** @param {number[]} values */
function ioc(values){
  const hist=new Uint32Array(29);
  for(const x of values)hist[x]++;
  return hist.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
/** @param {Buffer} key @param {Buffer} iv @param {number} count */
function pad(key,iv,count){
  const enc=crypto.createCipheriv('aes-128-ctr',key,iv);
  return Buffer.concat([enc.update(Buffer.alloc(count)),enc.final()]);
}
const modes=[];
for(const [keyLayout,keyBlocks] of Object.entries(keys))
  for(const [ivLayout,vector] of Object.entries(ivs))
    for(const scaled of [false,true])
      for(const sign of [-1,1]) {
        const shifts=pages.map((p,i)=>Array.from(
          pad(keyBlocks[i],vector[i],p.indices.length),
          b=>scaled?Math.floor(29*b/256):b%29));
        modes.push({keyLayout,ivLayout,scaled,sign,shifts});
      }
assert.equal(modes.length,40);
/** @param {number[]} input @param {typeof modes[number]} mode @param {number} direction */
function transform(input,mode,direction){
  assert.equal(input.length,real.length);
  const out=[];let pointer=0;
  for(let i=0;i<16;i++){
    const shift=mode.shifts[i];
    for(let j=0;j<shift.length;j++)
      out.push(mod(input[pointer++]+direction*mode.sign*shift[j]));
  }
  assert.equal(out.length,real.length);
  return out;
}
const source=fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8');
const controlTrain=encode(source.slice(0,190000));
const controlTest=encode(source.slice(240000)).slice(0,real.length);
assert.equal(controlTest.length,real.length);
const counts=Array(29).fill(0.5);
for(const x of controlTrain)counts[x]++;
const div=controlTrain.length+14.5;
const logp=counts.map(c=>Math.log(c/div));
const ll=a=>a.reduce((v,x)=>v+logp[x],0)/a.length;
const TRAIN=LENGTHS.slice(0,4).reduce((a,b)=>a+b,0);
assert.equal(TRAIN,1050);
/** @param {number[]} ciphertext */
function rank(ciphertext){
  const rows=modes.map(mode=>{
    const decoded=transform(ciphertext,mode,1);
    const first=decoded.slice(0,TRAIN),hold=decoded.slice(TRAIN);
    return {mode,trainLL:ll(first),heldLL:ll(hold),trainIoC:ioc(first),
      heldIoC:ioc(hold),byPage:LENGTHS.map((n,i)=>{
        const start=LENGTHS.slice(0,i).reduce((a,b)=>a+b,0);
        return n>1?ioc(decoded.slice(start,start+n)):null;
      })};
  });
  rows.sort((a,b)=>b.trainLL-a.trainLL);
  return rows;
}
const clean=r=>({keyLayout:r.mode.keyLayout,ivLayout:r.mode.ivLayout,
  scaled:r.mode.scaled,sign:r.mode.sign,trainLL:r.trainLL,heldLL:r.heldLL,
  trainIoC:r.trainIoC,heldIoC:r.heldIoC,byPage:r.byPage});
function run(){
  assert.equal(crypto.createHash('sha256').update('abc').digest('hex'),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  const original=rank(real);
  const trueMode=modes.find(m=>m.keyLayout==='printed-grid-column-major' &&
    m.ivLayout==='square-printed-values'&&!m.scaled&&m.sign===-1);
  assert.ok(trueMode);
  const planted=transform(controlTest,trueMode,-1);
  assert.deepEqual(transform(planted,trueMode,1),controlTest);
  const positive=rank(planted);
  assert.equal(positive[0].mode,trueMode,'Authentic source-grid AES key should win the native-GP plant');
  assert.ok(positive[0].heldIoC>0.048);
  const result={
    source:{
      pageSpan:'LP2 physical 40..55 inclusive',pages:16,runicPages:15,
      textRunes:3316,gridBytes:256,perPageAesKeyBytes:16,
      numberSquareCells:16,printPage50Runes:0
    },
    hypothesis:'Each of the final 16 physical pages receives one consecutive 16-byte source-grid AES-128 key. A page-specific 16-bit printed Fibonacci-square integer optionally initializes its CTR IV.',
    family:{keyLayouts:Object.keys(keys),ivLayouts:Object.keys(ivs),
      byteReducers:['mod29','scaled29'],signs:[-1,1],candidates:modes.length,
      training:'original p40-43 (1050 runes)',heldout:'original p44-55 (2266 runes)'},
    original:{rawIoc:ioc(real),bestFrozen:clean(original[0]),topThree:original.slice(0,3).map(clean)},
    positive:{selected:clean(positive[0]),exactRecovered:controlTest.length,
      trueKeyRank:positive.findIndex(x=>x.mode===trueMode)+1,
      sourceIoC:ioc(controlTest),sourceHeldIoC:ioc(controlTest.slice(TRAIN))},
    limits:'Only AES-128-CTR zero-padding and 16-bit page IV reading. Section/page alignment, key ordering, and additive GP29 plaintext are hypothesized. Neither original key nor plaintext is asserted without a heldout native-text signal.'
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)run();
module.exports={run,rank,transform};
