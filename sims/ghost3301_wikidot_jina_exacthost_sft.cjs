'use strict';

/**
 * Bounded public-source acquisition probe for the exact named 2019 Wikidot lead.
 * Read only; uses an independent plaintext web proxy rather than rerunning
 * Wayback CDX, Common Crawl, Arquivo.pt, archive.today or the direct Wikidot host.
 *
 * Execute via manual-readonly-commonjs-sft.yml on Node 22.
 */
const crypto = require('node:crypto');

const sourceHost = 'howwillyoutelltheworld.wikidot.com';
const sources = [
  'https://r.jina.ai/https://howwillyoutelltheworld.wikidot.com/system:list-all-pages',
  'https://r.jina.ai/https://howwillyoutelltheworld.wikidot.com/system:list-all-pages/p/2',
  'https://r.jina.ai/https://howwillyoutelltheworld.wikidot.com/system:list-all-pages/p/3',
  'https://r.jina.ai/https://howwillyoutelltheworld.wikidot.com/start',
  'https://r.jina.ai/https://howwillyoutelltheworld.wikidot.com/talk:start'
];

const hints = /\b(?:runes?|liber\s+primus|manuscript|pdfs?|cipher|encryp|attachment|file)\b/i;
const links = /(?:https?:\/\/[^\s<>)"'\\]+|(?:\/[\w\-./]+\.pdf\b))/gi;

async function main() {
  console.log('SOURCE', sourceHost, 'UTC', new Date().toISOString());
  for (const url of sources) {
    console.log('\nPROBE', url);
    try {
      const response = await fetch(url, {
        headers: { Accept: 'text/plain' },
        signal: AbortSignal.timeout(20000)
      });
      const data = await response.arrayBuffer();
      const body = Buffer.from(data);
      const text = body.toString('utf8');
      console.log('HTTP', response.status, 'TYPE', response.headers.get('content-type'));
      console.log('BYTES', body.length, 'SHA256', crypto.createHash('sha256').update(body).digest('hex'));
      console.log('PAGE_BODY', text.slice(0, 12000));

      /** @type {string[]} */
      const extracted = [...new Set(text.match(links) || [])];
      const namedLinks = extracted.filter(s => /howwillyoutelltheworld|wdfiles|\.pdf|web\.archive\.org/.test(s));
      console.log('LINKS', JSON.stringify(namedLinks.slice(0, 100)));
      const lines = text.split(/\r?\n/);
      const hits = lines.map((line, i) => ({ line, i })).filter(x => hints.test(x.line));
      console.log('HINT_LINES', hits.length);
      for (const x of hits.slice(0, 30)) {
        console.log('MATCH', x.i + 1, x.line.slice(0, 450));
      }
    } catch (error) {
      console.log('FETCH_ERROR', error instanceof Error ? error.toString() : String(error));
    }
  }
  console.log('\nCOMPLETE (retrieval failure is not evidence of artifact absence)');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
