"use strict";
/** Prepare exact native F-hold affine inverse with unknown two-class partition. */
const fs=require("node:fs"),path=require("node:path");const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function study(g,native,lex,terminal,sources){
 const mod=x=>((x%29)+29)%29, cls=Uint8Array.from({length:29},(_,i)=>[1,3,10,12,18,22,24,25,26,27,28].includes(i)?0:1);
 const alphabet=new Map(g.translit.map((s,i)=>[s,i])),ids=new Map(g.runes.map((s,i)=>[s,i])),tokens=g.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),normalize=w=>w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
 const sig=p=>String.fromCharCode(...p), compact=p=>p.map(x=>"0123456789abcdefghijklmnopqrs"[x]).join("");
 function encode(w){w=normalize(w);const p=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){p.push(21);i+=3}else if(w.startsWith("IO",i)){p.push(27);i+=2}else{const t=tokens.find(t=>w.startsWith(t.s,i));if(!t)throw Error(w);p.push(t.i);i+=t.s.length}}return p}
 const dict=new Map();
 function add(p,label,freq){const k=sig(p),prev=dict.get(k);if(!prev||freq>prev.freq)dict.set(k,{p,label,freq})}
 function addLatin(w,freq){const s=normalize(w);function walk(i,p){if(i===s.length){add(p,w,freq);return}for(const n of [1,2,3]){const part=s.slice(i,i+n);if(part.length!==n)continue;const v=n===3?(part==="ING"?alphabet.get("NG"):undefined):alphabet.get(part);if(v!==undefined)walk(i+n,p.concat(v))}}walk(0,[]);add(encode(w),w,freq)}
 for(const line of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m)addLatin(m[1],Number(m[2]))}
 for(const w of ["A","I","O"])addLatin(w,1);
 for(const sec of native.sections)for(const w of sec.source_text.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g)||[]){const p=Array.from(w,x=>ids.get(x));if(p.some(x=>x===undefined))throw Error("unknown");add(p,"[native]",1)}
 const anchors=[...dict.values()].filter(w=>w.p.length===8);
 const A=[],B=[];for(let a=1;a<29;a++)for(let b=0;b<29;b++){A.push(a);B.push(b)}const M=A.length,ind=(a,b)=>(a-1)*29+b,ivA=A.map(a=>{for(let i=1;i<29;i++)if(mod(i*a)===1)return i});
 const dec=new Uint8Array(M*29),enc=new Uint8Array(M*29),right=new Uint16Array(M*M),left=new Uint16Array(M*M);
 for(let s=0;s<M;s++){for(let x=0;x<29;x++){dec[s*29+x]=mod(ivA[s]*(x-B[s]));enc[s*29+x]=mod(A[s]*x+B[s])}for(let k=0;k<M;k++){right[s*M+k]=ind(mod(A[s]*A[k]),mod(A[s]*B[k]+B[s]));left[s*M+k]=ind(mod(A[s]*A[k]),mod(A[k]*B[s]+B[k]))}}
 const coeff=k=>k.map(i=>[A[i],B[i]]);
 const text=sources.map(([name,s])=>({name,words:(s.match(/[A-Za-z]+/g)||[]).map(w=>({w,p:encode(w)}))}));
 const ref=text[1].words.flatMap(w=>w.p),uni=new Uint32Array(29),bi=new Uint32Array(841),tri=new Uint32Array(24389);
 for(let i=0;i<ref.length;i++){uni[ref[i]]++;if(i)bi[ref[i-1]*29+ref[i]]++;if(i>1)tri[(ref[i-2]*29+ref[i-1])*29+ref[i]]++}
 const score=new Float64Array(24389);for(let x=0;x<29;x++)for(let y=0;y<29;y++)for(let z=0;z<29;z++){const pu=(uni[z]+1)/(ref.length+29),pb=(bi[y*29+z]+20*pu)/(uni[y]+20);score[(x*29+y)*29+z]=Math.log((tri[(x*29+y)*29+z]+20*pb)/(bi[x*29+y]+20))}
 const trig=p=>{let v=0;for(let i=2;i<p.length;i++)v+=score[(p[i-2]*29+p[i-1])*29+p[i]];return v};

 const alphabetCompact="0123456789abcdefghijklmnopqrs",parse=s=>Array.from(s,x=>alphabetCompact.indexOf(x)),p54=terminal.p54.body_groups.slice(),p55=terminal.p55.groups.slice(),groups=p54.slice(0,-1).concat(p54.at(-1)+p55[0],p55.slice(1)).map(parse),orig=groups.flat(),expected=g.pages[54].indices.slice(9).concat(g.pages[55].indices);
 if(groups.length!==64||groups.slice(0,47).flat().length!==213||orig.length!==299||sig(orig)!==sig(expected))throw Error("terminal carry mismatch");
 const rows=[],meta=[];
 for(const [n,side,off,ks,partition] of [[0,"right",10000,[ind(3,5),ind(7,11),ind(13,8)],"quadratic residue"],[2,"left",15000,[ind(2,8),ind(11,3),ind(23,14)],"prime mod4"]]){
  const t=text[n];let pos=-1;
  for(let i=off;i+64<t.words.length;i++){const w=t.words.slice(i,i+64);if(w[0].p.length===8&&dict.has(sig(w[0].p))&&w.slice(0,47).filter(x=>!dict.has(sig(x.p))).length<=3&&w.slice(0,47).flatMap(x=>x.p).includes(0)){pos=i;break}}
  if(pos<0)throw Error("no plant");const words=t.words.slice(pos,pos+64),p=words.flatMap(x=>x.p),first=p.find(x=>x!==0);
  const qr=new Set(Array.from({length:28},(_,i)=>mod((i+1)*(i+1))));const primes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
  const classify=x=>partition==="quadratic residue"?Number(qr.has(x)):Number(primes[x]%4===1);
  const polarity=classify(first),c1=x=>classify(x)^polarity,mask=Array.from({length:28},(_,i)=>i+1).reduce((m,x)=>m|(c1(x)<<x),0)>>>0;
  const next=side==="right"?right:left, key=ks;let state=key[2];const c=[];for(const x of p){if(!x)c.push(0);else{c.push(enc[state*29+x]);state=next[state*M+key[c1(x)]]}}
  if(right[key[0]*M+key[1]]===left[key[0]*M+key[1]])throw Error("plant generators commute");
  let at=0;const cg=words.map(w=>{const z=c.slice(at,at+w.p.length);at+=w.p.length;return z});
  rows.push([t.name,side,1,key,mask,cg,words.map(w=>w.p)]);meta.push({name:t.name,side,partition,polarity,wordOffset:pos,key:coeff(key),class1Mask:mask,plainF:p.filter(x=>x===0).length,cipherF:c.filter(x=>x===0).length,trainRunes:words.slice(0,47).flatMap(w=>w.p).length,holdRunes:words.slice(47).flatMap(w=>w.p).length});
 }
 for(const side of ["right","left"])rows.push(["original",side,0,[],0,groups,[]]);
 const lines=[String(dict.size),...[...dict.values()].map(w=>compact(w.p)),Array.from(score,x=>Math.round(256*x)).join(" "),String(rows.length)];
 for(const [name,side,plant,key,mask,cg,pg] of rows){lines.push([name,side,plant,47,cg.length].join(" "));if(plant)lines.push([key.join(" "),mask].join(" "));lines.push(...cg.map(compact));if(plant)lines.push(...pg.map(compact))}
 return {input:lines.join("\n")+"\n",meta:{dictionary:dict.size,anchorForms:anchors.length,plants:meta,original:{runes:orig.length,train:213,hold:86,groups:64},sourceBlobs:[]}};
}

const g=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),native=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),lex=read("resources/control/english_wordfreq_textblob.txt"),terminal=JSON.parse(read("resources/liber-primus/lp2-page-groups-54-55-derived.json"));const sources=[["Shakespeare","resources/control/shakespeare_first300k.txt"],["Gibran","resources/control/gibran_prophet_58585.txt"],["Emerson","resources/control/emerson_essays_2944.txt"]].map(([n,p])=>[n,read(p)]);const out=study(g,native,lex,terminal,sources);process.stdout.write(process.argv.includes("--meta")?JSON.stringify(out.meta,null,2)+"\n":out.input);
