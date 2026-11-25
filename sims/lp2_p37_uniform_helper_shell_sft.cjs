"use strict";
const fs=require("node:fs"),path=require("node:path");
function helperExperiment(gp, trans, signed, native) {
  const mod=x=>(x%29+29)%29, sum=a=>a.reduce((x,y)=>x+y,0), Hinv=s=>[mod(15*(s[0]+s[3])),mod(15*(s[1]+s[2])),mod(15*(s[2]-s[1])),mod(15*(s[3]-s[0]))];
  const ri=new Map(gp.runes.map((r,i)=>[r,i])), vals=s=>[...s].filter(c=>ri.has(c)).map(c=>ri.get(c)), spell=a=>a.map(i=>gp.translit[i]).join("");
  const parts=trans.replace(/\r/g,"").split(/^\s*%\s*$/m);
  const helper=new Map();
  for(let j=0;j<parts.length;j++){
    const page=j>=50?j+1:j;if(page>57)continue;
    const lines=parts[j].split("\n").filter(s=>s.length).map(s=>({runes:vals(s).length,chunks:s.split(/[-.\/\s]+/u).filter(t=>vals(t).length).length}));
    if(lines.length<7||!lines[0].runes||!lines[6].runes)continue;
    const a=lines[0],b=lines[6],shell=[19,mod(a.chunks-b.chunks),mod(a.runes-b.runes),mod(a.chunks)];
    helper.set(page,{page,a,b,shell,key:Hinv(shell)});
  }
  if(helper.get(31)?.shell.join()!=="19,0,2,5")throw Error("p31 helper geometry");
  const pages=parts.slice(0,55).map((s,i)=>({page:i>=50?i+1:i,words:[],offset:0}));
  const words=[];let cur=[],startSeg=-1,endSeg=-1,start=-1;
  function flush(){if(cur.length&&startSeg===endSeg){const p=pages[startSeg];const w={page:p.page,ordinal:p.words.length,start,C:cur};p.words.push(w);words.push(w);}cur=[];}
  for(let j=0;j<55;j++)for(const c of [...parts[j]]){
    if(ri.has(c)){if(!cur.length){startSeg=j;start=pages[j].offset;}endSeg=j;cur.push(ri.get(c));pages[j].offset++;}
    else if(c!=="/"&&!/\s/u.test(c))flush();
  }flush();
  if(words.length!==2864)throw Error("word count");
  const four=words.filter(w=>w.C.length===4);
  if(four.length!==509)throw Error("four count");
  const raw=signed.split("-----BEGIN PGP SIGNATURE-----")[0];
  const sw=raw.slice(raw.indexOf("Hello.")).split(/[^A-Za-z0-9]+/u).filter(s=>/^[A-Za-z]+$/u.test(s)).map(s=>s.toUpperCase());
  const tokens=gp.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
  function gpWord(s){s=s.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const out=[];for(let i=0;i<s.length;){const x=s.startsWith("ING",i)?["ING",21]:s.startsWith("IO",i)?["IO",27]:tokens.find(t=>s.startsWith(t[0],i));if(!x)throw Error(s);out.push(x[1]);i+=x[0].length;}return out;}
  if(sw.length!==43||sum(gpWord(sw[37]))!==31)throw Error("signed index");
  const donor=native.sections.flatMap(t=>(t.source_text.replace(/\/\s*/gu,"").match(/[\u16A0-\u16FF]+/gu)||[]).map(vals).filter(a=>a.length===4));
  const dictionary=new Set(donor.map(a=>a.join()));
  const dec=(C,k)=>C.map((x,i)=>mod(x-k[i]));
  function preimages(C,wrap){const out=[];for(const [h,v] of helper){const P=dec(C,v.key),s=sum(P);if((wrap?s%58:s)===h)out.push({h,P,text:spell(P),nativeWord:dictionary.has(P.join())});}return out;}
  const rows=four.map(w=>{const ord=w.ordinal<43?sw[w.ordinal]:null,h=ord?sum(gpWord(ord)):null,k=helper.get(h)?.key??null,P=k?dec(w.C,k):null;return {...w,sourceWord:ord,helper:h,ordinalDecode:P?spell(P):null,ordinalNative:P?dictionary.has(P.join()):null,direct:preimages(w.C,false),wrapped:preimages(w.C,true)}});
  const anchor=rows.find(w=>w.page===37&&w.ordinal===37);
  if(anchor.ordinalDecode!=="LUCC"||!anchor.direct.some(x=>x.P.join()==="20,1,5,5"))throw Error("anchor");
  const histogram=(xs,k)=>Object.fromEntries([...new Set(xs.map(x=>x[k].length))].sort((a,b)=>a-b).map(n=>[n,xs.filter(x=>x[k].length===n).length]));
  const summarize=xs=>({n:xs.length,ordinalDefined:xs.filter(x=>x.ordinalDecode!==null).length,ordinalNative:xs.filter(x=>x.ordinalNative).length,directHist:histogram(xs,"direct"),wrappedHist:histogram(xs,"wrapped"),directNative:xs.filter(x=>x.direct.some(p=>p.nativeWord)).length,wrappedNative:xs.filter(x=>x.wrapped.some(p=>p.nativeWord)).length});
  const plant=[false,true].map(wrap=>{
    let encodable=0,retained=0,unique=0,alternatives=0;
    for(const P of donor){const h=wrap?sum(P)%58:sum(P),key=helper.get(h)?.key;if(!key)continue;encodable++;const C=P.map((p,i)=>mod(p+key[i])),ps=preimages(C,wrap);if(ps.some(x=>x.P.join()===P.join()))retained++;if(ps.length===1)unique++;alternatives+=ps.length;}
    if(retained!==encodable)throw Error("preimage control");
    return {wrap,donorWords:donor.length,encodable,retained,unique,alternatives};
  });
  const p37=rows.filter(w=>w.page===37),item3=p37.filter(w=>w.start>=91&&w.start+4<=189);
  return {method:"Freeze prior p31 helper line0/6 shell globally; signed ordinal and self-GP0 page-address inverse; direct address and full-page-count mod58 rival",helperPages:[...helper.values()],donorDistinct:dictionary.size,controls:plant,whole:summarize(rows),p37:summarize(p37),item3:summarize(item3),p37Rows:p37,originalRows:rows};
}
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
console.log(JSON.stringify(helperExperiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt"),read("resources/historical/cicada2016-4gq25-outguess.asc"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"))),null,2));
