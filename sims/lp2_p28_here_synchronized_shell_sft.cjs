"use strict";
const fs = require("node:fs");
const path = require("node:path");
function run(c,t,s) {
  const assert=(b,m)=>{if(!b)throw Error(m)};
  const idx=new Map(c.runes.map((x,i)=>[x,i])),mod=x=>(x%29+29)%29,gp=x=>[...x].filter(x=>idx.has(x)).map(x=>idx.get(x)),spell=x=>x.map(v=>c.translit[v]).join("");
  const parts=t.replace(/\r/g,"").split(/^\s*%\s*$/m),pages=c.pages.filter(p=>p.page!==50).map((p,i)=>{
    let pos=0;const lines=parts[i].split("/").map(line=>(line.match(/[\u16A0-\u16FF]+/gu)||[]).map(w=>{const v=gp(w);assert(v.length===w.length,"unknown rune");return v.map(()=>pos++);})).filter(x=>x.length);
    assert(pos===p.indices.length,`page length ${p.page}`);
    assert(JSON.stringify(gp(parts[i]))===JSON.stringify(p.indices),`page content ${p.page}`);
    return {n:p.page,c:p.indices,lines};
  });
  const groups=words=>{const out=[],depth=Math.max(0,...words.map(w=>Math.ceil(w.length/2)));
    for(let d=0;d<depth;d++){for(const w of words)if(w.length-2*d>=2)out.push({d,indices:[w[d],w[w.length-1-d]]});for(const w of words)if(w.length-2*d===1)out.push({d,indices:[w[d]]});}return out;
  };
  const schedule=(p,scope)=>scope==="line"?p.lines.flatMap(groups):groups(p.lines.flat());
  function transform(x,g,which="H"){
    return g.flatMap(({indices:z})=>z.length===1?[x[z[0]]]:which==="H"?[mod(x[z[0]]-x[z[1]]),mod(x[z[0]]+x[z[1]])]:[mod(15*(x[z[0]]+x[z[1]])),mod(15*(x[z[1]]-x[z[0]]))]);
  }
  function inverse(x,g,which="H"){
    let i=0;const out=new Array(x.length);for(const {indices:z} of g){if(z.length===1)out[z[0]]=x[i++];else{const u=x[i++],v=x[i++],b=which==="H"?[mod(15*(u+v)),mod(15*(v-u))]:[mod(u-v),mod(u+v)];out[z[0]]=b[0];out[z[1]]=b[1];}}assert(i===x.length&&out.every(Number.isInteger),"inverse length");return out;
  }
  const train=s.sections.filter(x=>!x.name.startsWith("p56")&&!x.name.startsWith("p57")).map(x=>gp(x.source_text));
  const counts=[new Float64Array(29).fill(.25),new Float64Array(29*29).fill(.25),new Float64Array(29*29*29).fill(.25)];
  for(const a of train)for(let i=0;i<a.length;i++){counts[0][a[i]]++;if(i>0)counts[1][a[i-1]*29+a[i]]++;if(i>1)counts[2][(a[i-2]*29+a[i-1])*29+a[i]]++;}
  const norm=a=>{for(let i=0;i<a.length;i+=29){let z=0;for(let j=0;j<29;j++)z+=a[i+j];for(let j=0;j<29;j++)a[i+j]/=z;}return a;};counts.forEach(norm);
  const score=x=>{let z=0;for(let i=0;i<x.length;i++){let v=counts[0][x[i]];if(i>0)v=.2*v+.8*counts[1][x[i-1]*29+x[i]];if(i>1)v=.35*v+.65*counts[2][(x[i-2]*29+x[i-1])*29+x[i]];z+=Math.log(v);}return z/x.length;};
  const native=s.sections.filter(x=>x.name==="p56_an_end"||x.name==="p57_parable").map(x=>gp(x.source_text));
  const p28=pages.find(p=>p.n===28);assert(p28.c.length===269,"p28");
  const anchor=transform(p28.c,schedule(p28,"line")).slice(0,4);assert(spell(anchor)==="HERE","anchor");
  const outputs=[],raw=pages.filter(p=>p.n<=55).flatMap(p=>p.c);
  for(const scope of ["line","page"])for(const which of ["H","Hinv"]){
    const z=pages.map(p=>{const g=schedule(p,scope),flat=g.flatMap(x=>x.indices);assert(flat.length===p.c.length&&new Set(flat).size===p.c.length,"permutation");const plain=transform(p.c,g,which);assert(JSON.stringify(inverse(plain,g,which))===JSON.stringify(p.c),`replay ${p.n}`);
      const outer=transform(p.c,g.filter(x=>x.d===0&&x.indices.length===2),which);
      const seed=native[1],plant=Array.from({length:p.c.length},(_,i)=>seed[i%seed.length]);assert(JSON.stringify(transform(inverse(plant,g,which),g,which))===JSON.stringify(plant),`plant ${p.n}`);
      return {n:p.n,plain,outer,score:score(plain),outerScore:score(outer),rawScore:score(p.c)};});
    const q=z.find(x=>x.n===28),firstLen=p28.lines[0].flat().length,body=z.filter(x=>x.n<=55),ch=body.filter(x=>x.n>=27&&x.n<=32);
    outputs.push({scope,which,total:body.flatMap(x=>x.plain).length,score:score(body.flatMap(x=>x.plain)),outerLength:body.flatMap(x=>x.outer).length,outerScore:score(body.flatMap(x=>x.outer)),chapterScore:score(ch.flatMap(x=>x.plain)),chapterOuterScore:score(ch.flatMap(x=>x.outer)),p28:{rawScore:q.rawScore,score:q.score,outerScore:q.outerScore,firstLineSizedPrefix:spell(q.plain.slice(0,firstLen)),continuation:spell(q.plain.slice(4,100)),afterAnchorScore:score(q.plain.slice(4)),outerPreview:spell(q.outer.slice(0,100)),outerAfterAnchorScore:score(q.outer.slice(4))},p56:{aligned:z.find(x=>x.n===56).plain.reduce((n,v,i)=>n+(v===native[0][i]),0),score:z.find(x=>x.n===56).score},pageScores:body.map(x=>({page:x.n,score:x.score,outerScore:x.outerScore,rawScore:x.rawScore,preview:spell(x.plain.slice(0,50))})).sort((a,b)=>b.score-a.score)});
  }
  return {training:train.flat().length,native:native.map(x=>({n:x.length,score:score(x)})),originalRunes:raw.length,rawScore:score(raw),anchor:spell(anchor),outputs};
}
const p=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json"];
const a=p.map(x=>fs.readFileSync(path.resolve(__dirname,"..",x),"utf8"));
console.log(JSON.stringify(run(JSON.parse(a[0]),a[1],JSON.parse(a[2])),null,2));
