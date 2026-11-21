'use strict';
/**
 * Original 2016 InfoTomb 4gq25 page-stem companions.
 * Bounded, source-motivated stem forms only; no broad domain enumeration.
 * 2016 CDX: a hit merits archived-body analysis; absence is not proof.
 */
const stems = [
  '/4gq25.jpg',       // exact positive control
  '/4gq25',
  '/4gq25.html',
  '/4gq25.htm',
  '/4gq25.txt',
  '/4gq25_text',
  '/4gq25.jpg.txt'
];
(async () => {
  for (const path of stems) {
    const url = 'https://infotomb.com' + path;
    const params = new URLSearchParams({
      url, output: 'json', matchType: 'exact',
      from: '2016', to: '2016',
      fl: 'timestamp,original,statuscode,mimetype,digest,length'
    });
    try {
      const response = await fetch('https://web.archive.org/cdx/search/cdx?' + params.toString(), {
        signal: AbortSignal.timeout(30000)
      });
      const body = await response.text();
      if (response.status !== 200) {
        console.log(JSON.stringify({ url, cdXStatus: response.status, snippet: body.slice(0, 80) }));
        continue;
      }
      const rows = JSON.parse(body);
      const hits = rows.slice(1).filter(r => r[2] === '200');
      console.log(JSON.stringify({ url, cdXStatus: response.status, rows: Math.max(0, rows.length - 1), hits }));
    } catch (e) {
      console.log(JSON.stringify({url, error:String(e)}));
    }
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
