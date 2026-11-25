'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function main(c,native,mode='all'){
 const mod=x=>(x%29+29)%29,N=29**4,W=Math.ceil(N/32),lastMask=2**(N%32)-1;
 const polys=[[1,14,22,5,17],[1,14,27,10,7]];
 const step=(p,poly)=>{const a=p%29,b=Math.floor(p/29)%29,c=Math.floor(p/841)%29,d=Math.floor(p/24389);return Math.floor(p/29)+24389*mod(-poly[1]*d-poly[2]*c-poly[3]*b-poly[4]*a);};
 function build(poly){const order=new Uint32Array(N),seen=new Uint8Array(N),cycles=[];let at=0;
 for(let s=0;s<N;s++){if(seen[s])continue;let p=s,start=at;do{seen[p]=1;order[at++]=p;p=step(p,poly);}while(p!==s);cycles.push([start,at-1]);}
 const normal=Array.from({length:29},()=>new Uint32Array(W)),strict=Array.from({length:29},()=>new Uint32Array(W)),starts=new Uint32Array(W),ends=new Uint32Array(W);
 for(let i=0;i<N;i++){const k=order[i]%29,b=1<<(i&31),j=i>>>5;for(let x=0;x<29;x++){const v=mod(x-k);if(v){normal[x][j]|=b;if(v!==12&&v!==22)strict[x][j]|=b;}}}
 for(const [a,b] of cycles){starts[a>>>5]|=1<<(a&31);ends[b>>>5]|=1<<(b&31);}return {poly,order,cycles,normal,strict,starts,ends};}
 function run(M,C,A,off,excludeZero=false,back=false){
 let S=new Uint32Array(W).fill(0xffffffff),T=new Uint32Array(W),U=new Uint32Array(W);S[W-1]&=lastMask;if(excludeZero&&off===0)S[0]&=~1;
 for(let k=0;k<C.length;k++){const x=C[back?C.length-1-k:k],a=A[mod(x-off)];let any=0;
 if(back){for(let j=0;j<W;j++)T[j]=(((S[j]>>>1)|(j+1<W?S[j+1]<<31:0))&~M.ends[j])&a[j];
 for(const [l,h] of M.cycles)if((S[l>>>5]>>>(l&31)&1)&&(a[h>>>5]>>>(h&31)&1))T[h>>>5]|=1<<(h&31);}
 else{for(let j=0;j<W;j++)U[j]=S[j]&a[j];for(let j=0;j<W;j++)T[j]=((U[j]<<1)|(j?U[j-1]>>>31:0))&~M.starts[j];
 for(const [l,h] of M.cycles)if(U[h>>>5]>>>(h&31)&1)T[l>>>5]|=1<<(l&31);T[W-1]&=lastMask;}
 if(x===0)for(let j=0;j<W;j++){T[j]|=S[j];any|=T[j];}else for(let j=0;j<W;j++)any|=T[j];
 if(!any)return {reach:k,states:null};[S,T]=[T,S];}return {reach:C.length,states:S};}
 function extract(M,S){const result=[];if(S)for(let j=0;j<W;j++){let x=S[j];while(x){const bit=31-Math.clz32(x&-x);result.push(M.order[j*32+bit]);x=(x&(x-1))>>>0;}}return result;}
 const mats=polys.map(build),C=c.pages.filter(x=>x.page>=15&&x.page<=22).flatMap(x=>x.indices).slice(20);
 const out={n:C.length,mats:mats.map(M=>({poly:M.poly,cycles:M.cycles.length}))};
 if(mode!=='controls'){out.original=mats.map(M=>({poly:M.poly,normalMax:Array.from({length:29},(_,off)=>run(M,C,M.normal,off,true).reach),strictMax:Array.from({length:29},(_,off)=>run(M,C,M.strict,off).reach)}));}
 const rn=new Map(c.runes.map((x,i)=>[x,i]));
 out.controls=[['0_koan_1',0,219384,17],['0_loss_of_divinity',1,514321,6]].map(([name,m,seed,off])=>{
 const P=Array.from(native.sections.find(s=>s.name===name).source_text).filter(x=>rn.has(x)).map(x=>rn.get(x)).slice(0,406);
 let s=seed;const C=P.map(v=>{if(!v)return 0;const y=mod(v+s%29+off);s=step(s,polys[m]);return y;});
 const candidates=[];for(let k=0;k<mats.length;k++){const M=mats[k];for(let o=0;o<29;o++){const f=run(M,C,M.strict,o);if(f.states){const b=run(M,C,M.strict,o,false,true);for(const p of extract(M,b.states))candidates.push({m:k,off:o,seed:p});}}}
 if(!candidates.some(x=>x.m===m&&x.off===off&&x.seed===seed))throw Error('planted state lost');
 // fixed-state path count and one exact decoding, independent of native text
 function invert(M,C,seed,off){let states=new Map([[seed,{count:1,text:[]}]]);for(const x of C){const next=new Map();function add(s,p,v){const z=next.get(s);if(z)z.count+=p.count;else next.set(s,{count:p.count,text:[...p.text,v]});}
 for(const [s,p] of states){if(x===0)add(s,p,0);const v=mod(x-s%29-off);if(v&&v!==12&&v!==22)add(step(s,M.poly),p,v);}states=next;if(!states.size)break;}
 return [...states.values()];}
 const actual=invert(mats[m],C,seed,off),count=actual.reduce((s,x)=>s+x.count,0),correct=Math.max(...actual.map(x=>x.text.filter((v,i)=>v===P[i]).length));
 return {name,m,seed,off,n:P.length,candidates,count,correct};});
 return out;
}
console.log(JSON.stringify(main(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json')),process.argv[2]),null,2));
