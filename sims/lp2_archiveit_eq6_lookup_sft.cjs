'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');

const host = 'eq6emgv2ehsrix6t.onion';
const queries = [
  {
    label: 'opensearch-exact-host',
    url: 'https://archive-it.org/search-master/opensearch?q=%22' + encodeURIComponent(host) + '%22&n=99'
  },
  {
    label: 'opensearch-unique-host-token',
    url: 'https://archive-it.org/search-master/opensearch?q=' + encodeURIComponent('eq6emgv2ehsrix6t') + '&n=99'
  },
  {
    label: 'cdx-domain-2012-2014',
    url: 'https://wayback.archive-it.org/all/timemap/cdx?url=' +
      encodeURIComponent('http://' + host + '/') +
      '&matchType=domain&from=2012&to=2014&output=json&fl=' +
      encodeURIComponent('timestamp,original,mimetype,statuscode,digest,length')
  }
];

async function runOne(q) {
  const started = new Date().toISOString();
  try {
    const response = await fetch(q.url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'accept': 'application/rss+xml, application/xml, text/xml, application/json, text/plain, */*',
        'user-agent': 'LiberPrimusResearch/1.0 (+read-only archival lookup)'
      },
      signal: AbortSignal.timeout(30000)
    });
    const body = await response.text();
    const bytes = Buffer.from(body, 'utf8');
    return {
      label: q.label,
      requestedUrl: q.url,
      startedAt: started,
      status: response.status,
      statusText: response.statusText,
      finalUrl: response.url,
      headers: Object.fromEntries(
        ['content-type', 'date', 'retry-after', 'server', 'via', 'x-cache', 'x-request-id']
          .map(k => [k, response.headers.get(k)])
          .filter(([, v]) => v !== null)
      ),
      bodyBytes: bytes.length,
      bodySha256: crypto.createHash('sha256').update(bytes).digest('hex'),
      body
    };
  } catch (error) {
    return {
      label: q.label,
      requestedUrl: q.url,
      startedAt: started,
      error: String(error),
      cause: error && error.cause ? String(error.cause) : null
    };
  }
}

(async () => {
  const results = [];
  for (const query of queries) results.push(await runOne(query));
  const summary = results.map(r => ({
    label: r.label,
    status: r.status ?? null,
    bodyBytes: r.bodyBytes ?? null,
    bodySha256: r.bodySha256 ?? null,
    error: r.error ?? null,
    finalUrl: r.finalUrl ?? null
  }));
  const output = {
    schema: 'archive-it-eq6-exact-host-lookup-v1',
    host,
    scope: 'Archive-It public OpenSearch default-all index and public CDX/C /all index; exact host only; capture dates 2012-2014',
    queries: results,
    summary
  };
  const outDir = process.env.RUNNER_TEMP || os.tmpdir();
  const outPath = path.join(outDir, 'source-test-output.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n', 'utf8');
  process.stdout.write(JSON.stringify({ artifact: outPath, summary }, null, 2) + '\n');
})().catch(error => {
  process.stderr.write(String(error.stack || error) + '\n');
  process.exitCode = 1;
});
