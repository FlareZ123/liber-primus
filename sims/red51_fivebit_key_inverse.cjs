'use strict';
/**
 * Original LP2 p53 red51 five-bit AES-256 hypothesis, source-locked inversion.
 *
 * There are 51 highlighted runes: 51 * 5 = 255 bit slots. An explicitly
 * unknown 0/1 boundary bit completes a hypothetical 256-bit key. Test 16
 * literal serializations, without fitting any key bytes to ciphertext.
 * 256 grid bytes and 1,323 original LP2 glyphs are challenged.
 *
 * Run: node sims/red51_fivebit_key_inverse.cjs (Node.js 22, built-ins only).
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const rows=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/base60-grid.json'),'utf8')).byte_rows;
assert.equal(rows.length,32);
assert.ok(rows.every(x=>x.length===8));
const grid=Buffer.from(rows.flat());
assert.equal(grid.length,256);
assert.equal(crypto.createHash('sha256').update(grid).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const red=corpus.pages[53].indices.slice(128,179);
assert.equal(red.length,51);
assert.equal(red.map(x=>'0123456789ABCDEFGHIJKLMNOPQRS'[x]).join(''),
  'GD7CF7HC2986B4RNR2OACPEKCSROB842DNBL360CJ58N3G514D9');

/** @param {number[]} symbols @param {boolean} reverse
 * @param {boolean} lsb @param {number} bit @param {boolean} front */
function makeKey(symbols,reverse,lsb,bit,front) {
  const seq=reverse?symbols.slice().reverse():symbols;
  let bits=seq.map(v=>{
    assert.ok(Number.isInteger(v)&&v>=0&&v<29);
    const s=v.toString(2).padStart(5,'0');
    return lsb?[...s].reverse().join(''):s;
  }).join('');
  assert.equal(bits.length,255);
  bits=front?String(bit)+bits:bits+String(bit);
  return Buffer.from(BigInt('0b'+bits).toString(16).padStart(64,'0'),'hex');
}
/** @returns {{name:string,key:Buffer}[]} */
function keyCandidates() {
  const out=[];
  for(const reverse of [false,true])for(const lsb of [false,true])
    for(const bit of [0,1])for(const front of [true,false]){
      const name=(reverse?'rev':'fwd')+'/'+(lsb?'lsb':'msb')+'/'
        +(front?'front':'end')+bit;
      out.push({name,key:makeKey(red,reverse,lsb,bit,front)});
    }
  assert.equal(out.length,16);
  assert.equal(new Set(out.map(k=>k.key.toString('hex'))).size,16);
  assert.equal(out.find(x=>x.name==='fwd/msb/end1').key.toString('hex'),
    '834ec79e2c1250659377d8b0a665d4673785a0826dd751980c995171c0a12353');
  return out;
}
function gridViews() {
  const column=(lo,hi)=>{
    const arr=[];for(let c=0;c<8;c++)for(let r=lo;r<hi;r++)arr.push(rows[r][c]);
    return arr;
  };
  return new Map([
    ['row-major',grid],['reverse-row',Buffer.from(grid).reverse()],
    ['column-major',Buffer.from(column(0,32))],
    ['reverse-column',Buffer.from(column(0,32)).reverse()],
    ['page-column',Buffer.from([...column(0,10),...column(10,23),...column(23,32)])]
  ]);
}
/** @param {Buffer} buf @param {Buffer} key @param {string} mode @param {Buffer} iv */
function aes(buf,key,mode,iv) {
  const d=crypto.createDecipheriv('aes-256-'+mode,key,mode==='ecb'?null:iv);
  if(mode==='ecb'||mode==='cbc')d.setAutoPadding(false);
  return Buffer.concat([d.update(buf),d.final()]);
}
/** @param {Buffer} buf */
function byteMetrics(buf) {
  let printable=0,low29=0,longestPrintable=0,run=0;
  for(const b of buf){
    const ascii=b===9||b===10||b===13||(b>=32&&b<=126);
    if(ascii)printable++;
    if(b<29)low29++;
    run=ascii?run+1:0;longestPrintable=Math.max(longestPrintable,run);
  }
  return {printable,low29,longestPrintable};
}
function gridProbe(keys) {
  const ivs=[['zero',Buffer.alloc(16)],['first-grid',grid.subarray(0,16)],
    ['last-grid',grid.subarray(240,256)]];
  let tested=0,bestPrintable=null,bestLow29=null,bestRun=null,wholeAscii=0,wholeGp=0;
  for(const {name,key} of keys)for(const [view,c] of gridViews())
    for(const mode of ['ecb','cbc','ctr','cfb','ofb'])
      for(const [ivLabel,iv] of (mode==='ecb'?[['none',Buffer.alloc(16)]]:ivs)){
        const output=aes(c,key,mode,iv);
        const x={key:name,view,mode,iv:ivLabel,...byteMetrics(output),
          prefix:output.subarray(0,16).toString('hex')};
        tested++;
        wholeAscii+=Number(x.printable===256);
        wholeGp+=Number(x.low29===256);
        if(!bestPrintable||x.printable>bestPrintable.printable)bestPrintable=x;
        if(!bestLow29||x.low29>bestLow29.low29)bestLow29=x;
        if(!bestRun||x.longestPrintable>bestRun.longestPrintable)bestRun=x;
      }
  assert.equal(tested,1040);
  assert.equal(bestPrintable.printable,122);
  assert.equal(bestLow29.low29,43);
  assert.equal(bestRun.longestPrintable,14);
  assert.equal(wholeAscii,0);assert.equal(wholeGp,0);
  return {tested,wholeAscii,wholeGp,bestPrintable,bestLow29,bestRun};
}
/** @param {number[][]} groups */
function ioc(groups) {
  const h=new Uint32Array(29);let n=0;
  for(const group of groups)for(const v of group){h[v]++;n++;}
  return h.reduce((s,v)=>s+v*(v-1),0)/(n*(n-1));
}
const LOG=new Int8Array(29).fill(-1);
let x=1;for(let j=0;j<28;j++){LOG[x]=j;x=x*15%29;}assert.equal(x,1);
/** @returns {{near:number[][],far:number[][]}} */
function originalScopes() {
  const p=corpus.pages;
  const near=[p[52].indices,p[53].indices.slice(0,128),p[54].indices,p[55].indices];
  const far=[p[0].indices,p[15].indices.slice(20),p[40].indices.slice(8)];
  assert.deepEqual(near.map(x=>x.length),[263,128,232,76]);
  assert.deepEqual(far.map(x=>x.length),[262,139,223]);
  return {near,far};
}
/** @param {Buffer} key @param {Buffer} iv @param {number} len */
function stream(key,iv,len) {return aes(Buffer.alloc(len),key,'ctr',iv);}
/**
 * @param {number[][]} groups @param {Buffer} key @param {Buffer} iv
 * @param {boolean} reset @param {'add'|'rank'|'log'} mode
 * @param {'mod'|'scale'} byteMap @param {-1|1} sign
 * @returns {number[][]}
 */
