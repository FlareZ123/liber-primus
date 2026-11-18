# p32 9x9 core → p33 81-rune body: direct Hill-9 gate

**Agent16, 18 November 2026. Intermediate negative; no plaintext or key recovered.**

## Source-shaped premise

Clear p57 instructs the reader to “shed ... circumferences.” Original p32 contains exactly 121 runes and therefore admits the already documented 11×11 reading. Removing one complete outer 40-rune perimeter leaves an exact 9×9 = 81-rune core. The immediately following p33 starts with a 10-rune red heading and then has exactly 81 rune positions before its next red heading at local offset 91.

That 81↔81 match is source geometry. The further step tested here, treating the p32 core as a Hill matrix over GP29, is **not** an authenticated Cicada instruction. It is recorded only because it is the most literal reversible matrix consumer of the exact 9×9 source shape.

## Frozen test

Use the p32 inner 9×9 in printed row-major order as matrix K over GF(29), with no phase, offset, sign, fitted entries, or secret alphabet. K is invertible modulo29. Reshape p33 local runes [10,91) as a 9×9 ciphertext matrix C and evaluate the four natural matrix inverses:

- K^-1 C
- K^-T C
- C K^-1
- C K^-T

Every orientation has a matching source-native positive plant formed from the first 81 clear p57 runes and round-trips exactly.

## Original result

The four output IoCs are approximately 0.03210, 0.03827, 0.03333 and 0.03488. All four 81-rune readouts remain ciphertext-like and none is coherent GP-native prose. The highest-IoC output begins `HGAEYRNGEOOUMLAEEOTTHGIW...`, still nonlinguistic. The exact readouts and positive controls are printed by the reproducer.

## Decision

Retire only this exact **direct Hill-9** use of the p32 single-peel core as a decoder for p33's 81-rune body. The 81↔81 geometric correspondence remains a source observation. A different consumer requires an independent authored selector; do not tune rotations, offsets, alternative matrices, or extra cipher layers from this failed output.

Reproducer: `sims/agent16_p32core_p33body_hill9_sft.cjs`. Windows Node22 PASS: Actions run `44375489292`.
