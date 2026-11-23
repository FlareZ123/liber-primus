'use strict';
/**
 * One frozen cross-round original-image gate.
 *
 * The genuine 2013 Gematria Primus JPEG, reconstructed from the historical
 * Twitter/761.MP3 XOR, is the first-party OutGuess carrier that disclosed the
 * 2013 telnet onion. Its authenticated no-password payload is a true positive.
 * The only candidate is the complete p50-derived Bitcoin P2PKH address.
 * A malformed OutGuess header is never counted as recovered plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname,'..');
const read = p => fs.readFileSync(path.join(root,p));
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const source = Buffer.from(read('resources/historical/cicada2013-gematria-jpeg.b64')
  .toString('ascii').replace(/\s/g,''),'base64');
assert.equal(source.length,64167);
const sha1Blob = b => crypto.createHash('sha1')
  .update(Buffer.concat([Buffer.from('blob '+b.length+'\0','ascii'),b])).digest('hex');
assert.equal(sha1Blob(source),'65ded13617196f0fd5d210855a75452ff2e7a340');
const known = read('resources/historical/cicada2013-gematria-jpeg-outguess.asc');
assert.equal(known.length,1443);
assert.equal(sha(known),'a7ff511db6bd352be0f41f1f512df127fa06b9e7f598bf072cd1b083be3b40fc');
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json').toString('utf8'));
assert.equal(grid.rows.length,32);
assert.equal(grid.alphabet,'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
const key = Buffer.from(grid.rows.map(row=>{
  const token=row[4],a=grid.alphabet;
  assert.equal(token.length,2);
  const v=a.indexOf(token[0])*60+a.indexOf(token[1]);
  assert.ok(v>=0&&v<=255);
  return v;
}));
assert.equal(key.toString('hex'),'61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4');
const ecdh = crypto.createECDH('secp256k1');
ecdh.setPrivateKey(key);
const pub=ecdh.getPublicKey(undefined,'compressed');
const sha256=b=>crypto.createHash('sha256').update(b).digest();
const h160=crypto.createHash('ripemd160').update(sha256(pub)).digest();
const payload=Buffer.concat([Buffer.alloc(1),h160]);
const full=Buffer.concat([payload,sha256(sha256(payload)).subarray(0,4)]);
const chars='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
let n=BigInt('0x'+full.toString('hex')), address='';
while(n>0n){address=chars[Number(n%58n)]+address;n/=58n;}
for(let i=0;i<full.length&&full[i]===0;i++)address='1'+address;
assert.equal(address,'1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'lp2013-meanpng-outguess-'));
/**
 * @param {string} filename
 * @param {string} output
 * @param {string|null} password
 */
function extract(filename,output,password){
  const args=[...(password===null?[]:['-k',password]),'-r',filename,output];
  const r=spawnSync('outguess',args,{encoding:'utf8',timeout:60000,maxBuffer:1024*1024});
  const log=(r.stdout??'')+'\n'+(r.stderr??'');
  const m=/Steg retrieve:\s*seed:\s*(\d+),\s*len:\s*(\d+)/i.exec(log);
  const bytes=fs.existsSync(output)?fs.readFileSync(output):Buffer.alloc(0);
  const valid=r.status===0&&m!==null&&bytes.length===Number(m[2])&&bytes.length>0;
  return {valid,status:r.status,signal:r.signal,seed:m?Number(m[1]):null,
    claimedLength:m?Number(m[2]):null,filesRecovered:valid?1:0,
    bytes:valid?bytes.length:0,sha256:valid?sha(bytes):null,
    matchesHistorical2013:valid&&bytes.equals(known),
    pgp:valid&&bytes.toString('ascii').startsWith('-----BEGIN PGP SIGNED MESSAGE-----'),
    signature:valid?bytes.subarray(0,20).toString('hex'):null,
    outputPrefix:valid?bytes.subarray(0,80).toString('latin1').replace(/[^\x20-\x7e]/g,'.'):null,
    log:log.trim().slice(-500)};
}
try {
  const jpeg=path.join(dir,'original2013.jpg');
  fs.writeFileSync(jpeg,source,{flag:'wx'});
  const positive=extract(jpeg,path.join(dir,'known-signed-message.asc'),null);
  assert.equal(positive.valid,true,'authentic historical original OutGuess recovery');
  assert.equal(positive.bytes,1443);
  assert.equal(positive.seed,17);
  assert.equal(positive.matchesHistorical2013,true);
  console.log('AUTHENTIC_2013_OUTGUESS_POSITIVE '+JSON.stringify(positive));
  const candidate=extract(jpeg,path.join(dir,'meanpng-only.bin'),address);
  console.log('ORIGINAL_2013_MEANPNG_OUTGUESS '+JSON.stringify({
    source:'2013 GP image from authentic Twitter XOR',
    imageBytes:source.length,address,
    candidate,originalHistoricalPassphrase:'(no -k; successful source control)' }));
  if(candidate.valid&&!candidate.matchesHistorical2013){
    console.log('NEW_PAYLOAD_REQUIRES_ADVERSARIAL_AUTHENTICATION sha256='+candidate.sha256);
  }
} finally {
  fs.rmSync(dir,{recursive:true,force:true});
}
