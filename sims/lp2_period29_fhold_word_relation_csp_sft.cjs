'use strict';
function experiment(inputs){
 const [gp,trans,lex,native]=[JSON.parse(inputs[0]),inputs[1],inputs[2],JSON.parse(inputs[3])];const assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29,q=29;
 const chart=gp.translit.map(x=>x.length),map=new Map(gp.runes.map((r,i)=>[r,i])),alpha=new Map(gp.translit.map((s,i)=>[s,i]));
 const parse=s=>(s.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x)));
 const originalWords=parse(trans).slice(0,2896);assert(String(originalWords.flat())===String(gp.pages.slice(0,56).flatMap(p=>p.indices)),"original source");
 const solved=native.sections.map(s=>(s.source_text.match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x))));
 const dict=Array.from({length:32},()=>new Map());
 const add=w=>{if(w.length&&w.length<32)dict[w.length].set(String(w),w)};
 function variants(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  function walk(i,w){if(i===s.length){add(w);return;}for(const n of [1,2,3]){const a=s.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?alpha.get("NG"):undefined):alpha.get(a);if(v!==undefined)walk(i+n,[...w,v]);}}walk(0,[]);
 }
 for(const l of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(l);if(m&&m[1].length>=2)variants(m[1]);}
 for(const s of ["A","I","O"])variants(s);for(const sec of solved)for(const w of sec)add(w);
 const tries=dict.map(d=>{const root={e:new Map()};for(const w of d.values()){let n=root;for(const x of w){if(!n.e.has(x))n.e.set(x,{e:new Map()});n=n.e.get(x);}}return root;});

 const ALL=(1<<29)-1, bit=i=>1<<i,pop=x=>{let n=0;while(x){x&=x-1;n++}return n},rot=(x,k)=>{k=mod(k);return k?((x<<k)|(x>>>(29-k)))&ALL:x},bits=function*(x){while(x){const b=x&-x;yield 31-Math.clz32(b);x^=b}};
 function encode(ws,key){let phase=0;return ws.map(w=>w.map(p=>p===0?0:mod(p+key[phase++%29])))}
 function build(ws){let offset=0,zeros=0;const domains=[1],rows=[];for(const c of ws){assert(c.length<=29,"word > period");const candidates=[];let startMask=0;for(let h=0;h<=Math.min(zeros,28);h++)startMask|=bit(mod(offset-h));for(const p of (dict[c.length]||new Map()).values()){const d=[];let legal=true;for(let i=0;i<c.length;i++){if(p[i]===0){if(c[i]!==0){legal=false;break}}else d.push(mod(c[i]-p[i]))}if(legal)candidates.push({p,d,startMask})}rows.push(candidates);offset+=c.length;zeros+=c.filter(x=>x===0).length;let mask=0;for(let h=0;h<=Math.min(zeros,28);h++)mask|=bit(mod(offset-h));domains.push(mask)}return {rows,domains}}
 function solve(ws,limit=3000,fixed=null){const {rows,domains}=build(ws);const initialRows=rows.reduce((n,w)=>n+w.length,0);let nodes=0,passes=0,rowVisits=0,exhausted=false;const keysFound=new Map();
  const fresh=()=>({keys:fixed?fixed.map(bit):Array(29).fill(ALL),ph:domains.slice(),masks:rows.map(w=>Uint32Array.from(w,r=>r.startMask))});
  const clone=s=>({keys:s.keys.slice(),ph:s.ph.slice(),masks:s.masks.map(x=>x.slice())});
  function propagate(s){let changed=true;while(changed){changed=false;passes++;for(let dir=0;dir<2;dir++){for(let wi=0;wi<rows.length;wi++){const w=dir?rows.length-1-wi:wi,candidates=rows[w],masks=s.masks[w];const support=Array(29).fill(0),startByValue=Array(29).fill(0);for(let ph=0;ph<29;ph++)for(const d of bits(s.keys[ph]))startByValue[d]|=bit(ph);let ins=0,outs=0,free=0;
   for(let j=0;j<candidates.length;j++){if(!masks[j])continue;rowVisits++;const {d}=candidates[j],m=d.length;let mask=masks[j]&s.ph[w]&rot(s.ph[w+1],-m);
    for(let i=0;mask&&i<m;i++)mask&=rot(startByValue[d[i]],-i);
    if(mask!==masks[j]){masks[j]=mask;changed=true}if(!mask)continue;ins|=mask;outs|=rot(mask,m);
    if(free!==ALL){let always=ALL;const run=m===29?ALL:(1<<m)-1;for(const start of bits(mask)){always&=rot(run,start);if(!always)break}free|=ALL^always;if(free!==ALL)for(let i=0;i<m;i++)support[d[i]]|=rot(mask,i)}
   }
   if(!ins)return false;
   if(ins!==s.ph[w]){s.ph[w]=ins;changed=true}if(outs!==s.ph[w+1]){s.ph[w+1]=outs;changed=true}
   if(free!==ALL){for(let ph=0;ph<29;ph++){if(free&bit(ph))continue;let mask=0;for(const d of bits(s.keys[ph]))if(support[d]&bit(ph))mask|=bit(d);if(!mask)return false;if(mask!==s.keys[ph]){s.keys[ph]=mask;changed=true}}}
  }}}return true}
  function witness(s){const key=s.keys.map(v=>31-Math.clz32(v));let states=new Map([[0,{prev:null,p:null,n:1}]]);for(let w=0;w<rows.length;w++){const next=new Map();for(let j=0;j<rows[w].length;j++){const row=rows[w][j];for(const ph of bits(s.masks[w][j])){const prev=states.get(ph);if(!prev)continue;const end=mod(ph+row.d.length),old=next.get(end);if(old)old.n=Math.min(2,old.n+prev.n);else next.set(end,{prev,p:row.p,n:prev.n})}}states=next}if(!states.size)return;let h=states.values().next().value;const p=[];while(h.p){p.unshift(h.p);h=h.prev}const id=key.join(",");assert(String(encode(p,key).flat())===String(ws.flat()),"replay");keysFound.set(id,{key,p,paths:Math.min(2,[...states.values()].reduce((a,b)=>a+b.n,0))})}
  function dfs(s){if(keysFound.size>=2||exhausted)return;if(++nodes>limit){exhausted=true;return}if(!propagate(s))return;let best={size:30,type:null,index:-1};for(let i=0;i<29;i++){const size=pop(s.keys[i]);if(size>1&&size<best.size)best={size,type:"keys",index:i}}if(!best.type){witness(s);return}
   for(let i=1;i<s.ph.length;i++){const size=pop(s.ph[i]);if(size>1&&size<best.size)best={size,type:"ph",index:i}}
   for(const v of bits(s[best.type][best.index])){const t=clone(s);t[best.type][best.index]=bit(v);dfs(t);if(keysFound.size>=2||exhausted)return}
  }
  dfs(fresh());return {keys:[...keysFound.values()],exhausted,nodes,passes,rowVisits,initialRows,exact:!exhausted&&keysFound.size<2}
 }

 function boundedEscapes(ws,budget=2){const C=ws.flat(),zeros=C.flatMap((c,i)=>c===0?[i]:[]);assert(zeros.length<=12,"bounded F-mask enumeration");const records=[];let solutions=0,exhausted=false,nodes=0;
  for(let mask=0;mask<(1<<zeros.length);mask++){const skip=new Set(zeros.filter((_,i)=>(mask>>i)&1)),keyDom=Array(29).fill(ALL),wordPh=[],wordRows=[];let phase=0,off=0;
   for(const c of ws){const positions=[];for(let i=0;i<c.length;i++,off++){if(skip.has(off))positions.push(-1);else{positions.push(phase);keyDom[phase]&=ALL^bit(c[i]);phase=(phase+1)%29}}wordPh.push(positions)}
   if(keyDom.some(v=>!v)){records.push({mask,reason:"non-F key domain empty"});continue}
   for(let w=0;w<ws.length;w++){const c=ws[w],ph=wordPh[w],a=[];for(const p of dict[c.length].values()){if(!p.every((v,i)=>(v===0)===(ph[i]===-1)))continue;const shifts=p.map((v,i)=>ph[i]===-1?-1:mod(c[i]-v));if(shifts.every((v,i)=>v===-1||(keyDom[ph[i]]&bit(v))))a.push(shifts)}wordRows.push(a)}
   const mandatory=wordRows.flatMap((a,i)=>a.length?[]:[i]);if(mandatory.length>budget){records.push({mask,reason:"mandatory OOV",lowerBound:mandatory.length,mandatory});continue}
   const edges=[];for(let i=0;i<ws.length;i++){if(!wordRows[i].length)continue;for(let j=i+1;j<ws.length;j++){if(!wordRows[j].length)continue;const pairs=wordPh[i].flatMap((v,k)=>v>=0&&wordPh[j].includes(v)?[[k,wordPh[j].indexOf(v)]]:[]);if(!pairs.length)continue;const sig=(row,k)=>pairs.map(p=>row[p[k]]).join(",");const a=new Set(wordRows[i].map(row=>sig(row,0)));if(!wordRows[j].some(row=>a.has(sig(row,1))))edges.push([i,j])}}
   let covers=[],coverNodes=0;function cover(del){coverNodes++;if(del.size>budget)return;const e=edges.find(([i,j])=>!del.has(i)&&!del.has(j));if(!e){covers.push([...del].sort((a,b)=>a-b));return}for(const v of e)cover(new Set([...del,v]))}cover(new Set(mandatory));if(!covers.length){records.push({mask,reason:"conflict graph needs > budget",mandatory,edges:edges.length,coverNodes});continue}
   const checked=new Set();let caseSolutions=0;let example=null;
   function search(del){const sig=[...del].sort((a,b)=>a-b).join(",");if(checked.has(sig))return;checked.add(sig);let found=false;const active=wordRows.map((a,i)=>del.has(i)?null:a);
    function solveFixed(dom,rows){if(++nodes>200000){exhausted=true;return null}let changed=true;while(changed){changed=false;for(let w=0;w<rows.length;w++){if(!rows[w])continue;const ph=wordPh[w],a=rows[w].filter(row=>row.every((v,i)=>v===-1||(dom[ph[i]]&bit(v))));if(!a.length)return null;if(a.length!==rows[w].length){rows[w]=a;changed=true}for(let i=0;i<ph.length;i++){if(ph[i]<0)continue;let support=0;for(const row of a)support|=bit(row[i]);const v=dom[ph[i]]&support;if(!v)return null;if(v!==dom[ph[i]]){dom[ph[i]]=v;changed=true}}}}
     let best=-1,size=30;for(let i=0;i<29;i++){const n=pop(dom[i]);if(n>1&&n<size){best=i;size=n}}if(best<0)return dom.map(v=>31-Math.clz32(v));for(const v of bits(dom[best])){const d=dom.slice();d[best]=bit(v);const res=solveFixed(d,rows.slice());if(res)return res;if(exhausted)return null}return null}
    const key=solveFixed(keyDom.slice(),active);if(key){found=true;caseSolutions++;solutions++;let p=0;const plain=C.map((c,i)=>skip.has(i)?0:mod(c-key[p++%29]));assert(String(encode([plain],key).flat())===String(C),"escape replay");example={key,erased:[...del],plain:plain.map(v=>gp.translit[v]).join("")};return}
    if(exhausted||del.size===budget)return;for(let i=0;i<ws.length;i++){if(!del.has(i))search(new Set([...del,i]));if(exhausted||caseSolutions)return}
   }
   for(const del of covers){search(new Set(del));if(exhausted||caseSolutions)break}records.push({mask,reason:caseSolutions?"witness":exhausted?"cap":"exact empty",mandatory,edges:edges.length,covers:covers.length,checked:checked.size,example});if(exhausted)break
  }
  return {budget,Fzeros:zeros.length,masks:1<<zeros.length,records,solutions,exhausted,nodes};
 }
 function summarize(x){return {...x,keys:x.keys.map(v=>({key:v.key,paths:v.paths,runecount:v.p.flat().length}))}}

 function plant(name,control,seed,trainLength){let x=seed;const rand=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)%29};const rawKey=Array.from({length:29},rand),phase=rand(),key=rawKey.slice(phase).concat(rawKey.slice(0,phase)),cipher=encode(control,key);let cut=0,total=0;while(total<trainLength&&cut<cipher.length)total+=cipher[cut++].length;
 const res=solve(cipher.slice(0,cut),3000),correctKey=res.keys.length===1&&!res.exhausted&&String(res.keys[0].key)===String(key);const result={name,key,phase,trainRunes:total,held:cipher.slice(cut).flat().length,cipherF:cipher.flat().filter(v=>v===0).length,plainF:control.flat().filter(v=>v===0).length,result:summarize(res),correctKey};
 if(correctKey){const full=solve(cipher,3000,res.keys[0].key);const p=full.keys[0]?.p.flat()||[],truth=control.flat();result.full=summarize(full);result.correct=p.length===truth.length&&p.every((v,i)=>v===truth[i]);result.heldMatches=p.slice(total).filter((v,i)=>v===truth[total+i]).length}
 return result}
 function donor(s){const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);const words=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){const p=[];w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tokens.find(t=>w.startsWith(t.s));if(!t)throw Error("donor token "+w);p.push(t.i);w=w.slice(t.s.length)}words.push(p)}return words}
 function take(ws,length){let n=0,i=0;while(n<length&&i<ws.length)n+=ws[i++].length;assert(n>=length,"donor length");return ws.slice(0,i)}
 const baseVocabulary=dict.reduce((n,d)=>n+d.size,0),g=donor(inputs[4].slice(inputs[4].toLowerCase().indexOf("almustafa"))),sh=donor(inputs[5]);
 // Include full public donor vocabulary, without any ordered plaintext constraints.
 for(const p of [...g,...sh])add(p);
 const plants=[plant("Koan1 native suffix",solved[3].slice(135),0x2904,220),plant("Gibran continuous source opening",take(g,700),0x2905,400),plant("Shakespeare continuous source opening",take(sh,700),0x2906,400)];

 assert(plants.every(p=>p.correctKey&&p.correct&&p.heldMatches===p.held&&p.full.keys[0].paths===1),"blind positive controls");
 const original=originalWords.slice(-66);assert(original.flat().length===308,"frozen p54-55 source");
 let cut=0,trainRunes=0;while(trainRunes<200)trainRunes+=original[cut++].length;
 const res=solve(original.slice(0,cut),3000);
 const target={chapter:"p54-55",trainRunes,held:308-trainRunes,trainWords:cut,result:summarize(res)};
 if(res.exact&&res.keys.length===1){const full=solve(original,3000,res.keys[0].key);target.full=summarize(full);if(full.keys.length===1)target.plaintext=full.keys[0].p.map(w=>w.map(x=>gp.translit[x]).join("")).join(" ")}
 target.escaped=boundedEscapes(original.slice(0,cut),2);
 return {baseVocabulary,vocabulary:dict.reduce((n,d)=>n+d.size,0),plants,target};
}

const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
