'use strict';
// #2605: frozen set difference, original quote [10279,10439), 80/80 split.
// Reuse the English normalizer and punctuation geometry of the earlier
// exact quote joint attack. Non-English frozen registers use their
// already pinned native transliterations, preserving only actual .!?.
const MANIFEST = [
  {
    "name": "The Time Machine",
    "repo": "GITenberg/The-Time-Machine_35",
    "file": "35.txt",
    "sha": "274f8365792e456d976f64578a4b3a71502db45e",
    "start": "The Time Traveller (for so it will be convenient",
    "end": null,
    "kind": "english"
  },
  {
    "name": "The Picture of Dorian Gray",
    "repo": "GITenberg/The-Picture-of-Dorian-Gray_174",
    "file": "174.txt",
    "sha": "e3de9090fb56f2745adfe21bdf015a4e6e942354",
    "start": "The artist is the creator of beautiful things.",
    "end": null,
    "kind": "english"
  },
  {
    "name": "Frankenstein",
    "repo": "GITenberg/Frankenstein_84",
    "file": "84.txt",
    "sha": "176b1be39b6d925277c2d3bf413959a5dae8f095",
    "start": "Letter 1",
    "end": null,
    "kind": "english"
  },
  {
    "name": "The War of the Worlds",
    "repo": "GITenberg/The-War-of-the-Worlds_36",
    "file": "36.txt",
    "sha": "6552c05ab20acc98e6d6930de0821c663e2a8f96",
    "start": "No one would have believed in the last years",
    "end": null,
    "kind": "english"
  },
  {
    "name": "Dr Jekyll and Mr Hyde",
    "repo": "GITenberg/The-Strange-Case-of-Dr.-Jekyll-and-Mr.-Hyde_43",
    "file": "43.txt",
    "sha": "5ee15fcfada406ea1f3a359314ac9bca4a926d50",
    "start": "Mr. Utterson the lawyer",
    "end": null,
    "kind": "english"
  },
  {
    "name": "The Prince",
    "repo": "GITenberg/The-Prince_1232",
    "file": "1232.txt",
    "sha": "505d4f2d8658b0ade4a9c670fc53fbda476c79c0",
    "start": "To the Magnificent Lorenzo Di Piero De' Medici:",
    "end": null,
    "kind": "english"
  },
  {
    "name": "As a Man Thinketh",
    "repo": "GITenberg/As-a-Man-Thinketh_4507",
    "file": "4507.txt",
    "sha": "853d924eda98304cd2662fa8bc77e680598a570d",
    "start": "THIS little volume (the result of meditation and experience)",
    "end": null,
    "kind": "english"
  },
  {
    "name": "Meditations",
    "repo": "GITenberg/Meditations_2680",
    "file": "2680.txt",
    "sha": "cb9f6fa4a0ac4b62ab3d860a26a7730adcd15843",
    "start": "THE FIRST BOOK",
    "end": "\r\nAPPENDIX\r\n",
    "kind": "english"
  },
  {
    "name": "Walden",
    "repo": "GITenberg/Walden-and-On-The-Duty-Of-Civil-Disobedience_205",
    "file": "205.txt",
    "sha": "ef740fbc0f9bf70ce68534ff40f151f597ca580b",
    "start": "When I wrote the following pages",
    "end": null,
    "kind": "english"
  },
  {
    "name": "The Secret Garden",
    "repo": "GITenberg/The-Secret-Garden_17396",
    "file": "17396.txt",
    "sha": "baac5264407fbcd2845d9ba49f0169053e798f5e",
    "start": "When Mary Lennox was sent",
    "end": "\r\nTHE END\r\n",
    "kind": "english"
  },
  {
    "name": "Dracula",
    "repo": "GITenberg/Dracula_345",
    "file": "345.txt",
    "sha": "b6f73c6a78878851adc88db05cf0f945b63853f7",
    "start": "_3 May. Bistritz._",
    "end": "                                THE END",
    "kind": "english"
  },
  {
    "name": "Thus Spake Zarathustra",
    "repo": "GITenberg/Thus-Spake-Zarathustra--A-Book-for-All-and-None_1998",
    "file": "1998.txt",
    "sha": "f7265f12cd1a9f02d0d84a37032c0b06aa2d303e",
    "start": "When Zarathustra was thirty years old",
    "end": "\r\nAPPENDIX.\r\n",
    "kind": "english"
  },
  {
    "name": "The Dhammapada",
    "repo": "GITenberg/Dhammapada-a-Collection-of-Verses--Being-One-of-the-Canonical-Books-of-the-Buddhists_2017",
    "file": "2017.txt",
    "sha": "cabc66525315001cfde2d62902c6c235f0dd54b9",
    "start": "1. All that we are is the result of what we have thought",
    "end": null,
    "kind": "english"
  },
  {
    "name": "Tao Teh King",
    "repo": "GITenberg/The-Tao-Teh-King-or-the-Tao-and-its-Characteristics_216",
    "file": "216.txt",
    "sha": "d8cc99c3cf19a4a34d77e172ca9a2aa89827e802",
    "start": "Ch. 1. 1. The Tao that can be trodden",
    "end": null,
    "kind": "english"
  },
  {
    "name": "The Upanishads",
    "repo": "GITenberg/The-Upanishads_3283",
    "file": "3283.txt",
    "sha": "331fbfb5f9344d7e06b86597033450779c00526e",
    "start": "The Upanishads represent the loftiest heights",
    "end": null,
    "kind": "english"
  },
  {
    "name": "Beyond Good and Evil",
    "repo": "GITenberg/Beyond-Good-and-Evil_4363",
    "file": "4363.txt",
    "sha": "9d09eebd9d29b814d91858572b49abdf0bb805d1",
    "start": "SUPPOSING that Truth is a woman",
    "end": null,
    "kind": "english"
  },
  {
    "name": "The Book of Tea",
    "repo": "GITenberg/The-Book-of-Tea_769",
    "file": "769.txt",
    "sha": "fd1545103600f8f8e18d4ced550106767be891fb",
    "start": "Tea began as a medicine",
    "end": null,
    "kind": "english"
  },
  {
    "name": "The Kybalion",
    "repo": "GITenberg/The-KybalionA-Study-of-The-Hermetic-Philosophy-of-Ancient-Egypt-and-Greece_14209",
    "file": "14209.txt",
    "sha": "04b68061063bd61a0f7192c48d2dfd9c60370bcf",
    "start": "We take great pleasure in presenting",
    "end": null,
    "kind": "english"
  },
  {
    "name": "Paradise Lost",
    "repo": "GITenberg/Paradise-Lost_26",
    "file": "26.txt",
    "sha": "e792b429a8533f2696136af342bdaee87698e035",
    "start": "Of Man's first disobedience, and the fruit",
    "end": null,
    "kind": "english"
  },
  {
    "name": "Marriage of Heaven and Hell",
    "repo": "GITenberg/The-Marriage-of-Heaven-and-Hell_45315",
    "file": "45315.txt",
    "sha": "44149cc32fa8a46501a95059283526a8a3429705",
    "start": "Rintrah roars and shakes his fires",
    "end": null,
    "kind": "english"
  },
  {
    "name": "Mabinogion",
    "repo": "GITenberg/The-Mabinogion_5160",
    "file": "5160-0.txt",
    "sha": "fd9db1c7bc90e11d41433b7cc2ec3b7e1ccb0cd7",
    "start": "WHILST engaged on the Translations",
    "end": null,
    "kind": "english"
  },
  {
    "name": "Songs of Innocence and Experience",
    "repo": "GITenberg/Songs-of-Innocence-and-Songs-of-Experience_1934",
    "file": "1934-0.txt",
    "sha": "6d379eb7000a853d7cf2652e84a503ee8323131d",
    "start": "Piping down the valleys wild",
    "end": null,
    "kind": "english"
  },
  {
    "name": "Latin Vulgate corpus/luc_1.txt",
    "repo": "computationalstylistics/NT_Vulgate",
    "file": "corpus/luc_1.txt",
    "sha": "6910bf1b9b97a72f570f91e705daf0a970291423",
    "kind": "latin",
    "words": 6517
  },
  {
    "name": "Latin Vulgate corpus/luc_2.txt",
    "repo": "computationalstylistics/NT_Vulgate",
    "file": "corpus/luc_2.txt",
    "sha": "a131ce50196cec56d8faeff517f733cf4a9b5e8b",
    "kind": "latin",
    "words": 5877
  },
  {
    "name": "Latin Vulgate corpus/io_1.txt",
    "repo": "computationalstylistics/NT_Vulgate",
    "file": "corpus/io_1.txt",
    "sha": "2de06e9e902c98817e1f220ec8bd1837f54cad2c",
    "kind": "latin",
    "words": 5167
  },
  {
    "name": "Latin Vulgate corpus/io_2.txt",
    "repo": "computationalstylistics/NT_Vulgate",
    "file": "corpus/io_2.txt",
    "sha": "dba1ac1e0c5128465f5f538894c7eec2f3fd0fc1",
    "kind": "latin",
    "words": 4981
  },
  {
    "name": "Latin Vulgate corpus/act_1.txt",
    "repo": "computationalstylistics/NT_Vulgate",
    "file": "corpus/act_1.txt",
    "sha": "ee0fd23713e0235062d02f647d699eedb2d831da",
    "kind": "latin",
    "words": 5531
  },
  {
    "name": "Latin Vulgate corpus/act_2.txt",
    "repo": "computationalstylistics/NT_Vulgate",
    "file": "corpus/act_2.txt",
    "sha": "8cb031fcb2ab6c63c1d70770228754479d508c78",
    "kind": "latin",
    "words": 5253
  },
  {
    "name": "Latin Vulgate corpus/rom_1.txt",
    "repo": "computationalstylistics/NT_Vulgate",
    "file": "corpus/rom_1.txt",
    "sha": "8c51f58eb08a6906e4cdeabdf178fb5489157a63",
    "kind": "latin",
    "words": 3434
  },
  {
    "name": "Latin Vulgate corpus/rom_2.txt",
    "repo": "computationalstylistics/NT_Vulgate",
    "file": "corpus/rom_2.txt",
    "sha": "de4e4641104b8f9e254939b09b35e86df39833a6",
    "kind": "latin",
    "words": 3075
  },
  {
    "name": "Beowulf Old English",
    "repo": "GITenberg/I.-Be-wulf--an-Anglo-Saxon-poem.-II.-The-fight-at-Finnsburh--a-fragment._9700",
    "file": "9700-0.txt",
    "sha": "6f6aca13cd499779c2db780ad00f24b3bc2a288f",
    "kind": "oe",
    "lo": 21272,
    "hi": 169053
  }
];
const N=160, B=41, SPLIT=80;
const assert=(v,m)=>{if(!v)throw Error(m)};
function body(raw,m){
 if(m.kind==='latin')return raw;
 if(m.kind==='oe')return raw.slice(m.lo,m.hi).split(/\r?\n/).filter(l=>/^\s*(\d+\s+)?[a-zþæðŵôûÊêÝýÄäÂâÆæÏïúóéáêëþ]/iu.test(l)&&l.includes('  ')&&!/^\s*[IVXLCDM]+\./.test(l)).join('\n');
 const st=raw.search(/\*\*\*\s*START OF (?:THIS|THE) PROJECT GUTENBERG/i);
 const en=raw.search(/\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG/i);
 const a=raw.indexOf(m.start,st);
 let b=m.end?raw.indexOf(m.end,a):en;
 if(!m.end){const endings=[...raw.slice(a,en).matchAll(/^End of (?:the )?Project Gutenberg[^\r\n]*/gmi)];if(endings.length)b=a+endings.at(-1).index;}
 assert(st>=0&&a>st&&b>a&&b<=en,m.name+' body markers');
 return raw.slice(a,b);
}
function parse(raw,m,gp,oeProfile){
 const t=body(raw,m),tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const P=[],bounds=[];let last=0,words=0;
 const re=m.kind==='oe'?/[\p{L}\p{M}]+/gu:/[A-Za-z]+(?:['’][A-Za-z]+)*/g;
 for(const w of t.matchAll(re)){
  if(/[.!?]/.test(t.slice(last,w.index))&&P.length)bounds.push(P.length);
  let s=w[0];if(m.kind==='oe')s=s.normalize('NFD').replace(/\p{M}/gu,'').replace(/[ÐÞðþ]/g,'TH').replace(/[Ææ]/g,'AE').replace(/[Œœ]/g,'OE').replace(/[ƿǷ]/g,'W').replace(/[Ȝȝ]/g,'G');
  s=s.toUpperCase().replace(/['’]/g,'').replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
  if(m.kind==='english')s=s.replace(/ING/g,'NG').replace(/IO/g,'IA');
  const n0=P.length;
  while(s.length){const x=tok.find(x=>s.startsWith(x.s));assert(x,m.name+' unsupported '+s);P.push(x.i);s=s.slice(x.s.length);}
  if(P.length>n0)words++;
  last=w.index+w[0].length;
 }
 if(m.kind==='oe'){
   const exact=P.map(x=>oeProfile.positiveControlAlphabet[x]).join('');
   assert(exact===oeProfile.sourceGpBase29&&words===oeProfile.acceptedSourceWords,'OE pinned tape');
 }
 if(m.kind==='latin')assert(words===m.words,'Latin pinned words '+m.name);
 const b=[...new Set(bounds)],candidates=[];
 for(let i=0;i<b.length;i++){
  const start=b[i]-B,end=start+N;
  if(start<0||end>P.length||(i>0&&b[i-1]>start)||(i+1<b.length&&b[i+1]<end))continue;
  candidates.push({name:m.name,start,P:P.slice(start,end)});
 }
 return {name:m.name,kind:m.kind,words,runes:P.length,stops:b.length,candidates};
}
function encrypt(P,K){let j=0;return P.map(v=>v===0?0:(v+K[j++%K.length])%29);}
function scan(C,all){
 const out=[];let fCompatible=0;
 for(const c of all){
  const d=[];let ok=true;
  for(let i=0;i<SPLIT;i++){
   if(c.P[i]===0){if(C[i]!==0){ok=false;break;}}
   else d.push((C[i]-c.P[i]+29)%29);
  }
  if(!ok)continue;fCompatible++;
  for(const q of [8,13]){
   if(d.length<2*q||d.some((x,i)=>x!==d[i%q]))continue;
   const K=d.slice(0,q),full=encrypt(c.P,K);
   out.push({name:c.name,start:c.start,q,K,full});
  }
 }
 const distinct=[...new Map(out.map(o=>[o.name+':'+o.start+':'+o.full.join(','),o])).values()];
 return {fCompatible,prefixCandidates:out.length,distinctPredictions:distinct.length,selected:distinct.length===1?distinct[0]:null};
}
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function calibrate(sources){
 const all=sources.flatMap(s=>s.candidates),controls=[],nulls=[];
 const names=['The Time Machine','The Book of Tea','Beowulf Old English'];
 for(let j=0;j<names.length;j++){
  const s=sources.find(s=>s.name===names[j]);assert(s,names[j]);
  // One fixed eligible placement in each of two disjoint halves.
  for(let h=0;h<2;h++){
   const options=s.candidates.filter(c=>c.start>=Math.floor(h*s.runes/2)+N&&c.start+N<Math.floor((h+1)*s.runes/2));assert(options.length,'fresh source windows '+s.name);
   const random=rng((0x726bfe19^Math.imul(2*j+h+1,0x9e3779b9))>>>0);
   const c=options[Math.floor(random()*options.length)],q=h?13:8,K=Array.from({length:q},()=>Math.floor(random()*29)),C=encrypt(c.P,K);
   const r=scan(C.slice(0,SPLIT),all),sel=r.selected;
   controls.push({source:s.name,start:c.start,q,keyExact:!!sel&&sel.K.join()===K.join(),correct:!!sel&&sel.name===c.name&&sel.start===c.start&&sel.q===q&&sel.full.slice(SPLIT).join()===C.slice(SPLIT).join(),predicted:sel?sel.full.slice(SPLIT).filter((x,i)=>x===C[SPLIT+i]).length:0,prefixCandidates:r.prefixCandidates});
   const pad=Array.from({length:N},()=>Math.floor(random()*29)),n=scan(encrypt(c.P,pad).slice(0,SPLIT),all);nulls.push({source:s.name,q,prefixCandidates:n.prefixCandidates});
  }
 }
 const pass=controls.every(c=>c.correct&&c.keyExact)&&nulls.every(c=>c.prefixCandidates===0);
 return {pass,controls,nulls,totalCandidates:all.length};
}
function original(sources,gp,gate){
 assert(gate.pass,'control gate failed');
 const U=gp.pages.filter(p=>p.page<=55).sort((a,b)=>a.page-b.page).flatMap(p=>p.indices);assert(U.length===12956,'corpus length');
 const C=U.slice(10279,10439),r=scan(C.slice(0,SPLIT),sources.flatMap(s=>s.candidates));
 return {...r,continuationExact:!!r.selected&&r.selected.full.slice(SPLIT).join()===C.slice(SPLIT).join()};
}
module.exports={MANIFEST,parse,scan,calibrate,original};
if(require.main===module){
 const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),root=path.join(__dirname,'..');
 const folder=process.argv[2];assert(folder,'provide frozen source directory, filenames as in MANIFEST');
 const gp=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
 const oe=JSON.parse(fs.readFileSync(path.join(root,'resources/control/beowulf_oe_gp_profile_corrected.json'),'utf8'));
 const sources=MANIFEST.map(m=>{
  const raw=fs.readFileSync(path.join(folder,path.basename(m.file)));
  assert(crypto.createHash('sha1').update('blob '+raw.length+'\0').update(raw).digest('hex')===m.sha,'source drift '+m.name);
  return parse(raw.toString('utf8'),m,gp,oe);
 });
 const gate=calibrate(sources);
 console.log(JSON.stringify({sources:sources.map(({candidates,...s})=>({...s,candidates:candidates.length})),gate,original:gate.pass&&process.argv.includes('--original')?original(sources,gp,gate):null},null,2));
}
