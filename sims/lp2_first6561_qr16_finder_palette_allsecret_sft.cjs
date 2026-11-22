'use strict';

/**
 * Original 81² LP2 runes vs exact QR Model2 version16 fixed finder+separator.
 *
 * QR version16 is 81x81. QR's three 7x7 finder patterns have a one-module
 * white separator; these 192 fixed positions are a necessary subset of
 * every valid QR symbol, regardless of format BCH, mask, version BCH or
 * Reed-Solomon payload. An inconsistent subset is an exact UNSAT certificate
 * for the entire standard.
 *
 * Tests all D4 orientations, one single unknown GP29 rune->binary palette.
 * No mapping, threshold, word clock, color or transform is fitted to English.
 * A genuine qrcode/Python version16 level-M QR is a planted positive.
 *
 * Read only, Node22 CJS:
 * node sims/lp2_first6561_qr16_finder_palette_allsecret_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const runes = corpus.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices);
assert.equal(runes.length, 12956);
const size=81, version=16, sample=runes.slice(0, size*size);
assert.equal(size, 17+4*version);
assert.equal(sample.length, 6561);
const centers=[[3,3],[77,3],[3,77]];
const switches=[false,true];

/**
 * QR function-module coordinates in one 9x9 finder neighborhood.
 * At distance 0/1 and 3 a module is dark; at 2 and 4 it is light.
 * Values outside the symbol are clipped, retaining 64 per corner.
 * This is equivalent to the finder construction in Nayuki qrcodegen.
 */
const required=[];
for(let k=0;k<centers.length;k++) {
  const [cx,cy]=centers[k];
  for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){
    const x=cx+dx,y=cy+dy;
    if(x<0||x>=size||y<0||y>=size)continue;
    const d=Math.max(Math.abs(dx),Math.abs(dy));
    required.push({x,y,bit:Number(d!==2&&d!==4),corner:k});
  }
}
assert.equal(required.length,192);
assert.equal(required.filter(p=>p.bit).length,99);

/**
 * @param {number} x
 * @param {number} y
 * @param {{transpose:boolean,flipX:boolean,flipY:boolean}} t
 */
function sourceAt(x,y,t) {
  if(t.transpose)[x,y]=[y,x];
  if(t.flipX)x=size-1-x;
  if(t.flipY)y=size-1-y;
  return y*size+x;
}

/**
 * A valid secret fixed binary palette must assign each rune one value.
 * Produce a two-observation certificate if a rune is forced to be dark
 * and light. Format/version/ECC cannot repair a failed finder necessity.
 * @param {number[]} glyphs
 * @param {{transpose:boolean,flipX:boolean,flipY:boolean}} orientation
 */
function check(glyphs,orientation) {
  assert.equal(glyphs.length,size*size);
  const assigned=new Map();
  let conflicts=0,first=null;
  for(const position of required){
    const original=sourceAt(position.x,position.y,orientation);
    const rune=glyphs[original];
    const witness={qr:[position.x,position.y],
      originalOffset:original,rune,requiredBit:position.bit,
      finder:position.corner};
    const previous=assigned.get(rune);
    if(previous&&previous.requiredBit!==witness.requiredBit){
      conflicts++;
      if(!first)first={first:previous,second:witness};
    }else if(!previous)assigned.set(rune,witness);
  }
  return {conflicts,first,classesSeen:assigned.size};
}
const outcomes=[];
for(const transpose of switches)for(const flipX of switches)
  for(const flipY of switches){
    const orientation={transpose,flipX,flipY};
    outcomes.push({...orientation,...check(sample,orientation)});
  }
const expected=[91,75,80,67,79,82,76,76];
assert.deepEqual(outcomes.map(x=>x.conflicts),expected);
assert(outcomes.every(x=>x.first&&x.classesSeen===29));
assert.deepEqual(outcomes[0].first,{
  first:{qr:[0,1],originalOffset:81,rune:25,requiredBit:1,finder:0},
  second:{qr:[3,1],originalOffset:84,rune:25,requiredBit:0,finder:0}
});

