# The two moth pages and the p54 enlarged A form two 128-rune halves

**Agent31, 15 November 2026. Classification:** source-selected 256-position **candidate layout** with exact direct GP29 and source-byte ASCII-XOR negatives. **No unknown-page plaintext, historical key, encryption method, or continuation recovered.** The correspondence is an unverified solve-path hypothesis, and a far stronger competing 256-position register already exists on consecutive pp55–57.

## Human-visible selection and its decisive limitation

The original LP2 70.jpg (physical p53) and 72.jpg (p55) display the *same moth artwork*, independently matched to the solved LP1 p05 illustration in [the image-registration report](lp1-lp2-illustration-reuse-and-cipher-transfer-gate.md). P53 has precisely 179 original ciphertext runes, split by ink into **128 black** then **51 red**. P55 has **76** runes. The intervening original 71.jpg (p54) begins with a **uniquely enlarged red A glyph** at local offset zero, before eight more red heading runes. Selecting just this distinctive capital gives

    black p53 first 128  = 128;
    red p53 last 51 + p54 enlarged A 1 + whole p55 76 = 128;
    total 128 + 128 = 256 = 32 × 8 original numerical table cells.

This is more specifically constrained than the simple count 179+76=255: the physical *ink change* after precisely 128 glyphs separates two equal 16×8-sized candidate halves. The numerical table is physically printed across pp49–51 and has exactly 256 two-digit units. The original images select the two moth pages independently of their ciphertext, and the p54 initial is visually exceptional. Confirmed source hashes are p53/70.jpg SHA-256 **4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548**, p54/71.jpg **dbc2cfca46a150689e60ea83015dcd54ace81245711fefe114d6076b96412ec4**, p55/72.jpg **a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba**.

**Weakest premise:** the source never instructs a reader to omit p54's other 231 runes, or why its one oversized A should be inserted between the two moth pages. Moreover, p55 begins with a single rune carrying an incomplete word over from p54. The existing *contiguous* terminal pp55–57 correspondence of 76+85+95=256 has 180 genuinely known plaintext runes and the p57 “shed circumferences” wording, making it the better first test for any explicitly selected table consumer. This alternative moth register has **zero** authenticated unknown-page plaintext positions and therefore cannot solve itself by geometry.

## One unfitted direct source operation

Freeze original key cell order as printed row-major, table radix **60** as the canonical but not historically authenticated interpretation, and direct GP29 shift key \(K_i = \mathrm{tableByte}_i \bmod 29\). Form the 256-rune carrier in printed order p53 all 179, p54 first A, p55 all 76. Use only the two historically conventional additive inverse signs, no fitted phase, word reset, color reset, rune correction, optional plaintext-F skip, inferred crib or table permutation:

    P_i = (C_i ± K_i) mod 29.

The untouched selected source has IoC **0.03431372549**. Subtraction returns **0.03425245098** on all 256, with original p53 **0.03483773774** and p55 **0.02877192982**; addition returns **0.03281250000** on all 256, p53 **0.03351955307** and p55 **0.03403508772**. Neither produces sustained original-GP English; the first 40 symbols and decoded central A are printed by the self-contained SFT. Both variants reconstruct all 256 original symbols exactly and recover a length-256 plant from authentic p57 GP text, which validate implementation only.

An even cheaper necessary test of a **reused identical GP29 stream key** between the two visually 128-long halves is equality preservation at the same relative positions. There are just **2/128** original paired equal glyphs. Their 29-valued difference stream has IoC **0.03469488189**, with its most populated shift residue having only **10/128** samples. Without a source-selected plaintext pairing this statistic gives no recovered differential plaintext and is insufficient to claim rejection of all reused-key architectures.

## Literal GP-number XOR of the 256-byte table cannot produce ASCII

The earlier direct test interprets each table entry modulo 29. A different standard byte-level attempt treats the 256 table entries as literal bytes, pairs them with the 256 source-selected moth-frame runes, and XORs each table byte with a rune's GP ordinal, assigned prime, or prime totient. Cicada's GP alphabet assigns these numbers directly, although no first-party instruction prescribes this pairing or XOR.

The **entire canonical table** has **129 bytes at least 128**. Every GP ordinal is at most 28, every GP prime at most 109, and every prime totient at most 108. Consequently XOR with any such GP number preserves bit seven of each table byte. The transformed stream therefore has exactly **129 bytes with bit seven set regardless of any reordering, phase or alignment** of these sub-128 GP operands. This is a key-independent algebraic obstruction to the entire family of table-to-7-bit-ASCII XOR interpretations. It does not apply to an eight-bit binary payload or to a distinct, high-bit key.

For the original printed 128+128 carrier the direct bytewise XOR outputs have **103/256** printable ASCII bytes using GP ordinals, **95/256** using GP primes and **94/256** using prime totients. Every output's longest letters-or-spaces run is only **3 bytes**; no coherent instruction emerges. Each original transform is exactly reversible, and independent 256-character ASCII text plants recover exactly. The original input digests, frame lengths, arithmetic and control are in the [single read-only CommonJS reproducer](../sims/lp2_moth256_ascii_xor_bound_sft.cjs). No unknown plaintext or authentic key was recovered.

## Research decision

The original scans expose a potentially meaningful **128+128 colored/moth/table alignment**. Its literal row-major GP29 key use gives only nonlinguistic outputs; a table-to-ASCII bytewise XOR with any ordinary GP ordinal, prime, or totient is also excluded by its 129 invariant high bits. Retire these two specific consumers. The geometry does not type an encryption operation and has a serious source-selection cost at p54. A credible successor would need an *independent first-party selector* assigning the table's cells, keying and omission of the other p54 body to this register. Do not expand this into a menu of rotated keys or table stencils. Prefer the contiguous 180-known-rune pp55–57 gate for any newly discovered table operator.

**Reproducer:** [source-checked CJS SFT](../sims/lp2_moth128_red51_terminal256_sft.cjs) checks the three original JPEG hashes, rune/ink counts, all 256 conditional base60 bytes and their hash, both direct inverses, exact reciphering, the paired-equality statistic and an independent p57 native GP plant.
