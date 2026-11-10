/**
 * Build a reproducible Gematria Primus word-crib dictionary.
 *
 * From the repo root:
 *   node sims/php_wordlist.cjs resources/control/shakespeare_first300k.txt working/shakespeare.bin
 *
 * An optional Hunspell en_US.dic source yields a larger conditional screen.
 * The original Hunspell file is not redistributed. Record its checksum.
 * Output records: 1-byte rune length, 8-byte LE unsigned base-29 word.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const GP = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
const alphabet = new Map(GP.map((c,i)=>[c,i]));
const digraphs = ['TH','EO','OE','AE','IA','EA','NG'];

/** @param {string} raw @returns {number[]|null} */
function encode(raw) {
  const word=raw.toUpperCase().replace(/QU/g,'CW').replace(/ING/g,'NG')
    .replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S').replace(/Q/g,'C');
  const codes=[];
  for(let i=0;i<word.length;) {
    const rune=digraphs.find(x=>word.startsWith(x,i))||word[i];
    if(!alphabet.has(rune))return null;
    codes.push(alphabet.get(rune));
    i+=rune.length;
  }
  return codes;
}

/** @param {string} sourceText @param {boolean} isHunspell @returns {Buffer} */
function makeDictionary(sourceText,isHunspell) {
  const words=isHunspell
    ? sourceText.split(/\r?\n/).slice(1).map(x=>x.split('/')[0]).filter(x=>/^[A-Za-z]+$/.test(x))
    : sourceText.match(/[A-Za-z]+/g)||[];
  const seen=new Set();
  for(const word of new Set(words)) {
    for(const w of [word,word+'s',word+'ed',word+'ing',word+'er',word+'ly']) {
      const runes=encode(w);
      if(!runes||![4,5,8].includes(runes.length))continue;
      let n=0;
      for(const r of runes)n=29*n+r;
      seen.add(runes.length+':'+n);
    }
  }
  const keys=[...seen].map(s=>s.split(':').map(Number)).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  const data=Buffer.alloc(keys.length*9);
  keys.forEach(([len,n],i)=>{data.writeUInt8(len,i*9);data.writeBigUInt64LE(BigInt(n),i*9+1);});
  return data;
}

/** @param {string} source @param {string} target */
function build(source,target) {
  const input=fs.readFileSync(source,'utf8');
  const result=makeDictionary(input,path.extname(source).toLowerCase()==='.dic');
  fs.mkdirSync(path.dirname(target),{recursive:true});
  const lock=target+'.lock';
  const tmp=target+'.'+crypto.randomUUID()+'.tmp';
  const fd=fs.openSync(lock,'wx');
  try {
    fs.writeFileSync(tmp,result,{flag:'wx'});
    fs.renameSync(tmp,target);
  } finally {
    fs.closeSync(fd);
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.unlinkSync(lock);
  }
  console.log(JSON.stringify({source,target,sha256:crypto.createHash('sha256').update(input).digest('hex'),records:result.length/9,bytes:result.length}));
}
if(require.main===module) {
  const source=process.argv[2]||path.join(__dirname,'../resources/control/shakespeare_first300k.txt');
  const target=process.argv[3]||path.join(__dirname,'../workplace/php-words.bin');
  build(source,target);
}
module.exports={encode,makeDictionary,build};
