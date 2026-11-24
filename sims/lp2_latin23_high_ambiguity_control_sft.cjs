"use strict";
// Isolated source-native high-ambiguity calibration, shared solver.
const {experiment,inputs}=require("./lp2_latin23_unknown_key_lattice_sft.cjs");
console.log(JSON.stringify(experiment(inputs,{high:true}),null,2));
