"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const REF = "ade9a02889ef8acbc8cde8edbfd0a785c369f4c3";
const URL = "https://raw.githubusercontent.com/neuroretransmit/cicada/" + REF + "/2012/003-subreddit/a2e7j6ic78h0j-posts.json";
const SHA = "76e5ca0f3f00cd6ec740e9bde575f4d55dbc53b3";
const KEY = Array.from("a2e7j6ic78h0j7eiejd0120", x => parseInt(x, 36));
const GP = "F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" ");
const PRIMES = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const EXPECTED = "CALL US AT US TELE PHONE NUMBER TWO ONE FOUR THREE NINE OH NINE SIX OH EIGHT";

/** @param {string} title */
function decipher(title) {
  let i = 0;
  return title.trim().toUpperCase().replace(/[A-Z]/g, ch =>
    String.fromCharCode(65 + (ch.charCodeAt(0) - 65 - KEY[i++ % KEY.length] + 26) % 26));
}

/** @param {bigint} n */
function digits29(n) {
  let d = 0;
  do { d++; n /= 29n; } while (n);
  return d;
}

/** @param {string} text */
function stats(text) {
  const runes = text.match(/TH|NG|EO|OE|AE|IA|EA|[A-Z]/g);
  return {chars:text.length,spaces:text.split(" ").length-1,runes:runes.length,
    primeSum:runes.reduce((a,x)=>a+PRIMES[GP.indexOf(x)],0)};
}

async function main() {
  const bytes = process.argv[2] ? fs.readFileSync(process.argv[2]) :
    Buffer.from(await (async()=>{const res=await fetch(URL); assert.ok(res.ok); return res.arrayBuffer();})());
  const sha = crypto.createHash("sha1").update("blob " + bytes.length + "\0").update(bytes).digest("hex");
  assert.equal(sha,SHA);
  const posts=JSON.parse(bytes.toString("utf8")).data.sort((a,b)=>a.created_utc-b.created_utc);
  const input=fs.readFileSync(path.join(__dirname,"../im-results/2012-first-image-1CcV1-outguess.txt"),"utf8");
  const pairs=Array.from(input.matchAll(/^(\d+):(\d+)$/gm),m=>[+m[1],+m[2]]);
  assert.equal(pairs.length,76);
  /** @param {(post: {author:string,url:string,title:string}) => boolean} select */
  function decode(select) {
    const seen=new Set();
    const lines=posts.filter(p=>select(p)&&!/\.(?:jpg|png)$/i.test(p.url)&&!seen.has(p.title)&&seen.add(p.title)).map(p=>decipher(p.title));
    return {lines:lines.length, text:pairs.map(([l,c])=>lines[l-1][c-1]).join("")};
  }
  const all=decode(()=>true);
  const named=decode(p=>["CageThrottleUs","ImagoOnNib"].includes(p.author));
  const guest=decode(p=>p.author==="CageThrottleUs");
  assert.equal(all.text,"CAMT"+EXPECTED.slice(4));
  assert.equal(named.text,EXPECTED);
  assert.equal(guest.text,EXPECTED);
  assert.equal(all.lines,186);assert.equal(named.lines,185);assert.equal(guest.lines,185);
  assert.deepEqual(stats(named.text),{chars:76,spaces:16,runes:59,primeSum:2262});
  assert.equal(stats(all.text).primeSum,2246);
  const ascii = Array.from(named.text,c=>c.charCodeAt(0));
  const packed=ascii.reduce((n,b)=>256n*n+BigInt(b),0n);
  const serialization={
    asciiPerChar:ascii.reduce((n,b)=>n+digits29(BigInt(b)),0),
    asciiPackedBigEndian:digits29(packed),
    gpWithAsciiSpace:59+16*digits29(32n),
    columnFields:pairs.reduce((n,[l,c])=>n+digits29(BigInt(c)),0),
    lineAndColumnFields:pairs.reduce((n,[l,c])=>n+digits29(BigInt(l))+digits29(BigInt(c)),0)
  };
  assert.deepEqual(serialization,{asciiPerChar:152,asciiPackedBigEndian:125,gpWithAsciiSpace:91,columnFields:89,lineAndColumnFields:213});
  console.log({all,named,guest,allStats:stats(all.text),namedStats:stats(named.text),serialization});
}
main();
