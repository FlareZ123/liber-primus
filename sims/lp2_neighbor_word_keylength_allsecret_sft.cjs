'use strict';
const fs=require('node:fs'),path=require('node:path');const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function run(j,transcript,lexicon,solved){
 const mod=x=>(x%29+29)%29,eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),check=(v,m)=>{if(!v)throw Error(m)};
 const lut=new Map(j.runes.map((x,i)=>[x,i])),words=transcript.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g).map(w=>[...w].map(x=>lut.get(x))).slice(0,2896),orig=j.pages.slice(0,56).flatMap(x=>x.indices);check(eq(words.flat(),orig),"source mismatch");
 const toks=j.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);function enc(s){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let p=[];while(s){if(s.startsWith("ING")){p.push(21);s=s.slice(3)}else if(s.startsWith("IO")){p.push(27);s=s.slice(2)}else{const t=toks.find(([x])=>s.startsWith(x));if(!t)return null;p.push(t[1]);s=s.slice(t[0].length)}}return p}
 const dict=new Map();for(const line of lexicon.split("\n"))if(/^[a-z]+ \d+$/.test(line)){const w=enc(line.split(" ")[0]);if(w)dict.set(w.join(","),w)}for(const sec of solved.sections)for(const w of sec.source_text.match(/[\u16a0-\u16ff]+/g)){const p=[...w].map(x=>lut.get(x));if(p.every(x=>x!==undefined))dict.set(p.join(","),p)}check(dict.size===29081,"dictionary count");const by=Array.from({length:40},()=>[]);for(const p of dict.values())if(p.length<by.length)by[p.length].push(p);
 function period(d,k){for(let i=k;i<d.length;i++)if(d[i]!==d[i-k])return false;return true}
 function minPeriod(d){if(d.length<2)return 1;for(let k=1;k<d.length;k++)if(period(d,k))return k;return d.length}
 function forward(p,key,hold){let t=0;return p.map(x=>hold&&x===0?0:mod(x+key[(t++)%key.length]))}
 function residual(p,c,hold){let out=[];for(let i=0;i<p.length;i++){if(hold&&p[i]===0){if(c[i]!==0)return null}else out.push(mod(c[i]-p[i]))}return out}
 const native=solved.sections.flatMap(s=>s.source_text.match(/[\u16a0-\u16ff]+/g).map(w=>[...w].map(x=>lut.get(x)))).filter(w=>w.every(x=>x!==undefined));
 let controls=0;for(let i=1;i<native.length;i++){const m=native[i-1].length,p=native[i];for(const k of [m,2*m])for(const hold of [false,true]){const key=Array.from({length:k},(_,z)=>mod(7*i+11*z+3)),c=forward(p,key,hold),d=residual(p,c,hold);check(d!==null&&period(d,k)&&minPeriod(d)<=k,"plant period");const reconstructed=Array.from({length:k},(_,z)=>d[z]??0);check(eq(forward(p,reconstructed,hold),c),"plant replay");controls++}}
 const results=[];
 for(const dir of [1,-1]){const counts={ordinary:{exact:0,double:0,zeroExact:[],zeroDouble:[],forcedDouble:[]},hold:{exact:0,double:0,zeroExact:[],zeroDouble:[],forcedDouble:[]}};for(let w=0;w<words.length;w++){const n=w-dir;if(n<0||n>=words.length)continue;const c=words[w],m=words[n].length;const ct={ordinary:{exact:0,double:0,p:[]},hold:{exact:0,double:0,p:[]}};for(const p of by[c.length])for(const [name,hold] of [["ordinary",false],["hold",true]]){const d=residual(p,c,hold);if(d===null)continue;const x=ct[name];if(period(d,m))x.exact++;const k=minPeriod(d);if(k<=2*m){x.double++;if(x.p.length<2)x.p.push(p);const key=Array.from({length:k},(_,i)=>d[i]??0);check(eq(forward(p,key,hold),c),"original candidate replay")}}
 for(const name of ["ordinary","hold"]){const x=ct[name],y=counts[name];y.exact+=x.exact>0;y.double+=x.double>0;if(!x.exact)y.zeroExact.push({w,n,m,L:c.length,c});if(!x.double)y.zeroDouble.push({w,n,m,L:c.length,c});if(x.double===1)y.forcedDouble.push({w,n,m,L:c.length,p:x.p[0].map(x=>j.translit[x]).join("")})}}
 results.push({dir,counts});}
 return {dictionary:dict.size,controlCount:controls,results}
}
console.log(JSON.stringify(run(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/liber-primus/lp2-transcription.txt'),read('resources/control/english_wordfreq_textblob.txt'),JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'))),null,2));
