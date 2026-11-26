'use strict';
const fs=require('node:fs');
const {core,paths}=require('./lp2_q8_latent_independent_phase_sft.cjs');
function recoverShiftCycle({donors,dict,rng,corpus,latin},which="0+"){
 const q=5,abc="0123456789abcdefghijklmnopqrs",cut=515,n=716,mod=x=>(x%29+29)%29;
 const words=Array.from({length:25},()=>[]),trie=[{next:new Int32Array(29).fill(-1),term:0,mass:0,word:null}];let total=0;
 for(const [s,w] of dict)total+=w;
 for(const [s,w] of dict){const a=s.split(",").map(Number),p=.95*w/total;words[a.length].push({d:a.slice(1).map((x,i)=>mod(x-a[i])),p});let t=0;trie[0].mass+=p;for(const x of a){let j=trie[t].next[x];if(j<0){j=trie.length;trie[t].next[x]=j;trie.push({next:new Int32Array(29).fill(-1),term:0,mass:0,word:null});}t=j;trie[t].mass+=p;}trie[t].term+=p;trie[t].word=a;}
 const code=a=>a.reduce((v,x)=>v*29+x,0);
 function canon(a){let v=code(a),best=v;for(let i=1;i<q;i++){v=(v%29**(q-1))*29+Math.floor(v/29**(q-1));best=Math.min(best,v);}return best;}
 function digits(x){const a=Array(q);for(let i=q-1;i>=0;i--){a[i]=x%29;x=Math.floor(x/29);}return a;}
 function rank(c){const d=c.slice(1).map((x,i)=>mod(x-c[i])),v2=new Float64Array(29**2),v3=new Float64Array(29**3),v4=new Float64Array(29**4),v5=new Float64Array(29**4),sup=new Uint32Array(29**4);let align=0,full=0;
  for(let i=0;i<d.length;i++)for(let len=3;len<=24&&i+len<=c.length;len++)for(const {d:p,p:w} of words[len]){
   const m=len-1,a=mod(d[i]-p[0]),b=mod(d[i+1]-p[1]),h2=a*29+b;
   if(m===2){v2[h2]+=w;align++;continue;}const z=mod(d[i+2]-p[2]),h3=h2*29+z;
   if(m===3){v3[h3]+=w;align++;continue;}const e=mod(d[i+3]-p[3]),h4=h3*29+e;
   if(m===4){v4[h4]+=w;align++;continue;}const f=mod(-a-b-z-e);if(mod(d[i+4]-p[4])!==f)continue;
   const key=[a,b,z,e,f];let ok=true;for(let j=5;j<m;j++)if(mod(d[i+j]-p[j])!==key[j%q]){ok=false;break;}if(!ok)continue;const id=Math.floor(canon(key)/29);v5[id]+=w;sup[id]++;full++;align++;
  }
  const rows=[];let cycles=0;
  for(let h=0;h<29**4;h++){let x=h,a=Array(q);for(let i=3;i>=0;i--){a[i]=x%29;x=Math.floor(x/29);}a[4]=mod(-a[0]-a[1]-a[2]-a[3]);const id=h*29+a[4];if(canon(a)!==id)continue;cycles++;let s=5*Math.log1p(v5[h]*100000)+Math.log1p(sup[h]);for(let j=0;j<q;j++){const h2=a[j]*29+a[(j+1)%q],h3=h2*29+a[(j+2)%q],h4=h3*29+a[(j+3)%q];s+=Math.log1p(v2[h2]*30)+2*Math.log1p(v3[h3]*1000)+3*Math.log1p(v4[h4]*10000);}if(rows.length<96||s>rows[rows.length-1].s){rows.push({id,s,support:sup[h]});rows.sort((a,b)=>b.s-a.s||a.id-b.id);if(rows.length>96)rows.pop();}}
  return {rows,cycles,align,full};
 }
 const lse=(x,y)=>x===-Infinity?y:y===-Infinity?x:Math.max(x,y)+Math.log1p(Math.exp(-Math.abs(x-y)));
 function decode(c,k,split){const n=c.length,fw=Array(n+1).fill(-Infinity),best=fw.slice(),prev=Array(n+1);fw[0]=best[0]=0;let partial=-Infinity;
  for(let i=0;i<n;i++){if(fw[i]===-Infinity)continue;const edges=new Map();
   function add(j,p,word,phase,fallback){if(!(p>0))return;const id=j+":"+word.join(","),old=edges.get(id);if(old){old.p+=p;old.fallback&&=fallback;}else edges.set(id,{j,p,word,phase,fallback});}
   for(let phase=0;phase<q;phase++)for(let p0=0;p0<29;p0++){let t=trie[0].next[p0];if(t<0)continue;let j=i+1,p=p0,r=phase;
    while(true){const node=trie[t];if(node.term)add(j,node.term/(q*29),node.word,phase,false);if(j===split&&i<split){const rem=node.mass-node.term;if(rem>1e-18)partial=lse(partial,fw[i]+Math.log(rem/(q*29)));}if(j===n||j-i===24)break;p=mod(p+c[j]-c[j-1]-k[r]);r=(r+1)%q;t=node.next[p];if(t<0)break;j++;}
   }
   for(let p=0;p<29;p++)add(i+1,.05/(29*29),[p],0,true);
   for(const e of edges.values()){const lp=Math.log(e.p);fw[e.j]=lse(fw[e.j],fw[i]+lp);if(best[i]+lp>best[e.j]){best[e.j]=best[i]+lp;prev[e.j]={...e,i};}}
  }
  const prefix=lse(fw[split],partial),all=fw[n],path=[];for(let j=n;j>0;){const e=prev[j];if(!e)throw Error("no inverse");path.push(e);j=e.i;}path.reverse();
  for(const e of path)for(let j=1;j<e.word.length;j++)if(mod(e.word[j]-e.word[j-1]+k[(e.phase+j-1)%q])!==mod(c[e.i+j]-c[e.i+j-1]))throw Error("replay");
  return {prefix,fit:prefix/split,held:(all-prefix)/(n-split),words:path,plain:path.flatMap(e=>e.word),fallback:path.filter(e=>e.fallback).length};
 }
 function assess(c,truth,key,bounds,tag){const ranked=rank(c.slice(0,cut)),id=key?canon(key):null;const fits=ranked.rows.map(x=>({...x,key:digits(x.id),fit:decode(c.slice(0,cut),digits(x.id),cut).prefix})).sort((a,b)=>b.fit-a.fit);const w=fits[0],d=decode(c,w.key,cut),ends=new Set(d.words.map(e=>e.j)),right=bounds?bounds.filter(x=>x>cut):[],pred=[...ends].filter(x=>x>cut),hit=right.filter(x=>ends.has(x)).length;
  return {tag,cycles:ranked.cycles,align:ranked.align,full:ranked.full,truthKey:key?digits(id):null,truthRank:key?ranked.rows.findIndex(x=>x.id===id)+1:null,correct:key?w.id===id:null,selected:w.key,fit:d.fit,held:d.held,heldAccuracy:truth?truth.slice(cut).filter((x,i)=>x===d.plain[cut+i]).length/(n-cut):null,heldBoundaryF1:truth?2*hit/(right.length+pred.length):null,decoded:d.words.map(e=>e.word.map(x=>latin[x]).join("")).join(" "),fallback:d.fallback,top:fits.slice(0,5).map(x=>({key:x.key,score:x.s,support:x.support,fit:x.fit/cut}))};
 }
 if(which==="original"){const c=corpus.pages.filter(p=>p.page<=2).flatMap(p=>p.indices).slice(13);if(c.length!==n)throw Error("source split");return assess(c,null,null,null,"p0–2");}
 const d=Number(which[0]),a=donors[d];let found;for(let i=Math.floor(a.length*.8)+1200;i<a.length;i++){let count=0,j=i;while(j<a.length&&count<n)count+=a[j++].length;if(count===n){found=a.slice(i,j);break;}}if(!found)throw Error("no donor window");
 const rnd=rng(0x5c29d800+d),truth=found.flat(),offsets=Array.from({length:q},()=>Math.floor(rnd()*29)),key=offsets.map((x,i)=>mod(offsets[(i+1)%q]-x)),bounds=[];let pos=0;for(const w of found){pos+=w.length;bounds.push(pos);}const c=found.flatMap(w=>{const phase=Math.floor(rnd()*q),h=Math.floor(rnd()*29);return w.map((p,j)=>mod(p+h+offsets[(phase+j)%q]));}),pad=truth.map(p=>mod(p+Math.floor(rnd()*29)));
 return which[1]==="+"?assess(c,truth,key,bounds,"donor"+d):assess(pad,null,null,null,"pad"+d);
}
const which=process.argv[2]??'0+';
console.log(JSON.stringify(core(paths.map(p=>fs.readFileSync(p,'utf8')),x=>recoverShiftCycle(x,which)),null,2));
