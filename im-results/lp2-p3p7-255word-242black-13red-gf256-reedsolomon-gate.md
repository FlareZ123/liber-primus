# The 255-word scroll and a source-shaped RS(255,242) test

**Agent 4, 22 November 2026. Outcome:** A new finite-field interpretation of an exact original ink partition was investigated. Fifteen predeclared whole-word-to-byte representations reject the conventional GF(256) Reed–Solomon code, even with **arbitrary codeword root offset**. **No plaintext, author-selected word-to-byte map, or original key recovered.**

## Why this particular code is a plausible human puzzle hypothesis

The five-page original physical **p3–p7 scroll** has exactly **255 complete GP29 words** including line/page carries. Its original ink yields **242 entirely black** and **13 entirely red** words. The 13 red positions in the uninterrupted 255-word register are

0, 1, 2, 22, 176, 177, 178, 179, 250, 251, 252, 253, 254.

Those 13 red words are distinct, and none repeats any of the 242 black word spellings; the scroll contains **252 distinct words**. The last five red original GP29 ordinal-index word products modulo29 are **[11,26,8,15,2]**, an independently present source-number operation. The immediately following physical **p8 has 255 runes**, of which 243 are black. The separate p49–p51 printed number field has **256 cells**, interpretable as bytes under its plausible radix60 rule.

This suggests two related field sizes: **255 = 2⁸−1** and **243 = 3⁵**, while **255−242=13**. A conventional Reed–Solomon **RS(255,242)** code uses precisely 255 byte symbols and 13 independent byte parity constraints. The red 13 slots could, hypothetically, mark parity inserted at noncontiguous positions. This is a *source-shaped hypothesis*, not an authenticated encoding instruction. Most importantly, **GP29 words have no first-party selected conversion to GF256 byte values**, so the count match alone cannot specify a decoder.

## Exact original-input finite-field test

The [read-only Windows Node22 SFT](../sims/lp2_255word_242black_13red_rs255242_original_sft.cjs) constructs whole source words from the [original transcription](../resources/liber-primus/lp2-transcription.txt), preserves cross-page words, confirms red sites from [physical ink annotations](../resources/liber-primus/lp2-ink-annotations.json), and verifies the [canonical GP29 corpus](../resources/liber-primus/lp2-corpus.json). It asserts all 255/242/13 source counts and the original last-five red-word GP index products.

It evaluates **15 independently chosen byte representations**, including the actually clue-motivated **GP ordinal product modulo29** (then its integer 0…28), GP prime product modulo29, both prime/index sums modulo29, index/prime sums modulo256, index-based base29 Horner mod256 with zero- and one-based digits, index/prime products modulo256, word length, first/last rune, position-weighted sum and rune-index XOR. Byte arithmetic is explicitly reduced at each step to avoid JavaScript integer precision loss on long GP29 words.

The tested historical-standard field is GF(2⁸) with irreducible polynomial **0x11D**, primitive generator **2**, and the standard 13-consecutive-root RS(255,242) parity condition. For each complete original 255-byte codeword, it evaluates the polynomial at **all 255 nonzero GF256 elements** and finds the longest consecutive run of zero syndromes. Every one of the 15 original word-byte maps has **at most ONE consecutive zero root**, whereas any valid RS(255,242) codeword needs **13**. Therefore neither root offset, nor codeword reversal, nor swapping the fixed 0/1 starting root can save any tested map under this field and code convention. The four most source-native GP-index/prime modulo29 maps have zero-root counts 1, 2, 0, 0, respectively.

For a stronger parity-position check, the SFT solves the full **13×13 GF256 system** to calculate precisely which 13 byte values the red positions would need to contain if all 242 black-word bytes were authentic systematic data. At the two usual root offsets 0 and 1, the original red numeric representations match **no more than 1 of 13 required parity bytes** per candidate. No tested summary yields the complete source red parity. In a reverse positive control, the computed 13 parity values are inserted into those exact original red slots, the generator rechecks all 13 syndromes as zero, and an intentionally changed parity byte is detected. All 15 original and planted tests PASS.

## Interpretation and bounded next choice

The unusually clean **255 words = 242 black data candidates + 13 red candidates** remains a legitimate observation. This experiment rejects a **conventional GF256 0x11D RS(255,242) codeword** from the fifteen source-plausible deterministic word-byte encodings, without attributing significance to arbitrary isolated matching bytes. It does not rule out a different byte map, an alternative field/basis, nested data coding, or a role for 242 and 243 in the primitive GF3⁵ recurrence suggested by p7.

A secret arbitrary word-to-byte dictionary could always manufacture RS parity here: all 13 red whole words are different and absent from the black register. Such a fit is therefore **not a breakthrough** until a first-party source selects an independently reproducible dictionary or encoding operation. The next substantive decision must derive that operand from genuine visual/historical instructions or yield held-out original ciphertext predictions. Do not extend this by blind enumeration of random field polynomials, red interleavings or hidden byte maps.
