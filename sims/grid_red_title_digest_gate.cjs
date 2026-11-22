'use strict';

/**
 * Source-fixed exact digest gate: printed 32x8 grid columns as possible
 * commitments to the eight red section-start headings (and their separately
 * marked secondary red spans). This is a proposed historical cross-artifact
 * equation, not an assumed cipher mechanism.
 *
 * Reads only original resources, runs standard 256-bit digest models, checks
 * all 32-byte table views and base-60/base-59 literal token interpretations.
 * A correct independent match would authenticate a real grid/title bridge.
 *
 * Node.js 22, no third-party packages.
 * Run: node sims/grid_red_title_digest_gate.cjs
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const res=file=>JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus',file),'utf8'));
const corpus=res('lp2-corpus.json'), ink=res('lp2-ink-annotations.json'),
      grid=res('lp2-grid-256.json');
const RED_SECTION_STARTS=[0,3,8,15,23,27,33,40];
const NUMERAL60='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const NUMERAL59=NUMERAL60.replace('f','');
const HASHES=['sha256','sha3-256','blake2s256','shake256','sha512-first32','sha512-last32'];

assert.equal(NUMERAL60.length,60);
assert.equal(NUMERAL59.length,59);
assert.equal(corpus.runes.length,29);
assert.equal(corpus.translit.length,29);
assert.equal(corpus.prime.length,29);

/** Decode the original literal two-glyph tokens, without trusting derived bytes. */
function numeralBytes(radix) {
  const alphabet=radix===60?NUMERAL60:NUMERAL59;
  const tokens=grid.pages.flatMap(p=>p.tokens);
  assert.equal(tokens.length,256);
  return Buffer.from(tokens.map(token=>{
    assert.equal(token.length,2);
    const a=alphabet.indexOf(token[0]), b=alphabet.indexOf(token[1]);
    assert(a>=0&&b>=0);
    const value=a*radix+b;
    assert(value>=0&&value<256);
    assert.equal(alphabet[Math.floor(value/radix)]+alphabet[value%radix],token);
    return value;
  }));
}

/** Source-native separately printed red title fragments on eight opening pages. */
function redSpans() {
  const pages=new Map(corpus.pages.map(p=>[p.page,p]));
  const annotations=new Map(ink.pages.map(p=>[p.page,p]));
  const spans=[];
  for(const pg of RED_SECTION_STARTS){
    const p=pages.get(pg), record=annotations.get(pg);
    assert(p&&record);
    for(const block of record.red_spans){
      const glyphs=p.indices.slice(block.start,block.start+block.length);
      assert.equal(glyphs.length,block.length);
      assert.equal(glyphs.map(i=>corpus.runes[i]).join(''),block.runes);
      spans.push({page:pg,start:block.start,length:block.length,glyphs});
    }
  }
  assert.equal(spans.length,11);
  assert.deepEqual(spans.map(s=>[s.page,s.start,s.length]),
    [[0,0,13],[3,0,16],[3,119,3],[8,0,12],[15,0,9],
     [15,9,11],[23,0,16],[27,0,19],[33,0,10],[33,91,8],[40,0,8]]);
  return spans;
}

/** @param {number[]} glyphs */
function titleBytes(glyphs) {
  const latin=glyphs.map(i=>corpus.translit[i]).join('');
  const prime=glyphs.map(i=>corpus.prime[i]);
  return {
    gp_index0:Buffer.from(glyphs),
    gp_index1:Buffer.from(glyphs.map(i=>i+1)),
    gp_prime_bytes:Buffer.from(prime),
    original_rune_utf8:Buffer.from(glyphs.map(i=>corpus.runes[i]).join(''),'utf8'),
    gp_latin_upper:Buffer.from(latin,'utf8'),
    gp_latin_lower:Buffer.from(latin.toLowerCase(),'utf8'),
    indices_ascii_csv:Buffer.from(glyphs.join(','),'utf8'),
    primes_ascii_csv:Buffer.from(prime.join(','),'utf8'),
    primes_ascii_concatenated:Buffer.from(prime.join(''),'utf8')
  };
}

