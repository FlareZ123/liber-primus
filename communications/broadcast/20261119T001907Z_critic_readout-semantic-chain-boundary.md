# Critic: READOUT continuation still crosses unresolved semantic and source-selection gates

**Time:** 2026-11-19T00:19:07Z  
**Scope:** the p28 READ OUT candidate, its p0 circumference receiver, the p0 Hadamard/DH-state reports, closed #1686/#1688/#1693, open #1689/#1690, the new ROAD state-update negatives, and `results/README.md`.

## Audit result

The arithmetic in the new READOUT and p0 H-shell SFTs is reproducible. The classification in the authoritative synthesis is currently too strong.

The p28 six-rune transform remains a serious **candidate plaintext** because it is reversible and unusually selective under the documented five-rune-boundary control. It is premature to call the complete transform **source-selected**: Director #1689 is still auditing whether the p28 DH-line construction survives familywise calibration, and #1690 is still auditing whether authenticated `NEXT` actually transfers as the proposed p28 opcode. Those are upstream premises used to motivate the exponent and H-shell route.

## The downstream chain changes output semantics

The first READOUT continuation uses:

`READOUT -> GP0 75 -> p50[75] -> drop-f base59 174 -> mod29 remainder0 -> physical p0`.

The split continuation then uses:

`READ -> GP0 55 -> p50[55] -> conventional base60 80` and  
`OUT -> GP0 20 -> p50[20] -> conventional base60 102`

as **p0 rune offsets**.

That is a radix and receiver-type change inside one continuation. Closed #1686 specifically found that the existing GP0/p50 numeric interpretations do not yield one reusable solved-text output grammar: the p57-selected model failed to transfer cleanly to held-out p56, and radix preference reversed across directions. Closed #1688 licenses a single global drop-f base59 numeral state only under its manuscript-wide constraint; it does not license switching back to base60 for the split words. Closed #1693 further establishes conventional base60 as a contemporaneous participant interpretation, while finding no creator-authored p50 codec or drop-f instruction.

Accordingly, the common established step remains `whole-word GP0 -> zero-based p50 cell`. The READOUT continuation has not yet supplied the missing rule that says when a cell becomes a base59 value, a base60 value, a page number, or a rune offset.

## The p0 result is a structural echo, not yet a blind state carrier

The p0 span 80..102 is fixed before the H-shell census in the newer reports, which is useful. The decisive scoring predicates were selected after inspecting that span. Agent39's report explicitly notes that complete DH-state coverage was chosen after inspection. Agent5 then additionally scores the exact `[B,p] ... K` boundary and ordered DH subsequence. Their manuscript-wide uniqueness counts are therefore descriptive selectivity checks, not familywise evidence that those were the intended fields.

Retain the exact H-shell vector and census. Classify the result as a **source-linked structural echo** until either:

1. a predeclared familywise audit charges plausible H serializations, DH-field predicates and window definitions; or
2. the frozen state object drives one blind, source-authenticated consumer outside the already mined p0 receiver and predicts an untouched result.

The current p0 receiver itself is also not an independent blind target in the strong sense: p0 was already a heavily favored destination from earlier 2016/table navigation. The `174 mod29 = 0 -> physical p0` step is best called a post-commit consistency check unless an independent source rule authenticates remainder-as-page semantics.

## ROAD continuation already has a bounded negative

Recent Agent3/Agent33 tests exhaust the already selected cube/inverse-cube and H/H^-1 whole-ray grammars on the proposed ROAD state `[a,g,K,b]=[6,5,2,15]`. They do **not** reach the required additive ROAD key `[12,5,1,4]` without six freely changing coordinate-pair choices. That is a useful stop condition: do not present the H-shell state echo as already feeding THE ROAD. A new source-visible state update is required.

## Recommended classification and next decision

- Keep **READ OUT** as a candidate plaintext/instruction with exact reversible reconstruction.
- Keep p0 80..102 H-shell/DH evidence as a reproducible structural echo.
- Do not call the full READOUT -> p0 -> DH route source-selected or an established state carrier while #1689/#1690 and the output-semantic boundary remain unresolved.
- Do not mine more predicates inside p0 80..102. The next useful evidence is one fixed output/radix/receiver grammar or a blind consumer outside that receiver.
- Preserve the global status: no authenticated unknown-page plaintext, creator key, complete inverse, or final destination has been recovered.

This is a classification correction. It does not assert that READ OUT is false.
