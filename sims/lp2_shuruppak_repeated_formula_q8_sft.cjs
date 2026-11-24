'use strict';
const fs=require('node:fs'), path=require('node:path');
function experiment(corpus,native){
 const assert=(b,s)=>{if(!b)throw Error(s)};
 const q=8, mod=x=>(x%29+29)%29, eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const rm=new Map(corpus.runes.map((s,i)=>[s,i])), tape=s=>Array.from(s).filter(x=>rm.has(x)).map(x=>rm.get(x));
 const latin="MY SON LET ME GIVE YOU INSTRUCTIONS YOU SHOULD PAY ATTENTION";
 const words=latin.replace(/V/g,"U").split(" ");
 const gp=word=>{let s=word;const out=[];while(s.length){const t=corpus.translit.map((v,i)=>[v,i]).sort((a,b)=>b[0].length-a[0].length).find(([v])=>s.startsWith(v));assert(t,"unmapped "+s);out.push(t[1]);s=s.slice(t[0].length);}return out;};
 const variants=[];for(let mask=0;mask<4;mask++){let j=0;const seq=words.flatMap(w=>gp(w.replace(/IO/g,()=>((mask>>j++)&1)?"IO":"IA")));assert(j===2&&!seq.includes(0),"expected two IO and no F");if(!variants.some(x=>eq(x,seq)))variants.push(seq);}
 const units=[corpus.pages[36].indices.slice(99,238),corpus.pages[37].indices.slice(0,91),corpus.pages[37].indices.slice(91,189),corpus.pages[37].indices.slice(189,228).concat(corpus.pages[38].indices.slice(0,57)),corpus.pages[38].indices.slice(57,186)];
 assert(eq(units.map(x=>x.length),[139,91,98,96,129]),"source starts changed");
 function fit(c,p){let k=Array(q).fill(-1),j=0;for(let i=0;i<p.length;i++){if(p[i]===0){if(c[i]!==0)return{fail:i,reason:"F"};continue;}const d=mod(c[i]-p[i]);if(k[j]>=0&&k[j]!==d)return{fail:i,expected:k[j],observed:d};k[j]=d;j=(j+1)%q;}return{key:k,phase:j};}
 function enc(p,k,j){return p.map(x=>{if(x===0)return 0;const c=mod(x+k[j]);j=(j+1)%q;return c;});}
 function invert(c,k,j){let states=[{p:[],j}];for(const x of c){const next=[];for(const s of states){if(x===0)next.push({p:s.p.concat(0),j:s.j});const v=mod(x-k[s.j]);if(v!==0)next.push({p:s.p.concat(v),j:(s.j+1)%q});}states=next;}return states;}
 const cycle=k=>Array.from({length:q},(_,i)=>k.slice(i).concat(k.slice(0,i)).join(",")).sort()[0];
 const section=native.sections.find(s=>s.name==="0_koan_1");const donor=tape(section.source_text);assert(donor.length===780,"KOAN source length");for(const off of [279,142]){assert(eq(donor.slice(off,off+2),[24,16]),"KOAN correction changed");donor.splice(off,2,3);}
 const ctlCrib=gp("WHO").concat(gp("ARE"),gp("YOU"),gp("WHO"),gp("WISHES"),gp("TO"),gp("STUDY"),gp("HERE"));
 const starts=[];for(let i=0;i+ctlCrib.length+24<=donor.length;i++)if(eq(donor.slice(i,i+ctlCrib.length),ctlCrib))starts.push(i);
 assert(starts.length>=2,"no genuine repeated control");
 let s=0x2582cafe;const rand=n=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s%n;};
 const controls=[];for(let trial=0;trial<4;trial++){const key=Array.from({length:q},()=>rand(29));const lanes=starts.map(off=>{const p=donor.slice(off,off+ctlCrib.length+24);const phase=rand(q);const c=enc(p,key,phase);const f=fit(c,ctlCrib);assert(f.key&&cycle(f.key)===cycle(key),"blind key recovery");const paths=invert(c.slice(ctlCrib.length),f.key,f.phase);const truth=p.slice(ctlCrib.length);assert(paths.some(x=>eq(x.p,truth)),"truth absent");assert(paths.every(x=>eq(enc(x.p,f.key,f.phase),c.slice(ctlCrib.length))),"replay");return{off,phase,relativeKey:f.key,continuationPaths:paths.length,uniqueExact:paths.length===1&&eq(paths[0].p,truth)};});controls.push({trial,key,lanes});}
 const results=units.map((c,i)=>({unit:i+1,tests:variants.map(p=>({cribLength:p.length,...fit(c,p)}))}));
 const count=results.flatMap(x=>x.tests).filter(x=>x.key).length;
 return {latin,period:q,sourceStarts:["p36:99","p37:0","p37:91","p37:189","p38:57"],variants,controls,results,originalKeyCandidates:count};
}
module.exports={experiment};
if(require.main===module){
 const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
 console.log(JSON.stringify(experiment(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
}
