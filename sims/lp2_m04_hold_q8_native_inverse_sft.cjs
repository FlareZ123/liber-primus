"use strict";
// M04 native bigram forward and unknown-q8 key recovery, #2728.
function experiment(raw){
const alphabet=[..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"],ix=new Map(alphabet.map((v,i)=>[v,i])),tok="F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" "),tokens=tok.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
const mod=x=>(x+29)%29,q=1-29*86/12947,repair=q/28,L=8,Nfit=232,Nheld=76;
function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);const out=[];for(const w of t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let j=0;j<w.length;){const v=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!v)throw Error("unmapped "+w);out.push(v.i);j+=v.t.length}}return out}
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
const donors=raw.slice(1).map(native),train=donors.map(d=>d.slice(0,Math.floor(d.length*.8)));
const uni=Array(29).fill(1),B=Array.from({length:29},()=>Array(29).fill(.5));for(const d of train)for(let i=0;i<d.length;i++){uni[d[i]]++;if(i)B[d[i-1]][d[i]]++}
function normalize(a){const n=a.reduce((x,y)=>x+y,0);return a.map(x=>x/n)}
const U=normalize(uni),P=B.map(normalize),logP=P.map(a=>a.map(Math.log)),logU=U.map(Math.log);
function canonical(K){let best=Infinity;for(let s=0;s<L;s++){let n=0;for(let i=0;i<L;i++)n=n*29+K[(s+i)%L];best=Math.min(best,n)}return best}
function keyDecode(n){const K=Array(L);for(let i=L-1;i>=0;i--){K[i]=n%29;n=Math.floor(n/29)}return K}
function plant(p,K,R){let s=0,C=[],repaired=[],falseRepeats=[];for(let i=0;i<p.length;i++){let c=(p[i]+K[s%K.length])%29;if(i&&c===C[i-1]){if(R()/4294967296<q){c=(c+1+R()%28)%29;repaired.push(i);C.push(c);continue}else falseRepeats.push(i)}C.push(c);s++}return {C,repaired,falseRepeats}}
function uniformLL(C){let z=-Math.log(29);for(let i=1;i<C.length;i++)z+=Math.log(C[i]===C[i-1]?(1-q)/29:(1+repair)/29);return z}
function score(C,K){
let a=new Float64Array(L),b=new Float64Array(L),A=new Float64Array(L),D=new Float64Array(L),z=0;
for(let s=0;s<L;s++){a[s]=U[mod(C[0]-K[(s+7)&7])]/L;z+=a[s]}
let ll=Math.log(z);for(let s=0;s<L;s++)a[s]/=z;
for(let i=1;i<C.length;i++){
 const c=C[i],prev=C[i-1],prev2=i>1?C[i-2]:0,eq=c===prev;z=0;
 for(let s=0;s<L;s++){const oldN=mod(prev-K[(s+7)&7]),oldR=mod(prev2-K[s]),p=mod(c-K[s]),v=mod(prev-K[s]);
 const n=(a[s]*P[oldN][p]+b[s]*P[oldR][p])*(eq?1-q:1);
 const h=eq?0:(a[s]*P[oldN][v]+b[s]*P[oldR][v])*repair;
 A[(s+1)&7]=n;D[s]=h;z+=n+h}
 ll+=Math.log(z);for(let s=0;s<L;s++){a[s]=A[s]/z;b[s]=D[s]/z}
}
return ll
}
function seedWindow(C){
 const w=Array.from({length:L},()=>new Float64Array(29*29));
 for(let i=0;i<C.length-1;i++){let e=w[i&7],x=C[i],y=C[i+1];for(let a=0;a<29;a++){const p=mod(x-a),row=logP[p];for(let b=0;b<29;b++)e[a*29+b]+=row[mod(y-b)]}}
 const out=[];
 for(let first=0;first<29;first++){
 let a=new Float64Array(29),b=new Float64Array(29),back=Array.from({length:7},()=>new Int8Array(29));a.fill(-Infinity);a[first]=logU[mod(C[0]-first)];
 for(let e=0;e<7;e++){for(let t=0;t<29;t++){let best=-Infinity,k=0;for(let s=0;s<29;s++){const v=a[s]+w[e][s*29+t];if(v>best){best=v;k=s}}b[t]=best;back[e][t]=k}[a,b]=[b,a]}
 let best=-Infinity,last=0;for(let k=0;k<29;k++){const v=a[k]+w[7][k*29+first];if(v>best){best=v;last=k}}
 const K=Array(8);K[7]=last;for(let j=6;j>=0;j--)K[j]=back[j][K[j+1]];out.push({K,z:best});
 }
 return out.sort((a,b)=>b.z-a.z).slice(0,3).map(x=>x.K)
}
function recover(C){
 const seeds=new Set();for(const len of [40,64,96])for(let i=0;i+len<=C.length;i+=Math.floor(len/2))for(const K of seedWindow(C.slice(i,i+len)))seeds.add(canonical(K));
 let ranked=[...seeds].map(z=>({K:keyDecode(z),ll:score(C,keyDecode(z))})).sort((a,b)=>b.ll-a.ll);
 const initial=ranked[0].ll, results=[];let evals=ranked.length;
 for(const v of ranked.slice(0,6)){const K=v.K.slice();let ll=v.ll,passes=0;
 for(let pass=0;pass<4;pass++){passes++;let changed=false;for(let s=0;s<L;s++){let old=K[s],best=old,bestLL=ll;for(let k=0;k<29;k++)if(k!==old){K[s]=k;const n=score(C,K);evals++;if(n>bestLL+1e-9){bestLL=n;best=k}}K[s]=best;ll=bestLL;if(best!==old)changed=true}if(!changed)break}
 results.push({K:keyDecode(canonical(K)),ll,passes})
 }
 results.sort((a,b)=>b.ll-a.ll);
 return {K:results[0].K,ll:results[0].ll,initial,seeds:seeds.size,evals,top:results.slice(0,3)}
}
function detailed(C,K){
 const n=C.length,S=16,alpha=Array.from({length:n},()=>new Float64Array(S)),beta=Array.from({length:n},()=>new Float64Array(S)),vit=Array.from({length:n},()=>new Float64Array(S).fill(-Infinity)),back=Array.from({length:n},()=>new Int8Array(S).fill(-1)),scale=new Float64Array(n);
 function plaintext(i,state){const s=state&7;return state<8?mod(C[i]-K[(s+7)&7]):mod(C[i-1]-K[s])}
 for(let s=0;s<8;s++){alpha[0][s]=U[plaintext(0,s)]/8;vit[0][s]=Math.log(alpha[0][s]);scale[0]+=alpha[0][s]}for(let s=0;s<S;s++)alpha[0][s]/=scale[0];
 function edges(i,state){let s=state&7,prev=plaintext(i-1,state),eq=C[i]===C[i-1],p=mod(C[i]-K[s]),out=[[(s+1)&7,P[prev][p]*(eq?1-q:1)]];if(!eq){let v=mod(C[i-1]-K[s]);out.push([s+8,P[prev][v]*repair])}return out}
 for(let i=1;i<n;i++){for(let s=0;s<S;s++){if(i===1&&s>=8)continue;for(const [t,w] of edges(i,s)){alpha[i][t]+=alpha[i-1][s]*w;let z=vit[i-1][s]+Math.log(w);if(z>vit[i][t]){vit[i][t]=z;back[i][t]=s}}}scale[i]=alpha[i].reduce((a,b)=>a+b,0);for(let s=0;s<S;s++)alpha[i][s]/=scale[i]}
 beta[n-1].fill(1);for(let i=n-2;i>=0;i--)for(let s=0;s<S;s++){if(i===0&&s>=8)continue;for(const [t,w] of edges(i+1,s))beta[i][s]+=w*beta[i+1][t]/scale[i+1]}
 let state=0;for(let s=1;s<S;s++)if(vit[n-1][s]>vit[n-1][state])state=s;
 const path=Array(n),plain=Array(n),post=Array(n),repairPost=Array(n);for(let i=n-1;i>=0;i--){path[i]=state;plain[i]=plaintext(i,state);state=back[i][state]}
 for(let i=0;i<n;i++){let p=new Float64Array(29),rp=0,z=0;for(let s=0;s<S;s++){if(i===0&&s>=8)continue;const a=alpha[i][s]*beta[i][s];p[plaintext(i,s)]+=a;z+=a;if(s>=8)rp+=a}post[i]=p[plain[i]]/z;repairPost[i]=rp/z}
 const ll=scale.reduce((s,x)=>s+Math.log(x),0);if(Math.abs(ll-score(C,K))>1e-8)throw Error("forward mismatch");
 for(let i=0;i<n;i++){const s=i?path[i-1]&7:((path[0]&7)+7)&7,u=(plain[i]+K[s])%29;if(path[i]>=8){if(i===0||u!==C[i-1]||C[i]===u||(path[i]&7)!==s)throw Error("bad repair replay")}else if(u!==C[i]||((path[i]&7)!==((s+1)&7)))throw Error("bad normal replay")}
 return {ll,plain,path,post,repairPost}
}
const controls=[],nulls=[];
for(let d=0;d<donors.length;d++){
 const R=rng(0x33012728+d),K=Array.from({length:8},()=>R()%29),start=Math.floor(donors[d].length*.8)+100+d*211,p=donors[d].slice(start,start+Nfit+Nheld),pl=plant(p,K,R),C=pl.C,fit=recover(C.slice(0,Nfit)),details=detailed(C,fit.K),trueDetails=detailed(C,K),hold=C.slice(Nfit),matches=details.plain.slice(Nfit).filter((x,i)=>x===p[Nfit+i]).length;
 controls.push({d,start,K,repairs:pl.repaired,falseRepeats:pl.falseRepeats,fit,keyMatch:canonical(fit.K)===canonical(K),trueKeyFit:score(C.slice(0,Nfit),K),heldMatches:matches,heldCount:Nheld,knownKeyHeldMatches:trueDetails.plain.slice(Nfit).filter((x,i)=>x===p[Nfit+i]).length,heldGain:(details.ll-fit.ll-(uniformLL(C)-uniformLL(C.slice(0,Nfit))))/Nheld,repairUncertainty:pl.repaired.map(i=>[i,details.post[i],details.repairPost[i]]),heldConfidence:details.post.slice(Nfit).reduce((a,b)=>a+b,0)/Nheld});
 const nul=plant(p,Array.from({length:p.length},()=>R()%29),R),nf=recover(nul.C.slice(0,Nfit)),nd=detailed(nul.C,nf.K);nulls.push({d,fit:nf,heldGain:(nd.ll-nf.ll-(uniformLL(nul.C)-uniformLL(nul.C.slice(0,Nfit))))/Nheld});
}
const calibrated=controls.every(c=>c.keyMatch&&c.heldMatches>=.9*Nheld&&c.heldGain>.15)&&nulls.every(c=>c.heldGain<.1);
if(!calibrated)return {q,Nfit,Nheld,controls,nulls,calibrated};
const pages=raw[0].split("%"),C=pages.slice(53,55).join("").split("").filter(x=>ix.has(x)).map(x=>ix.get(x));if(C.length!==308||pages[53].split("").filter(x=>ix.has(x)).length!==Nfit)throw Error("original size");
const fit=recover(C.slice(0,Nfit)),details=detailed(C,fit.K),holdGain=(details.ll-fit.ll-(uniformLL(C)-uniformLL(C.slice(0,Nfit))))/Nheld;
return {q,Nfit,Nheld,controls,nulls,calibrated,original:{fit,fitGain:(fit.ll-uniformLL(C.slice(0,Nfit)))/Nfit,holdGain,plaintext:details.plain.map(x=>tok[x]).join(""),held:details.plain.slice(Nfit).map(x=>tok[x]).join(""),repairPost:details.repairPost,post:details.post,path:details.path}};
}
const fs=require("node:fs");
const paths=["resources/transcriptions/lp2-image-corrected.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
