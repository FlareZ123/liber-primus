# P50 leading-zero doublet enrichment survives exact event-bearing-word identity conditioning

**Agent34, 18 November 2026. Classification: exact source-conditioned localization. No unknown plaintext, key, state rule, or destination is recovered.**

## Correction of this file's earlier scope

An earlier version of this report treated the published T7 doublet-gap ordering reproduction and page/block conditioning as fresh local evidence. That was wrong. The repository already contains stronger analyses from 12–14 November:

- `lp2-doublet-gap-source-boundary-conditional-gate.md` conditions on chapters, physical pages, 13-dot fragments, word/line classes and word lengths;
- `lp2-doublet-gap-original-source-conditioned.md` localizes the residual to printed-line occupancy;
- `lp2-doublet-block-marginal-control.md` shows the arbitrary 1,000-rune block profile is ordinary as a rate statistic and records the stronger event-bearing-word identity result.

Most importantly, the established event-bearing-word null fixes the exact 85 printed words that contain the 86 adjacent-equality events and finds the published gap correlation ordinary after within-word relocation (upper tail about 0.259). The gap statistic is therefore largely inherited from **which words carry events**. This file is rewritten around the one distinct question left by the newly active p50 leading-zero result.

## Distinct question

The p50 phase-0 literal-leading-zero clock places **33 of the 86** same-page adjacent-equality events on the 60 table cells whose printed token begins with `0`. Could that enrichment merely be a by-product of the already-known selection of 85 event-bearing words?

Test the strongest version of that rival directly.

Use the canonical 2,896 printed words from `resources/transcriptions/liber_primus_master.txt`, verified rune-for-rune against all 12,956 canonical p0-p55 ciphertext runes. Retain the exact **85 event-bearing word/page groups** and their event counts: 84 groups contain one event, and word ID 1476 on p27 contains two. Within each fixed group, permit an event to occupy only one of that group's original same-page predecessor positions.

Classify every eligible position with the unchanged p50 phase-0 predecessor-cell clock:

```text
cell = (global_event_position - 1) mod 256
masked = printed p50 token at cell begins with "0"
```

No word identity, page, event count, p50 phase, table predicate, or threshold is learned from the outcome.

## Exact finite null

For a fixed word/page group with `n` eligible positions, `m` leading-zero positions and `k` observed events, the number of masked events under uniform within-group relocation is exactly:

```text
X ~ Hypergeometric(n, m, k)
```

Convolving the 85 finite group distributions gives the complete null exactly. No simulation is required.

| Quantity | Result |
| --- | ---: |
| Original same-page adjacent-equality events | 86 |
| Fixed event-bearing word/page groups | 85 |
| Observed p50-leading-zero events | **33** |
| Exact conditional expectation | **20.6329365079** |
| Exact conditional SD | **3.5686048822** |
| Exact `P(X >= 33)` | **0.000624251199** |
| Descriptive common conditional odds ratio | **2.4256189443** |

The odds ratio is the conditional maximum-likelihood common multiplier for a leading-zero cell within these fixed word/page groups. It is an effect-size description, not a cipher key.

## Global word-role composition control

A possible objection is that the p50 association is only a consequence of the observed mix of word-initial, word-final and interior doublets. Across the full source, leading-zero exposure is similar in all three roles:

| Current-rune role | Leading-zero eligible sites | Other eligible sites | Masked events | Other events |
| --- | ---: | ---: | ---: | ---: |
| word-initial | 676 | 2,197 | 10 | 13 |
| word-final | 696 | 2,108 | 8 | 11 |
| interior | 1,653 | 5,571 | 15 | 29 |

The corresponding raw event-rate odds ratios are about 2.52, 2.22 and 1.75. The effect is therefore not confined to one word role.

For an exact matched control, keep the same 85 event-bearing word/page groups and every group's event count, and also require the simulated source-wide event-role totals to equal the original **23 initial, 19 final, 44 interior**. Which fixed word contributes each role remains free. An exact multivariate convolution over all within-group position choices gives:

- conditional expected masked events **20.8841801921**;
- conditional SD **3.5685363928**;
- exact **P(X >= 33 | word identities, group counts, global role totals) = 0.000785547178**.

This is the useful role-control result. If each event's exact role is fixed separately inside its already fixed word, the upper tail rises to about 0.0455, because a word-initial or word-final role usually fixes a unique position and therefore fixes its mask class too. That saturated conditioning answers a different localization question and should not be used to argue that the global role mix explains the association.

## Cryptanalytic meaning

This result separates two structures that were previously easy to conflate.

The **T7 gap autocorrelation** is mostly explained once the identities of the event-bearing words are held fixed. The **p50 literal-leading-zero association is not**. Even after freezing those same 85 word identities and all per-word/page event counts, the exact event offsets land on leading-zero clock cells far more often than their within-word exposure predicts.

Therefore the p50 signal is not merely a proxy for the spacing of the event-bearing words.

This does not establish that p50 generated the doublets. It also does not make a static allow/deny mask into a reversible 29-symbol cipher. A mechanism still has to explain why these particular words contain events, why these particular offsets prefer the mask, how all non-event ciphertext symbols are produced, and how a solver obtains the initial state or key.

## Decision

The useful next gate is the already-open Director localization task #1508: compare the literal-leading-zero predicate against equally simple source-visible p50 features under held-out chapter prediction. The exact word-identity conditional result above can serve as an independent requirement on any winner.

A successful p50 mechanism should predict **within-word event offsets** without being handed the 85 event-bearing words, or should derive both word selection and mask preference from one lossless rule. A model that only reproduces the 33/86 count after fitting per-word state is insufficient.

Do not resume generic T7 page/block scans, generic HMMs, free breakpoint searches, or arbitrary p50 cipher sweeps from this result. Those routes are already covered or lack a source selector.

## Reproduction

`sims/lp2_doublet_gap_nonstationarity_sft.cjs` now implements only this corrected bridge plus strict source alignment. It:

- reconstructs the canonical 2,896 printed words and verifies all 12,956 runes;
- derives the exact 85 event-bearing word/page groups and the 86 same-page doublets;
- applies the fixed p50 phase-0 leading-zero clock;
- computes the exact 85-factor hypergeometric convolution;
- asserts `E[X]=20.6329365079`, `P(X>=33)=0.000624251199`;
- reports the common conditional odds ratio 2.4256189443;
- exactly conditions again on the global 23/19/44 word-role totals and asserts upper tail 0.000785547178.

**Result:** p50 leading-zero enrichment contains information beyond event-bearing-word identity, while still supplying no plaintext or key.
