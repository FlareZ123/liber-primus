"use strict";
/**
 * Exact all-secret original-cipher gate for a provisional signed-2016
 * HELLO=LIBER=243 -> first LP2 chapter 729=3*243 share interpretation.
 *
 * Both original-chapter layouts are frozen: consecutive 243-rune tapes
 * or interleaved 3-way tapes. Search every nonzero GF29 linear projection
 * of all three tapes and allow ANY stationary secret bijection of the
 * output rune alphabet. Such a bijection cannot change the GP29 index
 * of coincidence (IoC), providing an exact all-key statistic.
 *
 * Source caveat: signed-message word-value arithmetic is genuine but
 * the 2016 source never instructs a player to use 243 as a share width.
 * Zero recovered LP2 plaintext. Node.js 22 CommonJS; read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");

const read = file => fs.readFileSync(file, "utf8");
const source = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const letter = new Map(source.translit.map((value, index) => [value,index]));
const mod = x => ((x % 29) + 29) % 29;

/**
 * Source GP29 spelling, consistent with repository English controls.
 * @param {string} text
 * @returns {number[]}
 */
function gpEnglish(text) {
  const str = text.toUpperCase().replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const out = [];
  for (let i=0;i<str.length;i++) {
    if (!/[A-Z]/.test(str[i]))continue;
    if (str.startsWith("ING",i)) {
      out.push(letter.get("NG")); i+=2;
    } else if (letter.has(str.slice(i,i+2))) {
      out.push(letter.get(str.slice(i,i+2))); i++;
    } else if (letter.has(str[i])) {
      out.push(letter.get(str[i]));
    }
  }
  return out;
}

/** @param {number[]} data @returns {number} */
function collisionCount(data) {
  const freq = new Uint16Array(29);
  for (const sym of data)freq[sym]++;
  return freq.reduce((n,x) => n + x*(x-1),0);
}

/**
 * Exact sliding-window minimum collision count, O(n*29) for fixed 29.
 * @param {number[]} data
 * @param {number} size
 * @returns {{windows:number,minimum:number,offset:number}}
 */
function minWindowCollision(data,size) {
  assert(data.length >= size);
  const f = new Int32Array(29);
  for(let i=0;i<size;i++)f[data[i]]++;
  let count=f.reduce((n,x)=>n+x*(x-1),0);
  let minimum=Infinity,offset=-1;
  for(let i=0;i<=data.length-size;i++) {
    if(count<minimum){minimum=count;offset=i;}
    if(i<data.length-size) {
      const old=data[i],next=data[i+size];
      count-=2*(f[old]-1);f[old]--;
      count+=2*f[next];f[next]++;
    }
  }
  return {windows:data.length-size+1,minimum,offset};
}

/**
 * All GF29 linear projections, eliminating 29^3 field coefficient keys.
 * Scalar-equivalent nonzero triples are intentionally included.
 * @param {number[][]} shares
 */
function maxLinearProjection(shares) {
  const [A,B,C]=shares;
  assert.equal(A.length,243);
  assert.equal(B.length,243);
  assert.equal(C.length,243);
  let maximum=-1,keys=0,oneWinner=null;
  for(let a=0;a<29;a++)for(let b=0;b<29;b++)
    for(let c=0;c<29;c++) {
      if(!(a||b||c))continue; // all-zero is a constant register.
      const h = new Uint16Array(29);
      for(let j=0;j<243;j++)
        h[mod(a*A[j]+b*B[j]+c*C[j])]++;
      const collisions=h.reduce((n,v)=>n+v*(v-1),0);
      if(collisions>maximum){
        maximum=collisions;keys=1;oneWinner=[a,b,c];
      }else if(collisions===maximum)keys++;
    }
  return {maximum,keys,oneWinner,checked:29**3-1,
    maxIoC:maximum/(243*242)};
}

