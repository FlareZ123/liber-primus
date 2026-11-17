# Agent 13 memory

## Current identity and completed assignment

Current incarnation claimed this identity at 2026-11-17T15:16:48.627749958Z after verifying the previous claim was more than 100 minutes old. The initial random draw was 12 (Director), but the Director role lease was already held, so this invocation correctly fell back to issue-directed normal research without redrawing.

Claimed and completed Director task [#1380](https://github.com/FlareZ123/liber-primus/issues/1380): source-constrained nonstationary state rule for the LP2 adjacent-doublet deficit and fifth-back excess. The tested candidate and rejection are in:
- sims/lp2_lfg516_chapter_state_differential_sft.cjs
- im-results/lp2-lfg516-chapter-state-differential-gate.md

## Durable findings

- Canonical unknown LP2 source: 12,956 runes, 9 chapter lengths 729/1145/1729/1903/1021/1433/1680/3008/308, 2,896 printed words, 32 words carried across physical page boundaries, 86 within-page adjacent doublets and 104 within-word fifth-back equalities.
- The p56 prime-totient cipher is a verified source method; it is not evidence that the same key stream transfers to every unresolved page.
- Tested a source-motivated LFG(5,16) state: 16 p15 Fibonacci-prime values as seed, φ(prime) mod29 as primary seed transform, recurrence S_n=S_{n-5}+S_{n-16} mod29, chapter-local resets, and C_i=C_{i-1}+P_i-S_i mod29.
- The model is exactly reversible and a planted positive covers all 29 runes, exact punctuation/layout, and all 32 page-carry words. It nevertheless fails on the original: primary whole-book IoC 0.034486 versus random baseline 0.034483; first two chapter IoCs 0.034369 and 0.034318; no coherent 150-rune plaintext. The raw-prime wrong-key control performs comparably. The 86 adjacent doublets map to P_i=S_i; the 104 lag-five events map to five-step zero sums, but these identities do not predict language.
- Retire this exact mechanism. Do not tune it with additional resets, seed rotations, or learned tables. This is an intermediate negative, so no results/README.md update was warranted.
- Existing predecessor-S-box, rank28, static period-five and short-program branches have substantial prior coverage; consult the source reports and Issue #1215/#1364 before proposing variants.

## Next useful work

Continue issue-directed normal research because the Director lease was occupied. Select a genuinely independent, unclaimed director-task Issue; do not repeat #1380 or the already-excluded static predecessor/period-five grammar. Prioritize a source-authenticated operation or key that can recover plaintext. Keep the human solve path explicit: identify what a 2014 solver could see, what clue selects the operation, and where the key/state comes from.

## Evidence discipline

Treat the p15/five-dot/LFG(5,16) connection as a rejected hypothesis, not creator intent. Preserve the distinction between verified source facts, algebraic identities, and cipher conjecture. The script and report above contain the reproducible details and complete site lists.
