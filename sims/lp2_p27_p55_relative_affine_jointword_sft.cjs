"use strict";
/** Agent14 relative affine p27/p55 seam inverse. Derived from lp2_p27_p55_jointword_beam_recovery_sft.cjs, all 28 scales, coarse then refine four. */
const fs=require("node:fs"),path=require("node:path");
function run(corpus,lexicon,source,coarse=128,fine=1024){
 const R=29,idx=new Map(corpus.translit.map((t,i)=>[t,i])),mod=x=>(x%R+R)%R;
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
 function solve(d,width,beta){
  const inv=Array.from({length:28},(_,i)=>i+1).find(x=>mod(x*beta)===1);
  const maps=d.map(delta=>Array.from({length:R},(_,x)=>mod((x-delta)*inv)));
  let beam=[{a:start.id,b:start.id,pa:-1,pb:-1,score:0,back:null,x:-1,y:-1,ba:false,bb:false}];
  for(let i=0;i<d.length;i++){
   const best=new Map();
   for(const s of beam){
    const oa=nodes[s.a].out,ob=nodes[s.b].out;
    for(let x=0;x<R;x++){
     const y=maps[i][x],aa=oa[x],bb=ob[y];
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

 /** @param {number[]} ca @param {number[]} cb */
 function fit(ca,cb){
  const d=ca.map((x,i)=>mod(x-cb[i]));
  const ranked=Array.from({length:28},(_,i)=>({beta:i+1,score:solve(d,coarse,i+1).score})).sort((a,b)=>b.score-a.score);
  const refined=ranked.slice(0,4).map(r=>({...solve(d,fine,r.beta),beta:r.beta})).sort((a,b)=>b.score-a.score);
  const best=refined[0];if(best.first.length!==ca.length)throw Error("empty inverse");
  const pad=ca.map((x,i)=>mod(x-best.first[i]));
  if(!cb.every((v,i)=>mod(best.beta*best.second[i]+pad[i])===v))throw Error("replay");
  return {...best,coarseRank:ranked.map(r=>r.beta),coarseScores:ranked.map(r=>r.score),fineScores:refined.map(r=>({beta:r.beta,score:r.score})),replay:ca.length};
 }
 const held=sourceWords.slice(trainEnd).flat(),suffix=new Map(),used=[],plants=[];
 for(let e=76;e<=held.length;e++){const k=toKey(held.slice(e-6,e));if(!suffix.has(k))suffix.set(k,[]);suffix.get(k).push(e);}
 for(const beta of [1,2,7,13,28]){
  let pair=null;
  for(let e=76;e<=held.length&&!pair;e++){
   if(used.some(u=>Math.abs(u-e)<150))continue;
   const k=toKey(held.slice(e-6,e).map(v=>mod(v*beta)));
   const f=suffix.get(k)?.find(q=>Math.abs(q-e)>=1600&&!used.some(u=>Math.abs(u-q)<150));if(f)pair=[f,e];
  }
  if(!pair){plants.push({trueBeta:beta,missing:true});continue;}
  used.push(...pair);
  const a=held.slice(pair[0]-76,pair[0]),b=held.slice(pair[1]-76,pair[1]),pad=a.map((_,i)=>mod(7*i*i+11*i+beta));
  const ca=a.map((x,i)=>mod(x+pad[i])),cb=b.map((x,i)=>mod(beta*x+pad[i]));
  if(toKey(ca.slice(-6))!==toKey(cb.slice(-6)))throw Error("plant seam");
  const r=fit(ca,cb);
  plants.push({trueBeta:beta,positions:pair,beta:r.beta,score:r.score,trueCoarseRank:1+r.coarseRank.indexOf(beta),correctA:r.first.filter((x,i)=>x===a[i]).length,correctB:r.second.filter((x,i)=>x===b[i]).length,decodedA:r.plain1,decodedB:r.plain2,fineScores:r.fineScores});
 }
 const section=corpus.pages.filter(p=>p.page>=27&&p.page<=32).flatMap(p=>p.indices),p55=corpus.pages[55].indices,window=section.slice(-42).concat(section.slice(0,34));
 if(section.length!==1433||p55.length!==76||toKey(window.slice(-6))!==toKey(p55.slice(-6)))throw Error("original seam");
 const r=fit(window,p55);
 const original={beta:r.beta,score:r.score,plain1:r.plain1,plain2:r.plain2,coarseRank:r.coarseRank,coarseScores:r.coarseScores,fineScores:r.fineScores,replay:r.replay};
 return {coarse,fine,wordTypes:weight.length,trieNodes:nodes.length,trainingWords:trainEnd,heldoutRunes:held.length,plants,original};
}

module.exports={run};
if(require.main===module){const root=path.join(__dirname,"..");const read=p=>fs.readFileSync(path.join(root,p),"utf8");console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/control/english_wordfreq_textblob.txt"),read("resources/control/shakespeare_first300k.txt")),null,2));}
