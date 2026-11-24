'use strict';
// Director #2621: frozen whole-number modular inverse and right-to-left carry.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
function experiment(corpus,src,native,assert){
 const source=src.replace(/\r\n/g,"\n").split("\n%\n").slice(36,39).join("\n");
 const marks=[...source.matchAll(/(?:^|\n)([1-5])-/gu)];
 const runes=s=>[...s].map(c=>corpus.runes.indexOf(c)).filter(i=>i>=0);
 const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const units=marks.map((mark,i)=>{
   const begin=mark.index+mark[0].length,end=i===4?source.indexOf("\n&\n",begin):marks[i+1].index;
   const words=source.slice(begin,end).trim().replace(/\/\n/gu,"").split(/[.\-]/u).map(runes).filter(x=>x.length);
   return {words,values:words.flat()};
 });
 assert(eq(units.map(x=>x.values.length),[139,91,98,96,129]),"original five units");
 assert(eq(units.map(x=>x.words.length),[30,20,25,19,28]),"original word cuts");
 const c=units.flatMap(u=>u.values);
 const p=corpus.pages;
 assert(eq(c,[...p[36].indices.slice(99),...p[37].indices,...p[38].indices.slice(0,186)]),"independent physical source slicing");
 const m=29n**BigInt(c.length),mod=(x,n)=>(x%n+n)%n;
 const int=a=>a.reduce((x,y)=>x*29n+BigInt(y),0n);
 function digits(x,n){const a=Array(n);for(let i=n-1;i>=0;i--){a[i]=Number(x%29n);x/=29n;}assert(x===0n,"width overflow");return a;}
 function inverse(a,n){let [r,s,t,u]=[n,a,0n,1n];while(s){const q=r/s;[r,s,t,u]=[s,r-q*s,u,t-q*u];}assert(r===1n,"nonunit");return mod(t,n);}
 function digitInverse(c,a){const iv=Number(inverse(BigInt(a),29n));let carry=0;const p=Array(c.length);const states=Array(c.length+1);states[c.length]=carry;for(let i=c.length-1;i>=0;i--){p[i]=((iv*(c[i]-carry)%29)+29)%29;carry=(a*p[i]+carry-c[i])/29;assert(Number.isInteger(carry)&&carry>=0&&carry<a,"carry invariant");states[i]=carry;}return {p,states};}
 function decrypt(c,a){const big=digits(mod(int(c)*inverse(BigInt(a),m),m),c.length),d=digitInverse(c,a);assert(eq(big,d.p),"bigint/digit inverse equality");assert(int(c)===mod(int(big)*BigInt(a),m),"forward reencryption");return d;}
 const nativeTexts=native.sections.map(s=>({name:s.name,a:runes(s.source_text)}));
 const donors=nativeTexts.filter(s=>["0_koan_1","0_loss_of_divinity"].includes(s.name));
 const train=nativeTexts.filter(s=>!donors.includes(s));
 const unigram=new Float64Array(29).fill(.5),bigram=new Float64Array(841).fill(.1),trigram=new Float64Array(24389).fill(.05);
 for(const {a} of train)for(let i=0;i<a.length;i++){unigram[a[i]]++;if(i)bigram[29*a[i-1]+a[i]]++;if(i>1)trigram[(29*a[i-2]+a[i-1])*29+a[i]]++;}
 const total=unigram.reduce((a,b)=>a+b,0);for(let j=0;j<29;j++)unigram[j]/=total;
 for(let i=0;i<29;i++){let n=0;for(let j=0;j<29;j++)n+=bigram[29*i+j];for(let j=0;j<29;j++)bigram[29*i+j]=.8*bigram[29*i+j]/n+.2*unigram[j];}
 for(let i=0;i<841;i++){let n=0;for(let j=0;j<29;j++)n+=trigram[29*i+j];for(let j=0;j<29;j++)trigram[29*i+j]=Math.log(.7*trigram[29*i+j]/n+.3*bigram[(i%29)*29+j]);}
 const score=a=>a.slice(2).reduce((v,x,i)=>v+trigram[(29*a[i]+a[i+1])*29+x],0)/(a.length-2);
 const ioc=a=>{const f=Array(29).fill(0);for(const x of a)f[x]++;return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));};
 const render=(a,words)=>{let i=0;return words.map(w=>a.slice(i,i+=w.length).map(x=>corpus.translit[x]).join("")).join(" ");};
 const bounds=[0,139,230,328,424,553];
 const summarize=a=>({full:score(a),ioc:ioc(a),units:bounds.slice(0,-1).map((x,i)=>score(a.slice(x,bounds[i+1])))});
 const cases=[1033,3301].map(a=>{
   const d=decrypt(c,a);
   const controls=donors.map(s=>{const gold=s.a.slice(0,c.length);assert(gold.length===c.length,"native control length");const cipher=digits(mod(int(gold)*BigInt(a),m),c.length);const p=decrypt(cipher,a).p;assert(eq(p,gold),"native round trip");return {source:s.name,...summarize(p)};});
   return {a,...summarize(d.p),carryAtBounds:bounds.map(i=>d.states[i]),texts:units.map((u,i)=>render(d.p.slice(bounds[i],bounds[i+1]),u.words)),controls};
 });
 return {raw:summarize(c),cases};
}
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
console.log(JSON.stringify(experiment(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/liber-primus/lp2-transcription.txt'),JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json')),assert.ok),null,2));
