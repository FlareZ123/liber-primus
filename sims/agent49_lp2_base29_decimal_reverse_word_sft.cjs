'use strict';
// Agent49: source-motivated decimal digit reversal of GP29 group integers.
// Read-only Node22 / CommonJS; the computational core was executed in V8.
const fs=require('node:fs');
const path=require('node:path');
function analyze(gp,raw,native,lex){
  const check=(v,m)=>{if(!v)throw Error(m)};
  const ix=new Map(gp.runes.map((x,i)=>[x,i])), tok=gp.translit.map((text,index)=>({text,index})).sort((a,b)=>b.text.length-a.text.length);
  const words=[];let w=[],start=0,end=0;
  const finish=()=>{if(w.length)words.push({a:w,start,end});w=[]};
  const seg=raw.split("%").slice(0,55);
  for(let p=0;p<seg.length;p++)for(const x of seg[p]){if(ix.has(x)){if(!w.length)start=p;w.push(ix.get(x));end=p}else if(x!=="/"&&!/\s/u.test(x))finish()}
  finish();
  const tape=words.flatMap(x=>x.a), orig=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
  check(words.length===2896&&tape.length===12956&&tape.every((x,i)=>x===orig[i]),"source parse");
  check(words.filter(w=>w.start!==w.end).length===32,"carry");
  /** @param {number[]} a */
  function value(a){return a.reduce((z,d)=>29n*z+BigInt(d),0n)}
  /** @param {bigint} z @param {number} n */
  function digits(z,n){const a=Array(n).fill(0);for(let i=n-1;i>=0;i--){a[i]=Number(z%29n);z/=29n}check(z===0n,"overflow");return a}
  /** @param {string} x */
  function rev(x){return BigInt([...x].reverse().join(""))}
  /** @param {number[]} a @param {"fixed"|"minimal"} kind */
  function involution(a,kind){const z=value(a),m=29n**BigInt(a.length),str=z.toString(),width=(m-1n).toString().length,v=rev(kind==="fixed"?str.padStart(width,"0"):str),legal=v<m&&(kind==="fixed"||rev(v.toString())===z);return {a:legal?digits(v,a.length):a.slice(),legal,changed:legal&&v!==z,overflow:v>=m}}
  /** @param {string} word */
  function encode(word){const text=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let a=[];for(let i=0;i<text.length;){if(text.startsWith("ING",i)){a.push(21);i+=3;continue}if(text.startsWith("IO",i)){a.push(27);i+=2;continue}const t=tok.find(t=>text.startsWith(t.text,i));if(!t)return [];a.push(t.index);i+=t.text.length}return a}
  const dict=new Map();for(const l of lex.split(/\r?\n/u)){const m=/^([A-Za-z]+) (\d+)$/u.exec(l);if(!m)continue;const a=encode(m[1]);if(a.length)dict.set(a.join(","),a)}
  const controls=native.sections.map(s=>({name:s.name,words:s.source_text.match(/[\u16A0-\u16FF]+/gu).map(w=>[...w].map(x=>ix.get(x)))}));
  const reg=new Map(dict);for(const c of controls)for(const a of c.words)reg.set(a.join(","),a);
  /** @param {Map<string,number[]>} source */
  function reverseIndex(source){const index=new Map();for(const [key,a] of source){const k=rev(value(a).toString()).toString();if(!index.has(k))index.set(k,[]);index.get(k).push(key)}return index}
  const index=reverseIndex(reg);
  const stat=a=>{const n=a.length,h=Array(29).fill(0);for(const x of a)h[x]++;return {n,ioc:h.reduce((s,x)=>s+x*(x-1),0)/(n*(n-1)),equal:a.slice(1).reduce((s,x,i)=>s+(x===a[i]),0)}};
  const tr=a=>a.map(i=>gp.translit[i]).join("");
  // Offsets are complete chapter boundaries; p55 body is the final 16 complete groups, excluding the incoming carry.
  const ranges=[["all",words],["p33-39",words.filter(x=>x.start>=33&&x.end<=39)],["p55-complete",words.filter(x=>x.start===54)]];
  const rows=[];
  for(const [name,ws] of ranges){
    const out={name,groups:ws.length,input:stat(ws.flatMap(w=>w.a)),zeroPadded:ws.filter(w=>w.a[0]===0&&w.a.length>1).length};
    for(const kind of ["fixed","minimal"]){
      const d=ws.map(w=>involution(w.a,kind));
      check(d.every((x,i)=>involution(x.a,kind).a.join(",")===ws[i].a.join(",")),"roundtrip");
      out[kind]={legal:d.filter(x=>x.legal).length,changed:d.filter(x=>x.changed).length,overflow:d.filter(x=>x.overflow).length,loss:d.filter(x=>!x.legal&&!x.overflow).length,output:stat(d.flatMap(x=>x.a)),covered:d.filter(x=>reg.has(x.a.join(","))).length,longCovered:d.filter(x=>x.a.length>=4&&reg.has(x.a.join(","))).length,preview:d.slice(0,18).map(x=>tr(x.a)).join(" ")};
    }
    let longest=0,run=0,unique=0,covered=0,longCovered=0,longGroups=0,exactLength=0,maxCandidates=0;
    const hits=[];
    for(let i=0;i<ws.length;i++){
      const a=ws[i].a, candidates=index.get(value(a).toString())??[];
      if(a.length>=4)longGroups++;
      if(candidates.length){covered++;run++;longest=Math.max(longest,run);if(a.length>=4){longCovered++;hits.push({group:i,cipher:tr(a),candidate:candidates.slice(0,5).map(k=>tr(reg.get(k)))})}if(candidates.length===1)unique++;if(candidates.some(k=>reg.get(k).length===a.length))exactLength++;maxCandidates=Math.max(maxCandidates,candidates.length)}else run=0;
    }
    out.variable={covered,unique,longest,longCovered,longGroups,exactLength,maxCandidates,examples:hits.slice(0,12)};
    rows.push(out);
  }
  const ctrl=[];
  for(const c of controls){
    const other=new Map(dict);for(const d of controls)if(d!==c)for(const a of d.words)other.set(a.join(","),a);
    const oi=reverseIndex(other);
    let dictionaryPresent=0,variableCovered=0,exactCandidates=0,ambiguous=0;
    const row={name:c.name,groups:c.words.length,plain:stat(c.words.flat())};
    for(const a of c.words){
      const k=a.join(","),z=rev(value(a).toString()).toString(),cands=index.get(z);
      check(cands.includes(k),"variable true candidate");
      if(other.has(k))dictionaryPresent++;
      if(oi.has(z))variableCovered++;
      if(cands.length===1)exactCandidates++;else ambiguous++;
    }
    for(const kind of ["fixed","minimal"]){const ct=c.words.map(a=>involution(a,kind).a),pt=ct.map(a=>involution(a,kind).a);check(pt.every((a,i)=>a.join(",")===c.words[i].join(",")),"plant");row[kind]={cipher:stat(ct.flat()),recovered:pt.flat().length}}
    row.variable={dictionaryPresent,variableCovered,exactCandidates,ambiguous};ctrl.push(row);
  }
  check(rev("1033")===3301n&&rev("3301")===1033n,"source numeral");
  return {dictionary:dict.size,combinedRegister:reg.size,variableDistinctOutputs:index.size,rows,controls:ctrl};
}
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const result=analyze(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/transcriptions/lp2-image-corrected.txt"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/control/english_wordfreq_textblob.txt"));
console.log(JSON.stringify(result,null,2));
