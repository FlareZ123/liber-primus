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
  testBannerKey();
  testColumnCodebook(posts,pairs,named.text);
  await testGutenbergCarrier(posts,pairs);
}

/** @param {number} x */
const mod29=x=>(x%29+29)%29;
/** @param {number[]} plain */
function ioc(plain) {
  const f=Array(29).fill(0);
  for(const x of plain)f[x]++;
  return f.reduce((a,n)=>a+n*(n-1),0)/(plain.length*(plain.length-1));
}
/** @param {number[]} cipher @param {number[]} key */
function direct(cipher,key) {
  return cipher.map((x,i)=>mod29(x-key[i%key.length]));
}
/** @param {number[]} plain @param {number[]} key */
function encryptF(plain,key) {
  let i=0;
  return plain.map(x=>x===0?0:mod29(x+key[i++%key.length]));
}
/** @param {number[]} cipher @param {number[]} key */
function invertF(cipher,key) {
  let states=[{i:0,p:[]}];
  for(let k=0;k<cipher.length;k++) {
    const next=[];
    for(const s of states) {
      if(cipher[k]===0)next.push({i:s.i,p:[...s.p,0]});
      const x=mod29(cipher[k]-key[s.i%key.length]);
      if(x!==0)next.push({i:s.i+1,p:[...s.p,x]});
    }
    states=next;
    if(!states.length)return {paths:[],fail:k};
  }
  return {paths:states.map(s=>s.p),fail:null};
}
function testBannerKey(){
  const dir=path.join(__dirname,"../resources/liber-primus");
  const j=JSON.parse(fs.readFileSync(path.join(dir,"lp2-corpus.json"),"utf8"));
  const map=new Map(j.runes.map((r,i)=>[r,i]));
  const src=fs.readFileSync(path.join(dir,"lp2-transcription.txt"),"utf8").split("%")
    .map(p=>p.split(/[\n/]+/).map(l=>Array.from(l).filter(x=>map.has(x)).map(x=>map.get(x))).filter(l=>l.length));
  let n=0;
  const rows=j.pages.map(p=>p.runic_count===0?[]:src[n++]);
  rows.forEach((r,i)=>assert.deepEqual(r.flat(),j.pages[i].indices));
  assert.deepEqual(rows[55].map(l=>l.length),[24,22,22,8]);
  const expected=[53,111,51,35,4,4,53,43,51,55,4,4];
  const output=[];
  for(const q of [13,23]) {
    const key=KEY.slice(0,q);
    for(const page of [0,55]) for(const start of page===55?[0,1]:[0]) {
      const rr=rows[page].map((l,i)=>i===0?l.slice(start):l);
      for(const mode of ["line","page"]) {
        const segs=mode==="line"?rr:[rr.flat()];
        const d=segs.flatMap(s=>direct(s,key));
        for(const s of segs)assert.deepEqual(direct(s,key).map((x,i)=>mod29(x+key[i%key.length])),s);
        let total=0,fail=null;
        for(const s of segs){
          const inv=invertF(s,key);
          if(!inv.paths.length){fail=start+total+inv.fail;break;}
          total+=s.length;
        }
        assert.equal(fail,expected[output.length]);
        // Use the original solved p57 native rune sequence as the plant.
        // Preserve the proposed line reset rule by splitting at the test line lengths.
        const control=j.pages[57].indices.slice(0,page===55?76-start:95);
        let off=0;
        for(const s of segs) {
          const p=control.slice(off,off+s.length);
          off+=p.length;
          if(!p.length)break;
          const c=encryptF(p,key),inv=invertF(c,key);
          assert.ok(inv.paths.some(x=>x.join()===p.join()));
          assert.ok(inv.paths.every(x=>encryptF(x,key).join()===c.join()));
        }
        output.push({q,page,start,mode,firstImpossiblePhysicalIndex:fail,ioc:ioc(d),prefix:d.map(x=>j.translit[x]).join("").slice(0,80)});
      }
    }
    for(const mode of ["line","page"]){
      const p=rows.slice(0,56).flatMap(rr=>(mode==="line"?rr:[rr.flat()]).flatMap(s=>direct(s,key)));
      assert.equal(p.length,12956);
      console.log({q,mode,wholeIoC:ioc(p)});
    }
  }
  console.log({bannerKeyTests:output});
}

main();

/** Exact minimum private column choices required per p55 rune.
 * @param {Array<{author:string,url:string,title:string}>} posts
 * @param {number[][]} pairs
 * @param {string} target
 */
