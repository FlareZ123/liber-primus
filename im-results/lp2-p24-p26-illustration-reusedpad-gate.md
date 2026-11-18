# P24/p26 identical insect art: source-selected additive and XOR key-sharing gates

**Agent44, 18 November 2026. Classification:** a new bounded original-cipher necessary-condition exclusion for a clue-motivated *shared positionwise additive pad* or shared five-bit GP-ordinal XOR stream on two original pages. No unknown Liber Primus plaintext, genuine key or historical decryption method was recovered.

## Original artistic selector and competing explanation

The source-original LP2 physical pages **p24** and **p26** (combined original JPEGs `41.jpg` and `43.jpg`) print *literal 24-bit RGB-identical* bilateral wing/insect decorative strokes across two independent margin rectangles, each 2400×3600 image in the 2014-authenticated 75-JPEG corpus. P25 uses closely similar drawing displaced about one source pixel, but p24 and p26 match exactly. [Full-image original art census](lp2-original-exact-compositor-layer-atlas.md) and [reproducer](../sims/lp2_exact_illustration_atlas_sft.py) establish this without inferring keys from plaintext.

A simple puzzle-maker hypothesis is that *repeated illustrations mark two passages encrypted with one shared key stream*, readable as same-position GP29 additive encryption. If original page rune \(i\) enciphers \(C_{24,i}=P_{24,i}+K_i\bmod29\) and \(C_{26,i}=P_{26,i}+K_i\bmod29\), **both unknown pad values cancel exactly**:
\[
(C_{24,i}-C_{26,i})\bmod29=(P_{24,i}-P_{26,i})\bmod29.
\]
The alternative is that the same art is a static layout template with no cryptographic significance. No signed Cicada instruction identifies p24/p26 as a key-reuse pair, or says align at their first rune. This is an explicitly tentative, cheapest possible common-pad test. It is *different from* the already tested p27/p55 six-rune echo, which selects a distinct source register.

## Actual untouched original text, complete word boundaries

The physically printed p24 and p26 contain **270** and **265** GP29 runes, in respectively **64** and **59** complete page-local printed word slots. There are 20 overlaps of at least four positions between an original p24 word and an original p26 word at the same rune offset. The independent project-pinned 29,157-entry TextBlob English lexicon is converted into the canonical Gematria Primus spelling, including the single-rune `ING`/`IO` convention. The test grants *every* dictionary word of each source-printed GP29 rune length independently, with no shared language model, no fitted pad, and no requirement that two pages say the same sentence.

For one overlapping word pair of source lengths \(L_A,L_B\), let \([u,v)\) be the common absolute rune interval. Compute the exact original \(D_i=(C_{24,i}-C_{26,i})\bmod29\) there. Build all native GP29 substrings of length \(v-u\) from every candidate plaintext word of length \(L_B\), at the appropriate within-word offset. For every native word of length \(L_A\) subtract \(D\) on that same overlap and hash-join against the B-side substrings. **Any zero-result overlap independently contradicts an unchanged-word, aligned common pad for both pages** in the stipulated finite English register, regardless of all 265 unknown key values and plaintext outside that overlap.

Among **20** overlaps of four or more authentic runes, **seven have zero compatible native-English word pairs**:

| Original absolute rune indices on both pages, zero-based half-open | Overlap runes | Full p24/p26 printed word lengths | Matching dictionary word pairs |
|---|---:|---|---:|
| 27–32 | 6 | 7 / 8 | **0** |
| 109–114 | 6 | 7 / 7 | **0** |
| 162–167 | 6 | 8 / 6 | **0** |
| 211–216 | 6 | 9 / 6 | **0** |
| 86–90 | 5 | 5 / 9 | **0** |
| 245–249 | 5 | 10 / 8 | **0** |
| 82–85 | 4 | 10 / 9 | **0** |

The printed index columns in the table are **inclusive** ranges for humans, whereas the implementation emits the unambiguous matching half-open `lo`/`hi` values `[27,33), [109,115), [162,168), [211,217), [86,91), [245,250), [82,86)`. Another thirteen tested overlaps contain at least one permitted dictionary pair, as expected for short comparisons. No chosen output word or artificial exception is needed for the negative.

## Independently historical XOR operation on the same exact source-page pair

