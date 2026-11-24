"use strict";
// Self-contained type-class compression into exact-repeat ciphertext ranks; no external histogram.
const fs=require("node:fs"),path=require("node:path");
function experiment(corpus,transcript,donor,lexicon){
 const assert=(b,m)=>{if(!b)throw Error(m)},eq=(a,b,m)=>assert(JSON.stringify(a)===JSON.stringify(b),m);
 const rows=[[1n]],fact=[1n];
 function choose(n,k){if(k<0||k>n)return 0n;while(rows.length<=n){const p=rows.at(-1),q=[1n];for(let i=1;i<p.length;i++)q.push(p[i-1]+p[i]);q.push(1n);rows.push(q);}return rows[n][k];}
 function factorial(n){while(fact.length<=n)fact.push(fact.at(-1)*BigInt(fact.length));return fact[n];}
 const hist=a=>{const h=Array(29).fill(0);for(const x of a)h[x]++;return h;};
 const typeSize=h=>factorial(h.reduce((a,b)=>a+b,0))/h.reduce((a,b)=>a*factorial(b),1n);
 function rankHistogram(h){let pos=-1,r=0n;for(let i=0;i<28;i++){pos+=h[i]+1;r+=choose(pos,i+1);}return r;}
 function unrankHistogram(r,n){let bars=Array(28),u=n+27;for(let j=28;j>0;j--){let l=j-1,h=u,v=j-1;while(l<=h){const m=(l+h)>>1;if(choose(m,j)<=r){v=m;l=m+1;}else h=m-1;}bars[j-1]=v;r-=choose(v,j);u=v-1;}assert(r===0n,"histogram residue");let prev=-1;const count=bars.map(b=>{const v=b-prev-1;prev=b;return v;});count.push(n+27-prev);return count;}
 function rankType(p,h){const counts=h.slice();let T=typeSize(h),r=0n,N=p.length;for(const x of p){let below=0;for(let j=0;j<x;j++)below+=counts[j];r+=T*BigInt(below)/BigInt(N);T=T*BigInt(counts[x])/BigInt(N);counts[x]--;N--;}assert(T===1n,"type rank");return r;}
 function unrankType(r,h){const counts=h.slice(),out=[];let T=typeSize(h),N=h.reduce((a,b)=>a+b,0);assert(r>=0n&&r<T,"type domain");while(N){let x=0;for(;x<29;x++){const v=T*BigInt(counts[x])/BigInt(N);if(r<v){T=v;break;}r-=v;}assert(x<29,"type digit");counts[x]--;N--;out.push(x);}assert(r===0n,"type residue");return out;}
 function table(n,k){const t=Array.from({length:n+1},()=>Array(k+1).fill(0n));t[0][0]=1n;for(let i=1;i<=n;i++)for(let j=0;j<=k;j++)t[i][j]=28n*t[i-1][j]+(j?t[i-1][j-1]:0n);return t;}
 const repeat=a=>a.slice(1).filter((v,i)=>v===a[i]).length;
 function rankRune(c,t,k){let r=BigInt(c[0])*t[c.length-1][k];for(let i=1;i<c.length;i++){const d=(c[i]-c[i-1]+29)%29,j=c.length-1-i;if(d){r+=(k?t[j][k-1]:0n)+BigInt(d-1)*t[j][k];}else{assert(k>0,"excess repeat");k--;}}assert(k===0,"repeat count");return r;}
 function unrankRune(r,t,n,k){let a=[Number(r/t[n-1][k])];r%=t[n-1][k];for(let i=1;i<n;i++){const j=n-1-i,z=k?t[j][k-1]:0n;if(r<z){a.push(a.at(-1));k--;}else{r-=z;assert(t[j][k]>0n,"bad rune branch");const d=Number(r/t[j][k])+1;assert(d<=28,"rune overflow");r%=t[j][k];a.push((a.at(-1)+d)%29);}}assert(r===0n&&k===0,"rune residue");return a;}
 function model(n,k){const t=table(n-1,k),M=29n*t[n-1][k],H=choose(n+28,28),B=M/H;return {n,k,t,M,H,B};}
 function encode(p,salt,md){const h=hist(p),T=typeSize(h),r=rankType(p,h);assert(T<=md.B,"incompressible type");const rem=salt*T+r;assert(rem<md.B,"salt outside class");const J=rankHistogram(h)*md.B+rem;return unrankRune(J,md.t,md.n,md.k);}
 function decode(c,md){const J=rankRune(c,md.t,md.k),hr=J/md.B,rem=J%md.B;if(hr>=md.H)return null;const h=unrankHistogram(hr,md.n),T=typeSize(h);if(T>md.B)return null;const p=unrankType(rem%T,h),salt=rem/T;return {p,salt,h};}
 function log2(x){const b=x.toString(2),z=b.slice(0,52);return Math.log2(parseInt(z,2))+b.length-z.length;}
 const index=new Map(corpus.runes.map((r,i)=>[r,i])),CHOICE=".-&$§";
 const tokens=corpus.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length),dict=new Set();
 for(const l of lexicon.split("\n")){let w=l.trim().split(/\s+/)[0]?.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");if(!w)continue;let a=[];while(w){const m=tokens.find(x=>w.startsWith(x.t));if(!m){a=[];break;}a.push(m.i);w=w.slice(m.t.length);}if(a.length)dict.add(a.join(","));}
 const source=transcript.split("%").slice(0,55).map((s,i)=>{const page=i<50?i:i+1,indices=corpus.pages.find(p=>p.page===page).indices;const chars=[...s],pos=[];for(let j=0;j<chars.length;j++)if(index.has(chars[j]))pos.push(j);eq(pos.map(j=>index.get(chars[j])),indices,"source exact");let boundaries=[];for(let j=1;j<pos.length;j++)if(chars.slice(pos[j-1]+1,pos[j]).some(c=>CHOICE.includes(c)))boundaries.push(j-1);return {page,runes:indices,boundaries};});
 eq([source.length,source.reduce((s,p)=>s+p.runes.length,0),source.reduce((s,p)=>s+repeat(p.runes),0)],[55,12956,86],"source totals");
 const ioc=a=>{const h=hist(a);return h.reduce((s,v)=>s+v*(v-1),0)/(a.length*(a.length-1));};
 function score(p,breaks){let at=0,n=0,hit=0,long=0,longHit=0,sample=[];for(const j of breaks.concat([p.length-1])){const w=p.slice(at,j+1);at=j+1;n++;if(w.length>=5)long++;if(dict.has(w.join(","))){hit++;if(w.length>=5)longHit++;}if(sample.length<8)sample.push(w.map(x=>corpus.translit[x]).join(""));}return {n,hit,long,longHit,sample};}
 const native=donor.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).flatMap(w=>[...w].map(r=>index.get(r))));
 let plants=[];for(const [start,page] of [[0,0],[1500,16]]){const c=source.find(p=>p.page===page).runes,md=model(c.length,repeat(c)),p=native.slice(start,start+c.length),T=typeSize(hist(p));const encoded=encode(p,1n,md),d=decode(encoded,md);assert(d.salt===1n,"native salt");eq(d.p,p,"native replay");plants.push({page,start,n:md.n,k:md.k,spareBits:log2(md.B)-log2(T),nativeIoc:ioc(p),cipherIoc:ioc(encoded)});}
 let records=[],all=[],minNativeSpare=Infinity;
 for(const c of source){const md=model(c.runes.length,repeat(c.runes)),d=decode(c.runes,md);if(!d){records.push({page:c.page,valid:false});continue;}eq(encode(d.p,d.salt,md),c.runes,"original replay");eq(hist(d.p),d.h,"original histogram");all.push(...d.p);records.push({page:c.page,valid:true,ioc:ioc(d.p),spareBits:log2(md.B)-log2(typeSize(d.h)),...score(d.p,c.boundaries)});}
 const valid=records.filter(x=>x.valid);return {valid:valid.length,invalid:records.length-valid.length,decodedRunes:all.length,ioc:ioc(all),lexical:valid.reduce((a,x)=>({n:a.n+x.n,hit:a.hit+x.hit,long:a.long+x.long,longHit:a.longHit+x.longHit}),{n:0,hit:0,long:0,longHit:0}),plants,records};
}
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/control/english_wordfreq_textblob.txt")),null,2));
