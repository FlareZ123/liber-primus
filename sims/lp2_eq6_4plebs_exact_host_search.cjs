'use strict';
const fs = require('node:fs');
const path = require('node:path');

const target = 'eq6emgv2ehsrix6t';
const boards = ['x', 'pol'];
const results = [];

async function searchBoard(board) {
  const url = new URL('https://archive.4plebs.org/_/api/chan/search/');
  url.searchParams.set('board', board);
  url.searchParams.set('text', target);
  url.searchParams.set('date_start', '2012-01-01');
  url.searchParams.set('date_end', '2013-12-31');
  url.searchParams.set('order', 'asc');
  url.searchParams.set('type', 'posts');
  url.searchParams.set('deleted', '0');
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'LiberPrimusResearch/1.0 (read-only exact-host archival search)'
    },
    signal: AbortSignal.timeout(20000)
  });
  const body = await response.text();
  const record = {
    board,
    url: url.toString(),
    status: response.status,
    contentType: response.headers.get('content-type'),
    bodyBytes: Buffer.byteLength(body),
    bodyPreview: body.slice(0, 700)
  };
  if (response.ok && (record.contentType || '').includes('json')) {
    try {
      const json = JSON.parse(body);
      record.responseShape = Array.isArray(json) ? 'array' : typeof json;
      const posts = [];
      const collect = x => {
        if (!x || typeof x !== 'object') return;
        if (Array.isArray(x)) { for (const y of x) collect(y); return; }
        if (Array.isArray(x.posts)) for (const p of x.posts) posts.push(p);
        for (const [k, v] of Object.entries(x)) {
          if (k !== 'posts' && v && typeof v === 'object') collect(v);
        }
      };
      collect(json);
      record.postCount = posts.length;
      record.matches = posts.slice(0, 20).map(p => ({
        num: p.num ?? p.post_num ?? p.post_id ?? null,
        resto: p.resto ?? p.thread_num ?? null,
        timestamp: p.timestamp ?? p.date ?? null,
        comment: String(p.comment ?? p.content ?? p.text ?? '').slice(0, 700)
      }));
    } catch (e) {
      record.parseError = String(e);
    }
  }
  return record;
}

(async () => {
  for (const board of boards) {
    try { results.push(await searchBoard(board)); }
    catch (e) { results.push({ board, error: String(e) }); }
  }
  const output = {
    schema: 'lp2-eq6-4plebs-exact-host-search-v1',
    target,
    scope: 'Only the documented FoolFuuka search endpoint, exact hostname, /x/ and /pol/, date range 2012-01-01 through 2013-12-31. No live onion request, guessed path, or broad search.',
    results
  };
  const outDir = process.env.RUNNER_TEMP || require('node:os').tmpdir();
  const outPath = path.join(outDir, 'source-test-output.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n');
  process.stdout.write(JSON.stringify(output, null, 2) + '\n');
})().catch(e => { process.stderr.write(String(e) + '\n'); process.exitCode = 1; });