Solved Cicada 2013 stages demonstrably used **bytewise XOR**. Treating each original GP rune as its canonical five-bit GP29 ordinal 0–28, grant p24 and p26 an arbitrary, independently secret but *shared at each absolute rune position* key value \`K[i]\` from 0–31. The proposed encoder is \`C24[i] = P24[i] XOR K[i]\` and \`C26[i] = P26[i] XOR K[i]\`; a valid output must remain one of the 29 printed GP runes. The XOR key cancels algebraically: \`C24[i] XOR C26[i] = P24[i] XOR P26[i]\`, for every possible key value. This is a second actual historical operation, under the **one fixed source-native GP-ordinal encoding**. Other guessed rune-to-byte codes are not tested.

Run the same exact word-length and overlap-join lexicon test on the unchanged original pair, replacing modular subtraction with 5-bit XOR. **Eight of twenty** authentic overlaps at length at least four have **zero** source-native candidate pairs:

- Six-rune intervals: \`[27,33), [109,115), [162,168), [211,217)\`.
- Five-rune intervals: \`[86,91), [203,208), [245,250)\`.
- Four-rune interval: \`[72,76)\`.

The fixed entire-word GP lexicon permits every entry of the matching printed original word lengths, with no guessed pad. A **distinct positive control** uses two actual 270/265-rune lexicon word streams following exactly the original 64/59 word length profiles, constructs a nonconstant shared 5-bit XOR pad that keeps both emitted streams in the 0–28 GP alphabet, verifies all original source-shaped symbols invert exactly, and obtains **20/20** valid matched-overlap witnesses. The original XOR contradictions thus survive every shared key value, within the declared finite lexicon and encoding. No actual secret pad or plaintext is recovered.

## Independent image-visible alignment: twelve equal physical print lines

Exact repeated image templates allow a second pre-plaintext alignment: **physical line ordinal plus rune ordinal within that same line**. The p24 and p26 images each contain **12 printed source lines**, in the same decorative layout. This freezes a completely secret shared row-and-column pad \(K_{r,j}\) with **no** equality constraint across distinct rows or columns. It compares actual line-number/rune-number cells, rather than silently tuning a global rune offset or subpixel horizontal position. The p24 original line lengths are \`[22,24,21,24,23,21,22,23,23,22,22,23]\`, p26 \`[20,22,23,22,24,23,24,21,19,24,23,20]\`. These twelve aligned lines give **255** shared rune-slot positions.

Keeping the genuine printed word intervals intact even where they cross line wraps, **17** overlaps contain four or more runes. The same full 29,157-word lexicon hash-join now reports **5/17 additive key contradictions** and **7/17 ordinal-XOR key contradictions**, independent of every secret \(K_{r,j}\). Exact zero-compatible intervals (source rows and positions zero-based, half-open):

- **Additive:** row4[4,10), row7[4,10), row2[13,18), row9[3,8), row11[0,5).
- **XOR:** row4[4,10), row7[4,10), row2[13,18), row4[17,22), row9[3,8), row11[0,5), row11[15,20).

A distinct complete native positive uses the original exact 64/59 word-size profiles, a nonconstant GP29 additive pad indexed by line and column, and a separate nonconstant five-bit XOR pad at identical line and column positions that guarantees both original-output alphabets remain 0–28. The inverse recovers all original source-shaped plaintext runes exactly, and the same checker finds **17/17** valid original-word-length witnesses for each positive. The two six-rune original contradictions survive both direct operations even after this line-wise rather than global alignment.

**Interpretation:** both naturally visible key clocks, continuous physical-page rune index and row-plus-within-row rune index, fail for direct additive and historical XOR key reuse under the finite native-English dictionary. Source artwork alone supplies no grounds for a new secret offset, altered word boundaries, other output alphabet or indirect operation; none of these is asserted excluded. No key or unknown plaintext is recovered.

## Executed calibration, scope and next decision

The [standalone read-only Node22 CommonJS SFT](../sims/lp2_p24_p26_insect_twopad_dictionary_sft.cjs) reconstructs the exact original physical-page rune and printed-word streams, checks both exact word inventories, tests all 20 source overlaps against all matching English lexicon words, and locks the seven full-zero source certificates. Its **reversible positive** independently selects original-word-length-matched genuine dictionary words for both pages, encrypts all 270/265 symbols with exactly the *same nonconstant* \(K_i=(7i^2+11i+3)\bmod29\), recovers both plaintexts perfectly and asserts **20/20** overlap pairs admit native word witnesses. This is a real constrained positive for the keyed shared-pad architecture. The source-original test was independently executed using the same source bytes via the repository app, before the SFT was published.

**Decision:** simply using exact duplicated p24/p26 artwork as a same-rune-position or same-line-rune-position reused additive or GP-ordinal XOR key, while preserving printed word boundaries and common GP-native English word spelling, does not yield a valid dual plaintext. This says *nothing* about reused nonlinear keys, an independently authored placement shift, word-boundary movement, non-English registers, or a cryptographic instruction hidden elsewhere. The artifact itself supplies no independent instruction selecting any such complication. Further tests of arbitrary shifts or language model hallucinatory dual outputs without an image-sourced alignment instruction have no justified causal path to genuine plaintext.

This is a **bounded negative for the simplest image-selected cipher construction**, not a new source of unknown-message recovery. The manuscript remains encrypted; direct mathematical inference cannot produce a key where the original source supplies no unique operation.
