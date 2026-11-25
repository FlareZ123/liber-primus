"use strict";
const fs=require("node:fs"),path=require("node:path");
const INPUTS=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/transcriptions/lp2-image-corrected.txt",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/english_wordfreq_textblob.txt"
];
function experiment(raw){
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const gp=JSON.parse(raw[0]), gold=JSON.parse(raw[2]), ix=new Map(gp.runes.map((x,i)=>[x,i])), tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const mod=x=>(x%29+29)%29,id=w=>w.join(",");
 function runeWords(t,sep){const out=[];let w=[],between="";for(const c of t){if(ix.has(c)){if(w.length&&sep.test(between)){out.push(w);w=[]}w.push(ix.get(c));between=""}else between+=c}if(w.length)out.push(w);return out}
 function spell(word,alt=true){const w=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S"),p=[];for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));assert(v,"unknown token "+w);p.push(v.i);j+=v.t.length;}return p;}
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>spell(w))}
 const donors=raw.slice(3,6).map(native),vocab=new Map();for(const d of donors)for(const w of d.slice(0,Math.floor(d.length*.8)))if(w.length<=24)vocab.set(id(w),w);
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))for(const w of runeWords(s.source_text,/[^\u16a0-\u16ff]/u))if(w.length<=24)vocab.set(id(w),w);
 assert(vocab.size===10842,"base vocab "+vocab.size);
 for(const line of raw[6].split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(line);if(m)for(const alt of [false,true]){const w=spell(m[1],alt);if(w.length&&w.length<=24)vocab.set(id(w),w)}}
 for(let x=0;x<29;x++)vocab.set(id([x]),[x]);
 assert(vocab.size===35944,"broad vocab "+vocab.size);

 const alphabet="0123456789abcdefghijklmnopqrs", form=w=>w.map(x=>alphabet[x]).join("");
 const words=[...vocab.values()].filter(w=>w.length>=8&&w.length<=14).map(form).sort();
 const groups=runeWords(raw[1],/[-.&]/u).slice(0,2896),flat=groups.flat(),unknown=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
 assert(flat.length===12956&&id(flat)===id(unknown),"source");
 const original=groups.flatMap((w,g)=>w.length>=8?[g+" "+form(w)]:[]);
 const p56=runeWords(gold.sections.find(s=>s.name==="p56_an_end").source_text,/[^\u16a0-\u16ff]/u);
 const controls=donors.map(d=>d.slice(Math.floor(d.length*.8),Math.floor(d.length*.8)+66).map(form).join(" "));
 controls.push(p56.map(form).join(" "),form(gp.pages.find(p=>p.page===56).indices));
 assert(words.length===16800&&original.length===343,"input counts");
 return {"vocab.txt":words.join("\n")+"\n","original.txt":original.join("\n")+"\n","controls.txt":controls.join("\n")+"\n"};
}
const out=path.resolve(process.argv[2]||"joint-input");
fs.mkdirSync(out,{recursive:true});
for(const [name,body] of Object.entries(experiment(INPUTS.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")))))fs.writeFileSync(path.join(out,name),body);
