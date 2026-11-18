'use strict';
/**
 * Original p0 title -> terminal-table row27 -> one DES 8-byte key.
 * Source-selected layout candidate; no Cicada-authored DES instruction.
 * Node.js 22, CommonJS; run node sims/lp2_p0_row27_des8_source_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

/** @param {Buffer} src @param {Buffer} key @param {Buffer|null} iv @param {'ecb'|'cbc'} mode @param {boolean} encrypt @returns {Buffer} */
function cipher(src, key, iv, mode, encrypt) {
  // EDE3 with identical three 8-byte keys is exactly single DES.
  const worker = (encrypt ? crypto.createCipheriv : crypto.createDecipheriv)(
    'des-ede3-' + mode, Buffer.concat([key,key,key]), iv);
  worker.setAutoPadding(false);
  return Buffer.concat([worker.update(src), worker.final()]);
}
/** @param {Buffer} b @returns {{printable:number,asciiGraphic:number,high:number,zero:number,first32hex:string,first48display:string}} */
function describe(b) {
  let printable=0,asciiGraphic=0,high=0,zero=0;
  for(const x of b){
    if(x>=32&&x<=126)asciiGraphic++;
    if((x>=32&&x<=126)||x===9||x===10||x===13)printable++;
    if(x>=128)high++;
    if(x===0)zero++;
  }
  return {printable,asciiGraphic,high,zero,
    first32hex:b.subarray(0,32).toString('hex'),
    first48display:Array.from(b.subarray(0,48),x=>x>=32&&x<=126?String.fromCharCode(x):'.').join('')};
}
/** @returns {void} */
function main() {
  const root=path.join(__dirname,'..');
  const read=name=>JSON.parse(fs.readFileSync(path.join(root,'resources','liber-primus',name),'utf8'));
  const corpus=read('lp2-corpus.json'), grid=read('lp2-grid-256.json');
  const title=corpus.pages.find(p=>p.page===0).indices.slice(0,13);
  assert.deepEqual(title,[15,8,18,3,6,19,27,0,15,26,18,21,5]);
  const sums=[title.slice(0,8),title.slice(8)].map(a=>a.reduce((n,c)=>n+corpus.prime[c],0));
  assert.deepEqual(sums,[347,315]);
  const rows=sums[0]-sums[1],row=sums[0]%rows;
  assert.equal(rows,32);assert.equal(row,27);assert.equal(sums[1]%rows,row);
  assert.equal((sums[0]+sums[1])/2,331);
  assert.equal(grid.bytes.length,256);
  assert.equal(grid.pages.reduce((n,p)=>n+p.tokens.length,0),256);
  assert.equal(grid.alphabet.length,60);
  const bytes=Buffer.from(grid.bytes),key=bytes.subarray(row*8,row*8+8);
  assert.equal(key.toString('hex'),'8edb943b3a343397');
  const tokens=grid.pages.flatMap(p=>p.tokens);
  const originalTokensAsBytes=tokens.map(t=>grid.alphabet.indexOf(t[0])*60+grid.alphabet.indexOf(t[1]));
  assert.deepEqual(originalTokensAsBytes,grid.bytes);
  // Independent published DES FIPS known-answer test.
  const testKey=Buffer.from('133457799bbcdff1','hex');
  const pt=Buffer.from('0123456789abcdef','hex');
  const ct=Buffer.from('85e813540f0ab405','hex');
  assert.deepEqual(cipher(pt,testKey,null,'ecb',true),ct);
  assert.deepEqual(cipher(ct,testKey,null,'ecb',false),pt);
  const modes=[];
  for(const mode of ['ecb','cbc'])
    for(const ivType of mode==='ecb'?['none']:['zero','rowkey']){
      const iv=mode==='ecb'?null:(ivType==='zero'?Buffer.alloc(8):key);
      for(const direction of ['decrypt','encrypt']){
        const enc=direction==='encrypt';
        const output=cipher(bytes,key,iv,mode,enc);
        assert.deepEqual(cipher(output,key,iv,mode,!enc),bytes);
        const plant=Buffer.from('AN END WITHIN THE DEEP WEB '.repeat(11).slice(0,256),'ascii');
        assert.deepEqual(cipher(cipher(plant,key,iv,mode,true),key,iv,mode,false),plant);
        modes.push({mode,ivType,direction,...describe(output)});
      }
    }
  assert.equal(modes.length,6);
  console.log(JSON.stringify({title:title.map(i=>corpus.translit[i]),sums,row,
    rowKeyHex:key.toString('hex'),tableBytes:bytes.length,
    controlCiphertext:ct.toString('hex'),solvedTextPlantBytes:256,modes,
    conclusion:'No plain ASCII or recognizable file header. Source selects no DES opcode; no unknown manuscript plaintext.'},null,2));
}

