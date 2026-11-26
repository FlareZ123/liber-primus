"use strict";
// Run from repository root: node sims/lp2_p24_literal_halfturn_pad_sft.cjs
const fs = require("node:fs");
const path = require("node:path");
const read = p => fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function run(corpus,solved,trans){
  const alphabet=corpus.runes, idx=new Map(alphabet.map((x,i)=>[x,i]));
  const native=s=>Array.from(s).filter(x=>idx.has(x)).map(x=>idx.get(x));
  const mod=x=>(x+29)%29;
  const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  const check=(x,m)=>{if(!x)throw Error(m);};
  const page=n=>corpus.pages.find(p=>p.page===n).indices;
  const a=page(24).slice(0,135), b=page(24).slice(135).reverse();
  const full=page(24).map(x=>alphabet[x]).join("");
  const chars=Array.from(trans), positions=chars.flatMap((x,i)=>idx.has(x)?[i]:[]);
  const tape=positions.map(i=>chars[i]).join(""), at=tape.indexOf(full);
  check(at>=0&&tape.indexOf(full,at+1)<0,"unique p24 text");
  const lines=chars.slice(positions[at],positions[at+269]+1).join("").split(/\r?\n/).map(native).filter(x=>x.length);
  check(eq(lines.map(x=>x.length),[22,24,21,24,23,21,22,23,23,22,22,23]),"p24 geometry");
  check(eq(lines.flat(),page(24))&&a.length===b.length&&b.length===135,"source");
  const decode=(x,k)=>x.map((c,i)=>mod(c-k[i]));
  const encode=(p,k)=>p.map((c,i)=>mod(c+k[i]));
  const pair=(x,y)=>[decode(x,y),decode(y,x)];
  const original=pair(a,b);
  check(eq(encode(original[0],b),a)&&eq(encode(original[1],a),b),"original exact roundtrip");
  const sections=solved.sections.map(s=>({name:s.name,x:native(s.source_text)}));
  function model(training){
    const u=Array(29).fill(0), bi=Array(29*29).fill(0);
    for(const s of training)for(let i=0;i<s.x.length;i++){u[s.x[i]]++;if(i)bi[s.x[i-1]*29+s.x[i]]++;}
    const total=u.reduce((x,y)=>x+y,0);
    const row=u.map((_,i)=>bi.slice(i*29,(i+1)*29).reduce((x,y)=>x+y,0));
    const p=u.map(n=>(n+1)/(total+29));
    return x=>x.slice(1).reduce((s,v,i)=>s+Math.log(29*(bi[x[i]*29+v]+10*p[v])/(row[x[i]]+10)),0)/(x.length-1);
  }
  const fullModel=model(sections), score=x=>fullModel(x);
  const fmt=x=>({indices:x,runes:x.map(i=>alphabet[i]).join(""),translit:x.map(i=>corpus.translit[i]).join(""),meanLogLikelihoodRatio:score(x),F:x.filter(i=>i===0).length});
  const negatives=[];
  const available=corpus.pages.filter(p=>p.page<56&&p.page!==24&&p.indices.length>=135);
  for(let i=0;i+1<available.length;i+=2){const x=available[i],y=available[i+1];negatives.push({pages:[x.page,y.page],candidates:pair(x.indices.slice(0,135),y.indices.slice(-135).reverse())});}
  const controls=[];
  let counter=0;
  for(const s of sections){
    const f=model(sections.filter(t=>t!==s));
    for(let i=0;i+135<=s.x.length;i+=135){
      const plain=s.x.slice(i,i+135), mask=available[counter%available.length].indices.slice(0,135);
      const cipher=encode(plain,mask), side=counter%2;
      const halves=side?[mask,cipher]:[cipher,mask]; // only halves to receiver
      const decoded=pair(...halves), scores=decoded.map(f);
      const selected=scores[0]>=scores[1]?0:1;
      check(eq(decoded[side],plain)&&eq(encode(decoded[side],mask),cipher),"native exact");
      controls.push({section:s.name,start:i,hiddenRole:side,selected,exact:eq(decoded[selected],plain),score:scores[side],rivalScore:scores[1-side],originalScores:original.map(f),negativeBest:Math.max(...negatives.flatMap(n=>n.candidates.map(f)))});
      counter++;
    }
  }
  const negScores=negatives.map(n=>({pages:n.pages,scores:n.candidates.map(score)}));
  return {lines:lines.map(x=>x.length),original:original.map(fmt),originalReplay:true,controls,negativeScores:negScores,summary:{nativeBlocks:controls.length,blindExact:controls.filter(c=>c.exact).length,nativeScoreRange:[Math.min(...controls.map(c=>c.score)),Math.max(...controls.map(c=>c.score))],originalFoldScoreRange:[Math.min(...controls.flatMap(c=>c.originalScores)),Math.max(...controls.flatMap(c=>c.originalScores))],negativePairs:negScores.length,negativeCandidatesAtOrAboveOriginalBest:negScores.flatMap(n=>n.scores).filter(n=>n>=Math.max(...original.map(score))).length,negativeScoreRange:[Math.min(...negScores.flatMap(n=>n.scores)),Math.max(...negScores.flatMap(n=>n.scores))],analogousSizes:[25,26].map(n=>({page:n,length:page(n).length,split:n===25?[137,136]:[134,131]}))}};
}
console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/liber-primus/lp2-transcription.txt")),null,2));
