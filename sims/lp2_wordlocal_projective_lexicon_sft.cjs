'use strict';
// Exact word-local projective PGL(2,29) lexical inverse; run Node.js 22.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const load=p=>fs.readFileSync(path.join(root,p),'utf8');
function run(corpus, solved, sourceText, dictionaryText) {
  const check=(x,msg)=>{if(!x)throw Error(msg)};
  const mod=x=>((x%29)+29)%29;
  const inv=Array.from({length:29},(_,x)=>x?Array.from({length:28},(_,i)=>i+1).find(y=>x*y%29===1):0);
  const rmap=new Map(corpus.runes.map((r,i)=>[r,i]));
  const alpha=new Map(corpus.translit.map((r,i)=>[r,i]));
  const wordParser=(s,native)=>{const out=[];let w=[];for(const c of s){if(rmap.has(c))w.push(rmap.get(c));else if((native?'-.,;&$•⁘⁜ \n':'-.,;&$•⁘⁜ ').includes(c)){if(w.length)out.push(w);w=[]}}if(w.length)out.push(w);return out};
  const pages=sourceText.split('%');
  const original=wordParser(pages.slice(0,55).join('%'),false);
  const native=solved.sections.flatMap(s=>wordParser(s.source_text,true));
  check(pages.length===57&&original.length===2896&&original.flat().length===12956,'source geometry');
  check(original.flat().join(',')===corpus.pages.slice(0,56).flatMap(p=>p.indices||[]).join(','),'canonical rune alignment');
  const grams=[...alpha.keys()].sort((a,b)=>b.length-a.length);
  const aliases={K:'C',V:'U',Q:'C',Z:'S'};
  const lex=new Map();
  /** Enumerate all chart segmentation paths, including ING -> NG and IO -> IA aliases. */
  function addEnglish(word){
    const s=word.toUpperCase().replace(/[KVQZ]/g,c=>aliases[c]);
    const rec=(i,v)=>{
      if(i===s.length){if(v.length>=6&&v.length<=14){const k=v.join(',');if(!lex.has(k))lex.set(k,{v,word})}return}
      if(v.length===14)return;
      if(s.startsWith('ING',i)&&alpha.has('NG'))rec(i+3,[...v,alpha.get('NG')]);
      if(s.startsWith('IO',i)&&alpha.has('IA'))rec(i+2,[...v,alpha.get('IA')]);
      for(const g of grams)if(s.startsWith(g,i))rec(i+g.length,[...v,alpha.get(g)]);
    };
    rec(0,[]);
  }
  for(const line of dictionaryText.split('\n')){const m=/^([a-z]+) (\d+)$/.exec(line.trim());if(m)addEnglish(m[1])}
  for(const v of native)if(v.length>=6&&v.length<=14)lex.set(v.join(','),{v,word:v.map(x=>corpus.translit[x]).join('')});
  function canon(v){
    const a=v[0],b=v.find(x=>x!==a),c=v.find(x=>x!==a&&x!==b);
    if(b===undefined)return 'single';
    if(c===undefined)return v.map(x=>x===a?0:1).join(',');
    return v.map(x=>x===c?29:mod(mod((x-a)*(b-c))*inv[mod((x-c)*(b-a))])).join(',');
  }
  const index={direct:new Map(),delta:new Map()};
  const add=(map,v,e)=>{const k=v.length+':'+canon(v);if(!map.has(k))map.set(k,[]);map.get(k).push(e)};
  for(const e of lex.values()){
    add(index.direct,e.v,e);add(index.delta,e.v.slice(1),e);
  }
  const delta=v=>v.slice(1).map((x,i)=>mod(x-v[i]));
  const get=(kind,v)=>index[kind].get(v.length+':'+canon(v))||[];
  const modes=['direct','directEither','delta','deltaEither'];
  const counts={}; const examples={}; for(const mode of modes)examples[mode]=[];
  for(let wi=0;wi<original.length;wi++){
    const c=original[wi],n=c.length;if(n<6)continue;
    const rev=[...c].reverse();
    const sets={direct:get('direct',c),directEither:[...get('direct',c),...get('direct',rev)],delta:get('delta',delta(c)),deltaEither:[...get('delta',delta(c)),...get('delta',delta(rev))]};
    const row=counts[n]??={total:0,direct:0,directEither:0,delta:0,deltaEither:0};row.total++;
    for(const mode of modes)if(sets[mode].length){row[mode]++;if(n>=8)examples[mode].push({wordIndex:wi,cipher:c.map(x=>corpus.translit[x]).join(''),candidates:[...new Set(sets[mode].map(e=>e.word))].slice(0,12)})}
  }
  let plants=0;
  for(const p of native.filter(v=>v.length>=6&&v.length<=14)){
    const pole=Array.from({length:29},(_,i)=>i).find(x=>!p.includes(x));
    const a=mod(7+p.length),b=mod(1-a*pole);
    const enc=x=>mod((a*x+b)*inv[mod(x-pole)]);
    const dec=y=>mod((y*pole+b)*inv[mod(y-a)]);
    const direct=p.map(enc);
    check(direct.every((x,i)=>dec(x)===p[i]),'direct exact inverse');
    check(get('direct',direct).some(e=>e.v.join(',')===p.join(',')),'direct known word');
    const c=[17];for(const x of p.slice(1))c.push(mod(c[c.length-1]+enc(x)));
    check(delta(c).every((x,i)=>dec(x)===p[i+1]),'delta exact inverse');
    check(get('delta',delta(c)).some(e=>e.v.join(',')===p.join(',')),'delta known word');
    plants++;
  }
  return {originalWords:original.length,originalRunes:original.flat().length,uniqueLexiconRuneSequences:lex.size,plants,counts,examples};
}
const result=run(JSON.parse(load("resources/liber-primus/lp2-corpus.json")),JSON.parse(load("resources/external/relikd-solved-gp29-native-v1.json")),load("resources/liber-primus/lp2-transcription.txt"),load("resources/control/english_wordfreq_textblob.txt"));
console.log(JSON.stringify(result,null,2));
