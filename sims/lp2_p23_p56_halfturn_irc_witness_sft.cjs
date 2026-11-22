'use strict';
/**
 * Source-exact targeted period witness screen for the original p23/p56 inverted
 * five-dot figure. Node 22 CommonJS; run:
 * node sims/lp2_p23_p56_halfturn_irc_witness_sft.cjs path-to-original-log
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const bytes=fs.readFileSync(process.argv[2]);
assert.equal(bytes.length,27234234,'Original 2014–16 IRC log byte count');
const gitsha=crypto.createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
assert.equal(gitsha,'72634a9d071d32af767edbffc0493d810e88cd0d','Original IRC Git blob SHA-1');
const source=bytes.toString('latin1').split(/\r?\n/);
const rows=[];
for(let i=0;i<source.length;i++){
 const line=source[i];
 const m=line.match(/^(201[456]) ([A-Z][a-z]{2}) \d\d \d\d:\d\d <([^>]+)> ?(.*)$/);
 if(m)rows.push({originalLine:i+1,date:line.slice(0,17),user:m[3],message:m[4]});
}
const p23=/\b(?:(?:page|pg\.?|p)\s*#?\s*23\b|40\.jpe?g\b)/i;
const p56=/\b(?:(?:page|pg\.?|p)\s*#?\s*56\b|73\.jpe?g\b|an\s+end\b)/i;
const visual=/\b(?:dots?|circles?|five\s+(?:black\s+)?(?:dots?|spots?)|constellations?|stars?|mirrored?|mirroring|upside[\s-]*down|inver(?:se|ted|sion)|rotat(?:ed|ion|e|ing)|turn(?:ed|ing)?|flipp?(?:ed|ing)?|emblems?|images?|pictures?|drawings?)\b/i;
const cross=/\b(?:same|both|another|other|repeat(?:ed)?|again|opposite|reverse|pair|twice|identical)\b/i;
assert(p23.test('page 23')&&p56.test('p56')&&visual.test('rotated five dots'));
let direct=[],single=[],motif=[],near=[];
for(let i=0;i<rows.length;i++){
 const m=rows[i],text=m.message;
 const both=p23.test(text)&&p56.test(text);
 const one=p23.test(text)||p56.test(text);
 if(both)direct.push(m);
 if(one&&visual.test(text))single.push(m);
 if(visual.test(text)&&cross.test(text))motif.push(m);
 if(one&&rows.slice(Math.max(0,i-6),Math.min(rows.length,i+7))
   .some(e=>e.date.slice(0,11)===m.date.slice(0,11)&&visual.test(e.message)))
   near.push(m);
}
console.log('PIN '+JSON.stringify({sourceLines:source.length,datedMessages:rows.length,gitsha}));
console.log('COUNTS '+JSON.stringify({bothPagesSameMessage:direct.length,pageAndVisualSameMessage:single.length,visualAndPairLanguage:motif.length,pageNearVisual:near.length}));
for(const [tag,arr,limit] of [['BOTH',direct,100],['PAGE_VISUAL',single,100],['PAGE_NEAR_VISUAL',near,60],['MOTIF',motif,40]]){
 const dedup=arr.filter((m,i)=>i===0||Math.abs(arr[i-1].originalLine-m.originalLine)>3);
 for(const m of dedup.slice(0,limit)){
  const index=rows.findIndex(x=>x.originalLine===m.originalLine);
  console.log(tag+' '+JSON.stringify({
   line:m.originalLine,date:m.date,user:m.user,message:m.message,
   neighboring:rows.slice(Math.max(0,index-2),Math.min(rows.length,index+3))
    .filter(e=>e.date.slice(0,11)===m.date.slice(0,11))
    .map(e=>({line:e.originalLine,user:e.user,message:e.message}))
  }));
 }
}
console.log('SOURCE-WITNESS SCREEN COMPLETED; presence of a solver comment does not authenticate a Cicada cipher instruction');
