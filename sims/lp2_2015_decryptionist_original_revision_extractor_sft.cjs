'use strict';
/**
 * Issue #1109: source-dateable 2015 original named DECRYPTIONIST code
 * attachment locator. Fetches exactly one early Fandom revision, never
 * executes linked software or guesses an ungrounded download identifier.
 * Node 22, manual Actions.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const revisions = [26139,19004];
const PAGE_ID = 9003;
const API = 'https://uncovering-cicada.fandom.com/api.php';
/** @param {string} text */
function candidates(text) {
  const tokens = [...text.matchAll(/(?:decrypt(?:ionist)?(?:\.c|\s*2\.0)?|elbarto|pastebin|\.exe|\.zip|\.c\b|\.rar|source(?:\s+code)?)/ig)];
  return tokens.map(m => ({
    term:m[0],offset:m.index,
    excerpt:text.slice(Math.max(0,m.index-280),Math.min(text.length,m.index+450))
  }));
}
async function fetchRevision(id) {
  const url=new URL(API);
  for(const [k,v] of Object.entries({action:'query',prop:'revisions',revids:String(id),
    rvprop:'ids|timestamp|content|comment',rvslots:'main',format:'json',formatversion:'2'}))
    url.searchParams.set(k,v);
  const resp=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(45000),
    headers:{'user-agent':'LP2-historic-2015-file-identification/1.0'}});
  assert.equal(resp.status,200,'original MediaWiki API status');
  const payload=await resp.json();
  assert(!payload.error,'original API error '+JSON.stringify(payload.error));
  const page=payload.query?.pages?.[0];
  assert.equal(page.pageid,PAGE_ID,'wrong page');
  const revision=page.revisions?.find(v=>v.revid===id);
  assert(revision,'revision absent '+id);
  const body=revision.slots?.main?.content||revision['*']||'';
  assert(body.length>1000,'unexpected empty revision');
  const sha256=crypto.createHash('sha256').update(body).digest('hex');
  const hits=candidates(body);
  const urls=[...body.matchAll(/https?:\/\/[^\s<\]\x22\x27|}]+/ig)].map(m=>m[0]);
  return {revision:id,date:revision.timestamp,pageid:PAGE_ID,bodyLength:body.length,sha256,
    decryptHits:hits.filter(h=>/(?:decryptionist|elbarto|decrypt\.c)/i.test(h.term)),
    sourceAround:hits.filter(h=>/(?:source|\.zip|\.rar|\.exe)/i.test(h.term)).slice(0,12),
    urls:urls.slice(0,150),
    linkedContext:urls.filter(u=>/(?:pastebin|titanpad|raw\.githubusercontent|ghostscript|onion7)/i.test(u))
      .map(u=>({url:u, excerpt:body.slice(Math.max(0,body.indexOf(u)-300),
        Math.min(body.length,body.indexOf(u)+500))}))};
}
async function main() {
  assert.equal(revisions.length,2);
  assert(candidates('DECRYPTIONIST by elbarto, download code.c')[0].term==='DECRYPTIONIST');
  console.log('SELFTEST exact revision IDs, token windows PASS');
  if(!process.argv.includes('--network'))return;
  for(const id of revisions)console.log('ORIGINAL_REVISION',JSON.stringify(await fetchRevision(id)));
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
