'use strict';
/**
 * Exact original 2014 IRC L203973 http://terrafant.asia/sheet.ods.
 * Positive-controlled Common Crawl CDX probe, independent of the completed
 * Wayback/Arquivo index gate.
 * node sims/lp2_2014_irc_sheet_commoncrawl_source_sft.cjs --selftest
 * node sims/lp2_2014_irc_sheet_commoncrawl_source_sft.cjs --network
 */
const assert = require('node:assert/strict');
const EXACT = 'http://terrafant.asia/sheet.ods';
const HOST = 'terrafant.asia';
const INDEXES = [
  'CC-MAIN-2014-23', 'CC-MAIN-2014-35', 'CC-MAIN-2014-41',
  'CC-MAIN-2014-42', 'CC-MAIN-2014-49', 'CC-MAIN-2014-52',
  'CC-MAIN-2015-06', 'CC-MAIN-2015-18', 'CC-MAIN-2015-35',
];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
/** @param {string} index @param {string} target @param {'domain'|'exact'} mode @param {number} limit */
async function query(index, target, mode, limit) {
  const url = new URL('https://index.commoncrawl.org/' + index + '-index');
  url.searchParams.set('url', target);
  url.searchParams.set('matchType', mode);
  url.searchParams.set('output', 'json');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('fl', 'timestamp,url,status,mime,filename,offset,length,digest');
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(25000),
        headers: {accept:'application/x-ndjson,text/plain', 'user-agent':'LiberPrimus-original-2014-keystream-source-archive/1.0'},
      });
      const body = await response.text();
      if (response.status === 404 && /no captures found/i.test(body))
        return {index, target, mode, status:404, records:[], noCaptures:true};
      if ((response.status === 429 || response.status >= 500) && attempt < 3) {
        await sleep(2000 * attempt);
        continue;
      }
      if (!response.ok)
        return {index, target, mode, status:response.status, error:body.slice(0,250)};
      try {
        const rows = body.trim() ? body.trim().split(/\r?\n/).map(x=>JSON.parse(x)) : [];
        return {index, target, mode, status:200, count:rows.length,
          records:rows.slice(0,40), truncated:rows.length>40};
      } catch (e) {
        return {index,target,mode,status:response.status,error:'unparseable NDJSON: ' + String(e)};
      }
    } catch (e) {
      if (attempt===3) return {index,target,mode,error:String(e)};
      await sleep(2000 * attempt);
    }
  }
}
function selftest() {
  assert.equal(INDEXES.length, 9);
  assert.equal(new Set(INDEXES).size, INDEXES.length);
  assert.equal(new URL(EXACT).hostname, HOST);
  assert.ok(INDEXES.every(x=>/^CC-MAIN-201[45]-\d\d$/.test(x)));
  assert.ok(INDEXES.every(x=>x!=='CC-MAIN-2014-15'));
  console.log('PASS original-source target, nine post-publication indexes, and query shapes');
}
async function main() {
  if (process.argv.includes('--selftest')) {selftest(); return;}
  assert.ok(process.argv.includes('--network'));
  const results=[];
  for (const index of INDEXES) {
    const controls=await Promise.all(['example.com','wikipedia.org'].map(host=>query(index,host,'domain',1)));
    const control=controls.some(x=>x.status===200 && x.count>0);
    const searches=control ? await Promise.all([
      query(index,EXACT,'exact',100), query(index,HOST,'domain',1000)
    ]) : [];
    const entry={index,control,controls,searches};
    results.push(entry);
    console.log('INDEX '+JSON.stringify(entry));
    await sleep(250);
  }
  const complete=results.every(x=>x.control&&x.searches.length===2&&x.searches.every(y=>y.status===200||y.noCaptures));
  const hits=results.flatMap(x=>x.searches).flatMap(x=>x.records||[]);
  console.log('SUMMARY '+JSON.stringify({originalSourceDate:'2014-06-18',line:203973,exactUrl:EXACT,
    indexes:INDEXES.length,positiveControlled:results.filter(x=>x.control).length,
    complete,recordCount:hits.length,
    sheetMatches:hits.filter(x=>/sheet\.ods(?:$|[?#])/i.test(x.url||'')).length,
    interpretation:complete?(hits.length?'New Common Crawl archive lead: inspect exact WARC bytes and provenance':'Bounded no-record result ONLY for these nine index collections'):'Partial/error: no archive exclusion'}));
  if (!complete) process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
