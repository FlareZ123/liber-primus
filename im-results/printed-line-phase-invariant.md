# Printed LP2 line alignment: weak coincidence surplus, no shared line-key recovery

**Status: source-aligned, reproducible manuscript constraint. No decrypted LP2 passage, key, or continuation target.** Agent 20, 2026-11-10. The printed-line test is distinct from the existing page-offset and absolute-rune-period tests in [phase-coincidence-invariant.md](phase-coincidence-invariant.md); it examines the 594 original slash-delimited *physical lines*, without moving page boundaries or reinterpreting runes as letters.

## Exact source and hypothesis

The checked-in `resources/liber-primus/lp2-transcription.txt` retains physical line breaks as `/`, and `%` separates successive transcribed rune pages. As in the canonical page-number correction, transcription record 50 is physical LP2 page **51**, because physical page **50** is the runeless grid. The reproducer reconstructs every page and asserts *exact ordered rune-index equality* against `resources/liber-primus/lp2-corpus.json` before testing anything. The analyzed 55 unsolved rune-bearing pages contain **12,956 runes across 594 printed lines**.

A simple line-reset architecture posits `C(line,k)=sigma_k(P(line,k))`, where `sigma_k` is any shared deterministic bijection of the 29-symbol alphabet at within-printed-line rune offset `k`. Fixed-key additive encryption, arbitrary unknown outer permutations and repeated line-key substitution all preserve `C(line1,k)=C(line2,k) iff P(line1,k)=P(line2,k)`. Under ordinary GP-English plaintext with substantial letter-frequency concentration, same-column coincidence should therefore substantially exceed `1/29`. Position-independent or per-line secret pads do not satisfy this restriction.

Count matching glyph pairs at every within-line offset using all eligible pairs, and divide by the number of eligible pairs. The null independently circularly rotates **each complete printed rune line**, retaining its ordered rune content, exact length, internal repeat patterns and the manuscript's line-length multiset. All experiment choices and RNG seeds are frozen in `sims/printed_line_phase_invariant.cjs`.

## Results and an independent-prediction gate

| Original or controlled sample | Matching-rune rate or score | Matched comparison |
| --- | ---: | --- |
| All 594 physical lines | **0.0347686806** | 3,000 line-rotation controls, mean 0.0345053586, 10/3,000 ≥ original; one-sided +1 p=**0.003665** |
| First 28 physical pages (310 lines, 6,761 runes) | **0.0348299167** | 2,500 controls, 150 ≥ real, p=**0.06038** |
| Remaining pages (284 lines, 6,195 runes) | **0.0350787072** | 2,500 controls, 4 ≥ real, p=**0.00200** |
| All pages, second deterministic 2,500-control family | **0.0347686806** | 12/2,500 ≥ real, p=**0.00520** |
| Learn 29-rune column likelihoods on first 28 pages; freeze, predict last 27 | heldout logLR **-164.0504** | 3,500 independent test-line rotations, null mean -180.2520; p=**0.19452** |
| Reverse train/test halves | heldout logLR **-198.6682** | 3,500 test-line rotations, null mean -216.2853; p=**0.20908** |

For the heldout test, each position's 29-way letter frequency is regularized using **100 pseudocounts** distributed by the *training-only* global unigram. The model is frozen before examining the other half; its aggregate heldout likelihood advantage does not distinguish the source alignment from random shifts. The uncorrected marginal coincidence surplus is **weak, selection-sensitive evidence**. Its second-half concentration and failure of cross-page predictive generalization prevent claiming a reusable printed-line keystream.

**Power check:** Twenty GP-English-unigram planted sequences using the identical original 594-line geometry, a fresh random repeated 29-position additive key, and 81% stochastic correction of ciphertext doublets produced same-position matching rates **0.053008–0.056130**, all dramatically above 0.034769. The matching 20 independent per-output-key controls yielded **0.034241–0.034649**. The plaintext register comes from the established LP1 and solved-LP2 GP text with add-one smoothing. The stochastic correction in these plants is a *diagnostic null*, not a claim about Cicada's invertible operation. The test has decisive power for its specified repeated-key GP-English model.

The original typeset newlines show no reset-like interruption of the general ciphertext repeat suppression: **4 equality events across 539 within-page physical-line joins**, against **82 events across 12,362 ordinary within-line adjacent rune pairs**. The two categories have similarly low rates; they do not establish how the cipher treats line boundaries.

## Implications and limits

The evidence **disfavors directly enciphered GP-English under a shared fixed-position bijection that restarts at every printed line**, even when the ciphertext alphabet's 29 symbols are arbitrarily and consistently renamed. The observed weak position-associated residue is not a recovered schedule or plaintext and is not stable enough to support a shared key across the two manuscript halves. Possible confounds include physical typesetting, word-break distributions at printed line beginnings, manuscript section/register changes, and dependent ciphertext runes. The separate line-rotation null is a model, not a universal significance distribution for every potential line-based feature. No independent alternate-source validation of the weak original surplus has been obtained.

**Decision:** do not extend this into unconstrained scans over arbitrary column shifts, names, primes or additional nonlinear line maps on the strength of p≈0.004 alone. New work should use an externally sourced reset/key clue to predict previously unseen original ciphertext, then recover plaintext and exactly re-encrypt it.

## Exact execution

- [Standalone original-source test and seeded planted controls](../sims/printed_line_phase_invariant.cjs)
- [Manual-only GitHub Actions workflow](../.github/workflows/printed-line-phase-manual.yml)
- [Successful execution, run 42768872911](https://github.com/FlareZ123/liber-primus/actions/runs/42768872911)
- Input datasets: `resources/liber-primus/lp2-transcription.txt`, `resources/liber-primus/lp2-corpus.json`, and `resources/transcriptions/lp1_wulfic_canonical.txt`

No changes to authoritative `results/README.md` are warranted because this is a bounded structural negative and no LP2 decryption has been established.
