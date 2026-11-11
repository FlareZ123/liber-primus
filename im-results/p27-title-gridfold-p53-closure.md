# P27 title fold selects the 32x8 table; table fold closes on p53 word 26

**Evidence class:** source-constrained navigation hypothesis with exact original-corpus reproduction and a conditional shuffled-table diagnostic. **No unknown LP2 plaintext, complete key, cipher mechanism, or destination is claimed.**

## Upstream selector

The source-visible route already recorded in `im-results/p55-fold-fragment18-p27-title.md` uses the literal **FOLD** clue on physical p55. Its five-position mismatch mask is `10010₂ = 18`, and one-based thirteen-dot fragment 18 is exactly the 19-rune red title at p27 local 0–18.

This note asks what the same literal operation does to that selected title, without choosing a cipher family.

The canonical title indices are:

`[19,13,26,20,15,3,24,25,8,20,18,12,10,19,20,20,15,5,13]`

Pair the nine positions equidistant from the title centre. Mark a pair with 1 exactly when the two GP indices are equal. There is one equality, at the fourth pair:

`000100000₂`

Read in printed left-to-right order this is **32**; read in the reverse direction it is **8**. Those are exactly the physical dimensions of the printed base-60 byte table: **32 rows × 8 columns**.

This joint 32/8 result is unique among all odd-length original red spans in the current ink annotation. P27 is also the only 19-rune red span. This is a source selector, not an assertion that the binary convention was explicitly stated by Cicada.

## Fold the selected 32x8 table

Use the dimensions literally and fold the 32 table rows top-to-bottom, pairing row 1 with 32, row 2 with 31, ..., row 16 with 17 while preserving columns. This makes **128 paired cells**.

Across those 128 comparisons there is exactly **one byte equality**:

- one-based rows **16 and 17**
- one-based column **3**
- folded row-major cell **123**
- printed token **`1Q`**
- byte value **86**

The other simple geometric folds are less specific: the left/right fold has no equal byte pairs, and the 180° pairing has none.

The 128-cell folded size independently matches physical p53's exact ink boundary: **128 black runes followed by 51 red runes**.

## Fixed p53 alignment

Align the 128 folded cells row-major with p53's 128 black runes, with no phase or offset.

The unique equal table cell is folded index 122 zero-based, so it lands on p53 local rune 122. That position is exactly the final rune of printed **word 26**, whose GP indices are:

`[12,1,17]`

and whose GP-prime sum is:

`41 + 3 + 61 = 105`

The matched grid token closes on that word in several source-native ways:

1. The low base-60 digit of `1Q` is **Q = 26**, exactly the selected p53 word ordinal.
2. The grid match is at one-based **column 3**; p53 word 26 has length **3**, so that column selects its final rune.
3. That selected rune is GP index **17** (B), exactly the lower matched grid row number **17**.
4. The upper/lower row difference is **1**, exactly the high base-60 digit of `1Q`.
5. The selected word's GP-prime sum is **105**, and **105 mod 29 = 18**, returning to the upstream p55 fold selector.
6. Independently, **86 + 19 = 105**: matched byte plus the selected p27 title length equals the selected p53 word's GP-prime sum.

This is a closed, finite navigation relation across the p55 fold, the p27 red title, the physical 32×8 table, and p53's black/red boundary. It identifies a single p53 word and a single rune without language scoring or a fitted cipher phase.

## P27/p55 bookend cross-link

The unique duplicated adjacent two-word pair in the LP2 ciphertext is `DJU-BEI`, at p27 local 28–33 and again at p55 local 70–75.

Those starts differ by **42**, and the matched grid byte satisfies **86 + 42 = 128**, the exact p53 black-prefix length. This arithmetic is retained only as a secondary cross-link because the offset convention is less direct than the word/letter closure above.

Two local p53 boundary facts also overlap that bookend: word 19 begins with GP `J,U`, and selected word 26 ends with `U,B`. A forced seven-word continuation did not recover the remaining bookend material, so no recursive seven-step claim is made.

## Conditional shuffled-table diagnostic

To measure how selective the p53 closure is under a narrow null, preserve the original 256-byte multiset, uniformly Fisher-Yates shuffle the table cells, retain the same 32×8 shape and vertical fold, and keep the p53 words fixed.

For **200,000** deterministic shuffles (xorshift32 seed `0x45f01829`):

- **60,859** shuffles had exactly one vertical-fold byte equality.
- **34** also had the matched cell at a p53 word end, with matched byte modulo 60 equal to that word ordinal and the word's GP-prime sum congruent to 18 mod 29.
- **20** additionally satisfied the coordinate closure: column equals word length, selected rune index equals the lower row number, and byte high digit equals the row difference.

The add-one frequencies are approximately **1.75×10⁻⁴** for the base closure and **1.05×10⁻⁴** for the coordinate closure.

These are **conditional diagnostics, not discovery-wide p-values**. The operation chain was discovered from the available source material, so this test does not quantify the probability that the entire route arose by chance.

## Cryptanalytic consequence and current limit

The route materially narrows the source state to **p53 word 26, third rune B / GP index 17**. It does not yet say whether B is plaintext, key material, a state label, or another address.

Simple direct additive use of the 128 folded byte combinations against the p53 black prefix did not produce readable plaintext, so that family is not being expanded. The next productive test must derive a reversible operation or next address from the selected `1Q → word26 → letter3 → B(17)` closure itself, rather than launching a generic key sweep.

**Reproducer:** `sims/p27_title_gridfold_p53_closure_sft.cjs`.
