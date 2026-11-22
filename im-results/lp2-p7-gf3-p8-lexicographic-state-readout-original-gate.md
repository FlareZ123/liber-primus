# Source-derived GF(3) state-address reading of LP2 p8: exact 243-rune inverse and no plaintext

**Agent20, 22 November 2026. Director #2204. Classification: bounded original-source negative for the single literal five-trit LFSR address transposition. No previously unknown plaintext, authenticated key or intended next-page instruction was recovered.**

## Source-constrained decoder

Original physical p7 ends in five printed red words whose actual GP29-index products are **[11,26,8,15,2]**. The earlier [source GF(3) result](lp2-p7-primitive-gf3-msequence-p8-original-table-gate.md) establishes that reduction modulo3 yields primitive five-tap coefficients **[2,2,2,0,2]**. The associated fifth-order state update runs through all 242 nonzero five-trit states from its p7-derived seed, while the adjoining p8 prints exactly **243 black runes after its 12 red heading runes**. There is no author-authenticated instruction to interpret these facts as a cipher.

Freeze the identical previously published **four-zero insertion**: the first cyclic run of four zero trits begins at output-trit offset **83**; splice the one missing zero after that run at offset **87**. The resulting 243 cyclic five-trit windows are a permutation of every integer 0–242 when read as ordinary lexicographic base-three addresses. The first five addresses are **236,223,184,67,203**.

Treat the unchanged 243 p8 black runes as a lexicographic table. Read its rune at those state addresses in source-selected **forward** order, then in the exact **reversed** order, with no additional key, Caesar layer, drop/duplication, alternative trit encoding, freely selected start or fit to text. The inverse places each resulting rune back at its original index. The p9 original first243 runes receive exactly the same operation as a *mechanical adjacent-page control*, with no claim that an independent source instruction chose p9 as a receiver.

## Original results

| Original source | Runes | Forward / reverse output GP29 IoC | Literal E before / after | Original reconstruction |
|---|---:|---:|---:|---|
| p8 black body, excluding its red12 title | 243 | **0.034044145155** / same | **7 / 7** | **243/243** in each direction |
| p9 first243 original runes | 243 | **0.033227901915** / same | **6 / 6** | **243/243** in each direction |
| Independently solved p57 native text (frequency control) | 95 | **0.062709966405** | source E density distinctly higher | no operation needed |

Both complete p8 outputs and p9 mechanical outputs remain GP29-ciphertext-like and contain no coherent continuous phrase or unambiguous key instruction. The [full, exact, 243-position index and transliteration readouts](lp2-p7-gf3-p8-ordering-original-transcript.txt) are preserved for direct independent examination, rather than selecting a favorable short substring.

The strongest exclusion is *key-independent* for this entire family: **any** original p8 symbol permutation, including these two 243-state orders, preserves its GP29 unigram histogram exactly. The seven E runes within 243 source glyphs are therefore invariant. The earlier solved p57 has 15 E in only 95 runes, and normal solved-Cicada GP prose is strongly nonuniform. An order-only transformation of this particular body cannot reveal ordinary source-native English with a normal E profile. This is conditional on the intended plaintext being GP-native text; it does not exclude non-English output, a ciphertext intermediary or a separate source-clued value-changing layer.

## Complete positive and reproducibility

The [single-file Windows 11 / Node22 CommonJS SFT](../sims/lp2_p7_gf3_p8_lexicographic_cycle_sft.cjs) reads the unchanged source corpus, reconstructs the p7 red-word products and exact GF3 register from the canonical p7 original glyphs, asserts the 242/243 state counts and the fixed source-seeded zero splice, and tests every source rune with a complete forward/inverse mapping. It constructs an independent **243-rune native GP positive** by repeating the actual solved-p57 95-rune source in the same original-size envelope. Each source-selected address order enciphers it into its 243 printed cell locations and blindly recovers **243/243** original native symbols. The plant tests the inverse and preserves real solved rune morphology; it is not proof the original page used such a transposition.

**Executed and passing:** [Windows Node22 GitHub Actions run 45008500754](https://github.com/FlareZ123/liber-primus/actions/runs/45008500754) checked all original and planted assertions.

The finite task is closed: the literal author-visible *state-address reading* and its one source-selected reverse were executed without modifying a single original rune. The previously rejected p8 LFSR **lookup and additive** consumers are separate from this direct permutation test. There is no source-motivated reason to search arbitrary state seeds, reverse rune labels, adjust printed boundaries or append an unconstrained cipher to rescue an output with identical E counts. A genuine follow-up requires an independent instruction that selects a **value-changing** receiver and predicts unknown original plaintext, not further reordering of these same243 glyphs.
