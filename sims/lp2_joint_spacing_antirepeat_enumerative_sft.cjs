"use strict";
// Exact joint GP29 and boundary enumerative inverse; no salt or hidden layout state.
const fs=require("node:fs"),path=require("node:path");
function experiment(corpus,transcript,donor){
 const assert=(b,m)=>{if(!b)throw Error(m)};
 const eq=(a,b,m)=>assert(JSON.stringify(a)===JSON.stringify(b),m);
 const index=new Map(corpus.runes.map((r,i)=>[r,i]));
 const CHOICE=".-&$§",rows=[[1n]];
 function choose(n,k){if(k<0||k>n)return 0n;while(rows.length<=n){const p=rows.at(-1),q=[1n];for(let i=1;i<p.length;i++)q.push(p[i-1]+p[i]);q.push(1n);rows.push(q);}return rows[n][k];}
 function table(n,k){const t=Array.from({length:n+1},()=>Array(k+1).fill(0n));t[0][0]=1n;for(let i=1;i<=n;i++)for(let j=0;j<=k;j++)t[i][j]=28n*t[i-1][j]+(j?t[i-1][j-1]:0n);return t;}
 const num=(a)=>a.reduce((x,r)=>x*29n+BigInt(r),0n);
 function digits(x,n){let a=Array(n);for(let i=n-1;i>=0;i--){a[i]=Number(x%29n);x/=29n;}assert(x===0n,"overflow");return a;}
 const rankGaps=a=>a.reduce((s,v,i)=>s+choose(v,i+1),0n);
 function unrankGaps(r,n,b){assert(r>=0n&&r<choose(n,b),"gap rank");const a=Array(b);let u=n-1;for(let i=b;i>0;i--){let l=i-1,h=u,v=i-1;while(l<=h){const m=(l+h)>>1;if(choose(m,i)<=r){v=m;l=m+1;}else h=m-1;}a[i-1]=v;r-=choose(v,i);u=v-1;}assert(r===0n,"gap residue");return a;}
 function rankRune(c,t,k){let r=BigInt(c[0])*t[c.length-1][k];for(let i=1;i<c.length;i++){const d=(c[i]-c[i-1]+29)%29,j=c.length-1-i;if(d){r+=(k?t[j][k-1]:0n)+BigInt(d-1)*t[j][k];}else{assert(k>0,"excess repeat");k--;}}assert(k===0,"missing repeat");return r;}
 function unrankRune(r,t,n,k){let a=[Number(r/t[n-1][k])];r%=t[n-1][k];for(let i=1;i<n;i++){const j=n-1-i,z=k?t[j][k-1]:0n;if(r<z){a.push(a.at(-1));k--;}else{r-=z;assert(t[j][k]>0n,"invalid rank branch");const d=Number(r/t[j][k])+1;assert(d<=28,"rank overflow");r%=t[j][k];a.push((a.at(-1)+d)%29);}}assert(k===0&&r===0n,"rune rank residue");return a;}
 const repeat=a=>a.slice(1).filter((v,i)=>v===a[i]).length;
 function log2(x){const bits=x.toString(2),prefix=bits.slice(0,52);return Math.log2(parseInt(prefix,2))+bits.length-prefix.length;}
 function model(n,k,b){const t=table(n-1,k),m=29n*t[n-1][k],u=29n**BigInt(n),g=choose(n-1,b),cap=m*g;let bi=b;while(bi>=0&&u*choose(n-1,bi)>cap)bi--;return {n,k,b,bi,t,m,u,g,cap,incap:bi>=0?choose(n-1,bi):0n};}
 function encode(p,md){assert(p.runes.length===md.n&&p.boundaries.length===md.bi,"input shape");const j=num(p.runes)*md.incap+rankGaps(p.boundaries);assert(j<md.cap,"input rank overflow");return {runes:unrankRune(j/md.g,md.t,md.n,md.k),boundaries:unrankGaps(j%md.g,md.n-1,md.b)};}
 function decode(c,md){assert(c.runes.length===md.n&&c.boundaries.length===md.b&&repeat(c.runes)===md.k,"output shape");const j=rankRune(c.runes,md.t,md.k)*md.g+rankGaps(c.boundaries);if(md.bi<0||j>=md.u*md.incap)return null;return {runes:digits(j/md.incap,md.n),boundaries:unrankGaps(j%md.incap,md.n-1,md.bi)};}
 function words(p){let w=[],start=0;for(const b of p.boundaries){w.push(p.runes.slice(start,b+1));start=b+1;}w.push(p.runes.slice(start));return w;}
 function ioc(a){const c=Array(29).fill(0);for(const x of a)c[x]++;return c.reduce((s,v)=>s+v*(v-1),0)/(a.length*(a.length-1));}
 const segments=transcript.split("%").slice(0,55);
 const source=segments.map((s,i)=>{const page=i<50?i:i+1,indices=corpus.pages.find(p=>p.page===page).indices;const chars=[...s],pos=[];for(let j=0;j<chars.length;j++)if(index.has(chars[j]))pos.push(j);eq(pos.map(j=>index.get(chars[j])),indices,"original transcription");const boundaries=[];for(let j=1;j<pos.length;j++)if(chars.slice(pos[j-1]+1,pos[j]).some(c=>CHOICE.includes(c)))boundaries.push(j-1);return {page,runes:indices,boundaries};});
 eq([source.length,source.reduce((s,p)=>s+p.runes.length,0),source.reduce((s,p)=>s+p.boundaries.length,0),source.reduce((s,p)=>s+repeat(p.runes),0)],[55,12956,2873,86],"source totals");
 const decoded=[],records=[];let deficit=0,delta=0;
 for(const p of source){const md=model(p.runes.length,repeat(p.runes),p.boundaries.length),d=decode(p,md);deficit+=log2(md.u)-log2(md.m);delta+=md.b-md.bi;if(d){eq(encode(d,md),{runes:p.runes,boundaries:p.boundaries},"original replay");decoded.push(...d.runes);}records.push({page:p.page,n:md.n,k:md.k,bOut:md.b,bIn:md.bi,removed:md.b-md.bi,valid:!!d,ratio:Number((md.u*md.incap*1000000n)/md.cap)/1e6,ioc:d?ioc(d.runes):null,sample:d?words(d).slice(0,12).map(w=>w.map(x=>corpus.translit[x]).join("")).join(" "):null});}
 const nativeWords=donor.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(r=>index.get(r))));
 const allNative=nativeWords.flat(),nativeBreak=[];let pos=0;for(const w of nativeWords){pos+=w.length;nativeBreak.push(pos-1);}
 const plants=[];for(const [start,page] of [[0,0],[1500,16]]){const n=source.find(p=>p.page===page).runes.length,k=repeat(source.find(p=>p.page===page).runes),p={runes:allNative.slice(start,start+n),boundaries:nativeBreak.filter(g=>g>=start&&g<start+n-1).map(g=>g-start)};let b=p.boundaries.length,md=model(n,k,b);while(md.bi<p.boundaries.length){b++;assert(b<=(n-1)/2,"no native capacity");md=model(n,k,b);}assert(md.bi===p.boundaries.length,"native count inverse");const c=encode(p,md),q=decode(c,md);eq(q,p,"native joint rune and boundary replay");plants.push({start,page,n,k,bIn:md.bi,bOut:md.b,actualRepeats:repeat(c.runes),nativeIoc:ioc(p.runes),cipherIoc:ioc(c.runes)});}
 return {deficit,removed:delta,capacityInputBoundaries:2873-delta,validPages:records.filter(r=>r.valid).length,decodedRunes:decoded.length,decodedIoc:ioc(decoded),records,plants};
}
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const result=experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")));
console.log(JSON.stringify(result,null,2));
