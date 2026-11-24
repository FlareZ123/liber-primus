"use strict";
const fs=require("node:fs"),path=require("node:path");
function run(corpus,native,which="all"){
 const L=64,M=5,A=29,mod=x=>(x+29)%29,log29=Math.log(29),rm=new Map(corpus.runes.map((x,i)=>[x,i]));
 const sections=native.sections.map(s=>({name:s.name,p:[...s.source_text].filter(x=>rm.has(x)).map(x=>rm.get(x))}));
 const powers=Array.from({length:M},(_,i)=>128**i);
 function model(exclude){let counts=new Float64Array(A).fill(.5);for(let s of sections)if(!exclude.includes(s.name))for(let x of s.p)counts[x]++;let n=counts.reduce((a,b)=>a+b,0),f=counts[0]/n,p=Float64Array.from(counts,(v,i)=>i?v/(n-counts[0]):0);return {f,p};}
 function fit(C,model){
  const {f,p}=model,lf=Math.log(f),ln=Math.log1p(-f);
  const caches=new Map(),hist=[];
  function emission(c){
   let id=0;for(let x of c)id=id*29+x;let e=caches.get(id);if(e)return e;
   let sum=0,best=-1,key=-1,w=new Float64Array(29);
   for(let k=0;k<29;k++){let x=1;for(let j=0;j<M;j++)x*=p[mod(c[j]-k)];w[k]=x;sum+=x;if(x>best){best=x;key=k}}
   if(!sum)throw Error("emission");
   e={id,key,score:Math.log(sum)+(M-1)*log29,post:Float64Array.from(w,x=>x/sum)};caches.set(id,e);return e;
  }
  let states=new Map([[0,{s:0}]]),maxStates=1,transitions=0;
  for(let k=0;k<L;k++){
   let next=new Map();
   for(const [id,row] of states){
    let h=powers.map(a=>Math.floor(id/a)%128),opts=C.map((c,j)=>{let i=k+h[j],a=[];while(i<c.length){a.push({i,h:i-k,c:c[i]});if(c[i]!==0)break;i++;}return a;});
    if(opts.some(a=>!a.length))continue;
    let cs=new Int8Array(M);
    function choose(j,nid,skips){
     if(j===M){transitions++;let e=emission(cs),s=row.s+e.score+skips*lf+M*ln,old=next.get(nid);if(!old||s>old.s)next.set(nid,{s,prev:id,e});return;}
     for(const a of opts[j]){if(a.h>=128)throw Error("hold packing");cs[j]=a.c;choose(j+1,nid+a.h*powers[j],skips+a.h-h[j]);}
    }
    choose(0,0,0);
   }
   if(!next.size)return {failedAt:k,maxStates,transitions};hist.push(next);states=next;maxStates=Math.max(maxStates,next.size);
  }
  let best=-Infinity,id=-1;for(const [x,r] of states)if(r.s>best){best=r.s;id=x;}
  let holds=powers.map(a=>Math.floor(id/a)%128),keys=[],post=[],align=[];
  for(let k=L-1;k>=0;k--){let r=hist[k].get(id);keys.push(r.e.key);post.push([...r.e.post]);align.push(powers.map(a=>k+Math.floor(id/a)%128));id=r.prev}
  keys.reverse();post.reverse();align.reverse();
  return {score:best,keys,post,holds,align,maxStates,transitions,emissions:caches.size};
 }
 function predict(c,post,{f,p}){
  // Frozen posterior predictive Viterbi and forward sum for held-out page.
  let states=new Map([[0,{sum:1,best:0,prev:-1}]]),hist=[],logNorm=0;
  for(let k=0;k<L;k++){
   const probs=new Float64Array(29),bestP=new Int8Array(29),bestVal=new Float64Array(29);
   for(let x=0;x<29;x++){for(let u=1;u<29;u++){let v=p[u]*post[k][mod(x-u)];probs[x]+=v;if(v>bestVal[x]){bestVal[x]=v;bestP[x]=u}}}
   let next=new Map();
   for(const [h,r] of states){let i=k+h,s=0;
    while(i<c.length){let x=c[i],prior=(1-f)*f**s,weight=prior*probs[x]*29,b=bestVal[x];if(weight>0&&b>0){let z=i-k,v=r.sum*weight,m=r.best+Math.log(prior*b*29),a=next.get(z);if(!a)next.set(z,{sum:v,best:m,prev:h,p:bestP[x],pos:i});else{a.sum+=v;if(m>a.best)Object.assign(a,{best:m,prev:h,p:bestP[x],pos:i})}}if(x!==0)break;i++;s++;}
   }
   let sum=[...next.values()].reduce((a,r)=>a+r.sum,0);if(!sum)return {failedAt:k};logNorm+=Math.log(sum);for(let r of next.values())r.sum/=sum;hist.push(next);states=next;
  }
  let h=-1,b=-Infinity;for(const [z,r] of states)if(r.best>b){b=r.best;h=z;}
  let ptext=[],positions=[],keys=[];
  for(let k=L-1;k>=0;k--){let r=hist[k].get(h);ptext.push(r.p);positions.push(r.pos);keys.push(mod(c[r.pos]-r.p));h=r.prev}
  ptext.reverse();positions.reverse();keys.reverse();
  return {score:logNorm,MAPscore:b,ptext,positions,keys};
 }
 let seed=0x37a9142b;
 function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 function plant(p,key){let c=[],pos=[],j=0;for(let i=0;i<p.length&&j<L+8;i++){if(!p[i])c.push(0);else{pos.push(c.length);c.push((p[i]+key[j++])%29)}}if(j<L)throw Error("short plant");return {c,pos};}
 const groups=[[0,1,2,3,4,5],[1,2,3,4,5,8],[0,3,4,5,8,1]];
 const result={L,fitPages:[9,10,11,12,13],heldoutPage:14,controls:[]};
 if(which==="all"||which.startsWith("control"))for(let q=0;q<groups.length;q++){
  if(which!=="all"&&which!=="control"+q)continue;
  const selected=groups[q].map(i=>sections[i]),lm=model(selected.map(x=>x.name));
  for(const shared of [true,false]){
   let key=Array.from({length:L+8},()=>rnd()%29),plants=selected.map(s=>plant(s.p,shared?key:Array.from({length:L+8},()=>rnd()%29)));
   let f=fit(plants.slice(0,M).map(p=>p.c),lm);if(!f.keys){result.controls.push({q,shared,failedAt:f.failedAt});continue;}
   let pred=predict(plants[M].c,f.post,lm);
   let correct=0,alignment=0,correctHold=0,alignmentHold=0;
   for(let k=0;k<L;k++){if(f.keys[k]===key[k])correct++;for(let j=0;j<M;j++)if(f.align[k][j]===plants[j].pos[k])alignment++;if(pred.positions?.[k]===plants[M].pos[k]){alignmentHold++;let trueP=selected[M].p.filter(x=>x!==0)[k];if(pred.ptext[k]===trueP)correctHold++;}}
   result.controls.push({q,shared,sections:selected.map(x=>x.name),fitScore:f.score,heldScore:pred.score,correctKey:shared?correct:null,alignment:shared?alignment:null,holdAlignment:shared?alignmentHold:null,holdPlaintext:shared?correctHold:null,holds:f.holds,maxStates:f.maxStates,transitions:f.transitions,emissions:f.emissions,heldFailedAt:pred.failedAt});
  }
 }
 if(which==="all"||which==="original"){
  const C=Array.from({length:6},(_,i)=>corpus.pages.find(p=>p.page===i+9).indices),lm=model([]),f=fit(C.slice(0,M),lm);
  if(!f.keys)result.original=f;else{const pred=predict(C[M],f.post,lm);result.original={fitScore:f.score,heldScore:pred.score,heldFailedAt:pred.failedAt,holds:f.holds,maxStates:f.maxStates,transitions:f.transitions,emissions:f.emissions,keys:f.keys,heldPlaintext:pred.ptext?.map(x=>corpus.translit[x]).join(""),heldPositions:pred.positions};}
 }return result;
}
module.exports={run};
if(require.main===module){const r=path.resolve(__dirname,"..");console.log(JSON.stringify(run(JSON.parse(fs.readFileSync(path.join(r,"resources/liber-primus/lp2-corpus.json"),"utf8")),JSON.parse(fs.readFileSync(path.join(r,"resources/external/relikd-solved-gp29-native-v1.json"),"utf8")),process.argv[2]||"all"),null,2))}
