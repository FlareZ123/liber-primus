"use strict";
/** Original-event 133-bit rank -> two AES-128 key windows -> 256-byte grid.
 * The rank, AES and source-table join are hypotheses, not authored commands.
 * Run: node sims/lp2_red31_comb133_aes128_table_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const load=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));
const ink=load("resources/liber-primus/lp2-ink-annotations.json");
const corpus=load("resources/liber-primus/lp2-corpus.json");
const table=load("resources/liber-primus/lp2-grid-256.json");
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const events=[];
for(const page of ink.pages){
  const original=corpus.pages.find(p=>p.page===page.page);
  assert.ok(original);
  for(const span of page.red_spans||[]){
    const values=[...span.runes].map(r=>runeIndex.get(r));
    assert.deepEqual(original.indices.slice(span.start,span.start+span.length),values);
    for(let i=0;i<values.length;i++)events.push({p:page.page,at:span.start+i,kind:0,order:0});
  }
  let markOrder=0;
  for(const [at,dots] of page.large_punctuation||[]){
    if(dots===13)events.push({p:page.page,at,kind:1,order:markOrder++});
  }
}
events.sort((a,b)=>a.p-b.p||a.at-b.at||b.kind-a.kind||a.order-b.order);
assert.equal(events.length,256);
assert.equal(events.filter(e=>e.kind===0).length,225);
const positions=events.flatMap((e,i)=>e.kind===1?[i]:[]);
assert.deepEqual(positions,[13,14,31,32,36,37,49,50,51,66,79,80,90,102,103,120,121,141,142,153,154,163,164,168,169,229,239,240,246,247,255]);
/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(k<0||k>n)return 0n;
  let v=1n;
  for(let j=1;j<=Math.min(k,n-k);j++)v=v*BigInt(n-j+1)/BigInt(j);
  return v;
}
let rank=0n,last=-1;
for(let i=0;i<positions.length;i++){
  for(let j=last+1;j<positions[i];j++)rank+=choose(255-j,30-i);
  last=positions[i];
}
assert.equal(rank,6823208894503251143167281798760439560912n);
assert.equal(rank.toString(16),"140d363b907a72111231847f7886c13ad0");
assert.ok(rank>=(1n<<132n)&&rank<(1n<<133n));
const keys=[
  {label:"low128",key:Buffer.from((rank&((1n<<128n)-1n)).toString(16).padStart(32,"0"),"hex")},
  {label:"high128",key:Buffer.from((rank>>5n).toString(16).padStart(32,"0"),"hex")}
];
assert.equal(keys[0].key.toString("hex"),"0d363b907a72111231847f7886c13ad0");
assert.equal(keys[1].key.toString("hex"),"a069b1dc83d39088918c23fbc43609d6");
assert.equal(table.bytes.length,256);
assert.deepEqual(table.pages.flatMap(p=>p.bytes),table.bytes);
const original=Buffer.from(table.bytes);
const plant=Buffer.from("0123456789ABCDEF".repeat(16));
const iv=Buffer.alloc(16);
/** @param {string} mode @param {Buffer} key @param {Buffer} content @param {boolean} inverse @returns {Buffer} */
function aes(mode,key,content,inverse){
  const name="aes-128-"+mode;
  const op=inverse?crypto.createDecipheriv(name,key,mode==="ecb"?null:iv):
    crypto.createCipheriv(name,key,mode==="ecb"?null:iv);
  if(mode!=="ctr")op.setAutoPadding(false);
  return Buffer.concat([op.update(content),op.final()]);
}
/** @param {Buffer} bytes @returns {{count:number,maxRun:number}} */
function printable(bytes){
  let count=0,maxRun=0,run=0;
  for(const c of bytes){
    if((c>=32&&c<=126)||c===9||c===10||c===13){
      count++;run++;maxRun=Math.max(maxRun,run);
    }else run=0;
  }
  return {count,maxRun};
}
const cases=[];
for(const {label,key} of keys){
  for(const mode of ["ecb","cbc","ctr"]){
    assert.deepEqual(aes(mode,key,aes(mode,key,plant,false),true),plant);
    const decoded=aes(mode,key,original,true);
    const stats=printable(decoded);
    // 70% readable source is a deliberately weak minimum to flag any
    // potential text result for inspection rather than report a false negative.
    assert.ok(stats.count<180,"Unexpected candidate; inspect decrypted bytes");
    cases.push({key:label,mode,printable:stats.count,
      longest:stats.maxRun,head:decoded.subarray(0,16).toString("hex")});
  }
}
console.log(JSON.stringify({status:"PASS",
  input:"225 red rune + 31 thirteen-dot event rank, 256 original table bytes",
  rankBits:133,keys:keys.map(({label,key})=>({label,hex:key.toString("hex")})),
  cases,verdict:"No ASCII payload; these exact AES hypotheses do not recover LP2 plaintext."},null,2));
