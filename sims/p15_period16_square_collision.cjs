'use strict';
/**
 * Exact, arbitrary-key equality invariant for any 16-row-periodic secret
 * 29-way bijections on the source-proposed 81x81 and 80x80-5 LP2 squares:
 *
 * C[row,col] = S[(row+phase)%16][col](P[row,col]).
 *
 * This tests all possible 29! secret permutations for EACH of the 16*81
 * row/column states at once. Full native-English blind-key plants and an
 * exact inverse prove the invariant's power.
 *
 * Run: node sims/p15_period16_square_collision.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const raw=read('resources/liber-primus/lp2-corpus.json');
const corpus=JSON.parse(raw);
const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length);
const ORIGINAL=pages.flatMap(x=>x.indices);
assert.equal(ORIGINAL.length,12956);
assert.equal(pages.length,55);
assert.equal(81*81+80*80-5,ORIGINAL.length);
const roman=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} rawText */
function gp(rawText){
  const out=[];
  for(let word of rawText.toUpperCase().match(/[A-Z]+/g)||[]){
    word=word.replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S');
    for(let i=0;i<word.length;){
      const t=roman.find(x=>word.startsWith(x.s,i));
      if(t){out.push(t.i);i+=t.s.length;}else i++;
    }
  }
  return out;
}
const SHAKESPEARE=gp(read('resources/control/shakespeare_first300k.txt'));
const GIBRAN=gp(read('resources/control/gibran_prophet_58585.txt'));
assert.equal(SHAKESPEARE.length,218800);
assert.equal(GIBRAN.length,63114);
const PERIOD=16;
/**
 * Count exact published rune equalities separated by a row-key recurrence,
 * whichever canonical square axis is chosen as the logical row coordinate.
 * @param {number[]} data GP29 glyphs, omitting 5 missing final positions.
 * @param {number} width
 * @param {'row'|'column'} axis
 * @param {number} period
 */
function collisions(data,width,axis,period=PERIOD){
  let equal=0,pairs=0;
  for(let r=0;r+period<width;r++)for(let c=0;c<width;c++){
    const a=axis==='row'?r*width+c:c*width+r;
    const b=axis==='row'?(r+period)*width+c:c*width+(r+period);
    if(a>=data.length||b>=data.length)continue;
    equal+=Number(data[a]===data[b]);pairs++;
  }
  return {equal,pairs,rate:equal/pairs};
}
function prng(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0};
}
/** Native source text + arbitrary 16*width independent secret 29! rows. */
function secretPlant(width,n,sourceStart,seed){
  const rand=prng(seed);
  const truePlain=SHAKESPEARE.slice(sourceStart,sourceStart+n);
  assert.equal(truePlain.length,n);
  const sboxes=Array.from({length:PERIOD},()=>
    Array.from({length:width},()=>{
      const p=Array.from({length:29},(_,i)=>i);
      for(let i=28;i>0;i--){
        const j=rand()%(i+1);[p[i],p[j]]=[p[j],p[i]];
      }
      return p;
    }));
  const inverse=sboxes.map(row=>row.map(box=>{
    const v=Array(29);
    for(let i=0;i<29;i++)v[box[i]]=i;
    assert.equal(new Set(box).size,29);
    return v;
  }));
  const encrypted=truePlain.map((x,i)=>sboxes[Math.floor(i/width)%PERIOD][i%width][x]);
  const decrypted=encrypted.map((x,i)=>inverse[Math.floor(i/width)%PERIOD][i%width][x]);
  assert.deepEqual(decrypted,truePlain);
  assert.deepEqual(encrypted,decrypted.map((x,i)=>sboxes[Math.floor(i/width)%PERIOD][i%width][x]));
  const actualPlain=collisions(truePlain,width,'row');
  const encryptedPairs=collisions(encrypted,width,'row');
  assert.deepEqual(encryptedPairs,actualPlain);
  return {width,positions:n,secretPermutationRows:PERIOD*width,
    exactPlaintextRecovered:n,exactCipherReencipher:n,
    plaintextAndCipherCollisions:encryptedPairs};
}
function interval(results,field){
  const a=results.map(x=>x[field]).sort((x,y)=>x-y);
  return {windows:a.length,min:a[0],median:a[Math.floor(a.length/2)],
    max:a.at(-1)};
}
/** Exact original source and 2000-window controls per literary corpus. */
function run(){
  const blocks=[
    {n:81,data:ORIGINAL.slice(0,6561)},
    {n:80,data:ORIGINAL.slice(6561)}
  ];
  const original=blocks.map(({n,data})=>({square:n,runes:data.length,
    row:collisions(data,n,'row'),column:collisions(data,n,'column')}));
  const nativeControls={};
  for(const [sourceName,source,offset,stride] of [
    ['Shakespeare',SHAKESPEARE,100000,52],
    ['Gibran',GIBRAN,0,25]]) {
    const scores={};
    for(const {n,data} of blocks){
      const both=[];
      for(let i=0;i<2000;i++){
        const x=source.slice(offset+i*stride,offset+i*stride+data.length);
        assert.equal(x.length,data.length);
        both.push({row:collisions(x,n,'row').equal,
          column:collisions(x,n,'column').equal});
      }
      scores[n]={row:interval(both,'row'),column:interval(both,'column')};
    }
    nativeControls[sourceName]=scores;
  }
  const planted=[
    secretPlant(81,6561,100000,0x16403301),
    secretPlant(80,6395,108000,0x16403302)
  ];
  const output={status:'Original LP2 negative under native-GP source register',
    source:'p15 4x4 Fibonacci prime square and hypothetical 81^2 / 80^2-5 source geometry',
    method:'Any 16-row-periodic, column-specific arbitrary secret 29! substitution table',
    theorem:'If row and row+16 have the same site-specific bijection, ciphertext equality iff plaintext equality for that pair.',
    originalRuneCount:ORIGINAL.length,original,
    nativeControls,planted,
    firstSourceSHA256:crypto.createHash('sha256').update(raw).digest('hex'),
    limits:'Conditional on a 16-row periodic key, ciphertext/GP plaintext equality, square framing, and native-GP literary-register source; no original key or plaintext found.'};
  for(const o of original){
    for(const axis of ['row','column'])for(const native of Object.values(nativeControls)){
      assert(o[axis].equal<native[o.square][axis].min,
        'Original source unexpectedly passes author-native equality control');
    }
  }
  return output;
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={gp,collisions,secretPlant,run};