function inverse(groups,key,iv,reset,mode,byteMap,sign) {
  const whole=reset?null:stream(key,iv,groups.reduce((s,g)=>s+g.length,0));
  let pos=0;
  return groups.map(group=>{
    const pad=reset?stream(key,iv,group.length):whole.subarray(pos,pos+group.length);
    pos+=group.length;
    let previous=-1;
    return group.map((c,i)=>{
      const n=mode==='add'?29:28;
      const k=byteMap==='mod'?pad[i]%n:Math.floor(pad[i]*n/256);
      let plain;
      if(mode==='add'||i===0)plain=(c+sign*k+29)%29;
      else if(c===previous)plain=28;
      else {
        const step=(c-previous+29)%29;
        const d=mode==='rank'?c-(c>previous?1:0):mode==='delta'?step-1:LOG[step];
        plain=(d+sign*k+56)%28;
      }
      previous=c;
      return plain;
    });
  });
}
function runeProbe(keys) {
  const scopes=originalScopes();
  const ivs=[['zero',Buffer.alloc(16)],['first-grid',grid.subarray(0,16)],
    ['last-grid',grid.subarray(240)]];
  let tested=0,jointOver0045=0,bestNear=null,bestFar=null,bestJoint=null;
  for(const {name,key} of keys)for(const [ivLabel,iv] of ivs)
    for(const reset of [false,true])for(const mode of ['add','rank','delta','log'])
      for(const byteMap of ['mod','scale'])for(const sign of [-1,1]){
        const near=ioc(inverse(scopes.near,key,iv,reset,mode,byteMap,sign));
        const far=ioc(inverse(scopes.far,key,iv,reset,mode,byteMap,sign));
        const rec={key:name,iv:ivLabel,reset,mode,byteMap,sign,
          near,far,mean:(near+far)/2};
        tested++;if(near>0.045&&far>0.045)jointOver0045++;
        if(!bestNear||near>bestNear.near)bestNear=rec;
        if(!bestFar||far>bestFar.far)bestFar=rec;
        if(!bestJoint||rec.mean>bestJoint.mean)bestJoint=rec;
      }
  assert.equal(tested,1536);assert.equal(jointOver0045,0);
  assert.ok(bestNear.near<0.037&&bestFar.far<0.038);
  const key=keys.find(x=>x.name==='fwd/msb/end1').key,iv=Buffer.alloc(16);
  const plant=Array.from({length:699},(_,i)=>(i*i+7*i+2)%29);
  const ks=stream(key,iv,plant.length),enc=plant.map((p,i)=>(p+ks[i]%29)%29);
  assert.deepEqual(inverse([enc],key,iv,false,'add','mod',-1).flat(),plant);
  return {tested,original:{nearRunes:699,farRunes:624,
    nearIoC:ioc(scopes.near),farIoC:ioc(scopes.far)},bestNear,bestFar,bestJoint,
    jointOver0045,positive:{exactReencryptionAndRecovery:true,GPpositions:699}};
}
function main() {
  const keys=keyCandidates();
  const result={hypothesis:'p53 red51 runes as 255 literal bit slots plus one boundary bit',
    source:'original physical LP2 p53 rune indices [128,179)',redRunes:51,
    keyVariants:keys.length,grid:gridProbe(keys),runes:runeProbe(keys),
    conclusion:'No original plaintext/key, readable grid payload or GP-English excess IoC in this fixed source-key model.'};
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)main();
module.exports={makeKey,keyCandidates,gridProbe,originalScopes,inverse,runeProbe,ioc,main};
