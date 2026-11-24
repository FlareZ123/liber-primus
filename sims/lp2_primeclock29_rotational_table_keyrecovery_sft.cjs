"use strict";
// LP2 exact 29-state plaintext-prime clock table inference.
function experiment(files){
 const [ct,tx,lex,plain]=files,corpus=JSON.parse(ct),rmap=new Map(corpus.runes.map((r,i)=>[r,i]));
 const mod=x=>(x%29+29)%29,weights=corpus.prime.map(mod),toks=corpus.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
 const words=[];let acc=[],page=0,start=0,last=0;
 function flush(){if(acc.length){words.push({a:acc,start,end:last});acc=[]}}
 for(const c of tx.split("%").slice(0,55).join("%")){if(rmap.has(c)){if(!acc.length)start=page;acc.push(rmap.get(c));last=page}else if(c==="%")page++;else if(c!=="/"&&!/\s/u.test(c))flush()}flush();
 if(words.length!==2896||words.filter(w=>w.start!==w.end).length!==32||words.flatMap(w=>w.a).join(",")!==corpus.pages.slice(0,56).flatMap(p=>p.indices).join(","))throw Error("source mismatch");
 /** @param {string} w */
 function enc(w){let t=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S"),a=[];
 for(let i=0;i<t.length;){if(t.startsWith("ING",i)){a.push(21);i+=3}else if(t.startsWith("IO",i)){a.push(27);i+=2}else{const z=toks.find(([s])=>t.startsWith(s,i));if(!z)return null;a.push(z[1]);i+=z[0].length}}return a}
 const vocab=new Map();function add(a,f,w){if(!a||!a.length)return;const id=a.join(","),v=vocab.get(id);if(!v||v.f<f)vocab.set(id,{a,f,w})}
 for(const l of lex.split(/\r?\n/)){const m=l.match(/^([a-z]+) (\d+)$/);if(m)add(enc(m[1]),+m[2],m[1])}
 for(const w of plain.split("### 56")[0].match(/[A-Z]+/g))add(enc(w),1,w.toLowerCase());
 const parable=tx.split("%").at(-1).replace(/[/\s]/g,"").match(/[\u16a0-\u16ff]+/g).map(s=>Array.from(s,r=>rmap.get(r)));
 for(const a of parable)add(a,1,a.map(i=>corpus.translit[i]).join("").toLowerCase());
 const byLen=new Map,totals=new Map,roots=new Map;
 for(const v of vocab.values()){if(!byLen.has(v.a.length))byLen.set(v.a.length,[]);byLen.get(v.a.length).push(v);totals.set(v.a.length,(totals.get(v.a.length)||0)+v.f)}
 for(const [l,vs] of byLen){const root={n:[],v:null};roots.set(l,root);for(const v of vs){let n=root;for(const p of v.a){if(!n.n[p])n.n[p]={n:[],v:null};n=n.n[p]}n.v=v}}
 let seed=0x33012902;const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
 function sample(l){const vs=byLen.get(l),tot=totals.get(l);let r=rng()%tot;for(const v of vs){r-=v.f;if(r<0)return v.a}throw Error("sample")}
 function encipher(ws,key,s=0){return ws.map(a=>a.map(p=>{const c=mod(p+key[s]);s=mod(s+weights[p]);return c}))}
 function decipher(ws,key,s){const out=[];for(const a of ws){let z=[];for(const c of a){if(key[s]<0)return {out,s,complete:false};const p=mod(c-key[s]);z.push(p);s=mod(s+weights[p])}out.push(z)}return {out,s,complete:true}}
 /** Build all exact partial keys for one word with initial state normalized to zero. */
 function mappings(c){const out=new Map;for(const v of byLen.get(c.length)||[]){const k=new Int8Array(29).fill(-1);let s=0,ok=true;for(let j=0;j<c.length;j++){const p=v.a[j],d=mod(c[j]-p);if(k[s]>=0&&k[s]!==d){ok=false;break}k[s]=d;s=mod(s+weights[p])}if(ok){const id=k.join(",");if(!out.has(id))out.set(id,{k,entries:[...k].flatMap((v,i)=>v<0?[]:[[i,v]])})}}return [...out.values()]}
 /** Join all allowed relative starting-state rotations; a cap is an explicit incomplete search. */
 function combine(active,other,cap=100000){const next=new Map;for(const a of active)for(const b of other)for(let offset=0;offset<29;offset++){
 let ok=true;for(const [i,v] of b.entries){const at=(i+offset)%29;if(a[at]>=0&&a[at]!==v){ok=false;break}}
 if(!ok)continue;const k=a.slice();for(const [i,v] of b.entries)k[(i+offset)%29]=v;const id=k.join(",");if(!next.has(id)){next.set(id,k);if(next.size>cap)return null}
 }return [...next.values()]}
 function recover(ws,minLen=10,cap=100000){
 const anchors=ws.map((a,i)=>({a,i})).filter(v=>v.a.length>=minLen).map(v=>({...v,maps:mappings(v.a)})).sort((a,b)=>a.maps.length-b.maps.length||b.a.length-a.a.length||a.i-b.i);
 let states=null,history=[],pending=anchors.slice();while(pending.length){
 let picked=-1,next=null;for(let j=0;j<pending.length;j++){const a=pending[j],n=states===null?a.maps.map(x=>x.k):combine(states,a.maps,cap);if(n!==null){picked=j;next=n;break}}
 if(picked<0)return {states,history,overflow:true,remaining:pending.length,anchors:anchors.length};
 const a=pending.splice(picked,1)[0];states=next;history.push({word:a.i,length:a.a.length,maps:a.maps.length,merged:states.length,minKnown:states.length?Math.min(...states.map(k=>[...k].filter(x=>x>=0).length)):0});if(!states.length)break;
 }return {states:states||[],history,overflow:false,remaining:pending.length,anchors:anchors.length}
 }
 /** Exact trie-based training continuation, with no score pruning or unknown-state guessing. */
 function refine(ws,keys,cap=100000){
 let states=keys.flatMap(k=>Array.from({length:29},(_,s)=>({k,s,start:s}))),history=[];
 for(let i=0;i<ws.length;i++){
 const c=ws[i],root=roots.get(c.length),next=new Map;let overflow=false;
 for(const st of states){const k=st.k.slice();
 function walk(j,s,node){
 if(overflow)return;
 if(j===c.length){if(node.v){const id=k.join(",")+":"+s+":"+st.start;if(!next.has(id)){next.set(id,{k:k.slice(),s,start:st.start});if(next.size>cap)overflow=true}}return}
 const old=k[s];if(old>=0){const p=mod(c[j]-old),child=node.n[p];if(child)walk(j+1,mod(s+weights[p]),child);return}
 for(let p=0;p<node.n.length;p++)if(node.n[p]){k[s]=mod(c[j]-p);walk(j+1,mod(s+weights[p]),node.n[p]);k[s]=-1}
 }
 if(root)walk(0,st.s,root);if(overflow)return {states,history,overflow:true}
 }
 states=[...next.values()];history.push(states.length);if(!states.length)break;
 }return {states,history,overflow:false}
 }
 const chEnds=[2,7,14,22,26,32,39,53,55],phy=p=>p>=50?p+1:p,ch=p=>chEnds.findIndex(end=>phy(p)<=end);
 const chapters=Array.from({length:9},(_,i)=>words.filter(w=>ch(w.start)===i&&ch(w.end)===i).map(w=>w.a));
 const controls=[],originals=[];
 for(const j of [1,3,7]){
 const native=chapters[j].map(a=>sample(a.length)),key=Array.from({length:29},()=>rng()%29),cipher=encipher(native,key),n=Math.ceil(cipher.length/2),train=cipher.slice(0,n);
 const r=recover(train,10),f=refine(train,r.states),full=f.states.filter(v=>!v.k.includes(-1));
 const holdouts=full.map(chosen=>{const dec=decipher(cipher.slice(n),chosen.k,chosen.s),tr=decipher(train,chosen.k,chosen.start);
 return {complete:dec.complete,runes:dec.out.flat().length,exact:dec.out.flat().join(",")===native.slice(n).flat().join(","),trainExact:tr.out.flat().join(",")===native.slice(0,n).flat().join(","),replay:encipher(tr.out.concat(dec.out),chosen.k,chosen.start).flat().join(",")===cipher.flat().join(","),key:[...chosen.k],start:chosen.start,rotationMatch:[...chosen.k].every((v,i)=>v===key[mod(i-chosen.start)])}
 });
 if(!holdouts.some(h=>h.exact&&h.trainExact&&h.replay&&h.rotationMatch))throw Error("true plant missing");
 controls.push({chapter:j,trainWords:n,anchors:r.anchors,anchorHistory:r.history,anchorOverflow:r.overflow,refineOverflow:f.overflow,refineCounts:f.history,fullKeys:full.length,holdouts})
 }
 for(let j=0;j<chapters.length;j++){const ws=chapters[j],r=recover(ws,10);originals.push({chapter:j,words:ws.length,history:r.history,anchors:r.anchors,overflow:r.overflow,remaining:r.remaining,states:r.states.length})}
 const all=recover(words.map(w=>w.a),10);return {vocab:vocab.size,weights,controls,originals,global:{history:all.history,anchors:all.anchors,overflow:all.overflow,remaining:all.remaining,states:all.states.length}};
}
const fs = require('node:fs');
const path = require('node:path');
const paths = ["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp1-plaintext-reference.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'))),null,2));
