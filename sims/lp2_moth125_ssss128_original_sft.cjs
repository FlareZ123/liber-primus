"use strict";
/**
 * Exact 2013 ssss 5-of-5 finite-field decoding of candidate source-moth
 * five-by-twenty-five original runes from p53 and p55, including
 * the v0.5 XTEA reverse diffusion.
 * CONDITIONAL: omits two genuine source rune letters as entry/carry.
 * Windows 11 / Node.js 22:
 * node sims/lp2_moth125_ssss128_original_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {gf,decodeDiffusion}=require("./lp2_p23_201_122byte_ssss_codec_sft.cjs");
const root=path.join(__dirname,"..");
const c=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const indices=p=>c.pages.find(x=>x.page===p).indices;
const p53=indices(53),p55=indices(55),p57=indices(57);
const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
for(const [p,expected] of [
  [70,"4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548"],
  [72,"a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba"]]){
  assert.equal(sha(fs.readFileSync(path.join(root,"resources/liber-primus/"+p+".jpg"))),expected);
}
assert.deepEqual([p53.length,p55.length],[179,76]);
assert.equal(p53[128],16); // Visually isolated upward-arrow-shaped but authentic red T.
assert.equal(p55[0],21);  // Genuine inherited NG completing p54 word.
const red50=p53.slice(129),new75=p55.slice(1);
assert.deepEqual([red50.length,new75.length],[50,75]);
const rows=[red50.slice(0,25),red50.slice(25,50),
  new75.slice(0,25),new75.slice(25,50),new75.slice(50,75)];
assert(rows.every(x=>x.length===25));
const ids=[2n,3n,5n,7n,8n]; // Authenticated 2013 threshold share IDs.
const field=gf(128,[7,2,1]); // Poettering ssss 0.5, x^128+x^7+x^2+x+1.
const pack29=a=>a.reduce((v,x)=>29n*v+BigInt(x),0n);
const pack5=a=>a.reduce((v,x)=>(v<<5n)|BigInt(x),0n);
const nativePlant=[0x123456789abcdefn,0xabcdef012345n,0x1010101n,0x554433n,0x3301n];
assert.equal(field.restore(ids,ids.map(x=>field.split(nativePlant,x))),nativePlant[0]);
const expected=[
  ["base29","printed","b3a3807cd8cfdb4e1ab1c6828b87dc28"],
  ["base29","arrow-up","08efd533869353b08c2a69a281c42b6b"],
  ["5bit","printed","107ea845ba27e9e4916402fa2bd9e7fe"],
  ["5bit","arrow-up","45cb8140cb44300fc30d75c6eae9e12a"]
];
const cases=[];
for(const [packing,pack]of [["base29",pack29],["5bit",pack5]]){
  for(const [order,lanes]of [["printed",rows],["arrow-up",rows.slice().reverse()]]){
    const shares=lanes.map(pack);
    assert(shares.every(x=>x>=0n&&x<(1n<<128n)));
    const secret=field.restore(ids,shares),out=decodeDiffusion(secret,16);
    const printable=[...out].filter(x=>x>=32&&x<=126).length;
    const result=[packing,order,secret.toString(16).padStart(32,"0"),out.toString("hex"),printable];
    assert.deepEqual(result.slice(0,3),expected[cases.length]);
    cases.push({packing,order,encodedHex:result[2],decodedHex:result[3],
      printable,ascii:[...out].map(x=>x>=32&&x<=126?String.fromCharCode(x):".").join("")});
  }
}
const mod=x=>((x%29)+29)%29;
const inverse=x=>{for(let i=1;i<29;i++)if(mod(x*i)===1)return i;throw Error("nonzero field element needed");};
const coeff=ids.map((x,i)=>mod(ids.reduce((z,v,j)=>
  j===i?z:mod(z*mod(-Number(v))*inverse(Number(x-v))),1)));
assert.deepEqual(coeff,[19,15,19,23,12]);
const reconstruct=lanes=>lanes[0].map((_,col)=>mod(
  coeff.reduce((s,k,row)=>s+k*lanes[row][col],0)));
const gpOutputs=[reconstruct(rows),reconstruct(rows.slice().reverse())];
assert.deepEqual(gpOutputs[0],
  [13,5,19,16,26,24,2,4,3,27,20,3,8,22,23,3,15,5,20,8,18,0,16,19,2]);
assert.deepEqual(gpOutputs[1],
  [10,21,0,14,8,9,13,20,27,24,13,13,8,9,19,11,4,21,5,28,9,5,6,21,13]);
const pow=(x,n)=>{let z=1;for(let j=0;j<n;j++)z=mod(z*x);return z;};
const plant=Array.from({length:5},()=>Array(25).fill(0));
for(let col=0;col<25;col++){
  const polynomial=[p57[col],mod(col+2),mod(7*col+3),mod(11*col+1),mod(17*col+5)];
  for(let i=0;i<5;i++)plant[i][col]=mod(
    polynomial.reduce((s,v,k)=>s+v*pow(Number(ids[i]),k),0));
}
assert.deepEqual(reconstruct(plant),p57.slice(0,25));
const ioc=a=>{const freq=Array(29).fill(0);a.forEach(x=>freq[x]++);
  return freq.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));};
const result={input:"p53 authentic red[1:51] + p55 new[1:76], five consecutive 25-runic lanes",
  historic:"2013 ssss 0.5, GF(2^128) taps [7,2,1], five IDs 02,03,05,07,08",
  conditionalSkippedRealRunes:"p53 first red T and p55 first carried NG",
  nativeGp25PlantRecovered:true, field128PlantRecovered:true,cases,
  gf29:gpOutputs.map((x,i)=>({orientation:i?"arrow-up":"printed",
    ioc:ioc(x),gp:x.map(v=>c.translit[v]).join("")})),
  decision:"No recognizable 16-byte historical secret or native 25-rune plaintext under the frozen source consumers."};
console.log(JSON.stringify(result,null,2));
