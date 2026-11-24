'use strict';
/** Exhaustive invertible affine feedback q13, transparent F, native word relations. */
const {study,files}=require('./lp2_plaintext_autokey_q13_fhold_word_relation_sft.cjs');
const fs=require('node:fs'),path=require('node:path');
console.log(JSON.stringify(study(files.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8')),{affine:true,controlAt:120}),null,2));
