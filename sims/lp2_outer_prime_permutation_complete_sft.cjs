"use strict";
const fs=require("node:fs"),path=require("node:path"),cp=require("node:child_process");
function complete(native,anchors,shifts){
const K=29, NEG=-Infinity;
function language(exclude){
 const u=new Float64Array(K).fill(.5), b=new Float64Array(K*K),t=new Float64Array(K*K*K);
 for(let s=0;s<native.length;s++)if(s!==exclude){const p=native[s];for(let i=0;i<p.length;i++){u[p[i]]++;if(i)b[p[i-1]*K+p[i]]++;if(i>1)t[(p[i-2]*K+p[i-1])*K+p[i]]++}}
 const us=u.reduce((a,b)=>a+b);for(let x=0;x<K;x++)u[x]/=us;
 for(let a=0;a<K;a++){let sum=10;for(let x=0;x<K;x++)sum+=b[a*K+x];for(let x=0;x<K;x++)b[a*K+x]=(b[a*K+x]+10*u[x])/sum}
 for(let ab=0;ab<K*K;ab++){let sum=10;for(let x=0;x<K;x++)sum+=t[ab*K+x];for(let x=0;x<K;x++)t[ab*K+x]=Math.log((t[ab*K+x]+10*b[(ab%K)*K+x])/sum)}
 return {u:u.map(Math.log),b:b.map(Math.log),t}
}
return anchors.controls.map(a=>{
 const pt=native[a.i],pi=a.pi;let j=0;const ct=pt.map(p=>p===0?pi[0]:pi[(p+shifts[j++])%K]),fit=a.fitN,n=ct.length,model=language(a.i);
 if(a.maps.length!==1||a.schedules.length!==1)throw Error("expected unique anchor state");
 const g=a.maps[0].slice(),z=g.indexOf(0),pre=[0];for(const x of ct)pre.push(pre.at(-1)+(x===z));
 const boundaries=[[0,0],...a.schedules[0].flatMap(([l,j,r,e])=>[[l,l-j],[r,r-e]])],lo=[],hi=[];
 for(let i=0;i<=fit;i++){let l=0,h=pre[i];for(const [b,v] of boundaries){if(i>=b){l=Math.max(l,v);h=Math.min(h,v+pre[i]-pre[b])}else{l=Math.max(l,v-pre[b]+pre[i]);h=Math.min(h,v)}}lo.push(l);hi.push(h)}
 const width=(pre[n]+1)*4,cur=new Float64Array(width),next=new Float64Array(width);
 const value=(i,h)=> (g[ct[i]]-shifts[i-h]+K)%K;
 function dp(start,end,initial,withBounds,trace){
  let arr=cur,nxt=next;arr.fill(NEG);arr[initial]=0;const back=trace?new Int16Array((end-start+1)*width).fill(-1):null;
  for(let i=start;i<end;i++){
   const min=withBounds?lo[i]:0,max=withBounds?hi[i]:pre[i],min2=withBounds?lo[i+1]:0,max2=withBounds?hi[i+1]:pre[i+1];nxt.fill(NEG,(min2*4),((max2+1)*4));let live=false;
   for(let h=min;h<=max;h++)for(let bits=0;bits<4;bits++){const k=h*4+bits,s=arr[k];if(s===NEG)continue;
    const b=bits&1,d=(bits>>1)&1;
    const p1=i===0?-1:b?0:value(i-1,h-b);
    const p2=i<2?-1:d?0:value(i-2,h-b-d);
    const base=i===0?model.u:i===1?model.b:model.t,idx=i===0?0:i===1?p1*K:(p2*K+p1)*K;
    const y=value(i,h);
    if(y!==0&&h>=min2&&h<=max2){const k2=h*4+(b<<1),v=s+base[idx+y];if(v>nxt[k2]){nxt[k2]=v;if(back)back[(i-start+1)*width+k2]=k}live=true}
    if(ct[i]===z&&h+1>=min2&&h+1<=max2){const k2=(h+1)*4+(b<<1)+1,v=s+base[idx];if(v>nxt[k2]){nxt[k2]=v;if(back)back[(i-start+1)*width+k2]=k}live=true}
   }
   if(!live)return {score:NEG};[arr,nxt]=[nxt,arr];
  }
  let best=NEG,k=-1;for(let h=withBounds?lo[end]:0;h<=(withBounds?hi[end]:pre[end]);h++)for(let b=0;b<4;b++){let v=arr[h*4+b];if(v>best){best=v;k=h*4+b}}
  if(!trace)return {score:best,k};
  const p=[];let k2=k;for(let i=end-1;i>=start;i--){const k1=back[(i-start+1)*width+k2];p.push(k2&1?0:value(i,k1>>2));k2=k1}return {score:best,k,p:p.reverse()};
 }
 const holes=g.map((v,i)=>v<0?i:-1).filter(x=>x>=0),missing=Array.from({length:K},(_,i)=>i).filter(x=>!g.includes(x));let maps=0,legal=0,best=NEG,second=NEG,bestG=null,ties=0;
 function visit(d){if(d===holes.length){maps++;const {score}=dp(0,fit,0,true,false);if(score===NEG)return;legal++;if(score>best+1e-9){second=best;best=score;bestG=g.slice();ties=1}else if(Math.abs(score-best)<1e-9)ties++;else second=Math.max(second,score);return}
 for(let j=d;j<missing.length;j++){[missing[j],missing[d]]=[missing[d],missing[j]];g[holes[d]]=missing[d];visit(d+1);[missing[j],missing[d]]=[missing[d],missing[j]]}}
 visit(0);if(!bestG)throw Error("no legal control");for(let i=0;i<K;i++)g[i]=bestG[i];const fitResult=dp(0,fit,0,true,true),suffix=dp(fit,n,fitResult.k,false,true),p=fitResult.p.concat(suffix.p);let clock=0;const replay=p.every((x,i)=>g[ct[i]]===(x===0?0:(x+shifts[clock++])%K));
 return {i:a.i,n,fit,maps,legal,best,second,ties,g:bestG,fitState:fitResult.k,suffixState:suffix.k,suffixLL:suffix.score,mapMatches:g.filter((v,i)=>v===a.inv[i]).length,fitMatches:p.slice(0,fit).filter((v,i)=>v===pt[i]).length,heldMatches:p.slice(fit).filter((v,i)=>v===pt[i+fit]).length,held:n-fit,replay};
})
}
const base=path.resolve(__dirname,".."),a=JSON.parse(cp.execFileSync(process.execPath,[path.join(__dirname,"lp2_outer_prime_permutation_anchor_sft.cjs")],{encoding:"utf8",maxBuffer:10*1024*1024})),g=JSON.parse(fs.readFileSync(path.join(base,"resources/liber-primus/lp2-corpus.json"),"utf8")),m=new Map(g.runes.map((x,i)=>[x,i])),native=JSON.parse(fs.readFileSync(path.join(base,"resources/external/relikd-solved-gp29-native-v1.json"),"utf8")).sections.map(x=>x.source_text.match(/[\u16A0-\u16FF]/g).map(c=>m.get(c)));let primes=[];for(let v=2;primes.length<4000;v++){let ok=true;for(let p of primes){if(p*p>v)break;if(v%p===0){ok=false;break}}if(ok)primes.push(v)}const shifts=primes.map(x=>(x-1)%29); console.log(JSON.stringify(complete(native,a,shifts),null,2));
