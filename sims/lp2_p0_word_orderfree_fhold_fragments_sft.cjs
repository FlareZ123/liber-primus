'use strict';
const fs=require('node:fs'),path=require('node:path');
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/liber-primus/lp2-transcription.txt",
  "resources/control/english_wordfreq_textblob.txt",
  "resources/external/relikd-solved-gp29-native-v1.json"
];

function run(files){
 const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
 const corpus=JSON.parse(files[0]),T=corpus.translit,ix=new Map(corpus.runes.map((x,i)=>[x,i])),labels=new Map(T.map((x,i)=>[x,i]));
 const mod=(x,q)=>((x%q)+q)%q,alphabet="0123456789abcdefghijklmnopqrs",enc=a=>a.map(x=>x<0?"?":alphabet[x]).join("");
 const tokenize=(w,mode=0)=>{w=w.toUpperCase().replace(/QU/g,mode?"CU":"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let out=[];for(let i=0;i<w.length;){let tok=["ING","TH","NG","EO","OE","AE","IA","EA","IO"].find(t=>w.startsWith(t,i)&&!(mode&&["ING","IO"].includes(t)))||w[i];let n=labels.get(tok==="ING"?"NG":tok==="IO"?"IA":tok);if(n!==undefined)out.push(n);i+=tok.length}return out};
 function parse(s){let ws=[],w=[];for(let ch of s){if(ix.has(ch))w.push(ix.get(ch));else if(ch!=="%"&&ch!=="/"&&!/\s/u.test(ch)){if(w.length)ws.push(w);w=[]}}if(w.length)ws.push(w);return ws}
 const words=parse(files[1].split("%").slice(0,55).join("%")),tape=words.flat(),canon=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
 assert(words.length===2896&&tape.length===12956&&tape.every((x,i)=>x===canon[i]),"canonical");
 let off=0,opening=[];for(let w of words){let end=off+w.length;if(off>=13&&end<=729)opening.push(w);off=end}assert(opening.length===156&&opening.flat().length===716,"opening");
 const lex=new Map();function add(a,w,freq){if(a.length){let k=enc(a),old=lex.get(k);if(!old||old.freq<freq)lex.set(k,{a,w,freq})}}
 for(let line of files[2].split(/\r?\n/)){let m=line.match(/^([a-z]+)\s+(\d+)\s*$/i);if(m)for(let mode=0;mode<2;mode++)add(tokenize(m[1],mode),m[1],+m[2])}
 for(let s of JSON.parse(files[3]).sections)for(let w of parse(s.source_text))add(w,w.map(x=>T[x]).join(""),1);
 const bylen=new Map();for(let v of lex.values()){if(!bylen.has(v.a.length))bylen.set(v.a.length,[]);bylen.get(v.a.length).push(v)}
 function fragment(c,p,q){let f=[];for(let i=0;i<c.length;i++){if(!p[i]){if(c[i])return null}else{let d=mod(c[i]-p[i],29);if(f.length>=q&&d!==f[f.length%q])return null;f.push(d)}}return f.slice(0,q)}
 function fragments(c,q){let fs=new Map();for(let v of bylen.get(c.length)||[]){let f=fragment(c,v.a,q);if(f===null)continue;let k=enc(f),old=fs.get(k);if(!old||old.freq<v.freq)fs.set(k,{f,...v})}return [...fs.values()]}
 function placed(f,q,t){let k=Array(q).fill(-1);f.forEach((x,j)=>k[(j+t)%q]=x);return k}
 function merge(a,b){let c=a.slice();for(let i=0;i<c.length;i++)if(b[i]>=0){if(c[i]>=0&&c[i]!==b[i])return null;c[i]=b[i]}return c}
 function replay(c,p,k,t){let out=p.map(x=>{if(!x)return 0;assert(k[t]>=0,"unassigned");let y=(x+k[t])%29;t=(t+1)%k.length;return y});assert(out.every((x,i)=>x===c[i]),"forward")}
 function assess(ws,q,threshold){
  let idx=ws.map((w,i)=>i).filter(i=>ws[i].length>=threshold),lists=idx.map(i=>fragments(ws[i],q)),pairs=[],adj=Array(idx.length).fill(0);
  const meta=idx.map((i,j)=>({i,length:ws[i].length,zero:ws[i].filter(x=>!x).length,candidates:lists[j].length,fragmentLengths:[...new Set(lists[j].map(v=>v.f.length))].sort((a,b)=>a-b)}));
  function bucketByLength(xs){let m=new Map();for(let x of xs){if(!m.has(x.f.length))m.set(x.f.length,[]);m.get(x.f.length).push(x)}return m}
  for(let a=0;a<idx.length;a++)for(let b=a+1;b<idx.length;b++){
   let found=new Map();
   for(let [n,as] of bucketByLength(lists[a]))for(let [m,bs] of bucketByLength(lists[b]))for(let t=0;t<q;t++){
    let pos=[];for(let z=0;z<m;z++){let p=(t+z)%q;if(p<n)pos.push([p,z])}
    let bucket=new Map();for(let v of bs){let sig=enc(pos.map(([p,z])=>v.f[z]));if(!bucket.has(sig))bucket.set(sig,[]);bucket.get(sig).push(v)}
    for(let v of as)for(let u of bucket.get(enc(pos.map(([p])=>v.f[p])))||[]){let k=merge(placed(v.f,q,0),placed(u.f,q,t));assert(k,"indexed pair");let s=enc(k);if(!found.has(s)){replay(ws[idx[a]],v.a,k,0);replay(ws[idx[b]],u.a,k,t);found.set(s,{key:s,a:v.w,b:u.w,t})}}
   }
   if(found.size){adj[a]|=1<<b;adj[b]|=1<<a}
   pairs.push({a:idx[a],b:idx[b],keys:found.size,witness:found.values().next().value||null});
  }
  assert(idx.length<=20,"clique bitmask");let upper=0;
  for(let mask=1;mask<(1<<idx.length);mask++){let n=0,ok=true;for(let a=0;a<idx.length;a++)if(mask&(1<<a)){n++;if(!lists[a].length||(mask&~(1<<a)&~adj[a])){ok=false;break}}if(ok)upper=Math.max(upper,n)}
  const one=lists.findIndex(x=>x.length>0);
  return{q,anchors:meta,pairs,upper,oneWitness:one<0?null:{i:idx[one],plaintext:lists[one][0].w,key:enc(placed(lists[one][0].f,q,0))}};
 }
 let controls=[],original=[];
 for(let q of [8,13]){
  let key=q===8?[23,10,1,10,9,10,16,26]:[9,0,7,18,27,6,6,0,21,18,26,19,11],plant=[],truth=[];
  let lens=opening.filter(w=>w.length>=10).map(w=>w.length);
  for(let j=0;j<lens.length;j++){let cs=(bylen.get(lens[j])||[]).filter(v=>v.a.filter(x=>!x).length<=1).sort((a,b)=>b.freq-a.freq||a.w.localeCompare(b.w));let v=cs[(17+29*j)%cs.length],t=(3*j+2)%q,p=t;let c=v.a.map(x=>{if(!x)return 0;let y=(x+key[p])%29;p=(p+1)%q;return y});assert(fragment(c,v.a,q).every((x,i)=>x===key[(t+i)%q]),"true fragment");replay(c,v.a,key,t);plant.push(c);truth.push({word:v.w,phase:t,native:enc(v.a)})}
  let r=assess(plant,q,10);assert(r.upper===lens.length&&r.pairs.every(x=>x.keys>0),"all planted pair witnesses");controls.push({...r,trueKey:key,trueWords:truth});
  original.push(assess(opening,q,10));
 }
 return{lexicon:lex.size,openingGroups:opening.length,openingRunes:716,controls,original};
}

console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'))),null,2));
