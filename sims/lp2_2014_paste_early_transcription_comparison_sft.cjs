'use strict';
/**
 * Compare a newly retrieved original 2014 participant transcription with
 * the canonical physical LP2 pages. Never substitutes source text for images.
 * Node 22 CommonJS. No downloaded code is executed.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');

const URL='https://pastebin.com/raw/uzU6wNqK';
const HASH='ad431220e352fb8661359585c239126303bfbdec8e7f345834a7305be3d874fd';
const BYTES=33513;
/** @param {Buffer} b */
function sha256(b){return crypto.createHash('sha256').update(b).digest('hex');}
/** @param {string} text */
function linesByPage(text){
 const result=new Map();
 let current=null;
 for(const line of text.split(/\r?\n/)){
  const header=line.match(/^\s*\/\/\s*Page\s+(\d+)\b(.*)/i);
  if(header){
   current=Number(header[1]);
   assert(!result.has(current),'Repeated source page '+current);
   result.set(current,{header:header[2].trim(),lines:[]});
  }else if(current!==null)result.get(current).lines.push(line);
 }
 return result;
}
/**
 * Strictly interpret complete printed GP labels delimited by punctuation and
 * whitespace. Reject unknown alphabetic tokens rather than silently discard.
 * @param {string[]} lines
 * @param {Map<string,number>} ids
 */
function readPage(lines,ids){
 const tokens=[];
 const unknown=[];
 for(const line of lines){
  if(line.startsWith('//')||line.startsWith('#'))continue;
  const words=line.toUpperCase().match(/[A-Z]+/g)||[];
  for(const word of words){
   if(ids.has(word))tokens.push(ids.get(word));
   else unknown.push(word);
  }
 }
 return {tokens,unknown};
}
/** @param {number[]} a @param {number[]} b */
function edit(a,b){
 let old=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++){
  const next=[i];
  for(let j=1;j<=b.length;j++){
   next.push(Math.min(old[j]+1,next[j-1]+1,old[j-1]+Number(a[i-1]!==b[j-1])));
  }
  old=next;
 }
 return old[b.length];
}
function selftest(){
 const ids=new Map([['NG',21],['AE',25],['F',0],['S',15]]);
 const p=linesByPage('// Page 0 : Test\nS-NG.AE#F\n// Page 1 : Second\nF');
 assert.deepEqual([...p.keys()],[0,1]);
 assert.deepEqual(readPage(p.get(0).lines,ids),{tokens:[15,21,25,0],unknown:[]});
 assert.equal(edit([1,2,3],[1,3]),1);
 assert.equal(edit([0,1],[2,1]),1);
 console.log('PASS: strict GP29 parser, page headers, Levenshtein control');
}
async function main(){
 selftest();
 if(process.argv.includes('--selftest'))return;
 const canonical=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
 const ids=new Map(canonical.translit.map((x,i)=>[x,i]));
 assert.equal(ids.size,29);
 const resp=await fetch(URL,{signal:AbortSignal.timeout(30000),
  headers:{'User-Agent':'LP2-2014-original-transcription-audit'}});
 assert.equal(resp.status,200,'original Pastebin response');
 const original=Buffer.from(await resp.arrayBuffer());
 assert.equal(original.length,BYTES);
 assert.equal(sha256(original),HASH);
 const pages=linesByPage(original.toString('utf8'));
 console.log('SOURCE '+JSON.stringify({url:URL,bytes:original.length,sha256:HASH,
  pageHeaders:[...pages.keys()],sourcePageCount:pages.size}));
 const grid=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-grid-256.json','utf8'));
 const observedRows=[];
 for(const p of [49,50,51]){
  const lines=pages.get(p)?.lines||[];
  let count=0;
  for(const line of lines){
   const cells=line.trim().split(/\s+/);
   if(cells.length===8&&cells.every(t=>/^[0-4][0-9A-Za-z]$/.test(t))){
    observedRows.push(cells);count++;
   }
  }
  console.log('NUMERALS_PAGE '+JSON.stringify({page:p,rows:count}));
 }
 const canonicalRows=grid.pages.flatMap(p=>{
  const z=[];
  for(let i=0;i<p.tokens.length;i+=8)z.push(p.tokens.slice(i,i+8));
  return z;
 });
 assert.equal(canonicalRows.length,32);
 assert.equal(observedRows.length,32,'historical original has exactly 32 grid rows');
 const cases=[];
 for(let r=0;r<32;r++)for(let c=0;c<8;c++){
  const seen=observedRows[r][c],expected=canonicalRows[r][c];
  if(seen!==expected)cases.push({cell:r*8+c,
   printedPage:r<10?49:r<23?50:51,source:seen,canonical:expected,
   printedRow:r+1,col:c+1});
 }
 console.log('NUMERALS_COMPARE '+JSON.stringify({
  sourceRows:observedRows.length,sourceCells:observedRows.flat().length,
  canonicalCells:canonicalRows.flat().length,mismatches:cases,
  source49FontNote:pages.get(49).lines.find(s=>/Font is futura/i.test(s))?.trim()
 }));
 let totalOriginal=0,totalObserved=0,edits=0,exact=0,unknown=0;
 for(const entry of canonical.pages){
  const page=entry.page;
  const found=pages.get(page);
  const fromSource=found?readPage(found.lines,ids):{tokens:[],unknown:[]};
  const expected=entry.indices;
  const dist=edit(fromSource.tokens,expected);
  const diff=dist!==0||fromSource.unknown.length;
  if([0,7,15,36,49,50,51,55,56,57].includes(page)) {
   const sameLength=fromSource.tokens.length===expected.length;
   console.log('FOCUSED '+JSON.stringify({page,
    sourceLines:found?.lines.slice(0,12).map(s=>s.slice(0,160))||[],
    sourceLastLines:found?.lines.slice(-4).map(s=>s.slice(0,160))||[],
    mismatches:sameLength?fromSource.tokens.flatMap((v,i)=>v===expected[i]?[]:[{offset:i,source:v,canonical:expected[i]}]).slice(0,24):[],
    unknown:fromSource.unknown.slice(0,25)}));
  }
  if(!diff)exact++;
  totalOriginal+=expected.length;totalObserved+=fromSource.tokens.length;
  edits+=dist;unknown+=fromSource.unknown.length;
  console.log('COMPARE '+JSON.stringify({page,header:found?.header||'ABSENT',
   sourceRunes:fromSource.tokens.length,canonicalRunes:expected.length,
   editDistance:dist,unknownTokens:fromSource.unknown.slice(0,10),
   sourceFirst30:fromSource.tokens.slice(0,30),
   canonicalFirst30:expected.slice(0,30)}));
 }
 console.log('SUMMARY '+JSON.stringify({exact,canonicalPages:canonical.pages.length,
  originalRunes:totalOriginal,sourceRunes:totalObserved,
  editDistance:edits,unknownAlphabeticTokens:unknown}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
