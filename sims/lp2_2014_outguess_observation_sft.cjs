'use strict';

/**
 * Recover source-pinned May-August 2014 OutGuess discussion from the original
 * Cicada IRC exports. This indexes human participant claims; it does not
 * authenticate them as Cicada instructions or infer a missing password.
 *
 * node sims/lp2_2014_outguess_observation_sft.cjs --selftest
 * node sims/lp2_2014_outguess_observation_sft.cjs <three original log paths>
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const COMMIT = 'ade9a02889ef8acbc8cde8edbfd0a785c369f4c3';
const SOURCES = [
  {name:'#cicadasolvers.freenode.log', bytes:18487233, sha:'bdd277c14f94c34b5ae714cd00c238065beeed4e'},
  {name:'#cicadasolvers.freenode.2.log', bytes:27234234, sha:'72634a9d071d32af767edbffc0493d810e88cd0d'},
  {name:'#33012014.freenode.log', bytes:8629610, sha:'a2880b1db31ce523599ef30ca2e55291bf295900'},
];
const PERIOD = /^2014 (?:May|Jun|Jul|Aug) \d{2} \d{2}:\d{2} /;
const OUTGUESS = /\bout\s*[-_]?\s*guess(?:ed|ing)?\b|\boutguess\b|\bsteganograph(?:y|ic|ically)?\b|\bstego\b|\bstegdetect\b|\bstegbreak\b/i;
const LP2 = /\b(?:liber\s+primus|lp2|onion\s*7|58\s+pages?|57\s+pages?|titanpad|vFCy7T5p0O|8xnWx)\b/i;
const PAGE = /\b(?:page|pg|p)\s*#?\s*(?:0?[0-9]|[1-4]\d|5[0-7])\b/i;
const URL = /https?:\/\/[^\s<>"'\x00-\x20]+/ig;
const PAGE_BY_PAGE = /page[\s-]+by[\s-]+page/i;

function blobSha(buf) {
  return crypto.createHash('sha1')
    .update('blob ' + buf.length + '\0', 'ascii')
    .update(buf)
    .digest('hex');
}
function cleanUrl(s) { return s.replace(/[.,;!?)\]}]+$/g, ''); }
function extractUrls(text) {
  return [...text.matchAll(URL)].map(m => cleanUrl(m[0]));
}
function parse(line, lineNo) {
  const m = line.match(/^(2014 \w{3} \d{2} \d{2}:\d{2}) <([^>]+)> ?(.*)$/);
  return m
    ? {line:lineNo, timestamp:m[1], speaker:m[2], text:m[3]}
    : {line:lineNo, timestamp:null, speaker:null, text:line};
}
function mergeWindows(hits, entries, radius=6) {
  const spans = [];
  for (const hit of hits.sort((a,b)=>a.line-b.line)) {
    const lo=Math.max(1,hit.line-radius), hi=Math.min(entries.length,hit.line+radius);
    const last=spans[spans.length-1];
    if(last && lo<=last.hi+1) {
      last.hi=Math.max(last.hi,hi);
      last.hits.push(hit);
    } else spans.push({lo,hi,hits:[hit]});
  }
  return spans.map(span => {
    const lines=entries.slice(span.lo-1,span.hi);
    const links=[];
    for(const e of lines) for(const u of extractUrls(e.text)) links.push({line:e.line,speaker:e.speaker,url:u});
    const contextText=lines.map(e=>e.text).join('\n');
    return {
      from:span.lo,to:span.hi,
      hitLines:span.hits.map(h=>h.line),
      tags:[...new Set(span.hits.map(h=>h.kind))],
      lp2Context:LP2.test(contextText),
      pageReference:PAGE.test(contextText),
      speakers:[...new Set(lines.map(e=>e.speaker).filter(Boolean))],
      links,
      lines:lines.map(e=>({line:e.line,timestamp:e.timestamp,speaker:e.speaker,text:e.text.slice(0,700)}))
    };
  });
}
function analyze(meta, buf) {
  assert.equal(buf.length,meta.bytes,meta.name+' original byte count');
  assert.equal(blobSha(buf),meta.sha,meta.name+' original Git blob SHA-1');
  // The original mIRC exports contain non-UTF-8 bytes. Latin-1 preserves
  // ASCII timestamps, nicks, URLs and source line positions byte-for-byte.
  const lines=buf.toString('latin1').split(/\r?\n/);
  const entries=lines.map((line,i)=>parse(line,i+1));
  const outguessHits=[], pageByPageHits=[], titanpadHits=[], mothwingMay4=[];
  for(const e of entries) {
    const raw=lines[e.line-1];
    if(!PERIOD.test(raw)) continue;
    if(OUTGUESS.test(raw)) outguessHits.push({...e,kind:'outguess/stego'});
    if(PAGE_BY_PAGE.test(raw)) pageByPageHits.push({...e,kind:'page-by-page'});
    if(/vFCy7T5p0O/i.test(raw)) titanpadHits.push({...e,kind:'workpad-id'});
    if(/^2014 May 04 /.test(raw) && /<Mothwing>/i.test(raw)) mothwingMay4.push({...e,kind:'Mothwing-May-04'});
  }
  const windows=mergeWindows(outguessHits,entries,7);
  const lp2Windows=windows.filter(w=>w.lp2Context || w.pageReference ||
    w.links.some(x=>/titanpad|imgur|pastebin|github|dropbox|infotomb/i.test(x.url)));
  const pageByPageWindows=mergeWindows(pageByPageHits,entries,10);
  const titanpadWindows=mergeWindows(titanpadHits,entries,8);
  const anchor=meta.name==='#cicadasolvers.freenode.log'
    ? entries.slice(166860-1,166901).map(e=>({line:e.line,timestamp:e.timestamp,speaker:e.speaker,text:e.text.slice(0,900)}))
    : [];
  return {
    source:meta.name,gitBlob:meta.sha,bytes:buf.length,totalLines:lines.length,
    mayAug2014OutguessHitCount:outguessHits.length,
    mayAug2014PageByPageHitCount:pageByPageHits.length,
    mayAug2014TitanpadIdHitCount:titanpadHits.length,
    may4MothwingMessageCount:mothwingMay4.length,
    outguessHits:outguessHits.map(h=>({line:h.line,timestamp:h.timestamp,speaker:h.speaker,text:h.text.slice(0,900)})),
    outguessWindows:windows,
    lp2CandidateWindows:lp2Windows,
    pageByPageWindows,
    titanpadWindows,
    may4Mothwing:mothwingMay4.map(h=>({line:h.line,timestamp:h.timestamp,speaker:h.speaker,text:h.text.slice(0,900)})),
    exactAnchor166860to166900:anchor
  };
}
function selftest() {
  const fixture=[
    '2014 May 04 17:39 <A> page 12 image is uploaded',
    '2014 May 04 17:40 <Mothwing> page-by-page OutGuess results are at the bottom of Titanpad vFCy7T5p0O',
    '2014 May 04 17:41 <B> page 12 used OutGuess with password "example"',
    '2014 May 04 17:42 <B> output checksum is abc123',
    '2014 Apr 01 03:03 <C> OutGuess on an unrelated image',
    '2014 Sep 01 03:03 <D> OutGuess outside the fixed period'
  ];
  const bytes=Buffer.from(fixture.join('\n'));
  const meta={name:'#cicadasolvers.freenode.log',bytes:bytes.length,sha:blobSha(bytes)};
  const result=analyze(meta,bytes);
  assert.equal(result.mayAug2014OutguessHitCount,2);
  assert.equal(result.mayAug2014PageByPageHitCount,1);
  assert.equal(result.mayAug2014TitanpadIdHitCount,1);
  assert.equal(result.may4MothwingMessageCount,1);
  assert(result.lp2CandidateWindows.length>=1);
  console.log('SELFTEST PASS: fixed 2014 period, OutGuess terms, page/Titanpad context and speaker capture');
}
function main() {
  selftest();
  if(process.argv.includes('--selftest')) return;
  assert.equal(process.argv.length,5,'Pass all three original 2014 IRC log paths');
  const reports=[];
  for(let i=0;i<SOURCES.length;i++) {
    const meta=SOURCES[i], file=process.argv[i+2], buf=fs.readFileSync(file);
    const r=analyze(meta,buf);
    reports.push(r);
    console.log('SOURCE '+JSON.stringify({
      source:r.source,gitBlob:r.gitBlob,bytes:r.bytes,totalLines:r.totalLines,
      mayAug2014OutguessHitCount:r.mayAug2014OutguessHitCount,
      mayAug2014PageByPageHitCount:r.mayAug2014PageByPageHitCount,
      mayAug2014TitanpadIdHitCount:r.mayAug2014TitanpadIdHitCount,
      may4MothwingMessageCount:r.may4MothwingMessageCount
    }));
    console.log('OUTGUESS-HITS '+meta.name+' '+JSON.stringify(r.outguessHits));
    console.log('LP2-CANDIDATE-WINDOWS '+meta.name+' '+JSON.stringify(r.lp2CandidateWindows));
    console.log('PAGE-BY-PAGE-WINDOWS '+meta.name+' '+JSON.stringify(r.pageByPageWindows));
    console.log('TITANPAD-WINDOWS '+meta.name+' '+JSON.stringify(r.titanpadWindows));
    if(r.may4Mothwing.length) console.log('MOTHWING-MAY04 '+JSON.stringify(r.may4Mothwing));
    if(r.exactAnchor166860to166900.length) console.log('EXACT-ANCHOR-L166860-166900 '+JSON.stringify(r.exactAnchor166860to166900));
  }
  const out=path.join(process.cwd(),'outguess-2014-source-results');
  fs.mkdirSync(out,{recursive:true});
  fs.writeFileSync(path.join(out,'observations.json'),JSON.stringify({
    sourceRepo:'neuroretransmit/cicada',sourceCommit:COMMIT,
    evidenceClass:'dated solver/participant statements; not Cicada-authenticated instructions',
    reports
  },null,2)+'\n');
  console.log('RESULTS-WRITTEN '+out);
}
main();
