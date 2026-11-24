"use strict";
/**
 * Joint word-trie beam inversion of the source-fixed p27/p55 six-rune seam.
 * Both plaintext boundary tapes are latent. Word unigram probabilities and
 * interpolated word transitions constrain simultaneous paired text recovery.
 * No output is evidence of decipherment without blind native controls.
 * Node 22 / CommonJS, no dependencies.
 */
const fs=require("node:fs"),path=require("node:path");
const assert=require("node:assert/strict");
function run(corpus,lexicon,source,beamWidth=1024,controlLimit=4,original=true){
 const R=29,idx=new Map(corpus.translit.map((t,i)=>[t,i])),mod=x=>(x+R)%R;
 /** @param {string} word @returns {number[]} */
 function encode(word){
  const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
  const out=[];for(let i=0;i<s.length;i++){const p=s.slice(i,i+2);if(idx.has(p)){out.push(idx.get(p));i++;}else if(idx.has(s[i]))out.push(idx.get(s[i]));}return out;
 }
 const toKey=w=>w.join(",");
 const words=new Map(),wordRunes=[],weight=[];
 function add(a,w){
  if(!a.length)return -1;const k=toKey(a);let id=words.get(k);
  if(id===undefined){id=weight.length;words.set(k,id);wordRunes.push(a);weight.push(0);}
  weight[id]+=w;return id;
 }
 for(const line of lexicon.split(/\r?\n/)){const m=line.match(/^([a-z]+)\s+(\d+)$/);if(m)add(encode(m[1]),Number(m[2]));}
 const sourceWords=source.match(/[A-Za-z]+/g).map(encode).filter(a=>a.length);
 const trainEnd=Math.floor(sourceWords.length*.67);
 const pairs=new Map(),totals=new Map();
 let prev=-1;
 for(let i=0;i<trainEnd;i++){
  const id=add(sourceWords[i],1);
  if(prev>=0){let row=pairs.get(prev);if(!row)pairs.set(prev,row=new Map());row.set(id,(row.get(id)||0)+1);totals.set(prev,(totals.get(prev)||0)+1);}
  prev=id;
 }
 const total=weight.reduce((a,b)=>a+b,0);
 const nodes=[];
 function node(){const n={id:nodes.length,mass:0,end:0,word:-1,ch:new Map(),out:null};nodes.push(n);return n;}
 const root=node(),start=node();
 function insert(rt,a,w,id){
  let n=rt;n.mass+=w;
  for(const c of a){if(!n.ch.has(c))n.ch.set(c,node());n=n.ch.get(c);n.mass+=w;}
  n.end+=w;if(id>=0)n.word=id;
 }
 for(let i=0;i<wordRunes.length;i++){
  const a=wordRunes[i],w=weight[i];
  insert(root,a,w,i);
  // At an arbitrary rune offset, the first word can begin before the window.
  for(let j=0;j<a.length;j++)insert(start,a.slice(j),w,-1);
 }
 const rootChildren=[...root.ch.entries()];
 // Sparse outgoing rune transitions: continue current word or end it and
 // start a new one. The boundary edge charges the exact unigram word mass.
 for(const n of nodes){
  const out=Array.from({length:R},()=>[]);
  for(const [c,m] of n.ch)out[c].push({node:m.id,log:Math.log(m.mass/n.mass),closed:-2});
  if(n.end)for(const [c,m] of rootChildren)out[c].push({node:m.id,log:Math.log(n.end/n.mass)+Math.log(m.mass/root.mass),closed:n.word});
  n.out=out;
 }
 function bonus(prev,id){
  if(prev<0||id<0)return 0;
  const denom=totals.get(prev)||0;if(!denom)return 0;
  const c=pairs.get(prev)?.get(id)||0,p=weight[id]/total;
  // Fixed interpolated conditional word probability.
  return Math.log((c+20*p)/(denom+20)/p);
 }
 const bonusCache=new Map();
 function close(prev,id){
  if(id===-2)return [prev,0];if(id===-1)return [-1,0];
  const k=prev*weight.length+id;let v=bonusCache.get(k);
  if(v===undefined){v=bonus(prev,id);bonusCache.set(k,v);}
  return [id,v];
 }
 /** @param {number[]} d @param {number} width */
 function solve(d,width){
  let beam=[{a:start.id,b:start.id,pa:-1,pb:-1,score:0,back:null,x:-1,y:-1,ba:false,bb:false}];
  for(let i=0;i<d.length;i++){
   const best=new Map();
   for(const s of beam){
    const oa=nodes[s.a].out,ob=nodes[s.b].out;
    for(let x=0;x<R;x++){
     const y=mod(x-d[i]),aa=oa[x],bb=ob[y];
     if(!aa.length||!bb.length)continue;
     for(const a of aa){const [pa,sa]=close(s.pa,a.closed);
      for(const b of bb){const [pb,sb]=close(s.pb,b.closed);
       const score=s.score+a.log+b.log+sa+sb;
       const k=a.node+","+b.node+","+pa+","+pb;
       const old=best.get(k);
       if(!old||score>old.score)best.set(k,{a:a.node,b:b.node,pa,pb,score,back:s,x,y,ba:a.closed!==-2,bb:b.closed!==-2});
      }
     }
    }
   }
   beam=[...best.values()].sort((a,b)=>b.score-a.score).slice(0,width);
   if(!beam.length)return {score:-Infinity,first:[],second:[],plain1:"",plain2:""};
  }
  let s=beam[0],a=[],b=[],ta=[],tb=[];
  const score=s.score;
  while(s.back){a.push(s.x);b.push(s.y);ta.push((s.ba?" ":"")+corpus.translit[s.x]);tb.push((s.bb?" ":"")+corpus.translit[s.y]);s=s.back;}
  return {score,first:a.reverse(),second:b.reverse(),plain1:ta.reverse().join(""),plain2:tb.reverse().join("")};
 }
 const differential=(a,b)=>a.map((x,i)=>mod(x-b[i]));
 const held=sourceWords.slice(trainEnd).flat(),suffixes=new Map(),used=[],plants=[];
 // Natural held-out passages with identical six-rune suffix, independently
 // of LP2. No artificial suffixes or injected known plaintext.
 for(let end=1000;end<held.length-100&&plants.length<controlLimit;end++){
  const suffix=toKey(held.slice(end-5,end+1)),earlier=suffixes.get(suffix);
  if(earlier===undefined){suffixes.set(suffix,end);continue;}
  if(end-earlier<1600||used.some(e=>Math.abs(e-earlier)<150||Math.abs(e-end)<150))continue;
  const a=held.slice(earlier-75,earlier+1),b=held.slice(end-75,end+1);
  const res=solve(differential(a,b),beamWidth);
  plants.push({earlier,end,score:res.score,correctA:res.first.filter((x,i)=>x===a[i]).length,correctB:res.second.filter((x,i)=>x===b[i]).length,decodedA:res.plain1,decodedB:res.plain2,actualA:a.map(x=>corpus.translit[x]).join(""),actualB:b.map(x=>corpus.translit[x]).join("")});
  used.push(earlier,end);
 }
 const result={beamWidth,wordTypes:weight.length,trieNodes:nodes.length,trainingWords:trainEnd,heldoutRunes:held.length,plants};
 if(original){
  const section=corpus.pages.filter(p=>p.page>=27&&p.page<=32).flatMap(p=>p.indices);
  const p55=corpus.pages.find(p=>p.page===55).indices;
  const window=section.slice(-42).concat(section.slice(0,34));
  assert.equal(section.length,1433);assert.equal(p55.length,76);assert.deepEqual(window.slice(-6),p55.slice(-6));
  const real=solve(differential(window,p55),beamWidth);
  if(real.first.length){const pad=real.first.map((x,i)=>mod(window[i]-x));assert.deepEqual(real.second.map((x,i)=>mod(x+pad[i])),p55);}
  result.original={score:real.score,plain1:real.plain1,plain2:real.plain2};
 }
 return result;
}
module.exports={run};
if(require.main===module){
 const root=path.join(__dirname,"..");
 const read=p=>fs.readFileSync(path.join(root,p),"utf8");
 const result=run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/control/english_wordfreq_textblob.txt"),read("resources/control/shakespeare_first300k.txt"),Number(process.argv[2]||1024),Number(process.argv[3]||4),process.argv[4]!=="plants");
 console.log(JSON.stringify(result,null,2));
}