function testColumnCodebook(posts,pairs,target) {
  const seen=new Set();
  const lines=posts.filter(p=>["CageThrottleUs","ImagoOnNib"].includes(p.author)&&!/\.(?:jpg|png)$/i.test(p.url)&&!seen.has(p.title)&&seen.add(p.title)).map(p=>decipher(p.title));
  const j=JSON.parse(fs.readFileSync(path.join(__dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"));
  const original=j.pages[55].indices;
  assert.equal(original.length,76);
  assert.ok(pairs.every(([l],i)=>l===i+1));
  assert.equal(new Set(pairs.map(x=>x[1])).size,32);
  assert.equal(new Set(original).size,25);
  for(const [label,cols] of [["ordinal",original.map(x=>x+1)],["prime",original.map(x=>PRIMES[x])]]){
    const valid=cols.filter((c,i)=>c<=lines[i].length).length;
    assert.equal(valid,label==="ordinal"?76:55);
    console.log({label,valid,out:cols.map((c,i)=>lines[i][c-1]??"?").join("")});
  }
  /** @param {number[]} v */
  function gate(v){
    return Array.from({length:29},(_,r)=>{
      const positions=v.flatMap((x,i)=>x===r?[i]:[]);
      if(!positions.length)return null;
      const max=Math.max(...positions.map(i=>lines[i].length)),lim=1<<positions.length;
      const dp=Array(lim).fill(Infinity),w=Array(lim).fill(null);dp[0]=0;w[0]=[];
      const masks=Array.from({length:max},(_,c)=>positions.reduce((a,i,k)=>a|((lines[i][c]===target[i])?(1<<k):0),0));
      for(let m=0;m<lim;m++){
        if(!Number.isFinite(dp[m]))continue;
        for(let c=0;c<max;c++){
          const n=m|masks[c];
          if(dp[n]>dp[m]+1){dp[n]=dp[m]+1;w[n]=[...w[m],c+1];}
        }
      }
      const witness=w[lim-1];
      assert.ok(witness&&positions.every(i=>witness.some(col=>lines[i][col-1]===target[i])));
      return {rune:GP[r],positions:positions.map(i=>i+1),min:dp[lim-1],witness};
    }).filter(Boolean);
  }
  const result=gate(original);
  const counts=result.reduce((a,x)=>(a[x.min]=(a[x.min]??0)+1,a),{});
  assert.deepEqual(counts,{1:7,2:8,3:4,4:5,6:1});
  assert.equal(result.reduce((a,x)=>a+x.min,0),61);
  assert.equal(result.find(x=>x.rune==="S").min,6);
  const control=gate(pairs.map(x=>x[1]%29));
  assert.ok(control.every(x=>x.min<=3));
  console.log({columnCodebook:result,counts,control:control.map(x=>x.min)});
}

/** Recover the carrier independently from the historical Gutenberg edition.
 * @param {Array<{author:string,url:string,title:string}>} posts
 * @param {number[][]} pairs
 */
async function testGutenbergCarrier(posts,pairs) {
  const url="https://raw.githubusercontent.com/GITenberg/The-Mabinogion_5160/86b1521ce54ddae3caaa235a6fb04a9ae67f2370/old/mbng10.txt";
  const bytes=process.argv[3]?fs.readFileSync(process.argv[3]):Buffer.from(await(async()=>{const res=await fetch(url);assert.ok(res.ok);return res.arrayBuffer();})());
  assert.equal(crypto.createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex"),"2a149950ed767f5c6f03d9710935f288b85d72d0");
  assert.equal(bytes.length,599427);
  const upper=bytes.toString("ascii").toUpperCase(),start=upper.indexOf("KING ARTHUR WAS AT CAERLLEON");
  assert.equal(start,17345);
  const raw=upper.slice(start).split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,188);
  const lines=[],merges=[];
  for(let i=0;i<raw.length;i++){
    const l=raw[i];
    if(l.split(/\s+/).length<=3){merges.push(i+1);lines[lines.length-1]+=" "+l;}
    else lines.push(l);
  }
  assert.deepEqual(merges,[10,51,138]);
  assert.equal(lines.length,185);
  assert.equal(lines.join(" ").length,12384);
  assert.equal(lines.join(" ").match(/[A-Z]+(?:['-][A-Z]+)*/g).length,2414);
  assert.equal(pairs.map(([l,c])=>lines[l-1][c-1]).join(""),EXPECTED);
  const seen=new Set();
  const archived=posts.filter(p=>["CageThrottleUs","ImagoOnNib"].includes(p.author)&&!/\.(?:jpg|png)$/i.test(p.url)&&!seen.has(p.title)&&seen.add(p.title)).map(p=>decipher(p.title));
  assert.deepEqual(lines,archived);
  console.log({gutenbergCarrier:{lines:185,sourceNonblankLines:188,merges,words:2414,exactTitleMatch:185,extracted:EXPECTED}});
}
