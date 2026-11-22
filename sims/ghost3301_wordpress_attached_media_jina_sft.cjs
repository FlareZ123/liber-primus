'use strict';

/**
 * Read-only attempt to list PUBLIC 2019 interview attachment metadata.
 * WordPress.com post 8189, site 70062450, reported 58 attachments but only
 * 20 returned in the previously accessible anonymous post response.
 * This tests a distinct Jina HTTPS text-mirror transport for precisely
 * documented public media collection endpoints; no private access attempted.
 *
 * API documentation: https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/media/
 */
const crypto = require('node:crypto');

const urls = [
  'https://r.jina.ai/https://public-api.wordpress.com/rest/v1.1/sites/70062450/media/?post_ID=8189&number=100',
  'https://r.jina.ai/https://public-api.wordpress.com/wp/v2/sites/70062450/media?parent=8189&per_page=100',
  'https://r.jina.ai/https://therealsamizdat.com/wp-json/wp/v2/media?parent=8189&per_page=100',
  'https://r.jina.ai/https://public-api.wordpress.com/rest/v1.1/sites/70062450/posts/8189'
];

async function main() {
  console.log('SOURCE', 'WordPress.com site 70062450 post 8189');
  for (const url of urls) {
    console.log('PROBE', url);
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(18000), headers: { Accept: 'text/plain' } });
      const bytes = Buffer.from(await res.arrayBuffer());
      const txt = bytes.toString('utf8');
      console.log('HTTP', res.status, 'BYTES', bytes.length,
        'SHA256', crypto.createHash('sha256').update(bytes).digest('hex'));
      console.log('HEAD', txt.slice(0, 850).replace(/\r?\n/g, ' '));
      /** @type {string[]} */
      const suspicious = txt.split(/\r?\n/).filter(s => /pdf|runic|manuscript|liber.primus|attachments|media_items|unauthorized|forbidden|authentication|error\b/i.test(s));
      console.log('HITS', suspicious.length);
      for (const line of suspicious.slice(0, 18)) console.log('EVIDENCE', line.slice(0, 500));
    } catch (err) {
      console.log('FETCH_ERROR', err instanceof Error ? err.toString() : String(err));
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
