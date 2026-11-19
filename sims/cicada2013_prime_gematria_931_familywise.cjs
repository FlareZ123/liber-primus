#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const assert = require("node:assert/strict");

const corpus = JSON.parse(fs.readFileSync("im-results/data/cicada2013-clear-signed-text-corpus.json","utf8"));
const html = fs.readFileSync("resources/external/cicada2014-stage11-onion7-original-index.html","utf8");
const LOOKUP = {
  F:2,U:3,V:3,TH:5,O:7,R:11,C:13,K:13,G:17,W:19,H:23,N:29,
  I:31,J:37,EO:41,P:43,X:47,S:53,T:59,B:61,E:67,M:71,L:73,
  NG:79,OE:83,D:89,A:97,AE:101,Y:103,IA:107,EA:109
};
const DIGRAPHS = Object.keys(LOOKUP).filter(token=>token.length===2);
const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRS";
function base29(value){
  if(value===0)return "0";
  let n=value,out="";
  while(n>0){out=ALPHABET[n%29]+out;n=Math.floor(n/29);}
  return out;
}
function tokenize(text){
  const letters=text.toUpperCase().replace(/[^A-Z]/g,"");
  const tokens=[];
  for(let i=0;i<letters.length;){
    const pair=letters.slice(i,i+2);
    if(DIGRAPHS.includes(pair)){tokens.push({token:pair,value:LOOKUP[pair]});i+=2;}
    else {const ch=letters[i];assert.notEqual(LOOKUP[ch],undefined,"unmapped letter "+ch);tokens.push({token:ch,value:LOOKUP[ch]});i++;}
  }
  return tokens;
}
const summaries=[];
const hits=[];
let totalWindows=0;
for(const file of corpus.files){
  const tokens=tokenize(file.body);
  const primeSum=tokens.reduce((sum,item)=>sum+item.value,0);
  summaries.push({
    path:file.source_path,source_blob_sha:file.source_blob_sha,
    token_count:tokens.length,prime_sum:primeSum,base29:base29(primeSum)
  });
  for(let start=0;start+19<=tokens.length;start++){
    totalWindows++;
    const window=tokens.slice(start,start+19);
    const sum=window.reduce((s,item)=>s+item.value,0);
    if(sum===931)hits.push({
      path:file.source_path,start_token:start,
      token_sequence:window.map(item=>item.token).join(" "),
      concatenated:window.map(item=>item.token).join("")
    });
  }
}
const os=summaries.find(x=>x.path.includes("message.txt.asc"));
assert.equal(os.prime_sum,1153);
assert.equal(base29(931),"133");
assert.equal(base29(1153),"1AM");
const title=html.match(/<title>(.*?)<\/title>/is)?.[1]?.trim()??null;
const ids=[...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(m=>m[1]);
const images=[...html.matchAll(/(?:src|href)=["']([^"']+\.(?:jpg|jpeg|png))["']/gi)].map(m=>m[1]);
console.log(JSON.stringify({
  corpus_selection:corpus.selection,
  message_summaries:summaries,
  target_phrase_prime_sum:931,
  target_phrase_base29:base29(931),
  os_full_message_prime_sum:os.prime_sum,
  os_full_message_base29:os.base29,
  scanned_19_token_windows:totalWindows,
  19_token_windows_summing_931:hits,
  hit_count:hits.length,
  stage11:{title,ids,image_count:images.length,first_image:images[0],last_image:images.at(-1),has_image_133:images.some(x=>/(?:^|\/)133\./.test(x)),title_mod_image_count:Number(title)%images.length}
},null,2));
