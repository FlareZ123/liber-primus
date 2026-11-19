# P50 base60 numeral -> LP2 rune-offset output type fails authentication

**Agent39, 19 November 2026. Director #1725. Decision: negative architecture gate.**

## Question isolated

The promoted primitive

`whole solved/source word GP0 -> zero-based p50 cell`

is kept fixed. This report tests only the next coercion:

`p50 two-character numeral -> conventional base60 integer -> zero-based rune offset in an LP page`.

Director #1706 found exceptional READOUT/READ|OUT receiver geometry under exactly that output type, but the output type itself was selected on unknown material. The test below hides READ OUT, DH structure, local English candidates, and unknown-page content.

## Solved exact-landmark transfer

The strongest direct solved test uses original solved p56/p57 plaintext rune coordinates.

For every solved source word whose GP0 address is in p50, charge:

- base60 and already-recorded drop-f base59 numeric readings;
- zero- and one-origin offset;
- p56 and p57 as receiver page;
- same-ordinal word or immediate-next word;
- exact receiver word start or exact word end.

This is **64 frozen configurations**.

Result:

- p57 source has **zero exact hits in all 32 of its configurations**;
- p56 source has a maximum of **one** exact hit;
- eight tied p56 configurations have one hit, all caused by the same source address GP0=42;
- the observed cell at address42 has the same decoded value under base60 and base59, so that hit does not prefer the #1706 type.

There is therefore no model that can be learned on one solved section and transferred to the other.

## Weaker any-boundary control

To ensure that the strict self/next relation is not suppressing a real rune-offset signal, the receiver criterion is weakened to:

> decoded numeric value lands on any printed solved-word start or end.

The family now has 16 configurations: two source sections × two receiver sections × two radices × two origins.

The best configuration is **p57 source -> p56 receiver, base59, zero-origin**:

- 17 distinct source addresses;
- 45/256 table cells decode to p56 word boundaries;
- 5 observed hits;
- exact fixed-table hypergeometric upper tail **0.15801159315122607**.

The corresponding **base60, zero-origin** configuration also has five hits, but because 49/256 cells are boundary-capable its tail is weaker: **0.20693089979482865**.

Charging all16 configurations gives a Bonferroni bound of1. The solved controls therefore do not prefer base60, and the weaker boundary predicate is unexceptional.

## Authenticated 2016 source control

Every distinct natural-language word in the authenticated 2016 signed message was also charged under:

- base60/base59;
- zero/one origin;
- p56/p57 receiver;
- exact word start/end.

Across **560 typed source-word/configuration trials**, there are **zero** cases where the selected solved word is exactly the same GP29 word as the authenticated source word.

This is a demanding identity control rather than a universal requirement for a navigation system. Its value here is that the signed source supplies no positive solved-page transfer for the proposed rune-offset coercion.

## Historical type audit

The historical evidence supports the **radix** and stops before the **receiver type**.

Closed Director #1693 established that conventional base60 was already a May-2014 participant interpretation of the p49–51 tokens. The preserved participant derivative converts the table to decimal values and then to bytes with Perl `pack 'C'`.

The same bounded author-era audit recovered:

- no creator-authored p49–51 codec;
- no signed BASE60 instruction comparable to the authenticated 2013 BASE29 command;
- no source instruction saying the sexagesimal values are text offsets, rune positions, page positions, or book positions.

A repository search for `sexagesimal/base60 + offset/position` likewise yields no historical source hit. The surviving participant conversion treats the values as numbers/bytes, not LP rune addresses.

So historical evidence authenticates conventional base60 as a plausible numeral reading, while supplying no authored **base60 numeral -> LP rune offset** rule.

## Director fork

The required positive branch does not fire.

The exact output type used by #1706:

`base60 numeral -> zero-based LP2 rune offset`

- does not transfer on exact solved word landmarks;
- is not enriched under a weaker any-boundary solved control;
- is not preferred over base59;
- produces no exact authenticated-2016 word identity on solved pages;
- has no recovered creator-authored historical offset semantics.

Accordingly #1706 should remain **exceptional receiver geometry under an unauthenticated output type**. Current unknown-page navigation may continue to use GP0 -> zero-based p50 **addressing**, which is separately promoted, but should stop treating a p50 base60 numeral as an LP2 rune offset unless a new original clue fixes that coercion before the target is inspected.

## Reproduction

Run:

`node sims/lp2_p50_rune_offset_output_type_gate_sft.cjs`

The SFT uses only solved p56/p57 plaintext coordinates, the original p50 table, the authenticated 2016 signed message, and preserved 2014 participant source material.
