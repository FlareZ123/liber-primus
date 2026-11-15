# Original LP2 apostrophe cribs: four source-visible short-word anchors

**Classification (Agent17, 15 November 2026):** a corrected original-ink observation and four finite conditional plaintext-shape constraints. No unknown-page plaintext, author-selected key, or decipherment mechanism recovered.

## Correct image mapping and recovered punctuation

The true original-JPEG filename is **LP2 physical page + 17**. An earlier repository annotation rejected four apostrophe marks after checking archive filenames **04/21/35/41.jpg** as though these identified LP2 physical pages. The correct scans **21/38/52/58.jpg** show the single raised ticks. Independently, the [17 October 2026 original-image separator audit](https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase9_separators.md) and [machine-readable tick census](https://github.com/pnotisdev/cicada3301/blob/main/work/ref/tick_marks.tsv) identified four single ticks within original cipher words at precisely these scans and text-line locations.

| LP2 physical page | Original scan | Original printed ciphertext word with source-visible tick | Zero-based rune immediately following tick, page / global | Exact GP29 word indices |
| ---: | --- | --- | --- | --- |
| 4 | [21.jpg](../resources/liber-primus/21.jpg) | **MXI'W** (3+1) | 164 / 1110 | [19,14,10,7] |
| 21 | [38.jpg](../resources/liber-primus/38.jpg) | **AEO'Y** (2+1) | 36 / 5138 | [25,3,26] |
| 35 | [52.jpg](../resources/liber-primus/52.jpg) | **PE'T** (2+1) | 80 / 8515 | [13,18,16] |
| 41 | [58.jpg](../resources/liber-primus/58.jpg) | **XLJ'C** (3+1) | 218 / 10089 | [14,20,11,5] |

**Original solved-plaintext control, across both Liber Primus releases.** The first release's physically printed LP1 **p14 Koan** contains the independently recovered English clause **"I DON'T HAVE A VOICE IN MY HEAD"**. Its unaltered original ciphertext in [the canonical LP1 transcription](../resources/transcriptions/lp1_wulfic_canonical.txt) is **I-RWNB-...**: GP source runes \`ᛁ-ᚱᚹᚾᛒ\`, where the corresponding plaintext \`DONT\` maps to the encrypted \`RWNB\` word. Original archive **14.jpg** visibly prints a **single 12×40-pixel tall apostrophe stroke at x1051,y2122**, precisely between encrypted N and B; its nearby standard separator dot at x1114,y2151 is **10×9 pixels**. The stroke's 379 dark pixels and bounding dimensions match **all four** original LP2 apostrophe strokes exactly. The [original-ink SFT](../sims/lp2_apostrophe_original_pixel_geometry_sft.py) independently asserts original LP1 rune/known-plaintext pairing and all five image glyphs. This establishes an original historical **punctuation-preserving English contraction precedent** for the *same typographic mark*, beyond inference from the four unknown LP2 pages. It strengthens the usefulness of contraction-form cribs, without proving any particular LP2 word or shared key.

An independent **original-JPEG pixel check** resolves the previous negative review's central mistake: the marks are **vertical 12×40-pixel ink components** in all four original scans at absolute raster coordinates **(1400,2014), (1258,884), (1195,1261), (1304,2390)**, while same-line ordinary separator dots measure **9×9 or 9×10 pixels**. The old audit enumerated baseline square dots, missing the raised 40-pixel strokes. The [Python Pillow/NumPy original-pixel SFT](../sims/lp2_apostrophe_original_pixel_geometry_sft.py) locks each ROI and its same-line dot as a positive size control; no visual inference from another document is needed.

The existing normal rune transcription omits these punctuation marks. They consume **zero** GP rune positions and preserve all **2,896 original printed words**. The four source positions and word lengths are directly checked against the original corpus by [the standalone source SFT](../sims/lp2_apostrophe_fourcrib_original_sft.cjs).

**The original known cipher clock also independently validates the apostrophe.** In solved LP1 p14, the encrypted five-rune sequence \`I-RWNB\` at source-local rune offsets **145–149** corresponds to plaintext **I DON'T**. The exact printed apostrophe after the third rune of \`RWNB\` is retained by the cipher. Under LP1's independently solved **13-rune Vigenère key FIRFUMFERENFE**, the five GP29 key differences \`C−P\` are **[0,10,4,0,1] = FIRFU**, the key's consecutive first five symbols. The source position **145** minus the **two known preceding literal-F bypasses** equals **143**, which is exactly **11×13**, the key's zero phase. Thus the authentic solved ciphertext preserves the apostrophe *without advancing the rune-key cursor*, and its full five-rune forward encryption checks exactly. This first-party control appears in [the expanded original-input apostrophe/key SFT](../sims/lp2_apostrophe_fourcrib_original_sft.cjs). Transferring the *design habit* of punctuation preservation is supported; transferring an unknown-page key from this example is not.

## Small original-location lexical candidates

Under the *conditional* premise that plaintext is familiar English and retains apostrophe placement, possible **3+1** words include DON'T, CAN'T, WON'T, AIN'T, ISN'T, LET'S, GOD'S, ONE'S, MAN'S, MEN'S, SHE'D, YOU'D, ALL'S. Possible **2+1** words include IT'S, HE'S, WE'D, HE'D, IT'D, DO'S. This finite dictionary is a discriminating test set; none of its entries is recovered plaintext, and dialectal, archaic, non-English or changed-register words remain possible.

For ordinary additive GP29 ciphertext `C=P+K mod29`, suffix plaintext **S/D/T** fixes conditional terminal key residues:
- p4 ciphertext **W**: 21 / 13 / 20
- p21 ciphertext **Y**: 11 / 3 / 10
- p35 ciphertext **T**: 1 / 22 / 0
- p41 ciphertext **C**: 19 / 11 / 18

All residues are under canonical GP index order, not English-letter-number order. These constraints only apply if the stated additive encryption and ending letter are correct.

## Exact source-contraction obstruction to a single shared affine slope

**Independent all-key gate (Agent18, 15 November 2026).** The same four original apostrophes constrain a broader and simpler cipher family without fitting any unknown key. The solved LP1 \`DON'T\` independently supports an apostrophe-preserving native GP29 English contraction. Suppose, conditionally, all four unknown marked words also preserve their apostrophes and each character **immediately after the mark** is one of the common contraction suffixes **S, D, T**, with GP indices \`[15,23,16]\`. Do **not** assume the four complete words have already been recovered.

Grant an arbitrary nonzero *global* multiplier \`a ∈ GF(29)^×\`, and independent, completely unknown additive offsets \`k2\` and \`k3\` at the suffix positions of the 2+1 and 3+1 words. The candidate word-reset affine encoder is \`C = a P + k_j (mod 29)\`. The offsets cancel when subtracting the two source words of the same morphology; no candidate key, dictionary word, phase or surrounding cipher text has to be fitted:

| Original matched suffixes | Cipher indices | Difference mod29 |
| --- | --- | ---: |
| p4 **MXI'W** versus p41 **XLJ'C**, 3+1 suffix at word position 3 | W=7, C=5 | **2** |
| p21 **AEO'Y** versus p35 **PE'T**, 2+1 suffix at word position 2 | Y=26, T=16 | **10** |

For plaintext suffixes drawn from \`{S,D,T}\`, the complete set of possible **nonzero** pairwise differences is \`D={1,7,8,21,22,28}={±1,±7,±8} (mod 29)\`. Under a shared affine multiplier, there would have to exist \`d3,d2∈D\` with \`2=a·d3\` and \`10=a·d2\`; eliminating \`a\` demands \`d2=5·d3 (mod29)\`. But \`5D={5,6,11,18,23,24}\`, **disjoint from D**. Hence **all 28 possible nonzero shared multipliers fail exactly**, despite letting \`k2\` and \`k3\` be entirely unrelated unknown secret offsets. In particular, an ordinary shared per-word Vigenère/Beaufort shift is excluded under these suffix assumptions. The result is an algebraic necessary-condition failure, not a language-score sweep.

The [exact original-input CommonJS SFT](../sims/lp2_apostrophe_shared_affine_suffix_sft.cjs) reads the unchanged four source offsets and page runes, checks the actual JPEG filename mapping, tests all 28 slopes and an independent affine planted positive, and reproduces the solved LP1 \`DON'T → RWN'B\` key-difference control. It **passed on Windows Node22** ([GitHub Actions 43691839818](https://github.com/FlareZ123/liber-primus/actions/runs/43691839818)).

**Scope:** This does not prove that unknown apostrophe suffixes are S/D/T, establish any one of their plaintext letters, or reject position-varying affine multipliers, page/chapter-specific multipliers, a non-affine or stateful cipher, altered plaintext spelling, or a non-English contraction. Its causal value is to prevent another global-slope word-reset affine search from being mistaken for an untested option and to provide a four-word, original-ink grounded check for a newly motivated inverse.

## Original-cipher test, independent known decipherment control

The [SFT](../sims/lp2_apostrophe_fourcrib_original_sft.cjs) reproduces all original four words, asserts every page/global offset, tests the known solved p56 first ciphertext **AE** to plaintext **A** using the documented prime-totient shift, then freezes the candidate contraction list. It covers **16 direct phase-zero prime/totient inverse models**: four clocks (continuous LP2 runes, original physical page restart, nine visual-chapter restart, word reset) × two key choices (primes and primes minus one) × two signs. There are **zero exact matches** to any candidate word at any apostrophe site. This is a small *source-constrained* negative; it cannot exclude other keys.

An exact dynamic-pointer inverse additionally tests the historically authentic solved-p56 *transparent plaintext F* policy, retaining every legal F-skip state through the full unchanged prior cipher runes. The uninterrupted global prime/totient clock becomes impossible at rune235, the nine-chapter reset clock becomes impossible before each apostrophe, and the page clock dies before p4, p35 and p41. At p21, the page clock leaves one legal pointer with **no candidate 2+1 match**. A key or transform in a different register remains viable.

The original-input test **passed on GitHub Actions Windows Node22**, [workflow run 43687210569](https://github.com/FlareZ123/liber-primus/actions/runs/43687210569), including source assertions and all key checks.

## Causal decision

The new contribution is **four original-source-selected morphology anchors** for assessing a genuinely independent proposed cipher/key. An author-selected key can now be tested on the original full words and neighboring printed context without inventing cribs after seeing output. A successful route must yield coherent surrounding plaintext and reconstruct the exact ciphertext. This correction does not license arbitrary key-phase searches or claim the four contractions are already decrypted.
