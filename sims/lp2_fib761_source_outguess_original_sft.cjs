'use strict';
/**
 * One Fibonacci-picked original p27 GP name password on actual JPEG carriers,
 * using period-native OutGuess 0.4 with the original signed 2016 payload
 * as exact positive and a separately planted known-key positive.
 * Source-readable, locked and atomic outputs for independent adjudication.
 * Usage: node sims/lp2_fib761_source_outguess_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'outguess-fib761-source-results');
const candidates = [
  {page: 27, file: '44.jpg', reason: 'source wing/insect image whose F16 black-body prime sum is 761'},
  {page: 55, file: '72.jpg', reason: 'six-rune terminal echo of the page27 manuscript'},
  {page: 0, file: '17.jpg', reason: 'unrelated original-image negative-carrier control'}
];
const original = path.join(root, 'resources/liber-primus');
const historical = path.join(root, 'resources/historical');
const hash = buffer => crypto.createHash('sha256').update(buffer).digest('hex');
const printableFraction = buffer => buffer.length === 0 ? 0 :
  buffer.reduce((sum, b) => sum + Number(b === 9 || b === 10 || b === 13 || (b >= 32 && b < 127)), 0) / buffer.length;

/** @param {string[]} argv */
function outguess(argv) {
  const run = spawnSync('outguess', argv, {encoding:'utf8', timeout:120000, maxBuffer:1024*1024});
  assert(!run.error, 'OutGuess execution: ' + run.error);
  return run;
}
function exactEqualFile(target, bytes) {
  assert(fs.existsSync(target), 'Missing independently known original signed text');
  assert(fs.readFileSync(target).equals(bytes));
}
/** @param {string} destination @param {Buffer|string} data */
function atomicWrite(destination, data) {
  const partial = destination + '.' + process.pid + '.tmp';
  fs.writeFileSync(partial, data, {flag:'wx'});
  fs.renameSync(partial, destination);
}
function signatures(bytes) {
  const starts = h => bytes.length >= h.length / 2 &&
    bytes.subarray(0,h.length/2).equals(Buffer.from(h,'hex'));
  const out = [];
  if (starts('1f8b08')) out.push('gzip');
  if (starts('504b0304')) out.push('zip');
  if (starts('89504e470d0a1a0a')) out.push('png');
  if (starts('25504446')) out.push('pdf');
  if (bytes.subarray(0,28).toString('ascii').startsWith('-----BEGIN PGP')) out.push('pgp');
  if (bytes.length >= 48 && printableFraction(bytes) >= .96) out.push('text96');
  return out;
}
function main() {
  const test = spawnSync(process.execPath, [
    path.join(__dirname,'lp2_fib761_openpuff_password_sft.cjs')
  ], {encoding:'utf8',timeout:5000});
  assert.equal(test.status,0,'Original F16 source selector SFT failed');
  const password=test.stdout.trim();
  assert.equal(password,'NHGUHFERMRNGYOEBIAM');
  fs.mkdirSync(output,{recursive:true});
  const lock=path.join(output,'.scan.lock');
  const lockFd=fs.openSync(lock,'wx');
  const scratch=path.join(output,'extract-'+process.pid+'.tmp');
  const plantPath=path.join(output,'plant-original-'+process.pid+'.txt');
  const plantCarrier=path.join(output,'plant-carrier-'+process.pid+'.jpg');
  try {
    const signedPic=path.join(historical,'cicada2016-4gq25.jpg');
    const signedPayload=path.join(historical,'cicada2016-4gq25-outguess.asc');
    fs.rmSync(scratch,{force:true});
    const old=outguess(['-r',signedPic,scratch]);
    assert.equal(old.status,0,old.stderr);
    exactEqualFile(signedPayload,fs.readFileSync(scratch));
    const historicalPositive={bytes:fs.statSync(scratch).size,sha256:hash(fs.readFileSync(scratch))};
    fs.rmSync(scratch,{force:true});

    const plant=Buffer.from('SOURCE-SELECTED-FIBONACCI761-OUTGUESS-POSITIVE\n');
    atomicWrite(plantPath,plant);
    const embedded=outguess(['-k',password,'-d',plantPath,path.join(original,'44.jpg'),plantCarrier]);
    assert.equal(embedded.status,0,embedded.stderr);
    const recovered=outguess(['-k',password,'-r',plantCarrier,scratch]);
    assert.equal(recovered.status,0,recovered.stderr);
    assert(fs.readFileSync(scratch).equals(plant),'Native key/passphrase positive mismatch');
    fs.rmSync(scratch,{force:true});
    const report={candidate:password,construction:'16 Fib-picked GP rune labels from original p27 black body',historicalPositive,plantedPositive:{exact:true,bytes:plant.length},candidates:[]};
    for(const item of candidates) {
      const image=path.join(original,item.file);
      fs.rmSync(scratch,{force:true});
      const rr=outguess(['-k',password,'-r',image,scratch]);
      const text=(rr.stdout||'')+'\n'+(rr.stderr||'');
      const hit=/Steg retrieve:\s*seed:\s*(\d+),\s*len:\s*(\d+)/i.exec(text);
      const bytes=fs.existsSync(scratch)?fs.readFileSync(scratch):Buffer.alloc(0);
      const evidence={...item,exitCode:rr.status,exitSignal:rr.signal||null,executionError:rr.error?String(rr.error):null,stdout:rr.stdout.slice(0,1500),stderr:rr.stderr.slice(0,1500),
        header:hit?{seed:Number(hit[1]),bytes:Number(hit[2])}:null,
        recoveredBytes:bytes.length,hash:bytes.length?hash(bytes):null,
        prefixHex:bytes.subarray(0,48).toString('hex'),
        printableRatio:printableFraction(bytes),signatures:signatures(bytes)};
      if(bytes.length) {
        const filename='candidate-p'+item.page+'.bin';
        atomicWrite(path.join(output,filename),bytes);
        evidence.extractionFile=filename;
      }
      report.candidates.push(evidence);
      fs.rmSync(scratch,{force:true});
    }
    atomicWrite(path.join(output,'summary.json'),JSON.stringify(report,null,2)+'\n');
    process.stdout.write('FIB761_ORIGINAL_OUTGUESS_SUMMARY '+JSON.stringify(report)+'\n');
  } finally {
    for(const file of [scratch,plantPath,plantCarrier])fs.rmSync(file,{force:true});
    fs.closeSync(lockFd);
    fs.rmSync(lock,{force:true});
  }
}
if(require.main===module)main();
module.exports={main};
