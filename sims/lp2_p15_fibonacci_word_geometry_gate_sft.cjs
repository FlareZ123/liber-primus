'use strict';
const assert = require('node:assert/strict');
function experiment() {
  const grid = [[3258,3222,3152,3038],[3278,3299,3298,2838],[3288,3294,3296,2472],[4516,1206,708,1820]];
  const fib = [0,1,2];
  while (fib.length < 16) fib.push(fib.at(-1)+fib.at(-2));
  const primes = [];
  for (let n=2; primes.length<=fib.at(-1); n++) {
    if (primes.every(p=>p*p>n || n%p!==0)) primes.push(n);
  }
  const path = fib.map(n => {
    const v=Math.abs(3301-primes[n]);
    const row=grid.findIndex(r=>r.includes(v));
    return [row,grid[row].indexOf(v)];
  });
  const dirs=path.slice(1).map(([r,c],i)=>[r-path[i][0],c-path[i][1]]);
  const dirnames=dirs.map(([r,c])=>({'0,1':'E','1,0':'S','0,-1':'W','-1,0':'N'})[[r,c].join(',')]);
  const turns=dirs.slice(1).map(([r,c],i)=>{
    const [a,b]=dirs[i], det=b*r-a*c;
    return det>0?'R':det<0?'L':a===r&&b===c?'S':'U';
  }).join('');
  const symbols=turns.replace(/R|L/g,'0').replace(/S/g,'1');
  const swapped=symbols.replace(/./g,x=>x==='0'?'1':'0');
  let word='0';
  while(word.length<100)word=word.replace(/./g,x=>x==='0'?'01':'0');
  const rule=word.replace(/./g,(x,i)=>x==='1'?'0':i%2===0?'1':'2');
  // OEIS A156596 (2009 author entry), indices 1..28; first 8 are the worked prefix.
  const source='1012020210120202101012021010';
  if(rule.slice(0,8)!==source.slice(0,8)||rule.slice(8,28)!==source.slice(8))throw Error('historical control mismatch');
  // Every 1 in the morphism image is the end of 01 and the next image begins with 0.
  // Thus the infinite word cannot contain 11, independent of phase.
  if(!symbols.includes('11')||!swapped.includes('11'))throw Error('source invariant did not exclude both labellings');
  return {fib,path,directions:dirnames.join(''),turns,symbols,swapped,forbidden11:[symbols.indexOf('11'),swapped.indexOf('11')],historicalPrefix:source.slice(0,8),historicalHeld20:source.slice(8),predictedHeld20:rule.slice(8,28),controlMatch:28};
}
if(require.main===module)console.log(JSON.stringify(experiment(),null,2));
module.exports={experiment};
