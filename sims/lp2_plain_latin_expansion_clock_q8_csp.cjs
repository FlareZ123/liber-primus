"use strict";
// GP29 plaintext Latin-expansion clock, fixed q8, transparent F.
/** @param {string[]} inputs repository corpus, transcript, lexicon, native controls */
function experiment(inputs){
 const [gp,trans,lex,native]=[JSON.parse(inputs[0]),inputs[1],inputs[2],JSON.parse(inputs[3])];const assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29,q=8;
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
 function encode(words,key,adv,initial=0){let phase=initial;return {cipher:words.map(w=>w.map(x=>{if(x===0)return 0;const c=mod(x+key[phase]);phase=(phase+adv[x])%q;return c})),phase};}
 function advance(states,words,adv,limit=1000000){const history=[];let nodes=0,used=0;
  for(let wi=0;wi<words.length;wi++){const cw=words[wi],root=tries[cw.length];if(!root)throw Error("missing trie");const next=new Map();let exhausted=false;
   for(const st of states.values()){
    const k=st.k.slice(),p=[];
    function walk(i,ph,n){
     if(exhausted)return;
     if(++nodes>limit){exhausted=true;return;}
     if(i===cw.length){const id=ph+"|"+k.join(","),old=next.get(id);if(old)old.paths=Math.min(2,old.paths+st.paths);else next.set(id,{k:k.slice(),ph,paths:st.paths,trace:{w:p.slice(),prev:st.trace}});return;}
     const c=cw[i];
     const hold=n.e.get(0);if(c===0&&hold){p.push(0);walk(i+1,ph,hold);p.pop();}
     if(k[ph]!==-1){const x=mod(c-k[ph]),child=n.e.get(x);if(x!==0&&child){p.push(x);walk(i+1,(ph+adv[x])%q,child);p.pop();}}
     else for(const [x,child] of n.e){if(x===0)continue;k[ph]=mod(c-x);p.push(x);walk(i+1,(ph+adv[x])%q,child);p.pop();k[ph]=-1;}
    }
    walk(0,st.ph,root);if(exhausted)break;
   }
   if(exhausted)return {states,history,nodes,used,stop:"node cap",exact:false};
   states=next;used++;history.push({word:wi+1,states:states.size,keys:new Set([...states.values()].map(s=>String(s.k))).size});
   if(!states.size)return {states,history,nodes,used,stop:"infeasible",exact:true};
  }return {states,history,nodes,used,stop:"complete",exact:true};
 }
 const start=()=>new Map([["0|"+Array(q).fill(-1).join(","),{k:Array(q).fill(-1),ph:0,paths:1,trace:null}]]);
 const summary=r=>({stop:r.stop,exact:r.exact,nodes:r.nodes,used:r.used,states:r.states.size,keys:[...new Set([...r.states.values()].map(s=>String(s.k)))].slice(0,12),history:r.history});
 const trace=st=>{const a=[];for(let t=st.trace;t;t=t.prev)a.unshift(t.w);return a};
 const freeze=words=>{let n=0;let i=0;while(n<150&&i<words.length){n+=words[i++].length;}return {i,n};}
 // Layout-only choice: first solved-native suffix with consecutive long opening
 // words and at least 250 runes. Avoids the uninformative short-word frontier.
 const controlStart=solved[3].findIndex((w,i,ws)=>w.length>=8&&ws[i+1]?.length>=6&&ws.slice(i).flat().length>=250);
 assert(controlStart===135,"layout-selected control");
 const control=solved[3].slice(controlStart),plantKey=[23,10,1,10,9,10,16,26],plant=encode(control,plantKey,chart).cipher,ps=freeze(control);
 const train=advance(start(),plant.slice(0,ps.i),chart,5000000);const ordinary=advance(start(),plant.slice(0,ps.i),Array(29).fill(1),5000000);
 let hold=null;if(train.exact&&train.states.size>0&&[...train.states.values()].every(s=>!s.k.includes(-1))&&new Set([...train.states.values()].map(s=>String(s.k))).size===1){
  const h=advance(train.states,plant.slice(ps.i),chart,5000000);const best=[...h.states.values()][0];const pred=best?trace(best):[];hold={...summary(h),runes:pred.flat().length,exactMatches:pred.flat().filter((x,i)=>x===control.flat()[i]).length,uniquePath:best?.paths===1&&h.states.size===1,replay:best?String(encode(pred,best.k,chart).cipher.flat())===String(plant.flat()):false};
 }
 const original=originalWords.slice(-66);assert(original.flat().length===308,"frozen p54-55 chapter");const os=freeze(original);const unknown=advance(start(),original.slice(0,os.i),chart,5000000);
 let origHold=null;if(unknown.exact&&unknown.states.size&&[...unknown.states.values()].every(s=>!s.k.includes(-1))&&new Set([...unknown.states.values()].map(s=>String(s.k))).size===1){const h=advance(unknown.states,original.slice(os.i),chart,5000000),best=[...h.states.values()][0];const p=best?trace(best):[];origHold={...summary(h),plaintext:p.map(w=>w.map(x=>gp.translit[x]).join("")).join(" "),replay:best?String(encode(p,best.k,chart).cipher.flat())===String(original.flat()):false}}
 // Relax the single-rune opening word to the entire alphabet without
 // modifying any other word, clock, phase, or key constraint.
 const originalSingletonTrie=tries[1];
 tries[1]={e:new Map(Array.from({length:29},(_,x)=>[x,{e:new Map()}]))};
 const singletonRelaxed=advance(start(),original.slice(0,3),chart,5000000);
 tries[1]=originalSingletonTrie;
 assert(train.exact&&train.states.size===1&&String([...train.states.values()][0].k)===String(plantKey),"planted key recovery");
 assert(hold?.uniquePath&&hold.exactMatches===292&&hold.replay,"withheld control");
 assert(unknown.exact&&unknown.stop==="infeasible"&&unknown.used===3,"original prefix gate");
 return {chart,period:q,vocabulary:dict.reduce((a,b)=>a+b.size,0),plant:{key:plantKey,section:native.sections[3].name,controlStart,trainWords:ps.i,trainRunes:ps.n,totalRunes:control.flat().length,correct:summary(train),ordinary:summary(ordinary),hold},original:{chapter:"p54–55",trainWords:os.i,trainRunes:os.n,withheld:308-os.n,train:summary(unknown),singletonRelaxed:summary(singletonRelaxed),hold:origHold}};
}
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
