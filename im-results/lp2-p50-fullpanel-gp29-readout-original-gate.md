# Original pp49–51 256-cell GP29 reader: complete direct readout, missing authored decoder

**Agent17, 23 November 2026. Status: bounded negative for a direct, unkeyed numeral-to-rune instruction, plus an explicit missing-operation dependency.** No original unknown LP2 plaintext, key, deciphering rule, or puzzle destination was recovered. This is the original-source decision for [Director task #2412](https://github.com/FlareZ123/liber-primus/issues/2412).

## What a 2014 solver could actually read

Original scans `66.jpg`–`68.jpg`, physical LP2 pp49–51, present exactly 32 rows of eight two-character alphanumeric cells, with a 10/13/9 row split across the pages. The manually original-image-adjudicated complete register is [`resources/liber-primus/lp2-grid-256.json`](../resources/liber-primus/lp2-grid-256.json); [the existing case-invariant GP29 result](lp2-p50-il-case-ambivalence-gp29-invariant.md) exhausts all 1,024 capital-I/lowercase-l assignments. In the *conditional*, historically documented conventional base60 alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`, the two confusable glyphs have digit values 18 and 47, a difference of 29. Thus every cell's value modulo29 is unchanged by all ten original `I/l` choices. The first-party 2013 command **BASE29** was an operation converting a supplied whole integer: `3301 → 3QO`; it did not stipulate base60, per-cell reduction, page-flank consumption, or a private GP29 alphabet. The full source audit in [the original radix report](lp2-cicada-authenticated-base60-alphabet-audit.md) found no earlier Cicada-authenticated transfer rule for this numeral panel.

**A decisive compatibility distinction:** the signed 2013 worked `BASE29` convention uses ordinary digits `0–9,A–S`. Exactly **124 of the panel's 256 two-character cells** contain at least one character outside that legal digit set, starting with `3p` in original cell1 and `2l` in cell2. Therefore **a direct 2013 BASE29 parse of the printed panel's literal tokens is impossible**, without a separate, unstated character mapping or transformation. This excludes direct transfer of the signed protocol's input alphabet even while leaving a different numeric conversion entirely possible.

This case invariance makes a stable **possible input**, but cannot authenticate that it was intended as a rune instruction.

## Frozen whole-panel readout

We interpreted *every one* of the 256 tokens in original printed row order, with no omitted cell, no key/phase fitting, and no resegmentation:

```text
value(a,b) = 60 * digit(a) + digit(b)   [conditional conventional base60]
rune(a,b)  = GP29[value(a,b) mod 29]
```

The standard byte fingerprint is SHA256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The readout begins in the exact indexed GP29 alphabet `[0,28,22,12,10,5,10,9,5,17,11,19,15,4,9,9]`, and the full histogram is:

```text
GP29 index  0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28
count       7 11  6  9  6 13 10  4  5  5  9  7  3  8  7 13  5  8 14 10  4  6 14  9  8 15 10 10 20
```

All 32 printed rows and their rune/GP transliteration, plus the 124-cell 2013 BASE29 incompatibility count, are printed by the source-read-only [standalone CommonJS reproducer](../sims/lp2_p50_fullpanel_mod29_readout_sft.cjs). The direct full 256-rune register has no coherent >=40-rune original-language imperative, much less a supported full inverse for the adjacent 138- or 170-rune ciphertext flanks. The isolated GP transliteration `THE` is not a coherent message. Purely statistical comparisons do not fix a grammar, so we do not equate nonprose appearance with a proof that every imaginable keyed reading fails. The canonical direct stream's GP `EA` value occurs 20 times (index28); the separately known solved clear p57 original has no GP `EA` in its 95 runes. This is a descriptive control, not a conclusive language exclusion for arbitrary original prose.

The alternate whole-panel `BASE29` reading is a *different* operation: interpreting all 512 source base60 characters as a single positional numeral yields 622 base29 digits, while the 256 conditional bytes as one unsigned big-endian integer yield 422 base29 digits. Those transformations do not preserve one cell to one rune and their unseparated outputs are likewise unrecognized; the signed source does not select which number representation is intended. They are not parameter-fitting opportunities.

## Decision and next causal dependency

This task establishes a reproducible, I/l-independent **complete 256-cell operand** and the limitations of its simplest direct reading. No 2013 or 2014 first-party artifact recovered here instructs a solver to apply cellwise `mod29`, select the 32×8 row-major direction as a rune text clock, or feed it into a particular original-page cipher. A successful successor would require an independently visible numeric operation / glyph-to-GP29 mapping **and** a specified recipient register/key/state. It would then have to decrypt >=40 consecutive full-panel runes as an authentic imperative or produce genuine full-flank unknown text with independent same-law holdout and exact forward replay. No additional alphabet shifts, arbitrary 256-step permutations, selected subsets or 59/60 conventions are warranted without that source instruction.

**Research consequence:** treat stable residues as a useful conditional source operand. Retire the direct unkeyed 256-residue instruction interpretation; preserve every numeric original byte and the ten source-image glyph ambiguity controls. Existing p50 generator, stream-key, polynomial and source-word investigations remain separate, unaffected by this bounded result.
