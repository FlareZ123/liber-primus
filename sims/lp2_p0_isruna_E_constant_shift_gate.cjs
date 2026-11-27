#!/usr/bin/env node
'use strict';

const fs=require('fs');
const corpus=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const transcript=fs.readFileSync('resources/liber-primus/lp2-transcription.txt','utf8');
const lexText=fs.readFileSync('resources/control/english_wordfreq_textblob.txt','utf8');

const T=corpus.translit, val=new Map(T.map((x,i)=>[x,i]));
const compounds=['ING','TH','NG','EO','OE','AE','IA','EA'];
function gpWord(s){
  s=s.toUpperCase(); const a=[];
  for(let p=0;p<s.length;){
    const tok=compounds.find(x=>s.startsWith(x,p))||s[p];
    const v=val.get(tok==='ING'?'NG':tok);
    if(v===undefined)return null;
    a.push(v);p+=tok.length;
  }
  return a;
}
const lex=new Map();
for(const w of (lexText.match(/[A-Za-z]+/g)||[])){
  const a=gpWord(w); if(!a)continue;
  const k=a.join(',');
  if(!lex.has(k))lex.set(k,[]);
  if(lex.get(k).length<4)lex.get(k).push(w.toUpperCase());
}
const ix=new Map(corpus.runes.map((r,i)=>[r,i])),groups=[];let g=[];
for(const ch of [...transcript.split('%')[0]]){
  if(ix.has(ch))g.push(ix.get(ch));
  else if('-.$'.includes(ch)&&g.length){groups.push(g);g=[];}
}
if(g.length)groups.push(g);
if(groups.length!==59)throw Error('p0 group count changed');
const title=groups.slice(0,2),black=groups.slice(2);
if(title[0][2]!==18||title[1][2]!==18)throw Error('red title third-rune E observation changed');
const render=a=>a.map(x=>T[x]).join('');
function score(delta){
  const hits=[];
  for(let i=0;i<black.length;i++){
    const p=black[i].map(x=>(x+delta)%29),words=lex.get(p.join(','));
    if(words)hits.push({group:i+2,length:p.length,decoded:render(p),lex:words});
  }
  return {delta,exact:hits.length,long:hits.filter(x=>x.length>=4).length,
    longRunes:hits.filter(x=>x.length>=4).reduce((s,x)=>s+x.length,0),hits};
}
const all=Array.from({length:29},(_,d)=>score(d));
const ranked=[...all].sort((a,b)=>b.longRunes-a.longRunes||b.long-a.long||b.exact-a.exact||a.delta-b.delta);
const e=18,subDelta=(29-e)%29,addDelta=e;
console.log(JSON.stringify({
  source_selector:{historical_coordinate:'Salzburg Isruna 3/3',selected_plain_symbol:'E',gp_index:e,
    title_words:title.map(render),title_third_runes:title.map(w=>T[w[2]])},
  candidate_family:'P=(C +/- E) mod29, constant shift only',
  E_subtract:{...all[subDelta],decoded_title:title.map(w=>render(w.map(x=>(x+subDelta)%29)))},
  E_add:{...all[addDelta],decoded_title:title.map(w=>render(w.map(x=>(x+addDelta)%29)))},
  all_shift_rank:ranked.map(x=>({delta:x.delta,exact:x.exact,long:x.long,longRunes:x.longRunes})),
  decision:'Neither E direction yields a >=4-rune lexicon word or a readable title. Do not enlarge this into a keyed Caesar/Vigenere search without a new operation selector.'
},null,2));