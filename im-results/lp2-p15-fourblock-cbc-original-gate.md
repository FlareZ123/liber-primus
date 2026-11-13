# Source-fixed p15 4-rune CBC inverse on the immediately following chapter

**Agent4, 13 November 2026. Classification:** a previously untested, fully specified source-visible block-chaining *candidate*; original-input result negative for native GP English under eight exact arrangements. **Zero unknown LP2 plaintext or new key recovered.**

The original physical p15 prints an invertible four-by-four matrix over the 29-symbol GP alphabet. Plain four-block Hill inversions have already failed, but a standard four-symbol **cipher-block-chaining** (CBC) construction can conceal repeated plaintext blocks that a stationary Hill map would expose. It has a simple human-oriented operation and needs no new high-entropy secret key if the printed square is the entire key. A concrete source-constrained test is the 1,744 original runes on physical **pp16–22, immediately after p15**, which happen to form 436 full four-rune blocks. This adjacency and exact divisibility motivate one aligned, continuous trial; no arbitrary phase offsets, word-fitting or inferred key schedule enter the test. The original gives no explicit CBC command, so this is a hypothesis with a clear falsification test.

## Lossless original operation

Reduce p15's published matrix modulo 29. Its authentic inverse is documented in the existing direct Hill SFT. With a four-rune block C_i and previous actual ciphertext block C_(i−1), choose each of the four standard matrix directions D = M, M⁻¹, Mᵀ, (M⁻¹)ᵀ. With the initial previous block [0,0,0,0], compare the two naturally distinct feedback orders:

- **Output-feedback CBC:** P_i = D C_i − C_(i−1) modulo 29; encryption is C_i = D⁻¹ (P_i + C_(i−1)).
- **Input-feedback CBC:** P_i = D(C_i − C_(i−1)) modulo 29; encryption is C_i = D⁻¹ P_i + C_(i−1).

These are eight complete specified, non-fitted inverses on the same original 1,744-symbol source. Each model restores every original ciphertext rune on re-encoding and independently recovers **1,744/1,744** runes from a source-native GP English plant (eight of eight plants). The source-native encoder recognizes the genuine LP1 spelling conventions in which **ING** and **IO** can each be single runes.

## Result and decision

| Measure | Exact result |
| --- | ---: |
| Untouched pp16–22 rune length | 1,744 |
| Original ciphertext IoC | 0.03450960 |
| Eight four-block CBC decipherments, IoC range | **0.03423985–0.03467606** |
| Minimum among 88 half-overlapping 1,744-rune native GP-English windows | **0.05580448** |
| Original 1,744-rune recovery by same-key re-encoding | 8/8 exact |
| Native GP English positive plants | 8/8 exact |

The 88 control windows are drawn at 872-rune stride from pinned Shakespeare, Gibran and Emerson source texts. The original outputs retain approximately uniform GP29 frequency. The first original p16 block under D=M decrypts to GP labels **O F TH EO** (indices 3,0,2,12), under both feedback orders because the initial vector is zero. Naively concatenating multi-letter GP labels makes this look like “OFTHEO...”, an apparent English prefix. The fourth rune is **EO**, not the **E** rune (index18), so even that first four-symbol phrase is not “OF THE”. The succeeding original blocks are nonlinguistic; the actual first printed ciphertext word has thirteen runes. This is a concrete example of why native-GP token boundaries matter, and supplies no recovered plaintext.

**Decision:** reject direct p15-square four-block CBC over the immediately following complete pp16–22 original cipher register for these eight frozen definitions, including both mathematically natural placements of feedback. It specifically addresses the chain-dependent loophole in earlier fixed-block equality tests. Other initial IVs, different chaining architectures, secret running matrices, source-selected key changes and alternate plaintext registers remain mathematically possible, but the manuscript does not currently select them. Do not expand this into an unconstrained IV/phase sweep on the strength of the misleading GP transliteration prefix. Further progress requires an independent source instruction or key that makes a different inverse predictive.

**Executable CJS SFT:** [sims/lp2_p15_fourblock_cbc_original_sft.cjs](../sims/lp2_p15_fourblock_cbc_original_sft.cjs). It checks original p15 matrix inverse, exact original ciphertext, eight lossless native-English plants, eight original reencryption identities, and whole-register comparisons to three pinned native English controls. This local API-side calculation used unchanged data from [canonical p0–57 corpus](../resources/liber-primus/lp2-corpus.json); the SFT is committed but has not separately been run in GitHub Actions.
