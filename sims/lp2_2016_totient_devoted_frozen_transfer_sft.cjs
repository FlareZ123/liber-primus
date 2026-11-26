'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus,raw,signed,freq){
 const mod=x=>(x%29+29)%29,eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]),check=(x,s)=>{if(!x)throw Error(s)};
 const ri=new Map(corpus.runes.map((r,i)=>[r,i])),ts=corpus.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
 function gp(w){let s=w.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/[^A-Z]/g,'');const a=[];while(s){const t=s.startsWith('ING')?['ING',21]:s.startsWith('IO')?['IO',27]:ts.find(([t])=>s.startsWith(t));if(!t)return null;a.push(t[1]);s=s.slice(t[0].length)}return a}
 const show=a=>a.map(x=>corpus.translit[x]).join('');
 const words=signed.split('-----BEGIN PGP SIGNATURE-----')[0].replace('-----BEGIN PGP SIGNED MESSAGE-----','').replace(/^Hash:.*$/gm,'').replace(/^\s*3301\s*$/gm,'').replace(/\b7A35090F\b/g,'').match(/[A-Za-z]+/g).map(x=>x.toUpperCase());
 const dict=new Set(freq.split(/\r?\n/).flatMap(l=>{const m=/^([a-zA-Z]+)\s+\d+$/.exec(l.trim());if(!m)return [];const w=gp(m[1]);return w?[w.join(',')]:[]}));
 const segments=raw.split(/^\s*%\s*$/m).slice(0,55),pages=new Map(),receivers=[];
 for(let s=0;s<segments.length;s++){const p=s>=50?s+1:s,groups=[],tape=[];let a=[],breaks=[],start=0;const flush=()=>{if(a.length){const g={page:p,start,values:a,breaks};groups.push(g);if(a.length===7&&breaks.length===1&&breaks[0]===2)receivers.push(g)}a=[];breaks=[]};
 for(const ch of segments[s]){if(ri.has(ch)){if(!a.length)start=tape.length;a.push(ri.get(ch));tape.push(ri.get(ch))}else if(ch==='/'){if(a.length)breaks.push(a.length)}else if(!/\s/u.test(ch))flush()}flush();check(eq(tape,corpus.pages[p].indices),"page tape mismatch "+p);pages.set(p,{groups,tape})}
 const h=a=>mod(2*a.slice(0,Math.floor(a.length/2)).reduce((x,y)=>x+y,0)+(a.length%2?a[(a.length-1)/2]:0)),fields=(a,k=a)=>[h(k),h(k.slice(0,2)),mod(a.reduce((x,y)=>x+y,0)),h(k.slice(2))];
 const p35=receivers.find(g=>g.page===35&&g.start===110),p39=receivers.find(g=>g.page===39&&g.start===67);
 check(p35&&p39&&receivers.length===15&&words.length===43&&h(p39.values.slice(2))===9,"source profile");
 const plain=gp('TOTIENT'),key=p35.values.map((c,i)=>mod(c-plain[i])),dev=gp(words[8]);
 check(eq(fields(p35.values,key),[9,12,10,11])&&words[8]==='DEVOTED'&&key.length===7&&dev.length===7,"candidate profile");
 let solutions=0;for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++){if(mod(2*a)!==12)continue;const d=mod(9-2*(a+b+c)),e=mod(11-2*(c+d));if(eq(fields(p35.values,[a,b,c,d,e,0,0]),[9,12,10,11]))solutions+=29*29}
 check(solutions===29**4,"rank count");
 const offsets=new Map();let pos=0;for(let p=0;p<=55;p++){offsets.set(p,pos);pos+=corpus.pages[p].indices.length}
 const book=corpus.pages.slice(0,56).flatMap(p=>p.indices);
 function lexical(out,start,end){let n=0,hit=0,examples=[];for(const [p,pv] of pages)for(const g of pv.groups){const a=offsets.get(p)+g.start,b=a+g.values.length;if(a<start||b>end||g.start===0||g.start+g.values.length===pv.tape.length)continue;n++;const w=out.slice(a-start,b-start);if(dict.has(w.join(','))){hit++;examples.push([p,g.start,show(w)])}}return {hit,n,examples}}
 function encode(p,k,phase,hold){let j=phase;return p.map(v=>{if(hold&&v===0)return 0;const c=mod(v+k[j]);j=(j+1)%k.length;return c})}
 // Exact dynamic program: count all valid paths; retain one complete witness
 // per state without discarding the multiplicity of alternate histories.
 function inverse(c,k,phase){let cur=new Map([[phase,{n:1n,p:[]}]]);for(let i=0;i<c.length;i++){const x=c[i],next=new Map();const put=(j,old,v)=>{if(next.has(j))next.get(j).n+=old.n;else next.set(j,{n:old.n,p:old.p.concat(v)})};for(const [j,old] of cur){if(x===0)put(j,old,0);const p=mod(x-k[j]);if(p!==0)put((j+1)%k.length,old,p)}cur=next;if(!cur.size)return {dead:i,n:0n,witness:null}}return {dead:null,n:[...cur.values()].reduce((a,b)=>a+b.n,0n),witness:cur.values().next().value.p}}
 function run(label,start,end,k,phase){const c=book.slice(start,end),p=c.map((v,i)=>mod(v-k[(phase+i)%k.length]));check(eq(encode(p,k,phase,false),c),"ordinary replay");const t=inverse(c,k,phase);let dead=null;if(t.dead!==null){const idx=start+t.dead;let page=0;while(page<55&&offsets.get(page+1)<=idx)page++;dead={global:idx,page,offset:idx-offsets.get(page),cipher:book[idx]}}
 if(t.witness)check(eq(encode(t.witness,k,phase,true),c),"transparent replay");
 return {label,length:c.length,phase,ordinary:{lexical:lexical(p,start,end),first70:show(p.slice(0,70))},transparent:{dead,paths:t.n.toString(),witness:t.witness?show(t.witness):null,lexical:t.witness?lexical(t.witness,start,end):null}}}
 const a35=offsets.get(35)+110,a39=offsets.get(39)+67,finish39=offsets.get(39)+119;
 const defs=[["p35 TOTIENT residual continuous heldout",a35+7,finish39,key,0],["p35 residual at p39:67 ordinary clock phase",a39,finish39,key,(a39-a35)%7],["p39 signed DEVOTED direct key",a39,finish39,dev,0],["p39 signed DEVOTED following group only",a39+7,finish39,dev,0]];
 const plant=words.flatMap(gp),plantCipher=encode(plant,key,0,true),plantInv=inverse(plantCipher,key,0);
 check(plant.includes(0)&&plantInv.n>0n&&eq(encode(plantInv.witness,key,0,true),plantCipher),"plant replay");
 // Check the exact known plaintext path independently, not only any witness.
 let phase=0;for(let i=0;i<plant.length;i++){let p=plant[i],c=plantCipher[i];if(p===0)check(c===0,"F hold plant");else{check(mod(c-key[phase])===p,"plant consuming path");phase=(phase+1)%7}}
 return {source:{p35:p35.values,p39:p39.values,words:words.slice(8,12),candidate:plain,residualKey:key,devotedKey:dev,p35Fields:fields(p35.values,key),p39Fields:fields(p39.values),fixedFieldSolutions:solutions,untypedSortedFieldSolutions:6*solutions,plantLength:plant.length,plantF:plant.filter(x=>x===0).length,plantPaths:plantInv.n.toString()},receivers:receivers.map(g=>({page:g.page,start:g.start,fields:fields(g.values)})),runs:defs.map(d=>run(...d))};
}
const root=path.resolve(__dirname,'..');
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/historical/cicada2016-4gq25-outguess.asc","resources/control/english_wordfreq_textblob.txt"];
const input=files.map((p,i)=>{const s=fs.readFileSync(path.join(root,p),'utf8');return i===0?JSON.parse(s):s});
console.log(JSON.stringify(experiment(...input),null,2));
