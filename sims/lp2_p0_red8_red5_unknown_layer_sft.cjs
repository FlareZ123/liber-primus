"use strict";
const fs=require("node:fs"),path=require("node:path");
function experiment(corpus,trans,lex,log){
  const A=JSON.parse(corpus), glyph=new Map(A.runes.map((r,i)=>[r,i]));
  const mod=x=>(x+29)%29;
  const rot=s=>((s<<1)|(s>>4))&31;
  function parse(s){let w=[],cur=[];for(const c of s){if(glyph.has(c))cur.push(glyph.get(c));else if(c==="%"||c==="/"||/\s/u.test(c))continue;else if(cur.length){w.push(cur);cur=[]}}if(cur.length)w.push(cur);return w}
  function check(c,m){if(!c)throw Error(m)}
  const parts=trans.split("%"), opening=parse(parts.slice(0,3).join("%")), [k8,k5]=opening, body=opening.slice(2), c=body.flat(), ctrl=parts.map(parse).filter(w=>w.length).at(-1);
  check(c.length===716&&body.length===156&&String(opening.flat())===String(A.pages.slice(0,3).flatMap(p=>p.indices)),"source");
  check(String(ctrl.flat())===String(A.pages[57].indices),"control");
  const lexicon=new Set();
  function spell(w,i=0,seq=[]){if(i===w.length){lexicon.add(seq.map(x=>x.toString(29)).join(""));return}for(let j=0;j<29;j++)if(w.startsWith(A.translit[j],i))spell(w,i+A.translit[j].length,[...seq,j])}
  for(const line of lex.split(/\r?\n/)){if(!line.trim()||line.startsWith(";"))continue;const w=line.split(/\s+/)[0].toUpperCase().replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");spell(w)}
  for(const w of ctrl)lexicon.add(w.map(x=>x.toString(29)).join(""));
  const dict=[...lexicon].map(w=>Array.from(w,x=>parseInt(x,29)));
  const mask=new Int32Array(29), k=new Int32Array(5);
  const counts=Array.from({length:6},()=>[0,0,0]), outer=[];
  function canonical(){for(let t=1;t<5;t++){for(let j=0;j<5;j++){if(k[j]<k[(j+t)%5])break;if(k[j]>k[(j+t)%5])return false}}return true}
  function visit(d){if(d<5){for(let v=d?k[0]:0;v<29;v++){k[d]=v;visit(d+1)}return}if(!canonical())return;let w=0;mask.fill(0);for(let j=0;j<5;j++){mask[k[j]]|=1<<j;if(k[j])w++}counts[w][0]++;let s=31,n=0;for(const x of c){s=x?rot(s&~mask[x]):s|rot(s&~mask[0]);n++;if(!s)break}if(n>=300&&(s||n>300))counts[w][1]++;if(s&&n===c.length){counts[w][2]++;outer.push(Array.from(k))}}
  visit(0);
  check(outer.length===3442&&counts.reduce((s,r)=>s+r[0],0)===4102253,"outer count");
  log({counts,outer:outer.length,lexicon:dict.length});
  function reach(words,inner,out,ai,anchor=-1,phase=0){
    let s=Array(8).fill(31),n=0;for(const w of words)for(const x of w){if(n===anchor){s=s.map((v,j)=>j===0?v&(1<<phase):0)}const t=Array(8).fill(0);
      for(let a=0;a<8;a++)for(let b=0;b<5;b++)if(s[a]&(1<<b)){
        function step(q,bb){if(q===0&&!(ai&&w.length===1))t[a]|=1<<bb;const p=mod(q-inner[a]);if(p&&(!(ai&&w.length===1)||p===10||p===24))t[(a+1)%8]|=1<<bb}
        if(x===0)step(0,b);const q=mod(x-out[b]);if(q)step(q,(b+1)%5);
      }s=t;n++;if(!s.some(Boolean))return n;
    }return -1;
  }
  const fixed=[];
  for(const sign of [1,-1]){const inner=k8.map(x=>mod(sign*x));let raw=[],native=0;for(const o of outer){if(reach(body,inner,o,false)<0){raw.push(o);if(reach(body,inner,o,true)<0)native++}}fixed.push({sign,raw,native})}
  log({fixed});
  function anchorAttack(words,out,anchorWord,stat,expected){
    const C=words.flat(), start=words.slice(0,anchorWord).flat().length, len=words[anchorWord].length, ds=dict.filter(w=>w.length===len), back=new Int32Array(C.length+1);
    back[C.length]=31;for(let i=C.length-1;i>=0;i--){const x=C[i];for(let b=0;b<5;b++){if((x===0&&(back[i+1]&(1<<b)))||(mod(x-out[b])&&(back[i+1]&(1<<((b+1)%5)))))back[i]|=1<<b}}
    let m=31;for(let i=0;i<start;i++){let z=0;for(let b=0;b<5;b++)if(m&(1<<b)){if(C[i]===0)z|=1<<b;if(mod(C[i]-out[b]))z|=1<<((b+1)%5)}m=z}m&=back[start];if(!m)return;
    stat.outer++;const q=Array(len),tested=new Set();
    for(let initial=0;initial<5;initial++)if(m&(1<<initial)){
      function walk(i,b){if(i===len){stat.paths++;for(const p of ds){stat.words++;let key=Array(8).fill(-1),a=0,used=0,ok=true;for(let j=0;j<len;j++){if(p[j]===0){if(q[j]!==0){ok=false;break}}else{const d=mod(q[j]-p[j]);if(key[a]>=0&&key[a]!==d){ok=false;break}if(key[a]<0){key[a]=d;used++}a=(a+1)%8}}if(!ok)continue;if(used<8){stat.missing++;continue}const id=initial+":"+key.join(",");if(tested.has(id))continue;tested.add(id);stat.keys++;if(reach(words,key,out,false,start,initial)<0){stat.raw++;if(reach(words,key,out,true,start,initial)<0){stat.native++;if(expected&&String(expected)===String(key))stat.found=true}}}return}
      const x=C[start+i];if(x===0&&(back[start+i+1]&(1<<b))){q[i]=0;walk(i+1,b)}const y=mod(x-out[b]),bb=(b+1)%5;if(y&&(back[start+i+1]&(1<<bb))){q[i]=y;walk(i+1,bb)}}
      walk(0,initial);
    }
  }
  function stats(){return {outer:0,paths:0,words:0,keys:0,raw:0,native:0,missing:0,found:false}}
  const stat=stats();check(body[3].length===11&&body.slice(0,3).flat().length===10,"anchor");check(dict.filter(w=>w.length===11).every(w=>w.filter(x=>x!==0).length>=8),"anchor support");
  for(const o of outer)anchorAttack(body,o,3,stat);
  log({anchor11:dict.filter(w=>w.length===11).length,stat});
  check(stat.keys===435&&stat.raw===0&&stat.missing===0,"anchor results");
  function encode(words,ki,ko){let a=0,b=0;return words.map(w=>w.map(p=>{if(!p)return 0;let q=mod(p+ki[a]);a=(a+1)%8;if(!q)return 0;const c=mod(q+ko[b]);b=(b+1)%5;return c}))}
  const controlStats=[];
  for(const [ki,ko] of [[k8,k5],[[4,19,2,0,28,13,8,1],[0,0,3,12,19]],[[23,4,11,7,17,22,0,9],[5,12,13,17,26]]]){
    const enc=encode(ctrl,ki,ko), anchor=13,phase=ctrl.slice(0,anchor).flat().filter(Boolean).length%8, expected=ki.slice(phase).concat(ki.slice(0,phase)), s=stats();
    anchorAttack(enc,ko,anchor,s,expected);check(s.found,"planted inner key not recovered");controlStats.push(s);
  }
  log({controlStats});
  return {counts,fixed,stat,controlStats,outer,dict,body,ctrl};
}
const root=path.resolve(__dirname,"..","resources");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
if(require.main===module) experiment(read("liber-primus/lp2-corpus.json"),read("liber-primus/lp2-transcription.txt"),read("control/english_wordfreq_textblob.txt"),x=>console.log(JSON.stringify(x)));
module.exports={experiment};
