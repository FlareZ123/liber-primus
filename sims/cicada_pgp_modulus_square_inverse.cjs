"use strict";
/**
 * Source-locked original-LP2 modular-squaring inverse with the original 2012
 * Cicada 3301 OpenPGP RSA-4096 signing modulus.
 *
 * The signed 2012 message "The key has always been right in front of your eyes"
 * makes the public signing key a historical input worth testing. This finite
 * experiment does not assume that RSA signing is the original LP2 cipher.
 *
 * Run: node sims/cicada_pgp_modulus_square_inverse.cjs
 * Node.js 22, CommonJS, read-only.
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const {ioc,transform}=require("./red_256_event_key_inverse.cjs");
const ROOT=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const corpus=read("resources/liber-primus/lp2-corpus.json");
const pgp=fs.readFileSync(path.join(ROOT,
  "resources/historical/cicada-3301-2012-public-key.asc"),"utf8");

/** Extract original OpenPGP v4 primary public RSA packet (fixed 2012 bytes). */
function originalKey() {
  const data=Buffer.from(pgp.split(/\r?\n/)
    .filter(x=>x.length&&x[0]!=="-"&&x[0]!=="=").join(""),"base64");
  assert.equal(data[0],0x99);
  const packetLength=data.readUInt16BE(1);
  assert.equal(packetLength,525);
  assert.equal(data[3],4);
  assert.equal(data[8],1);
  assert.equal(data.readUInt16BE(9),4096);
  const nBytes=data.subarray(11,523);
  assert.equal(nBytes.length,512);
  assert.equal(data.readUInt16BE(523),17);
  assert.equal(data.readUIntBE(525,3),65537);
  const fingerprint=crypto.createHash("sha1")
    .update(data.subarray(0,3+packetLength)).digest("hex").toUpperCase();
  assert.equal(fingerprint,"6D854CD7933322A601C3286D181F01E57A35090F");
  const N=BigInt("0x"+nBytes.toString("hex"));
  assert.equal(N%4n,1n);
  return {N,fingerprint,packetLength,nBytes};
}
const key=originalKey();

const pages=corpus.pages.filter(p=>p.page<56 && p.indices.length);
const ciphertext=pages.flatMap(p=>p.indices);
assert.equal(ciphertext.length,12956);
const pageBlocks=pages.map(p=>p.indices.length);
const sectionBlocks=[729,1145,1738,1894,1021,1433,1680,3316];
assert.equal(sectionBlocks.reduce((a,b)=>a+b,0),ciphertext.length);

/** @returns {number[]} Native GP text from independently sourced Shakespeare. */
function nativeGP() {
  const source=fs.readFileSync(path.join(ROOT,
    "resources/control/shakespeare_first300k.txt"),"utf8");
  const tokens=corpus.translit.map((s,i)=>({s,i}))
    .sort((a,b)=>b.s.length-a.s.length);
  const out=[];
  for(let word of (source.toUpperCase().match(/[A-Z]+/g)||[])) {
    word=word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
    const vals=[];
    for(let i=0;i<word.length;) {
      const t=tokens.find(t=>word.startsWith(t.s,i));
      if(!t){vals.length=0;break;}
      vals.push(t.i);
      i+=t.s.length;
    }
    out.push(...vals);
  }
  assert.ok(out.length>ciphertext.length+3000);
  return out;
}
const reference=nativeGP();
const plant=reference.slice(3000,3000+ciphertext.length);
const counts=new Array(29).fill(1);
for(const x of reference)counts[x]++;
const logs=counts.map(x=>Math.log(x/(reference.length+29)));

/** @param {number[]} v */
function score(v) {
  return {ioc:ioc(v),e:v.filter(x=>x===18).length,
    meanLog:v.reduce((acc,x)=>acc+logs[x],0)/v.length,
    preview:v.slice(0,70).map(x=>corpus.translit[x]).join("")};
}

/** @param {bigint} seed
 * @param {number[]} blocks
 * @param {"byte"|"eightbits"} sample
 * @param {number} warm
 * @returns {number[]} Raw deterministic modular-squaring keystream bytes.
 */
function modularStream(seed,blocks,sample,warm) {
  const output=[];
  const N=key.N;
  for (const length of blocks) {
    let state=seed%N;
    for(let j=0;j<warm;j++)state=state*state%N;
    for(let i=0;i<length;i++) {
      if(sample==="byte") {
        state=state*state%N;
        output.push(Number(state&255n));
      } else {
        let byte=0;
        for(let j=0;j<8;j++) {
          state=state*state%N;
          byte=(byte<<1)|Number(state&1n);
        }
        output.push(byte);
      }
    }
  }
  return output;
}
/** @param {number[]} source
 * @param {number[]} keyBytes
 * @param {number} sign
 * @param {boolean} encode
 */
