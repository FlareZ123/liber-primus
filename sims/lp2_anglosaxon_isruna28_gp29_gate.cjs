#!/usr/bin/env node
'use strict';

// #3250: historical Anglo-Saxon Isruna/Hahalruna coordinate gate.
// Source-fixed 28-rune row follows Derolez (1954), Salzburg Isruna tract:
// four groups 8+8+8+4, group first and position second.
// The worked RACCO example fixes the natural order:
// R=1/5, A=4/1, C=1/6, C=1/6, O=1/4.
//
// This script compares that exact 28-coordinate row to the signed GP29 order.
// It does not invent a coordinate for the one unmatched GP rune.

const fs=require('fs');
const corpus=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));

const historical=[
  'F','U','TH','O','R','C','G','W',
  'H','N','I','J','EO','P','X','S',
  'T','B','E','M','L','NG','OE','D',
  'A','AE','Y','EA'
];

if(historical.length!==28)throw Error('historical table length');
const coords=[];
for(let i=0;i<historical.length;i++){
  coords.push({symbol:historical[i],group:Math.floor(i/8)+1,position:(i%8)+1});
}

// Verify the source's worked RACCO coordinates.
const expectedRacco=[
  {symbol:'R',group:1,position:5},
  {symbol:'A',group:4,position:1},
  {symbol:'C',group:1,position:6},
  {symbol:'C',group:1,position:6},
  {symbol:'O',group:1,position:4}
];
for(const x of expectedRacco){
  const y=coords.find(z=>z.symbol===x.symbol);
  if(!y||y.group!==x.group||y.position!==x.position)throw Error('RACCO mismatch '+x.symbol);
}

const gp=corpus.translit;
const histSet=new Set(historical), gpSet=new Set(gp);
const gpOnly=gp.filter(x=>!histSet.has(x));
const histOnly=historical.filter(x=>!gpSet.has(x));
const commonOrder=historical.filter(x=>gpSet.has(x));
const gpWithoutExtra=gp.filter(x=>histSet.has(x));
const commonOrderExact=JSON.stringify(commonOrder)===JSON.stringify(gpWithoutExtra);

const coordinateBySymbol=Object.fromEntries(coords.map(x=>[x.symbol,[x.group,x.position]]));
const p0Mark=[3,3];
const p0Symbol=coords.find(x=>x.group===p0Mark[0]&&x.position===p0Mark[1])?.symbol;

console.log(JSON.stringify({
  historical_table:{
    source:'Derolez 1954 Salzburg Isruna tract',
    partition:[8,8,8,4],
    coordinate_order:'group first, position second',
    symbols:historical,
    coordinates:coords,
    racco_control:expectedRacco
  },
  gp29:{
    symbols:gp,
    common_symbols:historical.filter(x=>gpSet.has(x)).length,
    gp_only:gpOnly,
    historical_only:histOnly,
    common_relative_order_exact:commonOrderExact,
    exact_difference:'GP29 inserts IA immediately before historical final EA'
  },
  p0_locked_prediction:{
    coordinate:p0Mark,
    historical_symbol:p0Symbol,
    gp29_index:gp.indexOf(p0Symbol),
    first_black_gp_symbol:gp[2],
    matches_first_black:p0Symbol===gp[2]
  },
  decision:'The pre-2014 Anglo-Saxon Isruna tract fixes 28 of the 29 GP symbols in the same relative order, but supplies no coordinate for IA. Direct 3|3 Hahalruna predicts E, not the first black TH. Do not invent a fifth position or shift EA.'
},null,2));
