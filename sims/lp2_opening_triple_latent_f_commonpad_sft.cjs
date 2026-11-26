"use strict";
function experiment(inputs){
 const [gp,raw,lex,native,gib,sh]=[JSON.parse(inputs[0]),inputs[1],inputs[2],JSON.parse(inputs[3]),inputs[4],inputs[5]];
 const mod=x=>(x%29+29)%29,assert=(x,m)=>{if(!x)throw Error(m)};
 const map=new Map(gp.runes.map((x,i)=>[x,i])),alpha=new Map(gp.translit.map((x,i)=>[x,i])),dict=Array.from({length:32},()=>new Map());
 const add=w=>{if(w.length&&w.length<32)dict[w.length].set(String(w),w)};
 function variants(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function walk(i,w){if(i===s.length){add(w);return}for(const n of [1,2,3]){const a=s.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?alpha.get("NG"):undefined):alpha.get(a);if(v!==undefined)walk(i+n,[...w,v])}}walk(0,[])}
 for(const l of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(l);if(m&&m[1].length>=2)variants(m[1])}
 for(const s of ["A","I","O"])variants(s);
 for(const sec of native.sections)for(const w of sec.source_text.match(/[\u16a0-\u16ff]+/g)||[])add(Array.from(w,x=>map.get(x)));
 const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function donor(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){const p=[];w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tokens.find(t=>w.startsWith(t.s));if(!t)throw Error(w);p.push(t.i);w=w.slice(t.s.length)}out.push(p)}return out}
 const g=donor(gib.slice(gib.toLowerCase().indexOf("almustafa"))),s=donor(sh);for(const p of [...g,...s])add(p);
 const vocabulary=dict.reduce((n,d)=>n+d.size,0);assert(vocabulary===40540,"lexicon");
 const parts=raw.split("%");function parse(src){const words=[];let w=[];for(const c of src){if(map.has(c))w.push(map.get(c));else if(c!=="/"&&!/\s/u.test(c)&&w.length){words.push(w);w=[]}}if(w.length)words.push(w);return words}
 const shapes=parts.slice(0,3).map((p,i)=>parse(p).map((w,j,a)=>({w,partial:(i>0&&j===0)||(i<2&&j===a.length-1)})));
 for(let i=0;i<3;i++)assert(String(shapes[i].flatMap(x=>x.w))===String(gp.pages[i].indices),"source page "+i);
 const tries=[false,true].map(rev=>dict.map(d=>{const nodes=[new Int32Array(29).fill(-1)];for(const orig of d.values()){let n=0;for(const v of rev?orig.slice().reverse():orig){let k=nodes[n][v];if(k<0){k=nodes.length;nodes[n][v]=k;nodes.push(new Int32Array(29).fill(-1))}n=k}}return nodes}));
 function stream(words,rev){const ws=rev?words.slice().reverse().map(({w,partial})=>({w:w.slice().reverse(),partial})):words;const c=[],ts=[],end=[],free=[],start=[];for(const {w,partial} of ws)for(let i=0;i<w.length;i++){c.push(w[i]);ts.push(tries[+rev][w.length]);end.push(i===w.length-1);free.push(partial);start.push(i===0)}return {c,ts,end,free,start}}
 function joint(ws,dirs,signs,budget,maxStates=2000000){
  const T=ws.map((w,i)=>stream(w,dirs[i])), N=T.map(t=>t.c.length), memo=new Map(),steps=[],max=[0,0,0];let visited=0,capped=false,witness=null;
  function options(t,i,n,p){
   if(t.free[i]||n===-1)return [[t.end[i]?0:-1,0]];
   const k=t.ts[i][n][p];
   if(k>=0)return [[t.end[i]?0:k,0],...(t.end[i]?[]:[[-1,1]])];
   return [[t.end[i]?0:-1,1]];
  }
  function dfs(pos,nodes,b){
   if(++visited>maxStates){capped=true;return false}
   if(pos.every((p,i)=>p===N[i])){witness=steps.slice();return true}
   for(let i=0;i<3;i++)max[i]=Math.max(max[i],pos[i]);
   const code=pos.join(",")+";"+nodes.join(",");
   if((memo.get(code)??-1)>=b)return false;
   memo.set(code,b);
   // One independent literal-F hold may occur before the next common key digit.
   for(let j=0;j<3;j++)if(pos[j]<N[j]&&T[j].c[pos[j]]===0){
    for(const [nn,cost] of options(T[j],pos[j],nodes[j],0)){
     if(cost>b)continue;
     const pp=pos.slice(),nd=nodes.slice(),pl=[-1,-1,-1];pp[j]++;nd[j]=nn;pl[j]=0;
     steps.push({p:pl,k:-1});if(dfs(pp,nd,b-cost))return true;steps.pop();if(capped)return false;
    }
   }
   // All nonfinished streams consume one identical key digit, with fixed relative signs.
   for(let k=0;k<29;k++){
    const pp=pos.slice(),nd=nodes.slice(),pl=[-1,-1,-1], opts=[];
    let legal=true;for(let j=0;j<3;j++){
     if(pos[j]===N[j]){opts.push([[0,0]]);continue}
     const p=mod(T[j].c[pos[j]]-signs[j]*k);if(!p){legal=false;break}
     pp[j]++;pl[j]=p;opts.push(options(T[j],pos[j],nodes[j],p))
    }
    if(!legal)continue;
    for(const [a,ca] of opts[0])for(const [c,cc] of opts[1])for(const [d,cd] of opts[2]){
     const cost=ca+cc+cd;if(cost>b)continue;nd[0]=a;nd[1]=c;nd[2]=d;
     steps.push({p:pl,k});if(dfs(pp,nd,b-cost))return true;steps.pop();if(capped)return false;
    }
   }
   return false
  }
  const possible=dfs([0,0,0],[0,0,0],budget);
  if(possible){
   const P=T.map((_,j)=>witness.filter(x=>x.p[j]>=0).map(x=>x.p[j])),K=witness.filter(x=>x.k>=0).map(x=>x.k);
   for(let j=0;j<3;j++){let t=0;const C=P[j].map(p=>p===0?0:mod(p+signs[j]*K[t++]));assert(String(C)===String(T[j].c),"exact replay")}
   witness={P,K};
  }
  return {possible,capped,visited,states:memo.size,max,witness};
 }
 const original=[];for(let d=0;d<8;d++)for(let s=0;s<4;s++){
  const dirs=[!!(d&1),!!(d&2),!!(d&4)],signs=[1,s&1?-1:1,s&2?-1:1];
  const r=joint(shapes,dirs,signs,0);original.push({dirs,signs,...r});
 }
 let seed=0x330102;const rand=()=>seed=(Math.imul(seed,1664525)+1013904223)>>>0;
 const pools=Array.from({length:32},()=>[]);for(const w of [...g.slice(Math.floor(g.length*.7)),...s.slice(Math.floor(s.length*.7))])if(w.length<32)pools[w.length].push(w);
 function plant(dirs,signs){const plain=shapes.map(ws=>ws.map(({w,partial})=>({w:pools[w.length][rand()%pools[w.length].length],partial}))),key=Array.from({length:266},()=>rand()%29);
  const enc=plain.map((ws,j)=>{const oriented=dirs[j]?ws.slice().reverse().map(({w,partial})=>({w:w.slice().reverse(),partial})):ws;let t=0;const out=oriented.map(({w,partial})=>({w:w.map(p=>p===0?0:mod(p+signs[j]*key[t++])),partial}));return dirs[j]?out.reverse().map(({w,partial})=>({w:w.reverse(),partial})):out});
  const r=joint(enc,dirs,signs,0);assert(r.possible,"plant failed");const truth=plain.map((w,i)=>stream(w,dirs[i]).c);
  return {dirs,signs,holds:truth.map(p=>p.filter(x=>!x).length),visited:r.visited,keyCorrect:r.witness.K.filter((x,i)=>x===key[i]).length,plainCorrect:r.witness.P.map((p,j)=>p.filter((x,i)=>x===truth[j][i]).length)}
 }
 const plants=[plant([false,false,false],[1,1,1]),plant([false,true,false],[1,-1,1]),plant([true,false,true],[1,1,-1]),plant([true,true,true],[1,-1,-1])];
 return {vocabulary,shapes:shapes.map(ws=>({words:ws.length,complete:ws.filter(w=>!w.partial).length,partial:ws.filter(w=>w.partial).map(w=>w.w.length)})),original,plants}
}
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
