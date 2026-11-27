'use strict';
const fs=require('node:fs');
function run(data){
 const cp=JSON.parse(data[0]), native=JSON.parse(data[1]), target=cp.pages.filter(p=>p.page>=15&&p.page<=22).flatMap(p=>p.indices.slice(p.page===15?20:0)), N=target.length, cut=1752;
 if(N!==1883)throw Error("original frame");
 const mod=x=>((x%29)+29)%29, inv=Array(29).fill(0);for(let a=1;a<29;a++)for(let b=1;b<29;b++)if(a*b%29===1)inv[a]=b;
 const F=[1,2];while(F.at(-1)+F.at(-2)<N)F.push(F.at(-1)+F.at(-2));
 const mask=Array.from({length:N},(_,n)=>{let m=0;for(let k=F.length-1;k>=0;k--)if(n>=F[k]){n-=F[k];m|=1<<k;}if(n)throw Error("Zeckendorf");return m;});
 const labels=cp.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
 function encode(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replaceAll("QU","CW").replaceAll("V","U").replace(/[KQ]/g,"C").replaceAll("Z","S");while(w.length){const f=w.startsWith("ING")?["ING",21]:w.startsWith("IO")?["IO",27]:labels.find(([l])=>w.startsWith(l));if(!f){w=w.slice(1);continue;}out.push(f[1]);w=w.slice(f[0].length);}}return out;}
 const rmap=new Map(cp.runes.map((r,i)=>[r,i]));
 const names=["Blake","Law-I","Law-II","Law-III","Self-Reliance"];
 const donors=[...native.sections.map((s,i)=>({name:`native-${i}`,p:Array.from(s.source_text).filter(r=>rmap.has(r)).map(r=>rmap.get(r))})),...names.map((name,i)=>({name,p:encode(data[i+2])}))];
 const orders=[F.map((_,k)=>k),F.map((_,k)=>F.length-1-k)];
 const actions=[];for(let a=1;a<29;a++)for(let b=0;b<29;b++)actions.push([a,b]);
 const actionLUT=actions.map(([a,b])=>Array.from({length:29},(_,x)=>mod(a*x+b)));
 function groups(start,L,order){
  let outer=0;const g=[];
  for(const k of order){const bit=1<<k,lag=F[k],by=new Map();
   for(let i=start;i+lag<start+L;i++){const j=i+lag;if(mask[i]&bit|| (mask[i]^mask[j])!==bit)continue;const p=mask[i]&outer;if(!by.has(p))by.set(p,[]);by.get(p).push([i-start,j-start]);}
   for(const [prefix,pairs] of by)g.push({k,lag,prefix,pairs});outer|=bit;
  }
  return g.sort((a,b)=>b.pairs.length-a.pairs.length||a.k-b.k||a.prefix-b.prefix);
 }
 function trie(c,pairs){
  const freqs=new Map();for(const [i,j] of pairs){const h=c[i]*29+c[j];freqs.set(h,(freqs.get(h)||0)+1);}
  pairs=pairs.slice().sort((x,y)=>(freqs.get(c[y[0]]*29+c[y[1]])-freqs.get(c[x[0]]*29+c[x[1]]))||(c[x[0]]*29+c[x[1]])-(c[y[0]]*29+c[y[1]]));
  const zero=[-1],one=[-1],leaf=[];
  for(let a=0;a<actions.length;a++){let v=0;const lut=actionLUT[a];for(const [i,j] of pairs){const z=lut[c[i]]===c[j]?one:zero;if(z[v]<0){z[v]=zero.length;zero.push(-1);one.push(-1);}v=z[v];}if(!leaf[v])leaf[v]=[];leaf[v].push(a);}
  return {pairs,zero,one,leaf,distinct:leaf.filter(Boolean).length};
 }
 function match(t,p,off){let v=0;for(const [i,j] of t.pairs){v=(p[off+i]===p[off+j]?t.one:t.zero)[v];if(v<0)return null;}return t.leaf[v]||null;}
 function scan(c,start,L,order){
   const g=groups(start,L,order), ts=g.slice(0,12).map(q=>({...q,t:trie(c,q.pairs)}));
   const passes=Array(ts.length).fill(0), hits=[], stats=[];
   for(const d of donors){const m=Math.max(0,d.p.length-L+1);let good=0;for(let off=0;off<m;off++){let i=0;while(i<ts.length&&match(ts[i].t,d.p,off)){passes[i]++;i++;}if(i===ts.length){hits.push({name:d.name,off});good++;}}stats.push({name:d.name,length:d.p.length,windows:m,good});}
   return {start,L,order:order[0]===0?"low-first":"high-first",groups:ts.map(q=>({k:q.k,lag:q.lag,prefix:q.prefix,pairs:q.pairs.length,distinct:q.t.distinct})),passes,stats,hits};
 }
 function solve(c,p,order){
   const L=p.length, active=order.filter(k=>mask.slice(0,L).some(m=>m&(1<<k)));
   const pairs=active.map(k=>{const arr=[];for(let i=0;i+F[k]<L;i++){const j=i+F[k];if(!(mask[i]&(1<<k))&&(mask[i]^mask[j])===(1<<k))arr.push([i,j]);}return arr;});
   const key=Array.from(F,()=>null),solutions=[],nodes=Array(active.length+1).fill(0);let truncated=false;
   function go(y,d){
    if(++nodes[d]>100000){truncated=true;return;}
    if(d===active.length){const S=Array(29).fill(-1),rev=Array(29).fill(-1);for(let i=0;i<L;i++){if(S[p[i]]!==-1&&S[p[i]]!==y[i]||rev[y[i]]!==-1&&rev[y[i]]!==p[i])return;S[p[i]]=y[i];rev[y[i]]=p[i];}const missing=S.flatMap((v,i)=>v<0?[i]:[]),unseen=rev.flatMap((v,i)=>v<0?[i]:[]);if(missing.length===1){S[missing[0]]=unseen[0];rev[unseen[0]]=missing[0];}solutions.push({key:key.map(x=>x&&x.slice()),S,rev,missing:missing.length});return;}
    const k=active[d], t=trie(y,pairs[d]), feasible=match(t,p,0)||[];
    for(const id of feasible){const [a,b]=actions[id], next=y.map((v,i)=>mask[i]&(1<<k)?mod((v-b)*inv[a]):v);key[k]=[a,b];go(next,d+1);if(truncated)return;}key[k]=null;
   }
   go(c.slice(0,L),0);return {nodes,truncated,solutions};
 }
 function cipher(p,key,S,order){return p.map((v,i)=>{let x=S[v];for(let t=order.length-1;t>=0;t--){const k=order[t];if(mask[i]&(1<<k)){const [a,b]=key[k];x=mod(a*x+b);}}return x;});}
 function decipher(c,sol,order){return c.map((v,i)=>{let x=v;for(const k of order){if(mask[i]&(1<<k)){if(!sol.key[k])return -1;const [a,b]=sol.key[k];x=mod((x-b)*inv[a]);}}return sol.rev[x];});}
 let seed=0x0a92715;function rnd(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*n);}
 function plant(d,off,order){const p=d.p.slice(off,off+N),key=F.map(()=>[1+rnd(28),rnd(29)]),S=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){const j=rnd(i+1);[S[i],S[j]]=[S[j],S[i]];}if(p.length!==N)throw Error("plant length");
 const c=cipher(p,key,S,order), gate=scan(c.slice(0,cut),0,cut,order), recovered=[];
 for(const h of gate.hits){const q=donors.find(x=>x.name===h.name).p.slice(h.off,h.off+cut),res=solve(c,q,order);for(const s of res.solutions){const dec=decipher(c,s,order),known=dec.filter(x=>x>=0).length,correct=dec.filter((x,i)=>x===p[i]).length,held=dec.slice(cut).filter((x,i)=>x===p[cut+i]).length;const replay=dec.every(x=>x>=0)&&cipher(dec,s.key,s.S,order).every((x,i)=>x===c[i]);recovered.push({h,nodes:res.nodes,truncated:res.truncated,correct,held,known,replay,keyCorrect:JSON.stringify(s.key)===JSON.stringify(key),alphabetCorrect:s.S.filter((x,i)=>x===S[i]).length});}}
 return {source:d.name,off,order:gate.order,gatePasses:gate.passes,gateHits:gate.hits,gateWindows:gate.stats.reduce((a,b)=>a+b.windows,0),recovered};
 }
 const controls=[plant(donors.find(d=>d.name==="Self-Reliance"),2450,orders[0]),plant(donors.find(d=>d.name==="Blake"),3400,orders[1])];
 if(!controls.every(p=>p.recovered.some(r=>r.held===N-cut&&r.correct===N&&r.keyCorrect&&r.replay)))return{N,cut,F,controls,originalSkipped:"blind full-source control recovery failed"};
 const originals=[];
 const starts=[0];let cursor=0;for(const p of cp.pages.filter(p=>p.page>=15&&p.page<=21)){cursor+=p.indices.length-(p.page===15?20:0);if(cursor+512<=cut)starts.push(cursor);}
 for(const order of orders){originals.push(scan(target.slice(0,cut),0,cut,order));for(const start of starts)originals.push(scan(target.slice(start,start+512),start,512,order));}
 // Fully solve only full-prefix hits; shorter hits are necessary conditions, not keys.
 const originalKeys=[];for(let o=0;o<orders.length;o++){const r=originals.find(x=>x.L===cut&&x.order===(o===0?"low-first":"high-first"));for(const h of r.hits){const d=donors.find(x=>x.name===h.name),q=d.p.slice(h.off,h.off+cut),res=solve(target,q,orders[o]);for(const s of res.solutions){const dec=decipher(target,s,orders[o]);originalKeys.push({h,order:r.order,key:s.key,S:s.S,decoded:dec,held:dec.slice(cut),replay:dec.every(x=>x>=0)&&cipher(dec,s.key,s.S,orders[o]).every((x,i)=>x===target[i])});}if(res.truncated)originalKeys.push({h,order:r.order,truncated:true,nodes:res.nodes});}}
 return {N,cut,F,donors:donors.map(d=>({name:d.name,length:d.p.length})),controls,originals,originalKeys};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/external/cicada2012-blake-marriage-gutenberg45315.txt","resources/external/2013-liber-al-bookcode-I.txt","resources/external/2013-liber-al-bookcode-II.txt","resources/external/2013-liber-al-bookcode-III.txt","resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt"];
if(require.main===module)console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,'utf8'))),null,2));
module.exports=run;
