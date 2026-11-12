'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const base=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/base60-grid.json'),'utf8'));
const grid=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-grid-256.json'),'utf8'));
const values=base.byte_rows.flat(), tokens=base.rows.flat(), bytes=Buffer.from(grid.bytes);
assert.equal(values.length,256); assert.equal(tokens.length,256); assert.equal(bytes.length,256);
assert.deepEqual(values,grid.bytes);
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.equal(new Set(values).size,161); assert.equal(values.filter(x=>x===0).length,2);
assert.ok(values.every(x=>Number.isInteger(x)&&x>=0&&x<=255));
function walk(start){
 const seen=new Map(),cells=[],pointers=[]; let n=start;
 while(n>=1&&n<=256&&!seen.has(n)){seen.set(n,cells.length);cells.push(n);const v=values[n-1];pointers.push(v);n=v;}
 return {cells,pointers,cycle:seen.has(n)?{at:n,firstSeen:seen.get(n),length:cells.length-seen.get(n)}:null,stop:n<1||n>256?n:null};
}
const w=walk(119);
assert.deepEqual(w.cells,[119,35,197,176,18,202,74,79,46,107,31,141,245,22,137,10,249,113,73,164,82,58,118,171,254,36,39,133,169,240,173,148]);
assert.deepEqual(w.pointers,[35,197,176,18,202,74,79,46,107,31,141,245,22,137,10,249,113,73,164,82,58,118,171,254,36,39,133,169,240,173,148,173]);
assert.deepEqual(w.cycle,{at:173,firstSeen:30,length:2}); assert.equal(w.cells.length,32);
const longStarts=Array.from({length:256},(_,i)=>walk(i+1)).filter(x=>x.cells.length>=30).length;
assert.equal(longStarts,63);
const keys=new Map([
 ['pointer-values',Buffer.from(w.pointers)],
 ['visited-cell-addresses',Buffer.from(w.cells)],
 ['pointer-values-minus1',Buffer.from(w.pointers.map(x=>x-1))],
 ['visited-cell-addresses-minus1',Buffer.from(w.cells.map(x=>x-1))]
]);
for(const k of keys.values()) assert.equal(k.length,32);
const pathTokenText=Buffer.from(w.cells.map(c=>tokens[c-1]).join(''),'ascii');
assert.equal(pathTokenText.length,64);
const col=[]; for(let c=0;c<8;c++)for(let r=0;r<32;r++)col.push(bytes[8*r+c]);
const layouts=new Map([['row-major',bytes],['column-major',Buffer.from(col)]]);
const sigs=['255044462d','89504e470d0a1a0a','504b0304','1f8b08','ffd8ff','425a68','fd377a585a00','28b52ffd','53514c69746520666f726d6174203300','7f454c46','47494638'];
function metrics(b){
 let printable=0,run=0,longest=0;
 for(const x of b){if((x>=32&&x<=126)||x===9||x===10||x===13)printable++;if(x>=32&&x<=126){run++;longest=Math.max(longest,run);}else run=0;}
 const magic=sigs.some(h=>b.subarray(0,h.length/2).toString('hex')===h);
 return {printable,longest,magic};
}
function aes(mode,key,data){
 const iv=mode==='ecb'?null:Buffer.alloc(16);
 const d=crypto.createDecipheriv('aes-256-'+mode,key,iv);
 if(mode!=='ctr')d.setAutoPadding(false);
 return Buffer.concat([d.update(data),d.final()]);
}
const results=[];
for(const [kn,key] of keys)for(const [ln,data] of layouts){
 const x=Buffer.from(data.map((b,i)=>b^key[i%32]));
 results.push({key:kn,layout:ln,mode:'XOR',...metrics(x)});
 for(const mode of ['ecb','cbc','ctr'])results.push({key:kn,layout:ln,mode:'AES256-'+mode,...metrics(aes(mode,key,data))});
}
assert.equal(results.length,32); assert.ok(results.every(x=>!x.magic&&x.printable<128));
const target='36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const hashInputs=new Map([...keys,['path-token-text',pathTokenText]]);
const hashes=[
 ['SHA-512',b=>crypto.createHash('sha512').update(b).digest('hex')],
 ['SHA3-512',b=>crypto.createHash('sha3-512').update(b).digest('hex')],
 ['BLAKE2b-512',b=>crypto.createHash('blake2b512').update(b).digest('hex')],
 ['SHAKE256-64',b=>crypto.createHash('shake256',{outputLength:64}).update(b).digest('hex')]
];
const digestResults=[];
for(const [name,input] of hashInputs)for(const [alg,fn] of hashes){const digest=fn(input);digestResults.push({input:name,algorithm:alg,digest,match:digest===target});}
assert.equal(digestResults.length,20); assert.ok(digestResults.every(x=>!x.match));
const summary={};
for(const mode of ['XOR','AES256-ecb','AES256-cbc','AES256-ctr']){
 const a=results.filter(x=>x.mode===mode);
 summary[mode]={n:a.length,minPrintable:Math.min(...a.map(x=>x.printable)),maxPrintable:Math.max(...a.map(x=>x.printable)),maxAsciiRun:Math.max(...a.map(x=>x.longest)),magic: a.filter(x=>x.magic).length};
}
console.log(JSON.stringify({
 sourceTable:{bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),uniqueValues:new Set(values).size,zeroBytes:values.filter(x=>x===0).length},
 walk:{start:119,cells:w.cells,pointers:w.pointers,cycle:w.cycle,otherStartsAtLeast30:longStarts},
 keys:Object.fromEntries([...keys].map(([n,b])=>[n,b.toString('hex')])),
 directConsumers:summary,
 hashTarget:target,
 digestResults,
 conclusion:'No direct repeating-XOR or zero-IV AES-256 table plaintext; no fixed pointer-path serialization matches p56 under the four tested 512-bit digest families. Pointer-walk rule remains speculative.'
},null,2));
