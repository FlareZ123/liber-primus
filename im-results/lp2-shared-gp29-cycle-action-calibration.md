# Shared GP29 cycle-action calibration

**Status: intermediate research; no LP2 plaintext recovered. The original mixed-tail test is invalid for p54–55. The corrected numeric-key anchor-packing experiment below rejects the fixed numeric DIVINITY receiver conditional on both long anchors being in the frozen lexicon. The corrected mapped-key experiment also rejects both longest anchors jointly, with blind literary calibration. Both source-fixed cases remain conditional on in-register anchors; general unknown q8 remains open.**

## Input-selection correction — Agent18

The original SFT used `.slice(-66)` on a 58-page transcription, producing global groups `[2875,2941)` and rune offsets `[12853,13136)`: 21 unsolved groups (103 runes), followed by 45 groups (180 runes) from p56–57. The true p54–55 sample is groups `[2830,2896)`, offsets `[12648,12956)`, 66 groups and 308 runes. Anchor 59 in the reported test is the clear p57 word CIRCUMFERENCES. The synthetic controls remain mechanical calibration on the mixed-tail length histogram. The direct and mapped DIVINITY experiments in the historical sections are mixed-tail observations, not evidence about the intended terminal sample; corrected experiments appear later. See [issue correction](https://github.com/FlareZ123/liber-primus/issues/2722#issuecomment-7162484734).

## Question and exact model

This investigation tests the compact shared-alphabet-action hypothesis:

\[
C_i = \pi^{-1}\bigl(\pi(P_i)+k_{\phi_i}\pmod{29}\bigr),
\]

where \(\pi\) is one permutation of the 29 Gematria Primus symbols fixing \(F\), the eight phase maps are powers of the same 29-cycle, each printed word has an arbitrary starting phase, and plaintext \(F\) is a transparent hold that does not advance the phase.

This is not the same model as the existing nonlinear-common-cycle SFT. That implementation uses eight independent phase permutations plus a separate evolving outer permutation. Its fitted outer permutation on the original has cycle lengths 21 and 8; that result is not evidence for or against the shared-\(\pi\) model.

## Reproducible implementation and inputs

- Solver and experiments: `sims/lp2_shared_gp29_cycle_action_calibration_sft.cjs`
- Captured output: `im-results/lp2-shared-gp29-cycle-action-calibration.json`
- Successful GitHub Actions run: [run 45613266972](https://github.com/FlareZ123/liber-primus/actions/runs/45613266972)
- Original group transcription: `resources/liber-primus/lp2-transcription.txt`
- Alphabet: `resources/liber-primus/lp2-corpus.json`
- Native control text: `resources/external/relikd-solved-gp29-native-v1.json`
- Lexicon: `resources/control/english_wordfreq_textblob.txt`

The inadvertently selected mixed-tail sample consists of **66 groups and 283 rune positions**. The native control pool contains 733 words. The lexicon contains 29,157 Latin word forms, which expand to 38,936 distinct GP29 rune encodings after the repository's transliteration segmentation and native additions.

The oracle solver uses exact row reduction over \(\mathbb F_{29}\). Its 35 variables are the 28 non-F alphabet coordinates and seven key entries after normalizing \(k_0=1\); the anchor word fixes the phase origin. This is an oracle-assisted calibration, not a blind key search.

## Positive controls: model identifiability with known plaintext

Two deterministic native plants were generated with the mixed-tail word-length histogram, shuffled word groups, arbitrary per-word phase starts, random \(\pi\), and primitive q8 keys.

| Seed | Known-plaintext training | Blind dictionary holdout | Exact \(\pi\) and key | Training starts recovered uniquely | Holdout truth present | Holdout words unique |
|---:|---:|---:|---|---:|---:|---:|
| 20903 | 50 groups | 16 groups | Yes | 50/50 | 16/16 | 13/16 |
| 37841 | 50 groups | 16 groups | Yes | 50/50 | 16/16 | 12/16 |

The exact search found one solution in each control (6 and 7 search nodes respectively), recovered the planted permutation and key exactly, and recovered every training start uniquely. The blind holdout decoder included the true rune sequence for every held-out word; 13 and 12 were uniquely determined.

**Interpretation:** the equation system and implementation can recover the shared action when enough plaintext training data is available, and the resulting action predicts most held-out native words. This does **not** establish blind recovery of \(\pi\) and \(k\) from ciphertext-only groups. The holdout words were blind; the training plaintext was not.

## Source-selected LP1 keyword test: DIVINITY

The known LP1 keyword `DIVINITY` maps through the published GP29 transliteration to:

`[23, 10, 1, 10, 9, 10, 16, 26]`

Two distinct interpretations were tested.

### 1. Published numeric values used directly as \(k_j\)

For the three selected mixed-tail groups (zero-based group indices 59, 4, and 11; lengths 14, 11, and 13), the exhaustive dictionary/start domains contained 2, 480, and 1,722 options. Only one 14/11 pair was linearly consistent, and **no 13-letter option extended that pair**. Thus direct numeric reuse of the LP1 key is rejected only for these mixed-tail groups under this exact model and finite lexicon.

This does not reject other q8 keys.

### 2. Keyword symbols transformed by the same \(\pi\): \(k_j=\pi(\text{DIVINITY}_j)\)

This is the more natural interpretation when the key and plaintext share the same relabeling. The scale gauge was fixed by \(\pi(D)=1\). Repeated `I` symbols correctly force the corresponding phase rows to be identical.

The search used all compatible dictionary words for the 14-, 11-, and 13-letter groups, then the top 30 compatible distinct rune words by frequency for the 10- and 8-letter groups:

- Per-group option counts: 20, 560, 1,729, 164, 88.
- Consistent pair states: 688.
- Consistent triple states: 6,953.
- Consistent four-group states: 26,729; maximum rank 26.
- Consistent fifth-group extensions checked: 18,831; maximum rank 26.
- No full-rank 28-variable permutation was found in this frequency-limited five-group search.

A separate local necessary-condition pass over all 66 groups found no group with an empty domain under the repeated-key-row equality and transparent-`F` constraints. Candidate-word counts ranged from 18 to 6,005 (median 733). Therefore this local filter does not reject the mapped-keyword subcase. The five-group rank search is not exhaustive because of its 10- and 8-letter frequency caps.

## Corrected p54–55 numeric DIVINITY: exact blind anchor packing (Agent2, 25 November 2026)

This repairs the previous original-input error for the **fixed published numeric DIVINITY key only**. All 66 groups (308 runes) are sliced at [2830,2896) and checked against physical p54+p55. The 13-rune group56 and 11-rune group49 (straddling the p54/p55 seam) are the two longest anchors. Fix the historic numeric keyword [23,10,1,10,9,10,16,26], arbitrary group phases, and transparent plaintext F. Freeze the terminal groups 49–65 for model selection, using groups 0–48 (the first 222 original runes) as a reverse-direction holdout. This is a new source-fixed conditional test, not the specified arbitrary-q8 forward p54→p55 experiment.

For each of 38,936 dictionary forms and eligible starts, solve pi(C)−pi(P)=k_j over GF29 by weighted disjoint sets. A component carries a bitmask of occupied relative coordinates. Joining components rejects both inconsistent cycles and coordinate collisions. Then enumerate every translation of all disconnected components into disjoint subsets of GF29 with pi(F)=0; this is an exact all-different completion, including singleton components. No frequency cap, arbitrary choice of free coordinates, or plaintext training. Each returned word/start is forward-replayed. A 500,000-completion bound is present, but neither plant nor original reaches it.

Two independent corrected-profile shuffled native plants (sampled by length with replacement, seeds 20161125 and 3301) use the same source key, random hidden relabeling and word phases. The two-anchor joins leave 1 and 7 compatible word/phase pairs and 362,880 and 11,731 complete permutation assignments. Maximizing coverage of the other 15 training groups recovers 15/15 on each, leaving 2 and 1 distinct winning alphabet maps. The planted map is present in both; it is unique only in the second. For the planted winning maps all 49 independent holdout words occur in the exact decode domains, 40/49 uniquely on each. Other tied maps are disclosed in the raw output and cannot be selected using the holdout.

Original: 721 × 285 individual word/phase options, three joined states pass within-component constraints; only **one** passes global exact packing. The words are COMPASSIONATE (group56, phase4) and ENCYCLOPEDIA (group49, phase5). Its connected-component sizes are [18,4,3,1,1,1,1], yielding exactly 24 full permutations. All 24 were tested; the maximum coverage of the remaining 15 training groups is **5/15**, so even before the holdout every permutation requires at least ten out-of-register groups, exceeding the entire 66-group 5% OOV budget (3). The 12 tied training winners support 10/11/12 of 49 holdout groups; the retrospective maximum over all 24 permutations is 19/66 total groups. The two plausible isolated words are false-positive anchor fits, not a decipherment. This excludes the source-fixed numeric key **conditional on both long anchors being in the frozen dictionary**; if one or both anchors are OOV it is not an all-key exclusion. No claim about pi(DIVINITY), arbitrary q8, word order, or H-decoy follows. No new plaintext or key.

[Exact packing SFT](../sims/lp2_shared_gp29_numeric_key_exact_packing_sft.cjs) · [machine-readable full output](../im-results/lp2-shared-gp29-numeric-key-exact-packing.json). Executed the same core function on the pinned repository blobs in connected V8. Standalone Node wrapper not separately run. No CI.


## Corrected mapped DIVINITY: exact blind affine-space anchor inverse (Agent22, 25 November)

This distinct receiver fixes the historical keyword **as symbols**, with \(k_j=\pi(K_j)\), \(K=[23,10,1,10,9,10,16,26]\). It uses the same corrected 66 original printed groups and 308 runes, independent phase starts and transparent plaintext-F holds. The model requires \(\pi(F)=0\); multiplying the coordinates by a common nonzero field element preserves the model, so normalize \(\pi(D)=1\). Every permutation also satisfies \(\sum_x\pi(x)=0\bmod29\). Unlike the numeric-key test, the coordinates of all six distinct key letters are unknown.

For each word/phase option represent all 29 coordinates as affine forms over GF(29) in the remaining free parameters. Substitute the exact relation \(\pi(C)-\pi(P)-\pi(K_j)=0\) directly into the entire affine space. Reject inconsistent equations and any pair of symbols whose affine forms become identical (an unavoidable all-different violation). This is a sound relaxation: a surviving space is not necessarily packable into a permutation. When ≤3 free parameters remain, the reproducer exhaustively enumerates every field assignment and keeps only all-different maps. Every decoded dictionary word/phase is forward-replayed.

The original p54/p55 seam group49 (11 runes) has 174 admissible individual options; group56 (13 runes) has 285. **All 49,590 pairs fail exact affine-space consistency or forced-coordinate distinctness.** Therefore no permutation in this model can simultaneously decipher both groups to words in the 38,938-form register. This test uses the physical page slice, not the earlier mixed tail. It corrects native table tokenization: maximal rune runs give 740 native instances, with table cells kept separate. The same register contains all Latin segmentation variants from the pinned word-frequency file. A further scan of the 28 pairs among the eight remaining groups of length ≥8 found at least one relaxed affine-space witness for every pair; this does not prove full permutation feasibility or establish an additional disjoint contradiction.

Blind positive controls sample real words from two independent pinned literary sources (Gibran, Emerson), restricted to in-register encodings and matched to the original 66-group length profile. The long anchors are distinct legitimate words, without fused native table cells: ILLUSTRATIONS/INCONSTANCY and ACQUAINTANCES/SIGNIFICANT. Hidden permutations, independent starts and the mapped keyword generate ciphertext; the receiver receives no plaintext words or starts. Terminal groups49–65 are the training set, groups0–48 the withheld set. The exact pair search leaves 1 and 19 relaxed spaces respectively. Additional longest training groups reduce them until all remaining small spaces can be enumerated.

| Seed | Anchor options | Pair states | Complete permutations | Training winner | Held-out true words present | Uniquely correct held-out words |
|---:|---:|---:|---:|---|---:|---:|
| 3301 | 11 × 1,541 | 1 | 2 | unique, exact planted map | 49/49 | 36/49 |
| 20141125 | 5 × 3,094 | 19 | 2 | unique, exact planted map | 49/49 | 37/49 |

No search cap was reached in either control. These are shuffled literary GP controls, not additional authentic Cicada encryptions. The word-order-independent forward replay is an implementation invariant, not evidence that an original plaintext exists.

**Scope:** this rejects mapped DIVINITY conditional on both long anchors being in-register; it forces at least one OOV among groups49 and56, which is insufficient to exceed the three-group global OOV allowance. Unknown q8, other mapped keywords, non-F-fixing maps, altered boundaries, and arbitrary OOV anchors are not excluded. No unknown LP2 plaintext or key recovered.

[SFT](../sims/lp2_shared_gp29_mapped_divinity_anchor_sft.cjs) · [complete output](lp2-shared-gp29-mapped-divinity-anchor-output.json). Exact core executed on pinned repository blobs in connected V8; standalone Node wrapper not separately run, no CI.

## Current conclusion

**Established**
- The strict shared-cycle algebra is recoverable with known-plaintext training on two independent native plants.
- Blind dictionary holdout prediction is strong on those plants: 16/16 true words included, 13/16 and 12/16 unique.
- The corrected original p54–55 numeric DIVINITY case has only 24 complete permutations conditional on both long anchors; every one exceeds the 5% whole-sample OOV budget on terminal training groups alone. This is a conditional exclusion, not a rejection with arbitrary OOV anchors.

**Not established**
- No plaintext or key has been recovered for original p54–55.
- The corrected mapped `pi(DIVINITY)` subcase cannot satisfy both longest groups in-register. The two blind controls recover the exact planted permutation and 98/98 withheld truth words; arbitrary OOV anchors remain unexcluded.
- The general unknown-q8 shared-cycle model has not yet been tested by a genuinely blind ciphertext-only recovery on shuffled native plants.

## Next discriminating work

The fixed-key anchor-packing result gives a practical exact all-different subroutine. To address the broader issue, build and validate a blind simultaneous CSP for the shared-cycle model: jointly choose dictionary word/phase assignments and solve the common \(\pi\) and q8 action, quotienting the phase-rotation and multiplicative gauges. First require recovery of the effective phase maps and held-out words on shuffled native plants **without plaintext training**. Only then apply the same frozen solver to p54 and p55, with an explicit OOV allowance and independent replay. The projected affine-space solver and corrected tokenization are useful for the unknown-q8 receiver; neither source-fixed conditional rejection is an all-key theorem with arbitrary OOV anchors. Do not promote the controls to an LP2 decryption.
