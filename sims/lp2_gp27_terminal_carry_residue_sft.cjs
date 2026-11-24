'use strict';
/** Exact bounded GP27 terminal carry recovery by dictionary residue classes. Agent1. */
const fs=require('node:fs'),path=require('node:path');
const analyze=(C,raw,dict,N,bits=40,filter="all")=>{
const check=(x,m)=>{if(!x)throw Error(m)};
const gp=new Map(C.runes.map((r,i)=>[r,i]));
const words=[];let w=[];for(const c of raw.split("%").slice(0,55).join("%")){if(gp.has(c))w.push(gp.get(c));else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&w.length){words.push(w);w=[]}}if(w.length)words.push(w);
check(words.length===2896&&words.flat().length===12956,"word counts");
check(words.flat().join(",")===C.pages.filter(p=>p.page<56).flatMap(p=>p.indices).join(","),"original indices");
const lex=Array.from({length:15},()=>new Set);
const alphabet=Array.from({length:29},(_,i)=>i).filter(i=>i!==12&&i!==22);
const add=a=>{if(a.length&&a.length<=14&&a.every(x=>alphabet.includes(x)))lex[a.length].add(a.reduce((v,x)=>27n*v+BigInt(alphabet.indexOf(x)),0n))};
const spell=C.translit.map((x,i)=>[x,i]).filter(x=>alphabet.includes(x[1]));spell.push(["ING",21],["IO",27]);
for(const line of dict.split("\n")){const m=/^([a-z]+)\s+\d+\s*$/.exec(line);if(!m)continue;const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");const walk=(p,a)=>{if(p===s.length){add(a);return}if(a.length===14)return;for(const [t,i] of spell)if(s.startsWith(t,p))walk(p+t.length,a.concat(i))};walk(0,[])}
for(const s of N.sections)for(const w of s.source_text.match(/[\u16A0-\u16FF]+/gu)||[])add([...w].map(x=>gp.get(x)));
const choose=(n,k)=>{if(k<0||k>n)return 0n;let x=1n;for(let i=1;i<=k;i++)x=x*BigInt(n+1-i)/BigInt(i);return x};
const rank=(c,p,cyc)=>cyc?(c-p+29)%29-1:c-(c>p?1:0);
const pack=(w,prev,mode,cyc,order)=>{
let a=w[0],A=29n,b=0n,d=0n,e=0,t=0;
if(mode==="gap"&&prev!==null){const gap=w[0]===prev;a=gap?0:rank(w[0],prev,cyc);A=gap?1n:28n}
for(let j=1;j<w.length;j++){if(w[j]===w[j-1])b+=choose(j-1,++e);else{d=28n*d+BigInt(rank(w[j],w[j-1],cyc));t++}}
const f={A:[BigInt(a),A],B:[b,choose(w.length-1,e)],D:[d,28n**BigInt(t)]};let r=0n,M=1n;for(const k of order){r=r*f[k][1]+f[k][0];M*=f[k][1]}
return {M,r,L:w.length,P:27n**BigInt(w.length)};
};
const gcd=(a,b)=>{while(b){[a,b]=[b,a%b]}return a};
const mod=(x,m)=>((x%m)+m)%m;
const inv=(a,m)=>{if(m===1n)return 0n;let x=0n,y=1n,b=m;a=mod(a,m);while(a){const q=b/a;[b,a]=[a,b%a];[x,y]=[y,x-q*y]}check(b===1n,"inverse");return mod(x,m)};
const lower=(a,x)=>{let l=0,h=a.length;while(l<h){let m=(l+h)>>1;if(a[m]<x)l=m+1;else h=m}return l};
/** Exact residue-class search over all terminal states 0 <= T <= max. Rows are in reverse order. */
function search(rows,max,onHit=null){
let d=1n,step=1n;
const levels=rows.map(({M,r,L,P})=>{
const k=M*d,g=gcd(k,P),m=P/g,iv=inv(k/g,m),groups=new Map;
for(const p of lex[L]){const key=p%g,v=mod(iv*(p-key)/g,m);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(v)}
for(const a of groups.values())a.sort((a,b)=>a<b?-1:a>b?1:0);
const level={M,r,L,P,g,m,iv,d,step,groups};d=k*m/P;step*=m;return level;
});
const counts=Array(rows.length).fill(0n),classes=Array(rows.length).fill(0),hits=[];
function direct(i,t,c){
for(;i<rows.length;i++){const {M,r,P,L}=rows[i],v=M*c+r;if(!lex[L].has(v%P))return;counts[i]++;classes[i]++;c=v/P}
if(onHit)onHit(t,c);else hits.push(t.toString());
}
function walk(i,t,c,U){
if(i===levels.length){for(let u=0n;u<=U;u++){if(onHit)onHit(t+step*u,c+d*u);else hits.push((t+step*u).toString())}return}
if(U===0n){direct(i,t,c);return}
const {M,r,P,g,m,iv,d,step,groups}=levels[i],b=M*c+r,key=b%g,a=groups.get(key);
if(!a)return;
const offset=mod(iv*(b-key)/g,m),end=U<m?U:m-1n;
function visit(lo,hi){
for(let j=lower(a,lo);j<a.length&&a[j]<=hi;j++){
const u=mod(a[j]-offset,m);check(u<=U,"range");
const V=(U-u)/m,newT=t+step*u,newC=(M*(c+d*u)+r)/P;
counts[i]+=V+1n;classes[i]++;
walk(i+1,newT,newC,V);
}}
const stop=offset+end;
if(stop<m)visit(offset,stop);else{visit(offset,m-1n);visit(0n,stop-m)}
}
walk(0,0n,0n,max);
return {counts:counts.map(x=>x.toString()),classes,hits};
}
const seen=new Map,results=[];
for(const mode of ["word","gap"])for(const cyc of [false,true])for(const order of ["ABD","ADB","BAD","BDA","DAB","DBA"]){
if(filter!=="all"&&filter!==mode+":"+Number(cyc))continue;
const rows=words.slice(-12).map((w,i)=>pack(w,words[words.length-13+i].at(-1),mode,cyc,order)).reverse();
const key=rows.slice(0,4).map(x=>`${x.M}/${x.r}`).join(",");
if(!seen.has(key))seen.set(key,[]);
seen.get(key).push({mode,cyc,order,rows,tailCounts:Array(8).fill(0),candidates:[]});
}
const show=(v,L)=>{let out=[];for(let i=0;i<L;i++){out.unshift(C.translit[alphabet[Number(v%27n)]]);v/=27n}return out.join("")};
for(const variants of seen.values()){
const prefix=variants[0].rows.slice(0,4);
const summary=search(prefix,(1n<<BigInt(bits))-1n,(T,S)=>{
for(const v of variants){let s=S;for(let i=4;i<v.rows.length;i++){const {M,r,P,L}=v.rows[i],z=M*s+r,p=z%P;s=z/P;if(!lex[L].has(p))break;v.tailCounts[i-4]++;if(i===4){let t=T,a=[];for(let j=0;j<5;j++){const q=v.rows[j],z=q.M*t+q.r;a.unshift(show(z%q.P,q.L));t=z/q.P}v.candidates.push({terminal:T.toString(),fiveWords:a.join(" ")})}}}
});
results.push({prefixCounts:summary.counts,classes:summary.classes,variants:variants.map(({rows,...v})=>v)});
}
const rows=words.slice(-5).map((w,i)=>pack(w,words[words.length-6+i].at(-1),"word",false,"ABD")).reverse();
const target=(1n<<31n)+3301n;let state=target;const plant=[];
for(const row of rows){const p=[...lex[row.L]][Math.min(10,lex[row.L].size-1)];const s=(state*row.M-p+row.P-1n)/row.P,r=s*row.P+p-state*row.M;check(r>=0n&&r<row.M,"plant range");plant.push({...row,r});state=s}
const positive=search(plant,(1n<<32n)-1n);
check(positive.hits.includes(target.toString()),"planted terminal not found");
return {bits,lex:lex.map(s=>s.size),results,positive:{target:target.toString(),hits:positive.hits.length,counts:positive.counts}};
};
const root=path.join(__dirname,'..','resources'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
console.log(JSON.stringify(analyze(JSON.parse(read('liber-primus/lp2-corpus.json')),read('lp2-transcription.txt'),read('control/english_wordfreq_textblob.txt'),JSON.parse(read('external/relikd-solved-gp29-native-v1.json')),Number(process.argv[2]||40),process.argv[3]||'all'),null,2));
