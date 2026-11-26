'use strict';
const fs=require('node:fs');
const paths=["resources/transcriptions/lp2-image-corrected.txt","resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/external/2013-liber-al-bookcode-I.txt","resources/external/2013-liber-al-bookcode-II.txt","resources/external/2013-liber-al-bookcode-III.txt","resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt","resources/external/cicada2013-crowley-book-of-law-2013-gp-wordlengths.json"];
function main(inputs){
 const R="ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ",A=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"],assert=(ok,msg)=>{if(!ok)throw Error(msg)},runs=s=>s.match(new RegExp("["+R+"]+","gu"))||[];
 let physical=0,offset=0,tape="",positions=[],pageTape={};
 for(const ch of inputs[0]){if(ch==="%"){physical++;continue;}if(ch==="/"||/\s/u.test(ch))continue;tape+=ch;let page=physical+(physical>=50?1:0);positions.push({page,offset});if(R.includes(ch)){(pageTape[page]??=[]).push(R.indexOf(ch));offset++;}}
 for(const p of JSON.parse(inputs[1]).pages)assert(JSON.stringify(pageTape[p.page]||[])===JSON.stringify(p.indices),"page "+p.page);
 const groups=[...tape.matchAll(new RegExp("["+R+"]+","gu"))].map(m=>({w:m[0],...positions[m.index],endPage:positions[m.index+m[0].length-1].page})).filter(g=>g.page<56);
 assert(groups.length===2896&&groups.reduce((n,g)=>n+g.w.length,0)===12956&&groups.filter(g=>g.page!==g.endPage).length===32,"source counts");
 const cuts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956],expected=[158,255,383,437,224,326,378,669,66];
 const chapters=expected.map((n,i)=>({name:"chapter"+(i+1),words:groups.filter(g=>g.offset>=cuts[i]&&g.offset<cuts[i+1]).map(g=>g.w)}));
 assert(chapters.every((x,i)=>x.words.length===expected[i]),"chapter counts");
 const dict=new Map(A.map((w,i)=>[w,R[i]]));
 function gp(w){return [...w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").matchAll(/ING|TH|EO|NG|OE|AE|IA|EA|[A-Z]/g)].map(m=>dict.get(m[0]==="ING"?"NG":m[0])).join("");}
 function english(s){return(s.toUpperCase().match(/[A-Z]+/g)||[]).map(gp);}
 // Frozen word normalization from #2930 (ASCII words, greedy native GP29).
 const native=JSON.parse(inputs[2]).sections.map(s=>({name:"solved:"+s.name,words:runs(s.source_text),kind:"solved"}));
 const law=inputs.slice(3,6).map((s,i)=>({name:"Law "+(i+1),words:english(s),kind:"law"}));
 const lengths=JSON.parse(inputs[7]).chapters.map(c=>c.word_lengths);
 assert(law.map(x=>x.words.length).join(",")==="1897,1968,2002","law count");
 assert(law.every((x,i)=>x.words.every((w,j)=>w.length===lengths[i][j])),"law normalization");
 const self={name:"Self-Reliance",words:english(inputs[6]),kind:"self"};
 assert(self.words.length===10170,"Self count");
 const donors=[...native,{name:"solved concatenated sensitivity",words:native.flatMap(x=>x.words),kind:"concat"},...law,{name:"Law continuous",words:law.flatMap(x=>x.words),kind:"lawconcat"},self];
 function repeated(words,base=0){const map=new Map();for(let i=0;i<words.length;i++){let w=words[i];if(!map.has(w))map.set(w,[]);map.get(w).push(i+base);}return [...map.values()].filter(a=>a.length>1);}
 const whole=groups.map(g=>g.w);
 function spec(name,words,sets=null){let n=words.length,split=Math.floor(n*2/3),classes=sets||repeated(words),pairs=classes.flatMap(a=>a.slice(1).map(j=>[a[0],j])),train=pairs.filter(([i,j])=>j<split),pred=pairs.filter(([i,j])=>i<split&&j>=split),untouched=pairs.filter(([i,j])=>i>=split);return{name,n,split,classes,pairs,train,pred,untouched};}
 let pos=0,jointClasses=[];for(const ch of chapters){jointClasses.push(...repeated(ch.words,pos));pos+=ch.words.length;}
 const scopes=[spec("book-shared",whole),spec("book-private-chapter",whole,jointClasses),...chapters.map(x=>spec(x.name,x.words))];
 function violations(P,start,pairs){let n=0;for(const [i,j]of pairs)n+=+(P[start+i]!==P[start+j]);return n;}
 function scan(s,donor){const P=donor.words,windows=Math.max(0,P.length-s.n+1);let train=0,pred=0,full=0,best=Infinity,trainOffsets=[],fullOffsets=[],bestOffsets=[];
  for(let start=0;start<windows;start++){let v=violations(P,start,s.pairs);if(v<best){best=v;bestOffsets=[start];}else if(v===best&&bestOffsets.length<5)bestOffsets.push(start);
   if(!violations(P,start,s.train)){train++;if(trainOffsets.length<5)trainOffsets.push(start);if(!violations(P,start,s.pred))pred++;}
   if(v===0){full++;if(fullOffsets.length<5)fullOffsets.push(start);}
  }
  return{name:donor.name,windows,trainingSurvivors:train,predictionSurvivors:pred,fullSurvivors:full,minimumViolatedEqualities:windows?best:null,trainOffsets,fullOffsets,bestOffsets};
 }
 let rng=0x22936ef2;function rnd(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n;}
 function shuffle(a){let v=a.slice();for(let i=v.length-1;i>0;i--){let j=rnd(i+1);[v[i],v[j]]=[v[j],v[i]];}return v;}
 // Match exactly the original repetition multiplicities in homophonic controls.
 function plantSingle(s,P){const avail=new Map();for(let i=0;i<P.length;i++){const w=P[i];if(!avail.has(w))avail.set(w,[]);avail.get(w).push(i);}
  const C=Array(P.length).fill(-1);let code=0;
  for(const size of s.classes.map(x=>x.length).sort((a,b)=>b-a)){const possible=[...avail.values()].filter(a=>a.length>=size);if(!possible.length)return null;let a=possible[rnd(possible.length)];for(let i=0;i<size;i++){let j=rnd(a.length),k=a[j];a[j]=a.at(-1);a.pop();C[k]=code;}code++;}
  for(let i=0;i<C.length;i++)if(C[i]<0)C[i]=code++;
  let H=spec("plant",C);assert(H.classes.map(x=>x.length).sort().join(",")===s.classes.map(x=>x.length).sort().join(","),"plant histogram");assert(violations(P,0,H.pairs)===0,"plant valid");H.words=C;return H;}
 function plant(s,P){if(s.name!=="book-private-chapter")return plantSingle(s,P);let C=[],pos=0;for(let i=0;i<chapters.length;i++){const n=chapters[i].words.length,H=plantSingle(spec(chapters[i].name,chapters[i].words),P.slice(pos,pos+n));if(!H)return null;C.push(...H.words.map(x=>i+":"+x));pos+=n;}const H=spec("plant-private",C);assert(H.classes.map(x=>x.length).sort().join(",")===s.classes.map(x=>x.length).sort().join(","),"private plant histogram");return H;}
 function independentNull(s,eligible){let n=0,full=0,training=0,pred=0,min=Infinity;for(let j=0;j<512;j++){const d=eligible[rnd(eligible.length)],a=rnd(d.words.length-s.n+1),P=shuffle(d.words.slice(a,a+s.n));let v=violations(P,0,s.pairs);min=Math.min(min,v);full+=+(v===0);if(!violations(P,0,s.train)){training++;pred+=+(!violations(P,0,s.pred));}n++;}return{n,training,pred,full,min};}
 const result=[];
 for(const s of scopes){const eligible=donors.filter(d=>d.words.length>=s.n),rows=eligible.map(d=>scan(s,d)),total={windows:0,training:0,pred:0,full:0};for(const q of rows){total.windows+=q.windows;total.training+=q.trainingSurvivors;total.pred+=q.predictionSurvivors;total.full+=q.fullSurvivors;}
  const plants=[];for(let j=0;j<12;j++){let d=eligible[rnd(eligible.length)],a=rnd(d.words.length-s.n+1),P=d.words.slice(a,a+s.n),H=plant(s,P);if(!H)continue;
   const q=eligible.map(t=>scan(H,t));assert(!violations(d.words,a,H.pairs),"known offset recovery");
   const all=q.reduce((n,t)=>n+t.fullSurvivors,0),tr=q.reduce((n,t)=>n+t.trainingSurvivors,0);
   plants.push({donor:d.name,start:a,fullSurvivors:all,trainingSurvivors:tr,trueOffsetRecovered:true,predictionConstraints:H.pred.length,predictedTypes:new Set(H.pred.map(x=>x[0])).size});
  }
  const nulls=independentNull(s,eligible);
  result.push({name:s.name,words:s.n,trainWords:s.split,repeatTypes:s.classes.length,independentEqualities:s.pairs.length,trainingEqualities:s.train.length,heldoutPredictions:s.pred.length,predictedTypes:new Set(s.pred.map(x=>x[0])).size,heldoutOnlyEqualities:s.untouched.length,total,rows,plants,nulls});
 }
 const chapter1=result.find(s=>s.name==="chapter1"),unique=new Map(),sp=scopes.find(s=>s.name==="chapter1"),trans=w=>[...w].map(c=>A[R.indexOf(c)]).join("");
 for(const row of chapter1.rows){if(!row.fullSurvivors)continue;assert(row.fullSurvivors===row.fullOffsets.length,"chapter1 candidate list incomplete");const d=donors.find(x=>x.name===row.name);for(const start of row.fullOffsets){const P=d.words.slice(start,start+sp.n),id=P.join(" ");let candidate=unique.get(id);if(!candidate){candidate={locations:[],repeatPredictions:sp.pred.map(([i,j])=>({codeword:trans(chapters[0].words[i]),trainIndex:i,heldIndex:j,plainWord:trans(P[i])})),firstTrainWords:P.slice(0,8).map(trans)};unique.set(id,candidate);}candidate.locations.push({donor:row.name,start});}}
 return{chapter1DistinctCandidates:[...unique.values()],schema:"lp2-ordered-homophonic-donor-v1",normalization:"Frozen #2930 ASCII words; QU→CW, V→U, K/Q→C, Z→S, ING→NG, greedy GP29; native solved rune groups exact",source:{groups:2896,runes:12956,carries:32,chapterWords:expected},donors:donors.map(d=>({name:d.name,words:d.words.length,kind:d.kind})),scopes:result};
}
console.log(JSON.stringify(main(paths.map(p=>fs.readFileSync(p,'utf8'))),null,2));
