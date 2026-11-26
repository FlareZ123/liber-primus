'use strict';
/** The 2013 LIONEL Tyro Tutorial, p104 M-2, is the published puzzle. */
function experiment() {
  const groups="92258 75948 39221 78766 92652 62528 32594 64752 83576 34546 35352 58753 52183 13691 67995 46797 94954 62135 82631 69384 45463 53528 42535 41938 26225 92358".split(" ");
  const c=groups.join("");
  const morse=[".-","-...","-.-.","-..",".","..-.","--.","....","..",".---","-.-",".-..","--","-.","---",".--.","--.-",".-.","...","-","..-","...-",".--","-..-","-.--","--.."];
  const pairs=[]; for(const a of ".-x")for(const b of ".-x")pairs.push(a+b);
  /** @param {string} key */
  function table(key) {
    const rank=[...key].map((c,i)=>[c,i]).sort((a,b)=>a[0].localeCompare(b[0])||a[1]-b[1]);
    const map=[];for(let i=0;i<9;i++)map[i+1]=pairs[rank[i][1]];
    return map;
  }
  /** @param {string} t */
  function decode(t) {
    return t.replace(/^x+|x+$/g,"").split("xx").map(w=>w.split("x").map(v=>morse.includes(v)?String.fromCharCode(65+morse.indexOf(v)):"?").join("")).join(" ");
  }
  /** @param {string} t */
  function invalid(t) { return t.includes("xxx")||t.split("x").slice(1,-1).some(v=>v&&!morse.includes(v)); }
  const trials=["CHRISTMAS","BOXINGDAY"].map(key=>{
    const map=table(key),prefix=[...c.slice(0,65)].map(x=>map[+x]).join("");
    return {key,map,prefixInvalid:invalid(prefix)};
  });
  const winner=trials.filter(x=>!x.prefixInvalid);
  if(winner.length!==1)throw Error("ambiguous prefix");
  const tr=[...c].map(x=>winner[0].map[+x]).join("");
  const plain=decode(tr);
  const expected="THE MAN WHO GETS HIS LADYS APPLAUSE MUST ACT NOT LOOK LIKE SANTA CLAUS BURMA SHAVE";
  if(plain!==expected)throw Error("published solution mismatch");
  const encoded=expected.split(" ").map(w=>[...w].map(v=>morse[v.charCodeAt(0)-65]).join("x")).join("xx")+"xx";
  const replay=encoded.match(/../g).map(x=>winner[0].map.indexOf(x)).join("");
  if(replay!==c)throw Error("re-encoding mismatch");
  const joins=groups.slice(0,-1).map((_,i)=>2*5*(i+1));
  const trueBoundaries=[];for(let i=0;i<tr.length-1;i++)if(tr.slice(i,i+2)==="xx")trueBoundaries.push(i);
  const coincide=joins.filter(i=>trueBoundaries.some(j=>j<=i&&i<=j+2));
  return {length:c.length,trials,winner:winner[0].key,plaintext:plain,heldCipherDigits:65,roundtrip:replay===c,printedCuts:joins.length,internalMorseWordCuts:trueBoundaries.filter(i=>i+2<tr.length).length,compatibleCuts:coincide.length,coincide};
}
if(require.main===module)console.log(JSON.stringify(experiment(),null,2));
module.exports={experiment};
