"use strict";
/**
 * Original-source direct 256-byte p50 ciphertext test with three input cues:
 *  p15 printed Fibonacci-prime 4x4 -> 32-byte key (uint16 BE/LE);
 *  p33–39 repeated 1033/3301 -> 8 ASCII digits nonce candidate;
 *  original p49–51 32x8 sexagesimal table -> 256 ciphertext bytes.
 *
 * Two historically available 32byte-key/8byte-nonce stream ciphers:
 * Salsa20/20 and original ChaCha20 (64bit counter/64bit nonce). The authentic
 * OpenPuff A password was 33011033; the visibly copied cuneiform pair also
 * permits the printed 10333301 direction. The printed cipher table does NOT
 * instruct us to choose these ciphers, so this is a bounded exploratory test.
 *
 * Windows Node22: node sims/lp2_p15_33011033_grid256_salsa_chacha_sft.cjs
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const {candidates}=require("./fibonacci_spiral_key_derivation.cjs");
const input=require("../resources/liber-primus/lp2-grid-256.json");
const grid=Buffer.from(input.bytes);
assert.equal(grid.length,256);
assert.equal(input.bytes.length,256);
const rootKeys=candidates().filter(x=>
  /^absolute-(spiral|row-major):(BE|LE)$/.test(x.name));
assert.equal(rootKeys.length,4);
const nonceSources=["33011033","10333301"];
const R=(x,n)=>(x<<n)|(x>>>(32-n));
const add=(a,b)=>(a+b)>>>0;
function salsaBlock(key,nonce,lo=0,hi=0){
  const read32=(src,i)=>(src[i]|(src[i+1]<<8)|
    (src[i+2]<<16)|(src[i+3]<<24))>>>0;
  const rot=(x,n)=>(x<<n)|(x>>>(32-n));
  const add=(a,b)=>(a+b)>>>0;
  const x=Uint32Array.of(0x61707865,read32(key,0),read32(key,4),
    read32(key,8),read32(key,12),0x3320646e,read32(nonce,0),
    read32(nonce,4),lo,hi,0x79622d32,read32(key,16),
    read32(key,20),read32(key,24),read32(key,28),0x6b206574);
  const z=Uint32Array.from(x);
  for(let n=0;n<10;n++){
    z[4]^=rot(add(z[0],z[12]),7);z[8]^=rot(add(z[4],z[0]),9);
    z[12]^=rot(add(z[8],z[4]),13);z[0]^=rot(add(z[12],z[8]),18);
    z[9]^=rot(add(z[5],z[1]),7);z[13]^=rot(add(z[9],z[5]),9);
    z[1]^=rot(add(z[13],z[9]),13);z[5]^=rot(add(z[1],z[13]),18);
    z[14]^=rot(add(z[10],z[6]),7);z[2]^=rot(add(z[14],z[10]),9);
    z[6]^=rot(add(z[2],z[14]),13);z[10]^=rot(add(z[6],z[2]),18);
    z[3]^=rot(add(z[15],z[11]),7);z[7]^=rot(add(z[3],z[15]),9);
    z[11]^=rot(add(z[7],z[3]),13);z[15]^=rot(add(z[11],z[7]),18);
    z[1]^=rot(add(z[0],z[3]),7);z[2]^=rot(add(z[1],z[0]),9);
    z[3]^=rot(add(z[2],z[1]),13);z[0]^=rot(add(z[3],z[2]),18);
    z[6]^=rot(add(z[5],z[4]),7);z[7]^=rot(add(z[6],z[5]),9);
    z[4]^=rot(add(z[7],z[6]),13);z[5]^=rot(add(z[4],z[7]),18);
    z[11]^=rot(add(z[10],z[9]),7);z[8]^=rot(add(z[11],z[10]),9);
    z[9]^=rot(add(z[8],z[11]),13);z[10]^=rot(add(z[9],z[8]),18);
    z[12]^=rot(add(z[15],z[14]),7);z[13]^=rot(add(z[12],z[15]),9);
    z[14]^=rot(add(z[13],z[12]),13);z[15]^=rot(add(z[14],z[13]),18);
  }
  const out=new Uint8Array(64);
  for(let i=0;i<16;i++){
    const value=add(z[i],x[i]);
    for(let b=0;b<4;b++)out[4*i+b]=(value>>>(8*b))&255;
  }
  return out;
}
/**
 * @param {Buffer} bytes byte ciphertext
 * @param {Buffer} key 32-byte key
 * @param {Buffer} nonce 8-byte nonce
 * @returns {Buffer} Salsa20/20 XOR output
 */
