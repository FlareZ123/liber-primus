# p7 five-state additive key: exact all-schedule inverse and bank recovery

**Decision (24 November 2026):** reject the p7-derived fixed five-value additive bank and the entire shared ≤5-value additive-bank family **conditional on intact printed groups and the fixed expanded native-English GP lexicon**, regardless of aperiodic generator, collision-triggered redraw, or hidden F clock. No LP2 plaintext or key recovered. A larger/position-dependent bank, nonadditive state, different plaintext register, altered group boundaries, or additional encryption layer remains outside this gate.

## Source and exact model

Agent2's [fresh five-state hypothesis](../communications/broadcast/20261124T172336Z_agent2_p7-five-state-antidoublet-hypothesis.md) notices the 14 red runes in five words at p7 offsets 194–207 above five black dots. Their **zero-based GP29 index products** mod29 are `[11,26,8,15,2]` (not prime-value products). The hypothesized collision redraw over a five-value bank can explain an approximately one-fifth survivor fraction. A source-selected schedule is still missing. Instead of guessing one, grant every possible schedule and arbitrary repeat redraw. Any such additive encoder is contained in the relaxation.

For every ciphertext group C and candidate same-length plaintext P, reject when any plaintext F (index0) corresponds to nonzero ciphertext. For each remaining non-F position collect the required shift d=(C-P) mod29. A group can be decoded under a fixed bank K iff its required shift set D is a subset of K. Ciphertext F may be a consuming non-F as in the authentic convention. Because the schedule is unconstrained, this local condition is both necessary and sufficient for a given word. Enumerate every 5-subset of 29 values (118,755), which also covers all smaller banks. For each of the **343 intact original groups of length ≥8**, enumerate dictionary candidates, collect distinct required masks of cardinality ≤5, then mark every size-five superset exactly once per group. Summing the marks yields the exact number of compatible long groups for each bank; no language-model score, PRNG assumptions or heuristic pruning. The two fixed source bank signs are also tested on **all 2,896** original printed groups, aligned to all 12,956 runes. The source-corrected transcription preserves cross-line/page word carries.

Lexicon: identical spelling construction to the existing [six-anchor inverse](../sims/lp2_p23_26_six_anchor_inverse_sft.cjs), including target-excluded solved native runes, Gibran and Shakespeare. Base 42,468 types; expanded 224,885 types allow a single interior adjacent non-F rune swap for every ≥5-rune spelling. Source-native KOAN1 corrected to the exact 778-rune affine plaintext. The finite vocabulary assumption is explicit.

## Original ciphertext results

| Lexicon | Source + sign supported groups (all) | Source − sign | Source + / − long anchors | Individually impossible long anchors under any 5 values | Exact best common-bank long coverage | Forced OOV among 343 long groups |
|---|---:|---:|---:|---:|---:|---:|
| Base | 1637/2896 | 1606/2896 | 1 / 1 | 39 | 8/343 | ≥335 |
| Expanded | 1795/2896 | 1758/2896 | 7 / 7 | 18 | 14/343 | ≥329 |

All 18 individually impossible groups remain impossible even with a private bank for each group; three require at least seven distinct shifts under the expanded lexicon. All 109 groups of length ≥10 fail both fixed source signs even after expansion. Two post-selected arbitrary banks tie the expanded global optimum: `[1,3,8,15,28]` and `[1,4,5,8,26]`. These cover only 14 anchors each; they are not proposed keys.

## Constructive controls

Generate a deterministic arbitrary state stream by xorshift32 selecting uniformly by residue from a five-value bank, with one redraw if a consuming ciphertext symbol repeats its physical predecessor. Plaintext F emits literal F and consumes no draw. This generator is a synthetic plant only; the attack is not given its sequence or seed. Use two different native GP plaintext sections, excluding each entire target section from its expanded lexicon.

| Native control | Runes | Hidden bank | Exact bank rank / ties | Covered long anchors | Unique exact long words | Unique exact words overall |
|---|---:|---|---|---:|---:|---:|
| 0_welcome | 515 | `[11,26,8,15,2]` | 1 / 1 | 14/14 | 10/14 | 21/124 |
| 0_koan_1 | 778 | `[1,7,14,22,28]` | 1 / 1 | 10/10 | 3/10 | 12/208 |

Both hidden key alphabets are uniquely recovered by exhaustive original-style word-mask support. Once a bank is recovered, exact word candidates are constructed; unique true words are explicitly counted. Ambiguous words are not claimed as recovered, and no full schedule can be inferred without a generator. These controls demonstrate the actual bank-recovery procedure, not historical adoption of the synthetic generator.

## Interpretation and next decision

Do not spend CI selecting generators for the five-value additive proposal while intact native GP groups are the intended output. The obstruction precedes the generator entirely; it is also independent of the specific five p7 values. An independent source-selected operation that changes the printed-group/inner-layer assumptions would be required to revisit. The proof does not exclude arbitrary five-state *permutations* or a larger/evolving additive bank. The near-one-fifth doublet ratio alone is insufficient to select the cipher.

Run `node sims/lp2_five_shift_bank_all_schedule_inverse_sft.cjs` from the repo root. [Code](../sims/lp2_five_shift_bank_all_schedule_inverse_sft.cjs) · [complete exact output](../im-results/lp2-p7-five-shift-bank-all-schedule-output.json). Executed in connected JavaScript runtime, no CI run claimed.

Input Git blobs:
- `resources/liber-primus/lp2-corpus.json` — 054f2a0f780b7d46901acbe3d9bf4f0ac1801165
- `resources/transcriptions/lp2-image-corrected.txt` — f7b534a33edeb212d427329798438325307463d7
- `resources/control/english_wordfreq_textblob.txt` — 140e1d22b5f8c45deddd2e8b25549d9d6307d938
- `resources/external/relikd-solved-gp29-native-v1.json` — 1b064ef6d85819b7d96adaff31a82d1ec551598f
- `resources/control/gibran_prophet_58585.txt` — df260a07d56bf5998d40a6360b6132c35c252d10
- `resources/control/shakespeare_first300k.txt` — 94c677ad9dd50771c6670e0c4e4dad9052b46d85
- `resources/transcriptions/lp1_wulfic_canonical.txt` — 37c96b816495c5f93ca658a01c9918bf92598316
