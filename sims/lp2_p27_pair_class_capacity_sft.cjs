// Read-only pair-class capacity SFT; execute from repository root.
const fs=require('node:fs');
const paths=[
"resources/liber-primus/lp2-corpus.json",
"resources/external/relikd-solved-gp29-native-v1.json",
"resources/external/blake-marriage-1906-gutenberg45315.txt",
"resources/external/2013-liber-al-bookcode-I.txt",
"resources/external/2013-liber-al-bookcode-II.txt",
"resources/external/2013-liber-al-bookcode-III.txt",
"resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt",
"resources/control/gibran_prophet_58585.txt",
"resources/control/emerson_essays_2944.txt",
"resources/control/shakespeare_first300k.txt"
];
function study(A,B,donors){
const assert=(x,msg)=>{if(!x)throw Error(msg)};
const count=x=>{const a=Array(29).fill(0);for(const y of x){assert(y>=0&&y<29,"bad rune");a[y]++;}return a;};
const sum=x=>x.reduce((a,b)=>a+b,0);
const sorted=x=>[...x].sort((a,b)=>b-a);
const prefix=x=>{let s=0;return x.map(v=>s+=v);};
function normalize(t){const map=new Map(A.translit.map((x,i)=>[x,i])),out=[];for(let w of(t.normalize("NFKD").replace(/\p{M}/gu,"").toUpperCase().match(/[A-Z]+/g)||[])){w=w.replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){const d=w.slice(i,i+2),k=d.length===2&&map.has(d)?2:1,x=map.get(w.slice(i,i+k));assert(x!==undefined,w);out.push(x);i+=k}}return out}
const tapes=donors.map(normalize);
const pages=A.pages.filter(p=>p.status==="unsolved");
const ranges=[[0,2],[3,5],[6,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
function cap(blocks,m=2){const p=blocks.map(x=>prefix(sorted(x)));return Array.from({length:29},(_,i)=>sum(p.map(x=>x[Math.min(28,m*(i+1)-1)])))}
function gap(p,c){let g=-Infinity;for(let i=0;i<p.length;i++)g=Math.max(g,p[i]-c[i]);return g}
function singletonDP(blocks){
let min=sum(blocks.map(x=>Math.min(...x))),max=sum(blocks.map(x=>Math.max(...x)));
const dp=Array.from({length:14},()=>new Int32Array(max+1).fill(-1));for(const a of dp)a[0]=0;
let hi=0;
for(const block of blocks){const b=sorted(block),choices=[...new Set(b)].map(s=>{const c=b.slice();c.splice(c.indexOf(s),1);const p=prefix(c);return [s,Array.from({length:14},(_,k)=>p[2*k+1])];});
for(let k=0;k<14;k++){const old=dp[k],next=new Int32Array(max+1).fill(-1);for(let i=0;i<=hi;i++)if(old[i]>=0)for(const [s,v] of choices)next[i+s]=Math.max(next[i+s],old[i]+v[k]);dp[k]=next;}
hi+=b[0];
}
return {min,max,dp,attainable:dp[13].filter(x=>x>=0).length};
}
function fixed(c,d,canonical){
const choices=canonical?[14]:Array.from({length:29},(_,i)=>i);
for(const i of choices){const s=c[i];if(s>d.max||d.dp[13][s]<0)continue;let pairs;
if(canonical)pairs=Array.from({length:14},(_,j)=>c[j]+c[28-j]);
else {const a=c.filter((_,j)=>i!==j).sort((a,b)=>a-b);pairs=Array.from({length:14},(_,j)=>a[j]+a[27-j]);}
const p=prefix(sorted(pairs));if(p.every((x,k)=>x<=d.dp[k][s]))return true;
}
return false;
}
function target(lo,hi){
const ps=pages.filter(p=>p.page>=lo&&p.page<=hi);const whole=count(ps.flatMap(p=>p.indices)),local=ps.map(p=>count(p.indices));const chapters=ranges.map(([l,h])=>ps.filter(p=>p.page>=l&&p.page<=h)).filter(x=>x.length).map(x=>count(x.flatMap(p=>p.indices)));
const models=lo===27?{global:[whole],page:local}:{global:[whole],chapter:chapters,page:local};
const limits=Object.fromEntries(Object.entries(models).map(([k,b])=>[k,cap(b)]));const triples=cap([whole],3),d=singletonDP(local),n=sum(whole);
const rows=tapes.map((t,di)=>{if(t.length<n)return null;const c=count(t.slice(0,n));const stats=Object.fromEntries(Object.keys(models).map(k=>[k,{pass:0,minGap:Infinity,minSingle:Infinity}]));let canonicalPage=0,fixedPage=0,tripleGlobal=0;let example=null;
for(let start=0;start<=t.length-n;start++){if(start){c[t[start-1]]--;c[t[start+n-1]]++;}const p=prefix(sorted(c));for(const [k,lim] of Object.entries(limits)){const g=gap(p,lim),s=stats[k];s.minGap=Math.min(s.minGap,g);s.minSingle=Math.min(s.minSingle,p[0]-lim[0]);if(g<=0)s.pass++}
if(gap(p,triples)<=0)tripleGlobal++;
if(gap(p,limits.page)<=0){if(fixed(c,d,true))canonicalPage++;if(fixed(c,d,false)){fixedPage++;if(example===null)example={start,counts:[...c]};}}}
return {donor:di,windows:t.length-n+1,stats,canonicalPage,fixedPage,tripleGlobal,example};}).filter(x=>x!==null);
return {lo,hi,n,blockSizes:local.map(sum),limits,triples,singleton:{min:d.min,max:d.max,attainable:d.attainable},rows};
}
let seed=0x35ab2026;const random=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n;};
function shuffle(x){const a=[...x];for(let i=a.length-1;i>0;i--){const j=random(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const symbols=Array.from({length:29},(_,i)=>i),canon=[14,...Array.from({length:14},(_,i)=>[i,28-i]).flat()];
function plant(t,canonical,blocksN){
const order=shuffle(t.map((_,i)=>i)),a=canonical?canon:shuffle(symbols),emitted=[],restored=Array(t.length),n=Math.ceil(t.length/blocksN);
for(let start=0;start<t.length;start+=n){const b=shuffle(symbols),part=[];for(let i=start;i<Math.min(start+n,t.length);i++){const x=t[order[i]],j=a.indexOf(x),flip=j===0?0:random(2),mapped=j===0?0:1+2*Math.floor((j-1)/2)+((j-1)%2^flip),y=b[mapped];part.push(y);const v=b.indexOf(y),back=v===0?0:1+2*Math.floor((v-1)/2)+((v-1)%2^flip);restored[order[i]]=a[back];}emitted.push(count(part));}
assert(t.every((x,i)=>x===restored[i]),"plant inversion");const c=count(t),p=prefix(sorted(c)),d=singletonDP(emitted);assert(gap(p,cap(emitted))<=0,"plant capacity");assert(fixed(c,d,canonical),"plant fixed partition");return {n:t.length,canonical,blocks:emitted.length,pass:true};
}
const native=B.sections.map(x=>[...x.source_text].map(y=>B.runes.indexOf(y)).filter(y=>y>=0));const controls=[];for(const t of native)for(const canonical of [true,false])for(const k of [1,6])controls.push(plant(t,canonical,k));
return {donorLengths:tapes.map(x=>x.length),nativeLengths:native.map(x=>x.length),controls,targets:[target(27,32),target(0,55)]};
}
const input=paths.map(p=>fs.readFileSync(p,'utf8'));const result=study(JSON.parse(input[0]),JSON.parse(input[1]),input.slice(2));const crypto=require('node:crypto');result.blobs=Object.fromEntries(paths.map((p,i)=>{const b=Buffer.from(input[i]);return [p,crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex')]}));console.log(JSON.stringify(result,null,2));
