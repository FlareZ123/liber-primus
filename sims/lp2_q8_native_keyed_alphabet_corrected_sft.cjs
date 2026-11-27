'use strict';
// Corrected-terminal native-word and red-rubric keyed common alphabet bank;
// arbitrary primitive period eight and independent word starts.
// No p55 or carry information enters candidate generation or fit.
function run(lex,fixture,native){
const S="0123456789abcdefghijklmnopqrs", A=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"], mod=x=>(x+29)%29;
const D=new Set(), by=Array.from({length:60},()=>[]);
function variants(s){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function rec(i,w){if(i===s.length){D.add(w);return;}for(let n=1;n<=3&&i+n<=s.length;n++){const t=s.slice(i,i+n),v=n===3?(t==="ING"?21:-1):A.indexOf(t);if(v>=0)rec(i+n,w+S[v]);}}rec(0,"");}
for(const m of lex.matchAll(/^([a-z]+)\s+(\d+)$/gm))variants(m[1]);
for(const w of D)if(w.length<by.length)by[w.length].push([...w].map(x=>S.indexOf(x)));
if(D.size!==38910)throw Error("dictionary "+D.size);
const raw=fixture.p54.body_groups.slice(0,-1),held=[fixture.p54.body_groups.at(-1)+fixture.p55.groups[0],...fixture.p55.groups.slice(1)];
const nums=w=>[...w].map(c=>S.indexOf(c)), enc=w=>w.map(c=>S[c]).join("");
const I=Array.from({length:29},(_,i)=>i), alph=[], labels=[], seen=new Set();
const pool=[...new Set(native.sections.flatMap(sec=>(sec.source_text.match(/[\u16a0-\u16ff]+/g)||[]).map(w=>[...w].map(c=>S[native.runes.indexOf(c)]).join(""))))].sort();
if(pool.length!==272)throw Error("native pool "+pool.length);
function add(p,label){let scale=1;while(scale*p[1]%29!==1)scale++;let id=p.map(x=>x*scale%29).join(",");if(seen.has(id))return;seen.add(id);alph.push(p);labels.push(label);}
for(const w of [...pool,"jlnr2eaj","ojlnr2eaj"]){for(const convention of ["rotate","F-first"]){let order=[...new Set([...(convention==="F-first"?[0]:[]),...nums(w),...I])];let z=order.indexOf(0);let p=I.map(x=>mod(order.indexOf(x)-z));add(p,{keyword:w,convention});}}
function norm(k){let min=Infinity;for(let j=0;j<8;j++){let x=0;for(let t=0;t<8;t++)x=x*29+k[(j+t)%8];if(x<min)min=x;}return min;}
function unpack(x){let k=Array(8);for(let j=7;j>=0;j--){k[j]=x%29;x=Math.floor(x/29);}return k;}
const primitive=k=>k.slice(0,4).some((x,i)=>x!==k[i+4]);
function encrypt(w,p,k,j){const inv=I.map(x=>p.indexOf(x));return w.map(x=>{if(!x)return 0;const y=inv[(p[x]+k[j])%29];j=(j+1)%8;return y;});}
function decode(c,p,k){const inv=I.map(x=>p.indexOf(x)),out=new Set();function walk(i,j,w){if(i===c.length){if(D.has(w))out.add(w);return;}if(c[i]===0)walk(i+1,j,w+"0");const x=inv[mod(p[c[i]]-k[j])];if(x)walk(i+1,(j+1)%8,w+S[x]);}for(let j=0;j<8;j++)walk(0,j,"");return out;}
function recover(C){const anchors=C.map((c,i)=>({c,i})).filter(({c})=>c.length>=8&&c.every(x=>x!==0));if(anchors.length<4)throw Error("too few full-key anchors");const threshold=anchors.length-3;let maxVotes=0,nCandidates=0,nFits=0,bestSupport=-1,keysExamined=0;const fits=[];
for(const p of alph){const counts=new Map();for(const {c} of anchors){const unique=new Set();for(const w of by[c.length]){if(w.includes(0))continue;const k=Array.from({length:8},(_,i)=>mod(p[c[i]]-p[w[i]]));if(!primitive(k))continue;if(c.slice(8).some((x,i)=>mod(p[x]-p[w[i+8]])!==k[i]))continue;unique.add(norm(k));}keysExamined+=unique.size;for(const k of unique)counts.set(k,(counts.get(k)||0)+1);}
for(const [id,v] of counts){maxVotes=Math.max(maxVotes,v);if(v<threshold)continue;nCandidates++;const k=unpack(id);let support=0;for(const c of C)if(decode(c,p,k).size)support++;bestSupport=Math.max(bestSupport,support);if(support>=C.length-3){nFits++;fits.push({p,k,support,v});}}}
return {anchors:anchors.map(x=>x.i),threshold,alphabets:alph.length,keysExamined,maxVotes,nCandidates,bestSupport,nFits,fits};}
let seed=0x5e21cafe;function rnd(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n;}
function plant(index){const p=alph[index],k=Array.from({length:8},()=>rnd(29));if(!primitive(k))throw Error("period");const T=[],C=[],target=raw.map((w,i)=>w.length>=8&&!w.includes("0")?i:-1).filter(i=>i>=0),omit=new Set(target.slice(0,3));
for(let i=0;i<raw.length;i++){const n=raw[i].length;let w,c;for(let q=0;q<100000;q++){w=omit.has(i)?Array.from({length:n},()=>1+rnd(28)):by[n][rnd(by[n].length)];c=encrypt(w,p,k,rnd(8));if(target.includes(i)&&c.includes(0))continue;if(!target.includes(i)&&n>=8&&!c.includes(0))continue;if(omit.has(i)&&decode(c,p,k).size)continue;break;}T.push(enc(w));C.push(c);}
const H=held.map(w=>{let t=by[w.length][rnd(by[w.length].length)];return {truth:enc(t),cipher:encrypt(t,p,k,rnd(8))};});
const R=recover(C);const trueKey=R.fits.find(f=>f.p.every((x,i)=>x===p[i])&&norm(f.k)===norm(k));return {index,k,omit:[...omit],...R,exact:!!trueKey,heldCorrect:trueKey?H.filter(h=>decode(h.cipher,trueKey.p,trueKey.k).has(h.truth)).length:0,trainTruth:T.filter((w,i)=>decode(C[i],p,k).has(w)).length};}
const controls=[plant(17),plant(alph.length-2)];if(controls.some(x=>!x.exact||x.heldCorrect!==17||x.trainTruth!==44))throw Error(JSON.stringify(controls));
const original=recover(raw.map(nums));
if(original.nFits)for(const f of original.fits){f.training=raw.map(w=>[...decode(nums(w),f.p,f.k)]);f.holdout=held.map(w=>[...decode(nums(w),f.p,f.k)]);}
return {dictionary:D.size,sourceWords:pool.length,alphabetBank:alph.length,controls:controls.map(c=>({...c,source:labels[c.index]})),original};}
if(typeof module!=="undefined")module.exports=run;
if(typeof require!=="undefined"&&require.main===module){const fs=require("fs");console.log(JSON.stringify(run(fs.readFileSync("resources/control/english_wordfreq_textblob.txt","utf8"),JSON.parse(fs.readFileSync("resources/liber-primus/lp2-page-groups-54-55-derived.json","utf8")),JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8"))),null,2));}
