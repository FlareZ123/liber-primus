"use strict";

/**
 * Original embedded 2019 LP2 draft allegation audio: public URL availability.
 * Only records metadata and link identity, never stores copyrighted audio.
 * Node 22 CommonJS. Read-only and source-fixed: SoundCloud track 674256992.
 */
const assert = require("node:assert/strict");

const track = "674256992";
const encoded = encodeURIComponent("https://api.soundcloud.com/tracks/"+track);
const urls = [
  "https://w.soundcloud.com/player/?url="+encoded,
  "https://api.soundcloud.com/tracks/"+track,
  "https://api.soundcloud.com/oembed?url="+encoded,
];

/** @param {string} url @returns {Promise<void>} */
async function probe(url) {
  try {
    const result = await fetch(url, {
      headers: {"User-Agent":"Mozilla/5.0 (compatible; liber-primus-research/1.0)",
        Accept:"text/html,application/json;q=0.9,*/*;q=0.5"},
      signal:AbortSignal.timeout(20000),
    });
    const type=result.headers.get("content-type")||"";
    const detail={url,code:result.status,final_url:result.url,
      content_type:type,content_length:result.headers.get("content-length"),
      server:result.headers.get("server")};
    if(type.includes("text/")||type.includes("json")){
      const body=await result.text();
      detail.body_bytes=Buffer.byteLength(body);
      detail.title=body.match(/<title>([^<]*)<\/title>/i)?.[1]||null;
      detail.track_reference_count=(body.match(/674256992/g)||[]).length;
      detail.has_cicada=/cicada|ghost3301|trujillo/i.test(body);
      detail.open_graph_url=body.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i)?.[1]||null;
      if(type.includes("json")){
        const data=JSON.parse(body);
        detail.api_status=data.status||data.message||null;
        detail.api_kind=data.kind||null;
        detail.api_title=data.title||null;
        detail.api_permalink=data.permalink_url||null;
        detail.api_duration_ms=data.duration||null;
      }
    }
    console.log(JSON.stringify(detail));
  }catch(err){
    console.log(JSON.stringify({url,error:String(err)}));
  }
}
async function main(){
  assert.equal(urls.length,3);
  for(const url of urls) await probe(url);
}
main().catch(err=>{console.error(err);process.exitCode=1;});