// Plant a standards-compliant QR Model2 v16/M for "CICADA3301 QR16 CHECK".
// Fixture generated with Python package qrcode (forced v16, ECC M, no
// image borders) and independently decoded to the exact source phrase by
// OpenCV QRCodeDetector after appending a 4-module quiet zone.
// 6561 bits are row-major, MSB-first, packed into 821 bytes (7 trailing pad).
const positiveQR=Buffer.from('/geXDsREIIq0P8Ft7GemZlrufdBuiwadUzMzM7qrt0SbIO3d03d3VduvSL+kRE/u7sLsErT8VmZkf//pB/qqqqqqqqqqqv4A7ecTREUaqqkAqgfE+4iJ+iIjCQo8NBmRETO7u4IpqQn7qqqsiIirqJp9kxqqiWZmdYAksnOvd2jEREpvoBMqnu7qyIiMa5ihtr3d3CIiIrypVgYzREeru7sbMx1ie4iJA7u6x0qpTNmRESN3d/c5rjEbqqqkzMyyqJdCc5qqiWZmecQh1jq3d2jEREpNopTOHu7qyIiMW5jjEK3d3CIiIuSpdCcIREeru7onf51j+oiJ+7u6+0xpTMQREUd3d0Y6vzEqCqrqzMzrqxOe0UqqsWZmcYz7J2/Pd2/ERF/vRC7Qku7vyIiFGyo21Vnd2uIiJiRCOkoYREZTMzJntxbD+oiIXd3dswDSjGgREQxERK4S9c2OCqrGREQ9pTVelmiImSIiGIczQT3G7uvEREbuRhzokiIvyIiFHyg2U1u7uuIiJiHDOktZiItTMApn9pbD2u7u3dwvsoCSjEjiIsxEi66Stc2WG7umZjs9wSVelmiIubu/2LUrQT3G7us7u6b3ShzokiIvt3d2G642U1u7uo7u76WCOkuRqqtnd3an75bD/vd2/d3d+xRSjMfu7sRERMWStc3qnd2qZmYqQRRfkSREUbu7sXX7Qa/giI+7u6+3SpjkMREZt3d4U7pFFCqqq4zMyoOIkaIBqqnGZmcUZpB07vd2NEREotaelYvu7mSIiMuxqJHmnd3iIiJtyJk4EJREa7u7krHpB07IiJy7u7v1RelRRREZt3d8o46JGvaqq4zMz3qIk4EMqqnGZmXoLhB1bPd2dERF3txelcUu7lSIiOm06JHmvd36IiJuTp0xUEREb7u7knvrNdaoiJ67u7OyxfJtQREZt3d4oc995oKqq4zMyXqIAIEMqqnO7u7oclQj/Pd2+iIi/oB1u0Uu7ke7u8W/n7+qvd3qqqqqUEEXEWZmUf//0XutF9+xER+7u7+10tFAjd3Yd3d9qut1Y8TMyUzO7NsEAIHuZmYu7/y7/tQj9REQgiIY9oA=','base64');
assert.equal(positiveQR.length,821);
assert.equal(createHash('sha256').update(positiveQR).digest('hex'),
  '15a37d8415b4367abe3a74c5ea5a9a43f5bc523e9fd3eab780d091b0c4310508');
const bits=Array.from({length:size*size},(_,i)=>
  (positiveQR[i>>3]>>(7-(i&7)))&1);
for(const r of required)assert.equal(bits[r.y*size+r.x],r.bit);

// 14 secret dark and 15 secret light rune labels, with all 29 glyphs
// represented. Their actual label identities do not affect the proof.
const planted=bits.map((bit,i)=>bit?(i*37)%14:14+(i*37)%15);
assert.equal(new Set(planted).size,29);
const positive=check(planted,{transpose:false,flipX:false,flipY:false});
assert.equal(positive.conflicts,0);
const decoded=planted.map(rune=>Number(rune<14));
assert.deepEqual(decoded,bits);

console.log(JSON.stringify({
  result:'EXACT UNSAT for a globally stationary rune-to-bit QR16 raster',
  source:'LP2 p0..55 original first 6561 GP29 runes, row major 81x81',
  originalOffsetStart:0,originalOffsetEndExclusive:6561,
  allEightSquareSymmetries:true,
  fixedModulesPerOrientation:192,
  orientations:outcomes,
  positive:'actual version16/M QR 6561/6561 bit exact after 29-class camouflage',
  knownPositivePayload:'CICADA3301 QR16 CHECK',
  conclusion:'No orientation supports even required finders; any legal BCH or RS scheme also fails',
  unknownPlaintextRecovered:false
},null,2));
