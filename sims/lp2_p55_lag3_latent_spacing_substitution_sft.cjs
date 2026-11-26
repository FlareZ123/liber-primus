'use strict';
const fs=require('node:fs'),path=require('node:path');
const INPUTS=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt"];
function experiment(raw,settings={restarts:200,steps:12000,mode:"all"}){
const gp=JSON.parse(raw[0]),A=29, mod=x=>(x+A)%A, assert=(c,m)=>{if(!c)throw Error(m)},tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
function word(s){const w=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let out=[];for(let j=0;j<w.length;){const v=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));assert(v,w);out.push(v.i);j+=v.t.length;}return out;}
function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);let out=[];for(const w of t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[])out.push(...word(w));return out;}
const donors=raw.slice(1,4).map(native), train=donors.map(d=>d.slice(0,-16000));let counts=Array.from({length:4},(_,i)=>new Uint32Array(A**(i+1)));
for(const d of train){for(let i=0;i<d.length;i++){let n=0,k=1;for(let j=i;j>=Math.max(0,i-3);j--){n+=d[j]*k;counts[i-j][n]++;k*=A;}}}
let models=[];for(let o=1;o<=4;o++){let cnt=counts[o-1],m=new Float64Array(cnt.length);for(let p=0;p<cnt.length;p+=A){let n=0;for(let q=0;q<A;q++)n+=cnt[p+q];for(let q=0;q<A;q++){let b=o===1?1/A:Math.exp(models[o-2][(p+q)%(A**(o-1))]);m[p+q]=Math.log((cnt[p+q]+(o===1?20:12)*b)/(n+(o===1?20:12)));}}models.push(m);}
const m4=models[3];
let lex=new Map(),total=0;for(const line of raw[4].split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(!m)continue;if(m[1].length===1&&!"ai".includes(m[1]))continue;let w=word(m[1]),k=w.map(x=>String.fromCharCode(65+x)).join("");lex.set(k,(lex.get(k)||0)+Number(m[2]));total+=Number(m[2]);}let maxWord=0;for(const [k,v] of lex){lex.set(k,Math.log(v/total));maxWord=Math.max(maxWord,k.length)}
function segment(p){let s=p.map(x=>String.fromCharCode(65+x)).join(""),n=s.length,dp=new Float64Array(n+1).fill(-Infinity),prev=new Int16Array(n+1).fill(-1);dp[0]=0;for(let i=0;i<n;i++){for(let j=i+1;j<=Math.min(n,i+maxWord);j++){let k=s.slice(i,j),score=lex.get(k);if(score===undefined)continue;if(dp[i]+score>dp[j]){dp[j]=dp[i]+score;prev[j]=i;}}if(dp[i]-12>dp[i+1]){dp[i+1]=dp[i]-12;prev[i+1]=i;}}let ws=[];for(let i=n;i>0;){let j=prev[i];assert(j>=0,"dp");let k=s.slice(j,i);ws.push(p.slice(j,i).map(v=>gp.translit[v]).join("")+(lex.has(k)?"":"?"));i=j;}return {score:dp[n],text:ws.reverse().join(" ")};}
let seed=0x3301a55;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}function rand(){return rng()/4294967296}
function perm(){let a=Array.from({length:A},(_,i)=>i);for(let i=A-1;i;i--){let j=rng()%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
function ioc(d){let a=new Uint32Array(A);for(const x of d)a[x]++;return a.reduce((s,x)=>s+x*(x-1),0)/(d.length*(d.length-1))}
function score(p){let s=0;for(let i=0;i<p.length;i++){let k=0;for(let j=Math.max(0,i-3);j<=i;j++)k=k*A+p[j];s+=models[Math.min(3,i)][k];}return s;}
function solve(d,restarts,steps){const n=d.length,used=[...new Set(d)].sort((a,b)=>a-b),pos=Array.from({length:A},(_,i)=>{let l=[];for(let j=0;j<n;j++)if(d[j]===i)l.push(j);return l;}),aff=Array.from({length:A*A},()=>null);
for(let a=0;a<A;a++)for(let b=a+1;b<A;b++){let set=new Set();for(let p of [...pos[a],...pos[b]])for(let j=p;j<Math.min(n,p+4);j++)set.add(j);aff[a*A+b]=[...set].sort((a,b)=>a-b);aff[b*A+a]=aff[a*A+b];}
const winners=new Map(),top=24;let best=-Infinity;let bestK=null;
const temps=Float64Array.from({length:steps},(_,i)=>7*Math.pow(.025/7,i/Math.max(1,steps-1)));
for(let re=0;re<restarts;re++){let K=perm();if(re%5===4&&bestK){K=bestK.slice();for(let z=0;z<4;z++){let a=used[rng()%used.length],b=rng()%A;[K[a],K[b]]=[K[b],K[a]];}}
let P=Uint8Array.from(d,x=>K[x]),S=Float64Array.from({length:n},(_,i)=>term(i)),s=S.reduce((a,b)=>a+b,0),local=s,localK=K.slice(),next=new Float64Array(n);
function term(i){if(i>=3)return m4[((P[i-3]*A+P[i-2])*A+P[i-1])*A+P[i]];let k=0;for(let j=0;j<=i;j++)k=k*A+P[j];return models[i][k];}
for(let st=0;st<steps;st++){let a=used[rng()%used.length],b=rng()%A;if(a===b)continue;let ap=K[a],bp=K[b];for(let p of pos[a])P[p]=bp;for(let p of pos[b])P[p]=ap;let list=aff[a*A+b],delta=0;for(let j of list){let v=term(j);next[j]=v;delta+=v-S[j];}if(delta>=0||rand()<Math.exp(delta/temps[st])){K[a]=bp;K[b]=ap;s+=delta;for(let j of list)S[j]=next[j];if(s>local){local=s;localK=K.slice();}}else{for(let p of pos[a])P[p]=ap;for(let p of pos[b])P[p]=bp;}}
let p=d.map(x=>localK[x]),key=p.join(",");if(!winners.has(key)){winners.set(key,{K:localK,p,s:score(p)});if(winners.size>top){let w=[...winners].sort((a,b)=>b[1].s-a[1].s);winners.delete(w.at(-1)[0]);}}if(local>best){best=local;bestK=localK.slice();}}
let candidates=[...winners.values()].map(x=>({...x,seg:segment(x.p)})).sort((a,b)=>(b.s+b.seg.score)-(a.s+a.seg.score));return {best:candidates[0],top:candidates.slice(0,5).map(x=>({s:x.s,seg:x.seg,K:x.K,p:x.p})),restarts,steps};}
const orig=gp.pages.find(p=>p.page===55).indices, d=orig.slice(3).map((v,i)=>mod(v-orig[i])),target=ioc(d),N=d.length,D=new Set(d).size;
const controls=[];
for(let k=0;k<3;k++){let donor=donors[k],start=donor.length-16000;while(start<donor.length-N){let p=donor.slice(start,start+N);if(new Set(p).size===D&&Math.abs(ioc(p)-target)<.006){let key=perm(),c=p.map(x=>key[x]);let C=[2,3,4];for(let i=0;i<c.length;i++)C.push(mod(C[i]+c[i]));let check=C.slice(3).map((v,i)=>mod(v-C[i]));assert(check.join()===c.join(),"feedback");if(settings.mode!=="original"){let result=solve(check,settings.restarts,settings.steps);controls.push({donor:k,start,truth:p,truthSeg:segment(p),truthScore:score(p),ioc:ioc(p),correct:result.best.p.filter((x,i)=>x===p[i]).length,...result})}break;}start++;}}
let original=null;if(settings.mode!=="controls"){original=solve(d,settings.restarts,settings.steps);for(const x of original.top){let C=orig.slice(0,3),inv=new Array(A);for(let i=0;i<A;i++)inv[x.K[i]]=i;for(let p of x.p)C.push(mod(C[C.length-3]+inv[p]));assert(C.join()===orig.join(),"original replay");}}
return {settings,N,D,target,controls,original};
}
if(require.main===module)console.log(JSON.stringify(experiment(INPUTS.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
module.exports={experiment,INPUTS};
