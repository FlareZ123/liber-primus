'use strict';
const fs=require('node:fs');
const {core,paths}=require('./lp2_q8_latent_independent_phase_sft.cjs');
function attack({donors,dict,decode,encodeWord,rng,corpus,latin}) {
 const q=8,cut=223,keep=48,pow=29**(q-1);
 const buckets=Array.from({length:25},()=>[]);let total=0;
 for(const [s,w] of dict){const a=s.split(",").map(Number),m=a.filter(x=>x!==0).length;total+=w;if(m===3||m===4||m>=q)buckets[a.length].push({a,w,m});}
 function code(a){let id=0;for(const x of a)id=id*29+x;return id;}
 function canonical(a){let id=code(a),best=id;for(let j=0;j<q-1;j++){id=(id%pow)*29+Math.floor(id/pow);best=Math.min(best,id);}return best;}
 function digits(id){const a=Array(q);for(let i=q-1;i>=0;i--){a[i]=id%29;id=Math.floor(id/29);}return a;}
 function rank(c) {
  const votes3=new Float64Array(29**3),votes4=new Float64Array(29**4),seeds=new Map(),tmp=new Int32Array(q);let align=0;
  for(let i=0;i<c.length;i++)for(let l=3;l<=24&&i+l<=c.length;l++)for(const {a,w,m} of buckets[l]){
    let n=0,good=true;for(let j=0;j<l;j++){const p=a[j],x=c[i+j];if(p===0){if(x!==0){good=false;break;}continue;}const d=(x-p+29)%29;if(n<q)tmp[n]=d;else if(tmp[n%q]!==d){good=false;break;}n++;}
    if(!good)continue;align++;
    if(m===3||m===4){let id=0;for(let j=0;j<m;j++)id=id*29+tmp[j];(m===3?votes3:votes4)[id]+=w/total;continue;}
    const id=canonical(tmp),old=seeds.get(id);
    if(old===undefined)seeds.set(id,256+i);
    else if((old%256)!==i)seeds.set(id,old-old%256+256+i);
  }
  function score(id,count){const a=digits(id);let v=0;for(let j=0;j<q;j++){let s=(a[j]*29+a[(j+1)%q])*29+a[(j+2)%q];v+=Math.log1p(votes3[s]*2000)+2*Math.log1p(votes4[s*29+a[(j+3)%q]]*2000);}return v+3*Math.log(count);}
  const top=[];for(const [id,v] of seeds){const count=Math.floor(v/256),s=score(id,count);if(top.length<keep||s>top[top.length-1].s){top.push({id,s,count});top.sort((a,b)=>b.s-a.s||a.id-b.id);if(top.length>keep)top.pop();}}
  return {top,candidates:seeds.size,align,score,counts:seeds};
 }
 function assess(c,truth,key,bounds,tag){const z=rank(c.slice(0,cut));const id=key?canonical(key):null;const cand=z.top.map(x=>({...x,key:digits(x.id),d:decode(c,digits(x.id),cut)})).sort((a,b)=>b.d.prefix-a.d.prefix);if(!cand.length)return {tag,candidates:0,truthSeeded:false,selected:null};const best=cand[0],d=best.d,ends=new Set(d.words.map(e=>e.i+e.plain.length)),right=bounds?bounds.filter(x=>x>cut):[],pred=[...ends].filter(x=>x>cut),hit=right.filter(x=>ends.has(x)).length;
  return {tag,candidates:z.candidates,align:z.align,truthSeeded:id===null?null:z.counts.has(id),truthSupport:id===null?null:Math.floor((z.counts.get(id)||0)/256),truthRank:id===null?null:z.top.findIndex(x=>x.id===id)+1,truthKey:key?digits(id):null,selected:best.key,correct:id===null?null:best.id===id,fit:d.fit,held:d.held,heldAccuracy:truth?truth.slice(cut).filter((x,i)=>x===d.plain[cut+i]).length/(c.length-cut):null,heldBoundaryF1:truth?2*hit/(right.length+pred.length):null,decoded:d.words.map(e=>e.plain.map(x=>latin[x]).join("")).join(" "),fallback:d.fallback,top:cand.slice(0,5).map(x=>({key:x.key,seedScore:x.s,support:x.count,fit:x.d.fit,held:x.d.held}))};
 }
 const controls=[];
 for(let d=0;d<donors.length;d++){
  const a=donors[d];let found;for(let i=Math.floor(a.length*.8);i<a.length;i++){let count=0,j=i;while(j<a.length&&count<299)count+=a[j++].length;if(count===299){found=a.slice(i,j);break;}}
  if(!found)throw Error("no held-out window");const rnd=rng(0x4c29d800+d),truth=found.flat(),key=Array.from({length:q},()=>Math.floor(rnd()*29)),bounds=[];let pos=0;for(const w of found){pos+=w.length;bounds.push(pos);}
  const c=found.flatMap(w=>encodeWord(w,key,Math.floor(rnd()*q)));controls.push(assess(c,truth,key,bounds,"donor"+d));const pad=truth.map(p=>(p+Math.floor(rnd()*29))%29);controls.push(assess(pad,null,null,null,"pad"+d));
 }
 const positive=controls.filter(x=>x.truthKey),negative=controls.filter(x=>!x.truthKey),gate=positive.length===3&&positive.every(x=>x.correct&&x.heldAccuracy>=.85&&x.heldBoundaryF1>=.75&&x.held>Math.max(...negative.map(y=>y.held)));
 const original=gate?assess([...corpus.pages.find(p=>p.page===54).indices.slice(9),...corpus.pages.find(p=>p.page===55).indices],null,null,null,"p54-body+p55"):null;
 return {method:"unknown q8 up to cyclic rotation, >=8-consuming dictionary word seeds, 3/4-consuming lexical vote ranking, top48 prefix exact word marginal",gate,controls,original};
}
console.log(JSON.stringify(core(paths.map(p=>fs.readFileSync(p,'utf8')),attack),null,2));
