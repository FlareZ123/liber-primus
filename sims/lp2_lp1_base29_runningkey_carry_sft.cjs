'use strict';
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function experiment(lp2,lp1,printed){
 const mod=x=>((x%29)+29)%29,assert=(ok,msg)=>{if(!ok)throw Error(msg)},eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const map=new Map(lp1.runes.map((x,i)=>[x,i])),gp=x=>Array.from(x).filter(v=>map.has(v)).map(v=>map.get(v));
 const secs=lp1.sections.map(s=>gp(s.source_text));
 secs[3]=gp(printed.split("%").slice(4,8).join("")).map(v=>(60-v)%29);
 const key=secs.slice(0,7).flat();
 assert(key.length===2797&&secs[3].length===778,"source lengths");
 const order=(s,d)=>d===1?s:s.slice().reverse();
 const digits=s=>Array.from(s,x=>x.charCodeAt(0)-65),str=p=>String.fromCharCode(...p.map(v=>65+v));
 function model(train){
  const u=new Float64Array(29),b=new Float64Array(870),t=new Float64Array(26100),bt=new Float64Array(30),tt=new Float64Array(900);
  let n=0;
  for(const seq of train){let a=29,z=29;for(const p of seq){u[p]++;n++;b[z*29+p]++;bt[z]++;t[(a*30+z)*29+p]++;tt[a*30+z]++;a=z;z=p;}}
  const log=new Float64Array(t.length);
  for(let a=0;a<30;a++)for(let z=0;z<30;z++)for(let p=0;p<29;p++){
    const pu=(u[p]+.5)/(n+14.5),pb=(b[z*29+p]+6*pu)/(bt[z]+6);log[(a*30+z)*29+p]=Math.log((t[(a*30+z)*29+p]+6*pb)/(tt[a*30+z]+6));
  }return log;
 }
 function encode(p,k,o,sign,hold){
  let j=o,carry=0;
  return p.map(v=>{if(hold&&v===0)return 0;assert(j<k.length,"key overrun");const w=v+sign*k[j++]+carry,c=mod(w);carry=(w-c)/29;return c;});
 }
 function ordinary(c,k,sign,log,start){
  let {j,carry,a,b}=start,s=0;const out=[];
  for(const v of c){if(j===k.length)return null;const q=k[j++],p=mod(v-sign*q-carry);carry=(p+sign*q+carry-v)/29;s+=log[(a*30+b)*29+p];a=b;b=p;out.push(p);}
  return {j,carry,a,b,s,path:str(out)};
 }
 function reachable(c,k,o,sign){
  let states=new Set([o*3+1]);
  for(const v of c){const next=new Set();for(const state of states){
    const j=Math.floor(state/3),carry=state%3-1;
    if(v===0)next.add(state);
    if(j<k.length){const q=k[j],p=mod(v-sign*q-carry);if(p!==0)next.add((j+1)*3+(p+sign*q+carry-v)/29+1);}
  }if(next.size===0)return false;states=next;}return true;
 }
 function viterbi(c,k,sign,hold,log,start){
  if(!hold)return ordinary(c,k,sign,log,start);
  const id=(j,carry,a,b)=>j*2700+(carry+1)*900+a*30+b;
  let states=new Map([[id(start.j,start.carry,start.a,start.b),{...start,s:0,path:""}]]);
  for(const v of c){const next=new Map();
   function add(n,p,j,carry){const s=n.s+log[(n.a*30+n.b)*29+p],i=id(j,carry,n.b,p),prev=next.get(i);if(!prev||s>prev.s)next.set(i,{j,carry,a:n.b,b:p,s,path:n.path+String.fromCharCode(65+p)});}
   for(const n of states.values()){
    if(v===0)add(n,0,n.j,n.carry);
    if(n.j<k.length){const q=k[n.j],p=mod(v-sign*q-n.carry);if(p!==0)add(n,p,n.j+1,(p+sign*q+n.carry-v)/29);}
   }
   if(!next.size)return null;states=next;
  }
  let best=null;for(const n of states.values())if(!best||n.s>best.s)best=n;return best;
 }
 function predict(c,k,sign,hold,log,split,truth){
  const pre=c.slice(0,split),suf=c.slice(split),min=hold?pre.filter(x=>x!==0).length:pre.length;
  let best=null,runner=null,legal=0;
  for(let o=0;o<=k.length-min;o++){
    if(hold&&!reachable(pre,k,o,sign))continue;
    const q=viterbi(pre,k,sign,hold,log,{j:o,carry:0,a:29,b:29});
    if(!q)continue;legal++;
    const v={...q,o};
    if(!best||v.s>best.s){runner=best;best=v;}else if(!runner||v.s>runner.s)runner=v;
  }
  if(!best)return {legal,split,holdout:suf.length};
  assert(eq(encode(digits(best.path),k,best.o,sign,hold),pre),"prefix replay");
  const v=viterbi(suf,k,sign,hold,log,best);
  if(v)assert(eq(encode(digits(best.path+v.path),k,best.o,sign,hold),c),"whole replay");
  const render=p=>p.map(x=>lp2.translit[x]).join(" ");
  return {legal,split,holdout:suf.length,origin:best.o,endKey:best.j,carry:best.carry,prefixScore:best.s/split,runnerMargin:runner?best.s-runner.s:null,suffixScore:v?v.s/suf.length:null,prefix:render(digits(best.path).slice(0,90)),suffix:v?render(digits(v.path)):null,plain:v?digits(best.path+v.path):null,prefixMatches:truth?digits(best.path).filter((x,i)=>x===truth[i]).length:null,suffixMatches:truth&&v?digits(v.path).filter((x,i)=>x===truth[split+i]).length:null};
 }
 const train=[0,2,3,4,6],plants=[],original=[];
 for(const [section,direction,sign,hold,origin] of [[1,1,1,false,457],[5,-1,-1,false,993],[1,-1,1,true,617],[5,1,-1,true,1231]]){
  const k=order(secs.slice(0,7).filter((_,i)=>i!==section).flat(),direction),p=order(secs[section],direction),c=encode(p,k,origin,sign,hold),log=model(train.filter(i=>i!==section).map(i=>order(secs[i],direction)));
  const result=predict(c,k,sign,hold,log,Math.floor(p.length*2/3),p);
  plants.push({section,direction,sign,hold,origin,n:p.length,...result});
 }
 if(plants.some(x=>x.origin!==x.origin||x.prefixMatches!==x.split||x.suffixMatches!==x.holdout))return {plants,original,gate:"native exact recovery failed"};
 for(const [name,pages,split] of [["p0-2",[0,1,2],262],["p54-55",[54,55],232]]){
  const c=pages.flatMap(i=>lp2.pages[i].indices);
  for(const direction of [1,-1]){
   const k=order(key,direction),log=model(train.map(i=>order(secs[i],direction)));
   for(const sign of [1,-1])for(const hold of [false,true]){
    original.push({name,direction,sign,hold,...predict(order(c,direction),k,sign,hold,log,split,null)});
   }
  }
 }
 return {plants,original,gate:"native recovery passed"};
}
console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/transcriptions/lp1_wulfic_canonical.txt")),null,2));