function add(source,keyBytes,sign,encode) {
  return source.map((v,i)=>(v+(encode?1:-1)*sign*(keyBytes[i]%29)+841)%29);
}
/** Exact 512-byte RSA modulus as a repeating GP key (no PRNG or KDF). */
function literalModulusTests() {
  const ranks=[];
  let nrecovered=0;
  for(const [direction,data] of [
    ["forward",key.nBytes],["reverse",Buffer.from(key.nBytes).reverse()]
  ]) {
    for(const [scope,blocks] of [
      ["book",[ciphertext.length]],["section",sectionBlocks],["page",pageBlocks]
    ]) {
      const bytes=[];
      for(const size of blocks)for(let i=0;i<size;i++)bytes.push(data[i%512]);
      assert.equal(bytes.length,ciphertext.length);
      for(const sign of [-1,1]) {
        const p=add(ciphertext,bytes,sign,false);
        assert.deepEqual(add(p,bytes,sign,true),ciphertext);
        const planted=add(plant,bytes,sign,true);
        assert.deepEqual(add(planted,bytes,sign,false),plant);
        ranks.push({direction,scope,sign,family:"additive",...score(p)});
        nrecovered+=planted.length;
        const mode={family:"ea",sign,reset:"book"};
        const decoded=transform(ciphertext,bytes,mode,false);
        assert.deepEqual(transform(decoded,bytes,mode,true),ciphertext);
        const synthetic=transform(plant,bytes,mode,true);
        assert.deepEqual(transform(synthetic,bytes,mode,false),plant);
        ranks.push({direction,scope,sign,family:"GP28-EA",...score(decoded)});
        nrecovered+=synthetic.length;
      }
    }
  }
  assert.equal(ranks.length,24);
  ranks.sort((a,b)=>b.meanLog-a.meanLog);
  return {settings:ranks.length,allPlantedRunesRecovered:nrecovered,
    best:ranks.slice(0,5),worst:ranks.at(-1)};
}

function run() {
  const seeds=[
    ["3301",3301n],["twin3299",3299n],
    ["signerKeyID",0x7A35090Fn],["audio761",1595277641n]
  ];
  const rank=[];
  let plantRunes=0,originalRecipher=0;
  for(const [seedName,seed] of seeds)
    for(const [scope,blocks] of [
      ["book",[ciphertext.length]],["section",sectionBlocks],["page",pageBlocks]
    ])for(const sample of ["byte","eightbits"])
      for(const warm of [0,1]) {
        const bytes=modularStream(seed,blocks,sample,warm);
        assert.equal(bytes.length,ciphertext.length);
        for(const sign of [-1,1]){
          const p=add(ciphertext,bytes,sign,false);
          assert.deepEqual(add(p,bytes,sign,true),ciphertext);
          const test=add(plant,bytes,sign,true);
          assert.deepEqual(add(test,bytes,sign,false),plant);
          rank.push({seedName,scope,sample,warm,sign,family:"additive",...score(p)});
          plantRunes+=plant.length;originalRecipher+=ciphertext.length;

          const mode={family:"ea",sign,reset:"book"};
          const ea=transform(ciphertext,bytes,mode,false);
          assert.deepEqual(transform(ea,bytes,mode,true),ciphertext);
          const enc=transform(plant,bytes,mode,true);
          assert.deepEqual(transform(enc,bytes,mode,false),plant);
          rank.push({seedName,scope,sample,warm,sign,family:"GP28-EA",...score(ea)});
          plantRunes+=plant.length;originalRecipher+=ciphertext.length;
        }
      }
  assert.equal(rank.length,192);
  rank.sort((a,b)=>b.meanLog-a.meanLog);

  const grid=Buffer.from(read("resources/liber-primus/base60-grid.json").byte_rows.flat());
  assert.equal(grid.length,256);
  const gridXor=[];
  for(const [seedName,seed] of seeds)
    for(const sample of ["byte","eightbits"]) {
      const pad=modularStream(seed,[256],sample,0);
      const out=Buffer.from(grid.map((v,i)=>v^pad[i]));
      const printable=Array.from(out).filter(b=>b===9||b===10||b===13||
        (b>=32&&b<=126)).length;
      gridXor.push({seedName,sample,printable,
        first16hex:out.subarray(0,16).toString("hex")});
      const plantBytes=Buffer.from(
        Array.from({length:256},(_,i)=>("LIBERPRIMUS"[i%11]).charCodeAt(0)));
      const encrypted=Buffer.from(plantBytes.map((v,i)=>v^pad[i]));
      const recovered=Buffer.from(encrypted.map((v,i)=>v^pad[i]));
      assert.deepEqual(recovered,plantBytes);
    }
  gridXor.sort((a,b)=>b.printable-a.printable);
  return {
    verdict:"original source-fixed public-RSA-modulus direct keystream negative; no unknown LP2 plaintext",
    sourceKey:{fingerprint:key.fingerprint,algorithm:"RSA",modulusBits:4096,
      modulusMod4:Number(key.N%4n),modulusPrefix:key.nBytes.toString("hex").slice(0,32)},
    parameters:{seeds:seeds.map(x=>x[0]),sampling:["byte","eightbits"],
      warmSquares:[0,1],restart:["book","section","page"],
      sign:[-1,1],carriers:["additive","GP28-EA"]},
    sourceNative:score(plant),sourceCipher:score(ciphertext),
    originalCipherTests:rank.length,topOriginal:rank.slice(0,8),
    worstOriginal:rank.slice(-2).map(({preview,...rest})=>rest),
    originalReencrypted:originalRecipher,plantedRunesRecovered:plantRunes,
    numericalGridXorVariants:gridXor,
    literalPublicModulusPeriod512:literalModulusTests()
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={originalKey,modularStream,run};
