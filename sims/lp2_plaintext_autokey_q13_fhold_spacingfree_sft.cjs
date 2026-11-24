'use strict';
/** q13 spacing-free GP29 plaintext-autokey with transparent F. */
const {study,files}=require("./lp2_q29_plaintext_autokey_fhold_joint_inverse_sft.cjs");
const lib=require("./lp2_fhold_cyclic_ngram_map.cjs");
const fs=require("node:fs"),path=require("node:path");
const result=study(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")),lib,"terminal",13,0x330113a5);
console.log(JSON.stringify(result,null,2));
