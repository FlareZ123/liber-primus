"use strict";
/** Exact shared multiplicative GP29 pad with held-out fourth lane, both native clocks. */
function experiment(corpus,raw,order=3,mode="all",joint=false,only=-1){
 const R=29,B=28,N=76,mod=x=>(x%R+R)%R,assert=(x,m)=>{if(!x)throw Error(m)};
 const tokens=new Map(corpus.translit.map((x,i)=>[x,i]));
 function tokenize(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");for(let i=0;i<w.length;){const t=w.slice(i,i+2);if(tokens.has(t)){out.push(tokens.get(t));i+=2}else{assert(tokens.has(w[i]),"unmapped token");out.push(tokens.get(w[i++]));}}}return out}
 const donors=raw.map(tokenize),cuts=donors.map(t=>Math.floor(t.length*.67));
 const counts=Array.from({length:order},(_,i)=>new Uint32Array(R**(i+1)));
 for(let d=0;d<donors.length;d++){const a=donors[d];for(let i=0;i<cuts[d];i++){let n=0,q=1;for(let o=0;o<order&&o<=i;o++){n+=a[i-o]*q;q*=R;counts[o][n]++}}}
 const weights=[.05,1,4,10],total=counts[0].reduce((a,b)=>a+b,0),prob=[Float64Array.from(counts[0],v=>(v+weights[0])/(total+R*weights[0]))];
 for(let o=1;o<order;o++){const c=counts[o],p=new Float64Array(c.length),back=R**o;for(let a=0;a<c.length;a+=R){let sum=weights[o];for(let v=0;v<R;v++)sum+=c[a+v];for(let v=0;v<R;v++)p[a+v]=(c[a+v]+weights[o]*prob[o-1][(a+v)%back])/sum;}prob.push(p)}
 const lm=prob.map(a=>Float64Array.from(a,Math.log));
 function score(t){let s=0;for(let i=0;i<t.length;i++){let n=0,q=1;for(let o=0;o<order&&o<=i;o++){n+=t[i-o]*q;q*=R;}s+=lm[Math.min(order-1,i)][n]}return s}
 const inv=Array.from({length:B},(_,i)=>{for(let j=1;j<R;j++)if((i+1)*j%R===1)return j;throw Error("inverse")});
 const maps=Array.from({length:R},(_,c)=>Int32Array.from(inv,k=>c*k%R));
 const m=order-1,states=B**m,tail=B**(m-1);
 const digits=Array.from({length:m},(_,d)=>Uint8Array.from({length:states},(_,s)=>Math.floor(s/B**d)%B));
 function exact(ct,hold){
  assert(ct.length>=2&&ct.every(t=>t.length===N),"lane dimensions");
  const times=ct.map(t=>{let j=-1;return t.map(c=>{if(!hold||c!==0)j++;return j})});
  const L=1+Math.max(...times.map(t=>t[t.length-1]));
  const events=Array.from({length:L},()=>[]);let constant=0;
  for(let t=0;t<ct.length;t++)for(let r=0;r<N;r++){
   const o=Math.min(order,r+1),at=times[t][r];
   if(at<0){assert(ct[t].slice(0,r+1).every(v=>v===0),"leading zero");constant+=lm[o-1][0];continue;}
   const tab=Array.from({length:o},()=>new Int32Array(B));
   for(let j=0;j<o;j++){const c=ct[t][r-j];if(c===0)continue;const lag=at-times[t][r-j];assert(lag>=0&&lag<o,"finite key lag");const q=R**j;for(let k=0;k<B;k++)tab[lag][k]+=q*maps[c][k];}
   events[at].push({tab,l:lm[o-1]});
  }
  let dp=new Float64Array(states),next=new Float64Array(states);dp.fill(-Infinity);dp[0]=constant;
  const back=Array.from({length:L},()=>new Uint16Array(states));
  for(let i=0;i<L;i++){
   const es=events[i],bases=es.map(e=>{const a=new Int32Array(states);for(let d=1;d<e.tab.length;d++){const v=e.tab[d],ix=digits[d-1];for(let s=0;s<states;s++)a[s]+=v[ix[s]]}return a});
   next.fill(-Infinity);const bt=back[i];
   for(let s=0;s<states;s++){const prior=dp[s];if(!Number.isFinite(prior))continue;const q=(s%tail)*B;
    if(es.length===3){const a=es[0],b=es[1],c=es[2],la=a.l,lb=b.l,lc=c.l,xa=a.tab[0],xb=b.tab[0],xc=c.tab[0],ba=bases[0][s],bb=bases[1][s],bc=bases[2][s];for(let k=0;k<B;k++){const val=prior+la[ba+xa[k]]+lb[bb+xb[k]]+lc[bc+xc[k]];if(val>next[q+k]){next[q+k]=val;bt[q+k]=s}}}
    else if(es.length===4){const a=es[0],b=es[1],c=es[2],d=es[3],la=a.l,lb=b.l,lc=c.l,ld=d.l,xa=a.tab[0],xb=b.tab[0],xc=c.tab[0],xd=d.tab[0],ba=bases[0][s],bb=bases[1][s],bc=bases[2][s],bd=bases[3][s];for(let k=0;k<B;k++){const val=prior+la[ba+xa[k]]+lb[bb+xb[k]]+lc[bc+xc[k]]+ld[bd+xd[k]];if(val>next[q+k]){next[q+k]=val;bt[q+k]=s}}}
    else {for(let k=0;k<B;k++){let val=prior;for(let e=0;e<es.length;e++)val+=es[e].l[bases[e][s]+es[e].tab[0][k]];if(val>next[q+k]){next[q+k]=val;bt[q+k]=s}}}
   }
   [dp,next]=[next,dp];
  }
  let s=0;for(let i=1;i<states;i++)if(dp[i]>dp[s])s=i;const best=dp[s],key=new Array(L);
  for(let i=L-1;i>=0;i--){key[i]=s%B+1;s=back[i][s]}
  const p=ct.map(t=>decrypt(t,key,hold));
  const check=p.reduce((a,t)=>a+score(t),0);assert(Math.abs(best-check)<1e-7,"DP traceback score");
  assert(ct.every((t,i)=>JSON.stringify(t)===JSON.stringify(encrypt(p[i],key,hold))),"forward replay");
  return {key,p,score:best,mean:best/(N*ct.length)};
 }
 function decrypt(c,k,h){let j=0;return c.map(v=>{if(h&&v===0)return 0;assert(j<k.length,"unidentified key tail");return v*inv[k[j++]-1]%R})}
 function encrypt(p,k,h){let j=0;return p.map(v=>{if(h&&v===0)return 0;assert(j<k.length,"key short");return v*k[j++]%R})}
 const act=(t,h)=>h?t.filter(Boolean).length:t.length;
 const p27=corpus.pages.find(p=>p.page===27).indices,p55=corpus.pages.find(p=>p.page===55).indices;
 assert(p27.length===234&&p55.length===76&&String(p27.slice(28,34))===String(p55.slice(70)),"source seam");
 const rest=p27.slice(34).concat(p27.slice(0,28)),I=Array.from({length:N},(_,i)=>i);
 const layouts=[
 ["marker-contiguous",[rest.slice(0,N),rest.slice(N,2*N),rest.slice(2*N),p55]],
 ["marker-interleaved",[0,1,2].map(j=>I.map(i=>rest[3*i+j])).concat([p55])],
 ["row-outer-trim",[0,1,2].map(j=>I.map(i=>p27[78*j+i+1])).concat([p55])],
 ["triple-outer-trim",[0,1,2].map(j=>I.map(i=>p27[3*(i+1)+j])).concat([p55])]];
 let seed=0x5eeda331;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return 1+Math.floor(seed/4294967296*B)};
 const fmt=t=>t.map(i=>corpus.translit[i]).join("");
 const out={order,cuts,joint,only,control:[],original:[]};
 for(const hold of [false,true]){
  if(mode==="all"||mode==="controls")for(let j=0;j<4;j++){
   const p=Array.from({length:4},(_,t)=>{const d=(j+t)%donors.length,off=cuts[d]+1000+j*1500+t*350;return donors[d].slice(off,off+N)});
   // A predetermined holdout lane must not demand a key tail beyond the fitting lanes.
   // If needed, rotate lane roles so the largest consuming length is in the fit.
   const longest=p.reduce((best,t,i)=>act(t,hold)>act(p[best],hold)?i:best,0);if(longest===3)[p[0],p[3]]=[p[3],p[0]];
   const key=Array.from({length:N},rnd),ct=p.map(t=>encrypt(t,key,hold));
   if(only>=0&&only!==j+4*Number(hold))continue;
   const hit=exact(joint?ct:ct.slice(0,3),hold),q=decrypt(ct[3],hit.key,hold);
   assert(hit.score+1e-7>=p.slice(0,joint?4:3).reduce((a,t)=>a+score(t),0),"MAP below truth");
   const good=hit.key.filter((v,i)=>v===key[i]).length,match=(a,b)=>a.filter((v,i)=>v===b[i]).length;
   out.control.push({hold,j,truthFitMean:p.slice(0,joint?4:3).reduce((a,t)=>a+score(t),0)/(N*(joint?4:3)),fitKeyLength:hit.key.length,fitKeyExact:good,fitRunes:hit.p.reduce((a,t,i)=>a+match(t,p[i]),0),heldExact:match(q,p[3]),heldMean:score(q)/N,trueHeldMean:score(p[3])/N,fitMean:hit.mean,held:fmt(q),truth:fmt(p[3])})
  }
  if(mode==="all"||mode==="original")for(const [ix,[name,ct]] of layouts.entries()){
   if(only>=0&&only!==ix+4*Number(hold))continue;
   const hit=exact(joint?ct:ct.slice(0,3),hold),q=decrypt(ct[3],hit.key,hold);
   assert(String(encrypt(q,hit.key,hold))===String(ct[3]),"held replay");
   out.original.push({hold,name,fitMean:hit.mean,heldMean:score(q)/N,key:hit.key,fit:hit.p.map(fmt),held:fmt(q),heldIndices:q,active:ct.map(t=>act(t,hold))});
  }
 }
 return out;
}
module.exports={experiment};
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.join(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),["shakespeare_first300k.txt","gibran_prophet_58585.txt","emerson_essays_2944.txt"].map(x=>read("resources/control/"+x)),Number(process.argv[2]||3),process.argv[3]||"all",process.argv[4]==="joint",Number(process.argv[5]??-1)),null,2));}
