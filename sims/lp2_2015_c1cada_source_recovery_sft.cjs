'use strict';
const crypto = require('node:crypto');
const zlib = require('node:zlib');

const SOURCES = {
  allData: 'https://raw.githubusercontent.com/resvolver/c1cada/e4bdbc24b1d1b5a6462f3332c9a8db785b5c48ec/full%20transcript%20data/all_data.csv',
  primeTranscription: 'https://raw.githubusercontent.com/resvolver/c1cada/6938cf432ba96815fd8a2864a072daafd274e46a/ruins/opt_i_must_primes.txt',
  binaryThefile: 'https://raw.githubusercontent.com/resvolver/c1cada/e4bdbc24b1d1b5a6462f3332c9a8db785b5c48ec/thefile'
};

async function get(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(20000),
    headers: { 'User-Agent': 'Liber-Primus historical-source audit/1.0' }
  });
  const bytes = Buffer.from(await response.arrayBuffer());
  return {
    requested: url,
    finalUrl: response.url,
    status: response.status,
    contentType: response.headers.get('content-type'),
    bytes,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex')
  };
}
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field.length || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
  return rows;
}
function repeats(values) {
  let edges = 0, run = 1, runs2 = 0, runs3 = 0, runs4plus = 0;
  for (let i = 1; i < values.length; i++) {
    if (values[i] === values[i - 1]) { edges++; run++; }
    else {
      if (run === 2) runs2++;
      else if (run === 3) runs3++;
      else if (run >= 4) runs4plus++;
      run = 1;
    }
  }
  if (run === 2) runs2++;
  else if (run === 3) runs3++;
  else if (run >= 4) runs4plus++;
  return { adjacentEqualEdges: edges, doubleRuns: runs2, tripleRuns: runs3, fourPlusRuns: runs4plus };
}
function summarizeAllData(text) {
  const rows = parseCsv(text);
  const header = rows[0];
  const ix = Object.fromEntries(header.map((x, i) => [x, i]));
  const data = rows.slice(1).filter(r => r.length >= header.length);
  const items = data.map(r => ({
    page: Number(r[ix.page_n]),
    pos: Number(r[ix.ttl_pos]),
    rune: Number(r[ix.chara])
  })).sort((a, b) => a.pos - b.pos);
  const pages = [...new Set(items.map(x => x.page))].sort((a, b) => a - b);
  const pageCounts = {};
  for (const x of items) pageCounts[x.page] = (pageCounts[x.page] || 0) + 1;
  let sameWithinPage = 0, modWithinPage = 0;
  for (const page of pages) {
    const seq = items.filter(x => x.page === page).map(x => x.rune);
    sameWithinPage += repeats(seq).adjacentEqualEdges;
    const d = seq.slice(1).map((x, i) => (x - seq[i] + 29) % 29);
    modWithinPage += repeats(d).adjacentEqualEdges;
  }
  const seq = items.map(x => x.rune);
  const d = seq.slice(1).map((x, i) => (x - seq[i] + 29) % 29);
  return {
    sha256: crypto.createHash('sha256').update(text).digest('hex'),
    header,
    rows: items.length,
    firstTtlPos: items[0].pos,
    lastTtlPos: items[items.length - 1].pos,
    nonemptyPages: pages.map(x => x - 1),
    pageCountsZeroBased: Object.fromEntries(Object.entries(pageCounts).map(([p, n]) => [Number(p) - 1, n])),
    p0to2: [1, 2, 3].reduce((n, p) => n + (pageCounts[p] || 0), 0),
    p3to7: [4, 5, 6, 7, 8].reduce((n, p) => n + (pageCounts[p] || 0), 0),
    adjacentIdenticalRunesGlobal: repeats(seq),
    adjacentIdenticalRunesWithinPages: sameWithinPage,
    mod29AdjacentShiftRepeatsGlobal: repeats(d),
    mod29AdjacentShiftRepeatsWithinPages: modWithinPage
  };
}
function summarizePrimeText(text) {
  const lines = text.trimEnd().split(/\r?\n/);
  const counts = {};
  for (const line of lines) {
    const m = line.match(/^(\d+)\s+(.*)$/);
    if (!m) continue;
    counts[Number(m[1])] = (m[2].match(/\b(?:2|3|5|7|11|13|17|19|23|29|31|37|41|43|47|53|59|61|67|71|73|79|83|89|97|101|103|107|109)\b/g) || []).length;
  }
  return {
    pages: Object.keys(counts).map(Number).sort((a, b) => a - b),
    totalPrimeValues: Object.values(counts).reduce((a, b) => a + b, 0),
    p0to2: [0, 1, 2].reduce((n, p) => n + (counts[p] || 0), 0),
    p3to7: [3, 4, 5, 6, 7].reduce((n, p) => n + (counts[p] || 0), 0),
    pageCounts: counts
  };
}
function inspectBinary(buf) {
  const hex = buf.subarray(0, 32).toString('hex');
  const latin = buf.toString('latin1');
  const asciiRuns = latin.match(/[ -~]{8,}/g) || [];
  const result = { bytes: buf.length, sha256: crypto.createHash('sha256').update(buf).digest('hex'), first32Hex: hex, asciiRuns: asciiRuns.slice(0, 20) };
  if (buf.subarray(0, 2).equals(Buffer.from([0x1f, 0x8b]))) {
    try {
      const out = zlib.gunzipSync(buf);
      result.gzip = { bytes: out.length, firstText: out.toString('utf8', 0, 3000) };
    } catch (e) { result.gzipError = String(e); }
  }
  if (buf.subarray(0, 4).toString('hex') === '504b0304') result.zip = true;
  if (buf.subarray(0, 4).toString('ascii') === 'RDX3') result.rData = 'RDX3';
  const utf8 = buf.toString('utf8');
  result.utf8ReplacementChars = (utf8.match(/\uFFFD/g) || []).length;
  const utf16 = buf.toString('utf16le');
  result.utf16lePreview = utf16.slice(0, 1200);
  return result;
}
async function main() {
  const report = {};
  for (const [name, url] of Object.entries(SOURCES)) {
    try {
      const r = await get(url);
      if (name === 'allData') report[name] = { status: r.status, contentType: r.contentType, finalUrl: r.finalUrl, ...summarizeAllData(r.bytes.toString('utf8')) };
      else if (name === 'primeTranscription') report[name] = { status: r.status, contentType: r.contentType, finalUrl: r.finalUrl, sha256: r.sha256, ...summarizePrimeText(r.bytes.toString('utf8')) };
      else report[name] = { status: r.status, contentType: r.contentType, finalUrl: r.finalUrl, ...inspectBinary(r.bytes) };
    } catch (e) { report[name] = { error: String(e) }; }
  }

  const attachments = [
    ['pastebin_wEgepAXG_raw', 'https://pastebin.com/raw/wEgepAXG'],
    ['pastebin_wWSxR5e9_raw', 'https://pastebin.com/raw/wWSxR5e9'],
    ['pastebin_wEgepAXG_page', 'https://pastebin.com/wEgepAXG'],
    ['pastebin_wWSxR5e9_page', 'https://pastebin.com/wWSxR5e9'],
    ['pastebin_wEgepAXG_scrape', 'https://pastebin.com/api_scrape_item.php?i=wEgepAXG'],
    ['pastebin_wWSxR5e9_scrape', 'https://pastebin.com/api_scrape_item.php?i=wWSxR5e9'],
    ['sprunge_afiP', 'https://sprunge.us/afiP'],
    ['sprunge_BQSC', 'https://sprunge.us/BQSC'],
    ['wayback_pastebin_wEgepAXG', 'https://archive.org/wayback/available?url=pastebin.com%2FwEgepAXG&timestamp=20150204'],
    ['wayback_pastebin_wWSxR5e9', 'https://archive.org/wayback/available?url=pastebin.com%2FwWSxR5e9&timestamp=20150210'],
    ['wayback_sprunge_afiP', 'https://archive.org/wayback/available?url=sprunge.us%2FafiP&timestamp=20150205'],
    ['wayback_sprunge_BQSC', 'https://archive.org/wayback/available?url=sprunge.us%2FBQSC&timestamp=20150205'],
    ['jina_pastebin_wEgepAXG', 'https://r.jina.ai/http://pastebin.com/raw/wEgepAXG'],
    ['jina_pastebin_wWSxR5e9', 'https://r.jina.ai/http://pastebin.com/raw/wWSxR5e9']
  ];
  report.attachments = {};
  const results = await Promise.all(attachments.map(async ([name, url]) => {
    try {
      const r = await get(url);
      const text = r.bytes.toString('utf8');
      report.attachments[name] = {
        status: r.status, contentType: r.contentType, finalUrl: r.finalUrl,
        bytes: r.bytes.length, sha256: r.sha256,
        preview: text.slice(0, 5000)
      };
    } catch (e) { report.attachments[name] = { error: String(e) }; }
  }));
  console.log('C1CADA_2015_SOURCE_AUDIT_BEGIN');
  console.log(JSON.stringify(report, null, 2));
  console.log('C1CADA_2015_SOURCE_AUDIT_END');
}
main().catch(e => { console.error(e); process.exitCode = 1; });