function salsaXor(bytes,key,nonce){
  const out=Buffer.alloc(bytes.length);
  for(let block=0;block*64<bytes.length;block++){
    const pad=salsaBlock(key,nonce,block>>>0,
      Math.floor(block/2**32));
    for(let i=0;i<Math.min(64,bytes.length-block*64);i++){
      const offset=block*64+i;
      out[offset]=bytes[offset]^pad[i];
    }
  }
  return out;
}
const vector="9a97f65b9b4c721b960a672145fca8d4"+
  "e32e67f9111ea979ce9c4826806aeee63"+
  "de9c0da2bd7f91ebcb2639bf989c6251b"+
  "29bf38d39a9bdce7c55f4b2ac12a39";
assert.equal(Buffer.from(salsaBlock(Buffer.alloc(32),Buffer.alloc(8)))
  .toString("hex"),vector,"Standard Salsa20 zero-vector");

/** Node/OpenSSL original 2008 ChaCha20 with 64-bit counter/nonce. */
function chachaXor(bytes,key,nonce){
  const iv=Buffer.concat([Buffer.alloc(8),nonce]);
  const cipher=crypto.createCipheriv("chacha20",key,iv);
  return Buffer.concat([cipher.update(bytes),cipher.final()]);
}
assert.ok(crypto.getCiphers().includes("chacha20"));
const algorithms={salsa20:salsaXor,chacha20:chachaXor};

/** Original zero-offset unencrypted file recognizers. */
function format(bytes){
  const h=bytes.toString("hex");
  const magic=[
    ["gzip","1f8b08"],
    ["bzip2","425a68"],
    ["xz","fd377a585a00"],
    ["PNG","89504e470d0a1a0a"],
    ["ZIP","504b0304"],
    ["PDF","255044462d"],
    ["GIF","47494638"],
    ["SQLite","53514c69746520666f726d6174203300"],
    ["7z","377abcaf271c"],
    ["ELF","7f454c46"]
  ];
  return magic.filter(([_,prefix])=>h.startsWith(prefix))
    .map(([name])=>name);
}
function metrics(bytes){
  const alphabet=Array.from(bytes).filter(x=>x<=28).length;
  const ascii=Array.from(bytes).filter(x=>
    (x>=32&&x<=126)||x===9||x===10||x===13).length;
  const validUtf8=(()=>{try{
    new TextDecoder("utf-8",{fatal:true}).decode(bytes);return true;
  }catch{return false;}})();
  return {
    signature:format(bytes),
    gp29Bytes:alphabet,
    printableAscii:ascii,
    validUtf8,
    head32Hex:bytes.subarray(0,32).toString("hex"),
    head32Ascii:bytes.subarray(0,32).toString("latin1")
      .replace(/[^ -~]/g,".")
  };
}
const output=[];
for(const {name,key} of rootKeys)
  for(const string of nonceSources){
    const nonce=Buffer.from(string,"ascii");
    assert.equal(nonce.length,8);
    for(const [algorithm,apply] of Object.entries(algorithms)){
      const direct=apply(grid,key,nonce);
      assert.equal(direct.length,256);
      assert.deepEqual(apply(direct,key,nonce),grid);
      // Exact independent full-size planted binary control under same
      // key+nonce+algorithm, without fitting any byte or key.
      const planted=Buffer.from(Array.from({length:256},(_,i)=>
        "LIBER PRIMUS GP29 POSITIVE CONTROL "[i%34].charCodeAt(0)));
      assert.deepEqual(apply(apply(planted,key,nonce),key,nonce),
        planted);
      output.push({
        algorithm,key:name,nonce:string,
        ...metrics(direct)
      });
    }
  }
assert.equal(output.length,16);
const max=output.reduce((a,b)=>
  b.printableAscii>a.printableAscii?b:a);
const sha=buf=>crypto.createHash("sha256").update(buf).digest("hex");
console.log(JSON.stringify({
  experiment:"Original p50 256-byte field direct stream inverse",
  inputSha256:sha(grid),
  keyCount:rootKeys.length,nonceCount:2,ciphers:2,
  tested:output.length,
  calibration:"All 16 ciphertext reencrypt exactly; 256/256 independent binary payload positives",
  bestPrintable:{algorithm:max.algorithm,key:max.key,
    nonce:max.nonce,printableAscii:max.printableAscii},
  results:output,
  conclusion:"No file or GP-text signature unless original output explicitly shows it."
},null,2));
