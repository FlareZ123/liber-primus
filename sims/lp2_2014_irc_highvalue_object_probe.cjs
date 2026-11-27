'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const TARGETS = [
  { id: 'TJBzPtKr', date: '2014-05-02 20:11', line: 164182, role: 'reported code/source of LP2 release page', urls: ['https://pastebin.com/raw/TJBzPtKr'] },
  { id: 'Hjmq1HCfpg', date: '2014-05-20 22:28', line: 183938, role: 'participant script during LP2 analysis', urls: ['https://titanpad.com/Hjmq1HCfpg'] },
  { id: 'CO4O', date: '2014-05-20 19:10', line: 183739, role: 'Jordan-totient Perl script used in LP2 discussion', urls: ['https://dpaste.de/CO4O', 'https://dpaste.de/CO4O#L'] },
  { id: 'Wrqq9JLr', date: '2014-06-13 17:56', line: 198922, role: 'ordered-character list proposed to derive a different onion', urls: ['https://pastebin.com/raw/Wrqq9JLr'] },
  { id: 'enVZ5uxL', date: '2014-06-22 18:32', line: 210904, role: 'Wind claimed decode/source paste with disputed first two lines', urls: ['https://pastebin.com/raw/enVZ5uxL'] },
  { id: 'iQUB', date: '2014-06-22 16:31', line: 210760, role: 'sprunge URL reportedly embedded in n.jpg', urls: ['https://sprunge.us/iQUB', 'http://sprunge.us/iQUB'] },
  { id: 'YjaAmfjn', date: '2014-07-10 13:14', line: 219486, role: 'Wind-related paste with Shakespeare and Emblem Writers book references', urls: ['https://pastebin.com/raw/YjaAmfjn'] },
  { id: 'YJdG', date: '2014-07-10 12:52', line: 219445, role: 'reported exact onion index.html content', urls: ['https://sprunge.us/YJdG', 'http://sprunge.us/YJdG'] },
  { id: 'Yg2u7HNw', date: '2014-09-07 01:03', line: 2005, role: 'participant source script', urls: ['https://pastebin.com/raw/Yg2u7HNw'] },
  { id: '7AvbevYe', date: '2014-09-07 01:03', line: 2005, role: 'tokenization output paired with Yg2u7HNw', urls: ['https://pastebin.com/raw/7AvbevYe'] },
  { id: 'CCZP1WkY', date: '2014-10-18 00:38', line: 18074, role: 'PGP-encrypted message allegedly sent to Cicada', urls: ['https://pastebin.com/raw/CCZP1WkY'] },
  { id: 'wSpPq5Aa', date: '2014-10-30 12:38', line: 23145, role: 'participant source code', urls: ['https://pastebin.com/raw/wSpPq5Aa'] },
];

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

async function fetchOne(url) {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': 'liber-primus-source-recovery/1.0' },
    });
    const buf = Buffer.from(await response.arrayBuffer());
    const type = response.headers.get('content-type');
    return {
      requested_url: url,
      final_url: response.url,
      status: response.status,
      content_type: type,
      bytes: buf.length,
      sha256: sha256(buf),
      base64: response.ok ? buf.toString('base64') : null,
      preview_latin1: buf.subarray(0, 600).toString('latin1'),
    };
  } catch (error) {
    return { requested_url: url, error: String(error) };
  }
}

async function main() {
  const results = [];
  for (const target of TARGETS) {
    const attempts = [];
    for (const url of target.urls) attempts.push(await fetchOne(url));
    results.push({ ...target, attempts });
  }

  const summary = results.map((r) => ({
    id: r.id,
    role: r.role,
    outcomes: r.attempts.map((x) => ({
      requested_url: x.requested_url,
      final_url: x.final_url,
      status: x.status,
      content_type: x.content_type,
      bytes: x.bytes,
      sha256: x.sha256,
      error: x.error,
      preview_latin1: x.preview_latin1,
    })),
  }));

  console.log('RECOVERY ' + JSON.stringify(summary));
  fs.writeFileSync(
    path.join(process.env.RUNNER_TEMP || '.', 'source-test-output.json'),
    JSON.stringify({ targets: results }),
  );
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
