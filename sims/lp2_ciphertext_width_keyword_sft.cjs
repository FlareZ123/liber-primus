'use strict';
const fs=require('node:fs');
const paths=['resources/liber-primus/lp2-corpus.json','resources/external/relikd-solved-gp29-native-v1.json','resources/control/english_wordfreq_textblob.txt'];
function experiment(gpText,nativeText,lexText,which='original',q=8){
 const gp=JSON.parse(gpText), native=JSON.parse(nativeText), W=gp.translit.map(s=>s.length), alphabet=new Map(gp.runes.map((x,i)=>[x,i]));
 const sections=native.sections.map(s=>[...s.source_text].filter(x=>alphabet.has(x)).map(x=>alphabet.get(x)));
 const mod=x=>(x+29)%29, ALL=(1<<29)-1, fitN=223;
 if(W.join(',')!=='1,1,2,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,2,2,1,1,2,1,2,2')throw Error('unexpected canonical chart');
 function model(ex){
  let u=new Float64Array(29).fill(.5), b=new Float64Array(841), t=new Float64Array(24389);
  for(let j=0;j<sections.length;j++)if(j!==ex){let p=sections[j];for(let i=0;i<p.length;i++){u[p[i]]++;if(i)b[p[i-1]*29+p[i]]++;if(i>1)t[(p[i-2]*29+p[i-1])*29+p[i]]++;}}
  let z=u.reduce((s,v)=>s+v,0);u=u.map(x=>x/z);
  for(let i=0;i<29;i++){let n=10;for(let j=0;j<29;j++)n+=b[i*29+j];for(let j=0;j<29;j++)b[i*29+j]=(b[i*29+j]+10*u[j])/n;}
  for(let i=0;i<841;i++){let n=4;for(let j=0;j<29;j++)n+=t[i*29+j];for(let j=0;j<29;j++)t[i*29+j]=(t[i*29+j]+4*b[(i%29)*29+j])/n;}
  return {u:u.map(Math.log),b:b.map(Math.log),t:t.map(Math.log)};
 }
 function encode(p,k,phase=0){const c=[],h=[];for(let i=0;i<p.length;i++){if(p[i]===0){c.push(0);h.push(i);continue;}let x=(p[i]+k[phase])%29;c.push(x);phase=(phase+W[x])%q;}return {c,h,phase};}
 function score(p,M){let b=M.u[p[0]],t=b;for(let i=1;i<p.length;i++){b+=M.b[p[i-1]*29+p[i]];t+=i===1?M.b[p[0]*29+p[1]]:M.t[(p[i-2]*29+p[i-1])*29+p[i]];}return {b,t};}
 function histories(c,visit){const ph=new Int8Array(c.length),forbid=new Int32Array(q),hold=[];let n=0,pairs=0n;
  function dfs(i,t){if(i===c.length){const d=Array.from(forbid,mask=>Array.from({length:29},(_,k)=>k).filter(k=>!(mask&(1<<k))));n++;pairs+=d.reduce((a,x)=>a*BigInt(x.length),1n);visit(ph.slice(),d,t,hold.slice());return;}
   let x=c[i];if(x===0){ph[i]=-1;hold.push(i);dfs(i+1,t);hold.pop();}
   const old=forbid[t],mask=old|(1<<x);if(mask===ALL)return;forbid[t]=mask;ph[i]=t;dfs(i+1,(t+W[x])%q);forbid[t]=old;
  }dfs(0,0);return {n,pairs:String(pairs)};
 }
 function plain(c,ph,k){return c.map((x,i)=>ph[i]<0?0:mod(x-k[ph[i]]));}
 // Each consuming/consuming adjacent pair connects phase j to j+1 or j+2.
 // Held-zero terms are unary/constant. Thus the complete bigram objective is
 // exactly a width-two circular factor graph; condition the first two keys.
 function optimizeBigram(c,ph,d,M){
  const n=d.map(x=>x.length),u=d.map(x=>new Float64Array(x.length)),e1=d.map((x,j)=>new Float64Array(x.length*n[(j+1)%q])),e2=d.map((x,j)=>new Float64Array(x.length*n[(j+2)%q]));let constant=0;
  const p=(i,k)=>mod(c[i]-k);
  if(ph[0]<0)constant+=M.u[0];else for(let j=0;j<n[ph[0]];j++)u[ph[0]][j]+=M.u[p(0,d[ph[0]][j])];
  for(let i=1;i<c.length;i++){
   const a=ph[i-1],b=ph[i];
   if(a<0&&b<0){constant+=M.b[0];continue;}
   if(a<0){for(let j=0;j<n[b];j++)u[b][j]+=M.b[p(i,d[b][j])];continue;}
   if(b<0){for(let j=0;j<n[a];j++)u[a][j]+=M.b[p(i-1,d[a][j])*29];continue;}
   const dist=(b-a+q)%q;if(dist!==1&&dist!==2)throw Error('nonlocal factor');
   const e=dist===1?e1[a]:e2[a];for(let j=0;j<n[a];j++){const v=p(i-1,d[a][j])*29;for(let k=0;k<n[b];k++)e[j*n[b]+k]+=M.b[v+p(i,d[b][k])];}
  }
  let best=-Infinity,bestKey=null;
  const dp=Array.from({length:q},(_,i)=>i<2?null:new Float64Array(n[i-1]*n[i])), back=Array.from({length:q},(_,i)=>i<2?null:new Int8Array(n[i-1]*n[i]));
  for(let a=0;a<n[0];a++)for(let b=0;b<n[1];b++){
   const initial=u[0][a]+u[1][b]+e1[0][a*n[1]+b];
   dp[2].fill(-Infinity);for(let k=0;k<n[2];k++){dp[2][b*n[2]+k]=initial+u[2][k]+e1[1][b*n[2]+k]+e2[0][a*n[2]+k];back[2][b*n[2]+k]=a;}
   for(let i=3;i<q;i++){const na=n[i-2],nb=n[i-1],nc=n[i],old=dp[i-1],cur=dp[i],bk=back[i],v1=e1[i-1],v2=e2[i-2],ui=u[i];cur.fill(-Infinity);
    for(let j=0;j<nb;j++)for(let k=0;k<nc;k++){let mx=-Infinity,arg=0;for(let l=0;l<na;l++){const v=old[l*nb+j]+v2[l*nc+k];if(v>mx){mx=v;arg=l;}}cur[j*nc+k]=mx+v1[j*nc+k]+ui[k];bk[j*nc+k]=arg;}
   }
   for(let j=0;j<n[q-2];j++)for(let k=0;k<n[q-1];k++){const v=dp[q-1][j*n[q-1]+k]+e2[q-2][j*n[0]+a]+e1[q-1][k*n[0]+a]+e2[q-1][k*n[1]+b]+constant;if(v>best){best=v;let ids=Array(q);ids[q-2]=j;ids[q-1]=k;for(let i=q-1;i>=2;i--)ids[i-2]=back[i][ids[i-1]*n[i]+ids[i]];if(ids[0]!==a||ids[1]!==b)throw Error('DP backtrace');bestKey=ids.map((v,i)=>d[i][v]);}}
  }
  if(!bestKey||Math.abs(score(plain(c,ph,bestKey),M).b-best)>1e-7)throw Error('factor score mismatch');
  return {best,key:bestKey};
 }
 function refine(c,ph,d,k,M){k=k.slice();let best=score(plain(c,ph,k),M).t;for(let pass=0;pass<8;pass++){let changed=false;for(let j=0;j<q;j++){let v=k[j],old=v;for(const x of d[j]){k[j]=x;let s=score(plain(c,ph,k),M).t;if(s>best+1e-10){best=s;v=x;}}k[j]=v;changed||=v!==old;}if(!changed)break;}return {key:k,score:best};}
 function lexicon(ex){const by=new Map(gp.translit.map((x,i)=>[x,i])),out=new Map();const add=p=>{if(p.length<9||p.length>24)return;let s=p.join(',');out.set(s,p);};for(const l of lexText.split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+\d+$/);if(!m)continue;let s=m[1].toUpperCase().replace(/QU/g,'CW').replace(/[KQ]/g,'C').replace(/V/g,'U').replace(/Z/g,'S').replace(/ING/g,'NG').replace(/IO/g,'IA'),p=[];while(s.length){const v=by.has(s.slice(0,2))?s.slice(0,2):s[0];if(!by.has(v)){p=[];break;}p.push(by.get(v));s=s.slice(v.length);}add(p);}
  for(let j=0;j<native.sections.length;j++)if(j!==ex)for(const w of native.sections[j].source_text.replace(/\/\s*/gu,'').match(/[\u16a0-\u16ff]+/gu)||[])add([...w].map(x=>alphabet.get(x)));
  const bins=Array.from({length:25},()=>new Map());for(const p of out.values())if(p.filter(x=>x!==0).length>=9){let mask=0;for(let i=0;i<p.length;i++)if(p[i]===0)mask|=1<<i;let b=bins[p.length].get(mask);if(!b)bins[p.length].set(mask,b=[]);b.push(p);}return bins;
 }
 function anchorCapacity(c,ph,d,bins){let endOfLast=0,anchors=[],assigned=new Int8Array(q);const masks=d.map(x=>x.reduce((m,v)=>m|(1<<v),0));
  for(let end=9;end<=c.length;end++){let found=null;for(let l=9;l<=24&&l<=end-endOfLast&&!found;l++){let start=end-l,mask=0;for(let i=0;i<l;i++)if(ph[start+i]<0)mask|=1<<i;const bin=bins[l].get(mask);if(!bin)continue;for(const w of bin){assigned.fill(-1);let ok=true;for(let i=0;i<l;i++){const t=ph[start+i],p=w[i];if(t<0)continue;let k=mod(c[start+i]-p);if(!(masks[t]&(1<<k))||(assigned[t]>=0&&assigned[t]!==k)){ok=false;break;}assigned[t]=k;}if(ok){found={start,end,p:w};break;}}}
   if(found){anchors.push(found);endOfLast=end;}
  }return anchors;
 }
 function suffix(c,k,start,context,M){let states=[{phase:start,p:[],a:context[0],b:context[1],s:0}];for(const x of c){const next=new Map();for(const v of states){const options=[];if(x===0)options.push([0,v.phase]);const p=mod(x-k[v.phase]);if(p!==0)options.push([p,(v.phase+W[x])%q]);for(const [p,t] of options){let s=v.s+M.t[(v.a*29+v.b)*29+p],id=t*841+v.b*29+p,o=next.get(id);if(!o||s>o.s)next.set(id,{phase:t,p:v.p.concat(p),a:v.b,b:p,s});}}states=[...next.values()];if(!states.length)return null;}states.sort((a,b)=>b.s-a.s);return states[0];}
 const specs=[[1,0,3301],[3,350,1033],[4,0,133],[5,0,331]];
 let P=null,K=null,truth=null,ex=-1,attempts=0,c,control=null;
 if(which==='original'){c=gp.pages[54].indices.slice(9).concat(gp.pages[55].indices);if(c.length!==299)throw Error('terminal geometry mismatch');}
 else{let i=Number(which);if((i<2?8:13)!==q)throw Error('control period mismatch');let [s,start,seed]=specs[i];ex=s;P=sections[s].slice(start,start+299);if(P.length!==299)throw Error('control length');let f=P.slice(0,fitN).filter(x=>x===0).length;let state=seed;do{K=Array.from({length:q},()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state%29});truth=encode(P,K);attempts++;if(attempts>20000)throw Error('control sampling');}while(truth.c.slice(0,fitN).filter(x=>x===0).length!==f+1);c=truth.c;control={section:s,start,seed,attempts,key:K,heldF:truth.h.filter(x=>x<fitN),fitZeros:f+1};}
 const M=model(ex),a=c.slice(0,fitN),b=c.slice(fitN),bins=lexicon(ex);let winner=null,bigram=null,anchor=null,truthHistory=false,truthKeyBigram=false,summary=[];
 const h=histories(a,(ph,d,phase,hold)=>{const z=optimizeBigram(a,ph,d,M),ref=refine(a,ph,d,z.key,M),p=plain(a,ph,ref.key),anchors=anchorCapacity(a,ph,d,bins);
  if(!bigram||z.best>bigram.score)bigram={score:z.best,key:z.key,hold};if(!anchor||anchors.length>anchor.length)anchor=anchors;
  const cand={key:ref.key,score:ref.score,hold,phase,p,bigram:z.best,anchorCount:anchors.length};if(!winner||cand.score>winner.score)winner=cand;
  if(P&&hold.join(',')===control.heldF.join(',')){truthHistory=true;truthKeyBigram=z.key.join(',')===K.join(',');}
  summary.push({hold,domainSizes:d.map(x=>x.length),bigram:z.best,trigram:ref.score,anchors:anchors.length});
 });
 if(!winner)return {which,q,control,h,noLegalPrefix:true};
 const pred=suffix(b,winner.key,winner.phase,winner.p.slice(-2),M),replay=encode(winner.p,winner.key).c.join(',')===a.join(',');if(!replay)throw Error('prefix replay');
 let held=null;if(pred){if(encode(pred.p,winner.key,winner.phase).c.join(',')!==b.join(','))throw Error('held replay');held={score:pred.s,plain:pred.p,translit:pred.p.map(x=>gp.translit[x]).join(''),accuracy:P?pred.p.filter((x,i)=>x===P[fitN+i]).length:null};}
 let nativeFloor=Infinity,windows=0;for(const s of sections)for(let i=0;i+fitN<=s.length;i++){nativeFloor=Math.min(nativeFloor,score(s.slice(i,i+fitN),M).b);windows++;}
 return {which,q,width:W,control,h,bigram,anchor,summary,truthHistory,truthKeyBigram,fitExact:P?winner.p.filter((x,i)=>x===P[i]).length:null,keyExact:P?winner.key.join(',')===K.join(','):null,prefix:{...winner,translit:winner.p.map(x=>gp.translit[x]).join(''),replay},held,nativeBigramFloor:nativeFloor,nativeWindows:windows,truePrefixScore:P?score(P.slice(0,fitN),M):null};
}
module.exports={experiment,paths};
if(require.main===module)console.log(JSON.stringify(experiment(...paths.map(x=>fs.readFileSync(x,'utf8')),process.argv[2]||'original',Number(process.argv[3]||8)),null,2));
