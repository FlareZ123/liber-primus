'use strict';
/**
 * A finite FIRST-OPCODE candidate on the 25-word original cuneiform item3:
 * "shed circumferences" => 49 GP29 outer and 49 GP29 inner symbols;
 * historically supplied 2014 7x7 magic square => 7x7 matrix arithmetic.
 * If the exterior matrix O is a transmitted key, the original interior
 * matrix I could be C=O*P or C=P*O over GP29/GF29. Test both orders, plus
 * exactly the two role-swaps, without fitting a key/phase/language.
 *
 * Result includes an intriguing six-rune "APPEND" token run in ONE
 * quotient, but ALL 49-rune candidate outputs lack connected LP prose.
 * A postselected short word MUST NOT be promoted to plaintext.
 * Windows11 Node22 CommonJS read-only original-input SFT.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources','liber-primus','lp2-corpus.json'),'utf8'));
const transcript=fs.readFileSync(path.join(root,'resources','lp2-transcription.txt'),'utf8').replace(/\r/g,'');
const map=new Map(corpus.runes.map((r,i)=>[r,i]));
const page37=transcript.split('%')[37];
let current=[],start=0,offset=0,words=[];
const flush=()=>{if(current.length){words.push({start,end:offset,values:current});current=[];}};
for(const c of page37){
  if(map.has(c)){if(!current.length)start=offset;current.push(map.get(c));offset++;}
  else if(c==='/'||/\s/u.test(c)){}else flush();
}
flush();
assert.equal(offset,228);
const item=words.filter(w=>w.start>=91&&w.end<=189).map(w=>w.values);
assert.equal(item.length,25);
const inside=item.flatMap(w=>w.slice(1,-1));
const outside=item.flatMap(w=>w.length===1?[w[0]]:[w[0],w[w.length-1]]);
assert.deepEqual([inside.length,outside.length],[49,49]);
const mod=x=>((x%29)+29)%29;
/** @param {number[]} source */
const tile=source=>Array.from({length:7},(_,i)=>source.slice(i*7,i*7+7));
/** @param {number[][]} a @param {number[][]} b */
const mul=(a,b)=>a.map(r=>b[0].map((_,j)=>mod(r.reduce((s,v,k)=>s+v*b[k][j],0))));
/** @param {number[][]} input */
function invert(input){
  const n=input.length;
  const t=input.map((r,i)=>[...r,...Array.from({length:n},(_,j)=>+(i===j))]);
  for(let col=0;col<n;col++){
    const pivot=t.findIndex((r,i)=>i>=col&&r[col]!==0);
    assert(pivot>=0,'both source-data matrices must be invertible');
    [t[pivot],t[col]]=[t[col],t[pivot]];
    const scale=Array.from({length:28},(_,i)=>i+1).find(x=>mod(x*t[col][col])===1);
    assert(scale!==undefined);
    t[col]=t[col].map(v=>mod(v*scale));
    for(let i=0;i<n;i++)if(i!==col){
      const q=t[i][col];
      t[i]=t[i].map((v,j)=>mod(v-q*t[col][j]));
    }
  }
  return t.map(r=>r.slice(n));
}
/** @param {number[]} a */
const ioc=a=>{
  const h=Array(29).fill(0);for(const v of a)h[v]++;
  return h.reduce((s,v)=>s+v*(v-1),0)/(a.length*(a.length-1));
};
/** @param {number[]} a */
const translit=a=>a.map(i=>corpus.translit[i]).join('');
/** @param {number[]} sequence @param {number[]} target */
function positions(sequence,target){
  return sequence.flatMap((v,i)=>target.every((w,j)=>sequence[i+j]===w)?[i]:[]);
}
const I=tile(inside),O=tile(outside),Ii=invert(I),Oi=invert(O);
const ident=Array.from({length:7},(_,i)=>Array.from({length:7},(_,j)=>+(i===j)));
assert.deepEqual(mul(I,Ii),ident);
assert.deepEqual(mul(O,Oi),ident);
const solutions=[
  {law:'I=O*P',plain:mul(Oi,I),known:O,forward:'left',source:I},
  {law:'I=P*O',plain:mul(I,Oi),known:O,forward:'right',source:I},
  {law:'O=I*P',plain:mul(Ii,O),known:I,forward:'left',source:O},
  {law:'O=P*I',plain:mul(O,Ii),known:I,forward:'right',source:O}
];
const native=tile(corpus.pages.find(p=>p.page===57).indices.slice(0,49));
const append=[24,13,13,18,9,23];
const results=solutions.map(row=>{
  const replay=row.forward==='left'?mul(row.known,row.plain):mul(row.plain,row.known);
  assert.deepEqual(replay,row.source,'original 49-runic tile must reencrypt');
  const plant=row.forward==='left'?mul(row.known,native):mul(native,row.known);
  const inverse=invert(row.known);
  assert.deepEqual(row.forward==='left'?mul(inverse,plant):mul(plant,inverse),native);
  const flat=row.plain.flat();
  return {law:row.law,originalReplayed:49,plantedNativeP57Recovered:49,
    decodedIoc:ioc(flat),runeCount:49,englishSixRuneAppendPositions:positions(flat,append),
    output:translit(flat)};
});
assert.deepEqual(results.map(x=>x.englishSixRuneAppendPositions),[[5],[],[],[]]);
assert.deepEqual(results.map(x=>x.decodedIoc),[
  0.04336734693877551,0.0391156462585034,0.04336734693877551,0.025510204081632654
]);
console.log(JSON.stringify({
  puzzleClues:'25 original words; SHED yields 49 GP exterior and 49 GP interior symbols; signed 2014 order-seven square motivates matrix dimension',
  originalPage:37,originalItemNumber:3,originalRuneSpan:[91,189],
  wordLengths:item.map(x=>x.length),allTileOperandsSourceDerived:true,
  sourceSquareNotAutomaticallyOperative:true,
  interpretation:'A short APPEND six-rune island in O^-1*I is a postobserved candidate, not an authenticated instruction or complete readable plaintext. No other quotient or full numbered unit yields plaintext.',
  results
},null,2));
