'use strict';

// One read-only, exact-host query against TheBArchive's documented FoolFuuka
// search endpoint. No generic Cicada terms, speculative paths, or live onion
// requests are made.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const hostToken = 'eq6emgv2ehsrix6t.onion';
const url = new URL('https://thebarchive.com/_/api/chan/search/');
url.searchParams.set('board', 'b');
url.searchParams.set('text', hostToken);
url.searchParams.set('date_start', '2012-01-01');
url.searchParams.set('date_end', '2013-12-31');

function sha256(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

function flattenPosts(value, out = []) {
  if (Array.isArray(value)) {
    for (const item of value) flattenPosts(item, out);
    return out;
  }
  if (!value || typeof value !== 'object') return out;
  if (value.num !== undefined && (value.thread_num !== undefined || value.timestamp !== undefined)) {
    out.push(value);
  }
  if (value.posts !== undefined) flattenPosts(value.posts, out);
  if (value.op !== undefined) flattenPosts(value.op, out);
  return out;
}

function clean(value) {
  return String(value ?? '')
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
        accept: 'application/json',
        'user-agent': 'LiberPrimusResearch/1.0 (read-only exact-host archive check)'
      },
      signal: AbortSignal.timeout(25000)
    });
    const body = await response.text();
    let parsed = null;
    let parseError = null;
    try { parsed = JSON.parse(body); } catch (error) { parseError = String(error); }

    const posts = parsed === null ? [] : flattenPosts(parsed);
    const matching = posts.filter(post => {
      const searchable = [
        post.comment, post.comment_processed, post.comment_sanitized,
        post.title, post.title_processed
      ].map(clean).join(' ').toLowerCase();
      return searchable.includes(hostToken);
    });

    result = {
      queried_at: queriedAt,
      request: {
        method: 'GET',
        url: url.toString(),
        purpose: 'exact-host-only /b/ archive search, 2012-01-01 through 2013-12-31'
      },
      response: {
        status: response.status,
        ok: response.ok,
        final_url: response.url,
        content_type: response.headers.get('content-type'),
        body_bytes: Buffer.byteLength(body, 'utf8'),
        sha256: sha256(body),
        valid_json: parsed !== null,
        parse_error: parseError,
        top_level_type: Array.isArray(parsed) ? 'array' : typeof parsed,
        top_level_count: Array.isArray(parsed) ? parsed.length : null,
        extracted_post_count: posts.length
      },
      exact_host_matches: matching.map(post => {
        const text = clean(post.comment_sanitized ?? post.comment_processed ?? post.comment);
        const at = text.toLowerCase().indexOf(hostToken);
        return {
          board: post.board ?? 'b',
          num: post.num ?? null,
          thread_num: post.thread_num ?? null,
          timestamp: post.timestamp ?? null,
          fourchan_date: post.fourchan_date ?? null,
          title: clean(post.title_processed ?? post.title),
          excerpt: at < 0 ? text.slice(0, 800) : text.slice(Math.max(0, at - 350), Math.min(text.length, at + hostToken.length + 450)),
          media_filename: post.media?.media_filename ?? null,
          media_link: post.media?.media_link ?? null
        };
      }),
      raw_response_if_exact_host_match: matching.length ? body : null,
      response_excerpt_if_not_json: parsed === null ? body.slice(0, 1200) : null
    };
  } catch (error) {
    result = {
      queried_at: queriedAt,
      request: {
        method: 'GET',
        url: url.toString(),
        purpose: 'exact-host-only /b/ archive search, 2012-01-01 through 2013-12-31'
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
