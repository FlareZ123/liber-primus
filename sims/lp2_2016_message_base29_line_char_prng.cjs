#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
const assert=require("node:assert/strict");
const corpus=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
const signed=fs.readFileSync("resources/historical/cicada2016-4gq25-outguess.asc","utf8");
const lp2Text=fs.readFileSync("resources/lp2-transcription.txt","utf8");
const masterText=fs.readFileSync("resources/transcriptions/liber_primus_master.txt","utf8");
const alphabet=corpus.translit.map((token,index)=>({token:token.toLowerCase(),index})).sort((a,b)=>b.token.length-a.token.length);
function encodeWord(word){
 const source=word.toLowerCase().replace(/v/g,"u").replace(/k/g,"c").replace(/z/g,"s"),out=[];
 for(let i=0;i<source.length;){const hit=alphabet.find(({token})=>source.startsWith(token,i));assert.ok(hit,"No GP transliteration for "+word);out.push(hit.index);i+=hit.token.length;}
 return out;
}
function runeLines(source){
 return source.split("%").flatMap((page,pageIndex)=>page.split("/").map((line,pageLine)=>({page:pageIndex,pageLine:pageLine+1,source:line})))
  .filter(row=>/[ᚠ-᛿]/u.test(row.source))
  .map(row=>({page:row.page,pageLine:row.pageLine,glyphs:[...row.source.matchAll(/[ᚠ-᛿]/gu)].map(m=>m[0])}));
}
const a=signed.indexOf("Hello."),b=signed.indexOf("-----BEGIN PGP SIGNATURE-----");
assert.ok(a>=0&&b>a);
const words=(signed.slice(a,b).match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g)||[]);
assert.equal(words.length,43);
const phraseWords=["Its","words","are","the","map","their","meaning","is","the","road","and","their","numbers","are","the","direction"];
const start=words.indexOf("Its");
assert.deepEqual(words.slice(start,start+16),phraseWords);
const sums=words.map(word=>({word,sum:encodeWord(word).reduce((s,i)=>s+corpus.prime[i],0)}));
const lp2=runeLines(lp2Text),master=runeLines(masterText.split("%").slice(16,74).join("%"));
function extract(lines,phase=0){
 return sums.map(({word,sum},wordIndex)=>{
  const q=Math.floor(sum/29),r=sum%29,lineIndex=(r+phase)%29,charIndex=q;
  const glyph=lines[lineIndex]?.glyphs[charIndex]??null,ri=glyph===null?-1:corpus.runes.indexOf(glyph);
  return {wordIndex,word,sum,q,r,line:lineIndex+1,character:charIndex+1,page:lines[lineIndex]?.page??null,pageLine:lines[lineIndex]?.pageLine??null,glyph,runeIndex:ri,token:ri>=0?corpus.translit[ri]:null};
 });
}
const rows=extract(lp2),masterRows=extract(master);
assert.ok(rows.every(x=>x.token!==null));
assert.deepEqual(masterRows.map(x=>x.token),rows.map(x=>x.token));
const phrase=rows.slice(start,start+16),tokens=phrase.map(x=>x.token);
assert.deepEqual(tokens,["L","C","B","P","P","R","NG","NG","P","A","R","R","TH","B","P","C"]);
assert.deepEqual(tokens.slice(4,7),["P","R","NG"]);
const phases=Array.from({length:29},(_,phase)=>{
 const t=extract(lp2,phase).slice(start,start+16).map(x=>x.token);
 return {phase,marker:t.slice(4,7).join(""),hasPRNG:t.some((x,i)=>x==="P"&&t[i+1]==="R"&&t[i+2]==="NG"),output:t.join("")};
});
assert.deepEqual(phases.filter(x=>x.marker==="PRNG").map(x=>x.phase),[0]);
assert.deepEqual(phases.filter(x=>x.hasPRNG).map(x=>x.phase),[0]);
const indices=phrase.map(x=>x.runeIndex),rest=indices.filter((_,i)=>![4,5,6].includes(i));
const b29=a=>a.reduce((n,v)=>n*29n+BigInt(v),0n);
console.log(JSON.stringify({
 signedWordCount:words.length,phraseStartIndexZeroBased:start,lp2RuneBearingLineCount:lp2.length,masterRuneBearingLineCount:master.length,
 phrase:phrase.map(x=>({word:x.word,gpPrimeSum:x.sum,base29:[x.q,x.r],lineCharacter:[x.line,x.character],page:x.page,pageLine:x.pageLine,rune:x.glyph,token:x.token})),
 phraseOutputTokens:tokens.join(""),marker:{words:phrase.slice(4,7).map(x=>x.word),tokens:tokens.slice(4,7),output:tokens.slice(4,7).join("")},
 full43OutputTokens:rows.map(x=>x.token).join(""),full16Base29Seed:b29(indices).toString(),
 remainder13Tokens:rest.map(i=>corpus.translit[i]).join(""),remainder13Base29Seed:b29(rest).toString(),
 phrasePrimeSum:indices.reduce((s,i)=>s+corpus.prime[i],0),remainder13PrimeSum:rest.reduce((s,i)=>s+corpus.prime[i],0),phaseNull:phases
},null,2));
