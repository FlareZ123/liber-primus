'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const https = require('node:https');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const archive = '76d3ee8c762f60025822c8c05edbf31351636469';
const urlBase = 'https://raw.githubusercontent.com/krisyotam/cicada3301/' + archive +
  '/puzzles/2014/assets/stage06/';
const sources = [
  ['index.1.outguess','29d8fe5c4b6f2b245e367077dc6c752204707c7e'],
  ['index.2.outguess','fc8bc6ff96e8c1078d9a231e89e18d56c708708f'],
  ['index.3.outguess','d7844fa0bbedfcf4e9862a1d43f565717789cb86']
];

/** @param {Buffer} b @returns {string} */
const gitSha = b => crypto.createHash('sha1').update(
  Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
/** @param {string} url @returns {Promise<Buffer>} */
function get(url) {
  return new Promise((resolve,reject)=>{
    https.get(url,{headers:{'User-Agent':'lp2-original-stage06-pad-direct-gate'}},r=>{
      if(r.statusCode!==200){r.resume();reject(new Error('HTTP '+r.statusCode));return;}
      const chunks=[];r.on('data',b=>chunks.push(b));
      r.on('end',()=>resolve(Buffer.concat(chunks)));r.on('error',reject);
    }).on('error',reject);
  });
}
/** @param {number} n @returns {number} */
const mod=n=>(n%29+29)%29;
/** @param {number[]} v @returns {number} */
function ic(v){
  const freq=Array(29).fill(0);
  for(const x of v)freq[x]++;
  return freq.reduce((t,n)=>t+n*(n-1),0)/(v.length*(v.length-1));
}
/**
 * Source-fixed zero-offset per-book additive or feedback inversion.
 * @param {number[]} ciphertext
 * @param {Buffer} key
 * @param {'direct'|'feedback'} mode
 * @param {number} sign
 * @returns {number[]}
 */
function decode(ciphertext,key,mode,sign){
  assert.ok(key.length>=ciphertext.length);
  const out=[];
  for(let i=0;i<ciphertext.length;i++){
    const c=ciphertext[i], previous=mode==='feedback'&&i>0?ciphertext[i-1]:0;
    out.push(mod(c-previous+sign*(key[i]%29)));
  }
  return out;
}
/** @param {number[]} plaintext @param {Buffer} key @param {string} mode @param {number} sign */
function encode(plaintext,key,mode,sign){
  const out=[];
  for(let i=0;i<plaintext.length;i++){
    const previous=mode==='feedback'&&i>0?out[i-1]:0;
    out.push(mod(plaintext[i]+previous-sign*(key[i]%29)));
  }
  return out;
}
async function main(){
  const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
  const pages=corpus.pages.filter(p=>p.page<=55);
  assert.equal(pages.length,56);
  const ciphertext=pages.flatMap(p=>p.indices);
  assert.equal(ciphertext.length,12956);
  const pageLengths=pages.map(p=>p.indices.length);
  const originalBaseline=ic(ciphertext);
  let pads=[];
  for(const [name,sha] of sources){
    const data=await get(urlBase+name);
    assert.equal(data.length,58152);
    assert.equal(gitSha(data),sha);
    pads.push({name,data});
  }
  for(let i=0;i<3;i++)for(let j=i+1;j<3;j++){
    const v=Buffer.alloc(58152);
    for(let k=0;k<v.length;k++)v[k]=pads[i].data[k]^pads[j].data[k];
    pads.push({name:sources[i][0]+' XOR '+sources[j][0],data:v});
  }
  const xyz=Buffer.alloc(58152);
  for(let k=0;k<xyz.length;k++)xyz[k]=pads[0].data[k]^pads[1].data[k]^pads[2].data[k];
  pads.push({name:'three-way XOR',data:xyz});
  const plant=corpus.pages.find(p=>p.page===57).indices;
  assert.equal(plant.length,95);

  const trials=[];
  for(const {name,data} of pads){
    for(const mode of ['direct','feedback'])for(const sign of [-1,1]){
      const encoded=encode(plant,data,mode,sign);
      const recovered=decode(encoded,data,mode,sign);
      assert.deepEqual(recovered,plant);
      const output=decode(ciphertext,data,mode,sign);
      let offset=0;
      const pageIc=pageLengths.map((n,i)=>{
        const value=n>=30?ic(output.slice(offset,offset+n)):null;
        offset+=n;return value;
      });
      trials.push({
        source:name,mode,sign,
        wholeIc:ic(output),
        page0Ic:pageIc[0],page1Ic:pageIc[1],
        pagesAbovePoint05:pageIc.filter(x=>x!==null&&x>=0.05).length,
        pageMaxIc:Math.max(...pageIc.filter(x=>x!==null)),
        sourceFirst50:output.slice(0,50).map(x=>corpus.translit[x]).join(''),
        plant95Perfect:true
      });
    }
  }
  const byWhole=trials.slice().sort((a,b)=>b.wholeIc-a.wholeIc);
  console.log(JSON.stringify({
    scope:'2014 Stage06 original OutGuess source pad direct zero-byte offset and ciphertext-feedback, both signs, 3 singles, 3 pairwise XOR and triple XOR, full unknown GP rune stream',
    originalPageCount:pages.length, originalRunes:ciphertext.length,
    sourcesVerified:sources.map(x=>x[0]),
    sourceStartRule:'Exact original byte 0; no searched offset, no guessed symbol map, no F skipping, no per-page restart.',
    sourcePositiveControl:'Each of 28 variants encodes/decodes original solved p57 95-rune plaintext 95/95.',
    originalCipherWholeIc:originalBaseline,
    best10WholeIc:byWhole.slice(0,10),
    allTrials:trials,
    decision:'These exact arithmetic inverses do not establish a plaintext unless a coherent original sentence emerges; natural-language controls typically have IoC over 0.05, but IoC alone cannot exclude arbitrary language, chained encryptions, or other key extraction.'
  },null,2));
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={main,decode,encode,ic};
