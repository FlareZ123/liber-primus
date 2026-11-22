'use strict';
/**
 * Recovered period-original 2014 IRC code/source inputs, exact source controls,
 * authentic p56 decryption and untouched unknown p0/p54 tests.
 * Node.js 22 CommonJS with only standard-library dependencies.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.join(__dirname,'..');
const dir=path.join(root,'resources','external','2014-irc-shared');
const sources=[
 ['cluosh-vigenere-brute-R01rN7ZX.txt',9387,'832e9991c588fcc781d5b10b5211b0acc36276f17db65008e50de6cf86783113'],
 ['sol2ton-p56-decoder-LHTRYZjv.py',1470,'a0c175b5656f32cce3ae12d691bee508fbd20d4f8c6a974e660f1cbe1ec8d064'],
 ['sol2ton-p56-input-Cv2yHt1K.txt',411,'05769088c5ebc2bd20c7659d73d08b8d729666c8db3456da810d601fef1367d4'],
 ['anoniem4l-modcracker-M5BccDpT.py',819,'47e381df923160018b23e97674c6ea7502cbba6c2fb8784dc3ed1a726b3d4524'],
 ['hydroperoxy-crib-isa7Hh1x.txt',145,'20b3f385d2e778e7fe9f95409d88e6fe60c8b8f130099ee5eecd35a982939bc0'],
 ['shaggydog-p54-BgYrwudm.txt',518,'05d77b618d53f1e9062afddce72cae522d84a2d1ef3844c52920fec7f1fab3ac'],
 ['shaggydog-p0-6jznh1UD.txt',590,'3bb5f5239e222465139a7f4762a9aea1a421dcb615ad480cee4686fa1f9de2f1'],
 ['idontworkfor3301-crib-kRHEVgjj.txt',193,'b61ba9e3678b84312d3b342bd6174d5890de6a92840403590b0bf8f60b5b03b5']
];
/** @param {string} name */
const read=name=>fs.readFileSync(path.join(dir,name),'utf8');
for(const [name,length,sha] of sources){
 const b=fs.readFileSync(path.join(dir,name));
 assert.equal(b.length,length,'Original source length '+name);
 assert.equal(crypto.createHash('sha256').update(b).digest('hex'),sha,'Original source SHA '+name);
}
console.log('PASS all eight 2014 original shared files, SHA256 and byte-length pinned');
const book=JSON.parse(fs.readFileSync(path.join(root,'resources','liber-primus','lp2-corpus.json'),'utf8'));
const alphabet=book.translit;
const page=n=>book.pages.find(p=>p.page===n).indices;
const mod=x=>(x%29+29)%29;
/** @param {number} count */
function primes(count){
 const out=[];
 for(let n=2;out.length<count;n++)if(out.every(p=>p*p>n||n%p!==0))out.push(n);
 return out;
}
/** May 25 Python script's exact skip=56 and addition=1 rule.
 * @param {number[]} values
 */
function originalDecoder(values){
 const ps=primes(values.length);let k=0;
 return values.map((x,i)=>i===56?x:mod(x-ps[k++]+1));
}
/** @param {string} s */
function native(s){
 const options=alphabet.map((v,i)=>({v,i})).sort((a,b)=>b.v.length-a.v.length);
 const ret=[];
 for(const word of s.trim().split(/\s+/))for(let i=0;i<word.length;){
  const x=options.find(o=>word.startsWith(o.v,i));
  assert(x,'Unencodable GP spelling '+word.slice(i));
  ret.push(x.i);i+=x.v.length;
 }
 return ret;
}
const hParts=read('sol2ton-p56-input-Cv2yHt1K.txt').split(/\r?\n\s*\r?\n/);
assert.equal(hParts.length,3);
const historical56=[hParts[0],hParts[2]].flatMap(x=>(x.match(/\b\d{1,2}\b/g)||[]).map(Number));
assert.deepEqual(historical56,page(56));
const code=read('sol2ton-p56-decoder-LHTRYZjv.py');
assert(/skip\s*=\s*56\b/.test(code));
assert(/addition\s*=\s*1\b/.test(code));
assert(/rune\s*-\s*prime\s*\+\s*addition/.test(code));
assert(/primes\.next\(\)/.test(code));
const expected=native('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE');
assert.deepEqual(originalDecoder(historical56),expected,'Original 2014 script on authentic original page56');
assert.equal(historical56[56],0);
console.log('PASS original May 2014 p56 decoder authentic plaintext 85/85 with exact F56 skip');
/** @param {number[]} values */
function ioc(values){
 const h=Array(29).fill(0);values.forEach(x=>h[x]++);
 return h.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
/** @param {string} filename */
function historicalLabels(filename){
 return read(filename).trim().split(/[.\-\s]+/).filter(Boolean).map(s=>{
  const i=alphabet.indexOf(s);assert(i>=0,'Unrecognized source GP label '+s);return i;
 });
}
for(const [p,source] of [[0,'shaggydog-p0-6jznh1UD.txt'],[54,'shaggydog-p54-BgYrwudm.txt']]){
 const original=page(p),old=historicalLabels(source),mis=[];
 for(let i=0;i<Math.min(original.length,old.length);i++)
  if(original[i]!==old[i])mis.push({offset:i,old:alphabet[old[i]],canonical:alphabet[original[i]]});
 assert.notEqual(original[56],0,'F at local56 is a page56-specific control');
 const candidate=originalDecoder(original);
 console.log(JSON.stringify({page:p,originalRunes:original.length,periodCopyRunes:old.length,
  oldSourceDifferences:mis,actualCipherFAtOffset56:false,
  historicalScriptFirst40:candidate.slice(0,40).map(x=>alphabet[x]),
  ioc:ioc(candidate),unknownPlaintextRecovered:false}));
}
console.log('PASS bounded period-original method. No decipherment on p0 or p54.');
