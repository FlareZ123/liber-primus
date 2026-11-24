# Fixed zero-F wrapper plus secret periodic F-hold inner key

## Constructive question

#1422 and #1524 establish a frozen reversible moving-exception surface operation whose adjacent-repeat normalization is specific relative to their random controls, but whose direct inverse is not prose. Instead of retuning the wrapper, use exactly that fixed inverse and ask whether an unknown additive GP29 key with the authentic LP1 period 8 or 13 and true plaintext-F holds can be recovered. Prior raw-original period-8/13 gates are not tests of this exact composite. The choice of an inner periodic cipher is a historical hypothesis, not an author-selected instruction for this chapter.

## Frozen experiment

Read the canonical p0–55 tape, apply the p50 token-controlled exception rule in global phase zero. At i>0 apply the transposition exchanging previous ciphertext C[i-1] and marker to C[i], where marker is zero for a token starting with 0, otherwise the special-rune list [0,2,12,21,22,25,27,28] indexed by the canonical byte low three bits. There are exactly 549 edits whole-book, with exact forward replay. Keep the complete original word partition (including carries). Take final 66 words/308 runes, reset the inner cipher cursor at that unit's beginning, and fit first 45 words/205 runes. No held-out original suffix is scored unless a unique key is obtained. The finite lexicon comprises 38,920 rune spellings (English wordfreq variants and solved native words). Each native control uses the same wrapper offset, original predecessor, fixed outer rule, and an independently generated hidden inner key; no target key is given to the solver. The three control segments are overlapping excerpts of the solved KOAN, so they are six cipher/key plants, not six independent texts. Control words are included in the finite lexicon.

## Results

| Inner period | Planted keys recovered | Held-out runes exact | Original prefix keys | Single-word wildcard cases feasible |
|---|---:|---:|---:|---:|
| 8 | 3/3 | 703/703 | 0 | 0/45 |
| 13 | 3/3 | 703/703 | 0 | 0/45 |

All six control predictions are unique under the fixed-key word scoring and exact forward replay. The original outer inverse changes 11/308 runes and has two zero symbols in the 205-rune prefix. Both original searches terminate at the root via exact propagation, not node-budget exhaustion. All 90 independently relaxed one-word wildcard searches also finish with zero keys. Thus a solution under this model requires at least two OOV words in the original 45-word training prefix, or a different clock/inner law/word segmentation. The 103-rune original holdout was not evaluated for language because no unique original key survived.

This is a negative for a constructive two-layer key-recovery path, not a rejection of all zero-F wrappers. No original plaintext or key recovered. The original source did not independently select these inner periods.

[Executable SFT](../sims/lp2_zeroF_periodic_fhold_layer_sft.cjs) · [Raw output](lp2-zeroF-periodic-fhold-layer-output.json) · [Reusable solver](../sims/lp2_fhold_word_relation_csp.cjs). Exact JS function executed against fetched canonical inputs; no Windows CI claimed.
