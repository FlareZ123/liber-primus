'use strict';

const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(
  path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));

const mod=x=>((x%29)+29)%29;
const H4=([a,b,c,d])=>[mod(a-d),mod(b-c),mod(b+c),mod(a+d)];
const page=corpus.pages.find(p=>p.page===15);
assert(page);
assert.equal(page.indices.length,159);

// #69 established that the original p15 arrow points from the 9-rune heading
// to the following 150-rune body. Agent2's source-only spiral gate established
// the red-origin clockwise traversal and q=4 block size.
const body=page.indices.slice(9);
assert.equal(body.length,150);

const grid=[
  [3258,3222,3152,3038],
  [3278,3299,3298,2838],
  [3288,3294,3296,2472],
  [4516,1206,708,1820],
];
const spiral=[
  [1,1],[1,2],[2,2],[2,1],
  [2,0],[1,0],[0,0],[0,1],
  [0,2],[0,3],[1,3],[2,3],
  [3,3],[3,2],[3,1],[3,0],
];
const residues=spiral.map(([r,c])=>grid[r][c]%29);
const tape=[];
for(let i=0;i<16;i+=4) tape.push(...H4(residues.slice(i,i+4)));
assert.deepEqual(tape,[
  5,2,11,10, 8,20,11,14,
  13,26,18,27, 1,24,0,14
]);

// Exact solved-p56 transferable semantics:
// - encryption is C=P+key (mod29);
// - plaintext F (index0) is transparent: C=F and key does not advance;
// - consuming a key symbol may never produce plaintext F.
// Here the source-selected 16-value H4 tape repeats cyclically.
let states=[{keyIndex:0,holds:[]}];
const trace=[];
for(let i=0;i<body.length;i++){
  const C=body[i];
  const next=[];
  const killed=[];
  for(const st of states){
    if(C===0){
      next.push({keyIndex:st.keyIndex,holds:[...st.holds,i]});
    }
    const k=tape[st.keyIndex%tape.length];
    const P=mod(C-k);
    if(P!==0){
      next.push({keyIndex:st.keyIndex+1,holds:st.holds});
    }else{
      killed.push({
        keyIndex:st.keyIndex,
        tapeIndex:st.keyIndex%tape.length,
        key:k,
        holds:st.holds,
        cipher:C,
      });
    }
  }
  trace.push({bodyOffset:i,pageOffset:i+9,cipher:C,before:states.length,after:next.length,killed});
  states=next;
  if(states.length===0) break;
}

assert.equal(states.length,0);
const collapse=trace.at(-1);
assert.deepEqual({
  bodyOffset:collapse.bodyOffset,
  pageOffset:collapse.pageOffset,
  cipher:collapse.cipher,
  before:collapse.before,
  after:collapse.after,
}, {
  bodyOffset:26,
  pageOffset:35,
  cipher:26, // Y
  before:1,
  after:0,
});
assert.deepEqual(collapse.killed,[{
  keyIndex:25,
  tapeIndex:9,
  key:26,
  holds:[9],
  cipher:26,
}]);

console.log(JSON.stringify({
  schema:1,
  page:15,
  receiver:'source-arrow-selected 150-rune body after 9-rune heading',
  key:'red-origin clockwise spiral -> mod29 -> q=4 H4 blocks',
  tape,
  cipher:'solved-p56 additive inverse with strict transparent-plaintext-F hold',
  legalPathsAtEnd:states.length,
  collapse,
  decision:
    'The exact source-selected spiral-H4 tape cannot decode the p15 arrow body under solved-p56 transparent-F semantics: every legal inverse branch is eliminated by page offset35.',
},null,2));
