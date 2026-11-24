'use strict';
// Agent43: all-output-order moving-escape graph embedding and relaxed original p55 witnesses.
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus,trans,lex,solved){
 const assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x+29)%29;
 const idx=new Map(corpus.runes.map((x,i)=>[x,i]));let words=[],w=[];
 for(const c of trans.split("%").slice(0,55).join("%")){if(idx.has(c))w.push(idx.get(c));else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&w.length){words.push(w);w=[]}}if(w.length)words.push(w);
 const pages=corpus.pages.filter(p=>p.page<=55),actual=pages.flatMap(p=>p.indices),pageOf=pages.flatMap(p=>p.indices.map(()=>p.page));
 assert(words.length===2896&&actual.length===12956&&words.flat().join()===actual.join(),"source parity");
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),vocab=new Map(),seen=new Set();
 for(const l of lex.split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(l);if(!m)continue;let s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA"),p=[];while(s.length){let t=tokens.find(t=>s.startsWith(t.s));if(!t)break;p.push(t.i);s=s.slice(t.s.length)}if(s.length||seen.has(p.join()))continue;seen.add(p.join());if(!vocab.has(p.length))vocab.set(p.length,[]);vocab.get(p.length).push({p,word:m[1],count:+m[2]})}
 for(const a of vocab.values())a.sort((a,b)=>b.count-a.count);
 assert(seen.size===29060,"lexicon parity");
 function edges(w,p,prev){let a=[];for(let i=0;i<w.length;i++){let x=i?w[i-1]:prev,y=w[i];if(x!==y)a.push(mod(y-x-1)*29+p[i])}return [...new Set(a)]}
 class Graph{
  constructor(){this.ad=Array.from({length:57},()=>[])}
  add(es){let added=[];for(const e of es){let a=e/29|0,b=28+e%29;if(this.ad[a].includes(b))continue;if(this.ad[a].length===2||this.ad[b].length===2){this.undo(added);return null}let x=a,last=-1;while(x!==-1){if(x===b){this.undo(added);return null}let next=this.ad[x].find(v=>v!==last);last=x;x=next??-1}this.ad[a].push(b);this.ad[b].push(a);added.push([a,b])}return added}
  undo(added){for(let i=added.length-1;i>=0;i--){let [a,b]=added[i];this.ad[a].pop();this.ad[b].pop()}}
  complete(){const seen=new Set(),pp=[],rr=[],pr=[];for(let i=0;i<57;i++){if(seen.has(i)||this.ad[i].length>1)continue;let path=[],x=i,last=-1;while(x!==-1){assert(!seen.has(x),"acyclic");seen.add(x);path.push(x);let next=this.ad[x].find(y=>y!==last);last=x;x=next??-1}let p=path[0]>=28,q=path.at(-1)>=28;if(p&&q)pp.push(path);else if(!p&&!q)rr.push(path);else pr.push(p?path:path.reverse())}assert(seen.size===57&&pp.length===rr.length+1,"path balance");let path=pr.flat();for(let i=0;i<pp.length;i++){path.push(...pp[i]);if(i<rr.length)path.push(...rr[i])}assert(path.length===57&&new Set(path).size===57&&path.every((x,i)=>(x>=28)===(i%2===0)),"alternation");const pos=Array(57);path.forEach((v,i)=>pos[v]=i);assert(this.ad.every((a,i)=>a.every(j=>Math.abs(pos[i]-pos[j])===1)),"edge inclusion");return {alphabet:path.filter(x=>x>=28).map(x=>x-28),rankOrder:path.filter(x=>x<28)}}
 }
 function replay(clear,cipher,key){const {alphabet,rankOrder}=key;let apos=Array(29),rpos=Array(28);alphabet.forEach((v,i)=>apos[v]=i);rankOrder.forEach((v,i)=>rpos[v]=i);let esc=[null],decoded=[cipher[0]],encoded=[clear[0]];assert(clear[0]===cipher[0],"literal initial");
 for(let i=1;i<cipher.length;i++){const d=mod(cipher[i]-cipher[i-1]),p=apos[clear[i]];let e;if(!d)e=p;else{let r=rpos[d-1];assert(p===r||p===r+1,"edge");e=p===r?28:0}esc.push(e);const v=!d?e:rpos[d-1]+Number(rpos[d-1]>=e);decoded.push(alphabet[v]);const n=p===e?0:1+rankOrder[p-Number(p>e)];encoded.push(mod(encoded[i-1]+n))}
 assert(decoded.join()===clear.join()&&encoded.join()===cipher.join(),"exact original replay");return {alphabet,rankOrder,esc,exact:encoded.length}}
 // Mathematical sanity: union of two degree-2 paths can create a forbidden cycle.
 const toy=new Graph();assert(toy.add([0,1,29,30])===null,"4-cycle rejection");assert(toy.add([0,1,2])===null,"degree 3 rejection");assert(toy.add([0,1,30])!==null,"path acceptance");toy.complete();
 // Authentic solved-text control, arbitrary hidden alphabet and rank order, causal escape.
 const native=solved.sections.flatMap(s=>[...s.source_text].filter(c=>idx.has(c)).map(c=>idx.get(c)));
 assert(native.length===2979,"native size");
 let seed=0x43a3301;function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 function shuffle(n){let a=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){let j=rnd()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 const plants=[];for(let t=0;t<3;t++){let clear=native.slice(t*700,t*700+700),alphabet=shuffle(29),rankOrder=shuffle(28),apos=Array(29);alphabet.forEach((x,i)=>apos[x]=i);let f=Array.from({length:29},()=>rnd()%29),cipher=[clear[0]];for(let i=1;i<clear.length;i++){let e=f[clear[i-1]],p=apos[clear[i]],d=p===e?0:1+rankOrder[p-Number(p>e)];cipher.push(mod(cipher[i-1]+d))}let g=new Graph(),es=edges(cipher.slice(1),clear.slice(1),cipher[0]);assert(g.add(es)!==null,"native graph");let key=g.complete(),res=replay(clear,cipher,key);plants.push({length:res.exact,observedEdges:es.length,exactAlphabet:key.alphabet.join()===alphabet.join(),reversedAlphabet:key.alphabet.join()===alphabet.slice().reverse().join()})}
 let offset=0;const all=words.map((w,i)=>{let o=offset;offset+=w.length;return {i,w,start:o,page:pageOf[o],end:pageOf[offset-1]}});
 const target=all.filter(x=>x.page===55&&x.end===55),cipher=pages.find(p=>p.page===55).indices;
 assert(target.length===16&&cipher.length===76&&target.flatMap(x=>x.w).join()===cipher.slice(1).join(),"p55 carried rune");
 const g=new Graph(),lists=target.map(x=>vocab.get(x.w.length).flatMap(v=>{let e=edges(x.w,v.p,actual[x.start-1]),a=g.add(e);if(a===null)return [];g.undo(a);return [{...v,e}]}));
 let nodes=0,tests=0,sols=[],cap=false;const chosen=Array(target.length).fill(null);
 function dfs(dom){if(sols.length>=3||cap)return;if(++nodes>5000){cap=true;return}if(!dom.length){let clear=[cipher[0],...chosen.flatMap(x=>x.p)],key=g.complete();sols.push({words:chosen.map(x=>x.word),clear,...replay(clear,cipher,key)});return}let best=dom[0];for(const x of dom)if(x.list.length<best.list.length)best=x;for(const c of best.list){let a=g.add(c.e);if(a===null)continue;chosen[best.i]=c;let next=[],ok=true;for(const x of dom)if(x!==best){let list=[];for(const v of x.list){tests++;let b=g.add(v.e);if(b!==null){g.undo(b);list.push(v)}}if(!list.length){ok=false;break}next.push({i:x.i,list})}if(ok)dfs(next);g.undo(a);chosen[best.i]=null;if(cap||sols.length>=3)return}}
 dfs(lists.map((list,i)=>({i,list})));
 assert(sols.length===3&&new Set(sols.map(x=>x.clear.join())).size===3,"distinct original witnesses");
 return {lexicon:seen.size,originalRunes:actual.length,p55Runes:cipher.length,carriedInitial:cipher[0],targetWordIds:target.map(x=>x.i),initialDomains:lists.map(x=>x.length),nodes,tests,cap,plants,witnesses:sols};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
const files=paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(files[0]),files[1],files[2],JSON.parse(files[3])),null,2));
