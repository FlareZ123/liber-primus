'use strict';
/** Direct original LP2 GP29 inverse; every printed word separately has
 * C[0] free; C[j]=a*C[j-1]+d*P[j]+b mod29, j>=1, a,b in GF29, d in GF29*.
 * All 23,548 independent per-word secret triples are covered.
 * Run: node sims/lp2_wordlocal_perword_affine_feedback_original_sft.cjs
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
/** @param {string} file @returns {string} */
const read=file=>fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const raw=read('resources/liber-primus/lp2-transcription.txt').split('%').slice(0,55).join('%').replace(/\/\n/g,'').replace(/[\n%]/g,'');
const rune=new Map(gp.runes.map((r,i)=>[r,i]));
const words=[...raw.matchAll(new RegExp('['+gp.runes.join('')+']+','gu'))].map((m,i)=>({i,c:[...m[0]].map(r=>rune.get(r))}));
assert.equal(words.length,2896);
assert.equal(words.reduce((t,w)=>t+w.c.length,0),12956);
const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** Source GP orthography including ING, IO. @param {string} word */
function encode(word){
 const s=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S'),out=[];
 for(let i=0;i<s.length;){
  if(s.startsWith('ING',i)){out.push(21);i+=3;continue;}
  if(s.startsWith('IO',i)){out.push(27);i+=2;continue;}
  const t=tokens.find(x=>s.startsWith(x.s,i));if(!t)return null;
  out.push(t.i);i+=t.s.length;
 }return out;
}
/** @param {number} x */
const mod=x=>(x%29+29)%29;
const inv=Array.from({length:29},(_,i)=>i?Array.from({length:28},(_,j)=>j+1).find(x=>i*x%29===1):0);
/** Residual signature eliminates arbitrary nonzero d and b. @param {number[]} v */
function sig(v){const x=v[0];let j=1;while(j<v.length&&v[j]===x)j++;
 if(j===v.length)return 'const:'+v.length;
 const m=inv[mod(v[j]-x)];return v.map(y=>mod(y-x)*m%29).join(',');
}
const files=['resources/control/shakespeare_first300k.txt',
 'resources/control/emerson_essays_2944.txt',
 'resources/control/english_wordfreq_textblob.txt',
 'resources/control/gibran_prophet_58585.txt'];
/** @type {Map<string,{p:number[],word:string,source:string}[]>} */
const dict=new Map();
for(const source of files)for(const word of read(source).match(/[A-Za-z]+/g)||[]){
 const p=encode(word);if(!p||p.length<8||p.length>14)continue;
 const key=sig(p.slice(1)),list=dict.get(key)||[];
 if(!list.some(x=>x.p.join(',')===p.join(','))){list.push({p,word:word.toUpperCase(),source});dict.set(key,list);}
}
/** @param {number[]} c */
function inverse(c){const hits=[];
 for(let a=0;a<29;a++){
  const v=c.slice(1).map((x,i)=>mod(x-a*c[i]));
  for(const entry of dict.get(sig(v))||[]){
   const p=entry.p;if(p.length!==c.length)continue;
   let j=2;while(j<c.length&&p[j]===p[1])j++;if(j===c.length)continue;
   const d=mod(v[j-1]-v[0])*inv[mod(p[j]-p[1])]%29;if(!d)continue;
   const b=mod(v[0]-d*p[1]);
   if(c.every((x,j)=>j===0||x===mod(a*c[j-1]+d*p[j]+b)))
    hits.push({word:entry.word,source:entry.source,a,d,b});
  }
 }return hits;
}
const long=words.filter(w=>w.c.length>=8);
const matches=long.flatMap(w=>inverse(w.c).map(hit=>({wordIndex:w.i,length:w.c.length,cipher:w.c,...hit})));
/** Deterministic positive. @param {number} seed */
function rng(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
const next=rng(0x33011033),entries=[...dict.values()].flat();
let positive=0;
for(const {c:original} of long){
 const pool=entries.filter(x=>x.p.length===original.length);assert(pool.length);
 const p=pool[next()%pool.length].p,a=next()%29,d=1+next()%28,b=next()%29,c=[next()%29];
 for(let i=1;i<p.length;i++)c[i]=mod(a*c[i-1]+d*p[i]+b);
 assert(inverse(c).some(hit=>hit.a===a&&hit.d===d&&hit.b===b));
 positive++;
}
const byLength=Object.fromEntries([...new Set(long.map(w=>w.c.length))].sort((a,b)=>a-b)
 .map(len=>[len,{original:long.filter(w=>w.c.length===len).length,matches:matches.filter(x=>x.length===len).length}]));
console.log('LP2_WORDLOCAL_PERWORD_FEEDBACK '+JSON.stringify({originalWords:words.length,originalRunes:12956,
 originalLongWords:long.length,perWordSecretTriples:29*28*29,
 dictionaryEntries:entries.length,dictionarySignatures:dict.size,positiveControls:positive,byLength,matches}));
