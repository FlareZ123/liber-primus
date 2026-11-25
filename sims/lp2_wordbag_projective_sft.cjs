'use strict';
const fs=require('node:fs');
const path=require('node:path');
const load=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
function run(corpus,solved,sourceText,dictionaryText){
 const check=(ok,m)=>{if(!ok)throw Error(m)};
 const mod=x=>(x%29+29)%29,inv=Array.from({length:29},(_,x)=>x?Array.from({length:28},(_,i)=>i+1).find(y=>x*y%29===1):0);
 const rmap=new Map(corpus.runes.map((r,i)=>[r,i])),alpha=new Map(corpus.translit.map((r,i)=>[r,i]));
 const wordParser=(s,native)=>{const out=[];let w=[];for(const c of s){if(rmap.has(c))w.push(rmap.get(c));else if((native?'-.,;&$•⁘⁜ \n\r\t':'-.,;&$•⁘⁜ ').includes(c)){if(w.length)out.push(w);w=[]}}if(w.length)out.push(w);return out};
 const original=wordParser(sourceText.split('%').slice(0,55).join('%'),false);
 const native=solved.sections.flatMap(s=>wordParser(s.source_text,true));
 check(original.length===2896&&original.flat().length===12956,'source geometry');check(original.flat().join(',')===corpus.pages.slice(0,56).flatMap(p=>p.indices||[]).join(','),'canonical alignment');
 const grams=[...alpha.keys()].sort((a,b)=>b.length-a.length),aliases={K:'C',V:'U',Q:'C',Z:'S'},lex=new Map();
 function addEnglish(word){const s=word.toUpperCase().replace(/[KVQZ]/g,c=>aliases[c]);function rec(i,v){if(i===s.length){if(v.length>=8&&v.length<=14&&!lex.has(v.join(',')))lex.set(v.join(','),{v,word});return}if(v.length===14)return;if(s.startsWith('ING',i)&&alpha.has('NG'))rec(i+3,[...v,alpha.get('NG')]);if(s.startsWith('IO',i)&&alpha.has('IA'))rec(i+2,[...v,alpha.get('IA')]);for(const g of grams)if(s.startsWith(g,i))rec(i+g.length,[...v,alpha.get(g)])}rec(0,[])}
 for(const line of dictionaryText.split('\n')){const m=/^([a-z]+) (\d+)$/.exec(line.trim());if(m)addEnglish(m[1])}
 for(const v of native)if(v.length>=8&&v.length<=14)lex.set(v.join(','),{v,word:v.map(x=>corpus.translit[x]).join('')});
 const bag=v=>v.slice().sort((a,b)=>a-b).join(',');
 // Exact affine orbit fingerprint; all maximum-count anchors, then all
 // maximum-count remaining anchors. Their multiplicities are affine invariant.
 function canonical(v){if(!v.length)return {key:'empty',a:0,b:1};const count=Array(29).fill(0);for(const x of v)count[x]++;const occupied=count.map((n,x)=>n?x:-1).filter(x=>x>=0);if(occupied.length===1)return {key:'one:'+v.length,a:occupied[0],b:1};let best=null;const m=Math.max(...count);for(const a of occupied.filter(x=>count[x]===m)){const second=Math.max(...occupied.filter(x=>x!==a).map(x=>count[x]));for(const z of occupied.filter(x=>x!==a&&count[x]===second)){const b=mod(z-a),u=inv[b];const q=v.map(x=>mod((x-a)*u)).sort((x,y)=>x-y);const key=String.fromCharCode(...q.map(x=>65+x));if(best===null||key<best.key)best={key,a,b}}}return best}
 const index=[new Map(),new Map()];
 for(const e of lex.values()){for(let held=0;held<=1;held++){const f=held?e.v.filter(x=>x===0).length:0,v=held?e.v.filter(x=>x!==0):e.v,k=f+':'+canonical(v).key;const arr=index[held].get(k)||[];arr.push(e);index[held].set(k,arr)}}
 const modes=['affine','finite','patched','affineHeld','finiteHeld','patchedHeld'];
 function search(c,mode){const held=mode.endsWith('Held')?1:0,base=mode.replace('Held',''),fcount=c.filter(x=>x===0).length,out=new Map();
 for(let f=0;f<=(held?fcount:0);f++){let left=f;const v=c.filter(x=>x!==0||left--<=0);for(let pole=-1;pole<(base==='affine'?0:29);pole++){if(base==='finite'&&pole>=0&&v.includes(pole))continue;const w=pole<0?v:v.map(x=>inv[mod(x-pole)]),can=canonical(w);for(const e of index[held].get(f+':'+can.key)||[]){const pv=held?e.v.filter(x=>x!==0):e.v,cp=canonical(pv);const rec=w.map(x=>mod(cp.a+cp.b*inv[can.b]*mod(x-can.a)));check(bag(rec)===bag(pv),'candidate exact transformed bag');if(!out.has(e.v.join(',')))out.set(e.v.join(','),{word:e.word,runes:e.v,pole,f,decoderA:mod(cp.a-cp.b*inv[can.b]*can.a),decoderB:mod(cp.b*inv[can.b])})}}}return out}
 let seed=0x3301;const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};function shuffle(v){v=v.slice();for(let i=v.length-1;i;i--){const j=rand()%(i+1);[v[i],v[j]]=[v[j],v[i]]}return v}
 // Validate orbit fingerprint against arbitrary affine permutations and distinct multisets.
 let controls=0,poleHits=0;for(const p of native.filter(v=>v.length>=8&&v.length<=14)){for(const mode of modes){const held=mode.endsWith('Held'),base=mode.replace('Held',''),v=held?p.filter(x=>x!==0):p;const a=rand()%29,b=1+rand()%28,pole=base==='finite'?Array.from({length:29},(_,i)=>i).find(x=>!v.includes(x)):v[0];const enc=x=>base==='affine'?mod(a+b*x):mod(a+b*inv[mod(x-pole)]);const dec=y=>base==='affine'?mod((y-a)*inv[b]):mod(pole+b*inv[mod(y-a)]);const consumed=v.map(enc);check(consumed.every((x,i)=>dec(x)===v[i]),'planted inverse');if(base==='patched')poleHits++;const c=shuffle([...consumed,...(held?p.filter(x=>x===0):[])]);check(search(c,mode).has(p.join(',')),'native plant '+mode);controls++}}
 const counts={},hits={};for(const m of modes)hits[m]=[];
 for(let i=0;i<original.length;i++){const c=original[i],n=c.length;if(n<8)continue;const row=counts[n]??={total:0,...Object.fromEntries(modes.map(m=>[m,0]))};row.total++;for(const m of modes){const result=search(c,m);if(result.size){row[m]++;hits[m].push({i,n,cipher:c.map(x=>corpus.translit[x]).join(''),candidates:result.size,examples:[...result.values()].slice(0,6)})}}}
 return {lex:lex.size,controls,poleHits,counts,hits};
}
console.log(JSON.stringify(run(JSON.parse(load("resources/liber-primus/lp2-corpus.json")),JSON.parse(load("resources/external/relikd-solved-gp29-native-v1.json")),load("resources/liber-primus/lp2-transcription.txt"),load("resources/control/english_wordfreq_textblob.txt")),null,2));
