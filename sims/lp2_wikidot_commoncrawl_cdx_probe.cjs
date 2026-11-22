#!/usr/bin/env node
"use strict";

// Exact-host public archive index probe for issue #1886.
// This inventories Common Crawl and Wayback records only; it does not infer nonexistence
// from missing captures. A positive record must be followed to its exact WARC/page bytes.

const host = "howwillyoutelltheworld.wikidot.com";
const start = Date.parse("2019-01-01T00:00:00Z");
const end = Date.parse("2021-01-01T00:00:00Z");
const headers = { "user-agent": "liber-primus-research/1.0", "accept": "application/json,text/plain,*/*" };

async function get(url) {
  try {
    const r = await fetch(url, { headers, signal: AbortSignal.timeout(30000) });
    return { status: r.status, ok: r.ok, body: await r.text() };
  } catch (e) {
    return { status: 0, ok: false, body: String(e) };
  }
}
function jsonl(s) {
  return s.split(/\r?\n/).filter(Boolean).flatMap(x => { try { return [JSON.parse(x)]; } catch { return []; } });
}
async function pool(xs, n, fn) {
  const out = new Array(xs.length); let k = 0;
  await Promise.all(Array.from({length: Math.min(n, xs.length)}, async () => {
    for (;;) { const i = k++; if (i >= xs.length) return; out[i] = await fn(xs[i]); }
  }));
  return out;
}

(async () => {
  console.log("TARGET", host, "WINDOW", "2019-01-01/2020-12-31");
  const info = await get("https://index.commoncrawl.org/collinfo.json");
  console.log("CC_COLLECTIONS_HTTP", info.status);
  if (!info.ok) { console.log("CC_COLLECTIONS_ERROR", info.body.slice(0, 500)); process.exitCode = 2; return; }
  const collections = JSON.parse(info.body).filter(c => {
    const t = Date.parse(c.from); return t >= start && t < end;
  }).sort((a,b) => a.from.localeCompare(b.from));
  console.log("CC_COLLECTIONS", collections.length);

  const results = await pool(collections, 3, async c => {
    const u = new URL(c["cdx-api"]);
    u.searchParams.set("url", host);
    u.searchParams.set("matchType", "host");
    u.searchParams.set("output", "json");
    const r = await get(u.toString());
    return { id:c.id, status:r.status, records:r.ok?jsonl(r.body):[], error:r.ok?undefined:r.body.slice(0,200) };
  });
  let total = 0;
  for (const r of results) {
    total += r.records.length;
    console.log("CC_INDEX", JSON.stringify({id:r.id,http:r.status,count:r.records.length,error:r.error}));
    for (const x of r.records) console.log("CC_RECORD", JSON.stringify({
      timestamp:x.timestamp,url:x.url,mime:x.mime,status:x.status,digest:x.digest,
      length:x.length,filename:x.filename,offset:x.offset
    }));
  }
  console.log("CC_TOTAL", total);

  const wbUrl = new URL("https://web.archive.org/cdx/search/cdx");
  wbUrl.searchParams.set("url", host + "/*");
  wbUrl.searchParams.set("output", "json");
  wbUrl.searchParams.set("filter", "statuscode:200");
  wbUrl.searchParams.set("fl", "timestamp,original,statuscode,mimetype,digest,length");
  const wb = await get(wbUrl.toString());
  console.log("WAYBACK_HTTP", wb.status);
  if (wb.ok) {
    let rows = [];
    try { rows = JSON.parse(wb.body); } catch { rows = jsonl(wb.body); }
    const data = Array.isArray(rows[0]) && rows[0][0] === "timestamp" ? rows.slice(1) : rows;
    console.log("WAYBACK_COUNT", data.length);
    for (const row of data.slice(0,500)) console.log("WAYBACK_RECORD", JSON.stringify(row));
  } else console.log("WAYBACK_ERROR", wb.body.slice(0,800));

  console.log("LIMIT", "Only 2019–2020 Common Crawl collections and the exact-host Wayback wildcard were queried. No capture is not proof that the alleged PDF never existed.");
})().catch(e => { console.error(e); process.exitCode = 1; });
