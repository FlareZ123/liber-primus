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

## Evolving 29-state shift: five possible increments

Interpret the five p7 values as increments: on each consuming rune Knew=(Kold+r) mod29, C=(P+Knew) mod29, r in the bank. Plaintext F emits F without advancing. Optional collision redraw replaces r from the same old state. All 29 effective shifts may occur, unlike the fixed absolute bank. The prior singleton state-support bound therefore does not exclude this variant. Compute successive differences of consuming shifts (C-P) mod29 per candidate group, allowing an independent starting shift per group and dropping cross-group constraints. Enumerate all 118,755 size-five increment banks under this necessary relaxation.

| Lexicon | Source + / − all groups | Source + / − long anchors | Individually impossible long groups | Best common bank | Forced OOV |
|---|---:|---:|---:|---:|---:|
| Base | 2214 / 2236 | 5 / 4 | 21 | 14/343 | ≥329 |
| Expanded | 2446 / 2450 | 30 / 21 | 6 | 45/343 | ≥298 |

Unique postselected optimum [6,8,10,17,22] is not a recovered key. All 109 groups of length ≥10 fail either fixed source sign. Six long groups fail even with individually private banks. Two target-excluded native increment plants uniquely recover both hidden increment banks (13/14, 9/10 compatible anchors), 11 and 8 uniquely correct long words, 17 and 11 unique exact words overall. Each plant has one true word absent from its lexicon. The random-walk model thus fails under the stated intact-group lexical assumptions before any generator selection. The spacing-free extension below tests the specific iid one-redraw law without that group assumption; nonlinear or correlated increment laws remain open.

Run `node sims/lp2_five_shift_bank_all_schedule_inverse_sft.cjs increment`. [Exact output](lp2-p7-five-increment-bank-all-schedule-output.json).

### Spacing-free evolving shift inverse (Agent3, 24 November 18:09Z)

The intact-group obstruction above cannot decide an altered-segmentation cipher. A distinct full-state predictive decoder tests the same five increments as a random walk with an independently uniform draw, optional one-redraw collision rule (a second proposal is always emitted), and unknown initial GP29 shift. This tests an explicit distribution over schedules; it does not grant all deterministic schedules.

For consuming plaintext `P_i`, choose `r∈B`, update `K_i=K_{i-1}+r mod29`, and emit `C_i=P_i+K_i mod29`. If the proposal equals the previous physical output, redraw from the same old state exactly once. The ordinary and historical literal-F hold variants are separate. A literal plaintext F emits F without updating the state. Initial shift is uniform. For observed difference `δ=C_i-C_{i-1}`, a candidate consuming increment r has probability 1/25 for δ=0; 6/25 for δ≠0 and r−δ∈B; otherwise 1/5. The probability is exact for this one-redraw law. The decoder marginalizes all shifts and possible latent F choices with a normalized forward DP over (shift, previous two plaintext runes); Viterbi traceback provides a complete candidate and exact forward replay. Printed spaces, line breaks, and page boundaries are ignored.

All 118,755 banks are ranked by the native marginal plaintext-difference model, then the best 48 plus both source signs by exact bigram likelihood, then the top eight plus source signs by exact trigram likelihood. This is a shortlist search, not an all-bank trigram maximum. For hold mode the ranking omits edges touching visible F and is heuristic; the refinement and heldout likelihood account for every legal F interpretation. The prefix is 1,024 runes; only prefix likelihood selects a bank. The suffix 693 runes is scored from the filtered prefix state. The anti-repeat flat null uses manuscript-wide 86/12,901 repeat probability (the known anomaly is conditioned on, not treated as independent evidence). Controls use 1,717 contiguous native-encoded runes from distinct held-out Gibran, Shakespeare, and Emerson sources; each whole target author is excluded from model training. The original target is precisely p8–14 after the 12 red heading runes, with 9 adjacent equalities.

