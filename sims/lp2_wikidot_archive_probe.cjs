'use strict';

// Exact-host public archive probe for Issue #1886.
// Scope: only the interview-linked Wikidot host, its archived URL paths,
// and Common Crawl/Wayback records. No live Tor access or guessed filenames.

const HOST = 'howwillyoutelltheworld.wikidot.com';
const START = '2013-01-01';
const END = '2021-01-01';
const CONCURRENCY = 6;
const LIMIT = 1000;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function get(url, timeout = 25000) {
  let last;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const r = await fetch(url, {
        headers: {
          accept: 'application/json, text/plain;q=0.9, */*;q=0.5',
          'user-agent': 'LiberPrimus-Exact-Wikidot-Archive-Gate/1.0'
        },
        signal: AbortSignal.timeout(timeout)
      });
      const body = await r.text();
      if ((r.status === 429 || r.status >= 500) && attempt < 3) {
        await sleep(1000 * attempt);
        continue;
      }
      return {status:r.status, body, finalUrl:r.url};
    } catch (e) {
      last = String(e);
      if (attempt < 3) await sleep(1000 * attempt);
    }
  }
  return {status:null, error:last};
}

function jsonLines(body) {
  return body.trim() ? body.trim().split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x)) : [];
}

async function commonCrawlCollections() {
  const r = await get('https://index.commoncrawl.org/collinfo.json');
  if (r.status !== 200) return {error:r.error || ('HTTP '+r.status), collections:[]};
  try {
    const all = JSON.parse(r.body);
    const collections = all.filter(x => {
      const from = x.from || '';
      const to = x.to || '';
      return from && to && to >= START && from <= END && /^CC-MAIN-\d{4}-\d+$/.test(x.id || '');
    }).sort((a,b)=>a.id.localeCompare(b.id));
    return {collections};
  } catch(e) {
    return {error:'Invalid collinfo JSON: '+String(e), collections:[]};
  }
}

async function ccQuery(index, host, role) {
  const u = new URL('https://index.commoncrawl.org/'+index+'-index');
  u.searchParams.set('url', host);
  u.searchParams.set('matchType', role === 'target' ? 'host' : 'domain');
  u.searchParams.set('output', 'json');
  u.searchParams.set('limit', role === 'target' ? String(LIMIT) : '1');
  u.searchParams.set('fl','timestamp,url,status,mime,filename,offset,length,digest,redirect');
  const r = await get(u.href, 25000);
  if (r.status === 404 && /no captures found/i.test(r.body || '')) {
    return {index,role,host,status:404,no_captures:true,records:[]};
  }
  if (r.status !== 200) {
    return {index,role,host,status:r.status,error:r.error || (r.body||'').slice(0,300),records:[]};
  }
  try {
    return {index,role,host,status:200,records:jsonLines(r.body)};
  } catch(e) {
    return {index,role,host,status:200,error:'Invalid NDJSON: '+String(e),excerpt:r.body.slice(0,300),records:[]};
  }
}

function parseCdxJson(body) {
  const rows = JSON.parse(body);
  if (!Array.isArray(rows) || !rows.length) return [];
  if (!Array.isArray(rows[0])) return rows;
  const fields = rows[0];
  return rows.slice(1).map(row => Object.fromEntries(fields.map((f,i)=>[f,row[i]])));
}

async function waybackQuery(host, role) {
  const u = new URL('https://web.archive.org/cdx/search/cdx');
  u.searchParams.set('url',host);
  u.searchParams.set('matchType',role==='target'?'host':'domain');
  u.searchParams.set('output','json');
  u.searchParams.set('fl','timestamp,original,statuscode,mimetype,digest,length');
  u.searchParams.set('collapse','urlkey');
  u.searchParams.set('limit',role==='target'?'10000':'1');
  const r = await get(u.href,30000);
  if (r.status !== 200) return {role,host,status:r.status,error:r.error || (r.body||'').slice(0,300),records:[]};
  try {
    return {role,host,status:200,records:parseCdxJson(r.body)};
  } catch(e) {
    return {role,host,status:200,error:'Invalid CDX JSON: '+String(e),excerpt:r.body.slice(0,300),records:[]};
  }
}

