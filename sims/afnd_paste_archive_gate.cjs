'use strict';
/**
 * Frozen one-ID provenance recovery: 2013 pastebin.com/AfndPJa0 COUNT transcript.
 * Node.js 22/Windows 11, built-ins only.
 *
 * This is source recovery, not a decryption or brute-force procedure.
 * URLs and source semantics were fixed before the attempt. Print only bounded
 * excerpts, HTTP status, exact body length and hash. Reuse unchanged outcomes
 * instead of repeating inaccessible archive searches.
 */
const crypto = require('node:crypto');

const paths = [
  {name:'paste-html',url:'https://pastebin.com/AfndPJa0'},
  {name:'paste-raw',url:'https://pastebin.com/raw/AfndPJa0'},
  {name:'archive-availability',url:'https://archive.org/wayback/available?url=http%3A%2F%2Fpastebin.com%2FAfndPJa0&timestamp=20130114'},
  {name:'archive-cdx',url:'https://web.archive.org/cdx/search/cdx?url=pastebin.com%2FAfndPJa0&output=json&filter=statuscode%3A200'},
  {name:'archive-raw-cdx',url:'https://web.archive.org/cdx/search/cdx?url=pastebin.com%2Fraw.php%3Fi%3DAfndPJa0&output=json&filter=statuscode%3A200'}
];

/**
 * @param {{name:string,url:string}} item
 * @returns {Promise<{source:string,status:string,url:string,length?:number,sha256?:string,excerpt?:string,error?:string}>}
 */
async function inspect(item) {
  try {
    const response = await fetch(item.url,{
      redirect:'follow',
      signal:AbortSignal.timeout(18000),
      headers:{'User-Agent':'LiberPrimus historical source audit 2026; archive retrieval only'}
    });
    const data=Buffer.from(await response.arrayBuffer());
    const body=data.toString('utf8');
    const term=body.search(/AfndPJa0|761|instar|count|snapshot|timestamp/i);
    const start=Math.max(0,term-70);
    return {
      source:item.name,
      status:String(response.status),
      url:response.url,
      length:data.length,
      sha256:crypto.createHash('sha256').update(data).digest('hex'),
      excerpt:body.slice(start,start+680)
    };
  } catch(error) {
    return {source:item.name,status:'failed',url:item.url,error:String(error).slice(0,260)};
  }
}

async function main() {
  const results=await Promise.all(paths.map(inspect));
  console.log(JSON.stringify({
    target:'AfndPJa0 only',
    expected_indirect_2016_wiki:'COUNT THE INSTAR EMERGENCE -> 761',
    results
  },null,2));
}
main().catch(error => {console.error(error);process.exitCode=1;});
