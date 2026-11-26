'use strict';
const fs=require('node:fs');
const {core,paths}=require('./lp2_q8_latent_independent_phase_sft.cjs');
function recoverCycle({donors,dict,decode,encodeWord,rng,corpus,latin},which="0+"){
 const q=13,cut=515,n=716,abc="0123456789abcdefghijklmnopqrs",beam=512,retain=96;
 const buckets=Array.from({length:25},()=>[]);let total=0;
 for(const [s,w] of dict){const a=s.split(",").map(Number),m=a.filter(x=>x!==0).length;total+=w;if(m>=3)buckets[a.length].push({a,w,m});}
 function canon(s){let best=s;for(let i=1;i<s.length;i++){const t=s.slice(i)+s.slice(0,i);if(t<best)best=t;}return best;}
 const asKey=s=>[...s].map(ch=>abc.indexOf(ch));
 function rank(c){
  const votes=[new Float32Array(29**3),new Float32Array(29**4),new Float32Array(29**5)],tmp=new Int32Array(q);let short=0,long=0;
  function scan(shortPass,cb){for(let i=0;i<c.length;i++)for(let l=3;l<=24&&i+l<=c.length;l++)for(const {a,w,m} of buckets[l]){
   if(shortPass?(m>5):(m<6))continue;let t=0,ok=true;for(let j=0;j<l;j++){const p=a[j],x=c[i+j];if(!p){if(x){ok=false;break;}continue;}const k=(x-p+29)%29;if(t<q)tmp[t]=k;else if(tmp[t%q]!==k){ok=false;break;}t++;}if(ok)cb(tmp,Math.min(t,q),w);
  }}
  scan(true,(a,m,w)=>{let id=0;for(let j=0;j<m;j++)id=id*29+a[j];votes[m-3][id]+=w/total;short++;});
  const factors=[100,1000,10000],mult=[1,2,3];
  for(let k=0;k<3;k++){const a=votes[k];for(let i=0;i<a.length;i++)if(a[i])a[i]=mult[k]*Math.log1p(a[i]*factors[k]);}
  const [v3,v4,v5]=votes;
  function scoreFast(a,len){let s=0,h3=0,h4=0,h5=0;for(let i=0;i<len;i++){const d=a[i];h3=(h3%841)*29+d;h4=(h4%24389)*29+d;h5=(h5%707281)*29+d;if(i>=2)s+=v3[h3];if(i>=3)s+=v4[h4];if(i>=4)s+=v5[h5];}return s;}
  function score(a,cyclic=false){let sum=0;for(let k=3;k<=5;k++){const seen=new Set(),v=votes[k-3];for(let i=0;i<(cyclic?a.length:a.length-k+1);i++){let id=0;for(let j=0;j<k;j++)id=id*29+a[(i+j)%a.length];if(!seen.has(id)){sum+=v[id];seen.add(id);}}}return sum;}
  const seeds=Array.from({length:q+1},()=>({rows:[],set:new Set()}));
  function worth(list,sc,limit){return list.rows.length<limit||sc>list.rows[list.rows.length-1].sc;}
  function push(list,s,sc,limit){if(!worth(list,sc,limit)||list.set.has(s))return;list.rows.push({s,sc});list.set.add(s);list.rows.sort((a,b)=>b.sc-a.sc||a.s.localeCompare(b.s));if(list.rows.length>limit)list.set.delete(list.rows.pop().s);}
  const a5=new Int32Array(5);
  for(let id=0;id<v5.length;id++)if(v5[id]>0){let x=id;for(let j=4;j>=0;j--){a5[j]=x%29;x=Math.floor(x/29);}const sc=scoreFast(a5,5);if(worth(seeds[5],sc,beam))push(seeds[5],[...a5].map(x=>abc[x]).join(""),score(a5),beam);}
  scan(false,(a,m,w)=>{const sc=scoreFast(a,m);long++;if(worth(seeds[m],sc,beam)||m===q){const v=a.slice(0,m),s=[...v].map(x=>abc[x]).join("");if(m===q){const cyc=score(v,true);push(seeds[m],canon(s),cyc,beam);}else push(seeds[m],s,score(v),beam);}});
  let previous=seeds[5].rows;const stage=[{length:5,seeds:previous.length,best:previous[0]?.sc}];
  for(let len=6;len<=q;len++){
   const next={rows:[],set:new Set()};for(const x of seeds[len].rows)push(next,x.s,x.sc,beam);
   const seen=new Set();for(const x of previous){const a=asKey(x.s);for(let d=0;d<29;d++){const s=x.s+abc[d],id=len===q?canon(s):s;if(seen.has(id))continue;seen.add(id);const k=[...a,d],sc=score(k,len===q);push(next,id,sc,beam);}}
   previous=next.rows;stage.push({length:len,seeds:seeds[len].rows.length,best:previous[0]?.sc});
  }
  const final={rows:[],set:new Set()};for(const x of previous)push(final,x.s,x.sc,retain);
  for(const x of previous.slice(0,32)){const a=asKey(x.s);for(let i=0;i<q;i++){const old=a[i];for(let d=0;d<29;d++){a[i]=d;const sc=score(a,true);if(worth(final,sc,retain))push(final,canon(a.map(t=>abc[t]).join("")),sc,retain);}a[i]=old;}}
  return {top:final.rows,stage,short,long};
 }
 function assess(c,truth,key,bounds,tag){const ranked=rank(c.slice(0,cut));const trueId=key?canon(key.map(x=>abc[x]).join("")):null;const fits=ranked.top.map(x=>({...x,key:asKey(x.s),fit:decode(c.slice(0,cut),asKey(x.s),cut).prefix})).sort((a,b)=>b.fit-a.fit);
  const w=fits[0],d=decode(c,w.key,cut),ends=new Set(d.words.map(e=>e.i+e.plain.length)),right=bounds?bounds.filter(x=>x>cut):[],pred=[...ends].filter(x=>x>cut),hit=right.filter(x=>ends.has(x)).length;
  return {tag,stage:ranked.stage,short:ranked.short,long:ranked.long,truthKey:key?asKey(trueId):null,truthRank:key?ranked.top.findIndex(x=>x.s===trueId)+1:null,correct:key?w.s===trueId:null,selected:w.key,fit:d.fit,held:d.held,heldAccuracy:truth?truth.slice(cut).filter((x,i)=>x===d.plain[cut+i]).length/(n-cut):null,heldBoundaryF1:truth?2*hit/(right.length+pred.length):null,decoded:d.words.map(e=>e.plain.map(x=>latin[x]).join("")).join(" "),fallback:d.fallback,top:fits.slice(0,5).map(x=>({key:x.key,fragmentScore:x.sc,fit:x.fit/cut}))};
 }
 if(which==="original"||which==="fixed"){const body=corpus.pages.filter(p=>p.page<=2).flatMap(p=>p.indices).slice(13);if(body.length!==n||corpus.pages[0].indices.length+corpus.pages[1].indices.length-13!==cut)throw Error("source split");const red=corpus.pages[0].indices.slice(0,13),prime=red.map(x=>corpus.prime[x]%29),koan=[0,10,4,0,1,19,0,18,4,18,9,0,18];const fixed=[["red13",red],["red13-prime",prime],["KOAN",koan]].flatMap(([name,k])=>[[name+"+",k],[name+"-",k.map(x=>(29-x)%29)]]).map(([name,k])=>({name,...decode(body,k,cut)})).map(x=>({name:x.name,fit:x.fit,held:x.held}));return which==="fixed"?{fixed}:{unknown:assess(body,null,null,null,"p0–2"),fixed};}
 const d=Number(which[0]),a=donors[d];let found;for(let i=Math.floor(a.length*.8)+700;i<a.length;i++){let count=0,j=i;while(j<a.length&&count<n)count+=a[j++].length;if(count===n){found=a.slice(i,j);break;}}if(!found)throw Error("no donor window");
 const rnd=rng(0x6c13d800+d),truth=found.flat(),key=Array.from({length:q},()=>Math.floor(rnd()*29)),bounds=[];let pos=0;for(const w of found){pos+=w.length;bounds.push(pos);}const c=found.flatMap(w=>encodeWord(w,key,Math.floor(rnd()*q))),pad=truth.map(p=>(p+Math.floor(rnd()*29))%29);
 return which[1]==="+"?assess(c,truth,key,bounds,"donor"+d):assess(pad,null,null,null,"pad"+d);
}
const which=process.argv[2]??'0+';
console.log(JSON.stringify(core(paths.map(p=>fs.readFileSync(p,'utf8')),x=>recoverCycle(x,which)),null,2));
