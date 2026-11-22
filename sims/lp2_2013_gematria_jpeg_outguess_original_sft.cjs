'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

// Exact original 2013 JPEG source; genuine 2016 signed source is the
// independent positive control for the same historical OutGuess 0.4 tool.
// No repository file is modified. All byproducts are in an isolated temp dir.
const ROOT = path.resolve(__dirname, '..');
const source = Buffer.from(
  fs.readFileSync(path.join(ROOT, 'resources/historical/cicada2013-gematria-jpeg.b64'), 'ascii').replace(/\s/g,''),
  'base64'
);
const positive = path.join(ROOT, 'resources/historical/cicada2016-4gq25.jpg');
const signed = fs.readFileSync(path.join(ROOT, 'resources/historical/cicada2016-4gq25-outguess.asc'));
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const sha1Blob = b => crypto.createHash('sha1')
  .update(Buffer.concat([Buffer.from('blob '+b.length+'\0','ascii'),b])).digest('hex');

assert.equal(source.length,64167);
assert.equal(sha1Blob(source),'65ded13617196f0fd5d210855a75452ff2e7a340');
assert.deepEqual([...source.subarray(0,4)],[255,216,255,224]);
assert.equal(signed.length,1136);
assert.equal(hash(signed),'fe89e77519dfaca998a257ed39c2861303029de2a49183db00eea0fda3a28010');

const temp = fs.mkdtempSync(path.join(os.tmpdir(),'cicada-original-2013-outguess-'));
/** @param {string} filename @param {string} output @param {string|null} key */
function retrieve(filename,output,key) {
  const args = [...(key?['-k',key]:[]),'-r',filename,output];
  const r = spawnSync('outguess',args,{encoding:'utf8',timeout:60000,maxBuffer:1024*1024});
  const log = (r.stdout||'')+'\n'+(r.stderr||'');
  const marker = /Steg retrieve:\s*seed:\s*(\d+),\s*len:\s*(\d+)/i.exec(log);
  const exists = fs.existsSync(output);
  const payload = exists?fs.readFileSync(output):Buffer.alloc(0);
  const valid = r.status===0&&!!marker&&payload.length===Number(marker[2])&&payload.length>0;
  return {
    valid,
    code:r.status,
    key:key??'(no password)',
    seed:marker?Number(marker[1]):null,
    bytes:valid?payload.length:0,
    sha256:valid?hash(payload):null,
    prefixHex:valid?payload.subarray(0,64).toString('hex'):null,
    prefixASCII:valid?payload.subarray(0,96).toString('latin1').replace(/[^\x20-\x7e]/g,'.'):null,
    pgp:valid&&payload.toString('ascii').startsWith('-----BEGIN PGP SIGNED MESSAGE-----'),
    matchesKnown2016:valid&&payload.equals(signed),
    diagnostic:log.trim().split('\n').filter(Boolean).slice(-3).join(' | ').slice(0,400)
  };
}
function main(){
  try{
    const input = path.join(temp,'gematria2013.jpg');
    fs.writeFileSync(input,source,{flag:'wx'});
    const control=retrieve(positive,path.join(temp,'2016-control.pgp'),null);
    assert.equal(control.valid,true,'historical OutGuess 2016 positive control');
    assert.equal(control.seed,230);
    assert.equal(control.bytes,1136);
    assert.equal(control.matchesKnown2016,true);
    const original=[];
    for(const key of [null,'3301','761','167']){
      const result=retrieve(input,path.join(temp,'source-'+(key??'none')+'.data'),key);
      original.push(result);
    }
    const output={
      source:'2013 exact GP chart recovered by the historically used Twitter/MP3 XOR',
      sourceGitBlob:'65ded13617196f0fd5d210855a75452ff2e7a340',
      originalJPEGBytes:source.length,
      originalJPEGsha256:hash(source),
      tool:'OutGuess 0.4 pinned upstream revision 24810e14327c2bbeedeaadd3e24491f2a4425c02',
      real2016PositiveControl:control,
      sourcePassphrases:[null,'3301','761','167'],
      original,
      result:original.some(x=>x.valid)?
        'At least one header-consistent original JPEG extraction found; needs independent PGP or payload validation.' :
        'No OutGuess payload under default or three source-named passwords; does not exclude other keys or JPEG channels.'
    };
    console.log('RESULT '+JSON.stringify(output,null,2));
  } finally {
    fs.rmSync(temp,{recursive:true,force:true});
  }
}
if(require.main===module)main();
module.exports={main};
