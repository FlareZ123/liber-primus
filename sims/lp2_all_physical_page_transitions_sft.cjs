// Agent49 #2849: complete source-ordered transition records and fixed endpoint address.
function analyze(raw,j,annotation,csv){
  const rs=j.runes;const parts=raw.split("%");parts.splice(50,0,"");
  if(parts.length!==58)throw Error("pages "+parts.length);
  const marks=annotation.pages;const carryLines=csv.trim().split(/\r?\n/);
  const hdr=carryLines.shift().split(",");
  const carries=carryLines.map(l=>Object.fromEntries(l.split(",").map((x,i)=>[hdr[i],x])));
  let words=[],cur=[];
  function flush(){if(cur.length){words.push({runes:cur.map(x=>x.rune).join(""),positions:cur});cur=[]}}
  const pages=[];
  for(let i=0;i<58;i++){
    const p=parts[i];let idx=0;
    const lines=p.split("/").filter(x=>[...x].some(c=>rs.includes(c)));
    for(const c of p){if(rs.includes(c)){cur.push({page:i,offset:idx++,rune:c})}else if(c!=="/"&&!/\s/u.test(c)){flush()}}
    if(idx!==j.pages[i].runic_count)throw Error("count "+i);
    const runeChars=[...p].filter(c=>rs.includes(c));
    if(runeChars.some((v,k)=>rs.indexOf(v)!==j.pages[i].indices[k]))throw Error("runes "+i);
    pages.push({page:i,indices:j.pages[i].indices,firstLine:lines[0]?.trim()??null,lastLine:lines.at(-1)?.trim()??null,lineCount:lines.length,marks:marks.find(x=>x.page===i)?.large_punctuation??[]});
  }
  flush();
  const records=[];
  for(let i=0;i<57;i++){
    const x=pages[i],y=pages[i+1];
    const w1=words.find(w=>w.positions.some(p=>p.page===i&&p.offset===x.indices.length-1));
    const w2=words.find(w=>w.positions.some(p=>p.page===i+1&&p.offset===0));
    const carry=Boolean(w1&&w2&&w1===w2);
    const first=words.find(w=>w.positions[0].page===i+1&&w.positions.at(-1).page===i+1);
    const address=w1&&w2?(29*rs.indexOf(w1.runes[0])+rs.indexOf(w2.runes.at(-1)))%58:null;
    records.push({from:i,to:i+1,carry,leftRune:x.indices.at(-1)??null,rightRune:y.indices[0]??null,leftWord:w1?.runes??null,rightWord:w2?.runes??null,leftFragment:carry?w1.positions.filter(p=>p.page===i).map(p=>p.rune).join(""):null,rightFragment:carry?w1.positions.filter(p=>p.page===i+1).map(p=>p.rune).join(""):null,firstCompleteGroup:first?.runes??null,fromLastRuneLine:x.lastLine,toFirstRuneLine:y.firstLine,fromRuneLineCount:x.lineCount,fromMarks:x.marks,toMarks:y.marks,address,hit:address===i+1});
  }
  const actual=records.filter(x=>x.carry);
  if(actual.length!==32||actual.some((x,i)=>x.from!==Number(carries[i].from_page)||x.leftWord!==carries[i].word_runes))throw Error("carry mismatch "+actual.length);
  const groups={},seam={};
  for(const w of actual){
    const key=[rs.indexOf(w.leftWord[0]),rs.indexOf(w.leftWord.at(-1))].join(",");
    (groups[key]??=[]).push(w.to);
    const key2=[w.leftRune,w.rightRune].join(",");
    (seam[key2]??=[]).push(w.to);
  }
  const duplicates=Object.entries(seam).filter(([k,v])=>v.length>1);
  if(actual.some(w=>w.hit)||duplicates.length!==3)throw Error("unexpected gate result");
  return {wordCount:words.length,carryCount:actual.length,carryHits:actual.filter(w=>w.hit).length,noncarryHits:records.filter(w=>!w.carry&&w.hit).map(w=>[w.from,w.to]),fullEndpointUnique:Object.keys(groups).length,seamEndpointDuplicates:duplicates,records};
}
if(typeof require!=="undefined"&&require.main===module){
  const fs=require("node:fs");
  const read=p=>fs.readFileSync(p,"utf8");
  const result=analyze(read("resources/transcriptions/lp2-image-corrected.txt"),JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json")),read("im-results/lp2-all-32-cross-page-word-boundaries.csv"));
  console.log(JSON.stringify(result,null,2));
}
