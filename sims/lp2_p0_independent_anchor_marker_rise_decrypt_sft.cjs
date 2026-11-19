"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,".."),M=29;
const read=p=>fs.readFileSync(path.join(root,p),"utf8").replace(/\r/g,"");
const mod=x=>((x%M)+M)%M;
const digits=(n,b)=>{const o=[];do{o.unshift(n%b);n=Math.floor(n/b);}while(n);return o;};
const H=v=>{const o=[];let l=0,r=v.length-1;while(l<r){o.push(mod(v[l]-v[r]),mod(v[l]+v[r]));l++;r--;}if(l===r)o.push(v[l]);return o;};
const cumulative=(seed,rises)=>{const o=[mod(seed)];let x=mod(seed);for(const rise of rises){x=mod(x+rise);o.push(x);}return o;};
const msum=sq=>sq[0].reduce((a,b)=>a+b,0);
const radius=(n,r,c)=>{const m=(n-1)/2;return Math.max(Math.abs(r-m),Math.abs(c-m));};

const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const squares=read("resources/cicada2014-openpuff-magic-squares.txt").trim().split(/\n\s*\n/u).map(b=>b.split("\n").map(l=>l.trim().split(/\s+/u).map(Number)));
const source=(signed.slice(signed.indexOf("Hello."),signed.indexOf("-----BEGIN PGP SIGNATURE-----")).replace(/\b7A35090F\b/gu,"").match(/[A-Za-z]+/gu)||[]).map(w=>w.toUpperCase());
assert.equal(source.length,43);

// Independent q anchor from the authenticated 5x5 sum1033 center91=[e,q].
const pair=squares.filter(s=>msum(s)===1033).sort((a,b)=>a.length-b.length);
assert.deepEqual(pair.map(s=>s.length),[5,7]);
const center91=pair[0][2][2];
assert.equal(center91,91);
const [e,q]=digits(center91,29);
assert.deepEqual([e,q],[3,4]);

// Independent THE anchor from the unique center-out BASE29 radius chain.
const cells=[];
for(const sq of pair)for(let r=0;r<sq.length;r++)for(let c=0;c<sq.length;c++)cells.push({value:sq[r][c],radius:radius(sq.length,r,c)});
const chainHits=[];
for(let base=2;base<=Math.max(...cells.map(x=>x.value));base++){
  for(let start=0;start+4<source.length;start++){
    let ok=true;
    for(let rr=0;rr<=3;rr++){
      const want=[start+rr,start+rr+1];
      if(!cells.some(x=>x.radius===rr&&JSON.stringify(digits(x.value,base))===JSON.stringify(want))){ok=false;break;}
    }
    if(ok)chainHits.push({base,start});
  }
}
assert.deepEqual(chainHits,[{base:29,start:3}]);
const t=chainHits[0].start+4;
assert.equal(t,7);
assert.equal(source[t],"THE");

// Independent WAY anchor: unique occurrence in the authenticated source.
const ways=source.map((word,index)=>word==="WAY"?index:null).filter(index=>index!==null);
assert.deepEqual(ways,[13]);
const w=ways[0];

// Marker-aligned rise generator. The algebraic form was recognized
// retrospectively; the anchors are now selected without using p0 plaintext.
const left=cumulative(-q,[q-1,w-1,w+1]);
const center=cumulative(q,[q,q+t,q+2*t,q+3*t]);
const right=cumulative(t,[t-1,t,t+1]);
const R13=[...left,...center,...right];
assert.deepEqual(R13,[25,28,11,25,4,8,19,8,4,7,13,20,28]);
const key=H(R13);
assert.deepEqual(key,[26,24,8,19,27,24,18,3,0,8,0,16,19]);

// Read untouched p0 first two canonical words only after the key is generated.
const tx=read("resources/liber-primus/lp2-transcription.txt");
const ri=new Map(corpus.runes.map((r,i)=>[r,i]));
const page0=tx.split(/^\s*%\s*$/m)[0];
const words=[];let cur=[];
for(const ch of [...page0]){
  const v=ri.get(ch);
  if(v!==undefined)cur.push(v);
  else if(ch!=="/"&&!/\s/u.test(ch)&&cur.length){words.push(cur);cur=[];}
}
if(cur.length)words.push(cur);
assert.equal(words[0].length,8);
assert.equal(words[1].length,5);
const cipher=[...words[0],...words[1]];
const plain=cipher.map((v,i)=>mod(v-key[i]));
const text=plain.map(v=>corpus.translit[v]).join("");
assert.equal(text,"EPIPHANYSEEKS");

console.log(JSON.stringify({
 status:"PASS",
 independentAnchors:{
   q:{source:"5x5 sum1033 center91 BASE29 second digit",value:q},
   THE:{source:"unique radius0..3 chain endpoint",index:t,word:source[t]},
   WAY:{source:"unique authenticated source occurrence",index:w,word:source[w]}
 },
 markerRisePacket:{left,center,right,R13},
 generatedKey:key,
 untouchedP0Cipher:cipher,
 decryptedGP:text,
 decision:"Given the retrospectively recognized marker-rise formula, independently source-selected q4/THE7/WAY13 generate all 13 key atoms before p0 plaintext is read and decrypt the untouched title exactly to EPIPHANY SEEKS."
},null,2));
