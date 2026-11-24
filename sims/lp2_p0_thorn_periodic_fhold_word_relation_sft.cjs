"use strict";
/** Exact word-relation inverse for periodic GP29 additive encryption with a set of literal hold symbols.
 * Source-selected TH and historical F candidate roles; no claimed author key.
 * Run: node sims/lp2_p0_thorn_periodic_fhold_word_relation_sft.cjs
 */
function experiment(inputs){
 const [gp,trans,lex,native]=[JSON.parse(inputs[0]),inputs[1],inputs[2],JSON.parse(inputs[3])],check=(x,m)=>{if(!x)throw Error(m)},mod=(x,q=29)=>(x%q+q)%q;
 const map=new Map(gp.runes.map((x,i)=>[x,i])),alpha=new Map(gp.translit.map((x,i)=>[x,i]));
 const parse=s=>(s.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x)));
 const orig=parse(trans.split("%").slice(0,3).join("%"));check(orig.flat().join(",")===gp.pages.slice(0,3).flatMap(p=>p.indices).join(","),"source p0-2");
 check(orig[0].length===8&&orig[1].length===5&&orig.slice(2).flat().length===716,"physical title");
 const solved=native.sections.map(s=>(s.source_text.match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x))));
 const dict=Array.from({length:32},()=>new Map());const add=w=>{if(w.length&&w.length<32)dict[w.length].set(w.join(","),w)};
 function variants(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function walk(i,w){if(i===s.length){add(w);return}for(const n of [1,2,3]){const a=s.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?alpha.get("NG"):undefined):alpha.get(a);if(v!==undefined)walk(i+n,[...w,v])}}walk(0,[])}
 for(const l of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(l);if(m&&m[1].length>=2)variants(m[1])}
 for(const x of ["A","I","O","T"])variants(x);for(const sec of solved)for(const w of sec)add(w);
 const ALL=(1<<29)-1,bit=i=>1<<i,pop=x=>{let n=0;while(x){x&=x-1;n++}return n},bits=function*(x){while(x){const b=x&-x;yield 31-Math.clz32(b);x^=b}};
 const take=(ws,n)=>{let i=0,s=0;while(i<ws.length&&s<n)s+=ws[i++].length;return i};
 function encode(ws,key,Q,start=0){let phase=start;return ws.map(w=>w.map(p=>Q.includes(p)?p:mod(p+key[phase++%key.length])))}
 function solve(ws,q,Q,{fixed=null,startMask=1,cap=10000}={}){
  const PM=(1<<q)-1,rot=(x,k)=>{k=mod(k,q);return k?((x<<k)|(x>>>(q-k)))&PM:x};const hold=x=>Q.includes(x);
  let off=0,visible=0;const domains=[startMask],rows=[];
  for(const c of ws){const candidates=[];for(const p of (dict[c.length]??new Map()).values()){let d=[],ok=true;for(let i=0;i<c.length;i++){if(hold(p[i])){if(c[i]!==p[i]){ok=false;break}}else{const v=mod(c[i]-p[i]);if(d.length>=q&&d[d.length-q]!==v){ok=false;break}d.push(v)}}if(ok)candidates.push({p,m:d.length,d:d.slice(0,q)})}rows.push(candidates);off+=c.length;visible+=c.filter(hold).length;let m=0;for(let h=0;h<=Math.min(visible,q-1);h++)m|=rot(startMask,off-h);domains.push(m)}
  let nodes=0,passes=0,visits=0,capped=false;const found=new Map();
  const fresh=()=>({key:fixed?fixed.map(bit):Array(q).fill(ALL),ph:domains.slice(),masks:rows.map((w,i)=>Uint32Array.from(w,()=>domains[i]))});const clone=s=>({key:s.key.slice(),ph:s.ph.slice(),masks:s.masks.map(x=>x.slice())});
  function propagate(s){let changed=true;while(changed){changed=false;passes++;for(let dir=0;dir<2;dir++)for(let wi=0;wi<rows.length;wi++){const w=dir?rows.length-1-wi:wi;const a=rows[w],masks=s.masks[w],allowed=Array(29).fill(0),support=Array(29).fill(0);for(let ph=0;ph<q;ph++)for(const v of bits(s.key[ph]))allowed[v]|=bit(ph);let ins=0,outs=0,free=0;
   for(let j=0;j<a.length;j++){if(!masks[j])continue;visits++;const {d,m}=a[j];let mask=masks[j]&s.ph[w]&rot(s.ph[w+1],-m);for(let i=0;mask&&i<d.length;i++)mask&=rot(allowed[d[i]],-i);if(mask!==masks[j]){masks[j]=mask;changed=true}if(!mask)continue;ins|=mask;outs|=rot(mask,m);let used=PM,run=(1<<d.length)-1;for(const ph of bits(mask))used&=rot(run,ph);free|=PM^used;for(let i=0;i<d.length;i++)support[d[i]]|=rot(mask,i)}
   if(!ins)return false;if(ins!==s.ph[w]){s.ph[w]=ins;changed=true}if(outs!==s.ph[w+1]){s.ph[w+1]=outs;changed=true}
   for(let ph=0;ph<q;ph++){if(free&bit(ph))continue;let m=0;for(const v of bits(s.key[ph]))if(support[v]&bit(ph))m|=bit(v);if(!m)return false;if(m!==s.key[ph]){s.key[ph]=m;changed=true}}
  }}return true}
  function witness(s){const key=s.key.map(x=>31-Math.clz32(x));let states=new Map([...bits(s.ph[0])].map(ph=>[ph,{prev:null,p:null,n:1,start:ph}]));for(let w=0;w<rows.length;w++){const next=new Map();for(let j=0;j<rows[w].length;j++){const {p,m}=rows[w][j];for(const ph of bits(s.masks[w][j])){const prev=states.get(ph);if(!prev)continue;const end=mod(ph+m,q),old=next.get(end);if(old)old.n=Math.min(2,old.n+prev.n);else next.set(end,{prev,p,n:prev.n,start:prev.start})}}states=next;if(!states.size)return}let h=states.values().next().value;const p=[];while(h.p){p.unshift(h.p);h=h.prev}check(encode(p,key,Q,h.start).flat().join(",")===ws.flat().join(","),"replay");const id=key.join(","),endMask=[...states.keys()].reduce((a,b)=>a|bit(b),0),paths=Math.min(2,[...states.values()].reduce((a,b)=>a+b.n,0));const old=found.get(id);if(old){old.endMask|=endMask;old.paths=2}else found.set(id,{key,p,endMask,paths,start:h.start})}
  function dfs(s){if(found.size>=2||capped)return;if(++nodes>cap){capped=true;return}if(!propagate(s))return;let best={size:30,type:null,i:-1};for(let i=0;i<q;i++){const size=pop(s.key[i]);if(size>1&&size<best.size)best={size,type:"key",i}}if(!best.type){witness(s);return}for(let i=1;i<s.ph.length;i++){const size=pop(s.ph[i]);if(size>1&&size<best.size)best={size,type:"ph",i}}for(const v of bits(s[best.type][best.i])){const t=clone(s);t[best.type][best.i]=bit(v);dfs(t);if(found.size>=2||capped)return}}
  dfs(fresh());return {keys:[...found.values()],capped,nodes,passes,visits,rows:rows.reduce((a,b)=>a+b.length,0),exact:!capped&&found.size<2}
 }
 function anchorGate(ws,q,Q){const A=[];for(let i=0;i<ws.length;i++){const c=ws[i];if(c.length<8||c.some(x=>Q.includes(x)))continue;const shifts=[];for(const p of dict[c.length].values()){if(p.some(x=>Q.includes(x)))continue;const d=p.map((x,j)=>mod(c[j]-x));if(d.some((x,j)=>j>=q&&x!==d[j-q]))continue;shifts.push(d.slice(0,q))}A.push({i,length:c.length,shifts})}
 const bad=A.filter(a=>!a.shifts.length),good=A.filter(a=>a.shifts.length),edges=[];for(let i=0;i<good.length;i++)for(let j=i+1;j<good.length;j++){const a=good[i],b=good[j];let compatible=false;for(let rot=0;rot<q&&!compatible;rot++){const ps=[];for(let u=0;u<a.shifts[0].length;u++){const v=mod(u-rot,q);if(v<b.shifts[0].length)ps.push([u,v])}if(!ps.length){compatible=true;break}const sig=(x,col)=>ps.map(p=>x[p[col]]).join(",");const set=new Set(a.shifts.map(x=>sig(x,0)));compatible=b.shifts.some(x=>set.has(sig(x,1)))}if(!compatible)edges.push([a.i,b.i])}
 let best=good.length,solution=[];function dfs(es,d){if(d.length>=best)return;if(!es.length){best=d.length;solution=d;return}const [a,b]=es[0];dfs(es.filter(e=>!e.includes(a)),[...d,a]);dfs(es.filter(e=>!e.includes(b)),[...d,b])}dfs(edges,[]);return {q,Q,anchors:A.map(a=>[a.i,a.length,a.shifts.length]),mandatory:bad.map(a=>a.i),edges,minimumOOV:bad.length+best,exampleCover:solution}}
 const pack=x=>({...x,keys:x.keys.map(k=>({...k,p:k.p.flat().length}))});
 const specs=[[8,[2],1,0x8032],[13,[2],3,0x13032],[8,[0,2],3,0x80302],[13,[0,2],1,0x130302]];
 const plants=[];for(const [q,Q,sec,seed] of specs){let x=seed;const rand=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)%29};const key=Array.from({length:q},rand),plain=solved[sec],cut=take(plain,250),c=encode(plain,key,Q);const fit=solve(c.slice(0,cut),q,Q);const correct=fit.exact&&fit.keys.length===1&&fit.keys[0].key.join(",")===key.join(",");let hold=null,match=0;const truth=plain.slice(cut).flat();if(correct){hold=solve(c.slice(cut),q,Q,{fixed:fit.keys[0].key,startMask:fit.keys[0].endMask});const p=hold.keys[0]?.p.flat()??[];match=p.filter((v,i)=>v===truth[i]).length}plants.push({q,Q,sec,key,fit:pack(fit),correct,hold:hold?pack(hold):null,match,held:truth.length,fitRunes:plain.slice(0,cut).flat().length})}
 const body=orig.slice(2),cut=take(body,350),target=[];for(const [q,Q] of specs){const fit=solve(body.slice(0,cut),q,Q);const out={q,Q,fit:pack(fit),trainRunes:body.slice(0,cut).flat().length,held:body.slice(cut).flat().length,anchorGate:anchorGate(body.slice(0,cut),q,Q)};if(fit.exact&&fit.keys.length===1){const k=fit.keys[0],hold=solve(body.slice(cut),q,Q,{fixed:k.key,startMask:k.endMask});out.hold=pack(hold);if(hold.keys.length)out.readout=hold.keys[0].p.map(w=>w.map(x=>gp.translit[x]).join("")).join(" ")}target.push(out)}
 check(plants.every(p=>p.correct&&p.match===p.held&&p.hold.keys[0].paths===1),"native plant gates");
 check(target.every(t=>t.fit.exact&&t.fit.keys.length===0),"original gate");
 return {dictionary:dict.reduce((n,d)=>n+d.size,0),plants,target};
}
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
