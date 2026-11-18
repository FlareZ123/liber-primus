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
if(require.main===module)main();
module.exports={cipher,describe,main};
