"use strict";
/** Test original LP2 256 ink events + printed 256 table bytes as a 4096-bit
 * Cicada PGP signature, using two actual signed Cicada messages as controls. */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
/** @param {string} p */ const read=p=>fs.readFileSync(path.join(root,p),"utf8");
/** @param {string} t */ const armor=t=>Buffer.from(t.split(/\r?\n/).filter(
  s=>/^[A-Za-z0-9+/]+={0,2}$/.test(s)&&s.length>12).join(""),"base64");
/** @param {Buffer} b */ const bigint=b=>BigInt("0x"+b.toString("hex"));
/** @param {bigint} x @param {bigint} e @param {bigint} n */
function pow(x,e,n){let v=1n;while(e){if(e&1n)v=v*x%n;x=x*x%n;e>>=1n;}return v;}
/** @param {Buffer} em */
function v15(em){if(em[0]!==0||em[1]!==1)return false;let i=2;while(em[i]===255)i++;return i>=10&&em[i]===0;}
const pub=armor(read("resources/historical/cicada-3301-2012-public-key.asc"));
assert.equal(pub[0],153);
const key=pub.subarray(3,3+pub.readUInt16BE(1));
const bits=key.readUInt16BE(6);assert.equal(bits,4096);
const nlen=Math.ceil(bits/8),n=bigint(key.subarray(8,8+nlen)),eAt=8+nlen;
const e=bigint(key.subarray(eAt+2,eAt+2+Math.ceil(key.readUInt16BE(eAt)/8)));
assert.equal(e,65537n);
/** @param {Buffer} signature */
function decoded(signature){
  return Buffer.from(pow(bigint(signature),e,n).toString(16).padStart(1024,"0"),"hex");
}
const controls=[];
for(const name of ["resources/cicada2014-may2-signed-message.asc",
"resources/historical/cicada2017-yEiTHhvF.asc"]){
  const pgp=read(name).split("-----BEGIN PGP SIGNATURE-----")[1];
  const p=armor(pgp);
  assert.equal(p.readUInt16BE(p.length-514),4096);
  assert(v15(decoded(p.subarray(-512))));
  controls.push(name);
}
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json")).bytes;
assert.equal(grid.length,256);
const events=[];
for(const page of ink.pages){
  const red=Array.from({length:page.rune_count+1},()=>[]);
  for(const sp of page.red_spans||[])for(let i=0;i<sp.length;i++){
    const rune=corpus.runes.indexOf(sp.runes[i]);assert(rune>=0);
    red[sp.start+i].push({kind:"rune",ordinal:rune+1,prime:corpus.prime[rune]});
  }
  for(let offset=0;offset<=page.rune_count;offset++){
    for(const mark of page.large_punctuation||[])if(mark[0]===offset&&mark[1]===13)
      events.push({kind:"dot"});
    events.push(...red[offset]);
  }
}
assert.equal(events.length,256);
assert.equal(events.filter(x=>x.kind==="rune").length,225);
let checked=0,admissible=0,valid=0,pss=0;
for(const method of ["ordinal","prime"])for(const marker of [13,31]){
  const values=events.map(x=>x.kind==="dot"?marker:x[method]);
  for(const reverseA of [false,true])for(const reverseB of [false,true]){
    const a=reverseA?values.slice().reverse():values;
    const b=reverseB?grid.slice().reverse():grid;
    for(const arrangement of ["a+b","b+a","ab","ba"]){
      let bytes=[];
      if(arrangement==="a+b")bytes=a.concat(b);
      else if(arrangement==="b+a")bytes=b.concat(a);
      else for(let i=0;i<256;i++)bytes.push(
        ...(arrangement==="ab"?[a[i],b[i]]:[b[i],a[i]]));
      checked++;
      const signature=Buffer.from(bytes);
      if(bigint(signature)>=n)continue;
      admissible++;
      const em=decoded(signature);
      valid+=Number(v15(em));
      pss+=Number(em.at(-1)===188);
    }
  }
}
assert.equal(checked,64);
assert.equal(admissible,48);
assert.equal(valid,0);
assert.equal(pss,0);
console.log(JSON.stringify({
  originalSource:"256 original red-rune/dot events and 256 printed numeric bytes",
  authenticSignedPositiveControls:controls,
  keyBits:bits,publicExponent:String(e),
  cases:checked,lessThanModulus:admissible,
  validPKCS1v15:valid,pssTrailerMatches:pss,
  scope:"Raw concatenation/interleaving, both directions, two GP rune codecs, two mark values; no cipher key recovered."
},null,2));
