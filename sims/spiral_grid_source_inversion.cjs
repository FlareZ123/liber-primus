'use strict';

/**
 * Source-fixed 4x4 spiral traversals of the 256-byte LP2 table.
 *
 * The 4x4 number square on physical LP2 page 15 has its uniquely red
 * 3299 entry at (1,1). Reading its printed entries from 3299 outward
 * in spiral order supplies a previously published, source-fixed
 * traversal: right, down, left, up, repeated.
 *
 * This explores a finite transport of that traversal to the later
 * 32x8 byte table. The hypothesis itself remains conjectural.
 *
 * SFT: node sims/spiral_grid_source_inversion.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {inputs, correctedGridColumns, cipherBytes, assign} =
  require('./grid_section_column_keys.cjs');
const {encode} = require('./grid_keyskip_viterbi.cjs');

/** Spiral coordinates in the original p15 printed 4x4 order. */
const SPIRAL = [
  [1,1],[1,2],[2,2],[2,1],[2,0],[1,0],[0,0],[0,1],
  [0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0]
];
const GP = 29, WINDOW = 200;
const mod = n => (n % GP + GP) % GP;

/** @param {number[]} seq Must be exactly 256 bytes. */
function layouts(seq) {
  assert.equal(seq.length, 256);
  const m = Array.from({length:16},(_,r)=>seq.slice(r*16,r*16+16));
  const raw = Array.from({length:32},(_,r)=>seq.slice(r*8,r*8+8));
  const getBlock = (r,c)=> Array.from({length:4},(_,i)=>m[r*4+i].slice(c*4,c*4+4));
  const getFlat = (r,c)=> Array.from({length:4},(_,i)=>raw[r*4+i].slice(c*4,c*4+4));
  const readBlock = (b, spiral)=>spiral ?
    SPIRAL.map(([r,c])=>b[r][c]) : b.flat();
  const out = new Map();
  out.set('original-row-major',seq.slice());
  for(const tileSpiral of [false,true])for(const cellSpiral of [false,true]){
    if(!tileSpiral&&!cellSpiral)continue;
    const positions=tileSpiral?SPIRAL:
      Array.from({length:16},(_,i)=>[Math.floor(i/4),i%4]);
    out.set('fold16-tile'+Number(tileSpiral)+'-cell'+Number(cellSpiral),
      positions.flatMap(([r,c])=>readBlock(getBlock(r,c),cellSpiral)));
  }
  out.set('printed32x8-local-spirals',
    Array.from({length:16},(_,i)=>[Math.floor(i/2),i%2])
      .flatMap(([r,c])=>readBlock(getFlat(r,c),true)));
  out.set('printed32x8-global-spirals',
    SPIRAL.flatMap(([r,c])=>{
      const j=r*4+c;
      return readBlock(getFlat(Math.floor(j/2),j%2),true);
    }));
  for(const [name,a] of out)assert.equal(a.length,256,name);
  return out;
}
/** Eight 32-byte source keys, by sequential chunks or 32x8 columns. */
function keysets(seq) {
  return [
    {shape:'chunks32',keys:Array.from({length:8},(_,i)=>seq.slice(i*32,i*32+32))},
    {shape:'columns32',keys:Array.from({length:8},(_,c)=>
      Array.from({length:32},(_,r)=>seq[r*8+c]))}
  ];
}
/** Historical RC4 PRGA included as a distinct source-key family. */
function rc4(key,n) {
  const S=Uint8Array.from({length:256},(_,i)=>i);
  let j=0;
  for(let i=0;i<256;i++){j=(j+S[i]+key[i%key.length])&255;
    [S[i],S[j]]=[S[j],S[i]];}
  let i=0;j=0;const out=new Uint8Array(n);
  for(let k=0;k<n;k++){i=(i+1)&255;j=(j+S[i])&255;
    [S[i],S[j]]=[S[j],S[i]];
    out[k]=S[(S[i]+S[j])&255];}
  return out;
}
function stream(key,algorithm,n) {
  return algorithm==='rc4' ? rc4(key,n) : cipherBytes(key,algorithm,n);
}
/** Calculate raw-GP unigram IoC in one out-of-sample window. */
function ioc(cipher,pad,begin,n,sign,scaled) {
  const f=new Uint16Array(GP);
  for(let i=0;i<n;i++){
    const b=pad[begin+i];
    const k=scaled?Math.floor(b*GP/256):b%GP;
    f[mod(cipher[begin+i]+sign*k)]++;
  }
  let pairs=0;for(const v of f)pairs+=v*(v-1);
  return pairs/(n*(n-1));
}
/** Training chooses all model parameters once; both continuation blocks remain untouched. */
function screen(groups,sourceSeq) {
  const candidates=[];
  for(const [layout,bytes] of layouts(sourceSeq))for(const {shape,keys} of keysets(bytes)) {
    for(const algorithm of ['aes-256-ctr','chacha20','rc4'])
      for(const reverse of [false,true]){
        const pad=keys.map(key=>stream(reverse?key.slice().reverse():key,
          algorithm,3*WINDOW));
        for(const sign of [-1,1])for(const scaled of [false,true]) {
          const matrix=groups.map(g=>pad.map(p=>WINDOW*ioc(g,p,0,WINDOW,sign,scaled)));
          const optimal=assign(matrix);
          const assigned=optimal.assignment;
          const held=groups.reduce((s,g,i)=>s+
            ioc(g,pad[assigned[i]],WINDOW,WINDOW,sign,scaled),0)/groups.length;
          const third=groups.reduce((s,g,i)=>s+
            ioc(g,pad[assigned[i]],2*WINDOW,WINDOW,sign,scaled),0)/groups.length;
          candidates.push({layout,shape,algorithm,reverse,sign,scaled,
            assignment:assigned,train:optimal.sum/(8*WINDOW),held,third});
        }
      }
  }
  candidates.sort((a,b)=>b.train-a.train);
  return {best:candidates[0],top:candidates.slice(0,3)};
}
function rng(seed){
  let s=seed>>>0;
  return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};
}
function shuffle(a,next){
  const out=a.slice();
  for(let i=out.length-1;i>0;i--){const j=next()%(i+1);
    [out[i],out[j]]=[out[j],out[i]];}
  return out;
}
/** Blind positive source test with independently known genuine key and layout. */
function plant(originalSource) {
  const gp=encode(fs.readFileSync(
    path.join(__dirname,'../resources/control/shakespeare_first300k.txt'),'utf8'));
  const {keys}=keysets(layouts(originalSource).get('fold16-tile1-cell1'))[0];
  const assignment=[2,6,0,7,1,3,5,4];
  const next=rng(0x33011550);
  let repairs=0;
  const groups=assignment.map((col,s)=>{
    const pad=stream(keys[col],'aes-256-ctr',WINDOW*3);
    const C=Array.from({length:WINDOW*3},(_,i)=>
      mod(gp[s*700+i]+(pad[i]%GP)));
    for(let i=1;i<C.length;i++){
      if(C[i]===C[i-1] && next()/2**32<0.81){
        C[i]=mod(C[i]+1+next()%28);repairs++;
      }
    }
    return C;
  });
  const test=screen(groups,originalSource);
  const truekey=test.best.layout==='fold16-tile1-cell1'&&
    test.best.shape==='chunks32'&&test.best.algorithm==='aes-256-ctr'&&
    !test.best.reverse&&test.best.sign===-1&&!test.best.scaled&&
    test.best.assignment.every((v,i)=>v===assignment[i]);
  assert(test.best.held>0.043&&test.best.third>0.043,
    'Known-source English plant must generalize to unseen windows');
  return {repairs,selectedTrueKey:truekey,best:test.best};
}
function main(){
  const {groups,columnKeys}=inputs();
  assert(groups.every(x=>x.length>=3*WINDOW));
  const corrected=correctedGridColumns(columnKeys);
  const original=Array.from({length:32},(_,r)=>
    Array.from({length:8},(_,c)=>corrected[c][r])).flat();
  assert.equal(original.length,256);
  const positive=plant(original);
  const actual=screen(groups,original);
  const next=rng(0x33010415);
  let held=0,third=0,train=0,maxThird=0;
  const trials=64;
  for(let t=0;t<trials;t++){
    const control=screen(groups,shuffle(original,next)).best;
    if(control.train>=actual.best.train)train++;
    if(control.held>=actual.best.held)held++;
    if(control.third>=actual.best.third)third++;
    maxThird=Math.max(maxThird,control.third);
  }
  console.log('SOURCE',JSON.stringify({
    originalBytes:256,source:'LP2 original p15 spiral and corrected p49-51 grid',
    originalVersion:'independent five-cell pnotisdev correction',
    layouts:[...layouts(original).keys()],dataWindowsPerSection:[0,200,400],
    nSections:groups.length,groupLengths:groups.map(g=>g.length)
  }));
  console.log('PLANT',JSON.stringify(positive));
  console.log('ORIGINAL',JSON.stringify(actual));
  console.log('SOURCE_SHUFFLE_NULL',JSON.stringify({
    trials,trainingOutrank:train,heldOutrank:held,thirdOutrank:third,
    heldTail:(held+1)/(trials+1),thirdTail:(third+1)/(trials+1),
    maxThird
  }));
}
if(require.main===module)main();
module.exports={SPIRAL,layouts,keysets,rc4,ioc,screen,plant};
