"use strict";
// Exact lexical CSP for arbitrary cyclewise common shifts with transparent F.
function experiment(inputs) {
 const [gp,trans,lex,native]=[JSON.parse(inputs[0]),inputs[1],inputs[2],JSON.parse(inputs[3])],mod=x=>(x%29+29)%29,check=(x,m)=>{if(!x)throw Error(m)};
 const map=new Map(gp.runes.map((x,i)=>[x,i])),alpha=new Map(gp.translit.map((x,i)=>[x,i]));
 const parse=(s,layout=false)=>((layout?s.replace(/[\s/%]/g,""):s).match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x)));
 const originalWords=parse(trans,true).slice(0,2896),original=originalWords.slice(-66);
 check(String(originalWords.flat())===String(gp.pages.slice(0,56).flatMap(p=>p.indices)),"source");check(original.flat().length===308,"chapter");
 const solved=native.sections.map(x=>parse(x.source_text)),dict=Array.from({length:32},()=>new Map());
 const add=(w,f)=>{if(w.length&&w.length<32){const id=String(w),old=dict[w.length].get(id);if(!old||f>old.f)dict[w.length].set(id,{w,f});}};
 function variants(word,f){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function walk(i,w){if(i===s.length){add(w,f);return;}for(const n of [1,2,3]){const a=s.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?alpha.get("NG"):undefined):alpha.get(a);if(v!==undefined)walk(i+n,[...w,v]);}}walk(0,[]);}
 for(const l of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(l);if(m)variants(m[1],Number(m[2]));}
 for(const s of ["A","I","O"])variants(s,1);for(const sec of solved)for(const w of sec)add(w,1);
 const tries=dict.map(d=>{const root={e:new Map()};let total=0;for(const {w,f} of d.values())total+=f;for(const {w,f} of d.values()){let n=root;for(const x of w){if(!n.e.has(x))n.e.set(x,{e:new Map()});n=n.e.get(x);}n.score=Math.log(f/total);}return root;});
 function encode(words,key,G,initial=0){const q=key.length;let t=initial;return words.map(w=>w.map(p=>{if(p===0)return 0;const c=mod(p+key[t%q]+G[Math.floor(t/q)]);t++;return c}));}
 function start(q,s){return new Map([[s+"|0|"+Array(q).fill(-1).join(","),{k:Array(q).fill(-1),ph:s,g:0,paths:1,score:0,trace:null,initial:s}]]);}
 function advance(states,words,q,limit=5000000){let nodes=0,used=0;const history=[];
  for(let wi=0;wi<words.length;wi++){const cw=words[wi],root=tries[cw.length],next=new Map();let cap=false;
   for(const st of states.values()){
    const k=st.k.slice(),p=[];
    function walk(i,ph,g,n){if(cap)return;if(++nodes>limit){cap=true;return;}
     if(i===cw.length){const id=ph+"|"+g+"|"+k.join(","),old=next.get(id),score=st.score+n.score,paths=Math.min(2,(old?.paths||0)+st.paths);
      if(!old||score>old.score)next.set(id,{k:k.slice(),ph,g,paths,score,trace:{w:p.slice(),prev:st.trace},initial:st.initial});else old.paths=paths;return;}
     const c=cw[i],np=(ph+1)%q,ng=x=>np===0?-1:x;
     if(c===0&&n.e.has(0)){p.push(0);walk(i+1,ph,g,n.e.get(0));p.pop();}
     if(k[ph]>=0&&g>=0){const x=mod(c-k[ph]-g),child=n.e.get(x);if(x!==0&&child){p.push(x);walk(i+1,np,ng(g),child);p.pop();}}
     else for(const [x,child] of n.e){if(x===0)continue;p.push(x);
      if(k[ph]>=0){const gg=mod(c-x-k[ph]);walk(i+1,np,ng(gg),child);}
      else if(g>=0){k[ph]=mod(c-x-g);walk(i+1,np,ng(g),child);k[ph]=-1;}
      else{for(let gg=0;gg<29;gg++){k[ph]=mod(c-x-gg);walk(i+1,np,ng(gg),child);if(cap)break;}k[ph]=-1;}
      p.pop();if(cap)break;}
    }
    walk(0,st.ph,st.g,root);if(cap)break;
   }
   if(cap)return {states,history,nodes,used,stop:"node cap",exact:false};
   states=next;used++;history.push(states.size);if(!states.size)return {states,history,nodes,used,stop:"infeasible",exact:true};
  }return {states,history,nodes,used,stop:"complete",exact:true};
 }
 function trace(st){const out=[];for(let t=st.trace;t;t=t.prev)out.unshift(t.w);return out;}
 function freeze(words){let n=0,i=0;const target=Math.min(150,Math.floor(words.flat().length*0.60));while(n<target&&i<words.length)n+=words[i++].length;return {i,n};}
 function replay(cipher,pred,key,initial){let t=initial;const G=[];const C=cipher.flat(),P=pred.flat();if(C.length!==P.length)return false;for(let i=0;i<C.length;i++){if(P[i]===0){if(C[i]!==0)return false;continue;}const g=mod(C[i]-P[i]-key[t%key.length]),j=Math.floor(t/key.length);if(G[j]!==undefined&&G[j]!==g)return false;G[j]=g;t++;}return String(encode(pred,key,G,initial).flat())===String(C);}
 function attack(cipher,q,phases,plain=null,expected=null){const split=freeze(cipher),runs=[],prefix=[];for(const s of phases){const a=advance(start(q,s),cipher.slice(0,split.i),q);runs.push({s,stop:a.stop,used:a.used,nodes:a.nodes,states:a.states.size,history:a.history.slice(0,12)});if(a.exact&&a.states.size)prefix.push(...a.states.values());}
  prefix.sort((a,b)=>b.score-a.score);let held=null;if(prefix.length){const best=prefix[0],sameKey=prefix.filter(x=>String(x.k)===String(best.k)&&x.initial===best.initial);const st=new Map(sameKey.map(x=>[x.ph+"|"+x.g+"|"+x.k.join(","),x]));const h=advance(st,cipher.slice(split.i),q),hs=[...h.states.values()].sort((a,b)=>b.score-a.score),winner=hs[0],p=winner?trace(winner):[],P=plain?.flat();held={prefixScore:best.score,initial:best.initial,key:best.k,keyMatches:expected?best.k.filter((x,i)=>x===expected[i]).length:null,prefixKeyCount:new Set(prefix.map(x=>String(x.k))).size,holdStop:h.stop,holdStates:h.states.size,paths:winner?.paths,fullScore:winner?.score,exactMatches:P?p.flat().filter((x,i)=>x===P[i]).length:null,holdMatches:P?p.flat().slice(split.n).filter((x,i)=>x===P[split.n+i]).length:null,replay:!!winner&&replay(cipher,p,winner.k,winner.initial),sample:p.slice(0,24).map(w=>w.map(x=>gp.translit[x]).join("")).join(" ")};}
  return {split,runs,held};}
 const q=8,controlStart=solved[3].findIndex((w,i,ws)=>w.length>=8&&ws[i+1]?.length>=6&&ws.slice(i).flat().length>=250);check(controlStart===135,"control");
 const control=solved[3].slice(controlStart),K=[4,27,15,8,21,0,12,19],initial=3,G=Array.from({length:50},(_,i)=>mod(13*i*i*i+17*i+9)),plant=encode(control,K,G,initial),expected=K.map(x=>mod(x+G[0]));
 const pc=attack(plant,q,Array.from({length:q},(_,i)=>i),control,expected);
 const oc=attack(original.slice(1),q,Array.from({length:q},(_,i)=>i));
 const q13=13,cs13=solved[4].findIndex((w,i,ws)=>w.length>=13&&ws[i+1]?.length>=6&&ws.slice(i).flat().length>=250);check(cs13===5,"L13 layout control");
 const control13=solved[4].slice(cs13),K13=[17,4,26,11,2,8,21,0,15,5,19,7,27],initial13=5,G13=Array.from({length:100},(_,i)=>mod(7*i*i*i+11*i+16)),plant13=encode(control13,K13,G13,initial13),expected13=K13.map(x=>mod(x+G13[0]));
 const pc13=attack(plant13,q13,Array.from({length:q13},(_,i)=>i),control13,expected13);
 const anchor13=original.findIndex(w=>w.length===Math.max(...original.map(x=>x.length)));check(anchor13===56,"unique original longest word");
 const oc13=attack(original.slice(anchor13),q13,Array.from({length:q13},(_,i)=>i));
 return {vocabulary:dict.reduce((a,b)=>a+b.size,0),q8:{period:q,plant:{controlStart,total:control.flat().length,key:K,expected,initial,...pc},original:{chapter:"p54-55 after opening singleton",total:original.slice(1).flat().length,...oc}},q13:{period:q13,plant:{controlStart:cs13,total:control13.flat().length,key:K13,expected:expected13,initial:initial13,...pc13},original:{chapter:"p54-55 unique longest word suffix",anchor:anchor13,total:original.slice(anchor13).flat().length,...oc13}}};
}
const fs=require('node:fs'),path=require('node:path');
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'))),null,2));