/** @param {number[]} a @returns {number} */
function ioc29(a) {
  const hist=Array(29).fill(0);
  for(const v of a)hist[v]++;
  return hist.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
/** @param {Buffer} key @param {'ofb'|'ctr'} mode @param {Buffer} iv @param {number} length @returns {Buffer} */
function desStream(key,mode,iv,length){
  const triple=Buffer.concat([key,key,key]);
  if(mode==='ofb'){
    const cipher=crypto.createCipheriv('des-ede3-ofb',triple,iv);
    return Buffer.concat([cipher.update(Buffer.alloc(length)),cipher.final()]);
  }
  const cipher=crypto.createCipheriv('des-ede3-ecb',triple,null);
  cipher.setAutoPadding(false);
  const blocks=Math.ceil(length/8),input=Buffer.alloc(blocks*8);
  for(let b=0;b<blocks;b++)input.writeBigUInt64BE(iv.readBigUInt64BE()+BigInt(b),b*8);
  return Buffer.concat([cipher.update(input),cipher.final()]).subarray(0,length);
}
/**
 * Bounded single-key extension: the same row27 may point to a key for
 * the 729-runic opening p0-p2, rather than to a table-on-itself DES block.
 * No post-hoc key adjustments, only historical DES OFB/CTR keystreams.
 * @returns {void}
 */
function gpMain(){
  const root=path.join(__dirname,'..');
  const read=name=>JSON.parse(fs.readFileSync(path.join(root,'resources','liber-primus',name),'utf8'));
  const corpus=read('lp2-corpus.json'),grid=read('lp2-grid-256.json');
  const first=corpus.pages.filter(p=>p.page>=0&&p.page<=2);
  assert.deepEqual(first.map(p=>p.indices.length),[262,266,201]);
  const original=first.flatMap(p=>p.indices),plainControl=corpus.pages.find(p=>p.page===57).indices;
  assert.equal(original.length,729);
  assert.equal(plainControl.length,95);
  const key=Buffer.from(grid.bytes.slice(27*8,28*8));
  assert.equal(key.toString('hex'),'8edb943b3a343397');
  const mod29=x=>(x%29+29)%29;
  const cases=[];
  for(const mode of ['ofb','ctr'])
    for(const ivType of ['zero','rowkey'])
      for(const reduction of ['mod','scaled'])
        for(const sign of [-1,1]){
          const iv=ivType==='zero'?Buffer.alloc(8):key;
          const pad=desStream(key,mode,iv,original.length);
          const digits=Array.from(pad,x=>reduction==='mod'?x%29:Math.floor(x*29/256));
          const decoded=original.map((c,i)=>mod29(c+sign*digits[i]));
          assert.deepEqual(decoded.map((p,i)=>mod29(p-sign*digits[i])),original);
          const plantedCipher=plainControl.map((p,i)=>mod29(p-sign*digits[i]));
          assert.deepEqual(plantedCipher.map((c,i)=>mod29(c+sign*digits[i])),plainControl);
          cases.push({mode,ivType,reduction,sign,openingIoc:ioc29(decoded),
            blackBodyIoc:ioc29(decoded.slice(13)),
            first24:decoded.slice(0,24).map(c=>corpus.translit[c]).join(' ')});
        }
  assert.equal(cases.length,16);
  cases.sort((a,b)=>b.blackBodyIoc-a.blackBodyIoc);
  console.log(JSON.stringify({
    sourceOriginal:'p0-p2, 729 GP29 runes',
    titleKeyHex:key.toString('hex'),maxFirstChapterIoc:cases[0].openingIoc,
    maxBlackBodyIoc:cases[0].blackBodyIoc,
    originalIoc:ioc29(original),solvedP57Ioc:ioc29(plainControl),
    variants:cases, eachVariantNativeGPPlant:95,
    conclusion:'Source-selected row27 direct DES OFB/CTR GP29-pad hypotheses do not recover coherent original text.'},null,2));
}

if(require.main===module){main();gpMain();}
module.exports={cipher,describe,main,gpMain};
