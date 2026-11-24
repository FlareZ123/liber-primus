# Repeat-triggered period-13 affine F-hold cipher: exact original-input obstruction

24 November 2026 — Agent25. This tests a distinct cipher clock motivated by the 86 adjacent equalities in the original 12,956-rune tape. There is no authentic instruction selecting this reset event.

## Model and decision

For consuming plaintext rune p≠0, C=(a p+K[j]) mod29, with a∈1…28 and j advancing modulo13. Plaintext F=0 emits ciphertext F=0 without advancing. After any adjacent equal ciphertext symbols, the next rune starts at phase zero. Printed whole singleton words are constrained to A/I (indices24/10). Both ordinary and held interpretations of ciphertext zero are allowed, subject to singleton support. No guessed key, F mask, scoring threshold or language corpus is used in the negative result.

The parser matches every original rune and all 2,896 printed groups, retaining carries across source line and page boundaries. The 86 equality events give 87 complete reset blocks. Exact bitset constraints are accumulated across nonzero ciphertext runs and both branches at each zero; union projection retains every key supported by a block. Iterative intersection of projected key domains is a necessary condition, so an empty block under the current domains proves no shared key exists.

| Independent original receiver | Complete blocks | Runes | Slopes with any possible shared key |
|---|---:|---:|---:|
| p0–14 fitting region (complete blocks) | 19 | 3,141 | 0/28 |
| p16–21 disjoint region (complete blocks) | 8 | 1,409 | 0/28 |

The exact all-slope test preserves each planted key in 56 native controls (WELCOME and first KOAN, 28 slopes each; 36,260 rune observations). These are feasibility controls, not claims of blind recovery. Three separate 2,480-rune native controls under the additive model admit multiple keys on singleton evidence alone. No unknown plaintext was recovered.

## Minimal contradiction for additive keys

Even an independently chosen additive key for the physical p5 F-free span [1286,1355) cannot decode its printed singleton at global position1316, Y=26. A/I imply key value2/16 respectively. The same-phase ciphertext at1329 is TH=2 and at1290 is T=16; each forces consuming plaintext F, impossible at a nonzero ciphertext. This proof is invariant under the incoming phase and any F choices or resets outside the span. The interval has no adjacent-equality reset internally. One singleton alone suffices; deletion admits the all-zero key. The larger 553-rune reset block [1039,1592) also excludes every additive key under the relaxed A/I/O singleton set, although the elementary single-site proof does not establish that relaxation.

## More permissive independent-span affine gate

Allow an arbitrary new period-13 key and incoming phase between spans delimited by physical page edges, ciphertext F, or adjacent equalities. A singleton's allowed key values are C−a p mod29. Each same-phase nonzero ciphertext occurrence of one such key value forbids that candidate (it would require consuming plaintext F). This local witness alone excludes 4/28 slopes in p0–14 ([1,4,19,24]), 7/28 in p16–21 ([4,5,10,18,22,25,26]), and 16/28 over the entire tape. Remaining whole-tape slopes [3,7,9,11,12,14,15,16,17,20,21,23] are not excluded by this weaker test. A/I/O relaxation removes all of these *local* affine obstructions. Fifty-six independently planted slope/section controls have no false local contradiction.

## Reproduction and scope

- [Full exact affine SFT](../sims/lp2_repeat_reset_q13_affine_exact_sft.cjs), commit e55e8de.
- [Local affine witness SFT](../sims/lp2_repeat_reset_q13_affine_local_witness_sft.cjs), commit a7ce109.
- [Additive minimal core and native feasibility](../sims/lp2_repeat_reset_q13_fhold_singleton_core_sft.cjs), commit 1b76bb4.
- [Initial additive support SFT](../sims/lp2_repeat_reset_q13_fhold_singleton_sft.cjs), commit 194d3f4.

All scripts executed directly with original corpus/transcription and solved native donor data in a JS runtime before commit. The shared-key family with the exact stated reset law and intact native A/I singletons is excluded; this is not an exclusion of other periods, arbitrary changing keys, arbitrary reset events, rearranged boundaries or non-native singleton vocabularies. See the independent [variable-length radix inverse](lp2-no-repeat-source-visible-channel-capacity.md) for a distinct interpretation of equal transitions. Do not retune the same reset law through unmotivated phase variants.
