"use strict";
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
function experiment(grid, log, signed) {
  let state=false;
  const payload=[];
  for(const line of log.split(/\r?\n/)) {
    const match=line.match(/Received line: (['"])(.*)\1$/);
    if(!match)continue;
    const raw=match[2].replace(/\\(r|n|t|\\|'|")/g,(_,s)=>({r:"\r",n:"\n",t:"\t","\\":"\\","'":"'","\"":"\""}[s]));
    if(!state){if(raw.trim().toUpperCase()==="NEXT")state=true;continue;}
    if(raw===".\r\n")break;
    payload.push(raw);
  }
  const data=payload.join("").replace(/\r\n/g,"\n");
  const expected=signed.replace(/\r\n/g,"\n");
  if(data.trimEnd()!==expected.trimEnd())throw Error("NEXT payload mismatch");
  const cells=grid.rows.flat();
  const val=t=>60*grid.alphabet.indexOf(t[0])+grid.alphabet.indexOf(t[1]);
  const candidates=cells.map((x,i)=>({i,x,choices:[...new Set([x.toUpperCase(),x.toLowerCase()])].filter(y=>grid.alphabet.includes(y[1])&&val(y)<256)}));
  if(candidates.some(x=>!x.choices.includes(x.x)))throw Error("source value outside byte domain");
  const ambiguous=candidates.filter(x=>x.choices.length>1);
  const residueAmbiguous=ambiguous.filter(x=>val(x.choices[0])%29!==val(x.choices[1])%29);
  return {
    next:{payloadLines:payload.length,normalizedLength:data.length,referenceLength:expected.length,equalIgnoringTerminalWhitespace:true,caseChanges:[...data].filter(x=>x!==x.toLowerCase()).length},
    grid:{total:cells.length,distinct:new Set(cells).size,foldedDistinct:new Set(cells.map(x=>x.toLowerCase())).size,ambiguous:ambiguous.length,residueAmbiguous:residueAmbiguous.length,preimageCount:(2n**BigInt(ambiguous.length)).toString(),forcedLetterPositions:candidates.filter(x=>/[a-z]/i.test(x.x[1])&&x.choices.length===1).map(x=>x.i)}
  };
}
if(require.main===module){
 const root=path.join(__dirname,"..");
 const read=p=>fs.readFileSync(path.join(root,p),"utf8");
 const result=experiment(JSON.parse(read("resources/liber-primus/base60-grid.json")),read("resources/historical/cicada2013-clientlog-1362290293-9.txt"),read("resources/external/2013-do-not-share-this-information-2.asc"));
 assert.equal(result.next.payloadLines,66);
 assert.equal(result.grid.ambiguous,202);
 console.log(JSON.stringify(result,null,2));
}
module.exports={experiment};
