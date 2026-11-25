'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function experiment(raw){
 const g=JSON.parse(raw[0]),native=JSON.parse(raw[2]),idx=new Map(g.runes.map((x,i)=>[x,i])),alpha=new Map(g.translit.map((x,i)=>[x,i])),weights=g.prime,syms="0123456789ABCDEFGHIJKLMNOPQRS";
 const parse=t=>(t.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(x=>idx.get(x)));
 const C=parse(raw[1].replace(/[\s/%]/g,"")).slice(0,2896).flat();if(C.length!==12956||C.join()!==g.pages.slice(0,56).flatMap(p=>p.indices).join())throw Error("source mismatch");
 const ps=[];for(let n=2;ps.length<6000;n++){let ok=true;for(const p of ps){if(p*p>n)break;if(n%p===0){ok=false;break}}if(ok)ps.push(n)}
 const mod=x=>(x%29+29)%29,sh=Int8Array.from([0,...ps.map(x=>mod(x-1))]),sum=w=>w.reduce((s,x)=>s+weights[x],0);
 const encode=(w,b)=>{let k=sum(w)+b;return w.map(x=>x===0?0:mod(x+sh[k++]))};
 const key=w=>w.map(x=>syms[x]).join("");const dict=new Set();
 function variants(word,fn){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function walk(i,w){if(i===s.length){fn(w);return}for(let n=1;n<=3;n++){const t=s.slice(i,i+n),v=n===3?(t==="ING"?alpha.get("NG"):undefined):alpha.get(t);if(t.length===n&&v!==undefined)walk(i+n,[...w,v])}}walk(0,[])}
 for(const line of raw[3].split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m)variants(m[1],w=>dict.add(key(w)))}
 const controls=native.sections.map(s=>({name:s.name,words:parse(s.source_text)}));for(const s of controls)for(const w of s.words)dict.add(key(w));
 if(dict.size!==38938)throw Error("dictionary count "+dict.size);
 const singles=new Set(controls.flatMap(s=>s.words.filter(w=>w.length===1).map(key)));
 const buckets=new Map();let count=0,maxLen=0;
 for(const k of dict){if(k.length===1&&!singles.has(k))continue;const w=[...k].map(x=>syms.indexOf(x));const s=sum(w);if(!buckets.has(s))buckets.set(s,Array.from({length:29},()=>[]));buckets.get(s)[w[0]].push(w);maxLen=Math.max(maxLen,w.length);count++}
 const rows=[...buckets];
 function gate(c,b,threshold=32){const n=Math.min(c.length,threshold+maxLen-1),reach=new Uint8Array(n+1),prev=Array(n+1);reach[0]=1;let far=0;
 for(let i=0;i<n&&i<threshold;i++){if(!reach[i])continue;const z=c[i];for(const [s,row] of rows){const start=s+b,p=mod(z-sh[start]);const choices=[];if(z===0)choices.push(row[0]);if(p!==0)choices.push(row[p]);for(const list of choices)for(const w of list){if(i+w.length>n)continue;let j=1,k=start+(w[0]===0?0:1);for(;j<w.length;j++){const x=w[j],y=x===0?0:mod(x+sh[k++]);if(y!==c[i+j])break}if(j===w.length){const q=i+j;if(!reach[q]){reach[q]=1;prev[q]={i,w};far=Math.max(far,q)}if(q>=threshold)return {far:q,pass:true};}}}}
 const witness=[];for(let j=far;j>0;){const p=prev[j];witness.push(key(p.w));j=p.i}return {far,pass:false,witness:witness.reverse().join(" ")};}
 function scan(c){let best=-1,at=[],pass=[],hist={};for(let b=0;b<=3301;b++){const r=gate(c,b);hist[r.far]=(hist[r.far]||0)+1;if(r.pass)pass.push(b);if(r.far>best){best=r.far;at=[{b,witness:r.witness}]}else if(r.far===best)at.push({b,witness:r.witness})}return {best,at:at.slice(0,10),bestCount:at.length,pass,hist}}
 const p54=g.pages.slice(54,56).flatMap(p=>p.indices);
 const selected=[["p0-title-included",C],["p0-body-after-red13",C.slice(13)],["p54-body-after-red9",p54.slice(9)]];
 const plant=controls.slice(0,3).map((s,i)=>{const b=[0,724,1033][i];const c=s.words.flatMap(w=>encode(w,b));return {name:s.name,b,gate:gate(c,b)}});
 if(plant.some(x=>!x.gate.pass))throw Error("control failed");
 return {dictionary:count,threshold:32,maxLen,offsets:[0,3301],target:selected.map(([name,c])=>({name,...scan(c)})),plant};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"];
const shas=["054f2a0f780b7d46901acbe3d9bf4f0ac1801165","43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7","1b064ef6d85819b7d96adaff31a82d1ec551598f","140e1d22b5f8c45deddd2e8b25549d9d6307d938"];
const raw=paths.map((p,i)=>{const b=fs.readFileSync(path.resolve(__dirname,'..',p));if(crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex')!==shas[i])throw Error(p);return b.toString('utf8')});
console.log(JSON.stringify(experiment(raw),null,2));
