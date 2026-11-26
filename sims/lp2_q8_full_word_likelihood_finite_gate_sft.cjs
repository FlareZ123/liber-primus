/** Exact whole-word likelihood, matched-profile finite-sample gates for issue #3028. */
const fs = require('node:fs');
function experiment(raw,profile,native){
 const A="0123456789abcdefghijklmnopqrs", labels="F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" "),dict=new Map();
 for(const l of raw.split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+([0-9]+)$/);if(!m)continue;const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const words=[];function go(i,w){if(i===s.length){words.push(w);return}for(let j=0;j<29;j++){if(s.startsWith(labels[j],i))go(i+labels[j].length,w+A[j]);}if(s.startsWith("ING",i))go(i+3,w+A[21]);}go(0,"");for(const w of new Set(words))dict.set(w,(dict.get(w)||0)+Number(m[2])/new Set(words).size);}
 const by=Array.from({length:30},()=>[]),counts=Array(30).fill(0);for(const [w,v] of dict){by[w.length].push(w);counts[w.length]+=v;}by.forEach(a=>a.sort());const nfreq=new Map(),nt=Array(30).fill(0);for(const sec of native.sections){let w="";for(const c of sec.source_text+" "){const j=native.runes.indexOf(c);if(j>=0)w+=A[j];else if(w){nfreq.set(w,(nfreq.get(w)||0)+1);nt[w.length]++;w="";}}}
 const lengths=profile.p54.body_groups.slice(0,47).map(w=>w.length);if(lengths.length!==47||lengths.reduce((a,b)=>a+b)!==213||dict.size!==38910)throw Error("profile");
 function rng(seed){let x=seed>>>0;return n=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)%n;};}
 function perm(rand){const p=Array.from({length:29},(_,i)=>i);for(let i=28;i>1;i--){const j=1+rand(i);[p[i],p[j]]=[p[j],p[i]];}return p;}
 function maps(pi,k){const inv=[];pi.forEach((v,i)=>inv[v]=i);return k.map(a=>pi.map(x=>inv[(x+a)%29]));}
 function enc(w,M,j){let s="";for(const c of w){const p=A.indexOf(c);if(!p)s+="0";else{s+=A[M[j][p]];j=(j+1)%8;}}return s;}
 function inverse(M){return M.map(row=>{const a=[];row.forEach((v,i)=>a[v]=i);return a;});}
 function probs(w){const n=w.length,base=1/29**n,lex=dict.has(w),u=lex?1/by[n].length:0,f=lex?dict.get(w)/counts[n]:0,sol=nt[n]?(nfreq.get(w)||0)/nt[n]:f;return [(45/47)*u+(2/47)*base,0.7*f+0.25*sol+0.05*base];}
 function likelihood(c,I){const p=[0,0];function walk(i,j,w){if(i===c.length){const x=probs(w);p[0]+=x[0]/8;p[1]+=x[1]/8;return;}const a=A.indexOf(c[i]);if(a===0)walk(i+1,j,w+"0");const b=I[j][a];if(b!==0)walk(i+1,(j+1)%8,w+A[b]);}for(let j=0;j<8;j++)walk(0,j,"");return p;}
 function score(C,M){const I=inverse(M),s=[0,0];for(const c of C){const p=likelihood(c,I);for(let q=0;q<2;q++)s[q]+=Math.log(p[q]);}return s;}
 function canon(M){return M.map((_,j)=>M.slice(j).concat(M.slice(0,j)).map(a=>a.map(i=>A[i]).join("")).join("/")).sort()[0];}
 function plant(seed){const rand=rng(seed),ord=lengths.map((_,i)=>i).sort((a,b)=>lengths[b]-lengths[a]||a-b),P=lengths.map(n=>by[n][rand(by[n].length)]);for(const i of [ord[0],ord[ord.length-8]]){do{P[i]=Array.from({length:lengths[i]},()=>A[rand(29)]).join("");}while(dict.has(P[i]));}let carry;do{carry=Array.from({length:11},()=>A[rand(29)]).join("");}while(dict.has(carry)||by[11].some(w=>w.startsWith(carry.slice(0,10))));const held=profile.p55.groups.slice(1).map(w=>by[w.length][rand(by[w.length].length)]);const pi=perm(rand),k=Array.from({length:8},()=>rand(29));k[0]=1;k[3]=0;k[4]=2;const phases=P.map(()=>rand(8));return {P,pi,k,phases,carry,held};}
 const pairs=[[[1,1,2,1,2,2,2,1],[1,1,1,2,2,2,1,2]],[[1,0,0,0,2,0,0,1],[1,1,0,0,2,0,0,0]]],pairRows=[];
 for(let pair=0;pair<2;pair++)for(let side=0;side<2;side++)for(let i=0;i<128;i++){const seed=0x6a280000+pair*1024+side*256+i,z=plant(seed),m=maps(z.pi,pairs[pair][side]),r=maps(z.pi,pairs[pair][1-side]),C=z.P.map((w,j)=>enc(w,m,z.phases[j])),a=score(C,m),b=score(C,r);pairRows.push({pair,side,seed,delta:a.map((v,i)=>v-b[i])});}
 const oracle=[];for(let i=0;i<20;i++){const seed=0x6a288000+i,z=plant(seed),M=maps(z.pi,z.k),C=z.P.map((w,j)=>enc(w,M,z.phases[j])),a=score(C,M),tag=canon(M),greater=[0,0],ties=[0,0],best=[-Infinity,-Infinity],witness=[null,null],types={};let tested=0;
 function candidate(pi,k,type,move){const m=maps(pi,k);if(canon(m)===tag)return;const s=score(C,m);tested++;for(let q=0;q<2;q++){const d=s[q]-a[q];if(d>1e-9)greater[q]++;if(Math.abs(d)<=1e-9)ties[q]++;if(d>best[q]){best[q]=d;witness[q]={type,move};}}types[type]=(types[type]||0)+1;}
 for(let x=1;x<29;x++)for(let y=x+1;y<29;y++){const pi=z.pi.slice();[pi[x],pi[y]]=[pi[y],pi[x]];candidate(pi,z.k,"alphabet-swap",[x,y]);}
 for(const j of [1,2,5,6,7])for(let v=0;v<29;v++)if(v!==z.k[j]){const k=z.k.slice();k[j]=v;candidate(z.pi,k,"key-replacement",[j,v]);}
 const nullR=rng(seed^0x9e3779b9),nullM=Array.from({length:8},()=>perm(nullR)),nullC=z.P.map((w,j)=>enc(w,nullM,z.phases[j]));
 oracle.push({seed,tested,types,truth:a,greater,ties,best,witness,nullAtTruth:score(nullC,M),unseen:Array.from({length:29},(_,j)=>A[j]).filter(c=>!z.P.join("").includes(c)&&!C.join("").includes(c))});}
 const test=maps(perm(rng(42)),pairs[1][0]);let norm=[0,0];for(const x of A)for(const y of A){const p=likelihood(x+y,inverse(test));norm=norm.map((n,j)=>n+p[j]);}if(norm.some(n=>Math.abs(n-1)>1e-10))throw Error("normalization "+norm);
 return {schema:1,dict:dict.size,nativeWords:nt.reduce((a,b)=>a+b),lengths,norm,pairRows,oracle};
}
if(require.main===module) console.log(JSON.stringify(experiment(fs.readFileSync("resources/control/english_wordfreq_textblob.txt",'utf8'),JSON.parse(fs.readFileSync("resources/liber-primus/lp2-page-groups-54-55-derived.json",'utf8')),JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json",'utf8'))),null,2));
module.exports={experiment};
