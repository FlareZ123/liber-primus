"use strict";
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function experiment(raw,book){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[2]),rune=new Map(gp.runes.map((x,i)=>[x,i])),mod=x=>(x%29+29)%29,key=w=>String.fromCharCode(...w.map(x=>65+x)),shape=w=>key(w.map(x=>mod(x-w[0]))),sum=w=>w.reduce((s,x)=>s+gp.prime[x],0)%29;
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function enc(w,alt){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const p=[];for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!v)return null;p.push(v.i);j+=v.t.length}return p}
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).match(/[A-Za-z]+/g)||[]).map(w=>enc(w,true)).filter(w=>w&&w.length<=14)}
 const donors=raw.slice(4).map(native),vocab=new Map();
 function add(w,f){if(w&&w.length&&w.length<=24){let k=key(w);vocab.set(k,Math.max(f,vocab.get(k)||0))}}
 for(const line of raw[3].split(/\r?\n/)){const m=/^([A-Za-z]+)\s+(\d+)$/.exec(line);if(m)for(const alt of [true,false])add(enc(m[1],alt),+m[2])}
 for(const ws of donors)for(const w of ws.slice(0,Math.floor(ws.length*.8)))add(w,1);
 for(const s of gold.sections)for(const w of s.source_text.match(/[\u16a0-\u16ff]+/g)||[])add(Array.from(w,c=>rune.get(c)),1);
 for(let i=0;i<29;i++)add([i],1);


 const scores=new Map([...vocab].map(([w,f])=>[w,Math.log(f+1)])),lf=Math.log([...vocab.values()].reduce((s,f)=>s+f+1,0)),ws=w=>scores.has(w)?scores.get(w)-lf:-18-3.5*w.length;
 const cb=book.wordPrimeValues, d=(v,c)=>c.dk==="self"?v%c.M:cb[v%cb.length]%c.M, weight=(x,c)=>c.ch==="prime"?gp.prime[x]:x;
 function encode(words,c,sign){let sh=mod(sign*d(0,c)),C=[];for(const P of words){let z=P.map(p=>mod(p+sh));C.push(...z);const dv=sign*d((c.src==="cw"?z:P).reduce((s,x)=>s+weight(x,c),0),c);sh=mod(c.mode==="A1"?dv:sh+dv);}return C;}
 function solve(C,c,sign){
 const n=C.length,dp=new Float64Array((n+1)*29);dp.fill(-Infinity);dp[mod(sign*d(0,c))]=0;const prev=new Uint8Array(dp.length),len=new Uint8Array(dp.length);
 for(let i=0;i<n;i++)for(let sh=0;sh<29;sh++){
 const v=dp[i*29+sh];if(!Number.isFinite(v))continue;let P="",s=0;for(let l=1;l<=24&&i+l<=n;l++){let x=C[i+l-1],p=mod(x-sh);P+=String.fromCharCode(65+p);s+=weight(c.src==="cw"?x:p,c);let dv=sign*d(s,c),next=mod(c.mode==="A1"?dv:sh+dv),j=(i+l)*29+next,z=v+ws(P);if(z>dp[j]){dp[j]=z;prev[j]=sh;len[j]=l;}}
 }
 let sh=0;for(let j=1;j<29;j++)if(dp[n*29+j]>dp[n*29+sh])sh=j;let score=dp[n*29+sh]/n,i=n,words=[];
 while(i){let l=len[i*29+sh],p=prev[i*29+sh];if(!l)throw Error("trace");words.push(C.slice(i-l,i).map(x=>mod(x-p)));i-=l;sh=p;}words.reverse();
 if(encode(words,c,sign).join(",")!==C.join(","))throw Error("replay");
 return {score,words,oov:words.filter(w=>!scores.has(key(w))).length,plaintext:words.map(w=>w.map(p=>gp.translit[p]).join("")).join(" ")};
 }
 const ds=donors.map(d=>{let w=[],n=0;for(const p of d.slice(Math.floor(d.length*.9))){if(n+p.length>240)break;w.push(p);n+=p.length;}return w;});
 const bounds=w=>{let p=0;return new Set(w.map(x=>p+=x.length))};
 const results=[];
 for(const src of ["cw","dw"])for(const ch of ["prime","index"])for(const M of [29,28])for(const dk of ["self","cb"])for(const mode of ["A1","A2"]){
 if(ch==="prime"&&M===29&&dk==="self"&&mode==="A1")continue;
 const c={src,ch,M,dk,mode},controls=[];
 for(let donor=0;donor<3;donor++){const P=ds[donor],sign=donor===1?-1:1,C=encode(P,c,sign),a=[-1,1].map(s=>({sign:s,...solve(C,c,s)})).sort((a,b)=>b.score-a.score)[0],flat=P.flat(),pred=a.words.flat(),b=bounds(P),q=bounds(a.words);
 controls.push({donor,sign,selectedSign:a.sign,n:flat.length,correct:flat.filter((x,i)=>x===pred[i]).length,F1:2*[...b].filter(x=>q.has(x)).length/(b.size+q.size),score:a.score,truthOov:P.filter(w=>!scores.has(key(w))).length,plaintext:a.plaintext});
 }
 let original=null;if(controls.every(x=>x.correct/x.n>=.95&&x.F1>=.9&&x.sign===x.selectedSign)){
 let a=[-1,1].map(s=>({sign:s,...solve(gp.pages[0].indices,c,s)})).sort((a,b)=>b.score-a.score)[0];original={sign:a.sign,selectedScore:a.score,pages:[{page:0,...a},...Array.from({length:5},(_,i)=>({page:i+1,...solve(gp.pages[i+1].indices,c,a.sign)}))]};
 }
 results.push({cell:c,controls,original});
 }
 return {vocab:vocab.size,results};
}
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
console.log(JSON.stringify(experiment(paths.map(read),JSON.parse(read("resources/derived/dukotah-r37-lp1-map-runes.json"))),null,2));
