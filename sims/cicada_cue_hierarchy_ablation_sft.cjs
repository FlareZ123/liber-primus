'use strict';
// Agent 3, #2601. Retrospective historical input-only parser; no unknown LP2 ciphertext.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
function evaluate(vals){
 const clear=s=>s.split("-----BEGIN PGP SIGNATURE-----")[0].split(/\r?\n/).map(x=>x.trim());
 const isCoord=s=>/^[\w.\[\]-]+(?::[0-9]+)+$/.test(s);
 const literal=s=>/^(?:[A-Za-z0-9.]|the first prime|the product of the first two primes|ONION)$/.test(s);
 function parse(lines){let runs=[],run=[];const finish=()=>{if(run.length)runs.push(run);run=[]};for(const s of lines){if(isCoord(s)||literal(s)){run.push(s)}else finish()}finish();return runs.map(rows=>{const coords=rows.filter(isCoord).map(x=>x.split(":"));return {rows,coords,arities:[...new Set(coords.map(x=>x.length))]}}).filter(r=>r.coords.length>=8&&r.arities.length===1).sort((a,b)=>b.coords.length-a.coords.length)[0]??null}
 const summary=p=>p&&({count:p.coords.length,arity:p.arities[0],literals:p.rows.filter(x=>!isCoord(x))});
 const train=vals.slice(0,4).map(s=>summary(parse(clear(s))));
 const orig=clear(vals[4]),holdout=parse(orig),prefixes=holdout.coords.map(x=>x[0]);
 const ablation={noCoords:summary(parse(orig.filter(s=>!isCoord(s)))),spaces:summary(parse(orig.map(s=>isCoord(s)?s.replace(/:/g," "):s))),onlyRecords:summary(parse(holdout.rows)),shiftedPrefixes:summary(parse(holdout.rows.map(s=>{if(!isCoord(s))return s;const [p,...fields]=s.split(":");return [prefixes[(prefixes.indexOf(p)+1)%prefixes.length],...fields].join(":")})))};
 const distractors=vals.slice(5,8).map(s=>summary(parse(clear(s))));
 const lines=vals[8].split(/\r?\n/);
 const contents=lines.slice(0,lines.findIndex(s=>s.trim()==="VII")).map(s=>s.trim()).filter(s=>/\s+\d+$/.test(s)).map(s=>s.replace(/\s+\d+$/,""));
 const numerals={one:"1",two:"2",three:"3",four:"4",five:"5",six:"6",seven:"7",eight:"8",nine:"9",ten:"10"};
 const acronym=s=>(s.match(/[A-Za-z]+/g)??[]).map(w=>numerals[w.toLowerCase()]??w[0].toUpperCase()).join("");
 function candidates(p){const q=p.match(/^(.*?)(?:\[(\d+)\])?$/);const key=q[1].replace(/\./g,"");const hits=contents.filter(t=>acronym(t)===key);if(q[2])return hits.length>=2&&hits[+q[2]-1]?[hits[+q[2]-1]]:[];return hits}
 const binding=prefixes.map(p=>({prefix:p,candidates:candidates(p)}));
 // Fixed, independently published chapter spans, no coordinate answers supplied.
 const spans={"3PI":[1682,1923],"LML":[5632,6904],"ETOATS":[27086,27861],"...AF":[17529,19071],"AMO":[13221,14092],"CC":[11016,11257]};
 const modes=["speakerTurns","printedLines","paragraphs","sentences"];
 const results={};
 for(const mode of modes){const rows=[];for(const [p,j,k,l] of holdout.coords){if(!spans[p])continue;const [s,e]=spans[p],body=lines.slice(s-1,e).join("\n");let units;
  const speech=/\b(?:Achilles|Tortoise|Zeno|Crab|CCrab|Anteater):\s*/ig;
  const first=body.search(speech);const speechBody=body.slice(first);
  if(mode==="speakerTurns")units=speechBody.split(speech).slice(1);
  if(mode==="printedLines")units=speechBody.split(/\n/).filter(s=>s.trim()).map(s=>s.replace(speech,""));
  if(mode==="paragraphs")units=speechBody.split(/\n\s*\n/).filter(s=>s.trim()).map(s=>s.replace(speech,""));
  if(mode==="sentences")units=speechBody.replace(speech,"").split(/(?<=[.!?])\s+/).filter(s=>s.trim());
  const word=units[+j-1]?.trim().split(/\s+/)[+k-1];const char=word?.[+l-1]?.toLowerCase()??null;
  rows.push({p,character:char,base32:char!==null&&/^[a-z2-7]$/.test(char)});
 }results[mode]=rows}
 return {train,holdout:summary(holdout),distractors,ablation,binding,results};
}
const root=path.resolve(__dirname,'..');
const external=["2012/005-845145127.com/img/162667212858.jpg.asc","2012/005-845145127.com/img/everywhere.jpg.asc","2013/001-232.jpg/232.jpg.asc","2014/001-twitter/zN4h51m.jpg.asc"];
const local=["resources/historical/cicada2014-onion5-signed.asc","resources/historical/cicada2012-message-only-displayed.asc","resources/historical/cicada2013-first-onion-hello.asc","resources/historical/cicada2013-gematria-jpeg-outguess.asc"];
const base='https://raw.githubusercontent.com/neuroretransmit/cicada/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/';
async function main(){const vals=await Promise.all([...external.map(async p=>{const r=await fetch(base+p);assert(r.ok,p);return r.text()}),...local.map(p=>fs.readFileSync(path.join(root,p),'utf8')), (async()=>{const r=await fetch(base+'2014/007-fifth-onion/eternal-golden-braid.txt');assert(r.ok);return r.text()})()]); const result=evaluate(vals);assert.deepEqual(result.train.map(x=>[x.count,x.arity]),[[19,2],[20,2],[44,3],[15,4]]);assert.equal(result.holdout.count,14);assert.equal(result.holdout.arity,4);assert(result.distractors.every(x=>x===null));assert.equal(result.ablation.noCoords,null);assert.equal(result.ablation.spaces,null);console.log(JSON.stringify(result,null,2));}
main().catch(e=>{console.error(e);process.exitCode=1});
