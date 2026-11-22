'use strict';

/**
 * Source-restricted live Wikidot residual-page acquisition.
 * Research question: do the named pages left uninspected by the known
 * three-page site index expose an actual historical rune-PDF locator?
 * Run manually on Node 22 with outbound HTTPS. No private accounts or guesses.
 */
const crypto = require('node:crypto');

const site = 'https://howwillyoutelltheworld.wikidot.com';
const pages = [
  'about',
  'talk:talk:start',
  'forum:start',
  'nav:side',
  'system:recent-changes'
];
const siteMatcher = /https?:\/\/(?:howwillyoutelltheworld\.(?:wikidot|wdfiles)\.com)[^\s)"'<>]*/gi;
const pdfMatcher = /https?:\/\/[^\s)"'<>]+\.pdf(?:\?[^\s)"'<>]*)?/gi;
const clueMatcher = /\b(?:liber\s+primus|cicada|runes?|manuscript|pre.encryp|\.pdf|attachment|wdfiles)\b/i;

async function scan(name) {
  const source = site + '/' + name;
  const url = 'https://r.jina.ai/' + source;
  console.log('PROBE', source);
  try {
    const res = await fetch(url, {
      headers: { Accept: 'text/plain' },
      signal: AbortSignal.timeout(30000)
    });
    const body = Buffer.from(await res.arrayBuffer());
    const data = body.toString('utf8');
    console.log('STATUS', res.status, 'LENGTH', body.length,
      'SHA256', crypto.createHash('sha256').update(body).digest('hex'));
    const lines = data.split(/\r?\n/);
    console.log('TITLE', (lines.find(line => line.startsWith('Title:')) || '').slice(0, 300));
    const siteLinks = [...new Set(data.match(siteMatcher) || [])];
    const pdfLinks = [...new Set(data.match(pdfMatcher) || [])];
    console.log('LINKS_SITENATIVE', JSON.stringify(siteLinks.filter(s =>
      s.includes('wdfiles') || /\/talk:|\/about|\/forum:/.test(s)).slice(0, 100)));
    console.log('LINKS_PDF', JSON.stringify(pdfLinks.slice(0, 30)));
    const matches = lines.map((line, i) => ({ line, i })).filter(
      entry => clueMatcher.test(entry.line));
    console.log('MATCH_COUNT', matches.length);
    for (const match of matches.slice(0, 15)) {
      console.log('MATCH', match.i + 1, match.line.slice(0, 400));
    }
    console.log('CONTENT_EXCERPT', data.slice(0, 1800));
  } catch (error) {
    console.log('FETCH_ERROR', error instanceof Error ? error.message : String(error));
  }
}

(async () => {
  for (const page of pages) await scan(page);
  console.log('COMPLETE: absence claims apply only to these live pages');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