async function runPool(items, width, fn) {
  const out = [];
  for (let i=0;i<items.length;i+=width) {
    out.push(...await Promise.all(items.slice(i,i+width).map(fn)));
    if (i+width<items.length) await sleep(250);
  }
  return out;
}

async function main() {
  const started = new Date().toISOString();
  const ccInfo = await commonCrawlCollections();
  const collections = ccInfo.collections || [];
  const indexes = collections.map(x=>x.id);
  const tasks = [];
  for (const index of indexes) {
    tasks.push({index,host:HOST,role:'target'});
    tasks.push({index,host:'example.com',role:'control'});
    tasks.push({index,host:'wikipedia.org',role:'control'});
  }
  const ccResults = await runPool(tasks,CONCURRENCY,t=>ccQuery(t.index,t.host,t.role));
  const targetResults = ccResults.filter(x=>x.role==='target');
  const controlResults = ccResults.filter(x=>x.role==='control');
  const captures = targetResults.flatMap(x=>(x.records||[]).map(r=>({...r,collection:x.index})));
  const controlPass = new Set(controlResults.filter(x=>x.status===200 && x.records?.length).map(x=>x.index));
  const targetCoverage = targetResults.map(x=>({
    index:x.index,status:x.status,records:x.records?.length||0,
    no_captures:!!x.no_captures,error:x.error||null,
    positive_control_passed:controlPass.has(x.index)
  }));
  const wa = await Promise.all([
    waybackQuery(HOST,'target'),
    waybackQuery('example.com','control')
  ]);
  const waTarget=wa[0], waControl=wa[1];
  const fileCandidates = captures.filter(r =>
    /\.(?:pdf|zip|7z|rar|docx?|odt|rtf|txt|png|jpe?g|tiff?|svg)(?:$|[?#])/i.test(r.url||'') ||
    /application\/pdf|application\/zip|octet-stream/i.test(r.mime||'')
  );
  const htmlCandidates = captures.filter(r =>
    /^text\/html/i.test(r.mime||'') && String(r.status||'')==='200'
  );
  const uniqueUrls=[...new Set(captures.map(r=>r.url).filter(Boolean))].sort();
  const errors = ccResults.filter(x=>x.error || (x.status!==200 && x.status!==404));
  const report = {
    schema:1,issue:1886,host:HOST,started,finished:new Date().toISOString(),
    commoncrawl:{collinfo_error:ccInfo.error||null,index_count:indexes.length,
      indexes,coverage:targetCoverage,control_pass_count:controlPass.size,
      target_record_count:captures.length,distinct_target_urls:uniqueUrls.length,
      target_records:captures.slice(0,250),html_candidates:htmlCandidates.slice(0,100),
      file_candidates:fileCandidates.slice(0,100),errors},
    wayback:{target_status:waTarget.status,target_error:waTarget.error||null,
      target_record_count:waTarget.records?.length||0,
      target_records:(waTarget.records||[]).slice(0,250),
      control_status:waControl.status,control_error:waControl.error||null,
      control_record_count:waControl.records?.length||0},
    interpretation:
      ccInfo.error || controlPass.size===0 || waControl.status!==200
        ? 'INCONCLUSIVE: one or more archive index/control interfaces did not validate.'
        : (captures.length || (waTarget.records||[]).length)
          ? 'CAPTURES FOUND: inspect archived HTML bodies and directly linked file paths before any artifact claim.'
          : 'BOUNDED NO-CAPTURE RESULT: positive controls passed, but no target-host records appeared in the enumerated Common Crawl collections or Wayback CDX response. This does not prove the alleged PDF never existed.',
    scope:'Common Crawl collections whose published crawl windows overlap 2013-01-01 through 2021-01-01; exact host match; Wayback CDX exact host. No generic PDF search.'
  };
  console.log(JSON.stringify(report,null,2));
}

main().catch(e=>{console.error(e);process.exitCode=1;});
