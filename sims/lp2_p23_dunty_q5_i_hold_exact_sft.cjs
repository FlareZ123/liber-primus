'use strict';
// Node.js 22 CommonJS, read-only, no dependencies.
const fs=require('node:fs'), path=require('node:path');
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
function run(data,nativeData){
 const check=(c,m)=>{if(!c)throw Error(m)};
 const m=new Map(data.runes.map((x,i)=>[x,i]));
 const src=nativeData.sections.map(x=>({name:x.name,a:[...x.source_text].filter(c=>m.has(c)).map(c=>m.get(c))}));
 const q=5,ALL=(1<<29)-1,mod=x=>(x+29)%29,rare=[12,22];
 const key8=[23,10,1,10,9,10,16,26],key=key8.filter(x=>x!==10);
 const native57=data.pages[57].indices;
 check(native57.some((x,i)=>key8.every((v,k)=>native57[i+k]===v)),"p57 DIUINITY");
 check(key.join()==="23,1,9,16,26","DUNTY");
 const body=data.pages.slice(23,27).flatMap(p=>p.indices).slice(16);
 check(body.length===1005,"body source");
 check(src.every(x=>x.a.every(v=>!rare.includes(v))),"native GP27 inventory");
 const count=Array.from({length:30},()=>Array(29).fill(.5));
 for(const {a} of src.filter(x=>!["0_koan_1","0_welcome"].includes(x.name)))for(let i=0;i<a.length;i++)count[i?a[i-1]:29][a[i]]++;
 const logs=count.map(a=>a.map(x=>Math.log(x/a.reduce((s,y)=>s+y,0))));
 /** @param {number[]} p @param {number[]} key @param {number[]} h */
 function encrypt(p,key,h){let i=0;return p.map(v=>h.includes(v)?v:mod(v+key[i++%q]))}
 /** Exact DP over Cartesian key domains, with cap explicitly classified. */
 function gate(C,h,cap=100000){
  const ok=Array.from({length:29},(_,c)=>Array.from({length:29},(_,k)=>k).filter(k=>![...rare,...h].includes(mod(c-k))).reduce((a,k)=>a|(1<<k),0));
  let st=new Map([["0,"+Array(q).fill(ALL),{ph:0,d:Array(q).fill(ALL)}]]),peak=1;
  for(let i=0;i<C.length;i++){
   const c=C[i],next=new Map();
   for(const s of st.values()){
    if(h.includes(c))next.set(s.ph+","+s.d,s);
    const x=s.d[s.ph]&ok[c];
    if(x){const d=s.d.slice();d[s.ph]=x;const ph=(s.ph+1)%q;next.set(ph+","+d,{ph,d})}
   }
   if(next.size>cap)return {status:"CAP",offset:i,peak:next.size};
   if(!next.size)return {status:"UNSAT",offset:i,peak};
   st=next;peak=Math.max(peak,st.size);
  }
  const unique=new Map();for(const s of st.values())unique.set(s.d.join(","),s.d);
  return {status:"SAT",peak,states:st.size,domains:[...unique.values()]};
 }
 function keys(domains){
  let k=new Set();
  function go(d,i,a){if(i===q){k.add(a.join(","));return}for(let v=0;v<29;v++)if(d[i]&(1<<v))go(d,i+1,[...a,v])}
  for(const d of domains)go(d,0,[]);
  return [...k].map(x=>x.split(",").map(Number));
 }
 /** Best native-bigram path, with both legal interpretations of visible markers. */
 function vit(C,key,h,phase=0,last=29,restrict=true){
  let st=new Map([[phase+","+last,{ph:phase,last,s:0,p:[]}]]);
  for(let i=0;i<C.length;i++){
   const c=C[i],nx=new Map();
   for(const v of st.values()){
    const add=(x,ph)=>{if(restrict&&rare.includes(x))return;const a=ph+","+x,s=v.s+logs[v.last][x],old=nx.get(a);if(!old||s>old.s)nx.set(a,{ph,last:x,s,p:[...v.p,x]})};
    if(h.includes(c))add(c,v.ph);
    const x=mod(c-key[v.ph]);if(!h.includes(x))add(x,(v.ph+1)%q);
   }
   if(!nx.size)return {legal:false,offset:i};st=nx;
  }
  return {...[...st.values()].sort((a,b)=>b.s-a.s)[0],legal:true};
 }
 const same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
 const ioc=p=>{const c=Array(29).fill(0);for(const x of p)c[x]++;return c.reduce((a,b)=>a+b*(b-1),0)/(p.length*(p.length-1))};
 const clocks=[[0],[10],[0,10]];
 const direct=[[],...clocks].map(h=>{
  const d=vit(body,key,h,0,29,false);
  if(!d.legal)return {holds:h,legal:false,firstImpossible:d.offset};
  check(same(encrypt(d.p,key,h),body),"direct replay");
  return {holds:h,legal:true,ioc:ioc(d.p),score:d.s/body.length,preview:d.p.slice(0,100).map(x=>data.translit[x]).join("")};
 });
 const controls=[];
 for(const cfg of [{name:"0_koan_1",key,fit:500},{name:"0_welcome",key:[17,2,28,9,12],fit:400}]){
  const p=src.find(x=>x.name===cfg.name).a;
  for(const h of clocks){
   const c=encrypt(p,cfg.key,h),s=gate(c.slice(0,cfg.fit),h);
   check(s.status==="SAT","calibration support search");
   const fit=keys(s.domains).map(key=>({key,v:vit(c.slice(0,cfg.fit),key,h)})).sort((a,b)=>b.v.s-a.v.s);
   const b=fit[0],out=vit(c.slice(cfg.fit),b.key,h,b.v.ph,b.v.last);
   check(same(b.key,cfg.key),"hidden key inference");
   check(out.legal&&same(encrypt([...b.v.p,...out.p],b.key,h),c),"control replay");
   controls.push({name:cfg.name,holds:h,keys:fit.length,peak:s.peak,chosen:b.key,trainExact:b.v.p.filter((x,i)=>x===p[i]).length,holdoutExact:out.p.filter((x,i)=>x===p[i+cfg.fit]).length,holdoutN:p.length-cfg.fit});
  }
 }
 const original=clocks.map(h=>{
  const g=gate(body,h);check(g.status==="UNSAT","original support contradiction");
  let at=0,blocks=[],tail;
  while(at<body.length){
   const z=gate(body.slice(at),h);
   if(z.status!=="UNSAT"){tail={status:z.status,peak:z.peak,states:z.states};break}
   blocks.push({start:at,end:at+z.offset+1,peak:z.peak});at+=z.offset+1;
  }
  return {holds:h,firstImpossible:g.offset,peak:g.peak,minRare:blocks.length,blocks,tailStart:at,tail};
 });
 const capped=[];
 for(const h of [[10],[0,10]]){
  const c=encrypt(src.find(x=>x.name==="0_loss_of_divinity").a,[5,21,14,3,27],h);
  const z=gate(c.slice(0,500),h);
  capped.push({holds:h,status:z.status,offset:z.offset,peak:z.peak});
 }
 check(controls.reduce((s,x)=>s+x.holdoutExact,0)===1183,"heldout calibration total");
 check(original.map(x=>x.firstImpossible).join()==="137,144,160","original prefix contradiction");
 check(original.map(x=>x.minRare).join()==="5,5,6","rare lower bound");
 return {bodyLength:body.length,key8,key,rare,direct,controls,original,capped,knownClearP57IoC:ioc(native57)};
}
console.log(JSON.stringify(run(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
