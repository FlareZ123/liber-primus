"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
/** Original 2016 signed 43-word keys applied to LP2 p55 strict 43 interiors. */
const read=p=>fs.readFileSync(p,"utf8");
const c=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const armor=read("resources/historical/cicada2016-4gq25-outguess.asc");
const signed=armor.slice(armor.indexOf("Hello."),armor.indexOf("-----BEGIN PGP SIGNATURE-----"));
const msgWords=signed.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g)||[];
assert.equal(msgWords.length,43);
const translit=c.translit.map((token,i)=>({token,i})).sort((a,b)=>b.token.length-a.token.length);
/** @param {string} word */
function gp(word){let s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S"),out=[];while(s.length){const hit=translit.find(t=>s.startsWith(t.token));assert(hit,"All letters map to GP29");out.push(hit.i);s=s.slice(hit.token.length);}return out;}
const key=msgWords.map(w=>gp(w).reduce((s,i)=>s+c.prime[i],0)%29);
const page55=read("resources/liber-primus/lp2-transcription.txt").split("%").slice(0,55)[54];
const tokens=page55.replace(/[\/\r\n ]/g,"").split(/[-.&$§]+/).filter(Boolean).map(w=>Array.from(w).map(ch=>c.runes.indexOf(ch)).filter(i=>i>=0)).filter(w=>w.length);
assert.deepEqual(tokens.map(w=>w.length),[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const interior=tokens.map(w=>w.slice(1,-1)),ciphertext=interior.flat();assert.equal(ciphertext.length,43);
const mod=n=>(n%29+29)%29;
const ioc=a=>{let f=Array(29).fill(0);for(let x of a)f[x]++;return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1))};
assert.ok(Math.abs(ioc(ciphertext)-0.03433001107419712)<1e-12);
const result=[];
for(const sign of [1,-1]){
 const plain=ciphertext.map((x,i)=>mod(x-sign*key[i]));
 const re=plain.map((x,i)=>mod(x+sign*key[i]));assert.deepEqual(re,ciphertext);
 const planted=gp(read("resources/control/gibran_prophet_58585.txt").replace(/[^A-Za-z]/g,"").slice(0,120)).slice(0,43);
 assert.equal(planted.length,43);
 const crypt=planted.map((x,i)=>mod(x+sign*key[i]));assert.deepEqual(crypt.map((x,i)=>mod(x-sign*key[i])),planted);
 let pos=0;const segmentation=interior.map(w=>{let t=plain.slice(pos,pos+w.length);pos+=w.length;return t.map(v=>c.translit[v]).join("")}).filter(Boolean);
 result.push({sign,IoC:ioc(plain),sourceNativeReencrypt:43,readout:segmentation.join(" | ")});
}
assert.ok(Math.abs(result[0].IoC-0.03875968992248062)<1e-12);
assert.ok(Math.abs(result[1].IoC-0.029900332225913623)<1e-12);

/** Converse 43-word map: treat each original p55 interior as a word address. */
const mod43=n=>(n%43+43)%43;
const directWordReadouts={
  gp0ZeroBased:ciphertext.map(i=>msgWords[i]),
  gp0OneBased:ciphertext.map(i=>i>0?msgWords[i-1]:null),
  gpPrimeMod43ZeroBased:ciphertext.map(i=>msgWords[mod43(c.prime[i])]),
  gpPrimeMod43OneBased:ciphertext.map(i=>msgWords[mod43(c.prime[i]-1)]),
};
/** Numbers-as-direction: cumulative steps through the same 43-word map. */
const wordStepWalks={};
for(const [name,steps] of [["GP0",ciphertext],["GPprimeMod43",ciphertext.map(i=>mod43(c.prime[i]))]]){
  for(const start of [0,1]){
    for(const direction of [1,-1]){
      let position=start;
      const sequence=steps.map(step=>{
        position=mod43(position+direction*step);
        return msgWords[position];
      });
      wordStepWalks[`${name}_start${start}_direction${direction}`]=sequence;
    }
  }
}

console.log(JSON.stringify({source:"signed authentic 2016 43 exact words; p55 original 43 strict interiors",words:msgWords.length,runes:ciphertext.length,sourceGPKeys:key,baselineIoC:ioc(ciphertext),results:result,wordMapDirectReadouts:directWordReadouts,wordMapStepWalks:wordStepWalks},null,2));
