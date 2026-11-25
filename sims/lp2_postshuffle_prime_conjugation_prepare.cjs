'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sources=[
  [
    "resources/liber-primus/lp2-corpus.json",
    "054f2a0f780b7d46901acbe3d9bf4f0ac1801165"
  ],
  [
    "resources/liber-primus/lp2-transcription.txt",
    "43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7"
  ],
  [
    "resources/external/relikd-solved-gp29-native-v1.json",
    "1b064ef6d85819b7d96adaff31a82d1ec551598f"
  ],
  [
    "resources/control/english_wordfreq_textblob.txt",
    "140e1d22b5f8c45deddd2e8b25549d9d6307d938"
  ],
  [
    "resources/control/gibran_prophet_58585.txt",
    "df260a07d56bf5998d40a6360b6132c35c252d10"
  ],
  [
    "resources/control/emerson_essays_2944.txt",
    "a92be8ba5b3511a003a22ba31523c14397aaa83a"
  ]
];
function prepare(raw){
 const [gp,tr,native,lex,...donors]=raw,G=JSON.parse(gp),N=JSON.parse(native),symbols="0123456789ABCDEFGHIJKLMNOPQRS",idx=new Map(G.runes.map((x,i)=>[x,i])),alpha=new Map(G.translit.map((x,i)=>[x,i]));
 const parse=t=>(t.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(x=>idx.get(x)));
 const all=parse(tr.replace(/[\s/%]/g,"")),C=all.slice(2830,2896);
 if(all.length!==2941||C.length!==66||C.flat().length!==308||C.flat().join()!==G.pages.slice(54,56).flatMap(p=>p.indices).join())throw Error("physical source mismatch");
 const key=w=>w.map(x=>symbols[x]).join(""),dict=new Set();
 function variants(word,fn){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function walk(i,w){if(i===s.length){fn(w);return}for(let n=1;n<=3;n++){let t=s.slice(i,i+n),v=n===3?(t==="ING"?alpha.get("NG"):undefined):alpha.get(t);if(t.length===n&&v!==undefined)walk(i+n,[...w,v])}}walk(0,[])}
 for(const line of lex.split(/\r?\n/)){let m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m)variants(m[1],w=>dict.add(key(w)))}
 for(const s of N.sections)for(const w of parse(s.source_text))dict.add(key(w));
 if(dict.size!==38938)throw Error("dictionary size "+dict.size);
 const plants=[
"H FGO9NA96 ODD43O58 2O9 N4O7LF QS FSKIN S58 N3 937 9OJIN FI1I9G8 7LF 0K1L 53JD4IFFIN 24IF8A96 8SN H1AKN 5O44QA96 J3FG 31G 4AFI 54O55 G8IQ O9Q O64II 0 H3E DOQAL 8O9NF HIN OAJF O5 KIO9AL FOQAL O4I I9F14A96 FGO00 DKOQ 61O4NAO9 7L S42 Q312 7OF8AL JIJ34Q G8Q 93 34A6A9OG34 A0 4I5369AGA39 G8OG JQ SG K396AL 4SDA96 2Q A9GI49OGA39OK FALA96 53DQ HI DOFFA39 H432I4F OJ 7OAGIN IQI 8SG",
"3 IEI51GIN N31HKA96 BO7 3NA31F GJ 5KOFF DMG GO OEI DOFFL ISGIIJL KOЕ D34L IFDI5AOKKQ D14D3FIF 6OL ILO6L 1953JJ39 2A4N 31G 4ION 4I9I7 HA9N KSD 0AH4I A DA9 G4155 734FG 4AD GI4J 7I 93G8AL G37I4 DMG 9OD3KI39 64OFD KSNF A9G4IDAN HI 6MF G33K O1FG4R KOGGI4 HO6 4L JAFFA39O4Q NO D430IFFA39F 6R9G N3 1I JSFKIF 4I53AK O9 JIGOJ34D83FAF IEAFGF FO5I AF G8I4I39 A90O95Q NI 033GAL 2LF OA4".replace("ISGIIJL KOЕ","IFGIIJL KOE")];
 for(let t=0;t<plants.length;t++){const donor=new Set();for(const w of new Set(donors[t].toLowerCase().match(/[a-z]+/g)||[]))variants(w,x=>donor.add(key(x)));const ws=plants[t].split(" ");if(ws.length!==C.length||ws.some((w,i)=>w.length!==C[i].length||!dict.has(w)||!donor.has(w)))throw Error("control mismatch "+t);}
 return {dict:[...dict].sort().join("\n")+"\n",input:[C.map(key).join(" "),...plants].join("\n")+"\n"};
}
const raw=sources.map(([p,s])=>{const b=fs.readFileSync(path.resolve(__dirname,'..',p));if(crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex')!==s)throw Error(p);return b.toString('utf8')});
const out=prepare(raw),dir=process.argv[2]||'prime-conjugation-data';fs.mkdirSync(dir,{recursive:true});for(const [name,body] of Object.entries(out))fs.writeFileSync(path.join(dir,name+'.txt'),body);console.log(JSON.stringify({dictionary:38938,sha256:Object.fromEntries(Object.entries(out).map(([n,b])=>[n,crypto.createHash('sha256').update(b).digest('hex')]))}));
