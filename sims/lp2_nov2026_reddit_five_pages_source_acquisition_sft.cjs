'use strict';

/**
 * Read-only source acquisition of a dated November 2026 public 5-page claim.
 * A subsequent decipherment test is warranted only if the source names
 * original LP2 pages, an explicit plaintext, and an executable inverse.
 */
const crypto = require('node:crypto');
const urls = [
  'https://www.reddit.com/r/mystery/comments/1x0432x/proof_5_new_liber_primus_pages_solved/.json?raw_json=1',
  'https://old.reddit.com/r/mystery/comments/1x0432x/proof_5_new_liber_primus_pages_solved/.json?raw_json=1',
  'https://r.jina.ai/https://www.reddit.com/r/mystery/comments/1x0432x/proof_5_new_liber_primus_pages_solved/'
];
async function probe(url) {
  console.log('SOURCE', url);
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'LiberPrimusResearch/1.0 (read-only independent cryptanalysis)' },
      signal: AbortSignal.timeout(22000)
    });
    const bytes = Buffer.from(await response.arrayBuffer());
    console.log('STATUS', response.status, 'BYTES', bytes.length,
      'SHA256', crypto.createHash('sha256').update(bytes).digest('hex'));
    const body = bytes.toString('utf8');
    let extracted = body;
    if (url.includes('.json?') && response.ok) {
      const data = JSON.parse(body);
      const post = data[0].data.children[0].data;
      const replies = data[1].data.children
        .filter(item => item.kind === 't1')
        .map(item => item.data.body);
      extracted = [
        'TITLE: ' + post.title,
        'AUTHOR: ' + post.author,
        'POSTED_UTC: ' + new Date(post.created_utc * 1000).toISOString(),
        'SELF_TEXT: ' + post.selftext,
        'FIRST_REPLIES: ' + replies.slice(0, 5).join(' | ')
      ].join('\n');
    }
    console.log('EXTRACT', extracted.slice(0, 16000));
  } catch (error) {
    console.log('ACCESS_ERROR', String(error));
  }
}
(async () => {
  for (const url of urls) await probe(url);
  console.log('ACQUISITION_COMPLETE');
})().catch(error => { console.error(error); process.exitCode = 1; });
