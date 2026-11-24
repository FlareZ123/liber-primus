"use strict";
// Progressive-cycle additive GP29 key with transparent plaintext F. Exact finite lexical CSP.
function experiment(inputs) {
 const [gp,trans,lex,native,lp1]=[JSON.parse(inputs[0]),inputs[1],inputs[2],JSON.parse(inputs[3]),inputs[4]];
 const mod=x=>(x%29+29)%29,check=(x,m)=>{if(!x)throw Error(m)};
 const map=new Map(gp.runes.map((x,i)=>[x,i])),alpha=new Map(gp.translit.map((x,i)=>[x,i]));
 const parse=(s,layout=false)=>(s.replace(layout?/[\s/%]/g:/\s/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x)));
 const originalWords=parse(trans,true).slice(0,2896),original=originalWords.slice(-66);
 check(String(originalWords.flat())===String(gp.pages.slice(0,56).flatMap(p=>p.indices)),"source");
 check(original.flat().length===308,"chapter");
 const solved=native.sections.map(x=>parse(x.source_text));
 const dict=Array.from({length:32},()=>new Map());
 const add=w=>{if(w.length&&w.length<32)dict[w.length].set(String(w),w)};
 function variants(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  function walk(i,w){if(i===s.length){add(w);return;}for(const n of [1,2,3]){const a=s.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?alpha.get("NG"):undefined):alpha.get(a);if(v!==undefined)walk(i+n,[...w,v]);}}walk(0,[]);
 }
 for(const l of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(l);if(m&&m[1].length>=2)variants(m[1]);}
 for(const s of ["A","I","O"])variants(s);for(const sec of solved)for(const w of sec)add(w);
 const tries=dict.map(d=>{const root={e:new Map()};for(const w of d.values()){let n=root;for(const x of w){if(!n.e.has(x))n.e.set(x,{e:new Map()});n=n.e.get(x);}}return root;});
 const anySingle={e:new Map(Array.from({length:29},(_,x)=>[x,{e:new Map()}]))};
 function encode(words,key,d,initial=0){const q=key.length;let t=initial;return words.map(w=>w.map(p=>{if(p===0)return 0;const c=mod(p+key[t%q]+d*Math.floor(t/q));t=(t+1)%(29*q);return c}));}
 function start(q){return new Map([["0|"+Array(q).fill(-1).join(","),{k:Array(q).fill(-1),t:0,paths:1,trace:null}]]);}
 function advance(states,words,q,d,relaxFirst=false,limit=5000000){let nodes=0,used=0;const history=[];
  for(let wi=0;wi<words.length;wi++){const cw=words[wi],root=(relaxFirst&&wi===0&&cw.length===1)?anySingle:tries[cw.length],next=new Map();let cap=false;
   for(const st of states.values()){
    const k=st.k.slice(),p=[];
    function walk(i,t,n){if(cap)return;if(++nodes>limit){cap=true;return;}
     if(i===cw.length){const id=t+"|"+k.join(","),old=next.get(id);if(old)old.paths=Math.min(2,old.paths+st.paths);else next.set(id,{k:k.slice(),t,paths:st.paths,trace:{w:p.slice(),prev:st.trace}});return;}
     const c=cw[i],phase=t%q,drift=d*Math.floor(t/q),nt=(t+1)%(29*q);
     if(c===0&&n.e.has(0)){p.push(0);walk(i+1,t,n.e.get(0));p.pop();}
     if(k[phase]!==-1){const x=mod(c-k[phase]-drift),child=n.e.get(x);if(x!==0&&child){p.push(x);walk(i+1,nt,child);p.pop();}}
     else for(const [x,child] of n.e){if(x===0)continue;k[phase]=mod(c-x-drift);p.push(x);walk(i+1,nt,child);p.pop();k[phase]=-1;}
    }
    walk(0,st.t,root);if(cap)break;
   }
   if(cap)return {states,history,nodes,used,stop:"node cap",exact:false};
   states=next;used++;history.push(states.size);if(!states.size)return {states,history,nodes,used,stop:"infeasible",exact:true};
  }return {states,history,nodes,used,stop:"complete",exact:true};
 }
 function trace(st){const out=[];for(let t=st.trace;t;t=t.prev)out.unshift(t.w);return out;}
 function freeze(words){let n=0,i=0;while(n<150&&i<words.length)n+=words[i++].length;return {i,n};}
 function sweep(cipher,q,relaxFirst=false){const split=freeze(cipher),runs=[],survivors=[];for(let d=0;d<29;d++){
   const a=advance(start(q),cipher.slice(0,split.i),q,d,relaxFirst);
   runs.push({d,stop:a.stop,used:a.used,nodes:a.nodes,states:a.states.size,history:a.history.slice(0,8)});
   if(a.exact&&a.states.size)survivors.push({d,states:a.states});
 }return {split,runs,survivors};}
 function assess(sw,cipher,q,plain=null){const result=[];for(const {d,states} of sw.survivors){
    const uniqueKeys=[...new Set([...states.values()].map(s=>String(s.k)))];
    if(uniqueKeys.length!==1||uniqueKeys[0].includes("-1")){result.push({d,uniqueKeys:uniqueKeys.length,partial:true});continue;}
    const h=advance(states,cipher.slice(sw.split.i),q,d);
    const best=[...h.states.values()][0],pred=best?trace(best):[],p=pred.flat();
    result.push({d,key:uniqueKeys[0],hold:h.stop,holdStates:h.states.size,unique:!!best&&best.paths===1&&h.states.size===1,exactMatches:plain?p.filter((x,i)=>x===plain.flat()[i]).length:null,replay:!!best&&String(encode(pred,best.k,d).flat())===String(cipher.flat()),sample:pred.slice(0,20).map(w=>w.map(x=>gp.translit[x]).join("")).join(" ")});
 }return result;}
 const q=8,controlStart=solved[3].findIndex((w,i,ws)=>w.length>=8&&ws[i+1]?.length>=6&&ws.slice(i).flat().length>=250);
 check(controlStart===135,"layout control");
 const control=solved[3].slice(controlStart),key=[23,10,1,10,9,10,16,26],drift=7,plant=encode(control,key,drift);
 const pc=sweep(plant,q),pa=assess(pc,plant,q,control);
 const oc=sweep(original,q,true),oa=assess(oc,original,q);
 // A real authentic LP1 check with the source-known WELCOME key. Select
 // a suffix using only the published printed word lengths, then derive the
 // phase-rebased key from the known solved prefix for comparison afterward.
 const welcome=solved[1],welcomeCipher=Array.from(lp1.split("$")[1]).filter(ch=>map.has(ch)).map(ch=>map.get(ch));
 check(welcomeCipher.length===welcome.flat().length,"WELCOME length");
 const wkey=Array.from("DIUINITY",s=>alpha.get(s));
 check(String(encode(welcome,wkey,0).flat())===String(welcomeCipher),"authentic WELCOME forward replay");
 let wstart=welcome.findIndex((w,i,ws)=>w.length>=7&&ws[i+1]?.length>=6&&ws.slice(i).flat().length>=150);
 let wc=null;
 if(wstart>=0){const before=welcome.slice(0,wstart).flat().length,phase=welcome.slice(0,wstart).flat().filter(x=>x!==0).length%q;let j=before;const cw=welcome.slice(wstart).map(w=>{const a=welcomeCipher.slice(j,j+w.length);j+=w.length;return a});const sw=sweep(cw,q),ass=assess(sw,cw,q,welcome.slice(wstart));wc={wordStart:wstart,knownRebasedKey:[...wkey.slice(phase),...wkey.slice(0,phase)],total:cw.flat().length,split:sw.split,runs:sw.runs,assessment:ass};}
 return {period:q,vocabulary:dict.reduce((a,b)=>a+b.size,0),model:"K[t mod 8]+d floor(t/8), t mod 232, plaintext F transparent",plant:{key,drift,controlStart,total:control.flat().length,split:pc.split,runs:pc.runs,assessment:pa},original:{chapter:"p54-55",relaxedOpeningSingleton:true,total:308,split:oc.split,runs:oc.runs,assessment:oa},authenticWelcome:wc};
}
const fs=require('node:fs'),path=require('node:path');
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/transcriptions/lp1_wulfic_canonical.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'))),null,2));
