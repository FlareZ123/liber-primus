'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

function analyze(grid,raw){
  const assert=(v,m)=>{if(!v)throw new Error(m)};
  const lines=raw.trimEnd().split(/\r?\n/);
  const sourceRows=lines.map((line,i)=>{
    const fields=line.trim().split(/\s+/);
    assert(fields.length===11 && +fields[0]===i && fields.slice(1).every(x=>/^\d{5}$/.test(x)),`bad RAND row ${i}`);
    return fields.slice(1).join("");
  });
  assert(sourceRows.length===20000 && sourceRows.every(r=>r.length===50),"RAND corpus shape");
  const tokens=grid.pages.flatMap(p=>p.tokens);
  assert(tokens.length===256 && grid.pages.map(p=>p.rows).join(",")==="10,13,9" && tokens.every(t=>t.length===2),"LP2 shape");
  const lpRows=Array.from({length:32},(_,i)=>tokens.slice(i*8,i*8+8).join(""));
  // Lock literal 8-cell rows, source consecutive rows and fixed starting column.
  // Locate using only rows 0/1, then predict rows 2–31 exactly.
  function rectangle(query){
    let train=[],full=[];
    for(let i=0;i<=sourceRows.length-query.length;i++){
      for(let j=0;j<=34;j++){
        if(sourceRows[i].slice(j,j+16)!==query[0] || sourceRows[i+1].slice(j,j+16)!==query[1])continue;
        const hit={row:i,column:j};
        train.push(hit);
        if(query.slice(2).every((s,k)=>sourceRows[i+2+k].slice(j,j+16)===s))full.push(hit);
      }
    }
    return {train,full};
  }
  const native=sourceRows.slice(137,169).map(s=>s.slice(7,23));
  const positive=rectangle(native);
  assert(positive.full.some(h=>h.row===137&&h.column===7),"positive failed");
  const altered=native.slice();
  altered[2]=String((+altered[2][0]+1)%10)+altered[2].slice(1);
  const negative=rectangle(altered);
  assert(JSON.stringify(negative.train)===JSON.stringify(positive.train)&&!negative.full.some(h=>h.row===137&&h.column===7),"negative failed");
  const decimal=tokens.filter(t=>/^\d{2}$/.test(t));
  let runs=[],start=-1;
  for(let i=0;i<=tokens.length;i++){
    if(i<tokens.length&&/^\d{2}$/.test(tokens[i])){if(start<0)start=i;}
    else if(start>=0){runs.push({start,length:i-start});start=-1;}
  }
  const tape=sourceRows.join("");
  const longest=Math.max(...runs.map(r=>r.length));
  const maxRuns=runs.filter(r=>r.length===longest).map(r=>({...r,appearsInRAND:tape.includes(tokens.slice(r.start,r.start+r.length).join(""))}));
  return {
    source:{rows:sourceRows.length,digits:tape.length,nativeGroupsPerRow:10,nativeGroupWidth:5},
    lp2:{rows:lpRows.length,cells:tokens.length,distinct:new Set(tokens).size,decimalCells:decimal.length,nonDecimalCells:tokens.length-decimal.length,fullyDecimalRows:lpRows.filter(s=>/^\d+$/.test(s)).length,longestDecimalRun:longest,maxRuns},
    literalRand:rectangle(lpRows),
    controls:{positive,negative,withheldRows:30},
    stationaryCellMapBounds:{decimalTwoDigits:100,hexSingleDigit:16,observedDistinct:new Set(tokens).size}
  };
}

const gridPath = path.join(__dirname, '../resources/liber-primus/lp2-grid-256.json');
const randPath = process.argv[2];
assert(randPath, 'Pass the exact RANDCorporation/milliondigits digits.txt as argument.');
const raw = fs.readFileSync(randPath);
const sha = crypto.createHash('sha1').update('blob ' + raw.length + '\0').update(raw).digest('hex');
assert.equal(sha, 'cb72b2b37aa240bf05b0ebe1c981e0c510c1e5e0');
console.log(JSON.stringify(analyze(JSON.parse(fs.readFileSync(gridPath,'utf8')),raw.toString('utf8')),null,2));
