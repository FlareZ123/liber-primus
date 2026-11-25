# Shared GP29 cycle-action calibration

**Status: intermediate research; no LP2 plaintext recovered.**

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

The parsed p54–55 target consists of **66 groups and 283 rune positions**. The native control pool contains 733 words. The lexicon contains 29,157 Latin word forms, which expand to 38,936 distinct GP29 rune encodings after the repository's transliteration segmentation and native additions.

The oracle solver uses exact row reduction over \(\mathbb F_{29}\). Its 35 variables are the 28 non-F alphabet coordinates and seven key entries after normalizing \(k_0=1\); the anchor word fixes the phase origin. This is an oracle-assisted calibration, not a blind key search.

## Positive controls: model identifiability with known plaintext

Two deterministic native plants were generated with the exact p54–55 word-length histogram, shuffled word groups, arbitrary per-word phase starts, random \(\pi\), and primitive q8 keys.

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

For the three longest original groups (zero-based group indices 59, 4, and 11; lengths 14, 11, and 13), the exhaustive dictionary/start domains contained 2, 480, and 1,722 options. Only one 14/11 pair was linearly consistent, and **no 13-letter option extended that pair**. Thus direct numeric reuse of the LP1 key is rejected for this exact model and finite lexicon.

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

## Current conclusion

**Established**
- The strict shared-cycle algebra is recoverable with known-plaintext training on two independent native plants.
- Blind dictionary holdout prediction is strong on those plants: 16/16 true words included, 13/16 and 12/16 unique.
- Direct reuse of the published numeric `DIVINITY` key is incompatible with the three longest original groups under the stated finite lexicon.

**Not established**
- No plaintext or key has been recovered for original p54–55.
- The `pi(DIVINITY)` subcase has not been excluded or solved.
- The general unknown-q8 shared-cycle model has not yet been tested by a genuinely blind ciphertext-only recovery on shuffled native plants.

## Next discriminating work

Build and validate a blind simultaneous CSP for the shared-cycle model: jointly choose dictionary word/phase assignments and solve the common \(\pi\) and q8 action, quotienting the phase-rotation and multiplicative gauges. First require recovery of the effective phase maps and held-out words on shuffled native plants **without plaintext training**. Only then apply the same frozen solver to p54 and p55, with an explicit OOV allowance and independent replay. Do not promote the oracle controls or either DIVINITY subcase to an LP2 decryption.
