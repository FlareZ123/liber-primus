'use strict';

/**
 * p57 red13 + seven-letter PARABLE -> p49-p51 13..19 outer-ring password
 * on the only two original archived LP3-named JPEGs:
 *   original first-release LP1 page 03 = 03.jpg (solved INSTAR echo)
 *   original LP2 physical page3 = 20.jpg.
 * Distinct format from previously negative original OutGuess extraction.
 *
 * Steghide 0.5.1 identifier, AES-CBC fixture and original JPEG DCT parser
 * are from the pinned historical stego decoder.
 * node sims/lp2_p57_rim13_lp3_steghide051_two_originals_sft.cjs
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const upstream=process.env.STEGOSTUDIO_DIR;
assert(upstream,'Set STEGOSTUDIO_DIR to pinned original stego decoder checkout');
const up=name=>fs.readFileSync(path.join(upstream,name));
const api=new Function(
  up('src/jpeg_dct.js').toString('utf8')+'\n'+
  up('src/decoder.js').toString('utf8')+'\n'+
  'return {decodeJpegCoefficients,shJpegEValues,shMakeBitReader,shIdentifyJpeg,shDecodeJpeg};'
)();
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const corpus=read('resources/liber-primus/lp2-corpus.json');
const ink=read('resources/liber-primus/lp2-ink-annotations.json');
const grid=read('resources/liber-primus/base60-grid.json');
const p57=ink.pages.find(p=>p.page===57);
assert.deepEqual(p57.large_punctuation[0],[7,13,'red']);
assert.deepEqual(p57.red_spans.map(s=>[s.start,s.length]),[[0,7]]);
assert.equal(corpus.pages[57].indices.slice(0,7)
  .map(i=>corpus.translit[i]).join(''),'PARABLE');
assert.deepEqual(grid.page_row_counts,[10,13,9]);
const rows=grid.byte_rows;
assert.equal(rows.length,32);
assert(rows.every(row=>row.length===8));
const ring=[...rows[0],...rows.slice(1).map(r=>r[7]),
  ...rows[31].slice(0,7).reverse(),
  ...rows.slice(1,31).reverse().map(r=>r[0])];
assert.equal(ring.length,76);
assert.deepEqual(ring.slice(12,19),[76,80,51,108,82,65,35]);
const password=Buffer.from(ring.slice(12,19)).toString('latin1');
assert.equal(password,'LP3lRA#');
assert.equal(Number(password[2]),3);
const MAGIC=0x73688D;
/** @param {Uint8Array} ev @param {string} key */
function checkHeader(ev,key){
  const reader=api.shMakeBitReader(ev,key,3,2);
  return reader.getValue(24)===MAGIC;
}
async function main(){
  // The same authentic Steghide v0.5.1 Win32 image AES-CBC fixture
  // used by the preexisting all-original Steghide scanner in this repo.
  const dir='test/fixtures/third-party/steghide-f12/';
  const m=JSON.parse(up(dir+'manifest.json').toString('utf8'));
  assert.equal(m.oracleTool,'steghide version 0.5.1');
  const cbc=m.modes.find(x=>x.mode==='cbc');
  assert(cbc);
  const fixture=new Uint8Array(up(dir+cbc.file));
  assert.equal(hash(fixture),cbc.sha256);
  const fixtureDct=api.decodeJpegCoefficients(fixture);
  const fixtureValues=api.shJpegEValues(fixture,fixtureDct);
  assert(checkHeader(fixtureValues,m.passphrase));
  assert(!checkHeader(fixtureValues,m.wrongPassphrase));
  const fixtureData=await api.shDecodeJpeg(fixture,m.passphrase,fixtureDct);
  assert(fixtureData&&fixtureData.data instanceof Uint8Array);
  assert.equal(hash(fixtureData.data),m.seed.payloadSha256);
  assert.equal(fixtureData.data.length,m.seed.payloadBytes);

  const targets=[
    {label:'original first-release LP1 page03 (INSTAR echo)',jpeg:'03.jpg'},
    {label:'original second-release LP2 physical page03',jpeg:'20.jpg'}
  ];
  const findings=[];
  for(const item of targets){
    const jpeg=new Uint8Array(fs.readFileSync(path.join(root,
      'resources/liber-primus',item.jpeg)));
    assert(jpeg.length>10000);
    const dct=api.decodeJpegCoefficients(jpeg);
    const values=api.shJpegEValues(jpeg,dct);
    const hasHeader=checkHeader(values,password);
    const header=hasHeader?api.shIdentifyJpeg(jpeg,password,dct):null;
    const extracted=header&&header.supported ?
      await api.shDecodeJpeg(jpeg,password,dct):null;
    const row={target:item.label,filename:item.jpeg,
      imageSha256:hash(jpeg),imageBytes:jpeg.length,
      nonzeroDct:values.length,password,
      hasAuthenticSteghideMagic:hasHeader,
      header,
      payloadBytes:extracted?.data?.length||0,
      payloadSha256:extracted?.data?hash(extracted.data):null,
      textPreview:extracted?.text?.slice(0,300)||null};
    findings.push(row);
  }
  assert.equal(findings.length,2);
  console.log(JSON.stringify({
    source:'original p57 7 red runes+13 dots; clockwise table ring 13 through19',
    sourcePassword:password, targets:findings,
    positiveControls:{upstreamPinnedSteghide051AEScbc:true,
      authenticKeyedPayloadRecovered:fixtureData.data.length,
      knownWrongPasswordRejected:true},
    verdict:findings.some(x=>x.payloadBytes>0)?
      'PAYLOAD EXTRACTED; INSPECT RAW BYTES' :
      'NO AUTHENTICATED SOURCE-SELECTED STEGHIDE PAYLOAD UNDER EITHER ORIGINAL LP3 CARRIER'
  },null,2));
  console.log('PASS finite two-carrier Steghide 0.5.1 original source gate');
}
if(require.main===module)main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
