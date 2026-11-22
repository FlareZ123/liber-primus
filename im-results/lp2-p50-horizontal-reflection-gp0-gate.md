# P50 horizontal reflection adds no predictive GP0 receiver grammar

**Agent18, Director #1687, 19 November 2026. Classification: bounded negative for cryptographic use of the source-selected p50 horizontal reflection. The reflection remains a verified layout/orientation involution. No unknown LP2 plaintext, creator key, or complete cipher inverse is recovered.**

## Frozen question

Closed Director #1670 established from the original p50 image that the two main trees are near-exact horizontal mirrors and therefore select the eight-column involution R(8r+c)=8r+(7-c). The visual evidence fixes reflection before any table token is read. It supplies no traversal arrow, arithmetic combiner, radix, or receiver.

Director #1687 asks whether that one operation adds predictive information inside the already promoted whole-word GP0 -> zero-based p50 address system.

The test keeps the existing solved-control family fixed:

- source address: whole-word GP0, zero-based row-major p50 cell;
- positional modes: direct address as the baseline, or the single source-selected horizontal reflection;
- numeric interpretations already in the record: conventional base60 and order-preserving drop-f base59;
- source/receiver GP0 sets: solved p56, solved p57, and authenticated 2016 signed-message words;
- sequential control: exact immediate-next-word GP0 prediction.

This gives 18 reflected set-membership tests, with the 18 direct tests retained only as a baseline. No rotations, alternate origins, constants, affine maps, receiver-page tuning, or new radix rules are admitted.

## Reflected solved/source family is null-like

For every reflected source/receiver/radix configuration, the addressed table tokens are tested against the fixed receiver GP0 set. Because reflection maps each distinct source address to a distinct address, the exact hypergeometric tail conditional on the observed 256-token multiset is an exact matched-table permutation control for each marginal test.

The best reflected configuration is p56 -> p56 under base60:

- 18 distinct p56 source addresses;
- 18/256 table tokens are receiver-success values;
- 3 observed reflected hits;
- exact upper-tail p = **0.12194452388557359**.

The three hits are:

- THE, GP0 20 -> reflected address19 -> 0X -> 33;
- DEEP, GP0 72 -> reflected address79 -> 1M -> 82;
- IT, GP0 26 -> reflected address29 -> 16 -> 66.

Across all **18** reflected source/receiver/radix tests, Bonferroni gives **1**. Reflection therefore has no familywise solved/source receiver signal.

The direct baseline is stronger than the reflected family. Its best member is p57 -> authenticated-2016 GP0 values under base60, 6/17 hits with raw exact p = **0.012695003284347835**. Charging all 36 direct-plus-reflected configurations gives **0.45702011823652205**. This baseline is retained only to show that reflection does not improve the already weak mixed receiver family.

## Immediate-next and literal-pair controls

Across p56, p57, and the authenticated 2016 word sequence, both admitted radices give **zero reflected immediate-next-word predictions**. The direct signed-2016/base60 baseline has one such hit, THE -> DEVOTED, which disappears under reflection.

Across all 128 physical horizontal mirror pairs in the p50 table there are **zero exact literal-token matches**. Base60 and base59 are injective token readings, so exact numeric equality is absent as well. Reflection therefore does not supply a repeated-token/equality rule on solved controls.

## The one base60 commuting square reuses one GP0 address

A source-natural structural diagnostic asks whether the numeric table commutes with the same involution:

B(R(i)) = R(B(i)),

where B is the conventional base60 value in the cell and R is the same eight-column reflection on 0..255.

Exactly one of the 128 mirror pairs satisfies it:

- addresses **67 <-> 68** contain 3C/3J;
- base60 values are **192 <-> 199**;
- 192 and199 are themselves a horizontal mirror pair.

A deterministic 200,000-permutation exact-token-multiset diagnostic with seed 0x1687a18 gives:

- P(at least one commuting pair anywhere) = **0.4041129794351028**;
- P(at least one commuting pair touching the solved p56/p57 address union) = **0.09598452007739962**;
- P(at least one pair touching both solved address sets) = **0.027754861225693872** before any family charge.

The last figure does not provide a held-out transfer. Solved p56 EUERY (EVERY) and solved p57 SURFACE both have **GP0=67**, so both sections select the identical table address. Seven GP0 addresses are shared between the two solved sections; after removing those shared addresses, p56 has **zero** reflection-equivariant hits and p57 has **zero**. The base59 table has zero commuting mirror pairs globally.

Thus the visually attractive 67/68 square is an address-reuse coincidence under the solved-control contract. It predicts no new solved address and supplies no plaintext operation.

## Decision

Take #1687's negative fork.

The original artwork securely selects horizontal reflection as a reversible orientation operation. Within the promoted GP0 navigation system, the operation adds no predictive solved-control information beyond the address already supplied by GP0. The finite reflected receiver family is null-like, all reflected next-word tests fail, literal mirror equality is absent, and the sole base60 commuting square repeats one shared solved address rather than transferring to an independent holdout.

No unknown-page receiver is opened under this issue because the required solved-control gate fails. Future work may use c -> 7-c as source-authenticated layout/orientation evidence when an independent clue already specifies a consumer. The tree artwork alone does not license another cipher menu.

## Reproduction

Run the single-file test:

node sims/lp2_p50_horizontal_reflection_gp0_gate_sft.cjs

It uses the preserved solved GP-native control corpus, the original p50 table transcription, and the authenticated 2016 signed-message extraction. The deterministic permutation seed and all family counts are printed in the result.