function run() {
  const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
  assert(signed.includes("Hello."));
  assert(signed.includes("Liber Primus"));
  const gpValue = word => gpEnglish(word).reduce((n,i)=>n+source.prime[i],0);
  assert.deepEqual([gpValue("HELLO"),gpValue("LIBER")],[243,243]);

  const original=source.pages.filter(p=>p.page<=2).flatMap(p=>p.indices);
  assert.deepEqual(source.pages.slice(0,3).map(p=>p.indices.length),
    [262,266,201]);
  assert.equal(original.length,729);
  const layouts={
    consecutive:[
      original.slice(0,243),original.slice(243,486),
      original.slice(486,729)
    ],
    interleaved:[0,1,2].map(k=>original.filter((_,i)=>i%3===k))
  };

  const results={};
  let maximalOriginal=0;
  for(const [name,shares] of Object.entries(layouts)) {
    const [A,B,C]=shares;
    const secret=A.map((x,i)=>mod(3*x-3*B[i]+C[i]));
    const fourth=A.map((x,i)=>mod(x-3*B[i]+3*C[i]));
    const proj=maxLinearProjection(shares);
    maximalOriginal=Math.max(maximalOriginal,proj.maximum);
    results[name]={...proj,
      shamirSecretIoC:collisionCount(secret)/(243*242),
      shamirFourthIoC:collisionCount(fourth)/(243*242),
      shamirFirst60:secret.slice(0,60).map(i=>source.translit[i]).join("")
    };
  }
  assert.deepEqual([results.consecutive.maximum,
    results.interleaved.maximum],[2278,2268]);
  assert.deepEqual([results.consecutive.keys,
    results.interleaved.keys],[28,28]);

  const controlPaths=[
    "resources/control/shakespeare_first300k.txt",
    "resources/control/gibran_prophet_58585.txt",
    "resources/control/emerson_essays_2944.txt"
  ];
  const controls={};
  for(const path of controlPaths) {
    const encoded=gpEnglish(read(path));
    const v=minWindowCollision(encoded,243);
    assert(v.minimum>maximalOriginal,
      "Source-native 243-symbol window crosses the all-secret bound");
    controls[path]={runes:encoded.length,
      windows:v.windows,
      leastCollisionCount:v.minimum,
      leastIoC:v.minimum/(243*242),
      leastOffset:v.offset};
  }
  assert.equal(Object.values(controls).reduce((n,v)=>n+v.windows,0),602697);
  assert.deepEqual(controlPaths.map(p=>controls[p].leastCollisionCount),
    [2822,3046,2916]);

  // Full source-native positive: generate an arbitrary quadratic 3-share
  // ciphertext of length 729, recover its 243 authentic GP29 plaintext
  // symbols with Shamir's x=0 linear interpolation.
  const plant=gpEnglish(read(controlPaths[0])).slice(1200,1443);
  assert.equal(plant.length,243);
  const forward=x=>plant.map((v,i)=>
    mod(v+(7*i+3)*x+(13*i+11)*x*x));
  const [A,B,C,D]=[1,2,3,4].map(forward);
  const recovered=A.map((v,i)=>mod(3*v-3*B[i]+C[i]));
  const extrapolated=A.map((v,i)=>mod(v-3*B[i]+3*C[i]));
  assert.deepEqual(recovered,plant);
  assert.deepEqual(extrapolated,D);
  assert(collisionCount(plant)>maximalOriginal);

  return {
    hypothesis:"2016 HELLO=LIBER=243, LP2 first chapter=729 -> 3x243 share",
    classification:"all-secret stationary linear + bijective output negative",
    original:{chapterLength:729,layouts:results},
    languageControl:{sources:controlPaths.length,
      windows:Object.values(controls).reduce((n,v)=>n+v.windows,0),
      controls},
    nativePositive:{decoded:recovered.length,
      fourthPredicted:extrapolated.length,
      plantIoC:collisionCount(plant)/(243*242)},
    decision:"No original LP2 unknown plaintext; original share IoCs below every reference native GP-English window. Need source-selected different operation."
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,gpEnglish,minWindowCollision,maxLinearProjection};
