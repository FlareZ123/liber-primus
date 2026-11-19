"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const M = 29;
const I2 = 15;
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const raw = fs.readFileSync(path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const signed2016 = fs.readFileSync(path.join(root, "resources/historical/cicada2016-4gq25-outguess.asc"), "utf8");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const gpTokens = corpus.translit.map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {number} x @returns {number} */
function mod(x) { return ((x % M) + M) % M; }

/** @param {number} x @param {number} y @returns {number[]} */
function H(x, y) { return [mod(x - y), mod(x + y)]; }

/** @param {number[]} v @returns {number[]} */
function shell5(v) { return [...H(v[0],v[4]), ...H(v[1],v[3]), v[2]]; }

/** @param {number[]} s @returns {number[]} */
function inv5(s) {
  const [d1,s1,d2,s2,c] = s;
  return [mod((d1+s1)*I2),mod((d2+s2)*I2),c,mod((s2-d2)*I2),mod((s1-d1)*I2)];
}

/**
 * @param {string} text
 * @param {number} page
 * @returns {{page:number,index:number,start:number,end:number,length:number,values:number[]}[]}
 */
function parsePage(text, page) {
  const words = [];
  const runes = [];
  let current = [];
  let start = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({page,index:words.length,start,end:start+current.length-1,length:current.length,values:current.slice()});
    current = [];
  };
  for (const ch of [...text]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if ((ch === "-" || ch === ".") && current.length) {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const s = word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");
  const out = [];
  for (let i=0;i<s.length;) {
    if (s.startsWith("ING",i)) { out.push(21); i+=3; continue; }
    if (s.startsWith("IO",i)) { out.push(27); i+=2; continue; }
    const token = gpTokens.find((t)=>s.startsWith(t.symbol,i));
    assert.ok(token, "unmapped GP spelling at " + s.slice(i));
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}

/** @param {{page:number,start:number,end:number,length:number}} w @returns {number[]} */
function geometryShell(w) {
  const x = mod(w.page * I2);
  return [x, mod(w.start-x), mod(w.end), x, mod(2*(w.end-w.start))];
}

const st = {p:23,g:5,a:6,b:15,A:8,B:19,K:2};
const parts = raw.split("%");
const words = [];
for (let i=0;i<55;i++) {
  const page = i <= 49 ? i : i + 1;
  words.push(...parsePage(parts[i], page));
}
const fives = words.filter((w)=>w.length===5);
assert.equal(fives.length,318);

const receiver = fives.find((w)=>w.page===38 && w.start===49);
assert.ok(receiver);
assert.deepEqual(receiver.values,[19,25,22,26,3]);
const key=[10,7,8,12,20];
const FOUND=[0,3,1,9,23];
assert.deepEqual(receiver.values.map((v,i)=>mod(v+key[i])),FOUND);
assert.deepEqual(shell5(key),[19,1,24,19,8]);
assert.deepEqual(geometryShell(receiver),shell5(key));
assert.deepEqual(inv5(geometryShell(receiver)),key);

const p28Lines=parts[28].split("/").map((line)=>[...line].map((ch)=>runeIndex.get(ch)).filter((v)=>v!==undefined)).filter((line)=>line.length);
const hereB=p28Lines[0][st.B-1];
const dhp=p28Lines[5][st.p-1];
assert.equal(hereB,22);
assert.equal(dhp,20);
const x=mod(receiver.page*I2);
assert.equal(x,st.B);
assert.equal(mod(receiver.start),dhp);
assert.equal(mod(receiver.start-x),mod(st.a-st.g));
assert.equal(mod(receiver.end),mod(-st.g));
assert.equal(mod(2*(receiver.end-receiver.start)),st.A);

const clear=signed2016.split("-----BEGIN PGP SIGNATURE-----")[0].split(/\r?\n\r?\n/).slice(1).join("\n");
const targets=[...new Map(clear.split(/[^A-Za-z0-9]+/).filter((v)=>/^[A-Za-z]+$/.test(v))
  .map((word)=>({word:word.toUpperCase(),values:gp(word)}))
  .filter((v)=>v.values.length===5).map((v)=>[v.values.join(","),v])).values()];
assert.deepEqual(targets.map((v)=>v.word),["HELLO","EMPTY","SEEKS","LIBER","WORDS","FOUND","FALSE"]);

const xFns=[["page",(w)=>mod(w.page)],["half",(w)=>mod(w.page*I2)],["double",(w)=>mod(2*w.page)]];
const yFns=[["start-x",(w,x0)=>mod(w.start-x0)],["x-start",(w,x0)=>mod(x0-w.start)]];
const zFns=[["start",(w)=>mod(w.start)],["-start",(w)=>mod(-w.start)],["end",(w)=>mod(w.end)],["-end",(w)=>mod(-w.end)]];
const wFns=[
 ["len",(w)=>mod(w.length)],["-len",(w)=>mod(-w.length)],
 ["span",(w)=>mod(w.end-w.start)],["-span",(w)=>mod(-(w.end-w.start))],
 ["2span",(w)=>mod(2*(w.end-w.start))],["-2span",(w)=>mod(-2*(w.end-w.start))],
 ["2len",(w)=>mod(2*w.length)],["-2len",(w)=>mod(-2*w.length)]
];

/** @param {number[]} shell @param {{values:number[]}} w @returns {string|null} */
function targetFor(shell,w) {
  const k=inv5(shell);
  const plain=w.values.map((v,i)=>mod(v+k[i]));
  const t=targets.find((v)=>v.values.join(",")===plain.join(","));
  return t ? t.word : null;
}

let fixedTotal=0;
const fixedHist=new Map();
const fixedHits=[];
for(const xf of xFns)for(const yf of yFns)for(const zf of zFns)for(const wf of wFns){
  fixedTotal++;
  const hits=[];
  for(const w of fives){
    const x0=xf[1](w);
    const sh=[x0,yf[1](w,x0),zf[1](w),x0,wf[1](w)];
    const target=targetFor(sh,w);
    if(target)hits.push({page:w.page,start:w.start,target,shell:sh,key:inv5(sh)});
  }
  fixedHist.set(hits.length,(fixedHist.get(hits.length)||0)+1);
  if(hits.length)fixedHits.push({id:[xf[0],yf[0],zf[0],wf[0]].join("|"),hits});
}
assert.equal(fixedTotal,192);
assert.deepEqual(Object.fromEntries([...fixedHist].sort((a,b)=>a[0]-b[0])),{"0":191,"1":1});
assert.deepEqual(fixedHits,[{
  id:"half|start-x|end|2span",
  hits:[{page:38,start:49,target:"FOUND",shell:[19,1,24,19,8],key}]
}]);

const repeatPairs=[];
for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)repeatPairs.push([i,j]);
let broadTotal=0;
const broadHist=new Map();
const broadHits=[];
for(const xf of xFns)for(const yf of yFns)for(const zf of zFns)for(const wf of wFns)for(const rp of repeatPairs)for(const yz of ["yz","zy"]){
  broadTotal++;
  const hits=[];
  for(const w of fives){
    const x0=xf[1](w), y=yf[1](w,x0), z=zf[1](w), sh=[null,null,null,null,wf[1](w)];
    sh[rp[0]]=x0; sh[rp[1]]=x0;
    const rem=[0,1,2,3].filter((i)=>!rp.includes(i));
    sh[rem[0]]=yz==="yz"?y:z;
    sh[rem[1]]=yz==="yz"?z:y;
    const target=targetFor(sh,w);
    if(target)hits.push({page:w.page,start:w.start,target,shell:sh,key:inv5(sh)});
  }
  broadHist.set(hits.length,(broadHist.get(hits.length)||0)+1);
  if(hits.length)broadHits.push({id:[xf[0],yf[0],zf[0],wf[0],rp.join(","),yz].join("|"),hits});
}
assert.equal(broadTotal,2304);
assert.deepEqual(Object.fromEntries([...broadHist].sort((a,b)=>a[0]-b[0])),{"0":2302,"1":2});
assert.deepEqual(broadHits.map((v)=>v.id),[
  "half|start-x|end|2span|0,3|yz",
  "half|x-start|end|-2len|1,3|zy"
]);

const p0Found=fives.find((w)=>w.page===0&&w.start===117);
assert.ok(p0Found);
assert.deepEqual(geometryShell(p0Found),[0,1,5,0,8]);
assert.deepEqual(inv5(geometryShell(p0Found)),[15,17,8,12,15]);
assert.deepEqual(p0Found.values.map((v,i)=>mod(v+inv5(geometryShell(p0Found))[i])),[27,19,19,22,17]);

const p38Rival=fives.find((w)=>w.page===38&&w.start===223);
assert.ok(p38Rival);
assert.deepEqual(geometryShell(p38Rival),[19,1,24,19,8]);
assert.deepEqual(p38Rival.values.map((v,i)=>mod(v+key[i])),[18,23,7,7,14]);

const exactHits=[];
for(const w of fives){
  const t=targetFor(geometryShell(w),w);
  if(t)exactHits.push({page:w.page,start:w.start,target:t});
}
assert.deepEqual(exactHits,[{page:38,start:49,target:"FOUND"}]);

console.log(JSON.stringify({
  receiver:{page:38,start:49,end:53,cipher:receiver.values,shell:geometryShell(receiver),key,plain:FOUND},
  stateGeometry:{pageHalf:x,startResidue:mod(receiver.start),dhp,endResidue:mod(receiver.end),hereB},
  fixedFamily:{total:fixedTotal,hist:Object.fromEntries([...fixedHist].sort((a,b)=>a[0]-b[0])),hits:fixedHits},
  broadFamily:{total:broadTotal,hist:Object.fromEntries([...broadHist].sort((a,b)=>a[0]-b[0])),hitIds:broadHits.map((v)=>v.id)},
  controls:{p0FoundOutput:[27,19,19,22,17],p38RivalOutput:[18,23,7,7,14]},
  exactHits
},null,2));
