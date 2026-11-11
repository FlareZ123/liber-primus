# P27 title header-fold: 256 / prime-43 reverse-table bridge

**Status (11 November 2026): source-rare navigation structure; direct reverse-table key uses bounded negative. No unknown LP2 plaintext or authentic cipher key recovered.**

## Upstream source route

This result continues the independently reproduced signed-2016 / p55 navigation route rather than selecting p27 by output language:

1. the signed 2016 base-58 word map sends each repeated **the** to the unique complete LP2 ciphertext word **FOLD**;
2. the cumulative signed route ends at physical **p55**;
3. folding the p55 sharp-tree image against itself yields mismatch bits 10010₂ = 18;
4. the 31 printed 13-dot marks delimit **32** physical fragments when coincident marks are retained, and one-based fragment **18** is exactly the red p27 title;
5. the two identical p27/p55 DJU-BEI word pairs start 1,432 canonical words apart, while the selected p27 section contains 1,433 runes, giving **1432 ≡ −1 (mod 1433)**.

The present gate asks what the literal **FOLD** instruction does to the selected title itself.

## Self-indexing title header

Fragment 18 is the 19-rune title MPYLSOAAEHLEEOIMLLSCP.

Its first rune is M, GP index **19**, exactly the title length. Removing that self-authenticating length header leaves **18 payload runes**, exactly the fragment number.

Across all 32 13-dot fragments, fragment 18 is the only nonempty fragment satisfying any of these three conditions:

- first rune index equals fragment length;
- remaining length equals fragment number;
- header-stripped fold equality mask equals 256.

## Literal header-aware fold

Fold the 18 payload runes outer-to-inner and write 1 for an equal pair, 0 for an unequal pair. The nine bits are exactly **100000000₂ = 256**.

The **only equal pair is P/P**. In Gematria Primus, P is index 13 and has prime weight **43**.

Thus one source-selected fold supplies two otherwise missing cardinalities at once:

- **256**, exactly the number of cells in the original 32×8 numerical table;
- **43**, exactly the size of the table interval, the authenticated 2016 signed-message word count, and the literal p55 shed-circumference interior channel.

This compound signature is not common local texture. Scanning every possible contiguous 19-rune window in the complete **13,136-rune LP2 source stream** finds exactly one match to the full pattern M=19, outer payload P/P, and no other folded equality: **p27 local offset 0**, the selected title.

This is a source rarity statement, not a discovery-adjusted p-value.

## The −1 direction fixes the table orientation

The signed word **lies** has GP-prime sum 224, giving the already frozen base-58 address **physical p50 word index 3**, global table cell **83**, token 3D, byte **193**.

The independently derived p27/p55 bookend relation supplies −1. Applying that literal direction to the selected cell gives **83 → 82**, where cells 82–83 are **[201, 193]**.

The only reversed occurrence of that adjacent ordered pair anywhere else in the 256-cell table is cells **127–128 = [193, 201]**. The cells strictly between the two 193 boundaries are exactly **84–126**, i.e. **43 cells**. The −1 orientation selects their reverse traversal **126→84**.

This upgrades the prior 43-byte bracket from a count coincidence in two respects: the selected title independently supplies 43 through the matched rune's GP prime, and the p27/p55 relation supplies a source-derived reverse direction.

## Direct reverse-table uses

The new orientation was frozen before testing and applied only to direct operation families already used elsewhere in the repository.

### 43 signed-addressed LP2 words

Use reverse table cells 126→84 as one GP29 additive shift per signed-message-addressed LP2 word. Under the existing Shakespeare-trained word-internal GP bigram/trigram model, preserve the same 43 bytes and shuffle only their order:

| Model | Original mean log score | Same-source shuffle upper tail |
| --- | ---: | ---: |
| subtract reverse byte mod29 | **−4.799898** | **0.81409** |
| add reverse byte mod29 | **−4.633761** | **0.21639** |

Neither direction distinguishes the original reverse order.

### P55 shed-circumference 43 interiors

Apply the same reverse bytes positionwise to the 43 p55 interior runes left by deleting the first and last rune of each printed word. With the surviving source word boundaries preserved and **4,000** key-order shuffles per sign:

| Model | Original mean log score | Same-source shuffle upper tail |
| --- | ---: | ---: |
| subtract reverse byte mod29 | **−4.503814** | **0.22069** |
| add reverse byte mod29 | **−4.786443** | **0.79055** |

The outputs remain unreadable.

### Other finite direct checks

- Reverse table bytes reduced modulo43 have only **27 distinct residues**, so they do not directly define a 43-permutation.
- XOR and modular ± byte readouts using signed-word GP-prime sums, selected-word GP-prime sums, and selected-word ordinal sums remain unreadable. The best printable-ASCII count is **22/43**.

## Decision

The header-aware p27 title fold is a materially stronger **navigation clue** than the earlier raw count alignment:

**FOLD → p55 → 18 → self-indexing p27 title → (256, 43, −1) → reverse 43-cell table channel.**

The new source constraints do not make the reverse 43 bytes a direct additive/XOR key for either the signed-addressed LP2 words or p55 interiors. Do not expand arbitrary byte KDFs or permutations from this result.

A useful successor must explain, from another source-visible clue, what reversible operation consumes the now much better selected triple of objects: the **43 reverse-ordered table bytes**, **43 p55 interior runes**, and **43 authenticated signed-message words**.

**Reproduce:** node sims/p27_title_headerfold_256_43_reverse_sft.cjs
