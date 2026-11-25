/** Exhaustively compare fixed-key output distributions under uniform plaintext. */
const Q = 5, rate = 0.81, n = 6;
/** @param {number[]} key @param {"hold"|"spend"} mode @param {"uniform"|"target"} rule */
function distribution(key, mode, rule) {
  const mass = new Map();
  function walk(i,j,c,w) {
    if(i===n){const k=c.join("");mass.set(k,(mass.get(k)||0)+w);return;}
    for(let p=0;p<Q;p++){
      const u=(p+key[j])%Q, prev=c.at(-1);
      if(i===0||u!==prev){walk(i+1,j+1,[...c,u],w/Q);continue;}
      walk(i+1,j+1,[...c,u],w*(1-rate)/Q);
      const target=i>=2?(3-2*c[i-2]+2*Q)%Q:-1;
      const choices=rule==="target"&&target>=0&&target!==prev?[target]:Array.from({length:Q},(_,k)=>k).filter(k=>k!==prev);
      for(const v of choices)walk(i+1,j+(mode==="spend"?1:0),[...c,v],w*rate/(Q*choices.length));
    }
  }
  walk(0,0,[],1);return mass;
}
for(const mode of ["hold","spend"])for(const rule of ["uniform","target"]){
  const a=distribution([0,1,2,3,4,0,1,2],mode,rule),b=distribution([4,4,3,1,0,2,4,2],mode,rule);
  const result={mode,rule,outputs:a.size,mass:[...a.values()].reduce((x,y)=>x+y,0),maxDiff:Math.max(...[...a].map(([k,v])=>Math.abs(v-b.get(k))))};
  console.log(JSON.stringify(result));
  if(result.outputs!==Q**n||Math.abs(result.mass-1)>1e-12||result.maxDiff>1e-15)throw Error("nonidentifiability check failed");
}
