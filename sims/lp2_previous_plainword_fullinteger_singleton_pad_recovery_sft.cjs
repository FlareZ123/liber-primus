'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
function research(trans,native,lex,gib) {
const gp=JSON.parse(native),aliases=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
const ix=new Map(gp.runes.map((x,i)=>[x,i])),ai=new Map(aliases.map((x,i)=>[x,i]));const asWords=s=>(s.match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>ix.get(x)));
function norm(s){return (s.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA").match(/TH|NG|EO|OE|AE|IA|EA|[A-Z]/g)||[]).map(x=>ai.get(x))}
const dic=lex.split("\n").flatMap(l=>{const m=l.match(/^([a-z]+) \d+$/);return m?[norm(m[1])]:[]});const gw=gib.match(/[A-Za-z]+/g).map(norm),secs=gp.sections.map(s=>asWords(s.source_text));
const m=29**4,mod=(x,m)=>((x%m)+m)%m,num=a=>a.reduce((v,x)=>v*29+x,0),bn=a=>a.reduce((v,x)=>v*29n+BigInt(x),0n),pop=x=>{let n=0;while(x){x&=x-1n;n++}return n};
const fmt=(x,n)=>{let a=Array(n);for(let j=n-1;j>=0;j--){a[j]=Number(x%29n);x/=29n}return a};
function pool(words){let q=new Map();for(const w of words){if(w.length<4||w.some(x=>x===undefined))continue;if(!q.has(w.length))q.set(w.length,new Set());q.get(w.length).add(bn(w));}return q}
function anchors(ws,p){let A=[];for(let i=1;i<ws.length;i++){if(ws[i-1].length!==1||ws[i].length<4)continue;const c=num(ws[i].slice(-4)),n=ws[i].length,s=p.get(n)||new Set();let k=new Set([...s].map(x=>mod(c-Number(x%BigInt(m)),m)));A.push({i,c,n,k,full:bn(ws[i]),prevC:ws[i-1][0]})}return A}
function masks(A){let a=new Map();for(let i=0;i<A.length;i++)for(const k of A[i].k)a.set(k,(a.get(k)||0n)|(1n<<BigInt(i)));let uniq=new Map();for(const [k,mask]of a)if(!uniq.has(mask))uniq.set(mask,k);return [...uniq].map(([mask,k])=>({mask,k,c:pop(mask)})).sort((a,b)=>b.c-a.c)}
// Each mask covers exactly the anchors consistent with its residue. Sorting by cardinality yields a rigorous branch upper bound.
function maxCover(A,q){const ms=masks(A),n=A.length;let best=0,solution=[];function go(start,mask,sel){const v=pop(mask);if(v>best){best=v;solution=sel;}if(sel.length===q||v===n)return;const remain=q-sel.length;for(let i=start;i<ms.length;i++){const a=ms[i];if(v+remain*a.c<=best)break;let u=mask|a.mask;if(u===mask)continue;go(i+1,u,[...sel,a.k]);if(best===n)return;}}go(0,0n,[]);return {n,max:best,pads:solution,uncovered:A.filter(a=>!solution.some(k=>a.k.has(k))).map(a=>a.i),uniqueMasks:ms.length,top:ms.slice(0,5).map(a=>a.c)}}
const pp=trans.split("%");pp.splice(50,0,"");const parse=(a,b)=>asWords(pp.slice(a,b+1).join("").replace(/[/\r\n]/g,""));
const p=pool([...dic,...gw,...secs.flat()]);const all=anchors(parse(0,55),p),ch=anchors(parse(15,22),p);
const widthPrivate=[...new Set(all.map(x=>x.n))].sort((a,b)=>a-b).map(n=>({width:n,...maxCover(all.filter(x=>x.n===n),3)}));
const original={all3:maxCover(all,3),all4:maxCover(all,4),chapter3:maxCover(ch,3),chapter4:maxCover(ch,4),chapter5:maxCover(ch,5),widthPrivate};
function plant(ws,seed){const pad=p=>(bn(p)**2n*BigInt(3301+seed)+1033n*BigInt(seed+1));let prev=[1,2],ct=[],rec=[];for(let i=0;i<ws.length;i++){const mod=29n**BigInt(ws[i].length);ct.push(fmt((bn(ws[i])+pad(prev))%mod,ws[i].length));prev=ws[i]}prev=[1,2];for(let i=0;i<ct.length;i++){let M=29n**BigInt(ct[i].length);let x=((bn(ct[i])-pad(prev))%M+M)%M;rec.push(fmt(x,ct[i].length));prev=rec.at(-1)}if(JSON.stringify(rec)!==JSON.stringify(ws))throw Error("plant replay");return {ct,pad}}
const target=secs[3],pTrain=pool([...dic,...gw,...secs.filter((_,i)=>i!==3).flat()]);let controls=[];
for(const seed of [1,17,53]){const {ct,pad}=plant(target,seed),A=anchors(ct,pTrain),training=A.slice(0,4),test=A.slice(4);const largest=training.reduce((x,y)=>x.n>=y.n?x:y);const M=29n**BigInt(largest.n);const fullsets=training.map(a=>{let M=29n**BigInt(a.n);return {n:a.n,ks:new Set([...(pTrain.get(a.n)||[])].map(x=>(a.full-x+M)%M))}});const candidates=[...fullsets.find(x=>x.n===largest.n).ks].filter(k=>fullsets.every(a=>a.ks.has(k%(29n**BigInt(a.n))))).sort((a,b)=>a<b?-1:a>b?1:0);if(!candidates.length)throw Error("no control pad");
let consensus=0;for(let n=1;n<=largest.n;n++){const M=29n**BigInt(n);if(candidates.every(k=>k%M===candidates[0]%M))consensus=n;else break;}
const expected=pad([24])%M;let correct=0,total=0,complete=0;
for(const a of test){const k=candidates[0],width=Math.min(a.n,consensus),mod=29n**BigInt(width);const pred=(a.full%mod-k%mod+mod)%mod,truth=bn(target[a.i])%mod;total+=width;if(pred===truth)correct+=width;if(a.n<=consensus&&pred===truth)complete++}
controls.push({seed,originalNativeRunes:target.flat().length,anchorTrainLengths:training.map(a=>a.n),anchorTestLengths:test.map(a=>a.n),candidates:candidates.map(String),expected:String(expected),consensusDigits:consensus,correct,total,completeHeldoutWords:complete,fullReplayed:target.flat().length});}
return {runeCount:parse(0,55).flat().length,wordCount:parse(0,55).length,original,controls};
}
const paths = [
  "resources/liber-primus/lp2-transcription.txt",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/english_wordfreq_textblob.txt",
  "resources/control/gibran_prophet_58585.txt"
];
const result = research(...paths.map(p=>fs.readFileSync(p,'utf8')));
assert.equal(result.runeCount,12956); assert.equal(result.wordCount,2896);
assert.equal(result.original.all3.max,12); assert.equal(result.original.all4.max,16);
assert.equal(result.original.chapter3.max,10); assert.equal(result.original.chapter4.max,12); assert.equal(result.original.chapter5.max,14);
assert.deepEqual(result.original.widthPrivate.map(x=>[x.width,x.n,x.max]),[[4,13,9],[5,9,8],[6,7,7],[7,6,6],[8,7,6],[9,3,3],[10,1,1],[11,1,1]]);
for (const c of result.controls) { assert(c.candidates.includes(c.expected)); assert.equal(c.candidates.length,2); assert.equal(c.consensusDigits,6); assert.equal(c.correct,17); assert.equal(c.total,17); assert.equal(c.completeHeldoutWords,2); }
console.log(JSON.stringify(result,null,2));
