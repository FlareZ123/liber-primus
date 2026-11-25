'use strict';
// Director #2677. Run: node sims/lp2_unordered_source_quotation_inventory_sft.cjs path/to/pinned-self-reliance.txt
const fs=require('node:fs');
const crypto=require('node:crypto');
const manifest=[
  {
    "path": "resources/liber-primus/lp1-plaintext-reference.txt",
    "sha": "8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d"
  },
  {
    "path": "resources/control/cicada2012_blake_chorus.txt",
    "sha": "3e695c3f6ab11ea20b9462e6be5b0633982a351b"
  },
  {
    "path": "resources/external/2012-marriage-of-heaven-and-hell-page.txt",
    "sha": "f414f9dcd9ddb04f60609e3e062e0c1baf867ef4"
  },
  {
    "path": "resources/historical/cicada2012-countdown-message.asc",
    "sha": "7229104f48f4a0eeeae69c901eb74cb21baed956"
  },
  {
    "path": "resources/historical/cicada2012-midi-49-words.txt",
    "sha": "4351148626eaaed6854713b0c037fc3cdedff6f1"
  },
  {
    "path": "resources/historical/cicada2013-forest-clue.asc",
    "sha": "78d4eaf01df3e13e8d3aba0a113cee7c76523ce0"
  },
  {
    "path": "resources/external/2013-book-of-law-I.txt",
    "sha": "64876892683fab1467481fe87d85743a8ea17982"
  },
  {
    "path": "resources/external/2013-book-of-law-II.txt",
    "sha": "cb4353b080d7584441f85502aeccb60796e6fe0f"
  },
  {
    "path": "resources/external/2013-book-of-law-III.txt",
    "sha": "36e716252a271d31f5c4ba25b3cb78199ccc1114"
  },
  {
    "path": "resources/external/2013-0-wisdom.txt",
    "sha": "320257b0db6ee6326ef3fc216c5379c9c91694f3"
  },
  {
    "path": "resources/historical/cicada2014-stage11-message.asc",
    "sha": "e2b7382ac2cfb0adfe028cc063fc6048e0ad718e"
  },
  {
    "path": "resources/external/cicada2012-agrippa-gibson-archived-gp-wordlengths.json",
    "sha": "e84bd82f368d0430a153f07597f73d9fe38ce68a"
  },
  {
    "path": "resources/external/relikd-solved-gp29-native-v1.json",
    "sha": "1b064ef6d85819b7d96adaff31a82d1ec551598f"
  },
  {
    "path": "resources/liber-primus/lp2-corpus.json",
    "sha": "054f2a0f780b7d46901acbe3d9bf4f0ac1801165"
  },
  {
    "path": "resources/liber-primus/lp2-transcription.txt",
    "sha": "43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7"
  },
  {
    "path": "resources/liber-primus/lp2-quote-punctuation-spans.json",
    "sha": "0fe1a5a2b510a0d0fe098fd8bfd3f89c6bcafc7e"
  },
  {
    "path": "resources/control/gibran_prophet_58585.txt",
    "sha": "df260a07d56bf5998d40a6360b6132c35c252d10"
  },
  {
    "path": "resources/control/shakespeare_first300k.txt",
    "sha": "94c677ad9dd50771c6670e0c4e4dad9052b46d85"
  },
  {
    "path": "historical-emerson-self-reliance.txt",
    "sha": "12a6bc018047a1276e77f2b7f633d5905732fff9"
  }
];
function experiment(data){
 const assert=(x,m)=>{if(!x)throw Error(m)},same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const get=p=>data.find(x=>x.path===p).content;
 const A=JSON.parse(get("resources/liber-primus/lp2-corpus.json")),T=get("resources/liber-primus/lp2-transcription.txt"),Q=JSON.parse(get("resources/liber-primus/lp2-quote-punctuation-spans.json"));
 function gp(w){w=w.toUpperCase().replace(/['’]/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");let n=0;for(let i=0;i<w.length;n++){if(w.startsWith("ING",i))i+=3;else if(["TH","EO","OE","AE","IA","EA","NG"].includes(w.slice(i,i+2)))i+=2;else i++}return n}
 function latin(t){return (t.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)||[]).map(gp)}
 function native(t){let out=[],n=0;const finish=()=>{if(n){out.push(n);n=0}};for(const c of t){if(A.runes.includes(c))n++;else if(c!=="'"&&c!=="’")finish()}finish();return out}
 let words=[],cur=[],rawPage=0,offset=0;
 const finish=()=>{if(cur.length){words.push({v:cur.map(x=>x.i),page:cur[0].page,start:offset-cur.length,end:offset});cur=[]}};
 for(const line of T.split(/\r?\n/)){if(line==="%"){rawPage++;continue}if(line==="$")continue;if(line==="&"){finish();continue}for(const c of line){const i=A.runes.indexOf(c);if(i>=0){cur.push({i,page:rawPage<50?rawPage:rawPage+1});offset++}else if(c==="-"||c===".")finish()}}
 finish();words=words.slice(0,2896);assert(words.length===2896&&same(words.flatMap(x=>x.v),A.pages.slice(0,56).flatMap(p=>p.indices)),"original tape");
 const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 const targets=chapters.map(([lo,hi])=>({name:`p${lo}-${hi}`,lengths:words.filter(w=>w.page>=lo&&w.page<=hi).map(w=>w.v.length)}));
 for(const q of Q.quotes){const ws=words.filter(w=>w.start>=q.start&&w.end<=q.end);assert(ws[0].start===q.start&&ws.at(-1).end===q.end,"quote complete group bounds");targets.push({name:`quote${q.start}-${q.end}`,lengths:ws.map(w=>w.v.length)})}
 const sources=[];
 for(const d of data.slice(0,11)){let t=d.content,p=d.path;if(p.includes("lp1-plaintext"))t=t.split(/^###\s*56\s*$/m)[0].replace(/\[[^\]]+\]/g," ").replace(/^\s*###.*$/gm," ").replace(/^\s*[0-9a-f ]{16,}$/gmi," ").replace(/^\s*[0-9 ]{8,}$/gm," ");else if(p.includes("cicada2012_blake_chorus"))t=t.split("BEGIN SOURCE TEXT")[1].split("END SOURCE TEXT")[0];else if(p.includes("2012-marriage-"))t=t.replace(/([a-z])-\s*\n([a-z])/g,"$1$2");else if(p.endsWith(".asc"))t=t.split(/\r?\n\r?\n/u).slice(1).join("\n\n").split("-----BEGIN PGP SIGNATURE-----")[0].replace(/[a-z0-9]{16}\.onion/gi," ");else if(p.endsWith("2013-0-wisdom.txt")){sources.push({name:p,lengths:native(t.split(/\r?\n\r?\n/u)[0])});continue}sources.push({name:p,lengths:latin(t)})}
 sources.push({name:"Agrippa archived length-only",lengths:JSON.parse(get("resources/external/cicada2012-agrippa-gibson-archived-gp-wordlengths.json")).word_lengths});
 sources.push({name:"2014 selected Emerson exact edition",lengths:latin(get("historical-emerson-self-reliance.txt").replace(/([a-z])-\s*\n([a-z])/g,"$1$2"))});
 const nativeDoc=JSON.parse(get("resources/external/relikd-solved-gp29-native-v1.json"));
 for(const s of nativeDoc.sections.filter(s=>!s.name.startsWith("p5")))sources.push({name:"native-"+s.name,lengths:native(s.source_text)});
 const solved57=native(nativeDoc.sections.find(s=>s.name==="p57_parable").source_text);assert(same(solved57,latin("PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE")),"solved p57 GP normalization");
 const controls=[latin(get("resources/control/gibran_prophet_58585.txt")),latin(get("resources/control/shakespeare_first300k.txt"))];
 const M=Math.max(...targets.flatMap(t=>t.lengths),...sources.flatMap(s=>s.lengths),...controls.flat());
 const hist=x=>{let h=new Uint16Array(M+1);for(const n of x)h[n]++;return h};
 const key=h=>Array.from(h).join(",");
 const sizes=[...new Set(targets.map(t=>t.lengths.length))],idx=new Map(),windows={};
 for(const n of sizes){let map=new Map(),N=0;for(let si=0;si<sources.length;si++){let s=sources[si].lengths;if(s.length<n)continue;let h=hist(s.slice(0,n));for(let off=0;off+n<=s.length;off++){let k=key(h),q=map.get(k);if(!q)map.set(k,q={count:0,first:[si,off]});q.count++;N++;if(off+n<s.length){h[s[off]]--;h[s[off+n]]++}}}idx.set(n,map);windows[n]=N}
 let seed=0x33012677;const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296};
 function shuf(a){for(let i=a.length-1;i>0;i--){let j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
 const trials=2000;let family=0;const obs=targets.map(t=>{let n=t.lengths.length,k=key(hist(t.lengths)),match=idx.get(n).get(k);return {name:t.name,n,runes:t.lengths.reduce((a,b)=>a+b,0),matches:match?.count||0,first:match?{source:sources[match.first[0]].name,offset:match.first[1]}:null,controlHits:0}});
 for(let z=0;z<trials;z++){let any=false;for(let i=0;i<targets.length;i++){let n=obs[i].n,c=controls[z%2],off=Math.floor(rand()*(c.length-n+1)),hit=idx.get(n).has(key(hist(c.slice(off,off+n))));obs[i].controlHits+=hit;any||=hit}family+=any}
 const positives=[];for(let n of sizes){let s=sources.find(s=>s.lengths.length>=n);let off=Math.floor(rand()*(s.lengths.length-n+1)),x=shuf(s.lengths.slice(off,off+n));const h=idx.get(n).get(key(hist(x)));assert(h&&h.count>0,"shuffled inventory positive");positives.push({n,source:s.name,matches:h.count})}
 return {sources:sources.map(s=>({name:s.name,words:s.lengths.length})),sourceManifest:data.map(d=>({path:d.path,sha:d.sha})),sizes,windows,totalWindows:Object.values(windows).reduce((a,b)=>a+b,0),obs:obs.map(x=>({...x,controlRate:x.controlHits/trials})),familyControlRate:family/trials,positives,controlWordCounts:controls.map(x=>x.length)};
}
const data=manifest.map(d=>{const p=d.path==='historical-emerson-self-reliance.txt'?process.argv[2]:d.path;const content=fs.readFileSync(p,'utf8');const sha=crypto.createHash('sha1').update('blob '+Buffer.byteLength(content)+'\0').update(content).digest('hex');if(sha!==d.sha)throw Error('Source mismatch: '+d.path);return {...d,content}});
console.log(JSON.stringify(experiment(data),null,2));
