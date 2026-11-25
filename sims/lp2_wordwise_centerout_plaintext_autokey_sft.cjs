'use strict';
// Agent48, word-wise center-out plaintext-autokey; read-only CommonJS SFT.
const fs=require('node:fs'), crypto=require('node:crypto');
const inputs=[
  {
    "path": "resources/liber-primus/lp2-corpus.json",
    "sha": "054f2a0f780b7d46901acbe3d9bf4f0ac1801165"
  },
  {
    "path": "resources/liber-primus/lp2-transcription.txt",
    "sha": "43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7"
  },
  {
    "path": "resources/external/relikd-solved-gp29-native-v1.json",
    "sha": "1b064ef6d85819b7d96adaff31a82d1ec551598f"
  },
  {
    "path": "resources/control/english_wordfreq_textblob.txt",
    "sha": "140e1d22b5f8c45deddd2e8b25549d9d6307d938"
  }
];
function experiment(gp,trans,nat,lex){
 const g=JSON.parse(gp),native=JSON.parse(nat),Q=8,mod=x=>(x%29+29)%29,id=w=>String.fromCharCode(...w),arr=s=>Array.from(s,x=>x.charCodeAt(0)),assert=(v,m)=>{if(!v)throw Error(m)};
 const raw=s=>Array.from(s).filter(c=>g.runes.includes(c)).map(c=>g.runes.indexOf(c)),words=s=>(s.match(/[\u16a0-\u16ff]+/g)||[]).map(raw);
 const groups=words(trans.replace(/[\s/%]/g,"")).slice(0,2896);
 assert(groups.length===2896&&groups.flat().length===12956&&groups.flat().join()===g.pages.slice(0,56).flatMap(p=>p.indices).join(),"source");
 const cuts=[0,729,1874,3612,5506,6527,7960,9640,12648,12956],chapters=[];let at=0,j=0;
 for(let k=1;k<cuts.length;k++){const start=j;while(at<cuts[k])at+=groups[j++].length;assert(at===cuts[k],"chapter boundary");chapters.push(groups.slice(start,j))}
 assert(chapters[0].slice(0,2).flat().length===13&&chapters[8].slice(0,2).flat().length===9,"rubrics");chapters[0]=chapters[0].slice(2);chapters[8]=chapters[8].slice(2);
 const al=new Map(g.translit.map((s,i)=>[s,i])),dict=new Map();
 function add(w){if(w.length)dict.set(id(w),w)}
 function variants(s,visit){const w=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function dfs(i,a){if(i===w.length){visit(a);return}for(let k=1;k<=3;k++){const t=w.slice(i,i+k);if(t.length!==k)continue;const v=k===3?t==="ING"?al.get("NG"):undefined:al.get(t);if(v!==undefined)dfs(i+k,[...a,v])}}dfs(0,[])}
 for(const line of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m)variants(m[1],add)}
 const prose=native.sections.filter(s=>s.name!=="0_wisdom").map(s=>({name:s.name,ws:words(s.source_text)}));
 for(const s of native.sections)for(const w of words(s.source_text))add(w);
 function order(n,right){const a=[];for(let l=Math.floor((n-1)/2),r=Math.ceil((n-1)/2);l>=0;l--,r++){if(l===r)a.push(l);else if(right)a.push(r,l);else a.push(l,r)}assert(a.length===n&&new Set(a).size===n,"order");return a}
 const ord=[false,true].map(right=>Array.from({length:64},(_,n)=>order(n,right)));
 const reorder=(w,right)=>ord[+right][w.length].map(i=>w[i]);
 function physical(w,right){const p=[];ord[+right][w.length].forEach((i,j)=>p[i]=w[j]);return p}
 const by=[false,true].map(right=>{const a=Array.from({length:64},()=>[]);for(const w of dict.values())if(w.length<64)a[w.length].push(reorder(w,right));return a});
 function encode(ws,key,right,hold){let q=key.slice();return ws.map(w=>physical(reorder(w,right).map(p=>{if(hold&&p===0)return 0;const c=mod(p+q.shift());q.push(p);return c}),right))}
 function decode(ws,key,right){let q=key.slice();return ws.map(w=>physical(reorder(w,right).map(c=>{const p=mod(c-q.shift());q.push(p);return p}),right))}
 function ordinary(cw,right,budget){
  const c=cw.flatMap(w=>reorder(w,right)),b=[],s=[];
  for(let i=0;i<c.length;i++){b[i]=i<Q?c[i]:mod(c[i]-b[i-Q]);s[i]=i<Q?-1:-s[i-Q]}
  let pos=0,anchors=0,empty=0;const support=new Map();
  for(const w of cw){const n=w.length;if(n>=Q){anchors++;const keys=new Set();for(const p of by[+right][n]){
   const key=Array(Q).fill(-1);let ok=true;for(let i=0;i<n;i++){const t=pos+i,l=t%Q,k=mod(s[t]*(p[i]-b[t]));if(key[l]>=0&&key[l]!==k){ok=false;break}key[l]=k}if(ok)keys.add(id(key))
  }if(!keys.size)empty++;for(const k of keys)support.set(k,(support.get(k)||0)+1)}pos+=n}
  let upper=0;for(const v of support.values())upper=Math.max(upper,v);
  const required=Math.max(0,anchors-budget);let candidates=0,best=null,survivors=[];
  if(required>0&&upper>=required)for(const [k,v] of support)if(v>=required){candidates++;const key=arr(k),p=decode(cw,key,right),matches=p.filter(w=>dict.has(id(w))).length;
   if(!best||matches>best.matches)best={key,matches};if(matches>=cw.length-budget)survivors.push({key,matches})}
  return {words:cw.length,runes:c.length,budget,anchors,empty,distinctKeys:support.size,upper,required,candidates,best,survivors,exactExcluded:required>upper||(required>0&&survivors.length===0)}
 }
 // Hold-aware candidate transducer: known input prefix u and known output
 // suffix v, both length min(8,number of consuming symbols).
 function domains(w,right){
  const c=reorder(w,right),sets=Array.from({length:Q+1},()=>new Map());
  for(const p of by[+right][w.length]){
   const a=[],need=[];let ok=true;
   for(let i=0;i<p.length;i++){if(p[i]===0){if(c[i]!==0){ok=false;break}continue}
    if(a.length<Q)need.push(mod(c[i]-p[i]));else if(c[i]!==mod(p[i]+a[a.length-Q])){ok=false;break}a.push(p[i])}
   if(ok){const n=Math.min(a.length,Q),u=id(need),v=id(a.slice(-Q));sets[n].set(u+v,{u,v})}
  }return sets.map(m=>Array.from(m.values()))
 }
 function compatible(a,b){
  for(let l=0;l<=Q;l++)if(a[l].length)for(let r=0;r<=Q;r++)if(b[r].length){
   const overlap=l+r-Q;if(overlap<=0)return true;
   const set=new Set(a[l].map(x=>x.v.slice(0,overlap)));
   if(b[r].some(x=>set.has(x.u.slice(r-overlap))))return true
  }return false
 }
 const empty=d=>d.every(x=>x.length===0);
 function local(cw,right){
  const bad=[],single=[],pairs=[];let prev=null,pre=false;
  for(let i=0;i<cw.length;i++){const d=domains(cw[i],right),e=empty(d);if(e){bad.push([i,i]);single.push(i)}
   if(i&&!e&&!pre&&!compatible(prev,d)){bad.push([i-1,i]);pairs.push(i-1)}prev=d;pre=e}
  bad.sort((a,b)=>a[1]-b[1]||b[0]-a[0]);let end=-1;const witness=[];
  for(const [l,r] of bad)if(l>end){witness.push([l,r]);end=r}
  return {words:cw.length,budget:Math.floor(cw.length*.05),single:single.length,pair:pairs.length,lowerOOV:witness.length,witness,exactExcluded:witness.length>Math.floor(cw.length*.05)}
 }
 const key=[23,10,1,10,9,10,16,26];
 function fixedHold(cw,right,k){
  let states=new Set([id(k)]),peak=1,offset=0;
  for(const c of cw.flatMap(w=>reorder(w,right))){const next=new Set();for(const q of states){if(c===0)next.add(q);const p=mod(c-q.charCodeAt(0));if(p!==0)next.add(q.slice(1)+String.fromCharCode(p))}
   offset++;if(!next.size)return {reachable:false,deadOffset:offset-1,peak};
   if(next.size>100000)return {reachable:null,capOffset:offset-1,peak:next.size};states=next;peak=Math.max(peak,states.size)}
  return {reachable:true,finalStates:states.size,peak}
 }
 const score=p=>({matches:p.filter(w=>dict.has(id(w))).length,preview:p.slice(0,20).map(w=>w.map(x=>g.translit[x]).join("")).join(" ")});
 const controls=[];
 for(const [z,name] of ["0_welcome","0_koan_1","0_loss_of_divinity"].entries()){
  const ws=prose.find(s=>s.name===name).ws,secret=Array.from({length:Q},(_,i)=>(13*z+7*i*i+11*i+3)%29);
  for(const right of [false,true]){const c=encode(ws,secret,right,false),o=ordinary(c,right,0),p=decode(c,secret,right);assert(p.flat().join()===ws.flat().join(),"replay");assert(o.survivors.some(v=>v.key.join()===secret.join()),"lost key");
   const hc=encode(ws,secret,right,true),h=local(hc,right),fixed=fixedHold(hc,right,secret);assert(h.lowerOOV===0&&fixed.reachable!==false,"F control");
   controls.push({name,right,secret,ordinaryRecoveredKeys:o.survivors.length,runes:ws.flat().length,words:ws.length,fholdLowerOOV:h.lowerOOV,fholdReachability:fixed})}
 }
 const rows=[];
 for(const right of [false,true])for(let ch=0;ch<chapters.length;ch++){
  const cw=chapters[ch],budget=Math.floor(cw.length*.05),o=ordinary(cw,right,budget),h=local(cw,right),p=decode(cw,key,right);assert(encode(p,key,right,false).flat().join()===cw.flat().join(),"original replay");
  rows.push({chapter:ch,right,ordinary:o,fhold:h,fixedNativePrimerOrdinary:score(p),fixedNativePrimerFhold:fixedHold(cw,right,key)})
 }
 return {dictionarySize:dict.size,key,headingsExcluded:[13,9],controls,rows};
}
const data=inputs.map(({path,sha})=>{const b=fs.readFileSync(path);if(crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex')!==sha)throw Error('input changed: '+path);return b.toString('utf8')});
console.log(JSON.stringify(experiment(...data),null,2));
