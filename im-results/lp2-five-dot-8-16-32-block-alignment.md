# Five-dot markers and the 8/16/32 LP2 block alignment

**Status: structural hypothesis only. No unknown plaintext or key recovered.**

## Finding

The three-page five-dot artwork on LP2 pages 7, 23 and 56, including its mirrored variants, is already established in [the three-page artwork and transfer report](lp2-five-dot-three-page-art-and-phi-transfer.md). This report does **not** claim that artwork or its geometric congruence as a new discovery.

The additional observation is a page-layout alignment:

- The 56 unsolved pages, numbered 0–55, divide naturally into **8 + 16 + 32** pages: 0–7, 8–23 and 24–55.
- The five-dot markers occur on p7 and p23, the final pages of the first two blocks. The third marker is on p56, the first known continuation page after the 56-page unsolved sequence.
- The numerical table printed across LP2 pp49–51 is a **32 × 8** matrix of 256 base-60 tokens. Splitting its 32 rows into two 16-row halves and joining them side-by-side yields a 16 × 16 matrix. Thus its native dimensions align with the three block sizes: 8 columns, 16 folded rows, 32 native rows.

A human solver could plausibly notice the three repeated five-dot markers, the 8/16/32 page partition, and the 32×8 table, then test whether the table supplies a three-phase key schedule. That is a concrete solve-path hypothesis, not proof that the author intended it.

## Doublet count alignment

Using the canonical `lp2-corpus.json` indices, count equal adjacent rune indices **within each page**, resetting at page boundaries and ignoring word boundaries. The 86 events partition as follows:

| LP2 pages | Pages | Runes | Same-page adjacent equalities |
|---|---:|---:|---:|
| 0–7 | 8 | 1,874 | 10 |
| 8–23 | 16 | 3,845 | 20 |
| 24–55 | 32 | 7,237 | 56 |
| **Total** | **56** | **12,956** | **86** |

The block counts sum to 86, matching both the established whole-corpus count and (7+23+56=86). The last block's 56 equalities also match the continuation page number. These are exact descriptive relationships, but they are not independent evidence of a cipher: the equality rates are 10/1,866, 20/3,829 and 56/7,206 respectively, and the final block is somewhat higher. The corpus statistic counts page-local adjacencies, not only within-word pairs. No significance claim is made from the numerical coincidences.

## Bounded table-key test

The most direct interpretation of the dimensional alignment is to use the table as a page-specific additive GP29 key:

1. **8-page block (p0–7):** each of the table's eight columns supplies a 32-symbol repeating key for one page.
2. **16-page block (p8–23):** fold the 32×8 matrix into 16×16 and use each folded row as a 16-symbol repeating key for one page. The screen enumerates elementary row/column reflections, half order, folded-row direction and both additive signs.
3. **32-page block (p24–55):** each native table row supplies an 8-symbol repeating key for one page.

Keys reset at each page. Table values are read from the repository's canonical base-60 tokens (the resulting values range from 0 to 255), reduced modulo 29, and applied as (P_i=C_i\pm K_{i\bmod m}\pmod{29}). The source dimensions select the page/key lengths; the small reflection family handles the orientation ambiguity visible in the three markers.

The best candidate scores remain at the raw-ciphertext noise level and their output samples are not readable English. In the repository's Dukotah quadgram screen, the raw/best mean log scores are:

| Block | Raw | Best direct additive candidate |
|---|---:|---:|
| p0–7 | −15.744 | −15.774 |
| p8–23 | −15.836 | −15.729 |
| p24–55 | −15.757 | −15.865 |

The small middle-block score increase is not a plaintext signal; its sample remains incoherent. The quadgram file is a rough language screen, not a proof system. The exact candidate configurations and output samples are reproduced by [the SFT script](../sims/lp2_three_block_table_key_gate.cjs).

## Decision

The 8/16/32 alignment is worth preserving as a source-visible structural hypothesis, but the straightforward table-as-additive-page-key interpretation fails. The 86 doublet partition does not supply a key or operation. This test does not exclude a nonlinear table consumer, a transposition, an external key, or another operation independently selected by an original clue. Do **not** continue broad p50 transformations merely because the dimensions fit. The next useful step is to identify a first-party instruction that specifies a reversible consumer for the 32×8 table and the three page blocks; absent that, retire this alignment as non-cryptanalytic structure.
