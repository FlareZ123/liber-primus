"use strict";
const fs=require("node:fs"),path=require("node:path");
const INPUTS=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt"
];
function experiment(raw){
const gp=JSON.parse(raw[0]),M=29,mod=x=>(x%M+M)%M;
const K=[],sieve=new Uint8Array(100000);for(let i=2;i<sieve.length;i++)if(!sieve[i]){K.push((i-1)%29);for(let j=i*i;j<sieve.length;j+=i)sieve[j]=1}
const C=gp.pages.find(p=>p.page===54).indices.concat(gp.pages.find(p=>p.page===55).indices),fit=232;
if(C.length!==308)throw Error("source length");
const tokens=gp.translit.map((t,i)=>({t,i})).filter(({i})=>i!==12&&i!==22).sort((a,b)=>b.t.length-a.t.length);
function norm(s){return s.toUpperCase().replace(/[’‘]/g,"'").replace(/[^A-Z .']/g," ").replace(/(^|[^A-Z])'|'(?![A-Z])/g,"$1 ").replace(/\s+/g," ").replace(/ +\./g,".").replace(/\.+/g,".").replace(/\.(?=[A-Z])/g,". ").replace(/(^| )\./g,"$1").replace(/\s+/g," ").trim()}
function run(kind){
const latin=kind==="latin29",space=latin?26:12,period=latin?27:22,apost=latin?28:-1,hold=!latin;
const alphabet=latin?[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ .'"]:gp.translit.map((t,i)=>i===space?" ":i===period?".":t);
const letter=x=>x>=0&&x!==space&&x!==period&&x!==apost;
const grammar=(a,b)=>a<0||letter(a)||(a===space||a===apost)&&letter(b)||a===period&&b===space;
function encode(s){let out=[];for(let w of norm(s).match(/[A-Z']+|[ .]/g)||[]){if(w===" "||w==="."){out.push(w===" "?space:period);continue}if(latin){out.push(...[...w].map(c=>alphabet.indexOf(c)));continue}w=w.replace(/'/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");while(w){let t=tokens.find(t=>w.startsWith(t.t));if(!t)throw Error(w);out.push(t.i);w=w.slice(t.t.length)}}return out.filter(x=>x>=0)}
const u=new Float64Array(M),b=new Float64Array(M*M),t=new Float64Array(M*M*M),bc=new Float64Array(M),tc=new Float64Array(M*M);let count=0;
for(const s of raw.slice(1,3).map(encode))for(let i=0;i<s.length;i++){u[s[i]]++;count++;if(i>0){b[s[i-1]*M+s[i]]++;bc[s[i-1]]++}if(i>1){t[(s[i-2]*M+s[i-1])*M+s[i]]++;tc[s[i-2]*M+s[i-1]]++}}
const U=Float64Array.from(u,x=>Math.log((x+1)/(count+M))),B=Float64Array.from(b,(x,i)=>Math.log((x+20*Math.exp(U[i%M]))/(bc[Math.floor(i/M)]+20))),T=Float64Array.from(t,(x,i)=>Math.log((x+35*Math.exp(B[i%(M*M)]))/(tc[Math.floor(i/M)]+35)));
function lp(a,b,p){return b<0?U[p]:a<0?B[b*M+p]:T[(a*M+b)*M+p]}
function transitions(c,prev,j,sign,emit){if(hold&&c===0)emit(0,j);let p=mod(c-sign*K[j]);if(!hold||p!==0)emit(p,j+1);if(prev<0)return;const r=K[j],q=mod(prev-sign*r);if(hold&&q===0)return;let k=j+1;while(K[k]===r){if(c===prev)emit(q,k+1);k++}if(c===mod(q+sign*K[k]))emit(q,k+1)}
function solve(cipher,sign,initial,previous=-1){
let keys=initial.map(x=>x.key),scores=initial.map(x=>x.score),history=[],maxStates=keys.length;
for(let i=0;i<cipher.length;i++){
const c=cipher[i],prev=i?cipher[i-1]:previous,map=new Map(),nk=[],ns=[],parents=[];
for(let k=0;k<keys.length;k++){const key=keys[k],j=Math.floor(key/900),a=Math.floor((key%900)/30)-1,b=key%30-1;
transitions(c,prev,j,sign,(p,end)=>{if(!grammar(b,p))return;let id=end*900+(b+1)*30+p+1,v=scores[k]+lp(a,b,p),z=map.get(id);if(z===undefined){map.set(id,nk.length);nk.push(id);ns.push(v);parents.push(k)}else if(v>ns[z]){ns[z]=v;parents[z]=k}})}
if(!nk.length)return {dead:i,maxStates};history.push({keys:Int32Array.from(nk),parents:Int32Array.from(parents)});keys=nk;scores=ns;maxStates=Math.max(maxStates,keys.length)
}
let best=0;for(let k=1;k<scores.length;k++)if(scores[k]>scores[best])best=k;
const end=keys[best],score=scores[best],plain=[],cursors=[];let k=best;
for(let i=history.length-1;i>=0;i--){const h=history[i],v=h.keys[k];plain.push(v%30-1);cursors.push(Math.floor(v/900));k=h.parents[k]}
const start=initial[k].key;plain.reverse();cursors.reverse();let j=Math.floor(start/900);
for(let i=0;i<plain.length;i++){let ok=false;transitions(cipher[i],i?cipher[i-1]:previous,j,sign,(p,n)=>{if(p===plain[i]&&n===cursors[i])ok=true});if(!ok)throw Error("replay");j=cursors[i]}
return {end,score,plain,start,cursor:Math.floor(end/900),maxStates,text:plain.map(p=>alphabet[p]).join("")}
}
const initial=Array.from({length:3302},(_,j)=>({key:j*900,score:0}));
function test(cipher,truth,origin,actualSign,name){const candidates=[1,-1].map(sign=>({sign,...solve(cipher.slice(0,fit),sign,initial)})).filter(x=>x.plain).sort((a,b)=>b.score-a.score);if(!candidates.length)return {name,dead:true};
const a=candidates[0],h=solve(cipher.slice(fit),a.sign,[{key:a.end,score:0}],cipher[fit-1]);return {name,origin,actualSign,chosenSign:a.sign,chosenOrigin:Math.floor(a.start/900),fitPer:a.score/fit,fitCorrect:truth?a.plain.filter((p,i)=>p===truth[i]).length:null,fitText:a.text,fitStates:a.maxStates,holdDead:h.dead??null,holdPer:h.plain?h.score/(cipher.length-fit):null,holdCorrect:truth&&h.plain?h.plain.filter((p,i)=>p===truth[fit+i]).length:null,holdText:h.text??null}}
const donor=encode(raw[3]),plants=[];for(let n=0;n<4;n++){let p=donor.slice(4000+n*7000,4000+n*7000+C.length),j=[0,1033,2051,3301][n],origin=j,sign=n%2?-1:1,c=[],skips=0;for(let i=0;i<p.length;i++){if(hold&&p[i]===0){c.push(0);continue}let v=mod(p[i]+sign*K[j]);if(n>0&&i&&v===c[i-1]&&i%5!==0){while(v===c[i-1]){j++;skips++;v=mod(p[i]+sign*K[j])}}c.push(v);j++}plants.push({...test(c,p,origin,sign,"plant"+n),skips})}
const powered=plants.filter(p=>p.chosenOrigin===p.origin&&p.chosenSign===p.actualSign&&p.fitCorrect===fit&&p.holdCorrect===C.length-fit).length>=3;
return {kind,alphabet,powered,plants,original:powered?test(C,null,null,null,"original"):null}
}
return {fit,hold:C.length-fit,variants:[run("latin29"),run("gp27-delimiters-fhold")]}
}
console.log(JSON.stringify(experiment(INPUTS.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
