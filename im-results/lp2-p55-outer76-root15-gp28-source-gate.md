# P55 outer-76 table circumference under a GP28 root-15 step

**Status: original-input bounded negative. No unknown plaintext, key or destination recovered.**

## Source evidence and conditional cipher hypothesis

Physical LP2 p55 prints exactly 76 GP29 runes. The original 32×8 table on pp49–51 has exactly 76 perimeter cells. Authentically solved p57 says to shed our own circumferences. The original p15 number puzzle demonstrably uses a clockwise square spiral. Together these motivate one bounded direct original-cipher test.

Read table cells clockwise, starting at the upper-left: top row left-to-right, right column down, bottom row right-to-left, left column up. First 16 original bytes under the still-provisional base60 table encoding are [203,231,167,186,97,237,126,183,212,87,133,5,76,80,51,108].

Represent p55 source runes as GP29 integers C[0..75], source ring bytes as K[0..75], and define modulo m to return nonnegative residues. Fifteen is a primitive root mod29 with 28 nonzero powers. Decode first P[0]=(C[0]−K[0] mod29) mod29. At subsequent positions, D=(C[i]−C[i−1]) mod29. If D=0, decode GP-EA index28. Otherwise P[i]=(log15(D)−K[i] mod28) mod28. Encode by retaining the preceding ciphertext when P[i]=28, otherwise adding 15^((P[i]+K[i]) mod28) mod29. Every rune consumes one ring byte, including duplicated ciphertext events; no fitted rotation, sign, key phase, or word correction.

**Strongest missing selector:** No authenticated source commands table byte modulo28, a GP28 root-step, a zero-delta EA convention, or the upper-left starting point. This is a deliberately frozen experimental codec, not an established creator operation.

## Complete original p55 decode

Decoded GP transliteration:

```text
NGMNXAEOPOEENTOSUPTHSFDAENGEOWMWMTFGNGGIAIORJTUCNGEOUFHUEOFNGBIXAEDWWFTHGEAMDWOEDNGUOEMTBJTIAMO
```

Original IoC 0.03543859649122807, near uniform GP29. Exactly one EA marker is recovered from the original single adjacent doublet. The output is not intelligible GP language, and no authentic cipher key emerges.

## Source-corner and first-word discriminator

P55 begins with a **one-rune printed word**. Under a native-English GP plaintext register, A and I are plausible one-rune standalone words. The first rune of the original p55 ciphertext is GP NG (index21). Test the four **physical corners** of the 32×8 original printed table as clockwise perimeter starting points; each remains a complete, source-visible 76-cell path. This is a small originally visible choice rather than a sweep of all 76 rotations.

| First table corner | Original first byte | Decoded first GP word | Full-page decoded IoC |
| --- | ---: | --- | ---: |
| NW (printed top-left) | 203 | NG | 0.035438596 |
| NE (printed top-right) | 183 | EO | (nonlinguistic) |
| SE (printed bottom-right) | 80 | EA | 0.033684211 |
| SW (printed bottom-left) | 113 | **A** | **0.037192982** |

The SW choice uniquely makes the opening original one-rune word the plausible GP word A, but this is selected *after inspecting the ciphertext*. Its immediately following complete four-rune word decodes as `OE/X/L/W` (printed GP transliteration `OEXLW`), and the remaining 75 runes do not form coherent GP text. The SW first-word agreement cannot authenticate a key. The earlier SE-corner experiment motivated by the independent, unverified 318° southeast route likewise yields no original plaintext.

All four original-corner decodings are exactly reencryptable under their respective 76-byte keys. The source p55 page and original table do not specify which corner begins the cipher, or even require that the p55 plaintext is English.

## Source control and decision

The exact [CommonJS SFT](../sims/lp2_p55_outer76_root15_gp28_sft.cjs) reads original p55 and original table bytes, checks all 76 distinct circumference coordinates and their initial cells, validates primitive root15 and 76/76 original forward reencryption, and recovers an independent authentic solved-p57 native-GP 76-rune plaintext plant. These are internal reproducibility checks, not historical key evidence.

Decision: the four visible table-corner clockwise 76-byte circumference starts under this GP28 root-step inverse are bounded negatives for overt native-GP English. This does not contradict prior direct table-ring mapping tests. Further starting-point, skipping, direction, key or decoding searches require an independent author-selected operation.