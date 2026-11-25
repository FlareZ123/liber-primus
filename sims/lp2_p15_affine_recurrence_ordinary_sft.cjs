'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function main(c,native,em){
const Q=29,N=29**4,W=Math.ceil(N/32),lastMask=2**(N%32)-1,polys=[[1,14,22,5,17],[1,14,27,10,7]];
const mod=x=>(x%29+29)%29;
const tok=c.translit.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length),P=[];
for(const w of em.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S').match(/[A-Z]+/g)||[])for(let i=0;i<w.length;){const x=w.startsWith('ING',i)?['ING',21]:w.startsWith('IO',i)?['IO',27]:tok.find(([x])=>w.startsWith(x,i));if(!x)throw Error(w);P.push(x[1]);i+=x[0].length;}
const ct=new Uint32Array(29**3),big=new Uint32Array(841),dn=new Uint32Array(841),bd=new Uint32Array(29),lm=new Float64Array(29**3);
for(let i=1;i<P.length;i++){big[P[i-1]*29+P[i]]++;bd[P[i-1]]++;if(i>=2){const j=P[i-2]*29+P[i-1];ct[j*29+P[i]]++;dn[j]++;}}
for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let x=0;x<29;x++){const j=a*29+b,pb=(big[b*29+x]+.3)/(bd[b]+8.7);lm[j*29+x]=Math.log((ct[j*29+x]+10*pb)/(dn[j]+10));}
const score=p=>{let s=0;for(let i=2;i<p.length;i++)s+=lm[(p[i-2]*29+p[i-1])*29+p[i]];return s/(p.length-2);};
const step=(p,poly)=>{const a=p%29,b=Math.floor(p/29)%29,c=Math.floor(p/841)%29,d=Math.floor(p/24389);return Math.floor(p/29)+24389*mod(-poly[1]*d-poly[2]*c-poly[3]*b-poly[4]*a);};
function build(poly){const order=new Uint32Array(N),seen=new Uint8Array(N),cycles=[];let at=0;for(let s=0;s<N;s++){if(seen[s])continue;let p=s,start=at;do{seen[p]=1;order[at++]=p;p=step(p,poly);}while(p!==s);cycles.push([start,at-1]);}const allowed=Array.from({length:29},()=>new Uint32Array(W)),end=new Uint32Array(W);
for(let i=0;i<N;i++){const k=order[i]%29,b=1<<(i&31),j=i>>>5;for(let x=0;x<29;x++){const v=mod(x-k);if(v!==12&&v!==22)allowed[x][j]|=b;}}
for(const [a,b] of cycles)end[b>>>5]|=1<<(b&31);return {poly,order,cycles,allowed,end};}
const matrices=polys.map(build);
function decode(C,poly,seed,off){let p=seed;return C.map(x=>{const y=mod(x-p%29-off);p=step(p,poly);return y;});}
function encrypt(P,poly,seed,off){let p=seed;return P.map(x=>{const y=mod(x+p%29+off);p=step(p,poly);return y;});}
function fit(C,dev){let top=null,num=0,by=[];for(let m=0;m<matrices.length;m++){const {poly,order,cycles,allowed,end}=matrices[m];let count=0;for(let off=0;off<29;off++){let S=new Uint32Array(W).fill(0xffffffff),T=new Uint32Array(W);S[W-1]&=lastMask;for(let i=dev-1;i>=0;i--){const a=allowed[mod(C[i]-off)];let any=0;for(let j=0;j<W;j++)T[j]=(((S[j]>>>1)|(j+1<W?S[j+1]<<31:0))&~end[j])&a[j];for(const [l,h] of cycles)if((S[l>>>5]>>>(l&31)&1)&&(a[h>>>5]>>>(h&31)&1))T[h>>>5]|=1<<(h&31);for(let j=0;j<W;j++)any|=T[j];[S,T]=[T,S];if(!any)break;}
for(let j=0;j<W;j++){let x=S[j];while(x){const bit=31-Math.clz32(x&-x),seed=order[j*32+bit];x=(x&(x-1))>>>0;num++;count++;const d=decode(C.slice(0,dev),poly,seed,off),s=score(d);if(d.includes(12)||d.includes(22))throw Error('bitset support mismatch');if(!top||s>top.score)top={m,seed,off,score:s,fit:d};}}}by.push(count);}
if(!top)return {num,by};const d=decode(C,polys[top.m],top.seed,top.off);return {num,by,m:top.m,seed:top.seed,off:top.off,fitScore:top.score,holdScore:score(d.slice(dev)),holdRare:d.slice(dev).filter(x=>x===12||x===22).length,fitText:top.fit.map(x=>c.translit[x]).join(' '),holdText:d.slice(dev,dev+60).map(x=>c.translit[x]).join(' '),decoded:d};}
const orig=c.pages.filter(x=>x.page>=15&&x.page<=16).flatMap(x=>x.indices).slice(20),dev=139;
const rn=new Map(c.runes.map((x,i)=>[x,i]));
const plants=[['0_koan_1',0,219384,17],['0_loss_of_divinity',1,514321,6]].map(([name,m,seed,off])=>{const p=Array.from(native.sections.find(s=>s.name===name).source_text).filter(x=>rn.has(x)).map(x=>rn.get(x)).slice(0,orig.length);const result=fit(encrypt(p,polys[m],seed,off),dev);return {name,m,seed,off,result:{...result,decoded:undefined},correct:result.decoded?.filter((v,i)=>v===p[i]).length??0,total:p.length};});
const result=fit(orig,dev);return {dev,n:orig.length,plants,original:{...result,decoded:undefined}};
}
console.log(JSON.stringify(main(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json')),read('resources/control/emerson_essays_2944.txt')),null,2));
