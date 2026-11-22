'use strict';
/**
 * Source-bound acquisition of previously unreviewed pages 2-5 of a March 2016
 * Calypne claim thread. Prints the complete date/author/source-bound claims.
 * The first page, audited elsewhere, is an independent parser positive control.
 * Read-only: original public site and one fixed 2019 Wayback snapshot of historical 2016 posts.
 */
const crypto = require('node:crypto');

const live = 'https://calypne.boards.net/thread/53/supposed-decoded-liber-primus';
const archive = 'https://web.archive.org/web/20190822220345/http://calypne.boards.net:80/thread/53/supposed-decoded-liber-primus';
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const terms = /\b(?:solv(?:e|ed|ing)|decod(?:ed|ing|e)|decryp(?:t|ted)|crack(?:ed)?|plaintext|cleartext|key(?:word)?|algorithm|rune(?:s)?|page\s*\d{1,2}|cipher|translate|pastebin|gist)\b/gi;
/** @param {string} html */
function plain(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(?:p|div|blockquote)>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&').replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>')
    .replace(/[ \t]+/g,' ').replace(/\n[\s\n]*/g,'\n').trim();
}
/** @param {string} chunk */
function messageHtml(chunk) {
  const tag = /<div\s+class=["']message["'][^>]*>/i.exec(chunk);
  if (!tag) return '';
  const start = tag.index + tag[0].length;
  let depth = 1;
  for (const m of chunk.slice(start).matchAll(/<\/?div\b[^>]*>/gi)) {
    depth += m[0].startsWith('</') ? -1 : 1;
    if (!depth) return chunk.slice(start, start + m.index);
  }
  return '';
}
/** @param {string} doc @param {string} label */
function inspect(doc, label) {
  const heads = [...doc.matchAll(/<tr\s+id=["']post-(\d+)["'][^>]*class=["'][^"']*\bpost\b[^"']*["'][^>]*>/gi)];
  const posts = [];
  for (let i = 0; i < heads.length; i++) {
    const chunk = doc.slice(heads[i].index, heads[i+1]?.index ?? doc.length);
    const html = messageHtml(chunk);
    const body = plain(html);
    if (!body) continue;
    const date = /<abbr\b[^>]*data-timestamp=["'](\d+)["']/i.exec(chunk)?.[1] ?? '';
    const author = /<h3\b[^>]*>Post by ([^<]*?) on <abbr/i.exec(chunk)?.[1] ?? '';
    const hits = [...body.matchAll(terms)].map(x => x.index);
    const links = [...new Set([...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)].map(x=>x[1]))];
    posts.push({id:Number(heads[i][1]),date,author,bytes:Buffer.byteLength(body),sha256:sha256(body),hits:hits.length,links:links.slice(0,10)});
    console.log('POST '+JSON.stringify({source:label,...posts[posts.length-1],
      text:body.slice(0,body.length<1800?body.length:1600),
      matches:hits.slice(0,12).map(j=>body.slice(Math.max(0,j-70),Math.min(body.length,j+140)).replace(/\s+/g,' '))}));
  }
  console.log('PAGE '+JSON.stringify({source:label,postCount:posts.length,ids:posts.map(x=>x.id)}));
  return posts;
}
(async () => {
  let knownPositive = false, newPages = 0;
  const inputs = [
    ['live-page1',live],
    ...[2,3,4,5].map(n=>['live-page'+n,live+'?page='+n]),
    ['2019-archive-page2',archive+'?page=2']
  ];
  for (const [label,url] of inputs) {
    try {
      const r = await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(30000)});
      const html = await r.text();
      console.log('SOURCE '+JSON.stringify({label,status:r.status,url:r.url,bytes:Buffer.byteLength(html),sha256:sha256(html)}));
      if (!r.ok) continue;
      const posts = inspect(html,label);
      if (label==='live-page1') knownPositive = posts.some(p=>p.id===278);
      else if (/live-page[2-5]/.test(label) && posts.length && !posts.some(p=>p.id===278)) newPages++;
    } catch (e) {
      console.log('ERROR '+JSON.stringify({label,error:String(e)}));
    }
  }
  console.log('DECISION '+JSON.stringify({firstPagePositive:knownPositive,newLivePageCount:newPages}));
  if(!knownPositive||newPages===0)process.exitCode=2;
})().catch(e=>{console.error(e);process.exitCode=1;});
