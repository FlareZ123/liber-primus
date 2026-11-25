'use strict';
// Exact physical-word CSP for four simultaneous arbitrary per-position affine alphabets.
const fs=require('node:fs'),crypto=require('node:crypto');
const inputs=[["resources/liber-primus/lp2-corpus.json","054f2a0f780b7d46901acbe3d9bf4f0ac1801165"],["resources/transcriptions/lp2-image-corrected.txt","f7b534a33edeb212d427329798438325307463d7"],["resources/external/relikd-solved-gp29-native-v1.json","1b064ef6d85819b7d96adaff31a82d1ec551598f"],["resources/control/gibran_prophet_58585.txt","df260a07d56bf5998d40a6360b6132c35c252d10"],["resources/control/shakespeare_first300k.txt","94c677ad9dd50771c6670e0c4e4dad9052b46d85"],["resources/control/emerson_essays_2944.txt","a92be8ba5b3511a003a22ba31523c14397aaa83a"],["resources/control/english_wordfreq_textblob.txt","140e1d22b5f8c45deddd2e8b25549d9d6307d938"]];
const raw=inputs.map(([p,sha])=>{const b=fs.readFileSync(p);if(crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex')!==sha)throw Error('pin mismatch '+p);return b.toString('utf8')});
function prepare(raw){
 const C=JSON.parse(raw[0]),T=raw[1],gold=JSON.parse(raw[2]),Q=29,id=w=>w.join(","),assert=(x,m)=>{if(!x)throw Error(m)},ix=new Map(C.runes.map((x,i)=>[x,i])),tokens=C.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function runeWords(t,sep){const out=[];let w=[],between="";for(const c of t){if(ix.has(c)){if(w.length&&sep.test(between)){out.push(w);w=[]}w.push(ix.get(c));between=""}else between+=c}if(w.length)out.push(w);return out}
 function spell(word,alt=true){const w=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S"),p=[];for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));assert(v,"unknown token "+w);p.push(v.i);j+=v.t.length}return p}
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return(t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>spell(w))}
 const donors=raw.slice(3,6).map(native),vocab=new Map(),freq=new Map(),inc=(k,v)=>freq.set(k,(freq.get(k)||0)+v);for(const d of donors)for(const w of d.slice(0,Math.floor(d.length*.8)))if(w.length<=24){vocab.set(id(w),w);inc(id(w),1)}
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))for(const w of runeWords(s.source_text,/[^\u16a0-\u16ff]/u))if(w.length<=24){vocab.set(id(w),w);inc(id(w),1)}
 assert(vocab.size===10842,"base vocab "+vocab.size);
 for(const line of raw[6].split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(line);if(m)for(const alt of[false,true]){const w=spell(m[1],alt);if(w.length&&w.length<=24){vocab.set(id(w),w);inc(id(w),Math.log1p(+m[2])*.03)}}}
 for(let x=0;x<Q;x++)vocab.set(id([x]),[x]);assert(vocab.size===35944,"broad vocab "+vocab.size);
 const byLen=new Map();for(const w of vocab.values()){if(!byLen.has(w.length))byLen.set(w.length,[]);byLen.get(w.length).push(w)}
 for(const a of byLen.values())a.sort((a,b)=>(freq.get(id(b))||0)-(freq.get(id(a))||0));
 const groups=runeWords(T,/[-.&]/u),u=C.pages.filter(p=>p.page<56).flatMap(p=>p.indices);assert(id(groups.flat().slice(0,u.length))===id(u),"source mismatch");
 function spans(p){const start=C.pages.slice(0,p).reduce((s,x)=>s+x.indices.length,0),end=start+C.pages[p].indices.length;let pos=0,out=[];for(const w of groups){let a=Math.max(pos,start),b=Math.min(pos+w.length,end);if(a<b)out.push({start:a-start,end:b-start,carry:a>pos||b<pos+w.length});pos+=w.length}return out}
 const rest=Array.from({length:200},(_,i)=>i+34).concat(Array.from({length:28},(_,i)=>i)),I=Array.from({length:76},(_,i)=>i),maps=[
 ["marker-contiguous",[rest.slice(0,76),rest.slice(76,152),rest.slice(152),I]],
 ["marker-interleaved",[0,1,2].map(j=>I.map(i=>rest[3*i+j])).concat([I])],
 ["row-outer-trim",[0,1,2].map(j=>I.map(i=>78*j+i+1)).concat([I])],
 ["triple-outer-trim",[0,1,2].map(j=>I.map(i=>3*(i+1)+j)).concat([I])]];
 assert(maps.every(([,m])=>new Set(m.slice(0,3).flat()).size===228&&m.every(a=>a.length===76)),"maps");
 return {C,donors,vocab,byLen,maps,spans:[spans(27),spans(55)],original:[C.pages[27].indices,C.pages[55].indices],id};
}
function problem(model,layout,physical,spans){
 const Q=29,mod=x=>(x%Q+Q)%Q,[name,maps]=layout,variables=[],pos=[Array(234),Array(76)],used=[new Set(maps.slice(0,3).flat()),new Set(maps[3])],id=model.id;
 const add=(p,s,free)=>{const active=Array.from({length:s.end-s.start},(_,i)=>i).filter(i=>used[p].has(s.start+i));if(!active.length)return;let words=model.byLen.get(s.end-s.start)||[],seen=new Set();words=words.filter(w=>{const k=id(active.map(i=>w[i]));if(seen.has(k))return false;seen.add(k);return true});const v=variables.length;variables.push({p,...s,free,words,active,cons:[]});for(const i of active)pos[p][s.start+i]={v,i}};
 for(let p=0;p<2;p++)for(const s of spans[p]){if(s.carry){for(let i=s.start;i<s.end;i++)add(p,{start:i,end:i+1,carry:true},true)}else add(p,s,false)}
 const ct=maps.map((m,j)=>m.map(i=>physical[j===3?1:0][i])),constraints=[];
 for(let i=0;i<76;i++){
  const sites=maps.map((m,j)=>pos[j===3?1:0][m[i]]);if(sites.some(x=>!x))throw Error("missing variable");const groups=new Map();sites.forEach((s,j)=>{const a=groups.get(s.v)||[];a.push({lane:j,off:s.i});groups.set(s.v,a)});
  const parts=[...groups.entries()].map(([v,places])=>{const keys=Uint32Array.from(variables[v].words,w=>places.reduce((s,x)=>s*Q+w[x.off],0));variables[v].cons.push(i);return {v,places,keys}});
  const tuples=[],seen=new Set();for(let a=1;a<Q;a++)for(let b=0;b<Q;b++){const p=ct.map(t=>mod(a*t[i]+b)),code=p.reduce((s,x)=>s*Q+x,0);if(seen.has(code))continue;seen.add(code);tuples.push({p,a,b,keys:parts.map(z=>z.places.reduce((s,x)=>s*Q+p[x.lane],0))})}
  constraints.push({i,parts,tuples});
 }
 const domains=variables.map(v=>Int32Array.from({length:v.words.length},(_,i)=>i));
 return {name,variables,constraints,domains,ct,maps};
}
function localGate(problem){
 const {variables,constraints,domains}=problem;const d=domains.map(x=>x.slice());
 for(const c of constraints)for(let k=0;k<c.parts.length;k++){const z=c.parts[k],allowed=new Set(c.tuples.map(t=>t.keys[k]));d[z.v]=d[z.v].filter(w=>allowed.has(z.keys[w]))}
 const empty=d.flatMap((a,v)=>a.length===0?[{v,page:variables[v].p===0?27:55,start:variables[v].start,end:variables[v].end,initial:domains[v].length}]:[]);
 return {domains:d,empty,totalBefore:domains.reduce((n,a)=>n+a.length,0),totalAfter:d.reduce((n,a)=>n+a.length,0),counts:d.map(x=>x.length)};
}
function propagate(problem,domains){
 const {variables,constraints}=problem;const queue=Array.from({length:constraints.length},(_,i)=>i),pending=new Uint8Array(constraints.length).fill(1);let revisions=0;
 if(domains.some(a=>a.length===0))return {ok:false,revisions,failed:-1};
 for(let h=0;h<queue.length;h++){const i=queue[h];pending[i]=0;const c=constraints[i],sets=c.parts.map(z=>new Set(Array.from(domains[z.v],w=>z.keys[w]))),support=c.parts.map(()=>new Set());let n=0;
  for(const t of c.tuples){if(!t.keys.every((x,k)=>sets[k].has(x)))continue;n++;t.keys.forEach((x,k)=>support[k].add(x))}
  if(!n)return {ok:false,revisions,failed:i};
  for(let k=0;k<c.parts.length;k++){const z=c.parts[k],old=domains[z.v],a=old.filter(w=>support[k].has(z.keys[w]));if(a.length===old.length)continue;domains[z.v]=a;revisions++;if(!a.length)return {ok:false,revisions,failed:i};for(const j of variables[z.v].cons)if(j!==i&&!pending[j]){pending[j]=1;queue.push(j)}}
 }
 return {ok:true,revisions,failed:null};
}
function solve(problem,budget=20000,limit=2){
 const g=localGate(problem);if(g.empty.length)return {local:{...g,domains:undefined},status:"UNSAT_LOCAL",solutions:[]};
 const D=g.domains,init=propagate(problem,D),after=D.map(x=>x.length);if(!init.ok)return {local:{...g,domains:undefined},init,after,status:"UNSAT_GAC",solutions:[]};
 let nodes=0,cut=false;const solutions=[];
 function visit(d){if(solutions.length>=limit)return;if(nodes>=budget){cut=true;return}nodes++;
  let v=-1;for(let k=0;k<d.length;k++)if(d[k].length>1&&(v<0||d[k].length<d[v].length))v=k;
  if(v<0){const words=d.map((a,k)=>problem.variables[k].words[a[0]]),p=problem.ct.map(()=>Array(76));for(const c of problem.constraints){const t=c.tuples.find(t=>t.keys.every((x,k)=>x===c.parts[k].keys[d[c.parts[k].v][0]]));if(!t)throw Error("no tuple");for(let j=0;j<4;j++)p[j][c.i]=t.p[j]}solutions.push({words,p});return}
  for(const a of d[v]){if(solutions.length>=limit||cut)break;const next=d.slice();next[v]=Int32Array.of(a);if(propagate(problem,next).ok)visit(next)}
 }
 visit(D);return {local:{...g,domains:undefined},init,after,nodes,status:solutions.length>=limit?"MULTIPLE":cut?"BUDGET":solutions.length?"UNIQUE":"UNSAT_EXACT",solutions};
}
function plant(model,layout,j){
 const lengths=[234,76],plaintext=[],spans=[],offsets=[];
 for(let p=0;p<2;p++){const d=(j+p)%3,w=model.donors[d];let off=Math.floor(w.length*.8)+j*150+p*70,found=false;
  for(;off<w.length;off++){const a=[],s=[];for(let k=off;a.length<lengths[p]&&k<w.length;k++){const x=w[k];if(!model.vocab.has(model.id(x)))break;const start=a.length;a.push(...x);s.push({start,end:Math.min(a.length,lengths[p]),carry:a.length>lengths[p]})}if(a.length>=lengths[p]){plaintext.push(a.slice(0,lengths[p]));spans.push(s);offsets.push([d,off]);found=true;break}}if(!found)throw Error("no donor");
 }
 let state=(0xa31f00+j*313)>>>0;const rnd=n=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*n)},ct=plaintext.map(t=>t.slice()),[_,maps]=layout;
 for(let i=0;i<76;i++){const a=1+rnd(28),b=rnd(29);for(let k=0;k<4;k++){const p=k===3?1:0,off=maps[k][i];ct[p][off]=(a*plaintext[p][off]+b)%29}}
 return {plaintext,spans,ct,offsets};
}
module.exports={prepare,problem,localGate,propagate,solve,plant};
if(require.main===module){const model=prepare(raw),mode=process.argv[2]||'original',j=Number(process.argv[3]||0),budget=Number(process.argv[4]||20000);if(mode==='original')console.log(JSON.stringify(model.maps.map(layout=>{const p=problem(model,layout,model.original,model.spans);return {layout:layout[0],vars:p.variables.length,...solve(p,budget,2)}}),null,2));else{const layout=model.maps[j],control=plant(model,layout,j),p=problem(model,layout,control.ct,control.spans);console.log(JSON.stringify({control,...solve(p,budget,2)},null,2))}}
