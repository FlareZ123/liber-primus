'use strict';
/** Source-locked full p50 Bitcoin address on the authentic signed 2016 back-to-LP image.
 * Windows/Unix Node22, historical OutGuess 0.4 on PATH.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os');
const path=require('node:path'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const expected=read('resources/historical/cicada2016-4gq25-outguess.asc');
assert.equal(expected.length,1136);
assert.equal(sha(expected),'fe89e77519dfaca998a257ed39c2861303029de2a49183db00eea0fda3a28010');
const grid=JSON.parse(read('resources/liber-primus/base60-grid.json').toString('utf8'));
assert.equal(grid.alphabet,'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
const key=Buffer.from(grid.rows.map(row=>{
 const token=row[4],alphabet=grid.alphabet;
 const n=alphabet.indexOf(token[0])*60+alphabet.indexOf(token[1]);
 assert.ok(token.length===2&&n>=0&&n<=255);
 return n;
}));
assert.equal(key.toString('hex'),'61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4');
const ecdh=crypto.createECDH('secp256k1');ecdh.setPrivateKey(key);
const digest=b=>crypto.createHash('sha256').update(b).digest();
const pub=ecdh.getPublicKey(undefined,'compressed');
const versionPayload=Buffer.concat([Buffer.alloc(1),
 crypto.createHash('ripemd160').update(digest(pub)).digest()]);
const bytes=Buffer.concat([versionPayload,digest(digest(versionPayload)).subarray(0,4)]);
const abc='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
let num=BigInt('0x'+bytes.toString('hex')),address='';
while(num>0n){address=abc[Number(num%58n)]+address;num/=58n;}
for(let i=0;i<bytes.length&&bytes[i]===0;i++)address='1'+address;
assert.equal(address,'1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK');
const original=path.join(root,'resources/historical/cicada2016-4gq25.jpg');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'lp2016-meanpng-'));
/** @param {string|null} password @param {string} to */
function extract(password,to){
 const args=[...(password===null?[]:['-k',password]),'-r',original,to];
 const result=spawnSync('outguess',args,{encoding:'utf8',timeout:90000,maxBuffer:1024*1024});
 const log=(result.stdout??'')+'\n'+(result.stderr??'');
 const m=/Steg retrieve:\s*seed:\s*(\d+),\s*len:\s*(\d+)/i.exec(log);
 const payload=fs.existsSync(to)?fs.readFileSync(to):Buffer.alloc(0);
 const valid=result.status===0&&m!==null&&payload.length===Number(m[2])&&payload.length>0;
 return {valid,status:result.status,signal:result.signal,seed:m?Number(m[1]):null,
   advertisedBytes:m?Number(m[2]):null,extractedBytes:valid?payload.length:0,
   sha256:valid?sha(payload):null,matchesHistorical:valid&&payload.equals(expected),
   beginsPGP:valid&&payload.toString('ascii').startsWith('-----BEGIN PGP SIGNED MESSAGE-----'),
   prefix:valid?payload.subarray(0,80).toString('latin1').replace(/[^\x20-\x7e]/g,'.'):null,
   diagnostic:log.trim().slice(-400)};
}
try{
 const control=extract(null,path.join(tmp,'known2016.asc'));
 assert.ok(control.valid&&control.matchesHistorical&&control.seed===230);
 console.log('AUTHENTIC_2016_OUTGUESS_POSITIVE '+JSON.stringify(control));
 const candidate=extract(address,path.join(tmp,'p50-address.bin'));
 console.log('ORIGINAL_2016_MEANPNG_OUTGUESS '+JSON.stringify({
   receiver:'signed2016 4gq25.jpg',derivedAddress:address,candidate}));
 if(candidate.valid&&!candidate.matchesHistorical){
  console.log('UNVERIFIED_NEW_PAYLOAD_CHECK_AUTHENTICITY '+JSON.stringify(candidate));
 }
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
