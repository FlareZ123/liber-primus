"use strict";
/** Right-composed noncommuting affine action: fixed native repeat screening and all-IV original inverse. */
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function study(g,trans,sources){
 const mod=x=>((x%29)+29)%29, cls=Uint8Array.from({length:29},(_,i)=>[1,3,10,12,18,22,24,25,26,27,28].includes(i)?0:1);
 const tokens=g.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(s){const out=[];s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(const w of s.match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3}else if(w.startsWith("IO",i)){out.push(27);i+=2}else{const t=tokens.find(t=>w.startsWith(t.s,i));if(!t)throw Error(w);out.push(t.i);i+=t.s.length}}}return out}
 const ids=new Map(g.runes.map((x,i)=>[x,i]));
 const words=trans.replace(/\r\n/g,"\n").split("%").slice(0,55).join("%").replace(/\/\n/g,"").replace(/[\r\n%]/g,"").match(new RegExp("["+g.runes.join("")+"]+","gu")).map(w=>Array.from(w,x=>ids.get(x)));
 const cipher=g.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),flat=words.flat();
 if(flat.length!==12956||words.length!==2896||flat.some((x,i)=>x!==cipher[i]))throw Error("source mismatch");
 const seam=new Uint8Array(flat.length);let off=0;for(const w of words){if(off)seam[off]=1;off+=w.length}
 function counts(t){let I=0,S=0;for(let i=1;i<t.length;i++)if(t[i]===t[i-1]){if(seam[i])S++;else I++}return [I,S]}
 const observed=counts(flat),total=observed[0]+observed[1],A=[],B=[];
 for(let a=1;a<29;a++)for(let b=0;b<29;b++){A.push(a);B.push(b)}
 const M=A.length,ind=(a,b)=>(a-1)*29+b,inv=A.map(a=>{for(let i=1;i<29;i++)if(mod(i*a)===1)return i});
 const pairs=[];for(let u=0;u<M;u++)for(let v=0;v<M;v++)if(mod(A[u]*B[v]+B[u])!==mod(A[v]*B[u]+B[v]))pairs.push([u,v]);
 const candidate=new Map(),controlSummary=[],texts=[];
 // Repeat condition under right composition is independent of all IVs:
 // P_i=T_class(P_i)(P_{i+1}). Use earlier joint screen, or a total-only screen
 // with the same 2-sqrt-count scale to allow decoy printed group boundaries.
 function screen(p,name,kind){
   const h=Array.from({length:4},()=>new Uint16Array(841));
   for(let i=1;i<p.length;i++){const x=p[i-1],y=p[i];h[2*cls[x]+seam[i]][x*29+y]++}
   const cost=h.map(row=>A.map((a,j)=>{let n=0;for(let y=0;y<29;y++)n+=row[mod(a*y+B[j])*29+y];return n}));
   let joint=0,totalOnly=0,union=0;
   for(const [u,v] of pairs){
     const I=cost[0][u]+cost[2][v],S=cost[1][u]+cost[3][v];
     const j=Math.abs(I-observed[0])<=2*Math.sqrt(observed[0])&&Math.abs(S-observed[1])<=2*Math.sqrt(observed[1]);
     const t=Math.abs(I+S-total)<=2*Math.sqrt(total);
     if(j)joint++;if(t)totalOnly++;if(j||t){union++;const k=u*M+v;if(!candidate.has(k))candidate.set(k,[]);candidate.get(k).push({name,kind,I,S,joint:j,total:t})}
   }
   controlSummary.push({name,kind,joint,totalOnly,union});
 }
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}}
 for(const [name,source,seed] of sources){
   const pool=new Map();for(const w of source.match(/[A-Za-z]+/g)||[]){const p=encode(w);if(!pool.has(p.length))pool.set(p.length,[]);pool.get(p.length).push(p)}
   const random=rng(seed);
   for(let j=0;j<3;j++){const p=words.flatMap(w=>{const q=pool.get(w.length);if(!q?.length)throw Error(name+" missing "+w.length);return q[Math.floor(random()*q.length)]});screen(p,name,"matched-"+j)}
   const t=encode(source);texts.push(t);screen(t.slice(1000,1000+flat.length),name,"continuous-offset1000");
 }
 const keys=[...candidate.keys()].sort((a,b)=>a-b).map(k=>[Math.floor(k/M),k%M]);
 const dec=new Uint8Array(M*29),enc=new Uint8Array(M*29),next=new Uint16Array(M*M);
 for(let s=0;s<M;s++){for(let x=0;x<29;x++){dec[s*29+x]=mod(inv[s]*(x-B[s]));enc[s*29+x]=mod(A[s]*x+B[s])}for(let k=0;k<M;k++)next[s*M+k]=ind(mod(A[s]*A[k]),mod(A[s]*B[k]+B[s]))}
 function transform(t,u,v,iv,encrypt){let s=iv;const out=[];for(const x of t){const p=encrypt?x:dec[s*29+x];out.push(encrypt?enc[s*29+x]:p);s=next[s*M+(cls[p]?v:u)]}return out}
 const ref=texts[1],uni=new Uint32Array(29),bi=new Uint32Array(841),tri=new Uint32Array(24389);
 for(let i=0;i<ref.length;i++){uni[ref[i]]++;if(i)bi[ref[i-1]*29+ref[i]]++;if(i>1)tri[(ref[i-2]*29+ref[i-1])*29+ref[i]]++}
 const score=new Float64Array(24389);
 for(let x=0;x<29;x++)for(let y=0;y<29;y++)for(let z=0;z<29;z++){const pu=(uni[z]+1)/(ref.length+29),pb=(bi[y*29+z]+20*pu)/(uni[y]+20);score[(x*29+y)*29+z]=Math.log((tri[(x*29+y)*29+z]+20*pb)/(bi[x*29+y]+20))}
 function logp(t){let sum=0;for(let i=2;i<t.length;i++)sum+=score[(t[i-2]*29+t[i-1])*29+t[i]];return sum/(t.length-2)}
 const train=g.pages.filter(p=>p.page<=2).reduce((s,p)=>s+p.indices.length,0);
 if(train!==729)throw Error("train frame "+train);
 const keyDesc=k=>k.map(i=>[A[i],B[i]]);
 function rank(c){
   let best=-Infinity,second=-Infinity,key=null;
   for(const [u,v] of keys)for(let iv=0;iv<M;iv++){
     let state=iv,x=0,y=0,sum=0;
     for(let i=0;i<train;i++){const z=dec[state*29+c[i]];if(i>=2)sum+=score[(x*29+y)*29+z];x=y;y=z;state=next[state*M+(cls[z]?v:u)]}
     if(sum>best){second=best;best=sum;key=[u,v,iv]}else if(sum>second)second=sum;
   }
   if(!key)throw Error("empty screen");
   const p=transform(c,...key,false);if(transform(p,...key,true).some((x,i)=>x!==c[i]))throw Error("replay");
   return {key,coeff:keyDesc(key),trainScore:best/(train-2),margin:(best-second)/(train-2),heldScore:logp(p.slice(train)),p}
 }
 if(!keys.length)return {observed,controlSummary,keys:0,plants:[],originalFit:null};
 const plants=[];
 // Use screened pairs with native support, distinct hidden nonidentity IVs,
 // and continuous plaintext offsets outside each source's screened window.
 for(const [n,offset,iv] of [[0,25000,ind(13,8)],[2,30000,ind(23,14)]]){
   const choices=keys.filter(([u,v])=>candidate.get(u*M+v).some(x=>x.name===sources[n][0]));
   if(!choices.length)throw Error("no eligible planted pair");
   const pair=choices[n?choices.length-1:0],key=[...pair,iv],p=texts[n].slice(offset,offset+cipher.length);
   if(p.length!==cipher.length)throw Error("short plant");
   const c=transform(p,...key,true),q=rank(c);plants.push({source:sources[n][0],offset,actual:keyDesc(key),selected:q.coeff,trainRecovered:q.p.slice(0,train).filter((x,i)=>x===p[i]).length,heldRecovered:q.p.slice(train).filter((x,i)=>x===p[i+train]).length,trainScore:q.trainScore,heldScore:q.heldScore,margin:q.margin,fullRepeat:counts(c)});
 }
 let originalFit=null;
 if(plants.every(p=>p.trainRecovered===train&&p.heldRecovered===cipher.length-train)){
   const q=rank(cipher),compact="0123456789abcdefghijklmnopqrs";
   let at=0;const pages=g.pages.filter(p=>p.page<=55).map(page=>{const p=q.p.slice(at,at+page.indices.length),c=cipher.slice(at,at+page.indices.length);at+=page.indices.length;return {page:page.page,score:p.length>2?logp(p):null,baseline:c.length>2?logp(c):null,decoded:p.map(x=>compact[x]).join("")}});
   originalFit={coeff:q.coeff,trainScore:q.trainScore,heldScore:q.heldScore,margin:q.margin,untouchedTrain:logp(cipher.slice(0,train)),untouchedHold:logp(cipher.slice(train)),first80:q.p.slice(0,80).map(x=>g.translit[x]).join(" "),pages};
 }
 return {observed,controlSummary,screenedPairs:keys.length,testedKeyIVs:keys.length*M,allPairs:pairs.length,train,held:cipher.length-train,candidates:keys.map(([u,v])=>({coeff:keyDesc([u,v]),support:candidate.get(u*M+v)})),plants,originalFit};
}
const g=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),trans=read("resources/liber-primus/lp2-transcription.txt");
const sources=[["Shakespeare","resources/control/shakespeare_first300k.txt",0x33015637],["Gibran","resources/control/gibran_prophet_58585.txt",0x33015638],["Emerson","resources/control/emerson_essays_2944.txt",0x33015639]].map(([n,f,s])=>[n,read(f),s]);
console.log(JSON.stringify(study(g,trans,sources),null,2));
