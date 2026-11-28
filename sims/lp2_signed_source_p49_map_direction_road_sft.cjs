'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const MOD=29;
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const grid=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-grid-256.json'),'utf8'));
const signed=fs.readFileSync(path.join(ROOT,'resources/historical/cicada2016-4gq25-outguess.asc'),'utf8');
const glyph=new Map(corpus.runes.map((r,i)=>[r,i]));
const mod=x=>((x%MOD)+MOD)%MOD;
const inv=x=>{for(let i=1;i<MOD;i++)if(mod(x*i)===1)return i;throw new Error('no inverse');};

assert.deepEqual(grid.pages.map(p=>p.page),[49,50,51]);
assert.deepEqual(grid.pages.map(p=>p.rows),[10,13,9]);
assert(grid.pages.every(p=>p.cols===8));
const tokens=grid.pages.flatMap(p=>p.tokens),bytes=grid.pages.flatMap(p=>p.bytes);
assert.equal(tokens.length,256);
assert.equal(bytes.length,256);

const body=signed.split('-----BEGIN PGP SIGNATURE-----')[0];
const words=body.match(/\b[A-Za-z]+\b/g)
 .filter(w=>!['BEGIN','PGP','SIGNED','MESSAGE','Hash','SHA'].includes(w)).map(w=>w.toUpperCase());
assert.equal(words.length,43);

const signedRows=[];
for(let row=0;row<Math.ceil(words.length/8);row++){
 const start=row*8,end=Math.min(words.length,start+8);
 signedRows.push({row,start,endExclusive:end,words:words.slice(start,end),tokens:tokens.slice(start,end)});
}
assert.deepEqual(signedRows[2].words,['ARE','THE','MAP','THEIR','MEANING','IS','THE','ROAD']);
assert.deepEqual(signedRows[3].words,['AND','THEIR','NUMBERS','ARE','THE','DIRECTION','SEEK','AND']);
assert.equal(words[23],'ROAD');
assert.equal(words[29],'DIRECTION');
assert.equal(grid.pages[0].page,49);
assert.ok(23<grid.pages[0].rows*grid.pages[0].cols,'cell23 is physically on p49');

const p3=[13,23,2],leadInv=inv(p3[2]);
const fieldR=mod(-p3[1]*leadInv),fieldT=mod(-p3[0]*leadInv);
assert.deepEqual([fieldR,fieldT],[3,8]);

const divisible=[];
for(let i=0;i<words.length;i++){
 const value=bytes[i];
 if(value%MOD===0)divisible.push({index:i,word:words[i],token:tokens[i],value,rows:value/MOD});
}
assert.deepEqual(divisible,[
 {index:0,word:'HELLO',token:'3N',value:203,rows:7},
 {index:23,word:'ROAD',token:'1R',value:87,rows:3},
]);
assert.equal(divisible[1].rows,fieldR);

const mul=(x,y)=>[mod(x[0]*y[0]+fieldT*x[1]*y[1]),mod(x[0]*y[1]+x[1]*y[0]+fieldR*x[1]*y[1])];
const ev=a=>{let z=[0,0],p=[1,0];for(const c of a){z=[mod(z[0]+c*p[0]),mod(z[1]+c*p[1])];p=mul(p,[0,1]);}return z;};
const Q=[17,24],dlog=new Map();let state=[1,0];
for(let k=0;k<840;k++){dlog.set(state.join(','),k);state=mul(state,Q);}
assert.deepEqual(state,[1,0]);

const red=[];
for(const pr of ink.pages)for(const sp of(pr.red_spans||[])){
 const e=ev([...sp.runes].map(r=>glyph.get(r)));
 if(e[0]===0&&e[1]===0)continue;
 const k=dlog.get(e.join(','));assert.notEqual(k,undefined);
 red.push({page:pr.page,start:sp.start,length:sp.length,k,coord:[Math.floor(k/29),k%29]});
}
const p39=red.find(x=>x.page===39&&x.start===119),p7=red.find(x=>x.page===7&&x.start===194);
assert(p39&&p7);
assert.deepEqual(p39.coord,[17,23]);
assert.deepEqual(p7.coord,[20,23]);
const roadStep=bytes[23];
assert.equal(roadStep,87);
assert.equal(p39.k+roadStep,p7.k);
assert.deepEqual(words.slice(p39.coord[0],p39.coord[1]+1),['THE','MAP','THEIR','MEANING','IS','THE','ROAD']);
assert.deepEqual(words.slice(p7.coord[0],p7.coord[1]+1),['MEANING','IS','THE','ROAD']);

const terminalK=p7.k+roadStep;
assert.equal(terminalK,690);
const terminal=[Math.floor(terminalK/29),terminalK%29];
assert.deepEqual(terminal,[23,23]);
assert.deepEqual(terminal.map(i=>words[i]),['ROAD','ROAD']);

const a60=grid.alphabet,a59=a60.replace('f','');
const value=(token,alphabet,radix)=>radix*alphabet.indexOf(token[0])+alphabet.indexOf(token[1]);
assert.equal(value(tokens[23],a60,60),87);
assert.equal(value(tokens[23],a59,59),86);
assert.deepEqual([Math.floor((p39.k+86)/29),(p39.k+86)%29],[20,22]);

const byK=new Map(red.map(x=>[x.k,x]));
const printedHits=[];
for(const source of red){
 const col=source.coord[1],step=bytes[col],target=byK.get((source.k+step)%840);
 if(target&&target!==source)printedHits.push({source:[source.page,source.start,source.coord],word:words[col],cell:col,step,target:[target.page,target.start,target.coord]});
}
assert.deepEqual(printedHits,[
 {source:[39,119,[17,23]],word:'ROAD',cell:23,step:87,target:[7,194,[20,23]]},
]);

const result={
 schema:'lp2-signed-source-p49-map-direction-road-v1',
 classification:'exact source-instruction/table/Q-coordinate cross-lock; navigation only, no plaintext',
 table:{pages:grid.pages.map(p=>p.page),pageRowCounts:grid.pages.map(p=>p.rows),columns:8,signedWords:words.length,signedRows,source:grid.source,sourceNotes:grid.source_notes},
 instructionRows:{
   map:signedRows[2],
   direction:signedRows[3],
 },
 signedCellVerticalDirections:divisible,
 p3Field:{trinomial:p3,relation:`u^2=${fieldR}u+${fieldT}`,fieldR},
 roadNavigation:{
   source:p39,
   sourcePhrase:words.slice(p39.coord[0],p39.coord[1]+1).join(' '),
   address:{word:'ROAD',index:23,physicalPage:49,tableRow:2,tableCol:7,token:tokens[23],base60:87,base59:86},
   canonicalStep:`${fieldR}*DIRECTION29`,
   target:p7,
   targetPhrase:words.slice(p7.coord[0],p7.coord[1]+1).join(' '),
   repeat:{k:terminalK,coord:terminal,words:['ROAD','ROAD']},
 },
 finiteControl:{nonzeroPrintedRedStates:red.length,canonicalWordNumberToBase60DirectionHits:printedHits},
 interpretation:'The authenticated instruction literally aligns its zero-based words with the first p49 table rows. Under the frozen Q base29 coordinate map, ROAD word23 addresses physical p49 cell23; its canonical base60 number87 is fieldR3 times DIRECTION29, so it is a pure three-row move preserving the ROAD column. This sends the printed p39 red interval to printed p7 and a second identical step contracts to singleton ROAD. Base59 breaks the column-preserving move and misses p7.',
};
const json=JSON.stringify(result,null,2);
console.log(json);
if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'source-test-output.json'),json);
