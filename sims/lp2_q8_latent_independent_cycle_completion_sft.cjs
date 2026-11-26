'use strict';
const fs=require('node:fs');
const {core,paths}=require('./lp2_q8_latent_independent_phase_sft.cjs');
function attack({donors,dict,decode,encodeWord,rng,corpus,latin}) {
 const q=8,cut=223,keep=64,pow=29**(q-1);
 const buckets=Array.from({length:25},()=>[]);let total=0;
 for(const [s,w] of dict){const a=s.split(",").map(Number),m=a.filter(x=>x!==0).length;total+=w;if(m===3||m===4||m>=6)buckets[a.length].push({a,w,m});}
 function code(a){let id=0;for(const x of a)id=id*29+x;return id;}
 function canonical(a){let id=code(a),best=id;for(let j=0;j<q-1;j++){id=(id%pow)*29+Math.floor(id/pow);best=Math.min(best,id);}return best;}
 function digits(id){const a=Array(q);for(let i=q-1;i>=0;i--){a[i]=id%29;id=Math.floor(id/29);}return a;}
 function rank(c) {
  const votes3=new Float64Array(29**3),votes4=new Float64Array(29**4),seeds=new Map(),fragments=[new Map(),new Map()],tmp=new Int32Array(q);let align=0;
  for(let i=0;i<c.length;i++)for(let l=3;l<=24&&i+l<=c.length;l++)for(const {a,w,m} of buckets[l]){
    let n=0,good=true;for(let j=0;j<l;j++){const p=a[j],x=c[i+j];if(p===0){if(x!==0){good=false;break;}continue;}const d=(x-p+29)%29;if(n<q)tmp[n]=d;else if(tmp[n%q]!==d){good=false;break;}n++;}
    if(!good)continue;align++;
    if(m===3||m===4){let id=0;for(let j=0;j<m;j++)id=id*29+tmp[j];(m===3?votes3:votes4)[id]+=w/total;continue;}
    if(m===6||m===7){const id=code(tmp.slice(0,m)),map=fragments[m-6],old=map.get(id);if(old===undefined)map.set(id,256+i);else if(old%256!==i)map.set(id,old-old%256+256+i);continue;}
    const id=canonical(tmp),old=seeds.get(id);
    if(old===undefined)seeds.set(id,256+i);
    else if((old%256)!==i)seeds.set(id,old-old%256+256+i);
  }
  function score(id,count){const a=digits(id);let v=0;for(let j=0;j<q;j++){let s=(a[j]*29+a[(j+1)%q])*29+a[(j+2)%q];v+=Math.log1p(votes3[s]*2000)+2*Math.log1p(votes4[s*29+a[(j+3)%q]]*2000);}return v+3*Math.log(count);}
  function fragScore(id,m,count){const a=Array(m);for(let j=m-1;j>=0;j--){a[j]=id%29;id=Math.floor(id/29);}let v=0;for(let j=0;j+3<=m;j++){const h=(a[j]*29+a[j+1])*29+a[j+2];v+=Math.log1p(votes3[h]*2000);if(j+4<=m)v+=2*Math.log1p(votes4[h*29+a[j+3]]*2000);}return v+3*Math.log(count);}
  const extra=new Set();const fragmentStats=[];for(let m=6;m<=7;m++){const map=fragments[m-6],topFrag=[],lim=m===6?128:1024;for(const [id,v] of map){const sc=fragScore(id,m,Math.floor(v/256));if(topFrag.length<lim||sc>topFrag[topFrag.length-1].sc){topFrag.push({id,sc});topFrag.sort((a,b)=>b.sc-a.sc||a.id-b.id);if(topFrag.length>lim)topFrag.pop();}}for(const {id} of topFrag){for(let t=0;t<29**(q-m);t++){const k=canonical(digits(id*29**(q-m)+t));extra.add(k);}}fragmentStats.push({m,distinct:map.size,retained:topFrag.length});}
  const top=[];for(const [id,v] of seeds){const count=Math.floor(v/256),s=score(id,count);if(top.length<keep||s>top[top.length-1].s){top.push({id,s,count});top.sort((a,b)=>b.s-a.s||a.id-b.id);if(top.length>keep)top.pop();}}
  for(const id of extra){if(seeds.has(id))continue;const sc=score(id,1);if(top.length<keep||sc>top[top.length-1].s){top.push({id,s:sc,count:0});top.sort((a,b)=>b.s-a.s||a.id-b.id);if(top.length>keep)top.pop();}}
  const neighbors=new Set();for(const {id} of top){const a=digits(id);for(let i=0;i<q;i++){const x=a[i];for(let y=0;y<29;y++){a[i]=y;neighbors.add(canonical(a));}a[i]=x;}}for(const id of neighbors){if(top.some(x=>x.id===id))continue;const count=Math.floor((seeds.get(id)||0)/256),sc=score(id,Math.max(1,count));if(sc>top[top.length-1].s){top.push({id,s:sc,count});top.sort((a,b)=>b.s-a.s||a.id-b.id);top.pop();}}
  return {top,candidates:seeds.size,align,score,counts:seeds,fragmentStats,extra:extra.size,neighbors:neighbors.size};
 }
 function assess(c,truth,key,bounds,tag){const z=rank(c.slice(0,cut));const id=key?canonical(key):null;const cand=z.top.map(x=>({...x,key:digits(x.id),d:decode(c.slice(0,cut),digits(x.id),cut)})).sort((a,b)=>b.d.prefix-a.d.prefix);if(!cand.length)return {tag,candidates:0,truthSeeded:false,selected:null};const best=cand[0],d=decode(c,best.key,cut),ends=new Set(d.words.map(e=>e.i+e.plain.length)),right=bounds?bounds.filter(x=>x>cut):[],pred=[...ends].filter(x=>x>cut),hit=right.filter(x=>ends.has(x)).length;
  return {tag,candidates:z.candidates,align:z.align,fragments:z.fragmentStats,completed:z.extra,neighbors:z.neighbors,truthSeeded:id===null?null:z.counts.has(id),truthSupport:id===null?null:Math.floor((z.counts.get(id)||0)/256),truthRank:id===null?null:z.top.findIndex(x=>x.id===id)+1,truthKey:key?digits(id):null,selected:best.key,correct:id===null?null:best.id===id,fit:d.fit,held:d.held,heldAccuracy:truth?truth.slice(cut).filter((x,i)=>x===d.plain[cut+i]).length/(c.length-cut):null,heldBoundaryF1:truth?2*hit/(right.length+pred.length):null,decoded:d.words.map(e=>e.plain.map(x=>latin[x]).join("")).join(" "),fallback:d.fallback,top:cand.slice(0,5).map(x=>({key:x.key,seedScore:x.s,support:x.count,fit:x.d.fit,held:null}))};
 }
 const controls=[];
 for(let d=0;d<donors.length;d++){
  const a=donors[d];let found;for(let i=Math.floor(a.length*.8)+300;i<a.length;i++){let count=0,j=i;while(j<a.length&&count<299)count+=a[j++].length;if(count===299){found=a.slice(i,j);break;}}
  if(!found)throw Error("no held-out window");const rnd=rng(0x7b29d800+d),truth=found.flat(),key=Array.from({length:q},()=>Math.floor(rnd()*29)),bounds=[];let pos=0;for(const w of found){pos+=w.length;bounds.push(pos);}
  const c=found.flatMap(w=>encodeWord(w,key,Math.floor(rnd()*q)));controls.push(assess(c,truth,key,bounds,"donor"+d));const pad=truth.map(p=>(p+Math.floor(rnd()*29))%29);controls.push(assess(pad,null,null,null,"pad"+d));
 }
 const positive=controls.filter(x=>x.truthKey),negative=controls.filter(x=>!x.truthKey),gate=positive.length===3&&positive.every(x=>x.correct&&x.heldAccuracy>=.85&&x.heldBoundaryF1>=.75&&x.held>Math.max(...negative.map(y=>y.held)));
 const original=gate?assess([...corpus.pages.find(p=>p.page===54).indices.slice(9),...corpus.pages.find(p=>p.page===55).indices],null,null,null,"p54-body+p55"):null;
 return {method:"unknown q8 rotation; 6/7 fragment completion, >=8-consuming word seeds, one-digit neighbor expansion; 3/4 lexical votes, top64 exact prefix marginal",gate,controls,original};
}
console.log(JSON.stringify(core(paths.map(p=>fs.readFileSync(p,'utf8')),attack),null,2));
