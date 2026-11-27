#!/usr/bin/env node
'use strict';
function experiment(inputs){
 const native=JSON.parse(inputs[0]), corpus=JSON.parse(inputs[1]), punct=JSON.parse(inputs[3]);
 const R=new Map(native.runes.map((v,i)=>[v,i])),primes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
 const mod=x=>((x%29)+29)%29;
 const check=(c,m)=>{if(!c)throw Error(m)};
 const eq=(x,y)=>JSON.stringify(x)===JSON.stringify(y);
 const encode=(p,a,b)=>{let s=0;return p.map(x=>{const c=mod(x+a*s+b);s=mod(s+primes[c]);return c})};
 const states=c=>{let s=0;return c.map(x=>{const before=s;s=mod(s+primes[x]);return before})};
 const decode=(c,a,b)=>{const s=states(c);return c.map((x,i)=>mod(x-a*s[i]-b))};
 const parse=(s,original=false)=>{
  let tape=[],words=[],commas=[],ends=[],w=[];
  const flush=()=>{if(w.length)words.push({start:tape.length-w.length,end:tape.length,v:w});w=[]};
  for(const ch of s){if(R.has(ch)){const v=R.get(ch);w.push(v);tape.push(v)}
  else if(original?("-.&$§".includes(ch)||/[0-9]/.test(ch)):(ch!=="'"&&ch.trim()!==''||ch==='\n')){flush();if(ch==='⁚')commas.push(tape.length);if(ch==='⁘'||ch==='⁜')ends.push(tape.length)}}
  flush();return {tape,words,commas,ends};
 };
 const select=(words,commas,ends)=>{
  let at=0,rows=[];
  for(const end of [...new Set(ends)].sort((a,b)=>a-b)){if(end<=at)continue;
   const interior=commas.filter(c=>at<c&&c<end);
   if(interior.length===1){const c=interior[0],u=words.find(w=>w.end===c),v=words.find(w=>w.end===end);check(u&&v&&u.start>=at&&v.start>=c,`non-word endpoint ${at}/${c}/${end}`);
    const width=u.v.length===v.v.length&&u.v.length>=2;
    rows.push({clause:[at,c,end],left:u,right:v,selected:width,equal:eq(u.v,v.v)});
   }at=end;
  }return rows;
 };
 const constraints=(c,row)=>{
  const S=states(c);let candidates=Array.from({length:29},(_,i)=>i), informative=0, first=null, steps=[];
  for(let j=0;j<row.left.v.length;j++){const i=row.left.start+j,k=row.right.start+j,dS=mod(S[i]-S[k]),dC=mod(c[i]-c[k]);
   if(dS!==0){informative++;if(first===null)first=j}
   candidates=candidates.filter(a=>mod(a*dS)===dC);steps.push(candidates.length);
  }
  return {candidates,informative,first,steps};
 };
 let controls=[],nativeRows=[];
 for(const section of native.sections){const q=parse(section.source_text);const rows=select(q.words,q.commas,q.ends);nativeRows.push(...rows.map(r=>({section:section.name,widths:[r.left.v.length,r.right.v.length],selected:r.selected,equal:r.equal,clause:r.clause,words:[r.left.v,r.right.v]})));
  for(const row of rows.filter(r=>r.selected)){let count=0,uniqueCorrect=0,nonidentifiable=0,wrongUnique=0,falseAdmit=0,heldSymbolChecks=0;
   for(let a=0;a<29;a++)for(let b=0;b<29;b++){const c=encode(q.tape,a,b),d=decode(c,a,b);check(eq(d,q.tape),'roundtrip');
    const r=constraints(c,row);count++;
    if(row.equal){check(r.candidates.includes(a),'true coefficient eliminated');if(r.candidates.length===1){uniqueCorrect++;heldSymbolChecks+=row.left.v.length-1}else nonidentifiable++}
    else{if(r.candidates.length)falseAdmit++;if(r.candidates.length===1)wrongUnique++}
   }
   controls.push({section:section.name,role:section.name==='0_loss_of_divinity'?'development':'held',equal:row.equal,width:row.left.v.length,count,uniqueCorrect,nonidentifiable,wrongUnique,falseAdmit,heldSymbolChecks});
  }
 }
 const q=parse(inputs[2],true),tape=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
 check(tape.length===12956&&eq(q.tape.slice(0,tape.length),tape),'original tape mismatch');
 const words=q.words.filter(w=>w.end<=tape.length);check(words.length===2896,'original word count');
 const ends=punct.events.filter(e=>(e.symbol==='⁘'&&![57,58,59,60,91,125,127].includes(e.index))||(e.symbol==='⁜'&&e.large_mark?.dot_count===13)).map(e=>e.rune_offset);
 const commas=punct.comma_events.map(e=>e.rune_offset);
 const original=select(words,commas,ends).map(row=>({clause:row.clause,widths:[row.left.v.length,row.right.v.length],starts:[row.left.start,row.right.start],selected:row.selected,conditional:row.selected?constraints(tape,row):null}));
 return {model:"C_i=P_i+a*S_i+b mod29; S_i=sum of prior GP prime weights of C modulo29",nativeRows,controls,original,sourceStats:{nativeSingleComma:nativeRows.length,selected:nativeRows.filter(r=>r.selected).length,selectedEqual:nativeRows.filter(r=>r.selected&&r.equal).length,originalCommas:commas.length,words:words.length,originalRunes:tape.length}};
}
const fs=require('node:fs');
const files=["resources/external/relikd-solved-gp29-native-v1.json","resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2_krisyotam_2017.txt","resources/liber-primus/lp2-punctuation-identity.json"];
console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(p,'utf8'))),null,2));
