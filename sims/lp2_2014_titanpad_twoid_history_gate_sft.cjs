'use strict';
/**
 * Public archive search for two independently witnessed May 2014 Cicada solver pads.
 * Preserves date and path distinctions; absence of a capture is NOT absence of a pad.
 * Archived Etherpad /p/:id/timeslider and /p/:id/export/html?revs=N
 * are documented revision-reading routes, but a live API or archived HTML
 * shell alone cannot reconstruct missing history.
 *
 * Run on Node 22: node sims/lp2_2014_titanpad_twoid_history_gate_sft.cjs
 * @module lp2_2014_titanpad_twoid_history_gate_sft
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const ids = ['vFCy7T5p0O', 'hJ8pVQ5S43'];
const archives = [];
for (const id of ids) {
  assert.match(id, /^[A-Za-z0-9]{10}$/);
  const root = 'titanpad.com/' + id;
  const pad = 'titanpad.com/p/' + id;
  for (const [shape, url, matchType] of [
    ['literal', root, 'exact'],
    ['canonical-descendants', root + '*', 'prefix'],
    ['p-path-descendants', pad + '*', 'prefix'],
  ]) {
    const params = new URLSearchParams({
      url, from: '2014', to: '2016', output: 'json', filter: 'statuscode:200',
    });
    if (matchType === 'prefix') params.set('matchType', 'prefix');
    archives.push({
      id, system: 'wayback-cdx', shape,
      url: 'https://web.archive.org/cdx/search/cdx?' + params,
    });
  }
  for (const [shape, path] of [
    ['canonical-path', root],
    ['timeslider-path', pad + '/timeslider'],
    ['revision-export-path', pad + '/export/html'],
  ]) {
    archives.push({
      id, system: 'arquivo-cdx', shape,
      url: 'https://arquivo.pt/wayback/cdx?' + new URLSearchParams({
        url: path, from: '2014', to: '2016', output: 'json', limit: '100',
      }),
    });
  }
  // Historical indexes with independent time selection, exact IDs only.
  for (const edition of ['CC-MAIN-2014-23', 'CC-MAIN-2015-06']) {
    archives.push({
      id, system: 'commoncrawl-index', shape: edition,
      url: 'https://index.commoncrawl.org/' + edition + '-index?' +
        new URLSearchParams({url: root, output: 'json'}),
    });
  }
  archives.push({
    id, system: 'wayback-available', shape: 'closest-May-2014',
    url: 'https://archive.org/wayback/available?' + new URLSearchParams({
      url: 'http://' + root, timestamp: '20140503',
    }),
  });
}
archives.push({
  id: 'control', system: 'arquivo-cdx', shape: 'positive-2014',
  url: 'https://arquivo.pt/wayback/cdx?' +
    new URLSearchParams({url:'www.publico.pt',from:'2014',to:'2014',
      output:'json',limit:'2'}),
});

/** @param {string} value */
function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}
/** @param {any} value */
function records(value) {
  if (Array.isArray(value)) {
    const headers = value[0];
    return value.slice(1).map(x => Array.isArray(x) && Array.isArray(headers) ?
      Object.fromEntries(headers.map((k,i) => [k,x[i]])) : x);
  }
  if (value && typeof value === 'object') {
    if (value.archived_snapshots) return Object.values(value.archived_snapshots);
    if (value.rows) return value.rows;
    if (value.count === 0 || value.items === 0) return [];
    return [value];
  }
  return [];
}
/**
 * @param {{id:string,system:string,shape:string,url:string}} item
 */
async function probe(item) {
  const result = {id:item.id,system:item.system,shape:item.shape,url:item.url};
  try {
    const response = await fetch(item.url, {
      signal: AbortSignal.timeout(22000),
      headers: {'user-agent':'liber-primus-research-exactid-2014/1.0'},
    });
    const body = await response.text();
    result.http = response.status;
    result.bytes = Buffer.byteLength(body);
    result.sha256 = digest(body);
    const trimmed = body.trim();
    /** @type {any[]} */
    let rows = [];
    try {
      const json = JSON.parse(trimmed);
      rows = records(json);
    } catch {
      rows = trimmed.split(/\r?\n/).filter(line => line.startsWith('{'))
        .map(line => {try {return JSON.parse(line);} catch {return null;}})
        .filter(Boolean);
    }
    result.indexed = rows.length;
    result.first = rows.slice(0,10).map(row => ({
      timestamp:row.timestamp ?? row.ts ?? row.date,
      original:row.original ?? row.url,
      digest:row.digest,
      status:row.statuscode ?? row.status,
      capture:row.url,
      offset:row.offset,
    }));
    const matches = rows.filter(row =>
      /^2014|^2015/.test(String(row.timestamp ?? row.ts ?? '')));
    result.early = matches.length;
    result.earlyRecords = matches.slice(0,15).map(row => ({
      timestamp:row.timestamp ?? row.ts,
      original:row.original ?? row.url,
      digest:row.digest,
      offset:row.offset,
      filename:row.filename,
    }));
    if (response.status !== 200 && result.indexed === 0)
      result.note = 'transport or service unavailable, not a null result';
  } catch (error) {
    result.error = String(error.message ?? error);
  }
  console.log(JSON.stringify(result));
  return result;
}
(async () => {
  /** @type {ReturnType<typeof probe> extends Promise<infer T> ? T[] : never} */
  const outcomes = [];
  for (let i=0;i<archives.length;i+=4) {
    outcomes.push(...await Promise.all(archives.slice(i,i+4).map(probe)));
  }
  const early = outcomes.filter(x => x.id !== 'control' && x.early > 0);
  const live = outcomes.filter(x => x.http === 200);
  const errors = outcomes.filter(x => x.error || x.http !== 200);
  const summary = {
    ids, requests:outcomes.length,
    live:live.length, unavailable:errors.length,
    early_capture_sources:early.map(x=>({
      id:x.id,system:x.system,shape:x.shape,early:x.early,
      records:x.earlyRecords,
    })),
    historical_standard:'An indexed early response is a locator; recover and authenticate the original actual bytes before claiming 2014 contents.',
  };
  console.log('SUMMARY '+JSON.stringify(summary));
})().catch(error => {console.error(error);process.exitCode=1;});
