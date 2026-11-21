#!/usr/bin/env node
'use strict';

// Bounded source-retrieval probe for the exact 2016 Cicada carrier URL.
// No crawling, URL guessing, or broad domain enumeration.

const crypto = require('node:crypto');

const TARGET_HTTPS = 'https://infotomb.com/4gq25.jpg';
const TARGET_HTTP = 'http://infotomb.com/4gq25.jpg';
const WAYBACK_CAPTURE = '20160116224659';
const KNOWN_GIT_BLOB_SHA1 = '22027296dcd7df53c5127e6aadbabeaf3223f72d';
const INDEXES = [
  'CC-MAIN-2016-07',
  'CC-MAIN-2016-18',
  'CC-MAIN-2016-22',
  'CC-MAIN-2016-26',
  'CC-MAIN-2016-30',
  'CC-MAIN-2016-36',
  'CC-MAIN-2016-40',
  'CC-MAIN-2016-44',
  'CC-MAIN-2016-50',
];

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function gitBlobSha1(buf) {
  const header = Buffer.from('blob ' + buf.length + '\0', 'utf8');
  return crypto.createHash('sha1').update(header).update(buf).digest('hex');
}

function selectedHeaders(headers) {
  const out = {};
  for (const [key, value] of headers.entries()) {
    if (/^(content-type|content-length|last-modified|date|server|location|x-archive-orig-|memento-datetime|warc-)/i.test(key)) {
      out[key] = value;
    }
  }
  return out;
}

async function request(url) {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(30000),
      headers: { 'user-agent': 'LiberPrimus-research/1.0 (exact-source-check)' },
    });
    const body = Buffer.from(await res.arrayBuffer());
    return {
      requested_url: url,
      final_url: res.url,
      status: res.status,
      headers: selectedHeaders(res.headers),
      bytes: body.length,
      body,
    };
  } catch (error) {
    return { requested_url: url, error: String(error) };
  }
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      results[index] = await fn(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

function bodyPrefix(buf) {
  return buf.subarray(0, 160).toString('utf8').replace(/[^\x20-\x7e]/g, '.');
}

function cdxUrl(target) {
  const params = new URLSearchParams({
    url: target,
    output: 'json',
    filter: 'statuscode:200',
    fl: 'timestamp,original,statuscode,mimetype,digest,length',
    collapse: 'digest',
  });
  return 'https://web.archive.org/cdx/search/cdx?' + params.toString();
}

function parseJsonLines(text) {
  return text.split(/\r?\n/).filter(Boolean).map(line => {
    try { return JSON.parse(line); } catch { return { raw: line.slice(0, 300) }; }
  });
}

async function main() {
  const cdxTargets = [TARGET_HTTPS, TARGET_HTTP];
  const cdxResults = await mapLimit(cdxTargets, 2, async target => {
    const r = await request(cdxUrl(target));
    if (r.error) return { target, error: r.error };
    return {
      target,
      status: r.status,
      final_url: r.final_url,
      headers: r.headers,
      bytes: r.bytes,
      records: parseJsonLines(r.body.toString('utf8')),
      body_prefix: r.status === 200 ? undefined : bodyPrefix(r.body),
    };
  });

  const ccJobs = [];
  for (const index of INDEXES) {
    for (const target of [TARGET_HTTPS, TARGET_HTTP]) {
      const params = new URLSearchParams({ url: target, output: 'json' });
      ccJobs.push({ index, target, url: 'https://index.commoncrawl.org/' + index + '-index?' + params.toString() });
    }
  }
  const ccResults = await mapLimit(ccJobs, 4, async job => {
    const r = await request(job.url);
    if (r.error) return { index: job.index, target: job.target, error: r.error };
    const text = r.body.toString('utf8');
    return {
      index: job.index,
      target: job.target,
      status: r.status,
      records: r.status === 200 ? parseJsonLines(text) : [],
      response_prefix: r.status === 200 ? undefined : text.slice(0, 200),
    };
  });

  const replayUrl = 'https://web.archive.org/web/' + WAYBACK_CAPTURE + 'id_/' + TARGET_HTTPS;
  const replay = await request(replayUrl);
  let replaySummary;
  if (replay.error) {
    replaySummary = replay;
  } else {
    const body = replay.body;
    const isJpeg = body.length >= 4 && body[0] === 0xff && body[1] === 0xd8 &&
      body[body.length - 2] === 0xff && body[body.length - 1] === 0xd9;
    const blobSha1 = gitBlobSha1(body);
    replaySummary = {
      requested_url: replay.requested_url,
      final_url: replay.final_url,
      status: replay.status,
      headers: replay.headers,
      bytes: body.length,
      is_jpeg_soi_eoi: isJpeg,
      raw_sha256: sha256(body),
      git_blob_sha1: blobSha1,
      matches_known_archived_jpeg: blobSha1 === KNOWN_GIT_BLOB_SHA1,
      body_prefix_if_not_jpeg: isJpeg ? undefined : bodyPrefix(body),
      body_base64_if_different_jpeg: isJpeg && blobSha1 !== KNOWN_GIT_BLOB_SHA1
        ? body.toString('base64') : undefined,
    };
  }

  const result = {
    scope: 'exact infotomb.com/4gq25.jpg only',
    expected_archive_capture: WAYBACK_CAPTURE,
    known_mirror_git_blob_sha1: KNOWN_GIT_BLOB_SHA1,
    wayback_cdx: cdxResults,
    common_crawl_exact_url: ccResults,
    wayback_identity_replay: replaySummary,
  };
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}

main().catch(error => {
  process.stderr.write(String(error && error.stack || error) + '\n');
  process.exitCode = 1;
});
