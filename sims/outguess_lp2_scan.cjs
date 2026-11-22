'use strict';

/**
 * Screen the original LP2 JPEGs for possible OutGuess 0.4 content, with authentic
 * LP1 positive controls. Requires the compiled OutGuess binary.
 * GitHub Actions invokes this only through workflow_dispatch.
 *
 * A header-consistent byte extraction is reported if OutGuess itself prints a
 * successful "Steg retrieve" header and produces that many data bytes.
 * Shared source-image templates can produce spurious plausible headers.\n * Header-consistent extractions require independent authentication.\n * Output is written atomically under a single-process directory lock.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const images = path.join(root, 'resources', 'liber-primus');
const output = path.resolve(process.env.OUTGUESS_OUTPUT || path.join(root, 'outguess-results'));
const key = process.env.OUTGUESS_KEY || '';
const sources = process.env.OUTGUESS_SCAN_ALL_LP1 === '1'
  ? Array.from({length: 75}, (_, i) => i)
  : [0, 8, ...Array.from({length: 58}, (_, i) => i + 17)];

fs.mkdirSync(output, {recursive: true});
const lock = path.join(output, '.scan.lock');
const lockFd = fs.openSync(lock, 'wx');
/** @type {Array<{page:number,bytes:number,sha256:string,seed:number,opening:string}>} */
const found = [];
/** @type {Array<{page:number,code:number|null,diagnostic:string}>} */
const other = [];

try {
  for (const page of sources) {
    const n = String(page).padStart(2, '0');
    const input = path.join(images, n + '.jpg');
    assert.ok(fs.existsSync(input), 'Missing original JPEG ' + input);
    const target = path.join(output, n + '.payload');
    const staging = path.join(output, n + '.payload.incomplete');
    fs.rmSync(staging, {force:true});
    const args = [...(key ? ['-k', key] : []), '-r', input, staging];
    const proc = spawnSync('outguess', args, {
      encoding:'utf8', timeout:60000, maxBuffer:1024*1024
    });
    const log = (proc.stdout || '') + '\n' + (proc.stderr || '');
    const header = /Steg retrieve:\s*seed:\s*(\d+),\s*len:\s*(\d+)/i.exec(log);
    const count = fs.existsSync(staging) ? fs.statSync(staging).size : 0;
    if (proc.status === 0 && header && count > 0 && Number(header[2]) === count) {
      const data = fs.readFileSync(staging);
      fs.renameSync(staging, target);
      const item = {
        page, bytes:data.length,
        sha256:crypto.createHash('sha256').update(data).digest('hex'),
        seed:Number(header[1]),
        opening:data.subarray(0, 72).toString('utf8').replace(/[^\x20-\x7e]/g, '.')
      };
      found.push(item);
      if (process.env.OUTGUESS_PRINT_LP1_SIGNED === '1' && page <= 16 &&
          data.subarray(0, 34).toString('utf8').startsWith('-----BEGIN PGP SIGNED MESSAGE-----')) {
        const signed = data.toString('utf8');
        const textOnly = signed.split('-----BEGIN PGP SIGNATURE-----')[0];
        console.log('LP1_AUTHENTICATION_PENDING_TEXT ' + JSON.stringify({
          page, bytes: data.length, sha256: item.sha256,
          signedText: textOnly.slice(0, 15000),
          truncated: textOnly.length > 15000
        }));
      }
      console.log('UNVALIDATED_EXTRACTION ' + JSON.stringify(item));
    } else {
      fs.rmSync(staging, {force:true});
      const diagnostic = log.trim().split('\n').filter(Boolean).slice(-2).join(' | ').slice(0,250);
      other.push({page,code:proc.status,diagnostic});
      if (page === 0 || page === 8) console.log('CONTROL_MISSED ' + n + ': ' + diagnostic);
    }
  }

  const controls = found.filter(x => x.page === 0 || x.page === 8);
  const lp2 = found.filter(x => x.page >= 17);
  const known = controls.some(x => x.page === 0
    && x.opening.startsWith('-----BEGIN PGP SIGNED MESSAGE-----'))
    && controls.some(x => x.page === 8
    && x.opening.includes('For those who have fallen behind'));
  const summary = {
    tool:'OutGuess 0.4',mode:key ? 'specified-key' : 'default-key',
    originalJPEGsChecked:sources.length, controls:controls.map(x=>x.page),
    positiveControlsMatch:known, lp2UnvalidatedExtracts:lp2.length,
    authenticityWarning:'Matching OutGuess header alone does not establish an authentic message',
    extractedCandidates:found, noMatchingHeader:other.map(x=>x.page),
    diagnostics:known ? undefined : other.filter(x=>x.page === 0 || x.page === 8)
  };
  const tmp = path.join(output, 'summary.json.incomplete');
  fs.writeFileSync(tmp, JSON.stringify(summary,null,2)+'\n');
  fs.renameSync(tmp,path.join(output,'summary.json'));
  console.log('OUTGUESS_SUMMARY ' + JSON.stringify({
    checked:sources.length,controls:controls.map(x=>x.page),
    positiveControlsMatch:known,LP2Scans:58,
    lp2UnvalidatedExtracts:lp2.length,lp2Pages:lp2.map(x=>x.page)
  }));
  assert.ok(known || key, 'Authentic positive controls failed; no negative LP2 conclusion is valid');
} finally {
  fs.closeSync(lockFd);
  fs.rmSync(lock, {force:true});
}
