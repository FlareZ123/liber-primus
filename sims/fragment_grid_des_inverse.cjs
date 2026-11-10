'use strict';
/**
 * Source-fixed 32x8 grid as 32 historical DES keys, paired with the 32
 * text fragments delimited by 31 authentic 13-dot LP2 punctuation marks.
 * The source-derived key structure is a hypothesis, not a recovered cipher.
 * Node.js 22 CommonJS; run: node sims/fragment_grid_des_inverse.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createCipheriv} = require('node:crypto');
const {train, encode} = require('./grid_keyskip_viterbi.cjs');
const {plainScore} = require('./grid_latin_register_inverse.cjs');
const root = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const corpus=read('resources/liber-primus/lp2-corpus.json');
const ink=read('resources/liber-primus/lp2-ink-annotations.json');
const grid=read('resources/liber-primus/base60-grid.json');
const mod=(a,q)=>(a%q+q)%q;
const all=[],origin=[],start=[];
for(const page of corpus.pages){
  start[page.page]=all.length;
  for(const c of page.indices){all.push(c);origin.push(page.page);}
}
assert.equal(all.length,13136);
const dots=[];
for(const rec of ink.pages){
  assert.equal(rec.rune_count,corpus.pages[rec.page].indices.length);
  for(const mark of rec.large_punctuation||[])
    if(mark[1]===13)dots.push(start[rec.page]+mark[0]);
}
dots.sort((a,b)=>a-b);
assert.equal(dots.length,31);
const fragmentIndex=Array(all.length);let f=0,i=0;
for(let p=0;p<all.length;p++){
  while(i<dots.length&&dots[i]===p){i++;f++;}
  fragmentIndex[p]=f;
}
assert.equal(i,31);
assert.equal(fragmentIndex[12955],27);
assert.equal(fragmentIndex[12956],28);
const segments=Array.from({length:32},()=>[]);
for(let p=0;p<12956;p++)segments[fragmentIndex[p]].push({c:all[p],page:origin[p]});
assert.equal(segments.reduce((sum,x)=>sum+x.length,0),12956);
assert.equal(grid.byte_rows.length,32);
const keys=grid.byte_rows.map(row=>{
  assert.equal(row.length,8);
  const b=Buffer.from(row);
  assert.equal(b.length,8);
  return b;
});
const original=segments.map(s=>s.map(p=>p.c));
const altBytes=Buffer.from(grid.byte_rows.flat());
const fiveCorrections=[[45,107,81],[50,47,21],[165,18,47],[172,148,174],[246,198,224]];
for(const [i,initial,corrected] of fiveCorrections){
  assert.equal(altBytes[i],initial);
  altBytes[i]=corrected;
}
const sourceKeys={canonical:keys,imageFive:Array.from({length:32},(_,i)=>altBytes.subarray(i*8,i*8+8))};

/** DES-ECB stream block using three identical EDE3 keys, exactly DES E_K. */
function desStream(key, length, row, mode){
  const triple=Buffer.concat([key,key,key]);
  const nonce=Buffer.alloc(8);
  if(mode.salt==='row')nonce.writeBigUInt64BE(BigInt(row));
  if(mode.stream==='ofb'){
    const c=createCipheriv('des-ede3-ofb',triple,nonce);
    return Buffer.concat([c.update(Buffer.alloc(length)),c.final()]);
  }
  const c=createCipheriv('des-ede3',triple,null);
  c.setAutoPadding(false);
  const buf=Buffer.alloc(Math.ceil(length/8)*8);
  for(let b=0;b<buf.length/8;b++){
    const ctr=Buffer.alloc(8);
    ctr.writeBigUInt64BE(BigInt(b)+(mode.salt==='row'?BigInt(row):0n));
    c.update(ctr).copy(buf,b*8);
  }
  c.final();
  return buf.subarray(0,length);
}
function keyBytes(mode){
  return sourceKeys[mode.source].map((base,row)=>desStream(mode.reverse?Buffer.from(base).reverse():base,
      segments[row].length,row,mode));
}
const modes=[];
for(const source of ['canonical','imageFive'])for(const stream of ['ctr','ofb'])for(const salt of ['zero','row'])
for(const reverse of [false,true])for(const format of ['direct29','diff28'])
for(const reducer of ['mod','scaled'])for(const sign of [-1,1])
  modes.push({source,stream,salt,reverse,format,reducer,sign});
