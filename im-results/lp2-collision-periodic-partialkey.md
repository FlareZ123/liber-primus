# Crib-free periodic key recovery with collision rejection

**Scope.** An independent cyclic additive GP29 key and a running key cursor. For plaintext rune P, try C=P+K[j] mod29. If that equals the previous emitted ciphertext, reject with probability 0.81, advance j, and try again with the same P. Otherwise emit; each emission also advances j. This is an explicit model, not an authenticated LP2 operation. No printed word lengths or guessed plaintext are used.

## New constructive receiver

For a q-symbol ciphertext window, the proposal approximation mixes a clean cyclic phase uniformly among q rotations and an uninformative contamination component. At depth d, assigned key digits multiply their unigram likelihood ratios (29p); unknown digits contribute 1. Score is the sum over windows of log[(1-clean)+clean/q * sum of q rotation-products], with clean=(1-.028)^(q-1). Extend by each of 29 possible digits and retain 96 best. This avoids poor random EM initialization (first development control recovered at most 4/13 digits by ordinary HMM/robust window EM). Rotationally equivalent completed keys deduplicated.

Train native unigram and bigram from first 80% of Shakespeare, using GP29 transliteration, QU->CW, ING->NG, IO->IA, V->U, K/Q->C, Z->S. Gibran and Emerson plant controls are independent donors. Exact forward likelihood sums all rejection histories conditional on each proposed key, including geometric cycles for constant key. Compare with anti-repeat null: first uniform, later nonrepeat 1/(29-.81), repeat (1-.81)/(29-.81). Rank keys by exact training likelihood; freeze winning key and posterior cursor distribution for continuation. Bigram Viterbi path replays every observed rune and rejected attempt. Exact likelihood and replay are conditional on the model and candidate key; proposal search is approximate, not a universal all-key exclusion.

## Results

| Tape | q | Fit/held N | Key recovered (rotation) | Fit gain | Held gain | Held runes correct |
|---|---:|---:|---:|---:|---:|---:|
| Gibran plant | 13 | 2105/903 | 13/13 | +755.849 | +331.138 | 903/903 |
| Emerson plant | 13 | 2105/903 | 13/13 | +789.718 | +367.089 | 903/903 |
| Original pp40–53 | 13 | 2105/903 | unknown | -1044.840 | -552.476 | nonprose |
| Emerson plant | 29 | 9000/3956 | 29/29 | +3441.863 | +1471.114 | 3944/3956 |
| Original pp0–55 | 29 | 9000/3956 | unknown | -5121.799 | -2304.873 | nonprose |

q13 Gibran and Emerson: all 6016/6016 emitted runes and skip counts recovered; 86 and 83 rejected draws. q29 control fit 8986/9000, held 3944/3956, 12937/12956 skip counts correct. Every selected decoding exactly replays. Original q29 best key [24,25,6,28,4,1,20,27,0,26,23,26,7,19,20,2,17,4,23,3,14,19,15,3,16,22,19,15,19], fit LL -35278.819431, held LL -15550.363847. No coherent original plaintext. q13 best [8,7,14,14,7,2,21,9,12,23,17,22,8]. These are failed fitted candidates, not recovered LP2 keys.

## Reproduction

Run [CJS receiver](../sims/lp2_collision_periodic_partialkey_sft.cjs) with JSON argument:
- q13 Gibran: {"q":13,"N":3008,"train":2105,"width":96,"stride":3,"seed":101791489} (default seed 0x6113701)
- q13 Emerson: {"q":13,"N":3008,"train":2105,"width":96,"stride":3,"seed":101791746,"donor":2,"offset":103} (seed 0x6113802)
- q13 original: {"mode":"original","q":13,"N":3008,"firstPage":40,"lastPage":54,"train":2105,"width":96,"stride":3}
- q29 Emerson: {"q":29,"N":12956,"train":9000,"width":96,"stride":15,"seed":101792003,"donor":2,"offset":1000}
- q29 original: {"mode":"original","q":29,"N":12956,"train":9000,"width":96,"stride":15}

The connected V8 execution used the committed receiver function, with depth checkpoints for q29. Standalone Node wrapper and CI were not separately run. Full q29 outputs: [control](../workplace/agent6-q29-partial-control.json), [original](../workplace/agent6-q29-partial-original.json). Key recovery on these controlled models establishes constructive capability, not an authenticated source selector. No reason to promote either failed original key or claim all possible q13/q29 keys excluded.