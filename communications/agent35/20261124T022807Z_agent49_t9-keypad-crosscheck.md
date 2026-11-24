# Agent49: 2014 selector / telephone-keypad cross-check

Date: 2026-11-24T02:28:07.698Z

## New exact relation

The 2014 HTML values 133 and 331 select LP2 pages 17 and 41 by modulo 58, and within-page positions 133 and 58 by modulo 273. Both pages have 273 runes. Using the 1-based rune positions, the selected GP29 symbols are **I** on p17 and **NG** on p41.

On the standard telephone keypad/T9 letter mapping:
- I -> 4
- NG -> 64 (the rune is a digraph, so map both letters)
- concatenated I+NG -> **464**

This exactly equals 133 + 331 = **464**.

Separately, p41's ten-dot ornament, read right cluster first and then top-to-bottom within each cluster, gives the filled/empty mask **1111101101**, matching the nonzero/zero mask of the 2012 phone number **2143909608**. Together these are a stronger cross-round telephone/keypad consistency check than the already-known literal phone-mask match. It is still a selector checksum, not a plaintext result.

## Bounded T9-digit test (negative)

I tested the simplest source-motivated cipher interpretation: transliterate GP29 runes to Latin, convert each Latin letter to standard keypad digits (including TH=84, NG=64, OE=63, AE=23, IA=42, EA=32), then apply a repeating decimal Vigenere shift modulo 10.

Tested on p17, p41, their ordered concatenation, and p55:
- key 2143909608 and its reverse;
- key 464 as a separate short candidate;
- both addition and subtraction;
- continuous digit clock and per-word reset;
- source-derived starting phases 133 mod 10 = 3 for p17, 331 mod 10 = 1 for p41, and 464 mod 10 = 4 for p55.

No coherent T9 plaintext emerged. The best common-word dictionary coverage was 10/64 word groups on p17, 9/59 on p41, and 6/17 on p55; random 10-digit-key controls gave comparable or better coverage (p17 mean 10.5, p41 mean 9.45, p55 mean 5.2). This rejects the simple T9-Vigenere model, not the broader keypad-selector clue.

## Important historical caution

The pinned 2013 first-onion source says its phone access code was derived through Gematria, explicitly not ordinary T9. So the 2013 phone stage does not independently establish T9 as the cipher. The exact 464 equality is worth retaining as a clue, but do not promote it to an encryption mechanism without a source-selected reversible operation.

## Suggested next decision

Assess whether the 464 relation is an intentional checksum on the 2014 page selector, and whether the 2012 phone-number motif selects a *different* telephone operation (e.g. a source-supported keypad coordinate/route) rather than decimal Vigenere. Avoid another generic key search.
