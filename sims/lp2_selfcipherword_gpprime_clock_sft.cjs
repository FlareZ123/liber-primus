'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function experiment(raw){
 const g=JSON.parse(raw[0]),native=JSON.parse(raw[2]),idx=new Map(g.runes.map((x,i)=>[x,i])),alpha=new Map(g.translit.map((x,i)=>[x,i])),weights=g.prime,syms="0123456789ABCDEFGHIJKLMNOPQRS";
 const parse=t=>(t.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(x=>idx.get(x)));
 const C=parse(raw[1].replace(/[\s/%]/g,"")).slice(0,2896);if(C.flat().length!==12956||C.flat().join()!==g.pages.slice(0,56).flatMap(p=>p.indices).join())throw Error("source mismatch");
 const ps=[];for(let n=2;ps.length<6000;n++){let ok=true;for(const p of ps){if(p*p>n)break;if(n%p===0){ok=false;break}}if(ok)ps.push(n)}
 const mod=x=>(x%29+29)%29,sh=Int8Array.from([0,...ps.map(x=>mod(x-1))]),sum=w=>w.reduce((s,x)=>s+weights[x],0),key=w=>w.map(x=>syms[x]).join("");
 const dict=new Set();function variants(word,fn){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function walk(i,w){if(i===s.length){fn(w);return}for(let n=1;n<=3;n++){const t=s.slice(i,i+n),v=n===3?(t==="ING"?alpha.get("NG"):undefined):alpha.get(t);if(t.length===n&&v!==undefined)walk(i+n,[...w,v])}}walk(0,[])}
 for(const line of raw[3].split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m)variants(m[1],w=>dict.add(key(w)))}
 const controls=native.sections.map(s=>({name:s.name,words:parse(s.source_text)}));for(const s of controls)for(const w of s.words)dict.add(key(w));if(dict.size!==38938)throw Error("dictionary count "+dict.size);
 const singles=new Set(controls.flatMap(s=>s.words.filter(w=>w.length===1).map(key)));const nativeLex=w=>dict.has(key(w))&&(w.length!==1||singles.has(key(w)));
 const encode=(w,b=0)=>{const out=[];for(let S=2*w.length;S<=109*w.length;S++){let k=S+b;const c=w.map(x=>x===0?0:mod(x+sh[k++]));if(sum(c)===S)out.push(c)}return out};
 const decode=(c,b=0)=>{const out=[];function dfs(i,k,p){if(i===c.length){out.push(p);return}const x=mod(c[i]-sh[k]);if(c[i]===0)dfs(i+1,k,[...p,0]);if(x!==0)dfs(i+1,k+1,[...p,x])}dfs(0,sum(c)+b,[]);return out};
 const allC=C.map(c=>{const p=decode(c);for(const w of p){let k=sum(c);const replay=w.map(x=>x===0?0:mod(x+sh[k++]));if(key(replay)!==key(c))throw Error("replay")}return {n:p.length,lex:p.filter(nativeLex).map(key)}});
 const plant=controls.map(s=>{let none=0,one=0,many=0;for(const w of s.words){const c=encode(w);if(!c.length)none++;else if(c.length===1)one++;else many++;for(const z of c)if(!decode(z).some(p=>key(p)===key(w)))throw Error("plant lost")}return {name:s.name,words:s.words.length,none,one,many}});
 return {original:{groups:C.length,noInverse:allC.filter(x=>x.n===0).length,uniqueInverse:allC.filter(x=>x.n===1).length,multipleInverse:allC.filter(x=>x.n>1).length,noLexicalInverse:allC.filter(x=>x.lex.length===0).length,first30:allC.slice(0,30)},controls:plant};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"];
const shas=["054f2a0f780b7d46901acbe3d9bf4f0ac1801165","43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7","1b064ef6d85819b7d96adaff31a82d1ec551598f","140e1d22b5f8c45deddd2e8b25549d9d6307d938"];
const raw=paths.map((p,i)=>{const b=fs.readFileSync(path.resolve(__dirname,'..',p));if(crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex')!==shas[i])throw Error(p);return b.toString('utf8')});
console.log(JSON.stringify(experiment(raw),null,2));
