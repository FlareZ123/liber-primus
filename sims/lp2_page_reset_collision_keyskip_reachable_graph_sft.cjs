'use strict';
// Agent25: exact shared collision-skip prefix feasibility, source-driven GP29.
// Windows Node22 CommonJS; no external dependencies.
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus,transcript,native,ink,raws){
 const assert=(v,m)=>{if(!v)throw Error(m)},mod=x=>(x%29+29)%29;
 const gp=new Map(corpus.runes.map((r,i)=>[r,i])),pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length),C=pages.flatMap(p=>p.indices);
 const words=[],starts=[0];let at=0,w=[],start=0;
 for(const ch of transcript.split("%").slice(0,55).join("%")){
  if(gp.has(ch)){if(!w.length)start=at;w.push(gp.get(ch));at++;}
  else if(ch!=="%"&&ch!=="/"&&!/\s/u.test(ch)){if(w.length){words.push({start,w});w=[];}if(ch==="$"&&starts.at(-1)!==at)starts.push(at);}
 }
 if(w.length)words.push({start,w});
 assert(at===12956&&words.length===2896&&words.flatMap(x=>x.w).every((x,i)=>x===C[i]),"canonical original");
 const token=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),dict=Array.from({length:13},()=>new Map());
 function add(w){if(w.length>=2&&w.length<=12)dict[w.length].set(w.join(","),w);}
 function encode(s,cal){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const out=[];
  for(let i=0;i<s.length;){if(cal&&s.startsWith("ING",i)){out.push(21);i+=3;continue;}if(cal&&s.startsWith("IO",i)){out.push(27);i+=2;continue;}const t=token.find(t=>s.startsWith(t.s,i));assert(t,"token");out.push(t.i);i+=t.s.length;}return out;
 }
 for(const raw of raws)for(const word of raw.match(/[A-Za-z]+/g)||[])for(const cal of [false,true])add(encode(word,cal));
 const nativeWords=native.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(r=>gp.get(r))));nativeWords.forEach(add);
 const nodes=[];function newNode(){nodes.push(Array(29).fill(-1));return nodes.length-1;}const roots=Array(13).fill(-1);
 for(let len=2;len<=12;len++){roots[len]=newNode();for(const word of dict[len].values()){let t=roots[len];for(const v of word){if(nodes[t][v]===-1)nodes[t][v]=newNode();t=nodes[t][v];}}}
 function frame(id,offset,red=[]){
  const c=C.slice(offset,offset+12),whole=words.filter(w=>w.start>=offset&&w.start+w.w.length<=offset+12&&w.w.length>=2&&!red.some(s=>w.start-offset<s.start+s.length&&w.start-offset+w.w.length>s.start));
  const spec=Array(c.length).fill(null);for(const w of whole)for(let j=0;j<w.w.length;j++)spec[w.start-offset+j]={first:j===0,last:j===w.w.length-1,len:w.w.length};
  return {page:id,c,spec,whole:whole.map(w=>[w.start-offset,w.w.length])};
 }
 let base=0;const frames=pages.map(p=>{const offset=base;base+=p.indices.length;return frame(p.page,offset);});
 base=0;const black=pages.map(p=>{const offset=base;base+=p.indices.length;return frame(p.page,offset,ink.pages.find(s=>s.page===p.page)?.red_spans||[]);});
 const sectionStarts=starts.filter(x=>x<at),sections=sectionStarts.map((offset,i)=>frame(i,offset));assert(sectionStarts.length===8,"literal dollar sections");
 // State: [next physical ciphertext position, dictionary prefix node, pending plaintext].
 function put(f,s,p){const [i,t]=s,info=f.spec[i];let next=-1;if(info){next=nodes[info.first?roots[info.len]:t][p];if(next<0)return null;if(info.last)next=-1;}return [i+1,next,-1];}
 function advance(f,states,k,many=false){
  const next=new Map(),store=s=>{if(s)next.set(s.join(","),s);};
  for(const s of states){const [i,t,pending]=s;if(i===f.c.length){store(s);continue;}
   if(pending>=0){if(mod(pending+k)===f.c[i])store(put(f,s,pending));if(many&&mod(pending+k)===f.c[i-1])store(s);continue;}
   store(put(f,s,mod(f.c[i]-k)));if(i>0){const p=mod(f.c[i-1]-k);if(put(f,s,p))store([i,t,p]);}
  }return [...next.values()];
 }
 function states(f,k,many){let S=[[0,-1,-1]];for(const v of k){S=advance(f,S,v,many);if(!S.length)break;}return S;}
 function admits(f,k,many){return states(f,k,many).length>0;}

 function epsilon(f,S){const M=new Map(S.map(s=>[s.join(),s]));for(const s of M.values()){if(s[2]===-1&&f.c[s[0]]===0){const t=put(f,s,0);if(t)M.set(t.join(),t);}}return [...M.values()];}
 function graph(F,hold,cap=30000){F=F.filter(f=>f.whole.length);const close=(f,S)=>hold?epsilon(f,S):S;const sig=S=>S.map(s=>s.map(v=>v.join(",")).sort().join(";")).join("|"),init=F.map(f=>close(f,[[0,-1,-1]])),seen=new Set([sig(init)]),queue=[{S:init,k:[]}],stats={nodes:1,edges:0,duplicates:0,dead:0,maxDepth:0,accept:null,depthCounts:{0:1},selfLoops:0,uniqueSuccessors:0};for(let q=0;q<queue.length;q++){const {S,k}=queue[q];stats.maxDepth=Math.max(stats.maxDepth,k.length);if(S.every((s,j)=>s.some(v=>v[0]===F[j].c.length))){stats.accept=k;break;}let out=0;const old=sig(S);for(let v=0;v<29;v++){const T=[];for(let j=0;j<F.length;j++){const next=close(F[j],advance(F[j],S[j],v,true));if(!next.length)break;T.push(next);}if(T.length!==F.length)continue;out++;stats.edges++;const ns=sig(T);if(seen.has(ns)){stats.duplicates++;if(ns===old)stats.selfLoops++;continue;}if(seen.size>=cap)return {...stats,capped:true};seen.add(ns);queue.push({S:T,k:[...k,v]});stats.nodes++;stats.depthCounts[k.length+1]=(stats.depthCounts[k.length+1]||0)+1;}if(!out)stats.dead++;if(out===1)stats.uniqueSuccessors++;}return {...stats,capped:false,pages:F.map(f=>f.page)};}

 const held=frames.filter(f=>f.page>=40),blackHeld=black.filter(f=>f.page>=40);
 const result={dictTotal:dict.reduce((a,d)=>a+d.size,0),trieNodes:nodes.length,
 late:graph(held,false),lateBlack:graph(blackHeld,false),
 lateWithF:graph(held,true),lateBlackWithF:graph(blackHeld,true),
 earlyWithF:graph(frames.filter(f=>f.page<=39),true),
 earlyBlackWithF:graph(black.filter(f=>f.page<=39),true)};
 const expected={late:354,lateBlack:1731,lateWithF:499,lateBlackWithF:1836,earlyWithF:6,earlyBlackWithF:14};
 for(const [key,n] of Object.entries(expected))assert(result[key].nodes===n&&!result[key].capped&&result[key].accept===null,key+" graph decision");
 assert(result.dictTotal===35700&&result.trieNodes===138138,"frozen lexicon");
 // A native 2+ rune word with nonzero first two runes. Force three
 // consecutive collision retries of its second rune, then a valid draw.
 const P=nativeWords.find(w=>w.length>=2&&w.length<=12&&w[0]&&w[1]&&dict[w.length].has(w.join(",")));
 const k=mod(P[0]-P[1]),K=[0,k,k,k,mod(k+1),...Array(100).fill(1)];
 function makePlant(p,hold,key){
  let j=0,prev=-1,skips=0,maxSkips=0,holds=0;
  const c=p.map(v=>{if(hold&&v===0){holds++;prev=0;return 0;}let a=mod(v+key[j++]),local=0;while(a===prev){if(j>=key.length)throw Error("plant key exhausted");a=mod(v+key[j++]);local++;}skips+=local;maxSkips=Math.max(local,maxSkips);prev=a;return a;});
  const f={page:-1,c,whole:[[0,p.length]],spec:p.map((_,i)=>({first:i===0,last:i===p.length-1,len:p.length}))};
  const close=S=>hold?epsilon(f,S):S;let S=close([[0,-1,-1]]);for(const v of key.slice(0,j))S=close(advance(f,S,v,true));
  assert(S.some(s=>s[0]===p.length),"true plant path");
  return {runes:p.length,c,key:key.slice(0,j),skips,maxSkips,holds,accepting:true};
 }
 // Only the first two runes need the forced three-redraw event. The
 // rest of the key is nonconstant to ensure genuine finite completion.
 let rng=0x3301761;const rand=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;};
 for(let i=5;i<K.length;i++)K[i]=rand()%29;
 const forced=makePlant(P,false,K);assert(forced.maxSkips>=3,"forced triple collision");
 const Pf=nativeWords.find(w=>w.length>=2&&w.length<=12&&w.includes(0)&&dict[w.length].has(w.join(",")));
 const fPlant=makePlant(Pf,true,Array.from({length:100},()=>rand()%29));assert(fPlant.holds>0,"transparent F plant");
 result.controls={forced,fPlant};return result;
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
