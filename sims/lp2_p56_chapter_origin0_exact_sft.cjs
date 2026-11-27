'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { study } = require('./lp2_p56_shared_origin_chapter_prefix_sft.cjs');

const read = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const levels = (process.env.LEVELS || '4,6,8').split(',').map(Number);
const cap = Number(process.env.CAP || 200000);
const out = study(
  read('resources/liber-primus/lp2-corpus.json'),
  read('resources/control/shakespeare_first300k.txt'),
  read('im-results/lp2-p56-shared-origin-outer-projection-output.json'),
  0,
  1,
  levels,
  cap
);
console.log(JSON.stringify(out, null, 2));
