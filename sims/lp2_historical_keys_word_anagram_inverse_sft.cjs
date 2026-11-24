"use strict";
// Node22 CommonJS SFT; exact finite historical-key bag inverse.
const fs=require("node:fs");
const path=require("node:path");
function experiment(inputs){
  const [json,transcript,lex,solved]=inputs, corpus=JSON.parse(json);
  const check=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29;
  const index=new Map(corpus.runes.map((x,i)=>[x,i])),symbols=corpus.translit.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);
  /** @param {string} s @returns {number[]|null} */
  function gp(s){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const p=[];for(let j=0;j<s.length;){if(s.startsWith("ING",j)){p.push(21);j+=3;continue;}if(s.startsWith("IO",j)){p.push(27);j+=2;continue;}const t=symbols.find(x=>s.startsWith(x[0],j));if(!t)return null;p.push(t[1]);j+=t[0].length;}return p;}
  const str=p=>p.map(i=>String.fromCharCode(65+i)).join(""),bag=p=>str(p.slice().sort((a,b)=>a-b)),read=p=>p.map(x=>corpus.translit[x]).join("");
  function words(s){const w=[];let cur=[];for(const c of s){if(index.has(c))cur.push(index.get(c));else if("-.$&§".includes(c)&&cur.length){w.push(cur);cur=[];}}if(cur.length)w.push(cur);return w;}
  const chunks=transcript.split("%"),original=words(chunks.slice(0,55).join("%")),p57=words(chunks[56]);
  check(original.length===2896&&original.flat().length===12956&&str(original.flat())===str(corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices)),"source alignment");
  check(str(p57.flat())===str(corpus.pages.find(p=>p.page===57).indices),"native p57 alignment");
  const dictionary=new Map();
  function add(s){const p=gp(s);if(p&&p.length>=8&&p.length<=14)dictionary.set(str(p),p);}
  for(const row of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+\d+$/.exec(row);if(m)add(m[1]);}
  for(const s of solved.match(/[A-Za-z]+/g)||[])add(s);
  for(const p of p57)if(p.length>=8)dictionary.set(str(p),p);
  const bagIndex=new Map();
  for(const p of dictionary.values()){const b=bag(p);if(!bagIndex.has(b))bagIndex.set(b,[]);bagIndex.get(b).push(p);}
  const keys=[["DIUINITY",gp("DIUINITY")],["FIRFUMFERENFE",gp("FIRFUMFERENFE")]];
  check(keys[0][1].length===8&&keys[1][1].length===13,"historical keys");
  /** @param {number[]} p @param {number[]} key @param {number} phase @param {number} dir @param {boolean} hold */
  function encrypt(p,key,phase,dir,hold){return p.map(x=>{if(hold&&x===0)return 0;const y=mod(x+key[phase]);phase=(phase+dir+key.length)%key.length;return y;});}
  function options(c,key,phase,dir,hold){const out=[];function go(i,q,p){if(i===c.length){out.push(p);return;}if(hold&&c[i]===0)go(i+1,q,[...p,0]);const x=mod(c[i]-key[q]);if(!hold||x!==0)go(i+1,(q+dir+key.length)%key.length,[...p,x]);}go(0,phase,[]);return out;}
  let pos=0;const records=original.map((c,id)=>{const r={c,id,pos};pos+=c.length;return r;}).filter(x=>x.c.length>=8);
  check(records.length===343&&records.filter(x=>x.c.length>=10).length===109,"long anchors");
  const pageStarts=new Map();pos=0;for(const p of corpus.pages){pageStarts.set(p.page,pos);pos+=p.indices.length;}
  const chapters=[0,3,8,15,23,27,33,40,54,56];
  const controlsSource=[...new Map([...p57,...(solved.match(/[A-Za-z]+/g)||[]).map(gp).filter(Boolean)].filter(p=>p.length>=8&&p.length<=14&&dictionary.has(str(p))).map(p=>[str(p),p])).values()].slice(0,32);
  let rng=0xa41ce523;function draw(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n;}
  function shuffle(p){const out=p.slice();for(let j=out.length-1;j>0;j--){const i=draw(j+1);[out[i],out[j]]=[out[j],out[i]];}return out;}
  const result=[];
  for(const [name,key] of keys)for(const hold of [false,true])for(const order of ["plaintext-permutation-first","ciphertext-permutation-last"]){
    const encBags=new Map();
    if(order==="ciphertext-permutation-last"){
      for(const p of dictionary.values())for(let phase=0;phase<key.length;phase++)for(const d of [-1,1]){
        const b=bag(encrypt(p,key,phase,d,hold));let set=encBags.get(b);if(!set){set=new Set();encBags.set(b,set);}set.add(str(p));
      }
    }
    function candidates(c){if(order==="ciphertext-permutation-last")return [...(encBags.get(bag(c))||[])].map(s=>dictionary.get(s));const set=new Set();for(let q=0;q<key.length;q++)for(const d of [-1,1])for(const p of options(c,key,q,d,hold))for(const hit of bagIndex.get(bag(p))||[])set.add(str(hit));return [...set].map(s=>dictionary.get(s));}
    const ctrl=controlsSource.map((p,i)=>{const q=draw(key.length),d=draw(2)?1:-1;const inner=order==="plaintext-permutation-first"?shuffle(p):p;const encrypted=encrypt(inner,key,q,d,hold);const c=order==="ciphertext-permutation-last"?shuffle(encrypted):encrypted;const cs=candidates(c);check(cs.some(x=>str(x)===str(p)),"true native plant excluded");check(options(encrypted,key,q,d,hold).some(x=>str(x)===str(inner)),"exact planted inverse");return {i,word:read(p),candidates:cs.length,unique:cs.length===1};});
    const rows=records.map(r=>{const cs=candidates(r.c);return {id:r.id,pos:r.pos,length:r.c.length,candidates:cs.length,unique:cs.length===1?read(cs[0]):null};});
    const summarize=r=>({n:r.length,compatible:r.filter(x=>x.candidates>0).length,unique:r.filter(x=>x.unique!==null).length,firstUnique:r.filter(x=>x.unique!==null).slice(0,10)});
    const scopes=chapters.slice(0,-1).map((p,i)=>({pages:`${p}-${chapters[i+1]-1}`,...summarize(rows.filter(x=>x.pos>=pageStarts.get(p)&&x.pos<pageStarts.get(chapters[i+1])))}));
    result.push({name,hold,order,controlCount:ctrl.length,controlUnique:ctrl.filter(x=>x.unique).length,control:ctrl,all:summarize(rows),long:summarize(rows.filter(x=>x.length>=10)),scopes,rows});
  }
  return {sourceRunes:12956,sourceWords:2896,lexiconSize:dictionary.size,controlCount:controlsSource.length,results:result};
}
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/liber-primus/lp2-transcription.txt",
  "resources/control/english_wordfreq_textblob.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt"
];
const result=experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")));
console.log(JSON.stringify(result,null,2));
