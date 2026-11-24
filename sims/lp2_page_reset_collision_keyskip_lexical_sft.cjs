'use strict';
// Agent25: exact shared collision-skip prefix feasibility, source-driven GP29.
// Windows Node22 CommonJS; no external dependencies.
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus,transcript,native,ink,raws) {
 const assert=(v,m)=>{if(!v)throw Error(m)},mod=x=>(x%29+29)%29;
 const gp=new Map(corpus.runes.map((r,i)=>[r,i])),pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length),C=pages.flatMap(p=>p.indices);
 const words=[],starts=[0];let at=0,w=[],start=0;
 for(const ch of transcript.split("%").slice(0,55).join("%")){
  if(gp.has(ch)){if(!w.length)start=at;w.push(gp.get(ch));at++;}
  else if(ch!=="%"&&ch!=="/"&&!/\s/u.test(ch)){
   if(w.length){words.push({start,w});w=[];}
   if(ch==="$"&&starts.at(-1)!==at)starts.push(at);
  }
 }
 if(w.length)words.push({start,w});
 assert(at===12956&&words.length===2896&&words.flatMap(x=>x.w).every((x,i)=>x===C[i]),"source parse");
 const token=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),dict=Array.from({length:13},()=>new Map());
 function add(w){if(w.length>=2&&w.length<=12)dict[w.length].set(w.join(","),w);}
 function encode(s,cal){
  s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const out=[];for(let i=0;i<s.length;){if(cal&&s.startsWith("ING",i)){out.push(21);i+=3;continue;}if(cal&&s.startsWith("IO",i)){out.push(27);i+=2;continue;}
   const t=token.find(t=>s.startsWith(t.s,i));assert(t,"token");out.push(t.i);i+=t.s.length;
  }return out;
 }
 for(const raw of raws)for(const word of raw.match(/[A-Za-z]+/g)||[])for(const cal of [false,true])add(encode(word,cal));
 const nativeWords=native.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(r=>gp.get(r))));
 nativeWords.forEach(add);
 const nodes=[];function newNode(){nodes.push(Array(29).fill(-1));return nodes.length-1;}
 const roots=Array(13).fill(-1);
 for(let len=2;len<=12;len++){
  roots[len]=newNode();
  for(const word of dict[len].values()){let t=roots[len];for(const v of word){if(nodes[t][v]===-1)nodes[t][v]=newNode();t=nodes[t][v];}}
 }
 function frame(id,offset,red=[]){
  const c=C.slice(offset,offset+12),whole=words.filter(w=>w.start>=offset&&w.start+w.w.length<=offset+12&&w.w.length>=2&&!red.some(s=>w.start-offset<s.start+s.length&&w.start-offset+w.w.length>s.start));
  const spec=Array(c.length).fill(null);
  for(const w of whole)for(let j=0;j<w.w.length;j++)spec[w.start-offset+j]={first:j===0,last:j===w.w.length-1,len:w.w.length};
  return {page:id,c,spec,whole:whole.map(w=>[w.start-offset,w.w.length])};
 }
 let base=0;const frames=pages.map(p=>{const offset=base;base+=p.indices.length;return frame(p.page,offset);});
 base=0;const black=pages.map(p=>{const offset=base;base+=p.indices.length;return frame(p.page,offset,ink.pages.find(s=>s.page===p.page)?.red_spans||[]);});
 const sectionStarts=starts.filter(x=>x<at),sections=sectionStarts.map((offset,i)=>frame(i,offset));
 assert(sectionStarts.length===8,"literal dollar sections");
 // State [i,node,pending]: next ciphertext position, current dictionary
 // prefix, or the fixed plaintext of a rejected collision attempt.
 function put(f,s,p){
  const [i,t]=s,info=f.spec[i];let next=-1;
  if(info){next=nodes[info.first?roots[info.len]:t][p];if(next<0)return null;if(info.last)next=-1;}
  return [i+1,next,-1];
 }
 function advance(f,states,k,many=false){
  const next=new Map();const store=s=>{if(s)next.set(s.join(","),s);};
  for(const s of states){
   const [i,t,pending]=s;
   if(i===f.c.length){store(s);continue;}
   if(pending>=0){if(mod(pending+k)===f.c[i])store(put(f,s,pending));if(many&&mod(pending+k)===f.c[i-1])store(s);continue;}
   store(put(f,s,mod(f.c[i]-k)));
   if(i>0){const p=mod(f.c[i-1]-k);if(put(f,s,p))store([i,t,p]);}
  }return [...next.values()];
 }
 function admits(f,k,many){let S=[[0,-1,-1]];for(const v of k){S=advance(f,S,v,many);if(!S.length)return false;}return true;}
 function search(F,depth,many=false,cap=1000000){
  F=F.filter(f=>f.whole.length);
  let cur=[{k:[],s:F.map(()=>[[0,-1,-1]])}],tested=0;const stats=[];
  for(let d=0;d<depth;d++){
   const next=[];let examined=0;
   for(const a of cur)for(let k=0;k<29;k++){
    examined++;tested++;if(tested>cap)return {capped:true,stats,tested,count:null,survivors:[]};
    const S=[];for(let j=0;j<F.length;j++){const ss=advance(F[j],a.s[j],k,many);if(!ss.length)break;S.push(ss);}
    if(S.length===F.length)next.push({k:[...a.k,k],s:S});
   }
   stats.push({digits:d+1,examined,live:next.length});cur=next;if(!cur.length)break;
  }return {capped:false,stats,tested,count:cur.length,survivors:cur.map(x=>x.k).slice(0,30)};
 }
 const training=frames.filter(f=>f.page<=39),held=frames.filter(f=>f.page>=40);
 const full=search(frames,8),train=search(training,8),hold=search(held,8);
 const unlimited={train:search(training,8,true),hold:search(held,8,true)};
 const blackOnly={train:search(black.filter(f=>f.page<=39),8,true),hold:search(black.filter(f=>f.page>=40),8,true)};
 // Independent two-key witness: directly compare the two possible plaintext
 // prefixes with actual dictionary prefixes (no state machine).
 const prefixSets=new Map();
 function prefixExists(len,p){const id=len+":"+p.length;if(!prefixSets.has(id))prefixSets.set(id,new Set([...dict[len].values()].map(w=>w.slice(0,p.length).join(","))));return prefixSets.get(id).has(p.join(","));}
 function valid(f,p){return f.whole.every(([s,n])=>s>=p.length||prefixExists(n,p.slice(s,Math.min(p.length,s+n))));}
 function mask(f){const out=new Uint8Array(841);for(let a=0;a<29;a++)for(let b=0;b<29;b++){
  const p0=mod(f.c[0]-a);
  const ok=valid(f,[p0,mod(f.c[1]-b)])||valid(f,[p0,mod(f.c[0]-b)]);
  assert(ok===admits(f,[a,b],true),"independent two-key check");
  out[a*29+b]=Number(ok);
 }return out;}
 function witness(F){
  let ms=F.filter(f=>f.whole.some(([s])=>s<2)).map(f=>({f,m:mask(f)}));
  const count=xs=>Array.from({length:841},(_,i)=>xs.every(x=>x.m[i])).filter(Boolean).length;
  const all=count(ms);
  if(all===0)for(let i=ms.length-1;i>=0;i--){const test=ms.filter((_,j)=>j!==i);if(count(test)===0)ms=test;}
  return {all,irreducible:all===0?ms.map(x=>({page:x.f.page,first2:x.f.c.slice(0,2),whole:x.f.whole,localPairs:x.m.reduce((a,b)=>a+b,0),remainingIfOmitted:count(ms.filter(y=>y!==x))})):[]};
 }
 const witnesses={training:witness(training),blackTraining:witness(black.filter(f=>f.page<=39))};
 // Literal $ sections are a genuinely different reset hypothesis. Do not
 // select or vary a boundary from ciphertext; test exactly the printed split.
 const sectionReset={starts:sectionStarts,fit:search(sections.slice(0,6),8,true),all:search(sections,8,true)};
 let rng=0x3301761;const rand=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;};
 const donors=Array.from({length:13},(_,i)=>nativeWords.filter(w=>w.length===i)),controls=[];
 for(const [seed,sign] of [[3301,1],[1229,-1]]){
  const N=1595277641n;let x=BigInt(seed)**4n%N;
  const K=Array.from({length:24},()=>{let n=0;for(let i=0;i<5;i++){n=2*n+Number(x&1n);x=x*x%N;}return mod(sign*(n%29));});
  let skips=0,constrainedRunes=0;
  function plant(F){return F.map(f=>{
   const p=Array.from({length:f.c.length},()=>nativeWords[rand()%nativeWords.length][0]);
   for(const [s,n] of f.whole){const d=donors[n].length?donors[n]:[...dict[n].values()];p.splice(s,n,...d[rand()%d.length]);constrainedRunes+=n;}
   let j=0,prev=-1;const c=p.map(v=>{let a=mod(v+K[j++]);if(a===prev){a=mod(v+K[j++]);skips++;}prev=a;return a;});
   let S=[[0,-1,-1]];for(let k=0;k<j;k++)S=advance({...f,c},S,K[k]);assert(S.some(s=>s[0]===c.length),"planted full replay accepted");
   return {...f,c};
  });}
  const P=plant(frames),fit=search(P.filter(f=>f.page<=39),8);
  const correct=fit.survivors.some(k=>k.join()===K.slice(0,8).join());
  const validHeld=fit.survivors.filter(k=>P.filter(f=>f.page>=40).every(f=>admits(f,k,false)));
  assert(fit.count===1&&correct&&validHeld.length===1,"unique key prefix recovered");
  const Q=plant(sections),sectionFit=search(Q.slice(0,6),8,true);
  assert(Q.every(f=>admits(f,K.slice(0,8),true)),"section plant admitted");
  controls.push({seed,sign,key:K.slice(0,8),skips,constrainedRunes,fit,validHeld,sectionFit,sectionTruePrefixAdmitted:true});
 }
 return {source:{runes:at,words:words.length,pages:frames.length,dictCounts:dict.map(d=>d.size),trieNodes:nodes.length,trainingPages:training.filter(f=>f.whole.length).map(f=>f.page),heldoutPages:held.filter(f=>f.whole.length).map(f=>f.page),groups:frames.map(f=>[f.page,f.whole])},full,train,hold,unlimited,blackOnly,witnesses,sectionReset,controls};
}
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/transcriptions/lp2-image-corrected.txt",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/liber-primus/lp2-ink-annotations.json",
  "resources/control/english_wordfreq_textblob.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
];
const d=paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(d[0]),d[1],JSON.parse(d[2]),JSON.parse(d[3]),d.slice(4)),null,2));
