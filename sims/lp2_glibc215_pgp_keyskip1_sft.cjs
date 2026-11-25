// Agent50 Director #2666; exact historical TYPE_3, unbiased GP29.
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
// glibc 2.15 stdlib/random_r.c blob 51a2e8c812aee78783bd6d38c1b6269d41c8e47e
// TYPE_3: degree=31 separation=3, signed seed initialization, 310 warmups.
function rawRandom(seed){
 let u=seed>>>0;if(!u)u=1;
 const s=new Uint32Array(31);s[0]=u;let word=u|0;
 for(let i=1;i<31;i++){const hi=Math.trunc(word/127773),lo=word%127773;word=16807*lo-2836*hi;if(word<0)word+=2147483647;s[i]=word}
 let f=3,r=0;
 const next=()=>{const v=(s[f]+s[r])>>>0;s[f]=v;if(++f===31)f=0;if(++r===31)r=0;return v>>>1};
 for(let i=0;i<310;i++)next();
 return next;
}
function key(seed,len){
 const next=rawRandom(seed),a=new Uint8Array(len),limit=Math.floor(2147483648/29)*29;
 for(let i=0;i<len;i++){let v;do{v=next()}while(v>=limit);a[i]=v%29}
 return a;
}
function selfTest(){
 const vectors={
  0:[1804289383,846930886,1681692777,1714636915,1957747793,424238335,719885386,1649760492,596516649,1189641421,1025202362,1350490027,783368690,1102520059,2044897763,1967513926],
  1:[1804289383,846930886,1681692777,1714636915,1957747793,424238335,719885386,1649760492,596516649,1189641421,1025202362,1350490027,783368690,1102520059,2044897763,1967513926],
  1325734783:[1332282457,1021365587,454527103,2013985894,1804553927,1693412390,290226519,1426378656,1563561132,1172315630,1356163288,79627406,859751814,497137485,110028621,101825480],
  305419896:[457715892,232396016,1235909654,1279099110,589194171,902538946,1657557672,1446561095,1881568325,922111837,1435530974,1047394416,583609033,1802752815,752651234,1467553241],
  2147483648:[1336741213,1210407648,1447044896,337392383,82502902,538660432,1313908778,370221063,344413073,1896089129,2044477265,1711647701,128787895,864892100,985836693,2134634618],
  4294967295:[254925627,1205188300,366127624,1401405153,76053476,1604170158,1302235366,362229243,334960208,1882140968,960816832,627031785,1185930294,1926318319,973293805,2114955885]
 };
 for(const [seed,expected] of Object.entries(vectors)){const next=rawRandom(+seed);for(const n of expected)if(next()!==n)throw Error("native glibc vector mismatch "+seed)}
 return {vectors:6,draws:96,nativeReference:"Debian glibc 2.41; exact 2.15 source inspected"};
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
 selfTest();
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
return {convert,model,key,plant,beam,run,rawRandom,selfTest};
})();

if(require.main===module){
 const fs=require("node:fs"),path=require("node:path");
 const read=p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8");
 const data=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
 const seeds=JSON.parse(read("im-results/agent50-2667-pgp-seeds.json")).candidates;
 const [group="control",start="0",end="10",width="64"]=process.argv.slice(2);
 console.log(JSON.stringify(module.exports.run(data,read("resources/control/gibran_prophet_58585.txt"),read("resources/control/emerson_essays_2944.txt"),read("resources/control/shakespeare_first300k.txt"),seeds,{group,start:+start,end:+end,width:+width}),null,2));
}
