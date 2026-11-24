'use strict';
/** Exact q13 plaintext-autokey native-word constraint solver with latent F holds. */
const files=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"];
function study(inputs){
 const gp=JSON.parse(inputs[0]),native=JSON.parse(inputs[2]),q=13,ALL=(1<<29)-1,mod=x=>(x%29+29)%29;
 const assert=(x,m)=>{if(!x)throw Error(m)},eq=(a,b)=>String(a)===String(b);
 const rune=new Map(gp.runes.map((x,i)=>[x,i])),alpha=new Map(gp.translit.map((x,i)=>[x,i]));
 const parse=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>Array.from(w,c=>rune.get(c)));
 const words=parse(inputs[1].replace(/[\s/%]/g,"")).slice(0,2896);
 assert(eq(words.flat(),gp.pages.slice(0,56).flatMap(p=>p.indices)),"canonical alignment");
 const source=native.sections.map(s=>({name:s.name,w:parse(s.source_text)}));
 const dict=Array.from({length:40},()=>new Set());
 const add=w=>{if(w.length&&w.length<40)dict[w.length].add(String.fromCharCode(...w))};
 function variants(w){
  const s=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  function go(i,p){if(i===s.length){add(p);return;}for(const n of [1,2,3]){const x=s.slice(i,i+n);if(x.length!==n)continue;const v=n===3?(x==="ING"?21:undefined):alpha.get(x);if(v!==undefined)go(i+n,[...p,v]);}}
  go(0,[]);
 }
 for(const line of inputs[3].split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m&&m[1].length>=2)variants(m[1]);}
 for(const w of ["A","I","O"])variants(w);
 for(const s of source)for(const w of s.w)add(w);
 const lex=dict.map(d=>Array.from(d,x=>Uint8Array.from(x,c=>c.charCodeAt(0))));
 const encrypt=(ws,key)=>{let k=key.slice();return ws.map(w=>w.map(p=>{if(!p)return 0;const c=mod(p+k.shift());k.push(p);return c}))};
 const countBits=x=>{let n=0;while(x){x&=x-1;n++}return n};
 const digits=x=>{const a=[];for(let i=0;i<29;i++)if(x&(1<<i))a.push(i);return a};
 function state(C,mask){
  const ph=new Int8Array(C.length).fill(-1),pos=Array.from({length:q},()=>[]),req=C.map(()=>new Int8Array(29).fill(-1)),domains=Array(q).fill(ALL);
  let n=0,z=0;
  for(let i=0;i<C.length;i++){if(!C[i]&&((mask>>>z++)&1))continue;const j=n++%q;ph[i]=j;pos[j].push(i)}
  for(let j=0;j<q;j++)for(let k=0;k<29;k++){
   let p=k;const vals=[];for(const i of pos[j]){p=mod(C[i]-p);if(!p)break;vals.push(p)}
   if(vals.length!==pos[j].length){domains[j]&=~(1<<k);continue}
   for(let h=0;h<vals.length;h++)req[pos[j][h]][vals[h]]=k;
  }
  return domains.some(d=>!d)?null:{ph,req,domains};
 }
 function decode(C,key,mask){
  let k=key.slice(),z=0,P=[];
  for(const c of C){if(c===0&&((mask>>>z++)&1)){P.push(0);continue}const p=mod(c-k.shift());if(!p)return null;k.push(p);P.push(p)}
  return {P,k};
 }
 function relation(s,g,dom){
  const scope=[],loc=[];
  for(let i=g.start;i<g.end;i++){const p=s.ph[i];if(p<0){loc.push(-1);continue}if(!scope.includes(p))scope.push(p);loc.push(scope.indexOf(p))}
  const tuples=[];
  for(const w of lex[g.end-g.start]||[]){
   const vals=new Int8Array(scope.length).fill(-1);let ok=true;
   for(let h=0;h<w.length;h++){const p=w[h],j=loc[h];if(j<0){if(p){ok=false;break}continue}const k=s.req[g.start+h][p];if(k<0||!(dom[scope[j]]&(1<<k))||(vals[j]>=0&&vals[j]!==k)){ok=false;break}vals[j]=k}
   if(ok)tuples.push(vals);
  }
  return {scope,tuples};
 }
 function narrow(rel,dom){
  const {scope,tuples}=rel,support=Array(scope.length).fill(0);let n=0;
  for(const t of tuples){let ok=true;for(let j=0;j<scope.length;j++)if(!(dom[scope[j]]&(1<<t[j]))){ok=false;break}
   if(!ok)continue;n++;for(let j=0;j<scope.length;j++)support[j]|=1<<t[j]}
  if(!n)return -1;let changed=0;for(let j=0;j<scope.length;j++){const old=dom[scope[j]];dom[scope[j]]&=support[j];if(old!==dom[scope[j]])changed++}return changed;
 }
 function attack(ws,at){
  let cut=0,n=0;while(n<at&&cut<ws.length)n+=ws[cut++].length;
  const fit=ws.slice(0,cut),C=fit.flat(),z=C.filter(x=>!x).length;
  const stats={fitRunes:C.length,holdoutRunes:ws.flat().length-C.length,fitWords:cut,zeros:z,legalMasks:0,relationSurvivors:0,consistentMasks:0,searchNodes:0,solutions:0,cap:false};
  if(z>15)return {stats:{...stats,cap:true,reason:"mask cap"},train:[],test:[]};
  const groups=[];let start=0;for(const w of fit){groups.push({start,end:start+w.length});start+=w.length}
  const train=[],test=[];
  for(let mask=0;mask<2**z;mask++){
   const s=state(C,mask);if(!s)continue;stats.legalMasks++;
   const dom=s.domains.slice(),rels=[];
   // Fewest expected dictionary survivors first; only a traversal heuristic.
   const order=groups.map(g=>{let v=Math.log(Math.max(1,lex[g.end-g.start]?.length||0));for(let i=g.start;i<g.end;i++)if(s.ph[i]>=0)v+=Math.log(countBits(dom[s.ph[i]])/29);return {g,v}}).sort((a,b)=>a.v-b.v);
   let possible=true;
   for(const {g} of order){const rel=relation(s,g,dom);if(narrow(rel,dom)<0){possible=false;break}rels.push(rel)}
   if(!possible)continue;stats.relationSurvivors++;
   function propagate(d){
    let changed=true;while(changed){changed=false;for(const rel of rels){const v=narrow(rel,d);if(v<0)return false;if(v)changed=true}}return true
   }
   if(!propagate(dom))continue;stats.consistentMasks++;
   function search(d){
    if(++stats.searchNodes>100000||train.length>=10000){stats.cap=true;return}
    if(!propagate(d))return;
    let j=-1,best=30;for(let i=0;i<q;i++){const b=countBits(d[i]);if(b>1&&b<best){j=i;best=b}}
    if(j<0){
     const key=d.map(x=>digits(x)[0]),out=decode(C,key,mask);assert(out,"legal decode");
     let start=0;const P=fit.map(w=>{const x=out.P.slice(start,start+w.length);start+=w.length;assert(dict[w.length].has(String.fromCharCode(...x)),"lexical replay");return x});
     assert(eq(encrypt(P,key).flat(),C),"prefix replay");train.push({key,mask,queue:out.k,plain:out.P});return
    }
    for(const k of digits(d[j])){const next=d.slice();next[j]=1<<k;search(next);if(stats.cap)return}
   }
   search(dom);if(stats.cap)break;
  }
  stats.solutions=train.length;
  // Frozen key and queue: no holdout refitting. Explore all visible-zero interpretations word by word.
  for(const t of train){
   let states=[{queue:t.queue,plain:t.plain}];
   for(const w of ws.slice(cut)){
    const next=[],z=w.filter(x=>!x).length;
    for(const s of states)for(let mask=0;mask<2**z;mask++){const d=decode(w,s.queue,mask);if(d&&dict[w.length].has(String.fromCharCode(...d.P)))next.push({queue:d.k,plain:s.plain.concat(d.P)})}
    if(next.length>10000){stats.cap=true;break}states=next;if(!states.length)break;
   }
   if(stats.cap)break;
   for(const s of states){assert(eq(encrypt(ws.map((w,i)=>s.plain.slice(ws.slice(0,i).reduce((a,w)=>a+w.length,0),ws.slice(0,i+1).reduce((a,w)=>a+w.length,0))),t.key).flat(),ws.flat()),"full replay");test.push({key:t.key,mask:t.mask,plain:s.plain})}
  }
  return {stats,train,test};
 }
 function summary(a,truth=null,key=null){return {...a.stats,distinctTrainKeys:new Set(a.train.map(x=>String(x.key))).size,testPaths:a.test.length,correctTrain:truth?a.train.filter(x=>eq(x.key,key)&&eq(x.plain,truth.slice(0,a.stats.fitRunes))).length:null,correctTest:truth?a.test.filter(x=>eq(x.key,key)&&eq(x.plain,truth)).length:null,firstOriginalKeys:truth?undefined:a.train.slice(0,5).map(x=>x.key)}}
 const controls=[];
 for(const [name,key] of [["0_koan_1",[7,20,2,1,26,5,25,4,25,14,14,13,12]],["0_loss_of_divinity",[7,26,27,7,20,17,21,25,25,6,5,9,26]]]){
  const p=source.find(x=>x.name===name).w;const result=attack(encrypt(p,key),200);
  controls.push({name,key,...summary(result,p.flat(),key)});
 }
 const terminal=words.slice(-66);assert(terminal.flat().length===308,"terminal 66 groups");
 const original=summary(attack(terminal,200));
 return {q,lexicon:dict.reduce((a,d)=>a+d.size,0),controls,original};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path");console.log(JSON.stringify(study(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2))}
module.exports={study,files};