/** @param {Buffer} b */
function sixDigests(b) {
  const sha512=crypto.createHash('sha512').update(b).digest();
  return {
    sha256:crypto.createHash('sha256').update(b).digest(),
    'sha3-256':crypto.createHash('sha3-256').update(b).digest(),
    blake2s256:crypto.createHash('blake2s256').update(b).digest(),
    shake256:crypto.createHash('shake256',{outputLength:32}).update(b).digest(),
    'sha512-first32':sha512.subarray(0,32),
    'sha512-last32':sha512.subarray(32)
  };
}

/** @param {Buffer} bytes @param {number} radix */
function targetViews(bytes,radix) {
  assert.equal(bytes.length,256);
  const out=[];
  const columns=Array.from({length:8},(_,c)=>Buffer.from(
    Array.from({length:32},(_,r)=>bytes[8*r+c])));
  const chunks=Array.from({length:8},(_,j)=>bytes.subarray(32*j,32*j+32));
  for(const [mode,targets] of [['column',columns],['rowmajor_chunk',chunks]])
    for(let j=0;j<8;j++){
      out.push({name:`radix${radix}_${mode}${j}`,bytes:targets[j]});
      out.push({name:`radix${radix}_${mode}${j}_reversed`,
                bytes:Buffer.from(targets[j]).reverse()});
    }
  return out;
}

/** Prefix is auxiliary; only 32/32 exact bytes pass the full digest gate. */
function comparison(digest,target){
  assert.equal(digest.length,32);
  assert.equal(target.length,32);
  let leading=0;
  while(leading<32&&digest[leading]===target[leading])leading++;
  return leading;
}

function study(){
  assert.equal(
    crypto.createHash('sha256').update('abc').digest('hex'),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  const g60=numeralBytes(60),g59=numeralBytes(59);
  assert(g60.equals(Buffer.from(grid.pages.flatMap(p=>p.bytes))));
  assert.equal(crypto.createHash('sha256').update(g60).digest('hex'),
    '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
  assert.equal(crypto.createHash('sha256').update(g59).digest('hex'),
    '511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79');
  const views=[...targetViews(g60,60),...targetViews(g59,59)];
  const source=redSpans();
  let tests=0, largestPrefix=0;
  const full=[];
  for(const title of source)
    for(const [representation,bytes] of Object.entries(titleBytes(title.glyphs)))
      for(const [digestName,digest] of Object.entries(sixDigests(bytes)))
        for(const target of views){
          tests++;
          const prefix=comparison(digest,target.bytes);
          largestPrefix=Math.max(largestPrefix,prefix);
          if(prefix===32)full.push({
            page:title.page,start:title.start,length:title.length,
            representation,digestName,target:target.name
          });
        }
  assert.equal(views.length,64);
  assert.equal(tests,11*9*HASHES.length*64);
  assert.deepEqual(full,[]);
  assert.equal(largestPrefix,1);

  // Deliberately inject a source-true SHA-256 title into a single target view.
  const planted=targetViews(g60,60);
  const plantedHash=sixDigests(titleBytes(source[0].glyphs).original_rune_utf8).sha256;
  planted[0].bytes=plantedHash;
  assert.equal(comparison(plantedHash,planted[0].bytes),32);
  return {
    experiment:'Original eight section-opening pages: every separately annotated red span versus source grid 32-byte column/chunk digests',
    sectionOpeningPages:RED_SECTION_STARTS,
    testedRedSpans:source.map(s=>({page:s.page,start:s.start,length:s.length})),
    sourceBytes:['radix60','radix59'],targetViews:views.length,
    originalInputRepresentations:9,digestFamilies:HASHES,
    exactComparisons:tests,fullMatches:full,
    maximumLeadingMatchingBytes:largestPrefix,
    plantedTitleHashExactMatch:true,
    sourceFingerprint:{
      radix60sha256:crypto.createHash('sha256').update(g60).digest('hex'),
      radix59sha256:crypto.createHash('sha256').update(g59).digest('hex')
    },
    interpretation:'No literal 256-bit digest of an observed red span appears in these natural 32-byte grid presentations. Unknown plaintext, MAC, salt or nonlinear encoding are outside this bounded check.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(study(),null,2)+'\n');
module.exports={numeralBytes,redSpans,titleBytes,sixDigests,targetViews,comparison,study};
