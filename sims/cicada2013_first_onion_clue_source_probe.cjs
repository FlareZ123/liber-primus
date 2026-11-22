'use strict';
/** Historical exact-ID source recovery: first-onion 2013 clue/hello, Node22. */
const crypto=require('node:crypto');
/** @param {string} url */
async function get(url){try{const r=await fetch(url,{signal:AbortSignal.timeout(20000),redirect:'follow'});const b=Buffer.from(await r.arrayBuffer());return {url:r.url,status:r.status,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex'),body:b.toString('utf8').slice(0,14000)}}catch(e){return {url,error:String(e)}}}
(async()=>{const ids=['tbbZd5vy','uCTgE2KA'];for(const id of ids){const a=await get('https://pastebin.com/raw/'+id);const b=await get('https://pastebin.com/'+id);console.log(JSON.stringify({id,raw:a,htmlMeta:{status:b.status,dateExcerpt:b.body?.match(/2013[^<]{0,70}/)?.[0]??null}},null,2))}})().catch(e=>{console.error(e);process.exitCode=1});
