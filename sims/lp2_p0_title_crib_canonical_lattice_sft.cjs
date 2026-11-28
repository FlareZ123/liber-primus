'use strict';
/** Execute the five preserved historical receiver cores with their corrected title operand. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const old = '[19,13,10,13,8,25,9,27,15,19,19,5,15]';
const sourcePaths = ['resources/liber-primus/lp2-corpus.json','resources/external/relikd-solved-gp29-native-v1.json'];
const receiverNames = ['affine_lattice','affine_high_lattice','mobius_log','projective_lll','min_projective'];
const receiverPaths = receiverNames.map(n => 'sims/lp2_p0_title_crib_' + n + '_sft.cjs');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
/** @param {string} s @returns {string} */
const gitBlob = s => crypto.createHash('sha1').update('blob '+Buffer.byteLength(s)+'\0').update(s).digest('hex');
const [c,n] = sourcePaths.map(p => JSON.parse(read(p)));
const title = [...'EPIPHANYSEECS'].map(x=>c.translit.indexOf(x));
if (title.join() !== '18,13,10,13,8,24,9,26,15,18,18,5,15') throw Error('canonical title');
const results = receiverPaths.map(file => {
  const source = read(file);
  const core = source.slice(source.indexOf('function experiment('),source.lastIndexOf('console.log(JSON.stringify(experiment('));
  if (core.split(old).length !== 2) throw Error('preserved operand missing or duplicated: '+file);
  const experiment = Function(core.replace(old,JSON.stringify(title))+'\nreturn experiment;')();
  return {file,sourceBlob:gitBlob(source),result:experiment(c,n)};
});
console.log(JSON.stringify({mode:'canonical EPIPHANY SEECS operand only; five preserved receiver cores, original fixed training and continuation splits',title,sourceBlobs:sourcePaths.map(p=>({path:p,sha:gitBlob(read(p))})),results},null,2));
