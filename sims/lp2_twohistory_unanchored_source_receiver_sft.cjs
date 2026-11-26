"use strict";
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const files=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/blake_song_of_liberty_train.txt"];
const root=path.resolve(__dirname,"..");
const inputs=files.map(p=>{const b=fs.readFileSync(path.join(root,p));return {path:p,sha:crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex"),source:b.toString("utf8")}});
function experiment(inputs){
 const gp=JSON.parse(inputs[0].source),tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),W=650,T=450;
 function native(s){const a=[];for(const w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(x=>w.startsWith(x.s,i));if(!t)throw Error(w);a.push(t.i);i+=t.s.length}}}return Uint8Array.from(a)}
 const donors=inputs.slice(1).map(x=>({name:x.path,tape:native(x.source)}));
 const starts=[0,3,8,15,23,27,33,40,54,56];
 function layout(pages){let C=[],states=[];for(const p of pages)for(let j=0;j<p.length;j++){C.push(p[j]);states.push(j<2?-1:p[j-2]*29+p[j-1])}return {C,states}}
 const chapters=starts.slice(0,-1).map((p,i)=>({name:`p${p}-${starts[i+1]-1}`,...layout(gp.pages.filter(x=>x.page>=p&&x.page<starts[i+1]&&x.indices.length).map(x=>x.indices))}));
 function prepare(L,start,n){const rows=new Map(),eq=[],ne=[];for(let i=0;i<n;i++){const s=L.states[start+i],c=L.C[start+i];if(s<0)continue;let r=rows.get(s);if(!r){r=new Map();rows.set(s,r)}if(r.has(c))eq.push(r.get(c),i);else r.set(c,i);}for(const r of rows.values()){const e=[...r.values()];for(let j=0;j<e.length;j++)for(let k=j+1;k<e.length;k++)ne.push(e[j],e[k])}return{eq,ne}}
 function valid(t,o,x){for(let j=0;j<x.eq.length;j+=2)if(t[o+x.eq[j]]!==t[o+x.eq[j+1]])return false;for(let j=0;j<x.ne.length;j+=2)if(t[o+x.ne[j]]===t[o+x.ne[j+1]])return false;return true}
 function index(t){const cache=new Map();return d=>{if(cache.has(d))return cache.get(d);const a=[];for(let i=0;i+d<t.length;i++)if(t[i]===t[i+d])a.push(i);const b=Int32Array.from(a);cache.set(d,b);return b}}
 const selected=[];for(const L of chapters)for(let start=0;start+W<=L.C.length;start++)if(!prepare(L,start,T).eq.length)selected.push({chapter:L.name,start,full:prepare(L,start,W)});
 if(selected.length!==187)throw Error("unanchored window count");
 const output=[];
 for(const d of donors){const t=d.tape,max=t.length-W,idx=index(t);let alignments=0,fullAnchorWindows=0,directWindows=0,enumerated=0,fullMatches=0,best=null;for(const x of selected){alignments+=max+1;const a=x.full.eq;if(a.length){fullAnchorWindows++;let ls=null,first=0;for(let i=0;i<a.length;i+=2){const q=idx(a[i+1]-a[i]);if(ls===null||q.length<ls.length){ls=q;first=a[i]}}for(const pos of ls){const o=pos-first;if(o<0||o>max)continue;enumerated++;if(valid(t,o,x.full)){fullMatches++;best??={chapter:x.chapter,cipherOffset:x.start,donorOffset:o}}}}else{directWindows++;for(let o=0;o<=max;o++){enumerated++;if(valid(t,o,x.full)){fullMatches++;best??={chapter:x.chapter,cipherOffset:x.start,donorOffset:o}}}}}output.push({donor:d.name,alignments,fullAnchorWindows,directWindows,enumerated,fullMatches,best})}
 return {window:W,training:T,unanchoredCipherWindows:selected.length,inputs:inputs.map(({path,sha})=>({path,sha})),output};
}
console.log(JSON.stringify(experiment(inputs),null,2));
