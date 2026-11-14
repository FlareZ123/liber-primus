"use strict";
/**
 * Source-locked 2015-16 original LP2 pad survival test, Node 22/CJS.
 * Four preselected 2015-16 IRC handles, excluding previously audited pads.
 * Does not probe unlisted pads or infer ciphertext keys from link names.
 * Read-only. Network mode: run via the existing manual CommonJS workflow.
 */
const assert = require("node:assert/strict");
const handles = Object.freeze([
  {id:"X29BZhdBBe",line:79394,date:"2015 Jan 22 17:13",purpose:"p0-56 GP rune-pair frequency workpad"},
  {id:"vQDFPZCOeU",line:95970,date:"2015 Feb 18 16:22",purpose:"first-person original rune-attack idea dump"},
  {id:"ZMy1pcfGp3",line:221828,date:"2016 Jan 06 20:53",purpose:"original LP2 collaborative methods/results"},
  {id:"a9tZpsesUF",line:237010,date:"2016 Jan 08 22:19",purpose:"participant-linked alternative page translation"}
]);
assert.equal(handles.length, 4);
assert.equal(new Set(handles.map(x=>x.id)).size, 4);

/** @param {string} url */
async function acquire(url) {
  const start = Date.now();
  try {
    const resp = await fetch(url, {redirect:"follow",
      signal:AbortSignal.timeout(11000),
      headers:{"User-Agent":"LP2-original-pads-bounded-source/1.0"}});
    const text = (await resp.text()).slice(0,300000);
    const match = text.match(/(?:\[\["urlkey","timestamp","original","mimetype","statuscode","digest","length"\]|(?:19|20)\d{12}|<title[^>]*>[^<]+)/ig);
    const likelyArchive = /(?:19|20)\d{12}/.test(text) && /(?:titanpad|warc|text\/html)/i.test(text);
    return {status:resp.status,bytes:text.length,url:resp.url,
      seconds:Math.round((Date.now()-start)/1000),
      likelyArchive,archiveHints:(match||[]).slice(0,9),
      preview:text.replace(/\s+/g," ").slice(0,250)};
  } catch(e) {return {error:String(e),seconds:Math.round((Date.now()-start)/1000)};}
}
async function main() {
  if (process.argv.includes("--selftest")) {
    console.log("PASS four date-locked 2015/16 original-pad source handles");
    return;
  }
  // The existing manual-only Windows workflow invokes this committed source without arguments.
  const control = await acquire("https://web.archive.org/cdx/search/cdx?url=example.com&output=json&filter=statuscode:200&collapse=urlkey");
  console.log("WAYBACK CONTROL "+JSON.stringify(control));
  const other = await acquire("https://arquivo.pt/wayback/cdx?url=example.com&output=json&filter=statuscode:200");
  console.log("ARQUIVO CONTROL "+JSON.stringify(other));
  for(const h of handles) {
    const target="titanpad.com/"+h.id;
    const urls=[
      "https://web.archive.org/cdx/search/cdx?url="+encodeURIComponent(target)+"&output=json&filter=statuscode:200",
      "https://arquivo.pt/wayback/cdx?url="+encodeURIComponent(target)+"&output=json&filter=statuscode:200",
      "https://web.archive.org/web/20170101000000/https://"+target,
      "https://"+target
    ];
    const r=await Promise.all(urls.map(acquire));
    console.log("HANDLE "+JSON.stringify({...h,urls:urls.map((u,i)=>({asked:u,...r[i]}))}));
  }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
