'use strict';

/**
 * Source-fixed LP2 red-initial LPAD OutGuess extraction.
 * Historical algorithm: OutGuess 0.4, original pp3–7 JPEGs, literal "LPAD".
 * SFT: node sims/lp2_p3to7_lpad_outguess_original_sft.cjs
 * Requires outguess on PATH and all original repository JPEGs.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const output = path.join(ROOT, 'outguess-results-agent33-lpad');
const probeOutput = path.join(ROOT, 'outguess-results-keyed');
const pages = [3,4,5,6,7];

/** @returns {string} */
function originalSourcePassword() {
  const starts = ink.pages.filter(p=>pages.includes(p.page))
    .flatMap(p=>(p.red_spans||[]).map(s=>{
      assert.deepEqual([...s.runes],
        corpus.pages[p.page].indices.slice(s.start,s.start+s.length)
          .map(n=>corpus.runes[n]));
      return {page:p.page,offset:s.start,
        first:corpus.translit[corpus.runes.indexOf([...s.runes][0])]};
    }));
  assert.deepEqual(starts,
    [{page:3,offset:0,first:'L'},
      {page:3,offset:119,first:'P'},
      {page:6,offset:71,first:'A'},
      {page:7,offset:194,first:'D'}]);
  const key=starts.map(x=>x.first).join('');
  assert.equal(key,'LPAD');
  return key;
}

/** @returns {void} */
function main() {
  const key = originalSourcePassword();
  fs.mkdirSync(output,{recursive:true});
  const lock=path.join(output,'.batch.lock');
  const fd=fs.openSync(lock,'wx');
  try {
    const entries=[];
    for (const p of pages) {
      fs.rmSync(probeOutput,{recursive:true,force:true});
      const proc=spawnSync(process.execPath,[
        path.join(ROOT,'sims/outguess_lp2_keyed_probe.cjs')
      ],{cwd:ROOT,env:{...process.env,
          LP2_OUTGUESS_PASSWORD:key,
          LP2_OUTGUESS_SOURCE_IMAGE:String(p+17)},
        encoding:'utf8',timeout:180000,maxBuffer:4*1024*1024});
      assert.equal(proc.status,0,proc.stderr+'\n'+proc.stdout);
      const report=JSON.parse(fs.readFileSync(
        path.join(probeOutput,'summary.json'),'utf8'));
      assert.deepEqual(report.keys,[key]);
      assert.deepEqual(report.pages,[p+17]);
      assert.equal(report.attempts,1);
      assert.equal(report.controls.knownKey.exactRecovery,true);
      assert.deepEqual(report.controls.authenticDefaultImages,[0,8]);
      const target=path.join(output,'p'+String(p).padStart(2,'0'));
      fs.renameSync(probeOutput,target);
      const raw=report.rawCandidates.map(x=>({
        bytes:x.bytes,headerConsistent:x.headerConsistent,
        first32Hex:x.first32Hex,sha256:x.sha256,
        shannonBitsPerByte:x.shannonBitsPerByte,
        printableFraction:x.printableFraction,
        relativeFile:path.join('p'+String(p).padStart(2,'0'),x.rawFile)
      }));
      const entry={physicalPage:p,jpeg:String(p+17)+'.jpg',
        nativeHeader:report.headerMatches===1,
        syntheticCleanHeader:report.controls.syntheticNoPayload.headerConsistent,
        raw,flags:report.plausible};
      entries.push(entry);
      console.log('LPAD_ORIGINAL_PAGE '+JSON.stringify(entry));
    }
    const report={scope:'Original LP2 physical pp3–7; one literal red-span key; OutGuess 0.4',
      key,passes:entries.length,entries,
      source:'Original JPEGs 20.jpg through 24.jpg and exact colored-rune annotations',
      validity:'Native header alone is not an embedded-message proof. Require independent intelligible/signed binary or a stable exact cover-difference test.',
      plantedKeyedRecovery:true,
      authenticUnkeyedPositivePages:[0,8]};
    const staging=path.join(output,'summary.json.incomplete');
    fs.writeFileSync(staging,JSON.stringify(report,null,2)+'\n');
    fs.renameSync(staging,path.join(output,'summary.json'));
    console.log('LPAD_ORIGINAL_COMPLETE '+JSON.stringify({
      attempts:entries.length,
      nativeHeaders:entries.filter(x=>x.nativeHeader).length,
      cleanPseudoHeaders:entries.filter(x=>x.syntheticCleanHeader).length,
      recognized:entries.reduce((s,x)=>s+x.flags.length,0),
      rawCandidates:entries.reduce((s,x)=>s+x.raw.length,0)}));
  } finally {
    fs.closeSync(fd);
    fs.rmSync(lock,{force:true});
  }
}
if(require.main===module)main();
module.exports={main,originalSourcePassword};
