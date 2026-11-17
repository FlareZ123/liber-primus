"use strict";
/** Historical Cicada RSA-4096 signature versus three 256-event source tapes
 * joined with the 256-byte LP2 grid. Node.js 22, read-only CommonJS.
 */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=f=>fs.readFileSync(path.join(__dirname,"..",f),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const punct=JSON.parse(read("resources/liber-primus/lp2-punctuation-identity.json"));
const table=JSON.parse(read("resources/liber-primus/lp2-grid-256.json")).pages.flatMap(p=>p.bytes);
assert.equal(table.length,256);
const armor=(str,kind)=>Buffer.from(str.split("-----BEGIN "+kind+"-----")[1]
  .split("-----END "+kind+"-----")[0].split(/\r?\n/)
  .map(x=>x.trim()).filter(x=>x&&!x.startsWith("=")&&!x.includes(":"))
  .join(""),"base64");
const toBig=a=>BigInt("0x"+Array.from(a,x=>x.toString(16).padStart(2,"0")).join(""));
const mpi=(a,i)=>{
  const bits=a[i]<<8|a[i+1],n=Math.ceil(bits/8);
  assert(i+2+n<=a.length);
  return {bits,value:toBig(a.slice(i+2,i+2+n)),end:i+2+n};
};
const modPow=(x,e,n)=>{
  let out=1n;
  while(e>0n){if(e&1n)out=out*x%n;x=x*x%n;e>>=1n;}
  return out;
};
const bytes512=x=>{
  const h=x.toString(16).padStart(1024,"0");
  assert.equal(h.length,1024);
  return Uint8Array.from(h.match(/../g),s=>parseInt(s,16));
};
const validPad=a=>{
  if(a[0]!==0||a[1]!==1)return false;
  let i=2;
  while(i<512&&a[i]===255)i++;
  return i>=10&&i<512&&a[i]===0;
};
const key=armor(read("resources/external/cicada3301-rsa-public-4096.asc"),
  "PGP PUBLIC KEY BLOCK");
assert.equal(key[0],0x99);
assert.equal(key[3],4);
assert.equal(key[8],1);
const n=mpi(key,9),e=mpi(key,n.end);
assert.equal(n.bits,4096);
assert.equal(e.value,65537n);
const signature=armor(read("resources/cicada2014-may2-signed-message.asc"),
  "PGP SIGNATURE");
assert.equal(signature[0],0x89);
assert.equal((signature[1]<<8|signature[2])+3,signature.length);
const b=signature.slice(3);
assert.deepEqual(Array.from(b.slice(0,4)),[4,1,1,2]);
const u=6+(b[4]<<8|b[5]),s=mpi(b,u+2+(b[u]<<8|b[u+1])+2);
assert.equal(s.end,b.length);
const positive=bytes512(modPow(s.value,e.value,n.value));
assert(validPad(positive));
let endFF=2;while(positive[endFF]===255)endFF++;
assert.equal(endFF,476);
assert.deepEqual(Array.from(positive.slice(endFF+1,endFF+16)),
  [48,33,48,9,6,5,43,14,3,2,26,5,0,4,20]);
const prime=new Map(gp.runes.map((r,i)=>[r,gp.prime[i]]));
const chapter=new Map(punct.events.filter(x=>x.large_mark)
  .map(x=>[x.page+":"+x.local_rune_offset,x.large_mark.dot_count]));
assert.equal(punct.events.filter(x=>x.large_mark).length,31);
assert.equal(chapter.size,30); // p7 has black and red 13-dot marks at same offset
const records={A:[],B:[],C:[]};
let red=0,red13=0,black13=0,red23=0;
for(const pg of ink.pages){
  const events=[];
  for(const span of pg.red_spans??[]){
    assert.equal([...span.runes].length,span.length);
    for(const [j,r] of [...span.runes].entries()){
      assert(prime.has(r));
      events.push({at:span.start+j,priority:1,v:prime.get(r),rune:true});
      red++;
    }
  }
  for(const [at,dots,color] of pg.large_punctuation??[]){
    events.push({at,priority:0,v:dots,rune:false,dots,color});
    if(dots===13){if(color==="red")red13++;else black13++;}
    if(dots===23&&color==="red")red23++;
  }
  events.sort((a,b)=>a.at-b.at||a.priority-b.priority);
  for(const x of events){
    if(x.rune){for(const r of Object.values(records))r.push(x.v);}
    else{
      if(x.dots===13)records.A.push(x.v);
      if(x.dots===13&&x.color==="red"||x.dots===23&&x.color==="red")
        records.B.push(x.v);
      if(chapter.get(pg.page+":"+x.at)===x.dots)records.C.push(x.v);
    }
  }
}
assert.deepEqual({red,red13,black13,red23},{red:225,red13:30,black13:1,red23:1});
for(const r of Object.values(records))assert.equal(r.length,256);
const checks=[];
for(const [kind,r] of Object.entries(records)){
  for(const order of ["events-first","table-first"]){
    const joined=order==="events-first"?[...r,...table]:[...table,...r];
    for(const reverse of [false,true]){
      const src=reverse?joined.slice().reverse():joined;
      const v=toBig(src),decoded=bytes512(modPow(v,e.value,n.value));
      checks.push({kind,order,reverse,inRange:v<n.value,valid:validPad(decoded)});
    }
  }
}
assert.equal(checks.length,12);
assert.equal(checks.filter(x=>x.inRange).length,9);
assert.equal(checks.filter(x=>x.valid).length,0);
console.log(JSON.stringify({status:"PASS",
  authenticMay2014Positive:true,modulusBits:n.bits,exponent:String(e.value),
  classSizes:Object.fromEntries(Object.entries(records).map(([k,v])=>[k,v.length])),
  candidateCount:12,inRangeCount:9,validSignatureCount:0,checks},null,2));