assert.equal(modes.length,128);
function keydigit(x,base,mode){return mode.reducer==='mod'?x%base:Math.floor(x*base/256);}
function decode(segs,pads,mode){
  return segs.map((seq,r)=>{
    const out=[];
    for(let j=0;j<seq.length;j++){
      const c=seq[j],isDirect=mode.format==='direct29'||j===0;
      const base=isDirect?29:28;
      const digit=keydigit(pads[r][j],base,mode);
      if(isDirect)out.push(mod(c-mode.sign*digit,29));
      else if(c===seq[j-1])out.push(28);
      else out.push(mod(mod(c-seq[j-1]-1,29)-mode.sign*digit,28));
    }
    return out;
  });
}
function encodeCipher(segs,pads,mode){
  return segs.map((seq,r)=>{
    const out=[];
    for(let j=0;j<seq.length;j++){
      const p=seq[j],isDirect=mode.format==='direct29'||j===0;
      const base=isDirect?29:28;
      const digit=keydigit(pads[r][j],base,mode);
      if(isDirect)out.push(mod(p+mode.sign*digit,29));
      else if(p===28)out.push(out[j-1]);
      else out.push(mod(out[j-1]+1+mod(p+mode.sign*digit,28),29));
    }
    return out;
  });
}
const gpTrain=fs.readFileSync(path.join(root,'resources/control/shakespeare_first300k.txt'),'utf8');
const english=train(gpTrain.slice(0,190000));
const nativeRef=encode(gpTrain.slice(205000));
assert.ok(nativeRef.length>=12956);
function sliceSplit(decoded){
  const tr=[],ho=[];let off=0;
  for(let r=0;r<decoded.length;r++)for(let j=0;j<decoded[r].length;j++){
    (segments[r][j].page<28?tr:ho).push(decoded[r][j]);off++;
  }
  assert.equal(off,12956);
  return {tr,ho};
}
function ioc(vals){
  const hist=Array(29).fill(0);
  for(const c of vals)hist[c]++;
  return hist.reduce((s,n)=>s+n*(n-1),0)/(vals.length*(vals.length-1));
}
function search(segs){
  return modes.map(mode=>{
    const pads=keyBytes(mode);
    const decoded=decode(segs,pads,mode);
    const {tr,ho}=sliceSplit(decoded);
    return {mode,train:plainScore(tr,english),heldout:plainScore(ho,english),
      trainIoc:ioc(tr),heldoutIoc:ioc(ho),
      prefix:decoded[0].slice(0,45).map(x=>corpus.translit[x]).join(''),decoded,pads};
  }).sort((a,b)=>b.train-a.train);
}
function plant(){
  const truth={source:'canonical',stream:'ctr',salt:'row',reverse:false,
    format:'diff28',reducer:'scaled',sign:1};
  const ref=nativeRef.slice(0,12956);
  let start=0;
  const native=segments.map(s=>{const v=ref.slice(start,start+s.length);start+=s.length;return v;});
  const pads=keyBytes(truth);
  const cipher=encodeCipher(native,pads,truth);
  const inverted=decode(cipher,pads,truth);
  assert.deepEqual(inverted,native);
  assert.deepEqual(encodeCipher(inverted,pads,truth),cipher);
  const match=search(cipher);
  const idx=match.findIndex(x=>JSON.stringify(x.mode)===JSON.stringify(truth));
  const checked=sliceSplit(inverted);
  return {trueKeyModeRank:idx+1,correctMode:truth,
    sourceRecovered:inverted.flat().length,
    reencrypted:cipher.flat().length,
    genuineHeldout:plainScore(checked.ho,english),
    matchedHeldout:match[idx].heldout,
    bestAlternative:match.filter(x=>JSON.stringify(x.mode)!==JSON.stringify(truth))[0].train};
}
function main(){
  const results=search(original);
  const best=results[0];
  const first=results.slice(0,8).map(({mode,train,heldout,trainIoc,heldoutIoc,prefix})=>
    ({mode,train,heldout,trainIoc,heldoutIoc,prefix}));
  const output={layout:{fragments:segments.length,
    unsolvedFragmentLengths:segments.slice(0,28).map(x=>x.length),
    markers:dots.length,originalRunes:original.flat().length},
    modes:modes.length,topTraining:first,
    bestHeldoutFromFrozenTrain:{mode:best.mode,
      heldout:best.heldout,heldoutIoc:best.heldoutIoc},
    noKeyNative:{heldout:plainScore(sliceSplit(original).ho,english),
      heldoutIoc:ioc(sliceSplit(original).ho)},
    trueSourceControl:plant()};
  console.log(JSON.stringify(output,null,2));
}
if(require.main===module)main();
module.exports={desStream,decode,encodeCipher,sliceSplit,search,plant,main};
