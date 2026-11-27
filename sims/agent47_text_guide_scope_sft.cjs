"use strict";
const fs = require("node:fs");
const assert = require("node:assert/strict");
const path = require("node:path");

function experiment(corpus, transcription) {
  const K = [7,18,20,5,3,19,18,13,10,20,6,4,10,19,16,3,2,18,6,4,28,16];
  const historical = "ᚦᛗᛞᛇᚠᛗᚪᚱ5ᚢᚫᛝᚱᛝ3 ᛠᛗᛇᚠᛡ";
  const expected = "AUOWYFGL5LCSFJ3 NONIAN";
  const index = ch => corpus.runes.indexOf(ch);
  const count = s => [...s].filter(ch => index(ch)>=0).length;
  function decode(s, offset=0, mask=0) {
    let j=offset,n=0,output="";
    for(const ch of s) {
      const i=index(ch);
      if(i<0) {output+=ch;if(mask&(1<<n++))j++;continue;}
      if(j>=K.length)return null;
      output+=corpus.translit[(i-K[j++]+29)%29];
    }
    return {output,consumed:j-offset};
  }
  const controls=[];
  for(let mask=0;mask<8;mask++)for(let offset=0;offset<=4;offset++){
    const v=decode(historical,offset,mask);
    if(v)controls.push({mask,offset,...v});
  }
  const matches=controls.filter(v=>v.output===expected);
  if(matches.length!==1||matches[0].mask!==0||matches[0].offset!==0)throw Error("historical control");
  const p=transcription.split("%")[10].replace(/[\/\n]/g,"");
  if(count(p)!==263||count(p.slice(0,p.indexOf("7")))!==169)throw Error("p10 anchor");
  const s=p.split(".").find(v=>v.includes("7"));
  const groups=s.split("-").filter(Boolean);
  const d=groups.indexOf("7");
  if(d<0)throw Error("digit is not isolated");
  // Extremely generous bound: a rune can stand for one or two Latin
  // characters. One literal digit in the host; suffix 4 or 5 GP runes.
  // Allow every printed divider to disappear, despite the historical
  // example preserving its visible nonrune events.
  const windows=[];
  for(let i=0;i<=d;i++)for(let j=d+1;j<=groups.length;j++){
    const a=count(groups.slice(i,d).join(""));
    const b=count(groups.slice(d+1,j).join(""));
    const suffixLengths=[4,5].filter(t=>b>=t && a+b-t<=15 && 2*(a+b-t)>=15);
    if(suffixLengths.length)windows.push({i,j,preDigit:a,postDigit:b,suffixLengths,cipher:groups.slice(i,j).join("-")});
  }
  const nativeScope={runes:count(s),groups:groups.map(g=>g==="7"?g:count(g)),strictLiteralCompatible:false};
  // Only a diagnostic transfer: the known historical key is not
  // independently selected for LP2. Freeze its first symbol at the
  // relaxed candidate's left boundary; no offset or period search.
  const relaxed=windows.map(w=>({...w,diagnostic:decode(w.cipher)}));
  return {historical:{keyLength:K.length,runeCount:count(historical),controls,matches},p10:{nativeScope,relaxed}};
}
if(require.main===module){
  const root=path.join(__dirname,"..");
  const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
  const transcription=fs.readFileSync(path.join(root,"resources/transcriptions/lp2-image-corrected.txt"),"utf8");
  const out=experiment(corpus,transcription);
  assert.equal(out.historical.controls.length,28);
  console.log(JSON.stringify(out,null,2));
}
module.exports={experiment};
