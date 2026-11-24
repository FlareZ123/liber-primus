"use strict";
// Agent4: source-known quotation recovery with arbitrary rank order and predecessor-dependent escape.
// 79 prefix differences; first rune free. Do not evaluate original until controls pass.
const PRIMARY=[
  {
    "name": "Shakespeare",
    "kind": "primary",
    "file": "resources/control/shakespeare_first300k.txt",
    "sha": "94c677ad9dd50771c6670e0c4e4dad9052b46d85"
  },
  {
    "name": "Emerson",
    "kind": "primary",
    "start": "There is no great and no small",
    "file": "resources/control/emerson_essays_2944.txt",
    "sha": "a92be8ba5b3511a003a22ba31523c14397aaa83a"
  },
  {
    "name": "Gibran",
    "kind": "primary",
    "start": "Almustafa,",
    "file": "resources/control/gibran_prophet_58585.txt",
    "sha": "df260a07d56bf5998d40a6360b6132c35c252d10"
  }
];
const MANIFEST=[
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
function core(){
 const Q=29,N=160,B=41,SPLIT=80,mod=x=>(x%Q+Q)%Q;
 const labels=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
 const tok=labels.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),assert=(x,m)=>{if(!x)throw Error(m)};
 /** @param {string} text @param {object} m @param {object|null} oeProfile */
 function parse(text,m,oeProfile=null){
   let t=text;
   if(m.kind==="primary"&&m.start){const a=text.indexOf(m.start),b=text.search(/\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG/i);assert(a>=0&&b>a,m.name+" body");t=text.slice(a,b);}
   if(m.kind==="english"){const st=text.search(/\*\*\*\s*START OF (?:THIS|THE) PROJECT GUTENBERG/i),en=text.search(/\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG/i),a=text.indexOf(m.start,st);let b=m.end?text.indexOf(m.end,a):en;if(!m.end){const endings=[...text.slice(a,en).matchAll(/^End of (?:the )?Project Gutenberg[^\r\n]*/gmi)];if(endings.length)b=a+endings.at(-1).index;}assert(st>=0&&a>st&&b>a&&b<=en,m.name+" body");t=text.slice(a,b);}
   if(m.kind==="oe")t=text.slice(m.lo,m.hi).split(/\r?\n/).filter(l=>/^\s*(\d+\s+)?[a-zþæðŵôûÊêÝýÄäÂâÆæÏïúóéáêëþ]/iu.test(l)&&l.includes("  ")&&!/^\s*[IVXLCDM]+\./.test(l)).join("\n");
   const P=[],bounds=[];let last=0,words=0;const re=m.kind==="oe"?/[\p{L}\p{M}]+/gu:/[A-Za-z]+(?:['’][A-Za-z]+)*/g;
   for(const w of t.matchAll(re)){if(/[.!?]/.test(t.slice(last,w.index))&&P.length)bounds.push(P.length);let s=w[0];if(m.kind==="oe")s=s.normalize("NFD").replace(/\p{M}/gu,"").replace(/[ÐÞðþ]/g,"TH").replace(/[Ææ]/g,"AE").replace(/[Œœ]/g,"OE").replace(/[ƿǷ]/g,"W").replace(/[Ȝȝ]/g,"G");s=s.toUpperCase().replace(/['’]/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");if(m.kind==="english"||m.kind==="primary")s=s.replace(/ING/g,"NG").replace(/IO/g,"IA");const n0=P.length;while(s.length){const x=tok.find(x=>s.startsWith(x.s));assert(x,m.name+" unsupported "+s);P.push(x.i);s=s.slice(x.s.length);}if(P.length>n0)words++;last=w.index+w[0].length;}
   if(m.kind==="oe")assert(oeProfile&&P.map(x=>oeProfile.positiveControlAlphabet[x]).join("")===oeProfile.sourceGpBase29&&words===oeProfile.acceptedSourceWords,"OE pinned tape");
   if(m.kind==="latin")assert(words===m.words,"Latin pinned words "+m.name);
   const b=[...new Set(bounds)],candidates=[];for(let i=0;i<b.length;i++){const start=b[i]-B,end=start+N;if(start<0||end>P.length||(i>0&&b[i-1]>start)||(i+1<b.length&&b[i+1]<end))continue;candidates.push({name:m.name,start,P:P.slice(start,end)});}
   return {name:m.name,runes:P.length,candidates};
 }
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
 function shuffle(n,random){const a=Array.from({length:n},(_,i)=>i);for(let j=n-1;j>0;j--){const k=Math.floor(random()*(j+1));[a[j],a[k]]=[a[k],a[j]];}return a;}
 /** @typedef {{order:number[], delta:number[], marker:number[]}} Key */
 /** @param {number[]} P @param {Key} key */
 function encode(P,key,c0=0,p0=0){const pos=Array(Q);key.order.forEach((v,i)=>pos[v]=i);let c=c0,prev=p0;return P.map(p=>{const e=key.marker[prev],a=pos[p],b=pos[e],d=p===e?0:key.delta[a-Number(a>b)];c=mod(c+d);prev=p;return c;});}
 /** @param {number[]} C @param {Key} key */
 function decode(C,key,c0=0,p0=0){const pos=Array(Q),r=Array(Q);key.order.forEach((v,i)=>pos[v]=i);key.delta.forEach((v,i)=>r[v]=i);let prev=p0,c=c0;return C.map(x=>{const d=mod(x-c),e=key.marker[prev],a=d===0?pos[e]:r[d]+Number(r[d]>=pos[e]),p=key.order[a];prev=p;c=x;return p;});}
 const deltas=(C,P,end=SPLIT)=>Array.from({length:end-1},(_,j)=>[P[j],P[j+1],mod(C[j+1]-C[j])]);
 /** Exact incidence-graph compatibility for all orders and rank bijections, relaxing nonzero marker order inequalities. @param {number[][]} T */
 function graph(T,construct=false){
  const adj=Array.from({length:57},()=>new Set()),mark=Array(Q).fill(-1),forbid=new Int32Array(Q),parent=Array.from({length:57},(_,i)=>i);
  function root(x){while(parent[x]!==x){parent[x]=parent[parent[x]];x=parent[x];}return x;}
  for(const [prev,p,d] of T){if(d===0){if((mark[prev]>=0&&mark[prev]!==p)||(forbid[prev]&(1<<p)))return {ok:false,reason:"zero-marker"};mark[prev]=p;continue;}
   if(mark[prev]===p)return {ok:false,reason:"zero-marker"};forbid[prev]|=1<<p;const a=p,b=28+d;if(adj[a].has(b))continue;
   if(adj[a].size>=2||adj[b].size>=2)return {ok:false,reason:"degree"};const ra=root(a),rb=root(b);if(ra===rb)return {ok:false,reason:"cycle"};parent[ra]=rb;adj[a].add(b);adj[b].add(a);}
  for(let p=0;p<Q;p++)if(forbid[p]===((1<<Q)-1))return {ok:false,reason:"no-marker"};
  if(!construct)return {ok:true};
  const seen=new Set(),pp=[],dd=[],pd=[];
  for(let x=0;x<57;x++){if(seen.has(x)||adj[x].size>1)continue;const path=[];let cur=x,last=-1;while(cur!==undefined){path.push(cur);seen.add(cur);const next=[...adj[cur]].find(y=>y!==last);last=cur;cur=next;}
   const a=path[0]<Q,b=path.at(-1)<Q;if(a&&b)pp.push(path);else if(!a&&!b)dd.push(path);else pd.push(a?path:[...path].reverse());}
  assert(seen.size===57&&pp.length===dd.length+1,"path component balance");const path=[];for(let i=0;i<pp.length;i++){path.push(...pp[i]);if(i<dd.length)path.push(...dd[i]);}for(const p of pd)path.push(...[...p].reverse());
  assert(path.length===57&&path.every((x,i)=>(x<Q)===(i%2===0)),"alternating path");const idx=Array(57);path.forEach((v,i)=>idx[v]=i);assert(adj.every((a,i)=>[...a].every(j=>Math.abs(idx[i]-idx[j])===1)),"incidence construction");
  return {ok:true,order:path.filter(x=>x<Q),delta:path.filter(x=>x>=Q).map(x=>x-28),components:{pp:pp.length,dd:dd.length,pd:pd.length}};
 }
 /** Complete fixed plaintext order feasibility, including every marker inequality. @param {number[][]} T */
 function fixed(T,order=Array.from({length:Q},(_,i)=>i)){
  const pos=Array(Q);order.forEach((x,i)=>pos[x]=i);const masks=Array(Q).fill((1<<28)-1),seen=new Set(),by=Array.from({length:Q},()=>[]),lo=Array(Q).fill(0),hi=Array(Q).fill(28);
  for(const [prev,p,d] of T){const a=pos[p];if(d===0){lo[prev]=Math.max(lo[prev],a);hi[prev]=Math.min(hi[prev],a);if(lo[prev]>hi[prev])return null;continue;}
    const m=(a<28?1<<a:0)|(a>0?1<<(a-1):0);masks[d]&=m;if(!masks[d])return null;seen.add(d);by[d].push([prev,a]);}
  const active=[...seen],assigned=Array(Q).fill(-1);let visits=0;
  function dfs(l,h,used,left){visits++;if(left===0){const d=Array(28).fill(0);for(const x of active)d[assigned[x]]=x;let next=1;for(let r=0;r<28;r++)if(!d[r]){while(seen.has(next))next++;d[r]=next++;}return {order:[...order],delta:d,marker:l.map(x=>order[x]),visits};}
    let best=-1,opts=null;for(const d of active){if(assigned[d]>=0)continue;const choices=[];for(let bits=masks[d]&~used;bits;bits&=bits-1){const r=31-Math.clz32(bits&-bits),ll=l.slice(),hh=h.slice();let ok=true;for(const [prev,a] of by[d]){if(r===a)ll[prev]=Math.max(ll[prev],a+1);else hh[prev]=Math.min(hh[prev],a-1);if(ll[prev]>hh[prev]){ok=false;break;}}if(ok)choices.push({r,ll,hh});}if(!choices.length)return null;if(opts===null||choices.length<opts.length){best=d;opts=choices;if(choices.length===1)break;}}
    for(const {r,ll,hh} of opts){assigned[best]=r;const s=dfs(ll,hh,used|(1<<r),left-1);if(s)return s;assigned[best]=-1;}return null;}
  const key=dfs(lo,hi,0,active.length);
  if(key){const expected=(prev,p)=>{const a=pos[p],e=pos[key.marker[prev]];return a===e?0:key.delta[a-Number(a>e)];};assert(T.every(([a,b,d])=>expected(a,b)===d),"fixed solver witness");}return key;
 }
 function scan(C,sources,mode="graph"){const out=[],reasons={};for(const s of sources)for(const c of s.candidates){const T=deltas(C,c.P),g=graph(T);if(!g.ok){reasons[g.reason]=(reasons[g.reason]||0)+1;continue;}if(mode==="fixed"){const k=fixed(T);if(!k){reasons.fixed=(reasons.fixed||0)+1;continue;}out.push({...c,key:k});}else out.push(c);}return {out,reasons,placements:sources.reduce((n,s)=>n+s.candidates.length,0)};}
 /** Per-position predictive supersets; fixed mode exact marginal feasibility, graph mode relaxed. No suffix ciphertext used. */
 function predict(C,c,mode){const T=deltas(C,c.P),allowed=[];for(let i=SPLIT;i<N;i++){const a=[];for(let d=0;d<Q;d++){const U=[...T,[c.P[i-1],c.P[i],d]];if(mode==="fixed"?!!fixed(U):graph(U).ok)a.push(d);}allowed.push(a);}return allowed;}
 function makeControls(sources){const plants=[];for(let j=0;j<sources.length;j++)for(let h=0;h<2;h++){const s=sources[j],random=rng((0x4a7c9e31^Math.imul(2*j+h+1,0x9e3779b9))>>>0),lo=Math.floor(h*s.runes/2)+N,hi=Math.floor((h+1)*s.runes/2)-N,opts=s.candidates.filter(c=>c.start>=lo&&c.start<hi);assert(opts.length,"control placement "+s.name);const c=opts[Math.floor(random()*opts.length)];
   for(const mode of ["fixed","graph"]){const key={order:mode==="fixed"?Array.from({length:Q},(_,i)=>i):shuffle(Q,random),delta:shuffle(28,random).map(x=>x+1),marker:Array.from({length:Q},()=>Math.floor(random()*Q))};const C=encode(c.P,key,17,19);assert(decode(C,key,17,19).join()===c.P.join(),"plant roundtrip");plants.push({id:`${j}-${h}-${mode}`,mode,name:c.name,start:c.start,C,key});}
   plants.push({id:`${j}-${h}-null`,mode:"null",name:c.name,start:c.start,C:Array.from({length:N},()=>Math.floor(random()*Q))});}return plants;}
 function controls(sources,plants){const rows=[];for(const p of plants){const mode=p.mode==="null"?"graph":p.mode,r=scan(p.C,sources,mode),correct=r.out.length===1&&r.out[0].name===p.name&&r.out[0].start===p.start,row={id:p.id,mode:p.mode,prefixCandidates:r.out.length,correct,sourceCandidates:r.out.map(c=>({name:c.name,start:c.start}))};
   if(correct&&p.mode!=="null"){const c=r.out[0],allowed=predict(p.C,c,p.mode),truth=Array.from({length:N-SPLIT},(_,i)=>mod(p.C[SPLIT+i]-p.C[SPLIT+i-1]));row.contained=allowed.filter((a,i)=>a.includes(truth[i])).length;row.singleton=allowed.filter(a=>a.length===1).length;row.maxBits=allowed.reduce((s,a)=>s+Math.log2(a.length),0);row.fullCompatible=p.mode==="fixed"?!!fixed(deltas(p.C,c.P,N)):graph(deltas(p.C,c.P,N)).ok;row.graphWitness=graph(deltas(p.C,c.P),true).components;}
   rows.push(row);}return rows;}
 function pass(rows){return rows.every(r=>r.mode==="null"?r.prefixCandidates===0:r.correct&&r.contained===80&&r.fullCompatible);}
 function original(gp,sources){const U=gp.pages.filter(p=>p.page<=55).sort((a,b)=>a.page-b.page).flatMap(p=>p.indices);assert(U.length===12956,"LP2 size");const C=U.slice(10279,10439),r=scan(C,sources,"graph");return {placements:r.placements,reasons:r.reasons,prefixCandidates:r.out.map(c=>({name:c.name,start:c.start,fixedCompatible:!!fixed(deltas(C,c.P))})),continuation:r.out.map(c=>{const g=graph(deltas(C,c.P,N));const k=fixed(deltas(C,c.P,N));return {name:c.name,start:c.start,graphCompatible:g.ok,fixedCompatible:!!k};})};}
 return {parse,encode,decode,deltas,graph,fixed,scan,predict,makeControls,controls,pass,original,labels,assert};
}
module.exports={PRIMARY,MANIFEST,core};
if(require.main===module){
 const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto"),root=path.join(__dirname,".."),c=core();
 const read=(file,sha)=>{const b=fs.readFileSync(file);c.assert(crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex")===sha,"source drift "+file);return b.toString("utf8");};
 const primary=PRIMARY.map(m=>c.parse(read(path.join(root,m.file),m.sha),m));const sources=[...primary];const i=process.argv.indexOf("--external-dir");
 if(i>=0){const dir=process.argv[i+1];const oe=JSON.parse(fs.readFileSync(path.join(root,"resources/control/beowulf_oe_gp_profile_corrected.json"),"utf8"));for(const m of MANIFEST)sources.push(c.parse(read(path.join(dir,path.basename(m.file)),m.sha),m,oe));}
 const plants=c.makeControls(primary),rows=c.controls(sources,plants),pass=c.pass(rows);const out={sources:sources.map(s=>({name:s.name,runes:s.runes,placements:s.candidates.length})),rows,pass};
 if(pass&&process.argv.includes("--original"))out.original=c.original(JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8")),sources);
 console.log(JSON.stringify(out,null,2));if(!pass)process.exitCode=1;
}
