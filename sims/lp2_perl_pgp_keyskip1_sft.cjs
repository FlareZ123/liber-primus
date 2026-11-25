// Agent50 Director #2667. Frozen continuous 29-rune keyskip1 experiment.
// Uses exact drand48 seed32, int(rand(29)), GP trigram scoring, no spaces.
module.exports = (function(){
"use strict";
const Q=29;
const M=Q*Q*Q;
const N=12956;
const HOLD=512;
const W=64;
function convert(text,trans){
 const s=text.toUpperCase().replace(/QU/g,"CW").replace(/[V]/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/[^A-Z]/g,"");
 const tokens=trans.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);
 const out=[];
 for(let i=0;i<s.length;){const t=tokens.find(x=>s.startsWith(x[0],i));if(!t)throw Error("unmapped "+s[i]);out.push(t[1]);i+=t[0].length}
 return out;
}
function model(arrays){
 const u=new Float64Array(Q),b=new Float64Array(Q*Q),t=new Float64Array(M);
 let tot=0;for(const a of arrays){for(let i=0;i<a.length;i++){const p=a[i];u[p]++;tot++;if(i)b[a[i-1]*Q+p]++;if(i>1)t[(a[i-2]*Q+a[i-1])*Q+p]++}}
 const lp1=new Float64Array(Q),lp2=new Float64Array(Q*Q),lp3=new Float64Array(M);
 for(let p=0;p<Q;p++)lp1[p]=Math.log((u[p]+0.5)/(tot+0.5*Q));
 for(let a=0;a<Q;a++){let den=0;for(let p=0;p<Q;p++)den+=b[a*Q+p];for(let p=0;p<Q;p++)lp2[a*Q+p]=Math.log((b[a*Q+p]+8*Math.exp(lp1[p]))/(den+8))}
 for(let a=0;a<Q*Q;a++){let den=0;for(let p=0;p<Q;p++)den+=t[a*Q+p];for(let p=0;p<Q;p++)lp3[a*Q+p]=Math.log((t[a*Q+p]+12*Math.exp(lp2[(a%Q)*Q+p]))/(den+12))}
 return {lp1,lp2,lp3};
}
function key(seed,len){
 let s=(BigInt(seed>>>0)<<16n)|0x330en;const a=new Uint8Array(len);
 for(let i=0;i<len;i++){s=(0x5deece66dn*s+11n)&0xffffffffffffn;a[i]=Number((29n*s)>>48n)}return a;
}
function rnd(seed){let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296}}
function plant(P,K,seed){
 const rng=rnd(seed);let j=0,prev=-1,sk=0;const C=[];
 for(const p of P){let c=(p+K[j++])%Q;if(c===prev&&rng()<0.81288){c=(p+K[j++])%Q;sk++}C.push(c);prev=c}
 return {C,sk};
}
// State is (accepted key index, last two plaintext indices). Equal
// states merge; future trigram scores are identical. cap=1 is frozen.
function beam(C,K,L,{width=W,trace=false,hold=HOLD}={}){
 const n=C.length,split=n-hold;
 const B=2*width+2, maxJ=2*n+4;
 const stamps=new Int32Array(maxJ*2),slots=new Int32Array(maxJ*2);
 let S=new Float64Array(B),J=new Int32Array(B),A=new Uint8Array(B),D=new Uint8Array(B);
 let s2=new Float64Array(B),j2=new Int32Array(B),a2=new Uint8Array(B),d2=new Uint8Array(B),par=new Uint8Array(B);
 const order=Array.from({length:B},(_,i)=>i);
 let count=1,p=(C[0]+Q-K[0])%Q;S[0]=L.lp1[p];J[0]=0;A[0]=p;D[0]=p;
 let prefScore=NaN,prefSk=NaN;
 const bp=trace?new Uint8Array(n*width):null,pp=trace?new Uint8Array(n*width):null,jp=trace?new Int32Array(n*width):null;
 if(trace){pp[0]=p;jp[0]=0}
 for(let i=1;i<n;i++){
  let m=0;const ci=C[i],cp=C[i-1],delta=(ci+Q-cp)%Q;
  for(let h=0;h<count;h++){
   const next=J[h]+1;
   for(let k=0;k<=1;k++){
    const j=next+k;
    if(k&&(K[j]+Q-K[next])%Q!==delta)continue;
    const p=(ci+Q-K[j])%Q;
    const sc=S[h]+(i===1?L.lp2[D[h]*Q+p]:L.lp3[(A[h]*Q+D[h])*Q+p]);
    const id=2*j+k;
    let z;if(stamps[id]===i){z=slots[id];if(sc<=s2[z])continue}
    else{z=m++;stamps[id]=i;slots[id]=z}
    s2[z]=sc;j2[z]=j;a2[z]=D[h];d2[z]=p;par[z]=h;
   }
  }
  const ranked=order.slice(0,m);
  ranked.sort((x,y)=>s2[y]-s2[x]||j2[x]-j2[y]||x-y);
  count=Math.min(width,m);
  // Final HOLD runes are never used to choose the winning prefix path.
  if(i===split-1){count=1;prefScore=s2[ranked[0]];prefSk=j2[ranked[0]]-i}
  for(let h=0;h<count;h++){const z=ranked[h];S[h]=s2[z];J[h]=j2[z];A[h]=a2[z];D[h]=d2[z];if(trace){const loc=i*width+h;bp[loc]=par[z];pp[loc]=D[h];jp[loc]=J[h]}}
 }
 const out={score:S[0]/n,skips:J[0]-(n-1),prefixScore:prefScore/split,prefixSkips:prefSk,holdScore:(S[0]-prefScore)/hold};
 if(trace){let h=0;const P=new Array(n),ks=new Array(n);for(let i=n-1;i>=0;i--){const loc=i*width+h;P[i]=pp[loc];ks[i]=jp[loc];h=bp[loc]}out.P=P;out.ks=ks;let prev=-1,prior=-1;for(let i=0;i<n;i++){const j=ks[i];if(j<=prior||j-prior>2||(P[i]+K[j])%Q!==C[i]||(j-prior===2&&(P[i]+K[j-1])%Q!==prev))throw Error("forward replay");prior=j;prev=C[i]}}
 return out;
}
function run(corpus,gibran,emerson,shakespeare,seeds,{group="control",start=0,end=10,width=W,trace=false}={}){
 const C=corpus.pages.filter(x=>x.page<=55).flatMap(x=>x.indices);
 if(C.length!==N||C.slice(1).filter((x,i)=>x===C[i]).length!==86)throw Error("bad corpus");
 const L=model([convert(gibran,corpus.translit),convert(emerson,corpus.translit)]);
 const P=convert(shakespeare,corpus.translit).slice(0,N);
 if(P.length!==N)throw Error("short plant");
 const seed=0x12345678,K=key(seed,N*2+16),enc=plant(P,K,0x31415926);
 if(group==="control"){
  const d=beam(enc.C,K,L,{width,trace:true});
  const correct=d.P.reduce((s,x,i)=>s+(x===P[i]),0);
  const q={...d,correct,trueSkips:enc.sk,vector:Array.from(K.slice(0,16))};delete q.P;delete q.ks;return q
 }
 const rng=rnd(0x76203519);const used=new Set(seeds.map(x=>x.seed>>>0)),nulls=[];
 while(nulls.length<500){const s=Math.floor(rng()*4294967296);if(!used.has(s)&&s!==seed){used.add(s);nulls.push(s)}}
 const A=group==="candidates"?seeds.map(x=>({rank:x.rank,seed:x.seed})):nulls.map((seed,rank)=>({rank,seed}));
 return A.slice(start,end).map(x=>({...x,seed32:x.seed>>>0,...beam(group==="plantnull"?enc.C:C,key(x.seed,N*2+16),L,{width,trace})}));
}
return {convert,model,key,plant,beam,run};
})();

if(require.main===module){
 const fs=require("node:fs"),path=require("node:path");
 const read=p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8");
 const data=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
 const seeds=JSON.parse(read("im-results/agent50-2667-pgp-seeds.json")).candidates;
 const [group="control",start="0",end="10",width="64"]=process.argv.slice(2);
 console.log(JSON.stringify(module.exports.run(data,read("resources/control/gibran_prophet_58585.txt"),read("resources/control/emerson_essays_2944.txt"),read("resources/control/shakespeare_first300k.txt"),seeds,{group,start:+start,end:+end,width:+width}),null,2));
}
