'use strict';
// Exact all-boundary double-projective long-word inverse. Node22.
const fs=require('node:fs');const path=require('node:path');const root=path.resolve(__dirname,'..');const load=p=>fs.readFileSync(path.join(root,p),'utf8');
function run(corpus, solved, sourceText, dictionaryText, references) {
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

  const MIN=10,MAX=14,HOLD=30,START=29;
  const table=[Int32Array.from({length:29},(_,x)=>x),...Array.from({length:29},(_,r)=>Int32Array.from({length:29},(_,x)=>inv[mod(x-r)]))];
  const children=[new Int32Array(31)],ends=[null];
  function insert(tokens,e){
    let node=0;for(const token of tokens){
      let next=children[node][token];if(!next){next=children.length;children[node][token]=next;children.push(new Int32Array(31));ends.push(null)}node=next;
    }
    const terminal=ends[node]||(ends[node]=new Map());
    terminal.set(e.v.join(','),e.word);
  }
  function tokens(p,held){
    const v=held?p.filter(x=>x!==0):p;
    const d=v.slice(1),a=d[0],pivot=d.find(x=>x!==a);
    const scale=pivot===undefined?0:inv[mod(pivot-a)];
    const z=d.map(x=>mod((x-a)*scale));
    let j=-1;return p.map(x=>held&&x===0?HOLD:(++j===0?START:z[j-1]));
  }
  let longTypes=0;for(const e of lex.values())if(e.v.length>=MIN){insert(tokens(e.v,false),e);insert(tokens(e.v,true),e);longTypes++}
  function scan(tape){
    const hits=new Map(),n=tape.length,win=new Int32Array(MAX),consumed=new Int32Array(MAX),pos=new Int32Array(MAX),diff=new Int32Array(MAX);
    let reps=0;
    for(const reverse of [false,true]){
      const v=reverse?[...tape].reverse():tape;
      for(let start=0;start<=n-MIN;start++){
        const L=Math.min(MAX,n-start);let avail=0;
        for(let j=0;j<L;j++){win[j]=v[start+j];if(win[j]===0)avail|=1<<j}
        for(let mask=avail;;mask=(mask-1)&avail){
          let k=0;for(let j=0;j<L;j++){if(mask&(1<<j)){pos[j]=-2}else{pos[j]=k-1;consumed[k++]=win[j]}}
          // Constant and empty difference streams have canonical zero values.
          for(let r=0;r<30;r++){
            const row=table[r];for(let j=1;j<k;j++)diff[j-1]=mod(row[consumed[j]]-row[consumed[j-1]]);
            let pivot=1;while(pivot<k-1&&diff[pivot]===diff[0])pivot++;
            for(let s=0;s<30;s++){
              reps++;const ir=table[s],a=k>1?ir[diff[0]]:0,scale=pivot<k-1?inv[mod(ir[diff[pivot]]-a)]:0;
              let node=0;
              for(let j=0;j<L;j++){
                const i=pos[j],token=i===-2?HOLD:i===-1?START:mod((ir[diff[i]]-a)*scale);
                node=children[node][token];if(!node)break;
                if(ends[node]){
                  const len=j+1,left=reverse?n-start-len:start,key=left*16+len;
                  let hit=hits.get(key);if(!hit){hit={start:left,len,words:new Map(),witness:{reverse,outerPole:r-1,innerPole:s-1,holdMask:mask&((1<<len)-1)}};hits.set(key,hit)}
                  for(const [k,label] of ends[node])hit.words.set(k,label);
                }
              }
            }
          }
          if(mask===0)break;
        }
      }
    }
    return {hits,reps};
  }
  function maxDisjoint(hits){
    const sorted=[...hits.values()].sort((a,b)=>a.start+a.len-b.start-b.len||a.start-b.start);
    let end=0;const selected=[];for(const x of sorted)if(x.start>=end){selected.push(x);end=x.start+x.len}
    return selected;
  }
  const nativeLong=native.filter(w=>w.length>=MIN&&w.length<=MAX);
  const plant=[],planted=[];
  for(let i=0;i<nativeLong.length;i++){
    const p=nativeLong[i],held=i%2===0,reverse=i%3===0,v=held?p.filter(x=>x!==0):p;
    const pole=v[1],a=7,b=11,enc=x=>mod(a+b*inv[mod(x-pole)]);
    const latent=[17];for(const x of v.slice(1))latent.push(mod(latent[latent.length-1]+enc(x)));
    const op=latent[1],oenc=x=>mod(3+13*inv[mod(x-op)]);
    let j=0;const c=held?p.map(x=>x===0?0:oenc(latent[j++])):latent.map(oenc);
    const start=plant.length;plant.push(...(reverse?c.reverse():c));planted.push({start,len:p.length,key:p.join(',')});
  }
  const pscan=scan(plant);
  check(planted.every(x=>pscan.hits.get(x.start*16+x.len)?.words.has(x.key)),'hidden plant lexical recovery');
  const tape=original.flat();
  const result=scan(tape);
  const summarize=x=>({start:x.start,len:x.len,words:[...new Set(x.words.values())],witness:x.witness});
  const counts={};for(const x of result.hits.values())counts[x.len]=(counts[x.len]||0)+1;
  // A fixed conventional native-GP encoding of full source words. Only
  // in-lexicon length10..14 words count, so OOV words cannot inflate the floor.
  function greedy(word){
    const s=word.toUpperCase().replace(/[KVQZ]/g,c=>aliases[c]);let i=0,v=[];
    while(i<s.length){
      if(s.startsWith('ING',i)){v.push(alpha.get('NG'));i+=3;continue}
      if(s.startsWith('IO',i)){v.push(alpha.get('IA'));i+=2;continue}
      const g=grams.find(g=>s.startsWith(g,i));if(!g)return null;
      v.push(alpha.get(g));i+=g.length;
    }return v;
  }
  const controls=references.map(s=>{
    const words=(s.match(/[A-Za-z]+/g)||[]).map(greedy).filter(Boolean);
    const starts=[];let n=0;for(const w of words){starts.push(n);n+=w.length}
    const inLex=w=>w.length>=MIN&&w.length<=MAX&&lex.has(w.join(','));
    const windows=[];let end=0,count=0;
    // All full word-aligned start windows, count only complete long words.
    for(let begin=0;begin<words.length&&starts[begin]+tape.length<=n;begin++){
      while(end<words.length&&starts[end]+words[end].length<=starts[begin]+tape.length){if(inLex(words[end]))count++;end++}
      windows.push(count);if(inLex(words[begin]))count--;
    }
    return {totalRunes:n,windows:windows.length,min:windows.length?Math.min(...windows):null,max:windows.length?Math.max(...windows):null};
  });
  return {longTypes,trieNodes:children.length,plantRecovered:planted.length,plantRunes:plant.length,originalRunes:tape.length,representativePairs:result.reps,hitCounts:counts,totalIntervals:result.hits.size,maxDisjoint:maxDisjoint(result.hits).length,hits:[...result.hits.values()].map(summarize).slice(0,100),controls};
}
const inputs=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"].map(load);console.log(JSON.stringify(run(JSON.parse(inputs[0]),JSON.parse(inputs[1]),inputs[2],inputs[3],inputs.slice(4)),null,2));
