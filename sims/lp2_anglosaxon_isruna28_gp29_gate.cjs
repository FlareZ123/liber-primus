#!/usr/bin/env node
'use strict';

// Historical Anglo-Saxon cipher-rune bridge:
// (A) Derolez 1954 Salzburg Isruna: source-fixed 8+8+8+4 natural groups.
// (B) Sermon 2001 Hackness reconstruction: four 8-rune rows covering 32
//     symbols, but the mapping from observed tree-rune groups to futhorc rows
//     is explicitly unknown (24 permutations). Sermon's preferred permutation
//     19 is recoverable from his worked BOSA output.
//
// This script distinguishes alphabet coverage from group-registration evidence.

const fs=require('fs');
const corpus=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const gp=corpus.translit;

const salzburg=[
 ['F','U','TH','O','R','C','G','W'],
 ['H','N','I','J','EO','P','X','S'],
 ['T','B','E','M','L','NG','OE','D'],
 ['A','AE','Y','EA']
];
const salFlat=salzburg.flat();
const salCoords=Object.fromEntries(salzburg.flatMap((row,g)=>row.map((x,p)=>[x,[g+1,p+1]])));
const racco=[['R',1,5],['A',4,1],['C',1,6],['C',1,6],['O',1,4]];
for(const [s,g,p] of racco){
 if(JSON.stringify(salCoords[s])!==JSON.stringify([g,p]))throw Error('RACCO mismatch '+s);
}

// Sermon Figure 5 natural futhorc rows. "IO" is historical Ior; compare it
// to GP's IA label without changing either source.
const hackness=[
 ['F','U','TH','O','R','C','G','W'],
 ['H','N','I','J','EO','P','X','S'],
 ['T','B','E','M','L','NG','OE','D'],
 ['A','AE','Y','EA','IO','CALC','GAR','CWEORTH']
];
const gpToHack=x=>x==='IA'?'IO':x;
const hackSet=new Set(hackness.flat());
const gpCovered=gp.filter(x=>hackSet.has(gpToHack(x)));

// Sermon Table 5 permutation 19 maps observed tree groups to natural futhorc
// rows as [4,1,2,3], because its eight legible coordinates decode:
// 4/8=d, 4/2=b, 2/4=o, 3/8=s, 1/1=a, 3/5=e, 2/4=o, 3/2=n.
const perm19=[4,1,2,3];
function decodeTree(group,pos,rowMap){
 const row=rowMap[group-1];
 return hackness[row-1][pos-1];
}
const bosaCoords=[[4,8],[4,2],[2,4],[3,8],[1,1],[3,5],[2,4],[3,2]];
const bosa=bosaCoords.map(([g,p])=>decodeTree(g,p,perm19));
if(bosa.join('')!=='DBOSAEON')throw Error('permutation19 BOSA reconstruction mismatch');

const p0=[3,3];
const naturalP0=hackness[p0[0]-1][p0[1]-1];
const preferredP0=decodeTree(p0[0],p0[1],perm19);

console.log(JSON.stringify({
 salzburg_fixed28:{
  partition:[8,8,8,4],rows:salzburg,
  gp_covered:gp.filter(x=>salFlat.includes(x)),
  gp_missing:gp.filter(x=>!salFlat.includes(x)),
  p0_3_3:naturalP0,
  racco_control:racco
 },
 hackness_full32:{
  natural_rows:hackness,
  gp_coverage_count:gpCovered.length,
  gp_uncovered:gp.filter(x=>!hackSet.has(gpToHack(x))),
  alias:{GP_IA:'historical Ior/IO'},
  registration:'unknown 24-way tree-group -> futhorc-row permutation',
  natural_registration_p0_3_3:naturalP0,
  sermon_preferred_permutation19_tree_to_row:perm19,
  sermon_preferred_BOSA_output:bosa.join(''),
  preferred_registration_p0_3_3:preferredP0
 },
 p0:{
  first_black_gp:gp[2],
  salzburg_3_3:naturalP0,
  hackness_perm19_3_3:preferredP0,
  matches_first_black:{
   salzburg:naturalP0===gp[2],
   hackness_perm19:preferredP0===gp[2]
  }
 },
 decision:'Full historical alphabet coverage exists in the Hackness reconstruction, but the required group registration is source-underdetermined. Salzburg fixes registration but stops at 28. Neither direct English convention selects p0 first-black TH.'
},null,2));
