'use strict';
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function experiment(corpus,transcript,ink,dictText,reference){
 const assert=(b,s)=>{if(!b)throw Error(s)};
 const mod=x=>(x%29+29)%29, period=8;
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gp(word){let s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA"),out=[];for(let i=0;i<s.length;){const t=tokens.find(t=>s.startsWith(t.s,i));if(!t)return null;out.push(t.i);i+=t.s.length;}return out;}
 const dict=new Map(),bylen=new Map(),uni=Array(29).fill(1),bi=Array.from({length:29},()=>Array(29).fill(1));
 for(const line of dictText.split(/\r?\n/)){const m=line.match(/^([a-z]+)\s+(\d+)$/i);if(!m)continue;const w=gp(m[1]);if(!w?.length)continue;const key=w.join(","),count=Number(m[2]);dict.set(key,(dict.get(key)||0)+count);for(let i=0;i<w.length;i++){uni[w[i]]+=count;if(i)bi[w[i-1]][w[i]]+=count;}}
 for(const [s,count] of dict){const w=s.split(",").map(Number);if(w.includes(0)||w.length<period)continue;const pool=bylen.get(w.length)||[];pool.push(w);bylen.set(w.length,pool);}
 const logs=a=>{const sum=a.reduce((x,y)=>x+y,0);return a.map(x=>Math.log(x/sum));};const u=logs(uni),b=bi.map(logs);
 const rm=new Map(corpus.runes.map((r,i)=>[r,i]));let words=[],w=[];
 for(const ch of transcript.split("%").slice(3,8).join("").replace(/[\/\r\n]/g,"")){if(rm.has(ch))w.push(rm.get(ch));else if(w.length){words.push(w);w=[];}}if(w.length)words.push(w);
 const flat=words.flat(),expected=corpus.pages.slice(3,8).flatMap(p=>p.indices);
 assert(flat.length===expected.length&&flat.every((x,i)=>x===expected[i]),"transcript mismatch");
 let at=0;const spans=words.map(w=>{const s={at,w};at+=w.length;return s;});
 const ranges=[[122,812],[823,1131]];
 assert(ink.pages.find(p=>p.page===3).red_spans.some(s=>s.start===119&&s.length===3),"p3 rubric");
 assert(ink.pages.find(p=>p.page===6).red_spans.some(s=>s.start===71&&s.length===11),"p6 rubric");
 function source(lo,hi){const z=spans.filter(x=>x.at>=lo&&x.at+x.w.length<=hi).map(x=>x.w);assert(z.flat().length===hi-lo,"word boundary mismatch");return z;}
 const original=ranges.map(([a,b])=>source(a,b));
 function trainingCount(ws){let n=0,i=0;while(i<ws.length&&n+ws[i].length<=140)n+=ws[i++].length;return i;}
 function anchor(ws){let offset=0,zeros=0;for(let i=0;i<ws.length;i++){const w=ws[i];if(w.length>=period&&!w.includes(0))return{word:w,offset,zeros,index:i};offset+=w.length;zeros+=w.filter(x=>x===0).length;}return null;}
 function keys(ws){const a=anchor(ws);if(!a)return{anchor:null,keys:new Set()};const out=new Set();for(const p of bylen.get(a.word.length)||[])for(let h=0;h<=a.zeros;h++){const k=Array(period).fill(-1);let ok=true;for(let j=0;j<p.length;j++){
 const phase=((a.offset-h+j)%period+period)%period,v=mod(a.word[j]-p[j]);if(k[phase]>=0&&k[phase]!==v){ok=false;break;}k[phase]=v;}
 if(ok)out.add(k.join(","));}return{anchor:{offset:a.offset,zeros:a.zeros,index:a.index,length:a.word.length},keys:out};}
 function wordPaths(cipher,k,phase){let states=[{p:[],phase}];for(const c of cipher){const next=[];for(const s of states){if(c===0)next.push({p:[...s.p,0],phase:s.phase});const v=mod(c-k[s.phase]);if(v!==0)next.push({p:[...s.p,v],phase:(s.phase+1)%period});}states=next;}return states;}
 function score(w){let s=u[w[0]];for(let i=1;i<w.length;i++)s+=b[w[i-1]][w[i]];return s+(dict.has(w.join(","))?4*w.length:0);}
 function decode(ws,k,phase=0){let states=new Map([[phase,{score:0,words:[]}]]);for(const w of ws){const next=new Map();for(const [ph,s] of states)for(const v of wordPaths(w,k,ph)){const sc=s.score+score(v.p);if(!next.has(v.phase)||next.get(v.phase).score<sc)next.set(v.phase,{score:sc,words:[...s.words,v.p]});}states=next;}if(!states.size)return null;const [end,best]=[...states].sort((a,b)=>b[1].score-a[1].score)[0];return{...best,phase:end};}
 function enc(ws,k,phase=0){const words=ws.map(w=>w.map(p=>{if(p===0)return 0;const c=mod(p+k[phase]);phase=(phase+1)%period;return c;}));return{words,phase};}
 const render=ws=>ws.map(w=>w.map(i=>corpus.translit[i]).join("")).join(" ");
 function test(ws,truth=null,k0=null,tolerance=0){
 const ns=ws.map(trainingCount),train=ws.map((s,i)=>s.slice(0,ns[i])),hold=ws.map((s,i)=>s.slice(ns[i]));const a=train.map(keys);
 let joint=[...a[0].keys].filter(k=>a[1].keys.has(k));const exactJoint=joint.length;
 if(tolerance===1){const left=[...a[0].keys].map(s=>s.split(",").map(Number)),right=[...a[1].keys].map(s=>s.split(",").map(Number)),expanded=new Set(joint);
  // The intersection of the radius-one Hamming balls around both anchor-derived keys.
  for(const l of left)for(const r of right){let d=0,x=-1,y=-1;for(let j=0;j<period;j++)if(l[j]!==r[j]){if(++d===1)x=j;else if(d===2)y=j;else break;}
   if(d===0){for(let j=0;j<period;j++)for(let v=0;v<29;v++){const k=l.slice();k[j]=v;expanded.add(k.join(","));}}
   if(d===1){for(let v=0;v<29;v++){const k=l.slice();k[x]=v;expanded.add(k.join(","));}}
   if(d===2){for(const j of [x,y]){const k=l.slice();k[j]=r[j];expanded.add(k.join(","));}}
  }
  joint=[...expanded];
 }let best=null,viable=0;
 for(const s of joint){const k=s.split(",").map(Number),p=train.map(w=>decode(w,k));if(p.some(x=>!x))continue;viable++;const sc=p.reduce((x,y)=>x+y.score,0);if(!best||best.score<sc)best={key:k,score:sc,train:p};}
 const result={lengths:ws.map(s=>s.flat().length),trainLengths:train.map(s=>s.flat().length),anchors:a.map(x=>x.anchor),individual:a.map(x=>x.keys.size),exactJoint,joint:joint.length,viable};
 if(k0)result.trueKeyInJoint=joint.includes(k0.join(","));
 if(best){const h=hold.map((s,i)=>decode(s,best.key,best.train[i].phase));result.key=best.key;result.trainScore=best.score;result.train=best.train.map(x=>render(x.words));result.hold=h.map(x=>x?render(x.words):null);result.replay=h.every((x,i)=>x&&JSON.stringify(enc([...best.train[i].words,...x.words],best.key).words)===JSON.stringify(ws[i]));if(truth){result.exactTrain=best.train.map((p,i)=>JSON.stringify(p.words)===JSON.stringify(truth[i].slice(0,ns[i])));result.exactHold=h.map((p,i)=>p&&JSON.stringify(p.words)===JSON.stringify(truth[i].slice(ns[i])));}}
 return result;
 }
 const ref=reference.split(/^### /m);function plain(n){const section=ref.find(x=>x.startsWith(n+"\n"));assert(section,"reference missing "+n);return section.split("\n").slice(1).filter(s=>!s.startsWith('[')).join("\n").match(/[A-Za-z]+/g).map(gp).filter(w=>w?.length);}
 const p1=plain(3).slice(0,82),plantedKey=[6,18,1,17,9,22,3,12];
 const controls=[6,10,11,12,13,14].map(page=>{const p=[p1,plain(page)],c=p.map(w=>enc(w,plantedKey).words);return{page,...test(c,p,plantedKey)};});
 return{dictionary:dict.size,sourceRanges:ranges,original:test(original),oneKeySymbolTolerance:test(original,null,null,1),controls};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/liber-primus/lp2-ink-annotations.json","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp1-plaintext-reference.txt"];
const a=files.map(read);a[0]=JSON.parse(a[0]);a[2]=JSON.parse(a[2]);console.log(JSON.stringify(experiment(...a),null,2));
