// Source-native F-held differential collision-capacity gate, Agent8.
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/blake_song_of_liberty_train.txt"];
const pins=["054f2a0f780b7d46901acbe3d9bf4f0ac1801165","df260a07d56bf5998d40a6360b6132c35c252d10","94c677ad9dd50771c6670e0c4e4dad9052b46d85","a92be8ba5b3511a003a22ba31523c14397aaa83a","c8d8afda002f2585ce64a959c26c20d24a5c990b"];
const inputs=paths.map((p,i)=>{const b=fs.readFileSync(path.join(__dirname,"..",p));const h=crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");if(h!==pins[i])throw Error("source pin mismatch "+p);return b.toString("utf8")});
function experiment(inputs){
 const j=JSON.parse(inputs[0]),mod=x=>(x%29+29)%29,alphabet=j.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);const p=[];for(const w0 of t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]){const w=w0.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let k=0;k<w.length;){const v=w.startsWith("ING",k)?{t:"ING",i:21}:w.startsWith("IO",k)?{t:"IO",i:27}:alphabet.find(x=>w.startsWith(x.t,k));if(!v)throw Error(w);p.push(v.i);k+=v.t.length}}return p}
 function ids(x,n,noF){const y=new Float64Array(Math.max(0,x.length-n+1)).fill(-1),power=29**(n-1);let v=0,zeros=0;for(let i=0;i<x.length;i++){if(i>=n){v-=x[i-n]*power;zeros-=+(x[i-n]===0)}v=v*29+x[i];zeros+=+(x[i]===0);if(i>=n-1&&(!noF||!zeros))y[i-n+1]=v}return y}
 function pairs(arrays,n,noF){const counts=new Map();let result=0,windows=0;for(const a of arrays)for(const id of ids(a,n,noF)){if(id<0)continue;const old=counts.get(id)||0;result+=old;counts.set(id,old+1);windows++}return {pairs:result,windows}}
 const p=j.pages.filter(p=>p.page<56&&p.indices.length).map(p=>({page:p.page,c:p.indices}));
 if(p.length!==55||p.reduce((a,b)=>a+b.c.length,0)!==12956)throw Error("page geometry");
 const ends=[2,7,14,22,26,32,39,53,55];let start=0;
 const scopes=ends.map(e=>{const q=p.filter(p=>p.page>=start&&p.page<=e);const s={name:`p${start}-${e}`,pages:q.map(x=>x.c)};start=e+1;return s});
 scopes.unshift({name:"all",pages:p.map(x=>x.c)});
 const n=4,refs=inputs.slice(1).map(native);
 function scan(P,a,L,m,sharedCap,pageCaps){const N=L.reduce((a,b)=>a+b,0),starts=P.length-N+1;if(starts<1)return {starts:0};const counts=new Map(),local=L.map(()=>new Map()),pc=L.map(()=>0),ranges=[];let total=0,privateTotal=0,offset=0;
 function change(h,v,sign){const old=h.get(v)||0;if(sign===1){h.set(v,old+1);return old}if(old<1)throw Error("negative count");if(old===1)h.delete(v);else h.set(v,old-1);return 1-old}
 for(let k=0;k<L.length;k++){const length=L[k];if(length>=n+m){const last=offset+length-n-m;ranges.push([offset,last,k]);for(let i=offset;i<=last;i++){const v=a[i];if(v>=0){total+=change(counts,v,1);pc[k]+=change(local[k],v,1)}}privateTotal+=pc[k]}offset+=length}
 let bad=pc.filter((x,k)=>x>pageCaps[k]).length,min=total,max=total,best=0,passing=+(total<=sharedCap),minPrivate=privateTotal,minBad=bad,bestBad=0,privatePassing=+(bad===0),sumCapPassing=+(privateTotal<=pageCaps.reduce((a,b)=>a+b,0));
 const sumCap=pageCaps.reduce((a,b)=>a+b,0);
 for(let s=1;s<starts;s++){for(const [lo,hi,k] of ranges){const old=pc[k];let v=a[s-1+lo];if(v>=0){total+=change(counts,v,-1);pc[k]+=change(local[k],v,-1)}v=a[s+hi];if(v>=0){total+=change(counts,v,1);pc[k]+=change(local[k],v,1)}privateTotal+=pc[k]-old;bad+=+(pc[k]>pageCaps[k])-+(old>pageCaps[k])}
 if(total<min){min=total;best=s}max=Math.max(total,max);passing+=+(total<=sharedCap);minPrivate=Math.min(privateTotal,minPrivate);if(bad<minBad){minBad=bad;bestBad=s}privatePassing+=+(bad===0);sumCapPassing+=+(privateTotal<=sumCap)}
 const direct=[];let o=best;for(const l of L){direct.push(P.slice(o,o+l));o+=l}if(pairs(direct,n+m,true).pairs!==min)throw Error("rolling shared mismatch");
 o=bestBad;const bc=[];for(const l of L){bc.push(P.slice(o,o+l));o+=l}if(bc.filter((x,k)=>pairs([x],n+m,true).pairs>pageCaps[k]).length!==minBad)throw Error("rolling private mismatch");
 return {starts,min,max,best,passing,minPrivate,minBad,bestBad,privatePassing,sumCapPassing}
 }
 // A general memory-m held predecessor difference law D=H(last m consuming P,P).
 // Test exact all-F ambiguity, arbitrary IV and arbitrary secret row function by direct replay.
 let rng=0x8F34056;function rand(m){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%m}const controls=[],results=[];
 for(let m=1;m<=4;m++){
 const aa=refs.map(P=>ids(P,n+m,true));
 for(let source=0;source<3;source++){const tables=new Map(),pp=[],cc=[];let off=3000;
 for(const page of p){let hist=Array(m).fill(0),C=[page.c[0]],P=refs[source].slice(off,off+page.c.length-1);off+=P.length;
 function table(){const id=hist.reduce((a,b)=>a*29+b,0);if(!tables.has(id)){const K=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){const z=rand(i+1);[K[i],K[z]]=[K[z],K[i]]}tables.set(id,K)}return tables.get(id)}
 for(const x of P){if(x===0)C.push(0);else{C.push(mod(C.at(-1)+table()[x]));hist=hist.slice(1).concat(x)}}
 // Replay the exact true sender branch, while retaining consuming-zero collisions.
 hist=Array(m).fill(0);for(let i=0;i<P.length;i++){const x=P[i];if(x===0){if(C[i+1]!==0)throw Error("hold replay")}else{if(table().indexOf(mod(C[i+1]-C[i]))!==x)throw Error("row inverse");hist=hist.slice(1).concat(x)}}
 pp.push(P);cc.push(C)}
 const D=cc.map(c=>c.slice(m+1).map((v,i)=>mod(v-c[i+m]))),a=pairs(pp,n+m,true),b=pairs(D,n,false);if(a.pairs>b.pairs||pp.some((P,k)=>pairs([P],n+m,true).pairs>pairs([D[k]],n,false).pairs))throw Error("theorem");
 controls.push({m,source,plaintext:a,ciphertext:b,heldF:pp.flat().filter(x=>x===0).length})}
 for(const sc of scopes){if(m!==1&&sc.name!=="all"&&sc.name!=="p40-53"&&sc.name!=="p54-55")continue;
 const D=sc.pages.map(c=>c.slice(m+1).map((v,i)=>mod(v-c[i+m]))),cap=pairs(D,n,false),L=sc.pages.map(x=>x.length-1),pageCaps=D.map(d=>pairs([d],n,false).pairs);
 results.push({m,scope:sc.name,transitions:L.reduce((a,b)=>a+b,0),capacity:cap,privateCapacity:pageCaps.reduce((a,b)=>a+b,0),pageCaps,refs:refs.map((P,k)=>scan(P,aa[k],L,m,cap.pairs,pageCaps))})}
 }
 return {n,reference_lengths:refs.map(x=>x.length),controls,results}
}
console.log(JSON.stringify(experiment(inputs),null,2));
