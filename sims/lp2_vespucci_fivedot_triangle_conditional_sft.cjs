'use strict';

/** @typedef {[number,number]} Point */
/** @type {Point[]} */
const dots = [[873,2517],[921,2708],[1104,2447],[1408,2747],[1604,2686]];

/** @param {Point} p @param {Point} q @param {Point} r */
function error(p,q,r) {
  const a=[q[0]-p[0],q[1]-p[1]];
  const b=[r[0]-p[0],r[1]-p[1]];
  const cosine=(a[0]*b[0]+a[1]*b[1])/(Math.hypot(...a)*Math.hypot(...b));
  return Math.abs(Math.acos(Math.max(-1,Math.min(1,cosine)))*180/Math.PI-90);
}
/** @param {Point[]} p @param {number[]} t */
function triangle(p,t) {
  const [a,b,c]=t;
  return Math.min(error(p[a],p[b],p[c]),error(p[b],p[c],p[a]),error(p[c],p[a],p[b]));
}
/** @param {Point[]} p */
function anyThree(p) {
  let best=Infinity;
  for(let i=0;i<3;i++) for(let j=i+1;j<4;j++) for(let k=j+1;k<5;k++)
    best=Math.min(best,triangle(p,[i,j,k]));
  return best;
}
/** @param {number[]} x @returns {number[][]} */
function perms(x) {
  if(x.length===0) return [[]];
  const out=[];
  for(let i=0;i<x.length;i++)
    for(const tail of perms(x.filter((_,j)=>j!==i))) out.push([x[i],...tail]);
  return out;
}
const fixed=triangle(dots,[0,1,2]), global=anyThree(dots);
const permutations=perms(dots.map(p=>p[1]));
const results=permutations.map(y=>dots.map((p,i)=>[p[0],y[i]]));
const fixedHits=results.filter(p=>triangle(p,[0,1,2])<=fixed+1e-9).length;
const globalHits=results.filter(p=>anyThree(p)<=global+1e-9).length;
console.log(JSON.stringify({fixedAngleErrorDegrees:fixed,allTrioAngleErrorDegrees:global,
  permutations:results.length,fixedHits,globalHits,
  sourceSelectedTail:fixedHits/results.length,postSelectedTail:globalHits/results.length},null,2));
if(results.length!==120||fixedHits!==18||globalHits!==39)
  throw new Error('Original-dot source calibration differs');