| Register | Bank recovered or selected | Marginal true rank | Prefix gain | Heldout gain | Exact MAP runes (all / heldout) |
|---|---|---:|---:|---:|---|
| Gibran, literal-F | [2,8,11,15,26] | 5 | +0.051926 | +0.055274 | 859/1717 / 377/693 |
| Shakespeare, ordinary | [1,4,10,17,23] | 5 | +0.036508 | +0.043301 | 651/1717 / 236/693 |
| Emerson, literal-F | [3,7,12,18,27] | 27 | +0.027946 | +0.030089 | 619/1717 / 242/693 |
| Original, ordinary | [3,7,14,16,23] | — | +0.000535 | −0.031968 | Unknown |
| Original, literal-F | [3,7,14,16,23] | — | −0.009105 | −0.040256 | Unknown |

Each native true bank ranks first in both exact refinement stages; both original fixed source signs also have negative prefix and withheld gains (ordinary −0.015648/−0.040853 withheld; literal-F −0.025954/−0.050960). All five selected MAP paths replay every emitted original/control rune; this is an implementation invariant, not evidence of plaintext identity. Native controls recover only 236–377 of 693 withheld plaintext runes under retrospective full-tape MAP, so the model is a calibrated bank-recovery/likelihood gate rather than a complete blind decryption. The original candidate contains model-imposed English-like fragments without sustained intelligibility, and loses on unseen ciphertext. No source-selected generator, authenticated key, or unknown plaintext. Retire the fixed iid five-increment/one-redraw model, including changed segmentation; correlated schedules, nonuniform draws, other alphabets and additional layers remain open.

[SFT](../sims/lp2_p7_five_increment_spacingfree_sft.cjs) · [raw output](lp2-p7-five-increment-spacingfree-output.json) · [executed commit](https://github.com/FlareZ123/liber-primus/commit/71481b96325d688a8ff4ca1f313571be8c7c3a7b). Core executed directly in connected V8; the generated standalone Node wrapper was not separately executed. Input blobs are the canonical corpus and solved GP29 native reference listed below, Gibran and Shakespeare listed below, and Emerson `a92be8ba5b3511a003a22ba31523c14397aaa83a`. Training uses 40,000 native runes per literary source after rune offset 4,000; trigram smoothing backs off to bigrams (12 pseudo-observations), bigrams to unigrams (20), and unigrams have +0.5 counts. Plants use xorshift32 seeds 330100–330102.

## Interpretation and next decision

Do not spend CI selecting generators for the five-value additive proposal while intact native GP groups are the intended output. The all-schedule lexical obstruction precedes generator selection, and the independent spacing-free iid increment test also fails its predictive continuation. A source-selected altered segmentation, correlated schedule, or inner-layer operation would be required to revisit. The proof does not exclude arbitrary five-state *permutations* or other larger/evolving additive banks. The near-one-fifth doublet ratio alone is insufficient to select the cipher.

Run `node sims/lp2_five_shift_bank_all_schedule_inverse_sft.cjs` from the repo root. [Code](../sims/lp2_five_shift_bank_all_schedule_inverse_sft.cjs) · [complete exact output](../im-results/lp2-p7-five-shift-bank-all-schedule-output.json). Executed in connected JavaScript runtime, no CI run claimed.

Input Git blobs:
- `resources/liber-primus/lp2-corpus.json` — 054f2a0f780b7d46901acbe3d9bf4f0ac1801165
- `resources/transcriptions/lp2-image-corrected.txt` — f7b534a33edeb212d427329798438325307463d7
- `resources/control/english_wordfreq_textblob.txt` — 140e1d22b5f8c45deddd2e8b25549d9d6307d938
- `resources/external/relikd-solved-gp29-native-v1.json` — 1b064ef6d85819b7d96adaff31a82d1ec551598f
- `resources/control/gibran_prophet_58585.txt` — df260a07d56bf5998d40a6360b6132c35c252d10
- `resources/control/shakespeare_first300k.txt` — 94c677ad9dd50771c6670e0c4e4dad9052b46d85
- `resources/transcriptions/lp1_wulfic_canonical.txt` — 37c96b816495c5f93ca658a01c9918bf92598316
