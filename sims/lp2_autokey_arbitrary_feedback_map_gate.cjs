'use strict';
const fs=require('node:fs');
const path=require('node:path');
function run(corpus,trans,lex,native){
 const mod=n=>((n%29)+29)%29,all=(1<<29)-1,bit=i=>1<<i,NONZERO=all^1;
 const pop=x=>{let n=0;while(x){x&=x-1;n++}return n};
 const pages=corpus.pages.filter(p=>p.page<56),tape=pages.flatMap(p=>p.indices);
 const alpha=new Map(corpus.translit.map((x,i)=>[x,i])),runes=new Map(corpus.runes.map((r,i)=>[r,i]));
 const words=(trans.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).slice(0,2896).map(w=>Array.from(w,x=>runes.get(x)));
 if(String(words.flat())!==String(tape))throw Error("transcription alignment");
 const dict=Array.from({length:32},()=>new Map());
 const add=w=>{if(w.length&&w.length<32)dict[w.length].set(String(w),w)};
 function variants(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  function walk(i,w){if(i===s.length){add(w);return;}for(const n of [1,2,3]){const a=s.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?alpha.get("NG"):undefined):alpha.get(a);if(v!==undefined)walk(i+n,[...w,v]);}}walk(0,[]);
 }
 for(const l of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(l);if(m&&m[1].length>=2)variants(m[1]);}
 for(const s of ["A","I","O"])variants(s);
 const nativeWords=native.sections.map(s=>(s.source_text.match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>runes.get(x))));
 for(const sec of nativeWords)for(const w of sec)add(w);
 function pattern(w){let m=new Map();return w.map(x=>{if(!m.has(x))m.set(x,m.size);return m.get(x)}).join(",")}
 const byPattern=new Map();
 for(const d of dict)for(const w of d.values()){if(w.includes(0))continue;const key=pattern(w);if(!byPattern.has(key))byPattern.set(key,[]);byPattern.get(key).push(w);}
 function matching(dom){
  const match=Array(29).fill(-1);
  function aug(i,seen){for(let j=0;j<29;j++)if((dom[i]&bit(j))&&!seen[j]){seen[j]=1;if(match[j]===-1||aug(match[j],seen)){match[j]=i;return true}}return false}
  let n=0;for(let i=0;i<29;i++)if(aug(i,Array(29).fill(0)))n++;
  return n;
 }
 function gate(arrays,q){
  let offset=0;const pairs=[],dom=Array(29).fill(all);
  for(const c of arrays){let s=0;for(let i=0;i<c.length;i++){s=c[i]===0?0:s+1;if(s>q){const x=c[i-q],y=c[i];dom[x]&=~bit(y);pairs.push({index:offset+i,x,y});}}offset+=c.length}
  return {pairs,dom,matching:matching(dom),forced:dom.map((v,i)=>v===1?i:null).filter(x=>x!==null)};
 }
 function anchorsOf(wds,g){
  const fixed=new Map(g.pairs.filter(x=>g.dom[x.x]===1).map(p=>[p.index,p.y]));
  let off=0;const anchors=[];
  for(let wi=0;wi<wds.length;wi++){const w=wds[wi],start=off;off+=w.length;
   if(w.length>=5&&w.every((v,i)=>fixed.has(start+i)))anchors.push({wi,w,start});}
  return {anchors,forcedPositions:fixed.size};
 }
 function affineGate(anchors){
  const inverses=Array.from({length:28},(_,i)=>{for(let x=1;x<29;x++)if(mod((i+1)*x)===1)return x});
  return inverses.map((iv,i)=>{let good=0;const words=[];for(const {wi,w} of anchors){const p=w.map(c=>mod(c*iv));if(dict[p.length].has(String(p))){good++;words.push({wi,p:p.map(v=>corpus.translit[v]).join("")})}}return {a:i+1,good,words}});
 }
 function propagate(anchors,dom,rows){
  let changed=true;
  while(changed){changed=false;
   for(let j=0;j<anchors.length;j++){const w=anchors[j].w;const r=rows[j].filter(p=>p.every((v,i)=>dom[w[i]]&bit(v)));
    if(!r.length)return false;if(r.length!==rows[j].length){rows[j]=r;changed=true;}
    const support=Array(29).fill(0);for(const p of r)for(let i=0;i<w.length;i++)support[w[i]]|=bit(p[i]);
    for(const x of new Set(w)){const v=dom[x]&support[x];if(!v)return false;if(v!==dom[x]){dom[x]=v;changed=true;}}
   }
   for(let x=1;x<29;x++)if(pop(dom[x])===1)for(let y=1;y<29;y++)if(y!==x&&(dom[y]&dom[x])){dom[y]&=~dom[x];if(!dom[y])return false;changed=true;}
  }
  return matching(dom)===29;
 }
 function newDom(){return [1,...Array(28).fill(NONZERO)]}
 function permGate(anchors,solveControl=false){
  const rows=anchors.map(a=>byPattern.get(pattern(a.w))||[]);
  const mandatory=anchors.filter((a,i)=>!rows[i].length).map(a=>({wi:a.wi,start:a.start,c:a.w.map(v=>corpus.translit[v]).join("")}));
  const possible=anchors.map((a,i)=>({...a,rows:rows[i]})).filter(a=>a.rows.length);
  // Each disjoint group proven impossible by domain propagation is an independent
  // lower-bound unit of additional OOV. No optimization of grouping is claimed.
  const groups=[];let group=[];
  for(const a of possible.slice().sort((a,b)=>b.w.length-a.w.length||a.wi-b.wi)){
   group.push(a);
   if(!propagate(group,newDom(),group.map(a=>a.rows))){groups.push(group.map(a=>a.wi));group=[];}
  }
  const fullFeasible=mandatory.length===0&&propagate(anchors,newDom(),rows.slice());
  let solution=null,nodes=0,capped=false;
  if(solveControl&&fullFeasible){
   const used=new Set(anchors.flatMap(a=>a.w));
   function dfs(dom,rs){if(++nodes>10000){capped=true;return null}if(!propagate(anchors,dom,rs))return null;
    let best=-1,n=30;for(const x of used){const k=pop(dom[x]);if(k>1&&k<n){best=x;n=k}}
    if(best<0)return dom.map(m=>pop(m)===1?31-Math.clz32(m):null);
    for(let v=1;v<29;v++)if(dom[best]&bit(v)){const d=dom.slice();d[best]=bit(v);const result=dfs(d,rs.slice());if(result)return result;if(capped)return null}return null;
   }
   solution=dfs(newDom(),rows.slice());
  }
  return {mandatory:mandatory.length,mandatoryExamples:mandatory.slice(0,10),disjointConflictGroups:groups,lowerBound:mandatory.length+groups.length,fullFeasible,solution,nodes,capped};
 }
 const result={lexicon:dict.reduce((s,d)=>s+d.size,0),original:{},controls:[]};
 for(const q of [8,13]){
  const g=gate(pages.map(p=>p.indices),q),a=anchorsOf(words,g);
  result.original[q]={pairs:g.pairs.length,domSizes:g.dom.map(pop),matching:g.matching,forced:g.forced,forcedPositions:a.forcedPositions,anchors:a.anchors.length,affine:affineGate(a.anchors),arbitraryOutputPermutation:permGate(a.anchors)};
  // Real native text under planted affine feedback permutation: the exact
  // forbidden-row gate must never reject a genuine feedback permutation.
  const p=nativeWords.flat(2);let k=Array.from({length:q},(_,i)=>mod(3+7*i));
  const fun=x=>mod(11*x+19),c=p.map(v=>{if(!v)return 0;const x=mod(7*v+fun(k.shift()));k.push(x);return x});
  const g2=gate([c],q);
  if(g2.matching!==29||g2.dom.some((mask,x)=>!(mask&bit(fun(x)))))throw Error("false rejection");
  // Separate known-zero-feedback plant for lexical solver. Unknown output
  // substitution fixes F, permutes 1..28. Knowledge of f=0 is given only
  // for this control; the original manuscript forces it for all nonzero rows.
  const enc=x=>x===0?0:1+((x-1+5)%28);
  const c3=p.map(enc),g3=gate([c3],q);
  g3.dom=Array(29).fill(1);
  let offset=0;const wds=nativeWords.flat().map(w=>{const c=c3.slice(offset,offset+w.length);offset+=w.length;return c});
  const a3=anchorsOf(wds,g3),r3=permGate(a3.anchors,true);
  if(!r3.solution||r3.lowerBound)throw Error("native lexical control failed");
  const truth=nativeWords.flat();
  let matches=0,total=0;
  for(const a of a3.anchors)for(let i=0;i<a.w.length;i++){total++;if(r3.solution[a.w[i]]===truth[a.wi][i])matches++}
  result.controls.push({q,feedbackPermutationMatching:g2.matching,lexicalPlant:{anchors:a3.anchors.length,total,matches,...r3}});
 }
 return result;
}
const root=path.resolve(__dirname,'..');
const load=p=>fs.readFileSync(path.join(root,p),'utf8');
console.log(JSON.stringify(run(JSON.parse(load('resources/liber-primus/lp2-corpus.json')),load('resources/liber-primus/lp2-transcription.txt'),load('resources/control/english_wordfreq_textblob.txt'),JSON.parse(load('resources/external/relikd-solved-gp29-native-v1.json'))),null,2));
