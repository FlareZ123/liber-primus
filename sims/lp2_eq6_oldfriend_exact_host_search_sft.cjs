'use strict';

// One read-only exact-host search against the documented Oldfriend Archive
// global-search route. No broad Cicada terms or guessed thread identifiers.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const hostToken = 'eq6emgv2ehsrix6t.onion';
const url = new URL('https://old.sage.moe/_/search/text/' + encodeURIComponent(hostToken) + '/order/asc/');

function sha256(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}
function clean(value) {
  return String(value ?? '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#0*39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}
async function main() {
  const queriedAt = new Date().toISOString();
  let result;
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'user-agent': 'LiberPrimusResearch/1.0 (read-only exact-host archive check)'
      },
      signal: AbortSignal.timeout(25000)
    });
    const body = await response.text();
    const lower = body.toLowerCase();
    const token = hostToken.toLowerCase();
    const occurrences = [];
    let at = 0;
    while ((at = lower.indexOf(token, at)) !== -1) {
      occurrences.push(body.slice(Math.max(0, at - 500), Math.min(body.length, at + token.length + 700)));
      at += token.length;
    }
    const title = (body.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [null, ''])[1];
    const links = [...body.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
      .map(m => ({href: m[1], text: clean(m[2]).slice(0, 240)}))
      .filter(x => /thread|post|archive/i.test(x.href + ' ' + x.text))
      .slice(0, 30);

    result = {
      queried_at: queriedAt,
      request: {
        method: 'GET',
        url: url.toString(),
        purpose: 'exact-host-only Oldfriend global archive search'
      },
      response: {
        status: response.status,
        ok: response.ok,
        final_url: response.url,
        content_type: response.headers.get('content-type'),
        body_bytes: Buffer.byteLength(body, 'utf8'),
        sha256: sha256(body),
        title: clean(title),
        exact_host_occurrences: occurrences.length,
        links
      },
      exact_host_contexts: occurrences,
      page_excerpt: occurrences.length ? null : clean(body).slice(0, 1800)
    };
  } catch (error) {
    result = {
      queried_at: queriedAt,
      request: {
        method: 'GET',
        url: url.toString(),
        purpose: 'exact-host-only Oldfriend global archive search'
      },
      access_error: String(error),
      access_error_name: error?.name ?? null
    };
  }

  const outputPath = path.join(process.env.RUNNER_TEMP || process.cwd(), 'source-test-output.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2) + '\n', 'utf8');
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}
main().catch(error => {
  process.stderr.write(String(error) + '\n');
  process.exitCode = 1;
});
