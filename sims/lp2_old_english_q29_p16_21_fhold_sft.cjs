'use strict';
const fs=require('node:fs'),path=require('node:path');
const {createSolver,encode}=require('./lp2_fhold_word_relation_csp.cjs');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const trans=read('resources/liber-primus/lp2-transcription.txt');
const native=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const poem=read('resources/external/dickins1915-rune-poem-old-english.txt');
const beowulf=read('resources/external/beowulf9701-old-english-verse.txt');
const assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29;
const map=new Map(gp.runes.map((r,i)=>[r,i])),alpha=new Map(gp.translit.map((s,i)=>[s,i]));
const dig=['TH','EO','EA','NG','OE','AE','IA'];
function normalize(s){return s.toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/[\[\]]/g,'').replace(/(?<=\p{L})[-‐‑](?=\p{L})/gu,'').match(/\p{L}+/gu)||[]}
function token(w){let s=w.replace(/[þð]/g,'th').replace(/æ/g,'ae').replace(/œ/g,'oe').replace(/ƿ/g,'w').replace(/k/g,'c').replace(/io/g,'ia').toUpperCase(),out=[];while(s){let t=dig.find(d=>s.startsWith(d))||s[0];assert(alpha.has(t),'unmapped OE token '+t+' in '+w);out.push(alpha.get(t));s=s.slice(t.length)}return out}
const P=normalize(poem),B=normalize(beowulf),pw=P.map(token),bw=B.map(token);
assert(poem.trim().split(/\n\n+/).length===29,'29 stanzas');
assert(beowulf.trim().split('\n').length===3184,'3184 verse lines');
const dict=Array.from({length:32},()=>new Map()),labels=new Map();
for(const w of [...P,...B]){const p=token(w);assert(p.length<32,'word too long');dict[p.length].set(String(p),p);if(!labels.has(String(p)))labels.set(String(p),w)}
const flat=x=>x.flat(),n=x=>flat(x).length;
const pages=trans.split('%').map(s=>(s.match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x))));
assert(pages.length===57,'page segment count');
const orig=pages.slice(0,56).flat();
assert(String(flat(orig))===String(gp.pages.flatMap(p=>p.indices)),'exact full original parse');
const fit=pages.slice(16,20).flat(),hold=pages.slice(20,22).flat(),target=fit.concat(hold);
assert(fit.length===290&&n(fit)===1071,'frozen p16-19 fit');
assert(hold.length===131&&n(hold)===542,'frozen p20-21 holdout');
assert(n(target)===1613&&target.length===421,'frozen p16-21 target');
const solver=createSolver(29,dict),rng=seed=>()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296};
function take(ws,offset,len){let i=offset,s=0;while(s<len&&i<ws.length)s+=ws[i++].length;assert(s>=len,'donor length');return ws.slice(offset,i)}
function cut(ws,lim){let i=0,s=0;while(s<lim&&i<ws.length)s+=ws[i++].length;return i}
function lm(ws){const u=Array(29).fill(.5),bi=Array.from({length:29},()=>Array(29).fill(.3)),tri=Array.from({length:841},()=>Array(29).fill(.1));let x=flat(ws);for(let i=0;i<x.length;i++){u[x[i]]++;if(i)bi[x[i-1]][x[i]]++;if(i>1)tri[x[i-2]*29+x[i-1]][x[i]]++}const bu=u.reduce((a,b)=>a+b,0),bb=bi.map(v=>v.reduce((a,b)=>a+b,0)),bt=tri.map(v=>v.reduce((a,b)=>a+b,0));return p=>{let s=0,x=flat(p);for(let i=0;i<x.length;i++)s+=Math.log(i===0?u[x[i]]/bu:i===1?bi[x[i-1]][x[i]]/bb[x[i-1]]:tri[x[i-2]*29+x[i-1]][x[i]]/bt[x[i-2]*29+x[i-1]]);return s/x.length}}
const score=lm([...pw,...bw]);
const summ=s=>({nkeys:s.keys.length,keys:s.keys.map(x=>({key:x.key,paths:x.paths,endPhases:x.endPhases})),exact:s.exact,exhausted:s.exhausted,nodes:s.nodes,passes:s.passes,initialRows:s.initialRows,rowVisits:s.rowVisits,failure:s.failure});
function plant(name,words,seed,eng,dict0,score0){const random=rng(seed),key=Array.from({length:29},()=>Math.floor(random()*29)),c=encode(words,key),i=cut(c,205),s=eng.solve(c.slice(0,i),{limit:3000}),out={name,seed,key,trainRunes:n(c.slice(0,i)),heldRunes:n(c.slice(i)),cipherF:flat(c).filter(x=>!x).length,plainF:flat(words).filter(x=>!x).length,result:summ(s)};if(s.exact&&s.keys.length===1){let recovered=s.keys[0];out.keyCorrect=String(recovered.key)===String(key);const full=eng.solve(c,{fixed:recovered.key,limit:3000});out.full=summ(full);if(full.keys.length===1){const p=full.keys[0].p;out.replay=String(flat(encode(p,recovered.key)))===String(flat(c));out.heldCorrect=flat(p.slice(i)).filter((v,j)=>v===flat(words.slice(i))[j]).length;out.heldScore=score0(p.slice(i));}}return out}
const plants=[
 plant('Dickins stanzas opening',take(pw,0,310),0x255801,solver,dict,score),
 plant('Beowulf opening',take(bw,0,310),0x255802,solver,dict,score),
 plant('Beowulf midpoint',take(bw,Math.floor(bw.length/2),310),0x255803,solver,dict,score)
];
const english=native.sections.map(s=>(s.source_text.match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x))));
const enDict=Array.from({length:32},()=>new Map());for(const p of english.flat())if(p.length<32)enDict[p.length].set(String(p),p);
const englishPlant=plant('Solved native English KOAN1',take(english[3],0,310),0x255804,createSolver(29,enDict),enDict,lm(english.flat()));
const initial=solver.solve(fit,{limit:3000});
const original={fitPages:[16,17,18,19],holdoutPages:[20,21],fitWords:fit.length,holdoutWords:hold.length,fitRunes:n(fit),holdoutRunes:n(hold),result:summ(initial)};
if(initial.exact&&initial.keys.length===1){
 const key=initial.keys[0].key,full=solver.solve(target,{fixed:key,limit:3000});
 original.frozenKey=key;original.full=summ(full);
 if(full.keys.length===1){
  const p=full.keys[0].p;
  original.plaintext=p.map(w=>labels.get(String(w))||w.map(v=>gp.translit[v]).join('')).join(' ');
  original.holdoutScore=score(p.slice(fit.length));
  original.forwardReplay=String(flat(encode(p,key)))===String(flat(target));
  original.holdoutWords=p.slice(fit.length).length;
 }
}
const shuffled=[];
for(let seed=0;seed<12;seed++){
 const random=rng(0x257010+seed),a=flat(fit);
 for(let j=a.length-1;j>0;j--){const k=Math.floor(random()*(j+1));[a[j],a[k]]=[a[k],a[j]]}
 let pos=0;const ws=fit.map(w=>{const r=a.slice(pos,pos+w.length);pos+=w.length;return r});
 shuffled.push({seed,result:summ(solver.solve(ws,{limit:3000}))});
}
process.stdout.write(JSON.stringify({
 source:{poemWords:P.length,poemRunes:n(pw),beowulfWords:B.length,beowulfRunes:n(bw),oldEnglishDictionary:dict.reduce((s,d)=>s+d.size,0),englishDictionary:enDict.reduce((s,d)=>s+d.size,0)},
 frozenModel:{period:29,phase:0,plaintextF:'transparent/no advance',cipher:'C=P+K mod29',normalization:'unchanged from #2558'},
 plants,englishPlant,original,shuffled
},null,2)+'\n');
